const supabase = require('../config/supabase');
const axios = require('axios');
const docusign = require('docusign-esign');
const fs = require('fs');

// Helper: Descargar PDF firmado de DocuSign y subirlo a Supabase
async function downloadAndSaveSignedPDF(envelopeId, contractId) {
  try {
    // 1. Autenticar con DocuSign
    const apiClient = new docusign.ApiClient();
    apiClient.setOAuthBasePath('account-d.docusign.com');

    let privateKeyForSdk;
    if (process.env.DOCUSIGN_PRIVATE_KEY) {
      const pem = process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n');
      privateKeyForSdk = Buffer.from(pem);
    } else if (process.env.DOCUSIGN_PRIVATE_KEY_PATH) {
      privateKeyForSdk = fs.readFileSync(process.env.DOCUSIGN_PRIVATE_KEY_PATH);
    } else {
      throw new Error('DocuSign private key not configured');
    }

    const jwt = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      process.env.DOCUSIGN_USER_ID,
      ['signature', 'impersonation'],
      privateKeyForSdk,
      3600
    );

    const accessToken = jwt.body.access_token;
    const userInfo = await apiClient.getUserInfo(accessToken);
    const account = userInfo.accounts.find(a => a.accountId === process.env.DOCUSIGN_ACCOUNT_ID) ||
                    userInfo.accounts.find(a => a.isDefault === 'true' || a.isDefault === true);

    if (!account) {
      throw new Error('No se pudo resolver la cuenta de DocuSign.');
    }

    apiClient.setBasePath(`${account.baseUri}/restapi`);
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    // 2. Descargar el documento firmado
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const pdfBytes = await envelopesApi.getDocument(account.accountId, envelopeId, 'combined');

    // 3. Subir a Supabase Storage
    const fileName = `${contractId}-${Date.now()}-signed.pdf`;
    const filePath = `contracts/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading signed PDF to Supabase:', uploadError);
      throw uploadError;
    }

    // 4. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in downloadAndSaveSignedPDF:', error);
    throw error;
  }
}

// Buscar inquilino por email
exports.findTenantByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido.' });
    }

    // Buscar perfil por email (case-insensitive)
    const { data: allProfiles, error: searchError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .ilike('email', email);

    if (searchError) {
      console.error('Supabase error:', searchError);
      return res.status(500).json({ error: searchError.message });
    }

    if (!allProfiles || allProfiles.length === 0) {
      return res.status(404).json({ error: 'Inquilino no encontrado.' });
    }

    const tenant = allProfiles[0];

    if (tenant.role !== 'inquilino') {
      return res.status(400).json({
        error: `El usuario no es un inquilino. Rol actual: ${tenant.role}`
      });
    }

    res.json(tenant);
  } catch (err) {
    console.error('Error en findTenantByEmail:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Crear contrato y propiedad (el propietario debe firmar y subir archivo adjunto)
exports.createContract = async (req, res) => {
  try {
    const landlord_id = req.user.id;
    const {
      tenant_id,
      property, // objeto con los datos de la propiedad
      rent_amount,
      rent_currency,
      deposit_amount,
      deposit_currency,
      payment_day,
      start_date,
      end_date,
      terms,
      document_url, // archivo adjunto
      generated_contract_url
    } = req.body;

    // 1. Crear la propiedad
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert([{
        ...property,
        landlord_id
      }])
      .select()
      .single();

    if (propertyError) return res.status(400).json({ error: propertyError.message });

    // 2. Crear el contrato usando el property_id generado (borrador, sin firma)
    const { data: contractData, error: contractError } = await supabase
      .from('contracts')
      .insert([{
        landlord_id,
        tenant_id,
        property_id: propertyData.id,
        rent_amount,
        rent_currency,
        deposit_amount,
        deposit_currency,
        payment_day,
        start_date,
        end_date,
        terms,
        document_url,
        generated_contract_url,
        landlord_signature: 'unsigned',
        tenant_signature: 'unsigned',
        status: 'draft'
      }])
      .select()
      .single();

    if (contractError) return res.status(400).json({ error: contractError.message });

    res.status(201).json({
      message: 'Contrato y propiedad creados correctamente.',
      contract: contractData,
      property: propertyData
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Ver detalles de un contrato (solo propietario)
exports.getContractDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este contrato.' });
    }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Editar contrato (solo si el inquilino no ha firmado)
exports.updateContract = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('landlord_id, tenant_signature')
      .eq('id', id)
      .single();

    if (fetchError || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este contrato.' });
    }
    if (contract.tenant_signature === 'signed') {
      return res.status(403).json({ error: 'No puedes editar el contrato, el inquilino ya firmó.' });
    }

    const { error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Contrato actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Borrar contrato (solo si el inquilino no ha firmado)
exports.deleteContract = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('landlord_id, tenant_signature')
      .eq('id', id)
      .single();

    if (fetchError || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para borrar este contrato.' });
    }
    if (contract.tenant_signature === 'signed') {
      return res.status(403).json({ error: 'No puedes borrar el contrato, el inquilino ya firmó.' });
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Contrato eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Obtener todos los contratos del inquilino autenticado
exports.getMyContracts = async (req, res) => {
  try {
    const tenant_id = req.user.id;
    // 1. Obtén todos los contratos del inquilino (excluye borradores)
    // Solo muestra contratos donde el propietario ya firmó
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (contractsError) return res.status(400).json({ error: contractsError.message });

    // 2. Obtén los datos de las propiedades asociadas
    const propertyIds = contracts.map(c => c.property_id).filter(Boolean);

    let properties = [];
    if (propertyIds.length > 0) {
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propsError) return res.status(400).json({ error: propsError.message });
      properties = props;
    }

    // 3. Obtén los datos de los propietarios
    const landlordIds = contracts.map(c => c.landlord_id).filter(Boolean);

    let landlords = [];
    if (landlordIds.length > 0) {
      const { data: landlordProfiles, error: landlordsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', landlordIds);

      if (landlordsError) return res.status(400).json({ error: landlordsError.message });
      landlords = landlordProfiles || [];
    }

    // 4. Une los datos (usa String para comparar UUIDs)
    const result = contracts.map(contract => ({
      ...contract,
      property: properties.find(p => String(p.id) === String(contract.property_id)) || null,
      landlord: landlords.find(l => String(l.id) === String(contract.landlord_id)) || null
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.getTenantContractDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Busca el contrato
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este contrato.' });
    }

    // 2. Busca la propiedad asociada
    let property = null;
    if (contract.property_id) {
      const { data: prop, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', contract.property_id)
        .single();
      if (!propError && prop) property = prop;
    }

    // 3. Busca información del propietario
    let landlord = null;
    if (contract.landlord_id) {
      const { data: landlordProfile, error: landlordError } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', contract.landlord_id)
        .single();
      if (!landlordError && landlordProfile) landlord = landlordProfile;
    }

    // 4. Devuelve el contrato con la propiedad y el propietario
    res.json({ ...contract, property, landlord });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.signContractAsTenant = async (req, res) => {
  const { id } = req.params;

  try {
    // 1) Buscar contrato y validar permisos/estado
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.tenant_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para firmar este contrato.' });
    }
    if (contract.tenant_signature === 'signed') {
      return res.status(400).json({ error: 'Ya has firmado este contrato.' });
    }
    if (contract.landlord_signature !== 'signed') {
      return res.status(400).json({ error: 'El propietario debe firmar primero.' });
    }

    // 2) Perfil del inquilino
    const { data: tenantProfile, error: tenantError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', contract.tenant_id)
      .single();

    if (tenantError || !tenantProfile) {
      return res.status(404).json({ error: 'Perfil de inquilino no encontrado.' });
    }

    // 3) Cargar el PDF real (binario)
    let pdfBuffer;
    if (contract.document_url && contract.document_url.startsWith('http')) {
      const response = await axios.get(contract.document_url, { responseType: 'arraybuffer' });
      pdfBuffer = Buffer.from(response.data);
    } else if (contract.document_url) {
      pdfBuffer = fs.readFileSync(contract.document_url);
    } else {
      return res.status(400).json({ error: 'No hay PDF adjunto en el contrato.' });
    }

    // Verificación rápida de PDF
    if (pdfBuffer.slice(0, 4).toString() !== '%PDF') {
      return res.status(400).json({ error: 'El archivo adjunto no parece ser un PDF válido.' });
    }

    // 4) Autenticación JWT correctamente aplicada
    const apiClient = new docusign.ApiClient();
    apiClient.setOAuthBasePath('account-d.docusign.com');

    // Usar la clave PEM directa desde DOCUSIGN_PRIVATE_KEY o desde archivo
    let privateKeyForSdk;
    if (process.env.DOCUSIGN_PRIVATE_KEY) {
      const pem = process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n');
      privateKeyForSdk = Buffer.from(pem);
    } else if (process.env.DOCUSIGN_PRIVATE_KEY_PATH) {
      privateKeyForSdk = fs.readFileSync(process.env.DOCUSIGN_PRIVATE_KEY_PATH);
    } else {
      return res.status(500).json({ error: 'DocuSign private key not configured' });
    }

    const jwt = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      process.env.DOCUSIGN_USER_ID,
      ['signature', 'impersonation'],
      privateKeyForSdk,
      3600
    );

    const accessToken = jwt.body.access_token;

    // Descubre la cuenta y baseUri correctos para REST
    const userInfo = await apiClient.getUserInfo(accessToken);
    const account =
      userInfo.accounts.find(a => a.accountId === process.env.DOCUSIGN_ACCOUNT_ID) ||
      userInfo.accounts.find(a => a.isDefault === 'true' || a.isDefault === true);

    if (!account) {
      return res.status(500).json({ error: 'No se pudo resolver la cuenta de DocuSign.' });
    }

    // BasePath REST correcto y header Authorization global
    apiClient.setBasePath(`${account.baseUri}/restapi`);
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    // 5) Construir envelope
    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Por favor, firma el contrato de alquiler';
    envelopeDefinition.documents = [
      docusign.Document.constructFromObject({
        documentBase64: pdfBuffer.toString('base64'),
        name: 'Contrato.pdf',
        fileExtension: 'pdf',
        documentId: '1',
      }),
    ];
    envelopeDefinition.recipients = {
      signers: [
        {
          email: tenantProfile.email,
          name: tenantProfile.full_name,
          recipientId: '1',
          routingOrder: '1',
          clientUserId: `tenant_${contract.tenant_id}`,
        },
      ],
    };
    envelopeDefinition.status = 'sent';

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const createEnv = await envelopesApi.createEnvelope(account.accountId, { envelopeDefinition });

    // 6) URL de firma embebida
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/home/inquilino/contratos/signed';
    viewRequest.authenticationMethod = 'none';
    viewRequest.email = tenantProfile.email;
    viewRequest.userName = tenantProfile.full_name;
    viewRequest.recipientId = '1';
    viewRequest.clientUserId = `tenant_${contract.tenant_id}`;

    const view = await envelopesApi.createRecipientView(
      account.accountId,
      createEnv.envelopeId,
      { recipientViewRequest: viewRequest }
    );

    res.json({ url: view.url, envelopeId: createEnv.envelopeId });
  } catch (err) {
    console.error('DocuSign error:', {
      message: err.message,
      code: err.code,
      status: err.status,
      response: err.response?.data,
    });
    res.status(500).json({ error: 'Error iniciando la firma con DocuSign.' });
  }
};

exports.confirmTenantSignature = async (req, res) => {
  const { id } = req.params;
  const { signatureUrl, envelopeId } = req.body;

  try {
    // Si tenemos envelopeId, descargar el PDF firmado
    let signedPdfUrl = null;
    if (envelopeId) {
      try {
        signedPdfUrl = await downloadAndSaveSignedPDF(envelopeId, id);
        console.log('PDF firmado descargado y guardado:', signedPdfUrl);
      } catch (pdfError) {
        console.error('Error descargando PDF firmado, continuando sin actualizar:', pdfError);
      }
    }

    const updateData = {
      tenant_signature: 'signed',
      tenant_signed_at: new Date(),
      status: 'pending_deposit',
      tenant_signature_url: signatureUrl || null
    };

    // Si se descargó el PDF firmado, actualizar la URL del documento
    if (signedPdfUrl) {
      updateData.document_url = signedPdfUrl;
    }

    const { error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Contrato actualizado correctamente.' });
  } catch (err) {
    console.error('Error en confirmTenantSignature:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Obtener todos los contratos del propietario autenticado
exports.getLandlordContracts = async (req, res) => {
  try {
    const landlord_id = req.user.id;
    console.log('Buscando contratos para landlord_id:', landlord_id);

    // 1. Obtén todos los contratos del propietario
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('landlord_id', landlord_id)
      .order('created_at', { ascending: false });

    console.log('Contratos encontrados:', contracts?.length || 0);
    console.log('Error:', contractsError);

    if (contractsError) return res.status(400).json({ error: contractsError.message });

    // 2. Obtén los datos de las propiedades asociadas
    const propertyIds = contracts.map(c => c.property_id).filter(Boolean);
    console.log('Property IDs:', propertyIds);

    let properties = [];
    if (propertyIds.length > 0) {
      const { data: props, error: propsError } = await supabase
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      console.log('Properties found:', props?.length || 0, 'Error:', propsError);
      if (propsError) return res.status(400).json({ error: propsError.message });
      properties = props || [];
    }

    // 3. Obtén los datos de los inquilinos
    const tenantIds = contracts.map(c => c.tenant_id).filter(Boolean);
    console.log('Tenant IDs:', tenantIds);

    let tenants = [];
    if (tenantIds.length > 0) {
      const { data: tenantProfiles, error: tenantsError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', tenantIds);

      console.log('Tenants found:', tenantProfiles?.length || 0, 'Error:', tenantsError);
      if (tenantsError) return res.status(400).json({ error: tenantsError.message });
      tenants = tenantProfiles || [];
    }

    // 4. Une los datos
    const result = contracts.map(contract => ({
      ...contract,
      property: properties.find(p => String(p.id) === String(contract.property_id)) || null,
      tenant: tenants.find(t => String(t.id) === String(contract.tenant_id)) || null
    }));

    console.log('Final result contracts:', result.length);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Ver detalles de un contrato como propietario
exports.getLandlordContractDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Busca el contrato
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este contrato.' });
    }

    // 2. Busca la propiedad asociada
    let property = null;
    if (contract.property_id) {
      const { data: prop, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', contract.property_id)
        .single();
      if (!propError && prop) property = prop;
    }

    // 3. Busca el inquilino
    let tenant = null;
    if (contract.tenant_id) {
      const { data: tenantProfile, error: tenantError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .eq('id', contract.tenant_id)
        .single();
      if (!tenantError && tenantProfile) tenant = tenantProfile;
    }

    // 4. Devuelve el contrato con la propiedad y el inquilino
    res.json({ ...contract, property, tenant });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// Firmar contrato como propietario (DocuSign)
exports.signContractAsLandlord = async (req, res) => {
  const { id } = req.params;

  try {
    // 1) Buscar contrato y validar permisos/estado
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !contract) return res.status(404).json({ error: 'Contrato no encontrado.' });
    if (contract.landlord_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para firmar este contrato.' });
    }
    if (contract.landlord_signature === 'signed') {
      return res.status(400).json({ error: 'Ya has firmado este contrato.' });
    }

    // 2) Perfil del propietario
    const { data: landlordProfile, error: landlordError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', contract.landlord_id)
      .single();

    if (landlordError || !landlordProfile) {
      return res.status(404).json({ error: 'Perfil de propietario no encontrado.' });
    }

    // 3) Cargar el PDF real (binario)
    let pdfBuffer;
    if (contract.document_url && contract.document_url.startsWith('http')) {
      const response = await axios.get(contract.document_url, { responseType: 'arraybuffer' });
      pdfBuffer = Buffer.from(response.data);
    } else if (contract.document_url) {
      pdfBuffer = fs.readFileSync(contract.document_url);
    } else {
      return res.status(400).json({ error: 'No hay PDF adjunto en el contrato.' });
    }

    // Verificación rápida de PDF
    if (pdfBuffer.slice(0, 4).toString() !== '%PDF') {
      return res.status(400).json({ error: 'El archivo adjunto no parece ser un PDF válido.' });
    }

    // 4) Autenticación JWT
    const apiClient = new docusign.ApiClient();
    apiClient.setOAuthBasePath('account-d.docusign.com');

    // Usar la clave PEM directa desde DOCUSIGN_PRIVATE_KEY o desde archivo
    let privateKeyForSdk;
    if (process.env.DOCUSIGN_PRIVATE_KEY) {
      const pem = process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n');
      privateKeyForSdk = Buffer.from(pem);
    } else if (process.env.DOCUSIGN_PRIVATE_KEY_PATH) {
      privateKeyForSdk = fs.readFileSync(process.env.DOCUSIGN_PRIVATE_KEY_PATH);
    } else {
      return res.status(500).json({ error: 'DocuSign private key not configured' });
    }

    const jwt = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      process.env.DOCUSIGN_USER_ID,
      ['signature', 'impersonation'],
      privateKeyForSdk,
      3600
    );

    const accessToken = jwt.body.access_token;

    // Descubre la cuenta y baseUri
    const userInfo = await apiClient.getUserInfo(accessToken);
    const account =
      userInfo.accounts.find(a => a.accountId === process.env.DOCUSIGN_ACCOUNT_ID) ||
      userInfo.accounts.find(a => a.isDefault === 'true' || a.isDefault === true);

    if (!account) {
      return res.status(500).json({ error: 'No se pudo resolver la cuenta de DocuSign.' });
    }

    apiClient.setBasePath(`${account.baseUri}/restapi`);
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    // 5) Construir envelope
    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Por favor, firma el contrato de alquiler';
    envelopeDefinition.documents = [
      docusign.Document.constructFromObject({
        documentBase64: pdfBuffer.toString('base64'),
        name: 'Contrato.pdf',
        fileExtension: 'pdf',
        documentId: '1',
      }),
    ];
    envelopeDefinition.recipients = {
      signers: [
        {
          email: landlordProfile.email,
          name: landlordProfile.full_name,
          recipientId: '1',
          routingOrder: '1',
          clientUserId: `landlord_${contract.landlord_id}`,
        },
      ],
    };
    envelopeDefinition.status = 'sent';

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const createEnv = await envelopesApi.createEnvelope(account.accountId, { envelopeDefinition });

    // 6) URL de firma embebida
    const viewRequest = new docusign.RecipientViewRequest();
    viewRequest.returnUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/home/propietario/contratos/signed';
    viewRequest.authenticationMethod = 'none';
    viewRequest.email = landlordProfile.email;
    viewRequest.userName = landlordProfile.full_name;
    viewRequest.recipientId = '1';
    viewRequest.clientUserId = `landlord_${contract.landlord_id}`;

    const view = await envelopesApi.createRecipientView(
      account.accountId,
      createEnv.envelopeId,
      { recipientViewRequest: viewRequest }
    );

    res.json({ url: view.url, envelopeId: createEnv.envelopeId });
  } catch (err) {
    console.error('DocuSign error:', {
      message: err.message,
      code: err.code,
      status: err.status,
      response: err.response?.data,
    });
    res.status(500).json({ error: 'Error iniciando la firma con DocuSign.' });
  }
};

// Confirmar firma del propietario
exports.confirmLandlordSignature = async (req, res) => {
  const { id } = req.params;
  const { signatureUrl, envelopeId } = req.body;

  try {
    // Si tenemos envelopeId, descargar el PDF firmado
    let signedPdfUrl = null;
    if (envelopeId) {
      try {
        signedPdfUrl = await downloadAndSaveSignedPDF(envelopeId, id);
        console.log('PDF firmado descargado y guardado:', signedPdfUrl);
      } catch (pdfError) {
        console.error('Error descargando PDF firmado, continuando sin actualizar:', pdfError);
      }
    }

    const updateData = {
      landlord_signature: 'signed',
      landlord_signed_at: new Date(),
      status: 'pending_signatures',
      landlord_signature_url: signatureUrl || null
    };

    // Si se descargó el PDF firmado, actualizar la URL del documento
    if (signedPdfUrl) {
      updateData.document_url = signedPdfUrl;
    }

    const { error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Contrato firmado correctamente. Ahora el inquilino puede firmarlo.' });
  } catch (err) {
    console.error('Error en confirmLandlordSignature:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
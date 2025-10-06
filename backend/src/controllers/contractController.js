const supabase = require('../config/supabase');
const axios = require('axios');

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

    // 2. Crear el contrato usando el property_id generado
    const landlord_signature = 'signed';
    const landlord_signed_at = new Date();

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
        landlord_signature,
        landlord_signed_at,
        tenant_signature: 'unsigned',
        status: 'pending_signatures'
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
    // 1. Obtén todos los contratos del inquilino
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('tenant_id', tenant_id)
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

    // 3. Une los datos (usa String para comparar UUIDs)
    const result = contracts.map(contract => ({
      ...contract,
      property: properties.find(p => String(p.id) === String(contract.property_id)) || null
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
        .select('id, address_line, city, neighborhood, rooms, bathrooms, furnished, amenities, property_type, pets_allowed')
        .eq('id', contract.property_id)
        .single();
      if (!propError && prop) property = prop;
    }

    // 3. Devuelve el contrato con la propiedad
    res.json({ ...contract, property });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

const docusign = require('docusign-esign');
const fs = require('fs');
require('dotenv').config();

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

    // (opcional) Verificación rápida de PDF
    if (pdfBuffer.slice(0, 4).toString() !== '%PDF') {
      return res.status(400).json({ error: 'El archivo adjunto no parece ser un PDF válido.' });
    }

    // 4) Autenticación JWT correctamente aplicada
    const apiClient = new docusign.ApiClient();

    // OAuth host (DEMO)
    apiClient.setOAuthBasePath('account-d.docusign.com');

    // soporta clave en ENV (producción) o fichero (dev)
    const privateKeyBuffer = process.env.DOCUSIGN_PRIVATE_KEY
      ? Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY.replace(/\\n/g, '\n'))
      : fs.readFileSync(process.env.DOCUSIGN_PRIVATE_KEY_PATH);

    const jwt = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      process.env.DOCUSIGN_USER_ID,
      ['signature', 'impersonation'],
      privateKeyBuffer,
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
          // Embedded signing (captive): usa clientUserId
          clientUserId: `tenant_${contract.tenant_id}`,
        },
      ],
    };
    envelopeDefinition.status = 'sent';

    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const createEnv = await envelopesApi.createEnvelope(account.accountId, {
      envelopeDefinition,
    });

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

    res.json({ url: view.url });
  } catch (err) {
    // Log útil para depurar (sin exponer secretos)
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
  const { signatureUrl } = req.body;

  try {
    const { error } = await supabase
      .from('contracts')
      .update({
        tenant_signature: 'signed',
        tenant_signed_at: new Date(),
        status: 'pending_deposit',
        tenant_signature_url: signatureUrl || null
      })
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Contrato actualizado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
const supabase = require('../config/supabase');
const {
  createPaymentPreference,
  getPaymentInfo,
  getMerchantOrder,
  mapMPStatusToDepositStatus
} = require('../config/mercadopago');

/**
 * FUNCIÓN INTERNA: Crear depósito (llamada desde contractController)
 * Se ejecuta automáticamente cuando el inquilino firma el contrato
 */
exports.createDeposit = async (contractId, tenantId, amount) => {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .insert([{
        contract_id: contractId,
        amount: amount,
        status: 'pending_payment',
        submitted_by: tenantId,
        outcome: 'undecided'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear depósito:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error en createDeposit:', err);
    throw err;
  }
};

/**
 * GET /api/deposits/my
 * Obtener depósitos del usuario actual (inquilino o propietario)
 */
exports.getMyDeposits = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener perfil del usuario para saber su rol
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Perfil no encontrado.' });
    }

    let deposits = [];

    if (profile.role === 'inquilino') {
      // Si es inquilino, buscar depósitos donde él es el submitted_by
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      deposits = data || [];
    } else if (profile.role === 'propietario') {
      // Si es propietario, buscar depósitos de contratos donde él es el landlord
      // Primero obtener contratos del propietario
      const { data: contracts, error: contractError } = await supabase
        .from('contracts')
        .select('id')
        .eq('landlord_id', userId);

      if (contractError) {
        return res.status(400).json({ error: contractError.message });
      }

      const contractIds = contracts.map(c => c.id);

      if (contractIds.length === 0) {
        return res.json([]);
      }

      // Obtener depósitos de esos contratos
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .in('contract_id', contractIds)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      deposits = data || [];
    } else {
      return res.status(403).json({ error: 'Rol no autorizado.' });
    }

    // Enriquecer con datos del contrato y propiedad
    const contractIds = deposits.map(d => d.contract_id);

    if (contractIds.length === 0) {
      return res.json([]);
    }

    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('id, property_id, tenant_id, landlord_id, start_date, end_date, status, rent_amount')
      .in('id', contractIds);

    if (contractsError) {
      return res.status(400).json({ error: contractsError.message });
    }

    const propertyIds = contracts.map(c => c.property_id).filter(id => id);

    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, address_line, city, neighborhood, property_type')
      .in('id', propertyIds);

    if (propertiesError) {
      return res.status(400).json({ error: propertiesError.message });
    }

    // Obtener perfiles (inquilinos y propietarios)
    const tenantIds = contracts.map(c => c.tenant_id);
    const landlordIds = contracts.map(c => c.landlord_id);
    const allUserIds = [...new Set([...tenantIds, ...landlordIds])];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', allUserIds);

    if (profilesError) {
      return res.status(400).json({ error: profilesError.message });
    }

    // Mapear datos
    const propertyMap = {};
    properties.forEach(p => {
      propertyMap[p.id] = p;
    });

    const contractMap = {};
    contracts.forEach(c => {
      contractMap[c.id] = c;
    });

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p;
    });

    // Combinar todo
    const enrichedDeposits = deposits.map(deposit => {
      const contract = contractMap[deposit.contract_id];
      const property = contract ? propertyMap[contract.property_id] : null;
      const tenant = contract ? profileMap[contract.tenant_id] : null;
      const landlord = contract ? profileMap[contract.landlord_id] : null;

      return {
        ...deposit,
        contract: contract || null,
        property: property || null,
        tenant: tenant || null,
        landlord: landlord || null
      };
    });

    res.json(enrichedDeposits);
  } catch (err) {
    console.error('Error en getMyDeposits:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * GET /api/deposits/:id
 * Obtener detalle de un depósito específico
 */
exports.getDepositDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener depósito
    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado.' });
    }

    // Obtener contrato asociado para verificar permisos
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*, property:properties(*)')
      .eq('id', deposit.contract_id)
      .single();

    if (contractError || !contract) {
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    }

    // Verificar que el usuario sea el inquilino o el propietario
    if (contract.tenant_id !== userId && contract.landlord_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver este depósito.' });
    }

    // Obtener perfiles
    const { data: tenant } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', contract.tenant_id)
      .single();

    const { data: landlord } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', contract.landlord_id)
      .single();

    res.json({
      ...deposit,
      contract,
      tenant,
      landlord
    });
  } catch (err) {
    console.error('Error en getDepositDetail:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/deposits/:id/mark-as-paid
 * El inquilino marca el depósito como pagado
 * Esto activa el depósito y el contrato
 */
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { proof_url } = req.body; // Opcional: URL del comprobante

    // Obtener depósito
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*, contract:contracts(*)')
      .eq('id', id)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado.' });
    }

    // Verificar que el usuario sea el inquilino
    if (deposit.contract.tenant_id !== userId) {
      return res.status(403).json({ error: 'Solo el inquilino puede marcar el depósito como pagado.' });
    }

    // Verificar que el depósito esté en estado pending_payment
    if (deposit.status !== 'pending_payment') {
      return res.status(400).json({
        error: `El depósito no puede ser marcado como pagado. Estado actual: ${deposit.status}`
      });
    }

    // 1. Actualizar depósito a 'held'
    const updateData = {
      status: 'held',
      verified_at: new Date().toISOString()
    };

    if (proof_url) {
      updateData.proof_url = proof_url;
    }

    const { error: updateError } = await supabase
      .from('deposits')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // 2. Actualizar contrato a 'active'
    const { error: contractError } = await supabase
      .from('contracts')
      .update({ status: 'active' })
      .eq('id', deposit.contract_id);

    if (contractError) {
      console.error('Error al actualizar contrato:', contractError);
      return res.status(400).json({ error: contractError.message });
    }

    res.json({
      message: 'Depósito marcado como pagado. El contrato está ahora activo.',
      deposit_id: id,
      contract_id: deposit.contract_id
    });
  } catch (err) {
    console.error('Error en markAsPaid:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/deposits/:id/release
 * Liberar el depósito al finalizar el contrato
 * Solo el propietario puede ejecutar esto
 */
exports.releaseDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { outcome, tenant_share, landlord_share, notes } = req.body;

    // Validar outcome
    const validOutcomes = ['return_to_tenant', 'return_to_landlord', 'split'];
    if (!outcome || !validOutcomes.includes(outcome)) {
      return res.status(400).json({
        error: 'Outcome inválido. Debe ser: return_to_tenant, return_to_landlord, o split'
      });
    }

    // Si es split, validar shares
    if (outcome === 'split') {
      if (!tenant_share || !landlord_share) {
        return res.status(400).json({
          error: 'Para outcome "split" debes especificar tenant_share y landlord_share'
        });
      }

      const totalShare = parseFloat(tenant_share) + parseFloat(landlord_share);
      if (Math.abs(totalShare - 100) > 0.01) {
        return res.status(400).json({
          error: 'La suma de tenant_share y landlord_share debe ser 100%'
        });
      }
    }

    // Obtener depósito
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*, contract:contracts(*)')
      .eq('id', id)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado.' });
    }

    // Verificar que el usuario sea el propietario
    if (deposit.contract.landlord_id !== userId) {
      return res.status(403).json({ error: 'Solo el propietario puede liberar el depósito.' });
    }

    // Verificar que el depósito esté en estado 'held'
    if (deposit.status !== 'held') {
      return res.status(400).json({
        error: `El depósito no puede ser liberado. Estado actual: ${deposit.status}`
      });
    }

    // Determinar el nuevo status basado en outcome
    let newStatus;
    if (outcome === 'return_to_tenant') {
      newStatus = 'returned_to_tenant';
    } else if (outcome === 'return_to_landlord') {
      newStatus = 'returned_to_landlord';
    } else if (outcome === 'split') {
      newStatus = 'returned_to_tenant'; // Usamos este status, pero el split se refleja en los shares
    }

    // Actualizar depósito
    const updateData = {
      status: newStatus,
      outcome: outcome,
      released_by: userId,
      released_at: new Date().toISOString(),
      notes: notes || null
    };

    if (outcome === 'split') {
      updateData.tenant_share = parseFloat(tenant_share);
      updateData.landlord_share = parseFloat(landlord_share);
    }

    const { error: updateError } = await supabase
      .from('deposits')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Depósito liberado correctamente.',
      deposit_id: id,
      outcome: outcome
    });
  } catch (err) {
    console.error('Error en releaseDeposit:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * DELETE /api/deposits/:id/cancel
 * Cancelar un depósito que nunca fue pagado
 * Solo el inquilino o propietario pueden cancelar
 */
exports.cancelDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener depósito
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*, contract:contracts(*)')
      .eq('id', id)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado.' });
    }

    // Verificar que el usuario sea el inquilino o propietario
    if (deposit.contract.tenant_id !== userId && deposit.contract.landlord_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para cancelar este depósito.' });
    }

    // Solo se puede cancelar si está en pending_payment
    if (deposit.status !== 'pending_payment') {
      return res.status(400).json({
        error: `No se puede cancelar. El depósito ya fue procesado. Estado: ${deposit.status}`
      });
    }

    // Eliminar el depósito
    const { error: deleteError } = await supabase
      .from('deposits')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({
      message: 'Depósito cancelado correctamente.',
      deposit_id: id
    });
  } catch (err) {
    console.error('Error en cancelDeposit:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/deposits/:id/create-payment
 * Crear preferencia de pago en Mercado Pago
 * El inquilino inicia el proceso de pago
 */
exports.createPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener depósito con datos relacionados
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*')
      .eq('id', id)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado.' });
    }

    // Obtener contrato
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, property_id, tenant_id, landlord_id')
      .eq('id', deposit.contract_id)
      .single();

    if (contractError || !contract) {
      return res.status(404).json({ error: 'Contrato no encontrado.' });
    }

    // Verificar que el usuario sea el inquilino
    if (contract.tenant_id !== userId) {
      return res.status(403).json({ error: 'Solo el inquilino puede iniciar el pago.' });
    }

    // Verificar que el depósito esté en estado pending_payment
    if (deposit.status !== 'pending_payment') {
      return res.status(400).json({
        error: `El depósito no puede ser pagado. Estado actual: ${deposit.status}`
      });
    }

    // Obtener datos de la propiedad
    const { data: property } = await supabase
      .from('properties')
      .select('address_line, city, neighborhood')
      .eq('id', contract.property_id)
      .single();

    // Obtener datos del inquilino
    const { data: tenant } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .eq('id', contract.tenant_id)
      .single();

    // Crear preferencia de pago en Mercado Pago
    const preference = await createPaymentPreference({
      id: deposit.id,
      amount: deposit.amount,
      contractId: contract.id,
      property: property || {},
      tenant: tenant || {}
    });

    // Guardar preference_id en la base de datos
    await supabase
      .from('deposits')
      .update({
        preference_id: preference.id,
        payment_status: 'pending'
      })
      .eq('id', id);

    res.json({
      preference_id: preference.id,
      init_point: preference.init_point, // URL para Checkout Pro
      sandbox_init_point: preference.sandbox_init_point // URL para testing
    });
  } catch (err) {
    console.error('Error en createPayment:', err);
    res.status(500).json({ error: 'Error al crear la preferencia de pago.' });
  }
};

/**
 * POST /api/deposits/webhook
 * Webhook para recibir notificaciones de Mercado Pago
 * Se ejecuta automáticamente cuando hay cambios en el pago
 */
exports.handleWebhook = async (req, res) => {
  try {
    console.log('📨 Webhook recibido:', req.body);
    console.log('📨 Query params:', req.query);

    const { type, data } = req.body;

    // Responder rápido a Mercado Pago (importante)
    res.status(200).send('OK');

    // Procesar la notificación de forma asíncrona
    if (type === 'payment') {
      // Notificación de pago
      const paymentId = data.id;
      console.log('💳 Procesando pago:', paymentId);

      // Obtener información del pago
      const paymentInfo = await getPaymentInfo(paymentId);
      console.log('💳 Info del pago:', JSON.stringify(paymentInfo, null, 2));

      // Buscar el depósito usando external_reference (nuestro deposit_id)
      const depositId = paymentInfo.external_reference;

      if (!depositId) {
        console.error('❌ No se encontró external_reference en el pago');
        return;
      }

      // Obtener depósito
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .select('*, contract:contracts(*)')
        .eq('id', depositId)
        .single();

      if (depositError || !deposit) {
        console.error('❌ Depósito no encontrado:', depositId);
        return;
      }

      // Mapear estado de MP a estado de depósito
      const newStatus = mapMPStatusToDepositStatus(paymentInfo.status);
      console.log(`🔄 Actualizando depósito de ${deposit.status} a ${newStatus}`);

      // Actualizar depósito
      const updateData = {
        payment_id: paymentInfo.id.toString(),
        payment_status: paymentInfo.status,
        payment_method: paymentInfo.payment_method_id,
        payment_type: paymentInfo.payment_type_id,
        status: newStatus
      };

      // Si el pago fue aprobado, marcar fecha de verificación
      if (paymentInfo.status === 'approved') {
        updateData.verified_at = new Date().toISOString();
      }

      await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', depositId);

      // Si el pago fue aprobado, activar el contrato
      if (paymentInfo.status === 'approved' && deposit.contract) {
        console.log('✅ Pago aprobado - Activando contrato:', deposit.contract_id);

        await supabase
          .from('contracts')
          .update({ status: 'active' })
          .eq('id', deposit.contract_id);

        console.log('✅ Contrato activado exitosamente');
      }

      console.log('✅ Webhook procesado correctamente');
    } else if (type === 'merchant_order') {
      // Notificación de orden
      console.log('📦 Merchant order recibida:', data.id);
    }
  } catch (err) {
    console.error('❌ Error en webhook:', err);
    // No lanzar error para no afectar la respuesta a Mercado Pago
  }
};

/**
 * POST /api/deposits/verify-by-preference/:preferenceId
 * Verificar y actualizar depósito usando el preference_id
 */
exports.verifyByPreference = async (req, res) => {
  try {
    const { preferenceId } = req.params;

    // Buscar depósito por preference_id
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*, contract:contracts(*)')
      .eq('preference_id', preferenceId)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado con ese preference_id.' });
    }

    // Si no hay payment_id, intentar obtenerlo de Mercado Pago
    if (!deposit.payment_id) {
      // Buscar el pago usando el external_reference (deposit_id)
      const { paymentApi } = require('../config/mercadopago');

      try {
        // Buscar pagos con este external_reference
        const payments = await paymentApi.search({
          options: {
            criteria: 'desc',
            external_reference: deposit.id
          }
        });

        if (payments.results && payments.results.length > 0) {
          // Tomar el pago más reciente
          const latestPayment = payments.results[0];

          const { mapMPStatusToDepositStatus } = require('../config/mercadopago');
          const newStatus = mapMPStatusToDepositStatus(latestPayment.status);

          const updateData = {
            payment_id: latestPayment.id.toString(),
            payment_status: latestPayment.status,
            payment_method: latestPayment.payment_method_id,
            payment_type: latestPayment.payment_type_id,
            status: newStatus
          };

          if (latestPayment.status === 'approved') {
            updateData.verified_at = new Date().toISOString();
          }

          await supabase
            .from('deposits')
            .update(updateData)
            .eq('id', deposit.id);

          // Activar contrato si el pago fue aprobado
          if (latestPayment.status === 'approved') {
            await supabase
              .from('contracts')
              .update({ status: 'active' })
              .eq('id', deposit.contract_id);
          }

          return res.json({
            success: true,
            deposit_id: deposit.id,
            deposit_status: newStatus,
            payment_status: latestPayment.status,
            payment_id: latestPayment.id,
            message: 'Depósito actualizado exitosamente'
          });
        } else {
          return res.status(404).json({
            error: 'No se encontró ningún pago para este depósito en Mercado Pago.'
          });
        }
      } catch (error) {
        console.error('Error buscando pago en Mercado Pago:', error);
        return res.status(500).json({
          error: 'Error al buscar el pago en Mercado Pago.'
        });
      }
    }

    // Si ya tiene payment_id, usar el flujo normal
    const { getPaymentInfo, mapMPStatusToDepositStatus } = require('../config/mercadopago');
    const paymentInfo = await getPaymentInfo(deposit.payment_id);

    res.json({
      success: true,
      deposit_id: deposit.id,
      deposit_status: mapMPStatusToDepositStatus(paymentInfo.status),
      payment_status: paymentInfo.status,
      payment_id: deposit.payment_id,
      message: 'Pago ya procesado'
    });
  } catch (err) {
    console.error('Error en verifyByPreference:', err);
    res.status(500).json({ error: 'Error al verificar el depósito.' });
  }
};

/**
 * GET /api/deposits/:id/payment-status
 * Obtener el estado actual del pago en Mercado Pago
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Obtener depósito
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .select('*, contract:contracts(*)')
      .eq('id', id)
      .single();

    if (depositError || !deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado.' });
    }

    // Verificar permisos
    if (deposit.contract.tenant_id !== userId && deposit.contract.landlord_id !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver este depósito.' });
    }

    // Si no hay payment_id, retornar estado básico
    if (!deposit.payment_id) {
      return res.json({
        deposit_status: deposit.status,
        payment_status: deposit.payment_status || 'pending',
        has_payment: false
      });
    }

    // Obtener información actualizada del pago
    const paymentInfo = await getPaymentInfo(deposit.payment_id);

    // Actualizar estado si cambió
    if (paymentInfo.status !== deposit.payment_status) {
      const newStatus = mapMPStatusToDepositStatus(paymentInfo.status);

      const updateData = {
        payment_status: paymentInfo.status,
        status: newStatus
      };

      if (paymentInfo.status === 'approved' && !deposit.verified_at) {
        updateData.verified_at = new Date().toISOString();
      }

      await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', id);

      // Activar contrato si el pago fue aprobado
      if (paymentInfo.status === 'approved') {
        await supabase
          .from('contracts')
          .update({ status: 'active' })
          .eq('id', deposit.contract_id);
      }
    }

    res.json({
      deposit_status: mapMPStatusToDepositStatus(paymentInfo.status),
      payment_status: paymentInfo.status,
      payment_status_detail: paymentInfo.status_detail,
      payment_method: paymentInfo.payment_method_id,
      payment_type: paymentInfo.payment_type_id,
      has_payment: true,
      amount: paymentInfo.transaction_amount,
      date_approved: paymentInfo.date_approved
    });
  } catch (err) {
    console.error('Error en getPaymentStatus:', err);
    res.status(500).json({ error: 'Error al obtener estado del pago.' });
  }
};

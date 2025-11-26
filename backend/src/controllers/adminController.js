const supabase = require('../config/supabase');

// Función auxiliar para traducir estados de depósito
function translateDepositStatus(status) {
  const translations = {
    'pending_payment': 'pendiente de pago',
    'awaiting_verification': 'esperando verificación',
    'held': 'retenido',
    'returned_to_tenant': 'devuelto al inquilino',
    'returned_to_landlord': 'devuelto al propietario',
    'disputed': 'en disputa'
  };
  return translations[status] || status;
}

// Función auxiliar para traducir estados de contrato
function translateContractStatus(status) {
  const translations = {
    'draft': 'borrador',
    'pending_signatures': 'pendiente de firmas',
    'pending_deposit': 'pendiente de depósito',
    'active': 'activo',
    'expired': 'expirado',
    'cancelled': 'cancelado'
  };
  return translations[status] || status;
}

// Dashboard Stats - Estadísticas generales
exports.getDashboardStats = async (req, res) => {
  try {
    // Calcular fechas para comparación mes actual vs mes anterior
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // Obtener estadísticas de usuarios con fecha de creación
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('role, status, created_at');

    if (usersError) throw usersError;

    const users = allUsers || [];
    const currentMonthUsers = users.filter(u => u.created_at >= currentMonthStart);
    const previousMonthUsers = users.filter(u => u.created_at >= previousMonthStart && u.created_at < currentMonthStart);

    const userStats = {
      total: users.length,
      inquilinos: users.filter(u => u.role === 'inquilino').length,
      propietarios: users.filter(u => u.role === 'propietario').length,
      admins: users.filter(u => u.role === 'admin').length,
      verified: users.filter(u => u.status === 'verified').length,
      pending: users.filter(u => u.status === 'unverified' || u.status === 'pending' || !u.status).length,
      // Comparación temporal
      currentMonth: currentMonthUsers.length,
      previousMonth: previousMonthUsers.length,
      change: currentMonthUsers.length - previousMonthUsers.length,
      changePercent: previousMonthUsers.length > 0
        ? ((currentMonthUsers.length - previousMonthUsers.length) / previousMonthUsers.length * 100).toFixed(1)
        : currentMonthUsers.length > 0 ? 100 : 0
    };

    // Obtener estadísticas de contratos con fecha de creación
    const { data: allContracts, error: contractsError } = await supabase
      .from('contracts')
      .select('status, created_at');

    if (contractsError) throw contractsError;

    const contracts = allContracts || [];
    const currentMonthContracts = contracts.filter(c => c.created_at >= currentMonthStart);
    const previousMonthContracts = contracts.filter(c => c.created_at >= previousMonthStart && c.created_at < currentMonthStart);

    const contractStats = {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      pending: contracts.filter(c => c.status === 'draft' || c.status === 'pending_signatures' || c.status === 'pending_deposit').length,
      completed: contracts.filter(c => c.status === 'expired').length,
      cancelled: contracts.filter(c => c.status === 'cancelled').length,
      // Comparación temporal
      currentMonth: currentMonthContracts.length,
      previousMonth: previousMonthContracts.length,
      change: currentMonthContracts.length - previousMonthContracts.length,
      changePercent: previousMonthContracts.length > 0
        ? ((currentMonthContracts.length - previousMonthContracts.length) / previousMonthContracts.length * 100).toFixed(1)
        : currentMonthContracts.length > 0 ? 100 : 0
    };

    // Obtener estadísticas de depósitos con fecha de creación
    const { data: allDeposits, error: depositsError } = await supabase
      .from('deposits')
      .select('status, created_at, amount');

    if (depositsError) throw depositsError;

    const deposits = allDeposits || [];
    const currentMonthDeposits = deposits.filter(d => d.created_at >= currentMonthStart);
    const previousMonthDeposits = deposits.filter(d => d.created_at >= previousMonthStart && d.created_at < currentMonthStart);

    const depositStats = {
      total: deposits.length,
      pending: deposits.filter(d => d.status === 'pending_payment' || d.status === 'awaiting_verification').length,
      received: deposits.filter(d => d.status === 'held').length,
      returned: deposits.filter(d => d.status === 'returned_to_tenant' || d.status === 'returned_to_landlord').length,
      disputed: deposits.filter(d => d.status === 'disputed').length,
      // Comparación temporal
      currentMonth: currentMonthDeposits.length,
      previousMonth: previousMonthDeposits.length,
      change: currentMonthDeposits.length - previousMonthDeposits.length,
      changePercent: previousMonthDeposits.length > 0
        ? ((currentMonthDeposits.length - previousMonthDeposits.length) / previousMonthDeposits.length * 100).toFixed(1)
        : currentMonthDeposits.length > 0 ? 100 : 0,
      // Métricas de valor
      totalValue: deposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
      currentMonthValue: currentMonthDeposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
      previousMonthValue: previousMonthDeposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
    };

    // Obtener estadísticas de perfiles de búsqueda con fecha de creación
    const { data: allProfiles, error: profilesError } = await supabase
      .from('tenant_search_profiles')
      .select('status, created_at');

    if (profilesError) throw profilesError;

    const profiles = allProfiles || [];
    const currentMonthProfiles = profiles.filter(p => p.created_at >= currentMonthStart);
    const previousMonthProfiles = profiles.filter(p => p.created_at >= previousMonthStart && p.created_at < currentMonthStart);

    const searchProfileStats = {
      total: profiles.length,
      active: profiles.filter(p => p.status === 'activo').length,
      paused: profiles.filter(p => p.status === 'pausado').length,
      archived: profiles.filter(p => p.status === 'archivado').length,
      // Comparación temporal
      currentMonth: currentMonthProfiles.length,
      previousMonth: previousMonthProfiles.length,
      change: currentMonthProfiles.length - previousMonthProfiles.length,
      changePercent: previousMonthProfiles.length > 0
        ? ((currentMonthProfiles.length - previousMonthProfiles.length) / previousMonthProfiles.length * 100).toFixed(1)
        : currentMonthProfiles.length > 0 ? 100 : 0
    };

    // Calcular KPIs principales
    const kpis = {
      totalRevenue: depositStats.totalValue,
      monthlyGrowth: userStats.changePercent,
      activeContracts: contractStats.active,
      conversionRate: users.length > 0 ? ((contracts.length / users.length) * 100).toFixed(1) : 0,
      averageDepositValue: deposits.length > 0 ? (depositStats.totalValue / deposits.length).toFixed(2) : 0
    };

    return res.status(200).json({
      users: userStats,
      contracts: contractStats,
      deposits: depositStats,
      searchProfiles: searchProfileStats,
      kpis: kpis
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    return res.status(500).json({
      error: 'Error al obtener estadísticas del dashboard',
      details: err.message
    });
  }
};

// Recent Activity - Actividad reciente
exports.getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // Obtener últimos usuarios registrados
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!usersError && recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          description: `Nuevo usuario registrado como ${user.role}`,
          timestamp: user.created_at,
          user: {
            full_name: user.full_name,
            email: user.email
          }
        });
      });
    }

    // Obtener últimos contratos creados
    const { data: recentContracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        status,
        created_at,
        landlord:landlord_id(full_name, email),
        tenant:tenant_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!contractsError && recentContracts) {
      recentContracts.forEach(contract => {
        activities.push({
          id: `contract-${contract.id}`,
          type: 'contract',
          description: `Nuevo contrato creado (${translateContractStatus(contract.status)})`,
          timestamp: contract.created_at,
          user: contract.landlord
        });
      });
    }

    // Obtener últimos depósitos
    const { data: recentDeposits, error: depositsError } = await supabase
      .from('deposits')
      .select(`
        id,
        status,
        created_at,
        contract:contract_id(
          tenant:tenant_id(full_name, email)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!depositsError && recentDeposits) {
      recentDeposits.forEach(deposit => {
        activities.push({
          id: `deposit-${deposit.id}`,
          type: 'deposit',
          description: `Depósito ${translateDepositStatus(deposit.status)}`,
          timestamp: deposit.created_at,
          user: deposit.contract?.tenant
        });
      });
    }

    // Obtener últimos perfiles de búsqueda
    const { data: recentProfiles, error: profilesError } = await supabase
      .from('tenant_search_profiles')
      .select(`
        id,
        status,
        created_at,
        tenant:tenant_id(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!profilesError && recentProfiles) {
      recentProfiles.forEach(profile => {
        activities.push({
          id: `profile-${profile.id}`,
          type: 'profile',
          description: `Nuevo perfil de búsqueda creado`,
          timestamp: profile.created_at,
          user: profile.tenant
        });
      });
    }

    // Ordenar todas las actividades por fecha (más recientes primero)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json(activities.slice(0, 20));
  } catch (err) {
    console.error('Error getting recent activity:', err);
    return res.status(500).json({
      error: 'Error al obtener actividad reciente',
      details: err.message
    });
  }
};

// Dashboard Charts - Datos históricos para gráficos
exports.getDashboardCharts = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const monthsAgo = parseInt(months);

    // Calcular fecha de inicio
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsAgo);
    const startDateStr = startDate.toISOString();

    // Obtener usuarios por mes
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('created_at, role')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: true });

    if (usersError) throw usersError;

    // Obtener contratos por mes
    const { data: contractsData, error: contractsError } = await supabase
      .from('contracts')
      .select('created_at, status')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: true });

    if (contractsError) throw contractsError;

    // Obtener depósitos por mes
    const { data: depositsData, error: depositsError } = await supabase
      .from('deposits')
      .select('created_at, status')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: true });

    if (depositsError) throw depositsError;

    // Procesar datos por mes
    const monthlyData = {};

    // Generar estructura para cada mes
    for (let i = monthsAgo - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      monthlyData[monthKey] = {
        month: monthKey,
        usuarios: 0,
        inquilinos: 0,
        propietarios: 0,
        contratos: 0,
        depositos: 0,
        contractsActive: 0,
        contractsPending: 0,
        contractsCompleted: 0,
        contractsCancelled: 0
      };
    }

    // Agrupar usuarios por mes
    (usersData || []).forEach(user => {
      const date = new Date(user.created_at);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].usuarios++;
        if (user.role === 'inquilino') monthlyData[monthKey].inquilinos++;
        if (user.role === 'propietario') monthlyData[monthKey].propietarios++;
      }
    });

    // Agrupar contratos por mes
    (contractsData || []).forEach(contract => {
      const date = new Date(contract.created_at);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].contratos++;
        if (contract.status === 'active') monthlyData[monthKey].contractsActive++;
        else if (contract.status === 'draft' || contract.status === 'pending_signatures' || contract.status === 'pending_deposit') {
          monthlyData[monthKey].contractsPending++;
        }
        else if (contract.status === 'expired') monthlyData[monthKey].contractsCompleted++;
        else if (contract.status === 'cancelled') monthlyData[monthKey].contractsCancelled++;
      }
    });

    // Agrupar depósitos por mes
    (depositsData || []).forEach(deposit => {
      const date = new Date(deposit.created_at);
      const monthKey = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].depositos++;
      }
    });

    // Convertir a array
    const timelineData = Object.values(monthlyData);

    // Calcular predicciones simples basadas en promedio de crecimiento
    const predictions = {};

    if (timelineData.length >= 3) {
      // Calcular promedio de usuarios de los últimos 3 meses
      const last3Months = timelineData.slice(-3);
      const avgUsers = last3Months.reduce((sum, m) => sum + m.usuarios, 0) / 3;
      const avgContracts = last3Months.reduce((sum, m) => sum + m.contratos, 0) / 3;
      const avgDeposits = last3Months.reduce((sum, m) => sum + m.depositos, 0) / 3;

      // Calcular tasa de crecimiento
      const firstMonth = last3Months[0];
      const lastMonth = last3Months[last3Months.length - 1];

      const userGrowthRate = firstMonth.usuarios > 0
        ? (lastMonth.usuarios - firstMonth.usuarios) / firstMonth.usuarios
        : 0;
      const contractGrowthRate = firstMonth.contratos > 0
        ? (lastMonth.contratos - firstMonth.contratos) / firstMonth.contratos
        : 0;

      // Proyección para el próximo mes
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthKey = nextMonth.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      predictions.nextMonth = {
        month: nextMonthKey,
        predictedUsers: Math.round(avgUsers * (1 + userGrowthRate)),
        predictedContracts: Math.round(avgContracts * (1 + contractGrowthRate)),
        predictedDeposits: Math.round(avgDeposits),
        confidence: timelineData.length >= 6 ? 'high' : 'medium'
      };

      // Detectar anomalías (variaciones > 30% del promedio)
      const alerts = [];
      const currentMonth = timelineData[timelineData.length - 1];

      if (currentMonth.usuarios < avgUsers * 0.7) {
        alerts.push({
          type: 'warning',
          metric: 'usuarios',
          message: 'Registro de usuarios por debajo del promedio (-30%)',
          severity: 'medium'
        });
      }

      if (currentMonth.contratos > avgContracts * 1.5) {
        alerts.push({
          type: 'success',
          metric: 'contratos',
          message: 'Aumento significativo en contratos (+50%)',
          severity: 'low'
        });
      }

      if (userGrowthRate < -0.1) {
        alerts.push({
          type: 'danger',
          metric: 'crecimiento',
          message: 'Decrecimiento en usuarios detectado',
          severity: 'high'
        });
      }

      predictions.alerts = alerts;
      predictions.trends = {
        userGrowthRate: (userGrowthRate * 100).toFixed(1),
        contractGrowthRate: (contractGrowthRate * 100).toFixed(1),
        avgMonthlyUsers: Math.round(avgUsers),
        avgMonthlyContracts: Math.round(avgContracts)
      };
    }

    return res.status(200).json({
      timeline: timelineData,
      summary: {
        totalUsers: (usersData || []).length,
        totalContracts: (contractsData || []).length,
        totalDeposits: (depositsData || []).length
      },
      predictions: predictions
    });
  } catch (err) {
    console.error('Error getting dashboard charts data:', err);
    return res.status(500).json({
      error: 'Error al obtener datos de gráficos',
      details: err.message
    });
  }
};

// User Management - Obtener todos los usuarios con filtros
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, status, is_banned, created_at, updated_at', { count: 'exact' });

    // Aplicar filtros
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      users: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error getting users:', err);
    return res.status(500).json({
      error: 'Error al obtener usuarios',
      details: err.message
    });
  }
};

// User Management - Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener estadísticas adicionales del usuario
    const [contractsRes, depositsRes, searchProfilesRes] = await Promise.all([
      supabase.from('contracts').select('id', { count: 'exact', head: true }).or(`landlord_id.eq.${id},tenant_id.eq.${id}`),
      supabase.from('deposits').select('id', { count: 'exact', head: true }).eq('submitted_by', id),
      supabase.from('tenant_search_profiles').select('id', { count: 'exact', head: true }).eq('tenant_id', id)
    ]);

    return res.status(200).json({
      ...user,
      stats: {
        contracts: contractsRes.count || 0,
        deposits: depositsRes.count || 0,
        searchProfiles: searchProfilesRes.count || 0
      }
    });
  } catch (err) {
    console.error('Error getting user:', err);
    return res.status(500).json({
      error: 'Error al obtener usuario',
      details: err.message
    });
  }
};

// User Management - Banear usuario
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Verificar que no sea el usuario actual
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'No puedes banearte a ti mismo'
      });
    }

    const updateData = {
      is_banned: true,
      banned_at: new Date().toISOString()
    };

    // Agregar razón solo si fue proporcionada
    if (reason) {
      updateData.banned_reason = reason;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Usuario baneado exitosamente',
      user: data
    });
  } catch (err) {
    console.error('Error banning user:', err);
    return res.status(500).json({
      error: 'Error al banear usuario',
      details: err.message
    });
  }
};

// User Management - Desbanear usuario
exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Usuario desbaneado exitosamente',
      user: data
    });
  } catch (err) {
    console.error('Error unbanning user:', err);
    return res.status(500).json({
      error: 'Error al desbanear usuario',
      details: err.message
    });
  }
};

// User Management - Cambiar rol de usuario
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validar rol
    const validRoles = ['inquilino', 'propietario', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Rol inválido. Debe ser: inquilino, propietario o admin'
      });
    }

    // Verificar que no sea el usuario actual (prevenir que se quite sus propios permisos)
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'No puedes cambiar tu propio rol'
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: `Rol actualizado exitosamente a ${role}`,
      user: data
    });
  } catch (err) {
    console.error('Error changing user role:', err);
    return res.status(500).json({
      error: 'Error al cambiar el rol del usuario',
      details: err.message
    });
  }
};

// User Management - Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no sea el usuario actual
    if (id === req.user.id) {
      return res.status(400).json({
        error: 'No puedes eliminar tu propio usuario'
      });
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      message: 'Usuario eliminado exitosamente'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({
      error: 'Error al eliminar usuario',
      details: err.message
    });
  }
};

// ============================================
// CONTRACT MANAGEMENT
// ============================================

// Obtener todos los contratos con filtros y paginación
exports.getContracts = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 50,
      // Filtros avanzados
      signature_filter,
      // Fechas de inicio del contrato
      start_date_from,
      start_date_to,
      // Fechas de fin del contrato
      end_date_from,
      end_date_to,
      // Montos
      min_rent,
      max_rent,
      min_deposit,
      max_deposit
    } = req.query;

    let query = supabase
      .from('contracts')
      .select(`
        id,
        status,
        rent_amount,
        deposit_amount,
        payment_day,
        start_date,
        end_date,
        tenant_signature,
        landlord_signature,
        created_at,
        updated_at,
        landlord:landlord_id(id, full_name, email),
        tenant:tenant_id(id, full_name, email)
      `, { count: 'exact' });

    // Filtros básicos
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      // Buscar en nombres y emails de inquilinos y propietarios
      const { data: searchResults } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      if (searchResults && searchResults.length > 0) {
        const userIds = searchResults.map(u => u.id);
        query = query.or(`landlord_id.in.(${userIds.join(',')}),tenant_id.in.(${userIds.join(',')})`);
      }
    }

    // Filtros avanzados - Estado de firmas
    if (signature_filter && signature_filter !== 'all') {
      switch (signature_filter) {
        case 'unsigned':
          query = query.eq('tenant_signature', 'unsigned').eq('landlord_signature', 'unsigned');
          break;
        case 'landlord_only':
          query = query.eq('landlord_signature', 'signed').eq('tenant_signature', 'unsigned');
          break;
        case 'tenant_only':
          query = query.eq('tenant_signature', 'signed').eq('landlord_signature', 'unsigned');
          break;
        case 'both_signed':
          query = query.eq('tenant_signature', 'signed').eq('landlord_signature', 'signed');
          break;
      }
    }

    // Filtros avanzados - Rango de fecha de inicio del contrato
    if (start_date_from) {
      query = query.gte('start_date', start_date_from);
    }
    if (start_date_to) {
      query = query.lte('start_date', start_date_to);
    }

    // Filtros avanzados - Rango de fecha de fin del contrato
    if (end_date_from) {
      query = query.gte('end_date', end_date_from);
    }
    if (end_date_to) {
      query = query.lte('end_date', end_date_to);
    }

    // Filtros avanzados - Rango de renta
    if (min_rent) {
      query = query.gte('rent_amount', parseFloat(min_rent));
    }
    if (max_rent) {
      query = query.lte('rent_amount', parseFloat(max_rent));
    }

    // Filtros avanzados - Rango de depósito
    if (min_deposit) {
      query = query.gte('deposit_amount', parseFloat(min_deposit));
    }
    if (max_deposit) {
      query = query.lte('deposit_amount', parseFloat(max_deposit));
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      contracts: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error getting contracts:', err);
    return res.status(500).json({
      error: 'Error al obtener contratos',
      details: err.message
    });
  }
};

// Obtener contrato por ID con detalles completos
exports.getContractById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: contract, error } = await supabase
      .from('contracts')
      .select(`
        *,
        landlord:landlord_id(id, full_name, email, phone),
        tenant:tenant_id(id, full_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!contract) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    return res.status(200).json(contract);
  } catch (err) {
    console.error('Error getting contract:', err);
    return res.status(500).json({
      error: 'Error al obtener contrato',
      details: err.message
    });
  }
};

// Actualizar estado del contrato
exports.updateContractStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar estado
    const validStatuses = ['draft', 'pending_signatures', 'pending_deposit', 'active', 'expired', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Estado inválido. Debe ser: draft, pending_signatures, pending_deposit, active, expired, o cancelled'
      });
    }

    const { data, error } = await supabase
      .from('contracts')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: `Estado del contrato actualizado a ${translateContractStatus(status)}`,
      contract: data
    });
  } catch (err) {
    console.error('Error updating contract status:', err);
    return res.status(500).json({
      error: 'Error al actualizar estado del contrato',
      details: err.message
    });
  }
};

// Eliminar contrato (solo si está en draft o cancelled)
exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar estado del contrato antes de eliminar
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!contract) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    // Solo permitir eliminar contratos en draft o cancelled
    if (contract.status !== 'draft' && contract.status !== 'cancelled') {
      return res.status(400).json({
        error: 'Solo se pueden eliminar contratos en estado borrador o cancelado'
      });
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      message: 'Contrato eliminado exitosamente'
    });
  } catch (err) {
    console.error('Error deleting contract:', err);
    return res.status(500).json({
      error: 'Error al eliminar contrato',
      details: err.message
    });
  }
};

// ============================================
// DEPOSIT MANAGEMENT
// ============================================

// Obtener todos los depósitos con filtros y paginación
exports.getDeposits = async (req, res) => {
  try {
    const {
      status,
      outcome,
      search,
      page = 1,
      limit = 50,
      // Filtros avanzados
      min_amount,
      max_amount,
      has_proof,
      verified,
      released
    } = req.query;

    let query = supabase
      .from('deposits')
      .select(`
        id,
        amount,
        status,
        outcome,
        proof_url,
        payment_status,
        payment_method,
        tenant_share,
        landlord_share,
        verified_at,
        released_at,
        created_at,
        updated_at,
        contract:contract_id(
          id,
          rent_amount,
          start_date,
          end_date,
          landlord:landlord_id(id, full_name, email),
          tenant:tenant_id(id, full_name, email)
        ),
        submitted_by_profile:submitted_by(id, full_name, email),
        verified_by_profile:verified_by(id, full_name, email),
        released_by_profile:released_by(id, full_name, email)
      `, { count: 'exact' });

    // Filtros básicos
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (outcome && outcome !== 'all') {
      query = query.eq('outcome', outcome);
    }

    // Filtros avanzados - Rango de monto
    if (min_amount) {
      query = query.gte('amount', parseFloat(min_amount));
    }
    if (max_amount) {
      query = query.lte('amount', parseFloat(max_amount));
    }

    // Filtros avanzados - Tiene comprobante
    if (has_proof === 'true') {
      query = query.not('proof_url', 'is', null);
    } else if (has_proof === 'false') {
      query = query.is('proof_url', null);
    }

    // Filtros avanzados - Verificado
    if (verified === 'true') {
      query = query.not('verified_at', 'is', null);
    } else if (verified === 'false') {
      query = query.is('verified_at', null);
    }

    // Filtros avanzados - Liberado
    if (released === 'true') {
      query = query.not('released_at', 'is', null);
    } else if (released === 'false') {
      query = query.is('released_at', null);
    }

    // Búsqueda por inquilino o propietario
    if (search) {
      const { data: searchResults } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      if (searchResults && searchResults.length > 0) {
        const userIds = searchResults.map(u => u.id);

        // Buscar contratos que involucren a estos usuarios
        const { data: contractResults } = await supabase
          .from('contracts')
          .select('id')
          .or(`landlord_id.in.(${userIds.join(',')}),tenant_id.in.(${userIds.join(',')})`);

        if (contractResults && contractResults.length > 0) {
          const contractIds = contractResults.map(c => c.id);
          query = query.in('contract_id', contractIds);
        }
      }
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      deposits: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error getting deposits:', err);
    return res.status(500).json({
      error: 'Error al obtener depósitos',
      details: err.message
    });
  }
};

// Obtener depósito por ID con detalles completos
exports.getDepositById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deposit, error } = await supabase
      .from('deposits')
      .select(`
        *,
        contract:contract_id(
          *,
          landlord:landlord_id(id, full_name, email, phone),
          tenant:tenant_id(id, full_name, email, phone)
        ),
        submitted_by_profile:submitted_by(id, full_name, email),
        verified_by_profile:verified_by(id, full_name, email),
        released_by_profile:released_by(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!deposit) {
      return res.status(404).json({ error: 'Depósito no encontrado' });
    }

    return res.status(200).json(deposit);
  } catch (err) {
    console.error('Error getting deposit:', err);
    return res.status(500).json({
      error: 'Error al obtener depósito',
      details: err.message
    });
  }
};

// Actualizar estado del depósito
exports.updateDepositStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar estado
    const validStatuses = ['awaiting_verification', 'held', 'returned_to_tenant', 'returned_to_landlord', 'disputed', 'pending_payment'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Estado inválido'
      });
    }

    const { data, error } = await supabase
      .from('deposits')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Estado del depósito actualizado',
      deposit: data
    });
  } catch (err) {
    console.error('Error updating deposit status:', err);
    return res.status(500).json({
      error: 'Error al actualizar estado del depósito',
      details: err.message
    });
  }
};

// Verificar depósito (marcar como verificado por admin)
exports.verifyDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('deposits')
      .update({
        status: 'held',
        verified_by: req.user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Depósito verificado exitosamente',
      deposit: data
    });
  } catch (err) {
    console.error('Error verifying deposit:', err);
    return res.status(500).json({
      error: 'Error al verificar depósito',
      details: err.message
    });
  }
};

// Liberar depósito (decidir outcome y porcentajes)
exports.releaseDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, tenant_share, landlord_share, notes } = req.body;

    // Validar outcome
    const validOutcomes = ['undecided', 'return_to_tenant', 'return_to_landlord', 'split'];
    if (!outcome || !validOutcomes.includes(outcome)) {
      return res.status(400).json({
        error: 'Outcome inválido'
      });
    }

    // Validar porcentajes si es split
    if (outcome === 'split') {
      const tenantShareNum = parseFloat(tenant_share) || 0;
      const landlordShareNum = parseFloat(landlord_share) || 0;

      if (tenantShareNum + landlordShareNum !== 100) {
        return res.status(400).json({
          error: 'Los porcentajes deben sumar 100%'
        });
      }
    }

    // Determinar el nuevo status según el outcome
    let newStatus = 'held';
    if (outcome === 'return_to_tenant') {
      newStatus = 'returned_to_tenant';
    } else if (outcome === 'return_to_landlord') {
      newStatus = 'returned_to_landlord';
    } else if (outcome === 'split') {
      newStatus = 'held'; // Puede quedar en held hasta que se procese el split
    }

    const updateData = {
      outcome,
      status: newStatus,
      released_by: req.user.id,
      released_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (outcome === 'split') {
      updateData.tenant_share = tenant_share;
      updateData.landlord_share = landlord_share;
    } else {
      updateData.tenant_share = null;
      updateData.landlord_share = null;
    }

    const { data, error } = await supabase
      .from('deposits')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Depósito liberado exitosamente',
      deposit: data
    });
  } catch (err) {
    console.error('Error releasing deposit:', err);
    return res.status(500).json({
      error: 'Error al liberar depósito',
      details: err.message
    });
  }
};

// Agregar notas al depósito
exports.updateDepositNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data, error } = await supabase
      .from('deposits')
      .update({
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: 'Notas actualizadas',
      deposit: data
    });
  } catch (err) {
    console.error('Error updating deposit notes:', err);
    return res.status(500).json({
      error: 'Error al actualizar notas',
      details: err.message
    });
  }
};

// Helper para traducir status
function translateDepositStatus(status) {
  const translations = {
    awaiting_verification: 'Esperando verificación',
    held: 'Retenido',
    returned_to_tenant: 'Devuelto al inquilino',
    returned_to_landlord: 'Devuelto al propietario',
    disputed: 'En disputa',
    pending_payment: 'Pago pendiente'
  };
  return translations[status] || status;
}

// Helper para traducir outcome
function translateDepositOutcome(outcome) {
  const translations = {
    undecided: 'Sin decidir',
    return_to_tenant: 'Devolver al inquilino',
    return_to_landlord: 'Devolver al propietario',
    split: 'Dividir'
  };
  return translations[outcome] || outcome;
}

// ============================================
// SEARCH PROFILES MANAGEMENT
// ============================================

// Obtener todos los perfiles de búsqueda con filtros y paginación
exports.getSearchProfiles = async (req, res) => {
  try {
    const {
      status,
      visibility,
      search,
      page = 1,
      limit = 50,
      // Filtros avanzados
      min_budget,
      max_budget,
      property_type,
      min_rooms,
      max_rooms,
      min_bedrooms,
      max_bedrooms,
      furnished,
      pets_allowed,
      children
    } = req.query;

    let query = supabase
      .from('tenant_search_profiles')
      .select(`
        id,
        status,
        visibility,
        property_types,
        budget_min,
        budget_max,
        rooms_min,
        rooms_max,
        bedroom_min,
        bedroom_max,
        bathrooms_min,
        bathrooms_max,
        furnished,
        pets_allowed,
        children,
        lease_term_months,
        amenities,
        created_at,
        updated_at,
        tenant:tenant_id(id, full_name, email, phone)
      `, { count: 'exact' });

    // Filtros básicos
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (visibility && visibility !== 'all') {
      query = query.eq('visibility', visibility);
    }

    // Búsqueda por inquilino
    if (search) {
      const { data: searchResults } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

      if (searchResults && searchResults.length > 0) {
        const userIds = searchResults.map(u => u.id);
        query = query.in('tenant_id', userIds);
      }
    }

    // Filtros avanzados - Presupuesto
    if (min_budget) {
      query = query.gte('budget_min', parseFloat(min_budget));
    }
    if (max_budget) {
      query = query.lte('budget_max', parseFloat(max_budget));
    }

    // Filtros avanzados - Tipo de propiedad
    if (property_type && property_type !== 'all') {
      query = query.contains('property_types', [property_type]);
    }

    // Filtros avanzados - Habitaciones
    if (min_rooms) {
      query = query.gte('rooms_min', parseInt(min_rooms));
    }
    if (max_rooms) {
      query = query.lte('rooms_max', parseInt(max_rooms));
    }

    // Filtros avanzados - Dormitorios
    if (min_bedrooms) {
      query = query.gte('bedroom_min', parseInt(min_bedrooms));
    }
    if (max_bedrooms) {
      query = query.lte('bedroom_max', parseInt(max_bedrooms));
    }

    // Filtros avanzados - Amueblado
    if (furnished === 'true') {
      query = query.eq('furnished', true);
    } else if (furnished === 'false') {
      query = query.eq('furnished', false);
    }

    // Filtros avanzados - Mascotas
    if (pets_allowed === 'true') {
      query = query.eq('pets_allowed', true);
    } else if (pets_allowed === 'false') {
      query = query.eq('pets_allowed', false);
    }

    // Filtros avanzados - Niños
    if (children === 'true') {
      query = query.eq('children', true);
    } else if (children === 'false') {
      query = query.eq('children', false);
    }

    // Paginación
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error getting search profiles:', error);
      throw error;
    }

    return res.status(200).json({
      searchProfiles: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error getting search profiles:', err);
    return res.status(500).json({
      error: 'Error al obtener perfiles de búsqueda',
      details: err.message
    });
  }
};

// Obtener perfil de búsqueda por ID con detalles completos
exports.getSearchProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: searchProfile, error } = await supabase
      .from('tenant_search_profiles')
      .select(`
        *,
        tenant:tenant_id(id, full_name, email, phone, status, is_banned, created_at)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!searchProfile) {
      return res.status(404).json({ error: 'Perfil de búsqueda no encontrado' });
    }

    return res.status(200).json(searchProfile);
  } catch (err) {
    console.error('Error getting search profile:', err);
    return res.status(500).json({
      error: 'Error al obtener perfil de búsqueda',
      details: err.message
    });
  }
};

// Actualizar estado del perfil de búsqueda
exports.updateSearchProfileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validar estado
    const validStatuses = ['activo', 'pausado', 'archivado'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Estado inválido. Debe ser: activo, pausado, o archivado'
      });
    }

    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: `Estado del perfil actualizado a ${status}`,
      searchProfile: data
    });
  } catch (err) {
    console.error('Error updating search profile status:', err);
    return res.status(500).json({
      error: 'Error al actualizar estado del perfil',
      details: err.message
    });
  }
};

// Actualizar visibilidad del perfil de búsqueda
exports.updateSearchProfileVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    // Validar visibilidad
    const validVisibilities = ['publico', 'privado'];
    if (!visibility || !validVisibilities.includes(visibility)) {
      return res.status(400).json({
        error: 'Visibilidad inválida. Debe ser: publico o privado'
      });
    }

    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .update({
        visibility,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      message: `Visibilidad actualizada a ${visibility}`,
      searchProfile: data
    });
  } catch (err) {
    console.error('Error updating search profile visibility:', err);
    return res.status(500).json({
      error: 'Error al actualizar visibilidad del perfil',
      details: err.message
    });
  }
};

// Eliminar perfil de búsqueda
exports.deleteSearchProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tenant_search_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      message: 'Perfil de búsqueda eliminado exitosamente'
    });
  } catch (err) {
    console.error('Error deleting search profile:', err);
    return res.status(500).json({
      error: 'Error al eliminar perfil de búsqueda',
      details: err.message
    });
  }
};

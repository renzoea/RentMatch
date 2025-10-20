const supabase = require('../config/supabase');

const GetAllSearch = async (req, res) => {
  try {
    const { data, error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));
    
    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  } 
};

const FilterByType = async (req, res) => {
    try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .contains('property_types', [req.params.type])
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
    } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByRoomsRange = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .lte('rooms_min', req.params.max)
    .gte('rooms_max', req.params.min)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

const FilterByBedroomsRange = async (req, res) => {
  try {
    const min = Number(req.params.min);
    const max = Number(req.params.max);
    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .select(`
        *,
        profile:profiles(id, status, full_name, is_banned)
      `)
      .lte('bedroom_min', max)
      .gte('bedroom_max', min)
      .eq('status', 'activo')
      .eq('visibility', 'publico')
      .eq('is_banned', false);

    if (error) return res.status(400).json({ success:false, error: error.message });

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ success:true, data: flattenedData, count: flattenedData.length });
  } catch (error) { 
    res.status(500).json({ success:false, error:'Error interno del servidor' }); 
  }
};

const FilterByBathrooms = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .lte('bathrooms_min', req.params.max)
    .gte('bathrooms_max', req.params.min)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByPriceRange = async (req, res) => {
  try {
    const min = Number(req.params.min);
    const max = Number(req.params.max);
    const { data, error } = await supabase
      .from('tenant_search_profiles')
      .select(`
        *,
        profile:profiles(id, status, full_name, is_banned)
      `)
      .lte('budget_min', max)
      .gte('budget_max', min)
      .eq('status', 'activo')
      .eq('visibility', 'publico')
      .eq('is_banned', false);

    if (error) return res.status(400).json({ success:false, error: error.message });

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ success:true, data: flattenedData, count: flattenedData.length });
  } catch (error) { 
    res.status(500).json({ success:false, error:'Error interno del servidor' }); 
  }
};

const FilterByLeaseDuration = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('lease_term_months', req.params.duration)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterBychildren = async (req, res) => {
  try {
    const has_children = req.params.children === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('children', has_children)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByFurnished = async (req, res) => {
  try {
    const is_furnished = req.params.furnished === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('furnished', is_furnished)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByPets = async (req, res) => {
  try {
    const allows_pets = req.params.pets === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('pets_allowed', allows_pets)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {  
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));
 
    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByAmenities = async (req, res) => { 
  try {
    const amenities = req.params.amenities.split(',');
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .contains('amenities', amenities)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  } 
};

const FilterBySmoking = async (req, res) => {
  try {
    const allows_smoking = req.params.smoking === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('smokers_allowed', allows_smoking)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  } 
};

const FilterByCities = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('city', req.params.city)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByNeighborhood = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('neighborhood', req.params.neighborhood)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByBalcony = async (req, res) => {
  try {
    const has_balcony = req.params.balcony === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('balcony', has_balcony)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByTerrace = async (req, res) => {
  try {
    const has_terrace = req.params.terrace === 'true';  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('terrace', has_terrace)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  }catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FliterByOccupants = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('occupants', req.params.occupants)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByVerificatedUser = async (req, res) => {
  try {
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('require_verified_landlord', true)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByElevator = async (req, res) => {
  try {  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('elevator', true)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterBySecurity = async (req, res) => {
  try {  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('security', true)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  }catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByArea = async (req, res) => {
  try {  
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .lte('area_max', req.params.max)
    .gte('area_min', req.params.min)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByStudents = async (req, res) => {
  try {
    const are_students = req.params.students === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('students', are_students)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByParkingNeeded = async (req, res) => {
  try {
    const needs_parking = req.params.parking === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('parking_needed', needs_parking)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const FilterByLaundry = async (req, res) => {
  try {
    const has_laundry = req.params.laundry === 'true';
    const { data,error } = await supabase
    .from('tenant_search_profiles')
    .select(`
      *,
      profile:profiles(id, status, full_name, is_banned)
    `)
    .eq('laundry', has_laundry)
    .eq('status', 'activo')
    .eq('visibility', 'publico')
    .eq('is_banned', false);

    if (error) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }

    const flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    res.json({ 
      success: true, 
      data: flattenedData,
      count: flattenedData.length 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

const AdvancedSearch = async (req, res) => {
  try {
    console.log("Filtros recibidos del propietario:", req.body);
    const filters = req.body;

    let query = supabase
      .from('tenant_search_profiles')
      .select(`
        *,
        profile:profiles(id, status, full_name, email, phone, is_banned)
      `);

    if (filters.city && filters.city !== '') {
      query = query.eq('city', filters.city);
    }
    if (filters.neighborhood && filters.neighborhood !== '') {
      query = query.eq('neighborhood', filters.neighborhood);
    }

    if (filters.rent_cost !== undefined && filters.rent_cost !== null) {
      query = query
        .lte('budget_min', filters.rent_cost)
        .gte('budget_max', filters.rent_cost);
    }

    if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
      query = query
        .lte('bedroom_min', filters.bedrooms)
        .gte('bedroom_max', filters.bedrooms);
    }

    if (filters.rooms !== undefined && filters.rooms !== null) {
      query = query
        .lte('rooms_min', filters.rooms)
        .gte('rooms_max', filters.rooms);
    }

    if (filters.bathrooms !== undefined && filters.bathrooms !== null) {
      query = query
        .lte('bathrooms_min', filters.bathrooms)
        .gte('bathrooms_max', filters.bathrooms);
    }

    if (filters.area !== undefined && filters.area !== null) {
      query = query
        .lte('area_min', filters.area)
        .gte('area_max', filters.area);
    }

    if (filters.property_type && filters.property_type !== '' && filters.property_type !== 'todos') {
      query = query.contains('property_types', [filters.property_type]);
    }

    if (filters.furnished === true) {
      query = query.eq('furnished', true);
    }

    if (filters.pets_allowed === true) {
      query = query.eq('pets_allowed', true);
    }

    if (filters.smokers_allowed === true) {
      query = query.eq('smokers_allowed', true);
    }

    if (filters.children === true) {
      query = query.eq('children', true);
    }

    if (filters.students === true) {
      query = query.eq('students', true);
    }

    if (filters.parking_needed === true) {
      query = query.eq('parking_needed', true);
    }

    if (filters.balcony === true) {
      query = query.eq('balcony', true);
    }

    if (filters.terrace === true) {
      query = query.eq('terrace', true);
    }

    if (filters.laundry === true) {
      query = query.eq('laundry', true);
    }

    if (filters.elevator === true) {
      query = query.eq('elevator', true);
    }

    if (filters.security === true) {
      query = query.eq('security', true);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    if (filters.lease_term_months !== undefined && filters.lease_term_months !== null) {
      query = query.eq('lease_term_months', filters.lease_term_months);
    }

    if (filters.occupants !== undefined && filters.occupants !== null) {
      query = query.eq('occupants', filters.occupants);
    }

    query = query.eq('status', 'activo');
    query = query.eq('visibility', 'publico');
    query = query.eq('is_banned', false);

    const { data, error } = await query;

    if (error) {
      console.error("Error de Supabase:", error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    let flattenedData = data.map(item => ({
      ...item,
      full_name: item.profile?.full_name,
      email: item.profile?.email,
      phone: item.profile?.phone,
      profile_status: item.profile?.status,
      is_banned: item.profile?.is_banned
    }));

    // Filtrar por perfiles verificados si se solicita
    if (filters.only_verified === true) {
      flattenedData = flattenedData.filter(item => item.profile_status === 'verified');
    }

    console.log(`Resultados encontrados: ${flattenedData.length}`);

    res.json({
      success: true,
      data: flattenedData,
      count: flattenedData.length,
      filters_applied: Object.keys(filters).filter(k => filters[k] !== undefined && filters[k] !== null).length
    });

  } catch (error) {
    console.error("Error en AdvancedSearch:", error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = { 
  GetAllSearch,
  FilterByType,
  FilterByRoomsRange,
  FilterByBathrooms,
  FilterByPriceRange,
  FilterByLeaseDuration,
  FilterBychildren,
  FilterByFurnished,
  FilterByPets,
  FilterByAmenities,
  FilterBySmoking,
  FilterByBedroomsRange,
  FilterByCities,
  FilterByNeighborhood,
  FilterByBalcony,
  FilterByTerrace,
  FliterByOccupants,
  FilterByVerificatedUser,
  FilterBySecurity,
  FilterByElevator,
  FilterByArea,
  FilterByStudents,
  FilterByParkingNeeded,
  FilterByLaundry,
  AdvancedSearch
};
const supabase  = require('../config/supabase');

const getActiveRentals = async (req, res) => {
    const userId = req.user ? req.user.id : null; 

    if (!userId) {
        return res.status(401).json({ success: false, message: 'ID de usuario no encontrado después de la autenticación' });
    }

    try {
        // Primero obtener los contratos
        const { data: contracts, error: contractError } = await supabase
            .from('contracts')
            .select('*')
            .eq('tenant_id', userId) 
            .eq('status', 'active');
        
        if (contractError) {
            return res.status(400).json({ success: false, message: 'Error en la consulta de contratos', error: contractError.message });
        }

        // Obtener los IDs de las propiedades
        const propertyIds = contracts.map(c => c.property_id).filter(id => id);

        // Obtener las propiedades
        const { data: properties, error: propertyError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);

        if (propertyError) {
            return res.status(400).json({ success: false, message: 'Error en la consulta de propiedades', error: propertyError.message });
        }

        // Crear un mapa de propiedades por ID para acceso rápido
        const propertyMap = {};
        properties.forEach(prop => {
            propertyMap[prop.id] = prop;
        });
        
        // Combinar datos
        const processedData = contracts.map(contract => {
            const property = propertyMap[contract.property_id];
            
            return {
                contract_id: contract.id,
                property_id: contract.property_id,
                start_date: contract.start_date,
                end_date: contract.end_date,
                rent_amount: contract.rent_amount,
                status: contract.status,
                // Datos de la propiedad para la card
                address: property?.address_line || 'No especificada',
                city: property?.city || 'No especificada',
                neighborhood: property?.neighborhood || 'No especificado',
                property_type: property?.property_type || 'No especificado',
                rooms: property?.rooms || 0,
                bathrooms: property?.bathrooms || 0,
                furnished: property?.furnished || false,
                pets_allowed: property?.pets_allowed || false,
                amenities: property?.amenities || [],
                notes: property?.notes || ''
            };
        });
        
        res.json({ success: true, data: processedData });
        
    } catch (error) {
        res.status(500).json({success: false, message: 'error interno del servidor'});
    }
}

const getRentalHistory = async (req, res) => {
    const userId = req.user ? req.user.id : null; 

    if (!userId) {
        return res.status(401).json({ success: false, message: 'ID de usuario no encontrado después de la autenticación' });
    }

    try {
        // Primero obtener los contratos
        const { data: contracts, error: contractError } = await supabase
            .from('contracts')
            .select('*')
            .eq('tenant_id', userId)
            .neq('status', 'active');

        if (contractError) {
            return res.status(400).json({ success: false, error: contractError.message });
        }

        // Obtener los IDs de las propiedades
        const propertyIds = contracts.map(c => c.property_id).filter(id => id);

        // Obtener las propiedades
        const { data: properties, error: propertyError } = await supabase
            .from('properties')
            .select('*')
            .in('id', propertyIds);

        if (propertyError) {
            return res.status(400).json({ success: false, error: propertyError.message });
        }

        // Crear un mapa de propiedades por ID
        const propertyMap = {};
        properties.forEach(prop => {
            propertyMap[prop.id] = prop;
        });

        // Combinar datos
        const processedData = contracts.map(contract => {
            const property = propertyMap[contract.property_id];
            
            return {
                contract_id: contract.id,
                property_id: contract.property_id,
                start_date: contract.start_date,
                end_date: contract.end_date,
                rent_amount: contract.rent_amount,
                status: contract.status,
                // Datos de la propiedad para la card
                address: property?.address_line || 'No especificada',
                city: property?.city || 'No especificada',
                neighborhood: property?.neighborhood || 'No especificado',
                property_type: property?.property_type || 'No especificado',
                rooms: property?.rooms || 0,
                bathrooms: property?.bathrooms || 0,
                furnished: property?.furnished || false,
                pets_allowed: property?.pets_allowed || false,
                amenities: property?.amenities || [],
                notes: property?.notes || ''
            };
        });

        res.json({ success: true, data: processedData });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

module.exports = {    
    getActiveRentals,
    getRentalHistory
};
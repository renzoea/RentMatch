// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas de perfiles
const searchProfileRoutes = require('./src/routes/searchProfileRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Usar rutas
app.use('/api/search-profiles', searchProfileRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Ruta para probar conexión con Supabase
app.get('/test-db', async (req, res) => {
  try {
    const supabase = require('./src/config/supabase');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Conexión a Supabase exitosa',
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error conectando a Supabase',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
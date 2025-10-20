const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const CORS_ORIGINS = [
  FRONTEND,
  'https://rent-match-umber.vercel.app'
];

// parse JSON bodies
app.use(express.json());

// seguridad básica
app.use(helmet());

// rate limit simple (ajusta según necesites)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 120 // 120 requests por IP por minuto
});
app.use(limiter);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('CORS origin denied'));
  },
  credentials: true
}));

// Importar rutas de perfiles
const searchProfileRoutes = require('./src/routes/searchProfileRoutes');
const authRoutes = require('./src/routes/authRoutes');
const contractRoutes = require('./src/routes/contractRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const MobileRoutes = require('./src/routes/MobileRoutes');
const MobileUserRoutes = require('./src/routes/MobileProfileRoutes');
const filterSearchRoutes = require('./src/routes/FilterSearchRoutes');

// Usar rutas
app.use('/api/search-profiles', searchProfileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mobile-auth', MobileRoutes);
app.use('/api/mobile-user', MobileUserRoutes);
app.use('/api/filter-search', filterSearchRoutes);

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
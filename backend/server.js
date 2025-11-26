const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Habilitar trust proxy para que express-rate-limit funcione correctamente detrás de proxies (Render, Heroku, etc)
app.set('trust proxy', 1);

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const CORS_ORIGINS = [
  FRONTEND,
  'https://rent-match-umber.vercel.app'
];

// parse JSON bodies (aumentado para soportar imágenes base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Configurar Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    credentials: true
  }
});

// Hacer io accesible globalmente para los controllers
app.set('io', io);

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
  console.log('[WebSocket] Cliente conectado:', socket.id);

  // Unirse a una sala específica de sesión
  socket.on('join-session', (sessionToken) => {
    socket.join(sessionToken);
    console.log(`[WebSocket] Socket ${socket.id} unido a sesión ${sessionToken}`);
  });

  socket.on('disconnect', () => {
    console.log('[WebSocket] Cliente desconectado:', socket.id);
  });
});

// Importar rutas de perfiles
const searchProfileRoutes = require('./src/routes/searchProfileRoutes');
const authRoutes = require('./src/routes/authRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const contractRoutes = require('./src/routes/contractRoutes');
const depositRoutes = require('./src/routes/depositRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const MobileRoutes = require('./src/routes/MobileRoutes');
const MobileUserRoutes = require('./src/routes/MobileProfileRoutes');
const filterSearchRoutes = require('./src/routes/FilterSearchRoutes');
const MobileReporterRoutes = require('./src/routes/MobileReportRoutes');
const MobileInicialRoutes = require('./src/routes/MobileInicialRoutes');
const MobileEndRoutes = require('./src/routes/MobileEndRoutes');
const MobileExpertise = require('./src/routes/MobileExpertiseRoutes');
const verificationRoutes = require('./src/routes/verificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Usar rutas
app.use('/api/search-profiles', searchProfileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mobile-auth', MobileRoutes);
app.use('/api/mobile-user', MobileUserRoutes);
app.use('/api/filter-search', filterSearchRoutes);
app.use('/api/Mobile-Reporter', MobileReporterRoutes);
app.use('/api/mobile-Inicial', MobileInicialRoutes);
app.use('/api/mobile-End', MobileEndRoutes);
app.use('/api/mobile-Expertise', MobileExpertise);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);

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

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`WebSocket habilitado en puerto ${PORT}`);
});
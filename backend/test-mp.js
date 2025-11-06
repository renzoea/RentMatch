const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();

console.log('🧪 Probando conexión con Mercado Pago...\n');
console.log('Access Token:', process.env.MP_ACCESS_TOKEN?.substring(0, 20) + '...');
console.log('Token length:', process.env.MP_ACCESS_TOKEN?.length);
console.log('');

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preferenceApi = new Preference(client);

// Crear preferencia de prueba mínima
const preference = {
  items: [
    {
      title: 'Test',
      quantity: 1,
      unit_price: 100
    }
  ]
};

console.log('📝 Intentando crear preferencia de prueba...\n');

preferenceApi.create({ body: preference })
  .then(response => {
    console.log('✅ ¡ÉXITO! La conexión funciona correctamente');
    console.log('Preference ID:', response.id);
    console.log('Init Point:', response.init_point);
  })
  .catch(error => {
    console.log('❌ ERROR en la conexión');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    console.log('Details:', JSON.stringify(error, null, 2));
  });
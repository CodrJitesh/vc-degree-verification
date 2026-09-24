const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const universityRoutes = require('./routes/universityRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const holderRoutes = require('./routes/holderRoutes');
const verifierRoutes = require('./routes/verifierRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const privadoRoutes = require('./routes/privadoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// Iden3 wallet callback often posts raw JWZ as text/plain
app.use(
  '/api/privado/callback',
  express.text({ type: '*/*', limit: '2mb' })
);

app.use(express.json({ limit: '2mb' }));

app.use('/api/universities', universityRoutes);
app.use('/api/issuer', credentialRoutes);
app.use('/api/holder', holderRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/privado', privadoRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    privado: process.env.PRIVADO_ENABLED !== 'false',
    teammates: {
      B: 'university + issue',
      C: 'verifier stubs + schema',
      Jitesh: 'android holder + Privado spike',
    },
  });
});

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'VC Degree Verification API (B + C + Privado spike)',
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

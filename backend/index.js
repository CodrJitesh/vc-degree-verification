const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const universityRoutes = require('./routes/universityRoutes');
const credentialRoutes = require('./routes/credentialRoutes');
const holderRoutes = require('./routes/holderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/universities', universityRoutes);
app.use('/api/issuer', credentialRoutes);
app.use('/api/holder', holderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

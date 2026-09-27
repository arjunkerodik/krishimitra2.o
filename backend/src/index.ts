import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './cron/agmarknetSync'; // Import to start the cron job

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import path from 'path';
import farmerRoutes from './routes/farmer';
import mandiRoutes from './routes/mandi';
import priceRoutes from './routes/price';
import adminRoutes from './routes/admin';
import pharmacyRoutes from './routes/pharmacy';

// API Routes
app.use('/api/farmer', farmerRoutes);
app.use('/api/mandis', mandiRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Serve frontend in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import topicsRouter from './routes/topics.routes.js';
import formulasRouter from './routes/formulas.routes.js';
import simulationsRouter from './routes/simulations.routes.js';
import searchRouter from './routes/search.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/topics', topicsRouter);
app.use('/api/formulas', formulasRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/search', searchRouter);

// Base / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'PhysicsLab Mechanics Education API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint '${req.originalUrl}' não encontrado.`,
  });
});

app.listen(PORT, () => {
  console.log(`[API FÍSICA] Servidor Express executando com sucesso na porta ${PORT}`);
  console.log(`[API FÍSICA] Health check: http://localhost:${PORT}/api/health`);
});

export default app;

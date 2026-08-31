import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';

import { regionsRouter } from './routes/regions.js';
import { facilitiesRouter } from './routes/facilities.js';
import { evaluationsRouter } from './routes/evaluations.js';
import { predispositionRouter } from './routes/predisposition.js';
import { gameRouter } from './routes/game.js';
import { newsRouter } from './routes/news.js';
import { statsRouter } from './routes/stats.js';
import { notificationsRouter } from './routes/notifications.js';

async function startServer() {
  try {
    const db = await initDb();
    const app = express();
    const PORT = 3001;

    app.use(cors());
    app.use(express.json());

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Mount routes
    app.use('/api/regions', regionsRouter(db));
    app.use('/api/facilities', facilitiesRouter(db));
    app.use('/api/evaluations', evaluationsRouter(db));
    app.use('/api/predisposition', predispositionRouter(db));
    app.use('/api/game', gameRouter(db));
    app.use('/api/news', newsRouter());
    app.use('/api/stats', statsRouter(db));
    app.use('/api/notifications', notificationsRouter(db));

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Available routes:');
      console.log('  GET  /api/health');
      console.log('  GET  /api/stats');
      console.log('  GET  /api/regions');
      console.log('  GET  /api/regions/:id/details');
      console.log('  GET  /api/facilities');
      console.log('  POST /api/evaluations');
      console.log('  POST /api/predisposition/calculate');
      console.log('  GET  /api/game/questions');
      console.log('  POST /api/game/submit');
      console.log('  GET  /api/news');
      console.log('  POST /api/notifications/email');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createDiscoveriesRouter } from './routes/discoveries';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Database Pool Setup (PostgreSQL)
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
let dbPool: Pool | null = null;

if (databaseUrl) {
  dbPool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });
} else {
  console.log('[DB] No DATABASE_URL provided. Running in volatile in-memory mode.');
}

// Mount Telos Sci-Fi Discoveries & Save Router
app.use('/api', createDiscoveriesRouter(dbPool));

// Health Check
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  if (dbPool) {
    try {
      await dbPool.query('SELECT 1');
      dbStatus = 'connected (PostgreSQL)';
    } catch {
      dbStatus = 'error connecting';
    }
  }

  res.status(200).json({
    status: 'healthy',
    service: 'Telos: Infinite Horizon Cloud Engine',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[Telos Infinite Horizon Backend] Running on port ${PORT}`);
});

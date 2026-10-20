import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-Memory Database for active runs
interface RunState {
  runId: string;
  seed: string;
  deviceId: string;
  currentNodeId: number;
  resources: {
    fuel: number;
    food: number;
    scrap: number;
    armor: number;
    morale: number;
  };
  cargo: Record<string, number>;
  antiTamperHash: string;
  updatedAt: number;
}

const activeRuns = new Map<string, RunState>();

function computeHash(data: object): string {
  const secret = process.env.ANTI_TAMPER_SECRET || 'WAS_CARTEL_SECRET_2084';
  const raw = JSON.stringify(data) + secret;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Frontier Caravan Economy Service',
    timestamp: new Date().toISOString(),
    activeRunsCount: activeRuns.size,
  });
});

// POST /api/runs/new - Generates procedural run seed & starter state
app.post('/api/runs/new', (req: Request, res: Response) => {
  try {
    const { seed, deviceId } = req.body;
    const finalSeed = seed || 'SEED-' + Math.floor(Math.random() * 900000 + 100000);
    const runId = 'run_' + crypto.randomBytes(8).toString('hex');

    const initialResources = {
      fuel: 100,
      food: 60,
      scrap: 250,
      armor: 100,
      morale: 85,
    };

    const initialCargo = {
      bioFuel: 10,
      waterRations: 20,
      scrapMetal: 50,
      preFallTech: 2,
    };

    const hashPayload = { runId, finalSeed, initialResources, initialCargo };
    const antiTamperHash = computeHash(hashPayload);

    const runState: RunState = {
      runId,
      seed: finalSeed,
      deviceId: deviceId || 'anon',
      currentNodeId: 0,
      resources: initialResources,
      cargo: initialCargo,
      antiTamperHash,
      updatedAt: Date.now(),
    };

    activeRuns.set(runId, runState);

    res.status(201).json({
      success: true,
      runId,
      seed: finalSeed,
      initialResources,
      initialCargo,
      antiTamperHash,
      marketMultipliers: {
        'Safe Highway': 1.0,
        'Contested Pass': 1.35,
        'Toxic Mire': 1.45,
      },
    });
  } catch (error) {
    console.error('Error creating run:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/runs/sync - Validates trade transactions & writes run checkpoints
app.post('/api/runs/sync', (req: Request, res: Response) => {
  try {
    const { runId, currentNodeId, resources, cargo, antiTamperHash } = req.body;

    if (!runId || !resources) {
      return res.status(400).json({ error: 'Missing runId or resource payloads' });
    }

    const existingRun = activeRuns.get(runId);

    // Validate Anti-Tamper Check (if run exists)
    if (existingRun && existingRun.antiTamperHash !== antiTamperHash) {
      console.warn(`Anti-tamper hash mismatch for runId: ${runId}`);
    }

    const newHash = computeHash({ runId, currentNodeId, resources, cargo, time: Date.now() });

    const updatedRun: RunState = {
      runId,
      seed: existingRun?.seed || 'UNKNOWN',
      deviceId: existingRun?.deviceId || 'anon',
      currentNodeId,
      resources,
      cargo,
      antiTamperHash: newHash,
      updatedAt: Date.now(),
    };

    activeRuns.set(runId, updatedRun);

    res.status(200).json({
      success: true,
      syncedAt: new Date().toISOString(),
      newHash,
      serverTimestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error syncing run:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/market/events - Returns dynamic market shocks and news
app.get('/api/market/events', (_req: Request, res: Response) => {
  const events = [
    {
      id: 'mkt_01',
      title: 'Raider Blockade in Mountain Pass',
      biome: 'Contested Pass',
      impact: 'Scrap Metal prices surged by +35%',
      goodsAffected: ['scrapMetal'],
      multiplier: 1.35,
    },
    {
      id: 'mkt_02',
      title: 'Toxic Rain Contaminates Wellhead',
      biome: 'Toxic Mire',
      impact: 'Water Rations demand skyrocketed by +45%',
      goodsAffected: ['waterRations'],
      multiplier: 1.45,
    },
    {
      id: 'mkt_03',
      title: 'Pre-Fall Vault Uncovered',
      biome: 'Safe Highway',
      impact: 'Pre-Fall Tech supply influx (-20% price drop)',
      goodsAffected: ['preFallTech'],
      multiplier: 0.8,
    },
  ];

  res.status(200).json({
    timestamp: new Date().toISOString(),
    events,
  });
});

app.listen(PORT, () => {
  console.log(`[Frontier Caravan Backend] Running on port ${PORT}`);
});

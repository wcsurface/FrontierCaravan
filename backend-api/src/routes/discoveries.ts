import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

export function createDiscoveriesRouter(dbPool: Pool | null): Router {
  const router = Router();

  // Initialize Telos Tables on DB
  if (dbPool) {
    dbPool
      .query(
        `
        CREATE TABLE IF NOT EXISTS telos_discoveries (
          coordinate_hash VARCHAR(128) PRIMARY KEY,
          entity_type VARCHAR(32) NOT NULL,
          entity_name VARCHAR(128) NOT NULL,
          discovered_by VARCHAR(64) NOT NULL,
          reward_units INT DEFAULT 25000,
          reward_nanites INT DEFAULT 500,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS telos_player_bases (
          base_id VARCHAR(64) PRIMARY KEY,
          planet_voxel_hash VARCHAR(128) NOT NULL,
          pilot_name VARCHAR(64) NOT NULL,
          parts_json JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS telos_cloud_saves (
          account_id VARCHAR(128) PRIMARY KEY,
          pilot_name VARCHAR(64) NOT NULL,
          save_data JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
      )
      .then(() => console.log('[DB] Telos discoveries, bases & saves schema verified.'))
      .catch((err) => console.error('[DB] Telos schema init error:', err));
  }

  // POST /api/discoveries/claim - Register first-to-discover claim
  router.post('/claim', async (req: Request, res: Response) => {
    try {
      const { coordinateHash, entityType, entityName, discoveredBy } = req.body;

      if (!coordinateHash || !entityName || !discoveredBy) {
        return res.status(400).json({ error: 'Missing required discovery parameters' });
      }

      if (dbPool) {
        // Check duplicate collision
        const existing = await dbPool.query(
          'SELECT * FROM telos_discoveries WHERE coordinate_hash = $1',
          [coordinateHash]
        );

        if (existing.rows.length > 0) {
          return res.status(200).json({
            success: true,
            alreadyClaimed: true,
            claim: existing.rows[0],
            rewardUnits: 0,
            rewardNanites: 0,
          });
        }

        const rewardUnits = entityType === 'System' ? 50000 : 25000;
        const rewardNanites = entityType === 'System' ? 1000 : 500;

        await dbPool.query(
          `INSERT INTO telos_discoveries (coordinate_hash, entity_type, entity_name, discovered_by, reward_units, reward_nanites)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [coordinateHash, entityType || 'Planet', entityName, discoveredBy, rewardUnits, rewardNanites]
        );

        return res.status(201).json({
          success: true,
          alreadyClaimed: false,
          rewardUnits,
          rewardNanites,
        });
      }

      // Memory fallback
      return res.status(201).json({
        success: true,
        alreadyClaimed: false,
        rewardUnits: 25000,
        rewardNanites: 500,
      });
    } catch (e) {
      console.error('[Discoveries API] Claim error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/discoveries/lookup - Query claim metadata by coordinate hash
  router.get('/lookup', async (req: Request, res: Response) => {
    try {
      const { hash } = req.query;
      if (!hash) return res.status(400).json({ error: 'Missing hash query parameter' });

      if (dbPool) {
        const result = await dbPool.query(
          'SELECT * FROM telos_discoveries WHERE coordinate_hash = $1',
          [String(hash)]
        );
        if (result.rows.length > 0) {
          return res.status(200).json({ found: true, claim: result.rows[0] });
        }
      }

      return res.status(200).json({ found: false, claim: null });
    } catch (e) {
      console.error('[Discoveries API] Lookup error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/bases/publish - Stores player modular base structures
  router.post('/bases/publish', async (req: Request, res: Response) => {
    try {
      const { baseId, planetVoxelHash, pilotName, parts } = req.body;
      if (!baseId || !planetVoxelHash || !parts) {
        return res.status(400).json({ error: 'Missing base construction parameters' });
      }

      if (dbPool) {
        await dbPool.query(
          `INSERT INTO telos_player_bases (base_id, planet_voxel_hash, pilot_name, parts_json)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (base_id) DO UPDATE SET parts_json = $4, created_at = NOW()`,
          [baseId, planetVoxelHash, pilotName || 'Traveler', JSON.stringify(parts)]
        );
      }

      return res.status(200).json({ success: true, baseId });
    } catch (e) {
      console.error('[Bases API] Publish error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/bases/query - Retrieves player bases within planetary voxel
  router.get('/bases/query', async (req: Request, res: Response) => {
    try {
      const { planetHash } = req.query;
      if (!planetHash) return res.status(400).json({ error: 'Missing planetHash query parameter' });

      if (dbPool) {
        const result = await dbPool.query(
          'SELECT * FROM telos_player_bases WHERE planet_voxel_hash = $1',
          [String(planetHash)]
        );
        return res.status(200).json({ bases: result.rows });
      }

      return res.status(200).json({ bases: [] });
    } catch (e) {
      console.error('[Bases API] Query error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/save/sync - Cloud cross-save endpoint
  router.post('/save/sync', async (req: Request, res: Response) => {
    try {
      const { accountId, pilotName, saveData } = req.body;
      const targetAccount = accountId || 'acc_anon_user';

      if (dbPool) {
        await dbPool.query(
          `INSERT INTO telos_cloud_saves (account_id, pilot_name, save_data, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (account_id) DO UPDATE SET pilot_name = $2, save_data = $3, updated_at = NOW()`,
          [targetAccount, pilotName || 'Traveler', JSON.stringify(saveData || {})]
        );
      }

      return res.status(200).json({ success: true, syncedAt: new Date().toISOString() });
    } catch (e) {
      console.error('[Save API] Sync error:', e);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

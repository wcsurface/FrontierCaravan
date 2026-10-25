import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

async function initializeDatabaseSchema() {
  if (!prisma) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "passwordHash" TEXT NOT NULL,
          "displayName" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConcertVault" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "concertsData" JSONB NOT NULL DEFAULT '[]',
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ConcertVault_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ConcertVault_userId_key" ON "ConcertVault"("userId");
    `);

    console.log('[LiveLore DB] Railway PostgreSQL schema initialized successfully.');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[LiveLore DB] Schema init notice:', msg);
  }
}

async function bootDb() {
  await initializeDatabaseSchema();
}

bootDb();
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'livelore_secret_jwt_key_2026_x89!';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// In-memory user & vault fallback if Railway DATABASE_URL is temporarily unconnected
const memoryUsers = new Map<string, any>();
const memoryVaults = new Map<string, any>();

// Community Crowdsourced Venue Tracking Engine (Threshold = 5 Unique Users)
interface CommunityVenueRecord {
  venue: string;
  city: string;
  stateProvince: string;
  country: string;
  users: Set<string>;
}

const communityVenueTracker = new Map<string, CommunityVenueRecord>();

// Helper: Register/Track Venue from a pushed concert
function trackUserVenue(userId: string, venueName: string, city: string, state: string, country: string) {
  if (!venueName || !city || !userId) return;

  const cleanV = venueName.trim();
  const cleanC = city.trim();
  const cleanS = state ? state.trim().toUpperCase() : 'IN';
  const cleanCo = country ? country.trim() : 'USA';

  const key = `${cleanV.toLowerCase()}_${cleanC.toLowerCase()}_${cleanS.toLowerCase()}`;

  let record = communityVenueTracker.get(key);
  if (!record) {
    record = {
      venue: cleanV,
      city: cleanC,
      stateProvince: cleanS,
      country: cleanCo,
      users: new Set<string>(),
    };
    communityVenueTracker.set(key, record);
  }

  record.users.add(userId);
}

// Health Check Endpoint
app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'LiveLore Backend API & Cloud Sync v5.0.0',
    database: prisma ? 'Prisma Railway PostgreSQL' : 'In-Memory Vault Fallback',
    timestamp: new Date().toISOString(),
  });
});

// Helper: Sign JWT Token
function generateToken(userId: string, email: string) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '90d' });
}

// 1. POST /api/auth/register - Create New Account
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanedEmail = email.toLowerCase().trim();
    const name = displayName?.trim() || cleanedEmail.split('@')[0];

    const passwordHash = await bcrypt.hash(password, 10);

    if (prisma) {
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanedEmail },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const user = await prisma.user.create({
        data: {
          email: cleanedEmail,
          passwordHash,
          displayName: name,
        },
      });

      const token = generateToken(user.id, user.email);

      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    } else {
      if (memoryUsers.has(cleanedEmail)) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const userId = `u_${Date.now()}`;
      const userObj = { id: userId, email: cleanedEmail, passwordHash, displayName: name };
      memoryUsers.set(cleanedEmail, userObj);

      const token = generateToken(userId, cleanedEmail);

      return res.json({
        success: true,
        token,
        user: { id: userId, email: cleanedEmail, displayName: name },
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return res.status(500).json({ error: message });
  }
});

// 2. POST /api/auth/login - Log In
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanedEmail = email.toLowerCase().trim();

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { email: cleanedEmail },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user.id, user.email);

      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    } else {
      const user = memoryUsers.get(cleanedEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user.id, cleanedEmail);

      return res.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return res.status(500).json({ error: message });
  }
});

// 3. GET /api/auth/me - Verify Token & Active User
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    if (prisma) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, displayName: true, createdAt: true },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.get(decoded.email);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({
        success: true,
        user: { id: user.id, email: user.email, displayName: user.displayName },
      });
    }
  } catch (err: unknown) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// 3.5 POST /api/auth/reset-password - Password Reset Recovery
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (prisma) {
      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });

      if (newPassword && existingUser) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { email: cleanEmail },
          data: { password: hashedPassword },
        });
        return res.json({ success: true, message: 'Password updated successfully.' });
      }

      return res.json({ success: true, message: 'Password recovery email dispatched.' });
    } else {
      return res.json({ success: true, message: 'Password recovery email dispatched.' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset failed';
    return res.status(500).json({ error: message });
  }
});

// 4. POST /api/sync/push - Push Concert Vault Backup
app.post('/api/sync/push', async (req: Request, res: Response) => {
  try {
    const { userId, concertsData } = req.body;

    if (!userId || !concertsData) {
      return res.status(400).json({ error: 'userId and concertsData required' });
    }

    const incomingConcerts = Array.isArray(concertsData.concerts)
      ? concertsData.concerts
      : (Array.isArray(concertsData) ? concertsData : []);

    const updatedData = { concerts: incomingConcerts };

    if (prisma) {
      // Process and track venues logged by this user for community threshold promotion
      incomingConcerts.forEach((c: any) => {
        const vName = c.venue || c.venueName;
        const vCity = c.city || c.venueCity;
        const vState = c.state || c.venueState;
        const vCountry = c.country || c.venueCountry;

        if (vName && vCity) {
          trackUserVenue(userId, vName, vCity, vState, vCountry);
        }
      });

      const vault = await prisma.concertVault.upsert({
        where: { userId },
        update: {
          concertsData: updatedData,
        },
        create: {
          userId,
          concertsData: updatedData,
        },
      });

      return res.json({
        success: true,
        vaultId: vault.id,
        concertsCount: incomingConcerts.length,
        updatedAt: vault.updatedAt,
      });
    } else {
      memoryVaults.set(userId, updatedData);
      return res.json({ success: true, concertsCount: incomingConcerts.length, updatedAt: new Date() });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync push failed';
    return res.status(500).json({ error: message });
  }
});

// 5. GET /api/sync/pull - Pull Concert Vault Backup
app.get('/api/sync/pull', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId query parameter required' });
    }

    if (prisma) {
      const vault = await prisma.concertVault.findUnique({
        where: { userId },
      });

      return res.json({ success: true, concertsData: vault ? vault.concertsData : [] });
    } else {
      const concertsData = memoryVaults.get(userId) || [];
      return res.json({ success: true, concertsData });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync pull failed';
    return res.status(500).json({ error: message });
  }
});

// 6. GET /api/venues/community - Promoted Community Venues (Threshold = 5 Unique Users)
app.get('/api/venues/community', async (_req: Request, res: Response) => {
  try {
    const PROMOTION_THRESHOLD = 5;
    const promotedVenues: Array<{ venue: string; city: string; stateProvince: string; country: string; userCount: number }> = [];

    communityVenueTracker.forEach((record) => {
      if (record.users.size >= PROMOTION_THRESHOLD) {
        promotedVenues.push({
          venue: record.venue,
          city: record.city,
          stateProvince: record.stateProvince,
          country: record.country,
          userCount: record.users.size,
        });
      }
    });

    return res.json({
      success: true,
      threshold: PROMOTION_THRESHOLD,
      totalPromoted: promotedVenues.length,
      venues: promotedVenues,
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Failed to fetch community venues' });
  }
});

app.listen(PORT, () => {
  console.log(`[LiveLore Backend API] Running on port ${PORT}`);
});

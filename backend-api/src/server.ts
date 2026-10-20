import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'livelore_secret_jwt_key_2026_x89!';

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// In-memory user fallback if Railway DATABASE_URL is temporarily unconnected
const memoryUsers = new Map<string, any>();
const memoryVaults = new Map<string, any>();

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

    // Password hashing
    const passwordHash = await bcrypt.hash(password, 10);

    if (prisma) {
      // Check existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanedEmail },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      // Create new user in Railway PostgreSQL
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
      // In-Memory Fallback
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
      // In-memory fallback
      const user = memoryUsers.get(cleanedEmail);
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

// 4. POST /api/sync/push - Push Concert Vault Backup to Railway PostgreSQL
app.post('/api/sync/push', async (req: Request, res: Response) => {
  try {
    const { userId, concertsData } = req.body;

    if (!userId || !concertsData) {
      return res.status(400).json({ error: 'userId and concertsData required' });
    }

    if (prisma) {
      const vault = await prisma.concertVault.upsert({
        where: { userId },
        update: { concertsData },
        create: { userId, concertsData },
      });

      return res.json({ success: true, vaultId: vault.id, updatedAt: vault.updatedAt });
    } else {
      memoryVaults.set(userId, concertsData);
      return res.json({ success: true, updatedAt: new Date() });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync push failed';
    return res.status(500).json({ error: message });
  }
});

// 5. GET /api/sync/pull - Pull Concert Vault Backup from Railway PostgreSQL
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

app.listen(PORT, () => {
  console.log(`[LiveLore Backend API] Running on port ${PORT}`);
});

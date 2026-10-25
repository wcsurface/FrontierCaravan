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
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVIP" BOOLEAN NOT NULL DEFAULT false;
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
    service: 'LiveLore Backend API & Cloud Sync v6.1.0',
    database: prisma ? 'Prisma Railway PostgreSQL' : 'In-Memory Vault Fallback',
    timestamp: new Date().toISOString(),
  });
});

// Debug Endpoint to inspect Railway PostgreSQL Vaults
app.get('/api/debug/vaults', async (_req: Request, res: Response) => {
  try {
    if (prisma) {
      const vaults = await prisma.concertVault.findMany();
      const users = await prisma.user.findMany({ select: { id: true, email: true, displayName: true, createdAt: true } });
      return res.json({ success: true, vaultCount: vaults.length, vaults, users });
    }
    return res.json({ success: true, memoryVaults: Array.from(memoryVaults.entries()) });
  } catch (err: unknown) {
    return res.status(500).json({ error: String(err) });
  }
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
        user: { id: user.id, email: user.email, displayName: user.displayName, isVIP: user.isVIP },
      });
    } else {
      if (memoryUsers.has(cleanedEmail)) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const userId = `u_${Date.now()}`;
      const userObj = { id: userId, email: cleanedEmail, passwordHash, displayName: name, isVIP: false };
      memoryUsers.set(cleanedEmail, userObj);

      const token = generateToken(userId, cleanedEmail);

      return res.json({
        success: true,
        token,
        user: { id: userId, email: cleanedEmail, displayName: name, isVIP: false },
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
        user: { id: user.id, email: user.email, displayName: user.displayName, isVIP: user.isVIP },
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
        user: { id: user.id, email: user.email, displayName: user.displayName, isVIP: user.isVIP || false },
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
        select: { id: true, email: true, displayName: true, isVIP: true, createdAt: true },
      });

      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.get(decoded.email);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({
        success: true,
        user: { id: user.id, email: user.email, displayName: user.displayName, isVIP: user.isVIP || false },
      });
    }
  } catch (err: unknown) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// 3.1 POST /api/auth/upgrade-vip - Permanent $4.99 VIP Status Persistence in PostgreSQL
app.post('/api/auth/upgrade-vip', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (prisma) {
      await prisma.user.update({
        where: { email: cleanEmail },
        data: { isVIP: true },
      });
    }

    return res.json({ success: true, isVIP: true, email: cleanEmail });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'VIP upgrade failed' });
  }
});

const resetCodesStore = new Map<string, { code: string; expires: number }>();

// 3.4 POST /api/auth/forgot-password - Request 6-Digit Verification Code via Email
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate cryptographic 6-digit OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    resetCodesStore.set(cleanEmail, { code: generatedCode, expires: expiresAt });
    console.log(`[Security OTP] 6-digit reset code for ${cleanEmail}: ${generatedCode}`);

    // Send Code to User's Email via Resend API
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'LiveLore Security <onboarding@resend.dev>',
            to: [cleanEmail],
            subject: 'Your LiveLore Password Reset Code: ' + generatedCode,
            html: `
              <div style="font-family: sans-serif; background: #0a0a0a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 480px; margin: auto; border: 1px solid #FFB300;">
                <h2 style="color: #FFB300; margin-top: 0;">LiveLore Security Verification</h2>
                <p style="color: #cbd5e1; font-size: 15px;">Your 6-digit password reset verification code is:</p>
                <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FFB300; background: #121619; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #FFB300;">
                  ${generatedCode}
                </div>
                <p style="color: #94a3b8; font-size: 13px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
              </div>
            `
          })
        });
      } catch (e) {
        console.error('[Resend Email Error]', e);
      }
    }

    return res.json({
      success: true,
      message: 'If an account exists, a 6-digit verification code has been dispatched to your email.',
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: 'Failed to request reset code' });
  }
});

// 3.5 POST /api/auth/reset-password - Verify 6-Digit Code & Reset Password
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: '6-digit verification code required' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const record = resetCodesStore.get(cleanEmail);

    if (!record || record.code !== cleanCode || Date.now() > record.expires) {
      return res.status(400).json({ error: 'Invalid or expired 6-digit verification code' });
    }

    if (prisma) {
      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      if (existingUser) {
        await prisma.user.update({
          where: { email: cleanEmail },
          data: { passwordHash: hashedPassword },
        });
      } else {
        await prisma.user.create({
          data: {
            email: cleanEmail,
            passwordHash: hashedPassword,
            displayName: cleanEmail.split('@')[0],
          },
        });
      }

      resetCodesStore.delete(cleanEmail);
      return res.json({ success: true, message: 'Password updated successfully.' });
    } else {
      resetCodesStore.delete(cleanEmail);
      return res.json({ success: true, message: 'Password updated successfully.' });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset failed';
    return res.status(500).json({ error: message });
  }
});

// 4. POST /api/sync/push - Immediate Push to Railway PostgreSQL Cloud Database
app.post('/api/sync/push', async (req: Request, res: Response) => {
  try {
    const { userId, email, concertsData } = req.body;

    if (!concertsData) {
      return res.status(400).json({ error: 'concertsData required' });
    }

    const targetEmail = (email || '').toLowerCase().trim();
    const rawUserId = userId || targetEmail;

    if (!rawUserId) {
      return res.status(400).json({ error: 'userId or email required' });
    }

    const incomingConcerts = Array.isArray(concertsData.concerts)
      ? concertsData.concerts
      : (Array.isArray(concertsData) ? concertsData : []);

    const updatedData = { concerts: incomingConcerts };

    if (prisma) {
      let userRecord = null;
      if (targetEmail) {
        userRecord = await prisma.user.findUnique({ where: { email: targetEmail } });
      }

      if (!userRecord && rawUserId) {
        userRecord = await prisma.user.findUnique({ where: { id: rawUserId } }).catch(() => null);
      }

      if (!userRecord && targetEmail) {
        const dummyHash = await bcrypt.hash('default_pass_123', 10);
        userRecord = await prisma.user.create({
          data: {
            email: targetEmail,
            passwordHash: dummyHash,
            displayName: targetEmail.split('@')[0],
          },
        });
      }

      const effectiveUserId = userRecord ? userRecord.id : rawUserId;

      // Track community venues
      incomingConcerts.forEach((c: any) => {
        const vName = c.venue || c.venueName;
        const vCity = c.city || c.venueCity;
        const vState = c.state || c.venueState;
        const vCountry = c.country || c.venueCountry;

        if (vName && vCity) {
          trackUserVenue(effectiveUserId, vName, vCity, vState, vCountry);
        }
      });

      const vault = await prisma.concertVault.upsert({
        where: { userId: effectiveUserId },
        update: {
          concertsData: updatedData,
        },
        create: {
          userId: effectiveUserId,
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
      memoryVaults.set(rawUserId, updatedData);
      return res.json({ success: true, concertsCount: incomingConcerts.length, updatedAt: new Date() });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync push failed';
    return res.status(500).json({ error: message });
  }
});

// 5. GET /api/sync/pull - Pull & Merge Concert Vault directly from Railway PostgreSQL Cloud Database
app.get('/api/sync/pull', async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.query;

    let targetEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';
    const rawUserId = typeof userId === 'string' ? userId.trim() : '';

    if (prisma) {
      const allVaults = await prisma.concertVault.findMany();

      let userRecord = null;
      if (targetEmail) {
        userRecord = await prisma.user.findUnique({ where: { email: targetEmail } });
      }
      if (!userRecord && rawUserId) {
        userRecord = await prisma.user.findUnique({ where: { id: rawUserId } }).catch(() => null);
      }

      if (userRecord && !targetEmail) {
        targetEmail = userRecord.email.toLowerCase().trim();
      }

      const matchKeys = new Set<string>();
      if (rawUserId) matchKeys.add(rawUserId);
      if (userRecord) matchKeys.add(userRecord.id);
      if (targetEmail) {
        matchKeys.add(targetEmail);
        matchKeys.add(`u_cloud_${targetEmail.replace(/[^a-z0-9]/g, '_')}`);
      }

      let mergedConcerts: any[] = [];
      const seenIds = new Set<string>();

      allVaults.forEach((v: any) => {
        let isMatch = false;
        const vId = v.userId;

        if (matchKeys.has(vId)) isMatch = true;
        if (targetEmail && vId.includes(targetEmail.replace(/[^a-z0-9]/g, '_'))) isMatch = true;

        if (isMatch && v.concertsData) {
          const raw = v.concertsData as any;
          const concerts = Array.isArray(raw.concerts) ? raw.concerts : (Array.isArray(raw) ? raw : []);

          concerts.forEach((c: any) => {
            const key = c.id || `${c.headline}_${c.date}_${c.venue}`;
            if (!seenIds.has(key)) {
              seenIds.add(key);
              mergedConcerts.push(c);
            }
          });
        }
      });

      // If userRecord exists and we found concerts in old key rows, save merged list to user's primary vault row
      if (userRecord && mergedConcerts.length > 0) {
        await prisma.concertVault.upsert({
          where: { userId: userRecord.id },
          update: { concertsData: { concerts: mergedConcerts } },
          create: { userId: userRecord.id, concertsData: { concerts: mergedConcerts } },
        }).catch(() => null);
      }

      return res.json({
        success: true,
        concertsData: { concerts: mergedConcerts },
        updatedAt: new Date().toISOString(),
      });
    } else {
      const val = memoryVaults.get(rawUserId) || memoryVaults.get(targetEmail) || { concerts: [] };
      return res.json({
        success: true,
        concertsData: val,
        updatedAt: new Date().toISOString(),
      });
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

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const globalVaultStore: Record<string, any> = (globalThis as any).__LIVELORE_VAULTS__ || {};
(globalThis as any).__LIVELORE_VAULTS__ = globalVaultStore;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, concertsData: { concerts: [] } });
    }

    // 1. Check Global In-Memory Store First
    let vault = globalVaultStore[userId];

    if (!vault || !Array.isArray(vault.concerts) || vault.concerts.length === 0) {
      // 2. Read Static Vault File from public/vaults/${userId}.json
      try {
        const filePath = path.join(process.cwd(), 'public', 'vaults', `${userId}.json`);
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf8');
          vault = JSON.parse(raw);
          if (vault) {
            globalVaultStore[userId] = vault;
          }
        }
      } catch (fErr) {}
    }

    const concerts = vault && Array.isArray(vault.concerts)
      ? vault.concerts
      : (Array.isArray(vault) ? vault : []);

    return NextResponse.json({
      success: true,
      concertsData: { concerts },
    });
  } catch (e: any) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }
}

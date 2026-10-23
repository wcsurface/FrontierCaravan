import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VAULT_FILE_PATH = path.join('/tmp', 'livelore_cloud_vaults.json');

function loadVaultsFromDisk(): Record<string, any> {
  try {
    if (fs.existsSync(VAULT_FILE_PATH)) {
      const raw = fs.readFileSync(VAULT_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {};
}

function saveVaultsToDisk(vaults: Record<string, any>) {
  try {
    fs.writeFileSync(VAULT_FILE_PATH, JSON.stringify(vaults), 'utf-8');
  } catch (e) {}
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, concertsData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const vaults = loadVaultsFromDisk();
    vaults[userId] = concertsData;
    saveVaultsToDisk(vaults);

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync push failed' }, { status: 500 });
  }
}

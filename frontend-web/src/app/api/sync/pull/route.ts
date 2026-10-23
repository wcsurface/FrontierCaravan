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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }

  const vaults = loadVaultsFromDisk();
  const userVault = vaults[userId] || { concerts: [] };

  return NextResponse.json({
    success: true,
    concertsData: userVault,
  });
}

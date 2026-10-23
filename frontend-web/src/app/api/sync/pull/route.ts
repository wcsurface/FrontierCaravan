import { NextRequest, NextResponse } from 'next/server';

// Persistent Multi-Tenant Cloud Vault Map (Key: userId -> Value: { concerts: [...] })
const globalCloudVaults = new Map<string, any>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }

  // Multi-tenant vault lookup: Every user gets their own clean cloud vault!
  const userVault = globalCloudVaults.get(userId) || { concerts: [] };

  return NextResponse.json({
    success: true,
    concertsData: userVault,
  });
}

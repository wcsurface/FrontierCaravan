import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY_BACKEND_URL = 'https://frontiercaravan-production.up.railway.app';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = `${RAILWAY_BACKEND_URL}/api/sync/pull?${searchParams.toString()}`;

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Sync pull failed' }, { status: 500 });
  }
}

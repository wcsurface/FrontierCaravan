import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY_BACKEND_URL = 'https://frontiercaravan-production.up.railway.app';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';

    const res = await fetch(`${RAILWAY_BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': authHeader },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Auth failed' }, { status: 401 });
  }
}

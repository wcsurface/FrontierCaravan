import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY_BACKEND_URL = 'https://frontiercaravan-production.up.railway.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${RAILWAY_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Registration failed' }, { status: 500 });
  }
}

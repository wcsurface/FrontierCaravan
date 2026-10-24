import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CLOUD_STORAGE_API = 'https://api.restful-api.dev/objects';

async function findObjectByUserId(userId: string): Promise<string | null> {
  try {
    const res = await fetch(CLOUD_STORAGE_API, { cache: 'no-store' });
    if (!res.ok) return null;
    const items = await res.json();
    if (Array.isArray(items)) {
      const match = items.find((item: any) => item && item.name === userId);
      if (match && match.id) return match.id;
    }
  } catch (e) {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, concertsData } = body;

    if (!userId || !concertsData) {
      return NextResponse.json({ error: 'userId and concertsData required' }, { status: 400 });
    }

    const existingId = await findObjectByUserId(userId);

    if (existingId) {
      const putRes = await fetch(`${CLOUD_STORAGE_API}/${existingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userId, data: concertsData }),
      });
      const data = await putRes.json();
      return NextResponse.json({
        success: true,
        updatedAt: data?.updatedAt || new Date().toISOString(),
        concertCount: concertsData?.concerts?.length || 0,
      });
    } else {
      const postRes = await fetch(CLOUD_STORAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userId, data: concertsData }),
      });
      const data = await postRes.json();
      return NextResponse.json({
        success: true,
        updatedAt: data?.createdAt || new Date().toISOString(),
        concertCount: concertsData?.concerts?.length || 0,
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync push failed' }, { status: 500 });
  }
}

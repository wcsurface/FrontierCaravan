import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CLOUD_STORAGE_API = 'https://api.restful-api.dev/objects';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, concertsData: { concerts: [] } });
    }

    const res = await fetch(CLOUD_STORAGE_API, { cache: 'no-store' });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        const match = items.find((item: any) => item && item.name === userId);
        if (match && match.data) {
          return NextResponse.json({
            success: true,
            concertsData: match.data,
          });
        }
      }
    }

    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  } catch (e: any) {
    return NextResponse.json({ success: true, concertsData: { concerts: [] } });
  }
}

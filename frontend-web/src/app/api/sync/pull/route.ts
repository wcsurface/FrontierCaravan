import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RAILWAY_API = 'https://frontiercaravan-production.up.railway.app/api/sync/pull';
const CLOUD_STORAGE_API = 'https://api.restful-api.dev/objects';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: true, concertsData: { concerts: [] } });
    }

    // 1. Query Railway Production Database First
    try {
      const railwayRes = await fetch(`${RAILWAY_API}?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' });
      if (railwayRes.ok) {
        const rData = await railwayRes.json();
        if (rData && rData.concertsData) {
          const concerts = Array.isArray(rData.concertsData.concerts)
            ? rData.concertsData.concerts
            : (Array.isArray(rData.concertsData) ? rData.concertsData : []);
          if (concerts.length > 0) {
            return NextResponse.json({ success: true, concertsData: { concerts } });
          }
        }
      }
    } catch (rErr) {}

    // 2. Query Cloud Object Storage Fallback
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

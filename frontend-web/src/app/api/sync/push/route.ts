import { NextRequest, NextResponse } from 'next/server';

const globalCloudVaults = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, concertsData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    globalCloudVaults.set(userId, concertsData);

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sync push failed' }, { status: 500 });
  }
}

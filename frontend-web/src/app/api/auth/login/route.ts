import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const cleanedEmail = (email || 'user@livelore.com').toLowerCase().trim();
    const userId = `u_cloud_${cleanedEmail.replace(/[^a-z0-9]/g, '_')}`;

    return NextResponse.json({
      success: true,
      token: `jwt_livelore_token_${Date.now()}`,
      user: {
        id: userId,
        email: cleanedEmail,
        displayName: cleanedEmail.split('@')[0].toUpperCase(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Login failed' }, { status: 500 });
  }
}

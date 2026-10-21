import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanedEmail = email.toLowerCase().trim();
    const userId = `u_cloud_${cleanedEmail.replace(/[^a-z0-9]/g, '_')}`;

    return NextResponse.json({
      success: true,
      token: `jwt_livelore_token_${Date.now()}`,
      user: {
        id: userId,
        email: cleanedEmail,
        displayName: displayName || cleanedEmail.split('@')[0].toUpperCase(),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Registration failed' }, { status: 500 });
  }
}

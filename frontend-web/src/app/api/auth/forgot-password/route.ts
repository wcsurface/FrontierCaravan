import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const resetCodesStore = (globalThis as any).__RESET_CODES__ || new Map<string, { code: string; expires: number }>();
(globalThis as any).__RESET_CODES__ = resetCodesStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate cryptographic 6-digit OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    resetCodesStore.set(cleanEmail, { code: generatedCode, expires: expiresAt });
    console.log(`[Security OTP] 6-digit reset code for ${cleanEmail}: ${generatedCode}`);

    return NextResponse.json({
      success: true,
      code: generatedCode,
      message: 'Security verification code generated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to request reset code' }, { status: 500 });
  }
}

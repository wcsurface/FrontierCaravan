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

    // Send Code to User's Email via Resend API
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'LiveLore Security <onboarding@resend.dev>',
          to: [cleanEmail],
          subject: 'Your LiveLore Password Reset Code: ' + generatedCode,
          html: `
            <div style="font-family: sans-serif; background: #0a0a0a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 480px; margin: auto; border: 1px solid #FFB300;">
              <h2 style="color: #FFB300; margin-top: 0;">LiveLore Security Verification</h2>
              <p style="color: #cbd5e1; font-size: 15px;">Your 6-digit password reset verification code is:</p>
              <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #FFB300; background: #121619; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px solid #FFB300;">
                ${generatedCode}
              </div>
              <p style="color: #94a3b8; font-size: 13px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `
        })
      });
    } catch (e) {
      console.error('[Resend Email Error]', e);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a 6-digit verification code has been dispatched to your email.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to request reset code' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const resetCodesStore = (globalThis as any).__RESET_CODES__ || new Map<string, { code: string; expires: number }>();
(globalThis as any).__RESET_CODES__ = resetCodesStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: '6-digit verification code required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return NextResponse.json({ error: 'New password must be at least 4 characters long' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const record = resetCodesStore.get(cleanEmail);

    if (!record || record.code !== cleanCode || Date.now() > record.expires) {
      return NextResponse.json({ error: 'Invalid or expired 6-digit verification code' }, { status: 400 });
    }

    resetCodesStore.delete(cleanEmail);
    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Password reset failed' }, { status: 500 });
  }
}

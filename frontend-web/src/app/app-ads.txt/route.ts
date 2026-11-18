import { NextResponse } from 'next/server';

export async function GET() {
  const content = 'google.com, pub-8950953113865975, DIRECT, f08c47fec0942fa0\n';
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

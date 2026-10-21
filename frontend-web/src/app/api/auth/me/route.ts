import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    user: {
      id: 'u_cloud_livelore_fan',
      email: 'fan@livelore.com',
      displayName: 'LIVELORE FAN',
    },
  });
}

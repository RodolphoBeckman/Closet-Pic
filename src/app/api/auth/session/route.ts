
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (session) {
      return NextResponse.json({ isAuthenticated: true, user: session.user });
    }
    return NextResponse.json({ isAuthenticated: false });
  } catch (error) {
    return NextResponse.json({ isAuthenticated: false, error: 'Failed to get session' }, { status: 500 });
  }
}

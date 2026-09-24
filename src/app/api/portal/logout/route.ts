import { NextResponse } from 'next/server';
import { PORTAL_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(PORTAL_COOKIE_NAME);
  return response;
}

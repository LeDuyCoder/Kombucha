import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyKitchenSession, COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Protect /kitchen path
  if (url.pathname === '/kitchen' || url.pathname.startsWith('/kitchen/')) {
    // Skip protection for the login page itself and API routes inside it
    if (url.pathname === '/kitchen/login' || url.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      url.pathname = '/kitchen/login';
      return NextResponse.redirect(url);
    }

    const isValid = await verifyKitchenSession(token);
    if (!isValid) {
      // Token exists but invalid/expired, redirect to login
      url.pathname = '/kitchen/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/kitchen/:path*', '/kitchen'],
};

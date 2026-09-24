import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyKitchenSession, verifyPortalSession, COOKIE_NAME, PORTAL_COOKIE_NAME } from '@/lib/auth';

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
      url.pathname = '/kitchen/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Protect /admin path
  if (url.pathname.startsWith('/admin')) {
    const portalToken = req.cookies.get(PORTAL_COOKIE_NAME)?.value;

    if (!portalToken) {
      url.pathname = '/';
      url.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const isValid = await verifyPortalSession(portalToken);
    if (!isValid) {
      url.pathname = '/';
      url.searchParams.set('redirect', req.nextUrl.pathname);
      const response = NextResponse.redirect(url);
      response.cookies.delete(PORTAL_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/kitchen/:path*', '/kitchen', '/admin/:path*'],
};

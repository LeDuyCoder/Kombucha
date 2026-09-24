import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyKitchenSession, COOKIE_NAME } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Public paths that do not require PIN authentication
  const isPublicPath = 
    url.pathname === '/login' ||
    url.pathname.startsWith('/order') || 
    url.pathname.startsWith('/api') || 
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.'); // Static files like favicon, images

  if (!isPublicPath) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      url.pathname = '/login';
      if (req.nextUrl.pathname !== '/') {
        url.searchParams.set('redirect', req.nextUrl.pathname);
      }
      return NextResponse.redirect(url);
    }

    const isValid = await verifyKitchenSession(token);
    if (!isValid) {
      // Token exists but invalid/expired, redirect to login
      url.pathname = '/login';
      if (req.nextUrl.pathname !== '/') {
        url.searchParams.set('redirect', req.nextUrl.pathname);
      }
      const response = NextResponse.redirect(url);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

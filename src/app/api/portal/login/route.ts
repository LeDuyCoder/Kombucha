import { NextRequest, NextResponse } from 'next/server';
import { verifyPortalPassword, createPortalSession, PORTAL_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 });
    }

    if (!verifyPortalPassword(password)) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
    }

    // Issue JWT token (7 days)
    const token = await createPortalSession();

    const response = NextResponse.json({ success: true });
    response.cookies.set(PORTAL_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Portal login error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

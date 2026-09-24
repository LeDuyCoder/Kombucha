import { NextRequest, NextResponse } from 'next/server';
import { verifyKitchenPin, createKitchenSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'Vui lòng nhập mã PIN' }, { status: 400 });
    }

    if (!verifyKitchenPin(pin.trim())) {
      return NextResponse.json({ error: 'Mã PIN không đúng' }, { status: 401 });
    }

    // Issue JWT token
    const token = await createKitchenSession();

    // Set HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Kitchen login error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

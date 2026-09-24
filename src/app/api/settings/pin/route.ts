import { NextRequest, NextResponse } from 'next/server';
import { getKitchenPin, setKitchenPin } from '@/lib/auth';

export async function GET() {
  try {
    const pin = await getKitchenPin();
    return NextResponse.json({ pin });
  } catch (error) {
    console.error('Get PIN error:', error);
    return NextResponse.json({ error: 'Lỗi lấy mã PIN' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'Mã PIN không hợp lệ' }, { status: 400 });
    }

    const trimmed = pin.trim();
    if (trimmed.length < 4 || trimmed.length > 8) {
      return NextResponse.json({ error: 'Mã PIN nên từ 4 đến 8 ký tự' }, { status: 400 });
    }

    await setKitchenPin(trimmed);

    return NextResponse.json({
      success: true,
      message: 'Cập nhật mã PIN thành công',
      pin: trimmed,
    });
  } catch (error) {
    console.error('Update PIN error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi cập nhật mã PIN' }, { status: 500 });
  }
}

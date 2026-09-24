# 🍹 Website Order Món – QR Table + Session + Kitchen Realtime

Hệ thống đặt món bằng mã QR tại bàn cho quán cafe/quán ăn với **Màn hình Bếp (Kitchen Dashboard) Realtime** tức thì và quản lý Session không cần đăng nhập.

---

## 🚀 Tính Năng Chính

1. **Khách Đặt Món Tại Bàn (`/order?table=5`)**:
   - Quét mã QR nhận diện số bàn và phiên làm việc (Session).
   - Tự động duy trì `sessionId` suốt phiên, khách có thể gửi nhiều đợt order (Order #001, Order #002...).
   - Xem menu danh mục (Kombucha, Trà hoa quả), tuỳ chỉnh số lượng (+/-) và ghi chú ("Ít đá, ít ngọt").
   - Xem giỏ hàng & bấm **Gửi Order**.
   - **Theo dõi trạng thái realtime**: Đang chờ (`WAITING`) ➔ Đang làm (`PREPARING`) ➔ Sẵn sàng (`READY`) ➔ Hoàn thành (`COMPLETED`).

2. **Màn Hình Bếp / Quầy Bar Realtime (`/kitchen`)**:
   - Giao diện dạng **Kanban Board** 4 cột tối ưu cho iPad / Màn hình cảm ứng.
   - **Âm thanh thông báo tự động (Ding-dong chime)** ngay khi có order mới gửi xuống.
   - Chuyển trạng thái đơn chỉ với 1 click (`[Bắt đầu làm]`, `[Món đã xong]`, `[Đã phục vụ]`).
   - Cập nhật Realtime qua Supabase mà không cần reload trang.

3. **Quản Lý Bàn & Mã QR (`/admin/tables`)**:
   - Danh sách bàn từ Bàn 01 đến Bàn 05 (và thêm mới linh hoạt).
   - Tạo mã QR tức thì cho từng bàn.
   - Xem trước và in thẻ QR Card để bàn tiện lợi.

4. **Quản Lý Menu Món (`/admin/menu`)**:
   - Bật / tắt nhanh trạng thái **Còn món / Hết món**.
   - Menu tự động đồng bộ sang trang khách hàng.

5. **Bảo Mật & Toàn Vẹn Dữ Liệu**:
   - Giá tiền được tính toán trực tiếp từ cơ sở dữ liệu trên Server (Backend), client chỉ gửi `menu_item_id + quantity`.

---

## 🛠️ Cài Đặt & Chạy Local

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường Supabase
Tạo file `.env.local` ở thư mục gốc:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

*(Lưu ý: Nếu chưa cấu hình Supabase, hệ thống sẽ tự động chạy ở chế độ Mock In-Memory để bạn có thể test giao diện ngay lập tức!)*

### 3. Cài đặt Cơ Sở Dữ Liệu trên Supabase (1-Click SQL)
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) ➔ Tạo dự án mới.
2. Vào mục **SQL Editor** ➔ Tạo New Query.
3. Mở file [supabase-schema.sql](file:///E:/Project%20SWP/OrderMenu/supabase-schema.sql), sao chép toàn bộ nội dung và bấm **Run**.
4. Script sẽ tự động tạo bảng, thiết lập Realtime cho bảng `orders`, tạo chính sách RLS và nạp sẵn 12 món nước cùng 5 bàn.

### 4. Chạy ứng dụng Next.js
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

---

## 📱 Kịch Bản Kiểm Thử (Test Scenario)

1. **Khách hàng**:
   - Mở tab ẩn danh hoặc trình duyệt: `http://localhost:3000/order?table=5`
   - Chọn: `2x Kombucha Đào` + `1x Trà Hibiscus` + Ghi chú: *"Ít đá"*.
   - Bấm **Gửi Order**.
2. **Màn hình Bếp**:
   - Mở một cửa sổ trình duyệt khác: `http://localhost:3000/kitchen`
   - Bếp sẽ phát chuông thông báo và hiển thị thẻ order mới tại cột **CHỜ TIẾP NHẬN**.
3. **Cập nhật Realtime**:
   - Tại màn hình bếp, bấm **[Bắt đầu làm]**.
   - Khách hàng trên tab 1 sẽ thấy trạng thái đơn chuyển sang **Đang chuẩn bị** ngay lập tức mà không cần reload trang!
   - Bếp bấm **[Món đã xong]** ➔ Khách thấy **Món đã sẵn sàng**.
   - Khách tiếp tục bấm gọi thêm `1x Kombucha Vải` ➔ Thuộc cùng phiên `SESSION_...` của Bàn 5.

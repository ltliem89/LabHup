# LAB HUB V2 — MASTER SPEC
Version: 2.0
Architecture: Vercel + React/PWA → Google Apps Script API → Google Sheets + Google Drive

## 1. Mục tiêu
Xây dựng hệ thống quản lý phòng thí nghiệm quy mô nhỏ cho giáo viên:
- 4 phòng: Vật lí, Hóa–Sinh, STEM, Robotics.
- Theo dõi tồn kho và số lượng đang mượn theo thời gian.
- Mượn/trả có nhật ký, thời gian, người mượn/người nhận/người kiểm soát.
- Thêm/sửa dữ liệu bằng form và import Excel đúng mẫu.
- Import bắt buộc: upload → validate → preview → admin duyệt → commit.
- Có phân quyền TEACHER/ADMIN.
- Có khóa dữ liệu theo ngày và cơ chế ADMIN mở khóa có lý do.
- Giáo viên chỉ xem/xuất dữ liệu của chính mình.
- Admin xem toàn hệ thống.

## 2. Nguyên tắc bất biến
1. Google Sheets là persistence layer; không lưu dữ liệu nghiệp vụ chỉ trong React state.
2. Apps Script là API + business logic; frontend không tự quyết định tồn kho.
3. Equipment thuộc INVENTORY, không thuộc riêng Lesson.
4. Topic/Chapter ↔ Equipment qua bảng mapping.
5. Lesson chỉ là teaching context của borrow record.
6. Tồn khả dụng phải tính từ giao dịch và trạng thái khóa/bảo trì/mất/hỏng.
7. Không xóa lịch sử giao dịch.
8. Import thiếu dòng không được tự động xóa dữ liệu master.
9. Mọi mutation quan trọng phải audit.
10. Borrow/Return phải idempotent và chống race condition.
11. Server-side authorization bắt buộc.
12. Không đoán bài học hoặc thiết bị.

## 3. Công thức tồn kho
available = total_quantity - active_borrowed_quantity - blocked_quantity

Trong đó blocked gồm MAINTENANCE, LOST, DAMAGED hoặc các trạng thái bị khóa tương ứng.

## 4. Luồng chính
LOGIN → ROOM → SUBJECT+CLASS → TOPIC → LESSON → EQUIPMENT → BORROW CONFIRM → RECEIPT → RETURN

## 5. Tiêu chí hoàn thành V2
Không được coi là production-ready nếu:
- reload mất dữ liệu;
- hai người có thể cùng mượn vượt tồn;
- teacher có thể đọc/sửa dữ liệu teacher khác;
- import có thể ghi thẳng mà không preview/duyệt;
- return không cập nhật tồn server-side;
- không có audit;
- không có cơ chế khóa sau ngày mượn.

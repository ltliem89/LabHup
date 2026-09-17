# LAB HUB V2.1 — Apps Script

## 1. Spreadsheet
Đã cấu hình sẵn:

`10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0`

## 2. Cài đặt
1. Mở Apps Script project đang dùng cho LAB HUB.
2. Thay toàn bộ Code.gs bằng file `Code.gs`.
3. Save.
4. Chạy hàm `setupLabHub()` một lần.
5. Cấp quyền Google.
6. Kiểm tra các tab được tạo.
7. Điền bảng TEACHERS.
8. Điền TEACHER_ROOMS.
9. Deploy → New deployment → Web app.

## 3. Test API

Mở URL `/exec?action=health`.

Kết quả phải có:
- ok=true
- code=SUCCESS
- status=READY
- đúng spreadsheet_id.

## 4. Lưu ý xác thực
Code không hard-code email giáo viên.
Apps Script phải nhận diện được Google account qua Session.getActiveUser().getEmail().
Nếu trả IDENTITY_UNAVAILABLE thì cần chỉnh cấu hình deployment/domain/account trước khi nối Vercel.

## 5. Setup tự động
`setupLabHub()` tạo/kiểm tra:
ROOMS
SUBJECTS
CLASSES
TOPICS
LESSONS
EQUIPMENT
TOPIC_EQUIPMENT
TEACHERS
TEACHER_ROOMS
BORROW_RECORDS
BORROW_ITEMS
IMPORT_BATCHES
IMPORT_ERRORS
AUDIT_LOG
REPORT_REQUESTS
CONFIG

## 6. API
GET:
- health
- bootstrap
- inventory (ADMIN)
- my-borrows
- borrow-detail
- admin-borrows (ADMIN)
- teachers (ADMIN)
- admin-bootstrap (ADMIN)
- import-status (ADMIN)

POST:
- borrow
- return
- admin-create-equipment
- admin-update-equipment
- admin-create-topic
- admin-create-lesson
- admin-update-user
- admin-set-room-permission
- admin-unlock
- import-validate
- import-approve
- report

## 7. Quan trọng
Đây là backend V2.1. Frontend LabHup phải gọi API thay vì tự sửa inventory trong React state.

`available_quantity` được tính:
total_quantity - borrowed_quantity - blocked_quantity

Borrow có LockService + client_request_id.
Return có LockService.
Lịch sử không bị xóa.
Qua ngày không tự trả.
Teacher không được xem record của teacher khác.
Admin unlock bắt buộc có reason.
Import phải validate trước rồi mới approve/commit.

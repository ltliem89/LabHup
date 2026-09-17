# UI/UX CONTRACT V2

## Teacher
- Home chỉ hiển thị phòng được cấp quyền.
- Sau khi chọn phòng, ẩn các phòng khác.
- Subject + Class cùng một bước.
- Topic/Chapter → Lesson.
- Equipment là danh sách 1 cột trên mobile.
- Item hết tồn: disabled.
- Nút `XÁC NHẬN MƯỢN` cố định cuối màn hình, chỉ active khi có item.
- Context phía trên thu gọn dần.
- Back phải giữ state.
- Không hiển thị tên giáo viên khác trong màn hình teacher.

## Receipt
Hiển thị:
- borrow_id
- người mượn
- người nhận
- phòng
- môn
- lớp
- chương/chủ đề
- bài
- danh sách thiết bị + số lượng
- borrowed_at
- duration
- trạng thái

## Return
- `TRẢ TOÀN BỘ`
- hoặc trả từng dòng nếu được bật.
- Có tùy chọn incident: bình thường / thiếu / hỏng / mất.
- Không tự động trả khi sang ngày mới.

## Admin
Dashboard:
- tồn kho
- đang mượn
- quá ngày/chưa trả
- import pending
- audit
- tài khoản
- phòng/quyền
- master data

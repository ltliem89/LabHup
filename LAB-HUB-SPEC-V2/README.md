# LAB HUB V2 — COMPLETE MD PACKAGE

Bộ đặc tả mới để chuyển LAB HUB từ UI prototype sang hệ thống quản lý dữ liệu thật.

## Kiến trúc
Vercel/React/PWA → Google Apps Script API → Google Sheets + Google Drive

## Điểm mới V2
- persistence thật
- tồn kho server-side
- borrow/return atomic
- idempotency
- duration
- overdue qua ngày
- date lock + admin unlock
- borrower/receiver/controller
- account & room permission
- Excel exact-template import
- validate → preview → approve → commit
- audit log
- teacher personal export
- admin reporting
- AI coding-agent guardrails
- release gate

## Thứ tự đọc
00_MASTER_SPEC_V2.md
→ 01_UI_UX_CONTRACT_V2.md
→ 02_DATA_MODEL_V2.md
→ 03_BORROW_RETURN_ENGINE_V2.md
→ 04_IMPORT_EXCEL_V2.md
→ 05–19

## Lưu ý
Bộ MD là hợp đồng kỹ thuật. Không coi hệ thống là production-ready chỉ vì giao diện chạy được.

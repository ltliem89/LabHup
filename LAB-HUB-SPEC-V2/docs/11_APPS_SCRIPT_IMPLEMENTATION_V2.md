# APPS SCRIPT IMPLEMENTATION V2

## Required modules
- Config.gs
- Api.gs
- Auth.gs
- Validation.gs
- SheetsRepo.gs
- InventoryService.gs
- BorrowService.gs
- ImportService.gs
- AccountService.gs
- ReportService.gs
- AuditService.gs
- Utils.gs

## Persistence
SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)

## Concurrency
LockService.getScriptLock()
Acquire before:
- borrow
- return
- import commit
- quantity mutation
- account/permission mutation when consistency matters

Always release in finally.

## Error handling
Never return HTML stack traces to frontend.
Return structured JSON error.

## IDs
Use UUID or controlled sequential IDs.
Borrow receipt may be BR-000001 style.
Do not derive IDs from row number.

## Configuration
Store spreadsheet ID and allowed configuration server-side.
Do not put privileged secrets in React.

## Logging
Each write gets request_id and audit event.

## Performance
Read ranges in batches, build in-memory maps, write ranges in batches.
Do not call getRange/setValue repeatedly inside large loops.
Cache read-only bootstrap data when safe, but invalidate cache after master-data mutations.

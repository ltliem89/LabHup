# APPS SCRIPT API CONTRACT V2

Use JSON envelope:
{
  "ok": true|false,
  "code": "SUCCESS|VALIDATION_ERROR|FORBIDDEN|CONFLICT|...",
  "message": "...",
  "data": {},
  "request_id": "..."
}

Core actions:
GET /api?action=bootstrap
GET /api?action=inventory
GET /api?action=my-borrows
GET /api?action=report
POST /api?action=borrow
POST /api?action=return
POST /api?action=admin-create-equipment
POST /api?action=import-validate
POST /api?action=import-approve
POST /api?action=admin-unlock
POST /api?action=admin-update-user

Apps Script may implement all actions through doGet/doPost.

Every POST:
- resolve actor
- validate payload
- authorize
- LockService where transaction integrity requires
- audit mutation
- return request_id

No secrets in frontend.
No service-account credentials in Vercel client bundle.

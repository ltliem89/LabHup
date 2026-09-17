# SECURITY / PRODUCTION CHECKLIST

Before deployment:
- Apps Script deployment access is explicitly chosen.
- Identity resolution is tested.
- ADMIN list is not client-controlled.
- Teacher cannot impersonate another teacher.
- Spreadsheet ID is not exposed as a secret in frontend.
- All mutations server-authorized.
- Import approval server-authorized.
- Audit cannot be deleted by teacher.
- Race-condition tests pass.
- Idempotency tests pass.
- Date lock tests pass.
- Cross-user data access tests pass.
- Error responses do not leak stack traces or secrets.

Important:
Google Apps Script web-app authentication behavior depends on deployment/execution settings. Do not treat an email field sent by React as proof of identity.

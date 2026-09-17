# DEPLOYMENT V2

## Production topology
Browser/PWA
→ Vercel
→ Apps Script Web App
→ Google Sheets
→ Google Drive

## Vercel
Stores only public frontend configuration.
No privileged Google credentials.

## Apps Script
Deploy as Web App with deliberately selected execution/access settings.
Set timezone to Asia/Ho_Chi_Minh.
Configure spreadsheet ID.

## Google Sheet
One controlled production spreadsheet.
Restrict editor access.
Do not expose sheet directly to teachers.

## Release order
1. Create spreadsheet tabs.
2. Deploy Apps Script.
3. Seed master data.
4. Test API.
5. Connect Vercel frontend.
6. Test teacher/admin permissions.
7. Test borrow/return.
8. Test import.
9. Test reports.
10. Production release.

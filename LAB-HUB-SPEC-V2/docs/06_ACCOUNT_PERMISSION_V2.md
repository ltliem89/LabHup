# ACCOUNT & PERMISSION V2

## Roles
TEACHER
ADMIN

## TEACHER
Can:
- view authorized rooms
- borrow
- return own records
- view own active/history
- export own reports

Cannot:
- access another teacher's records
- alter teacher_id
- manage inventory
- approve import
- unlock old records
- change permissions

## ADMIN
Can:
- all rooms
- all inventory
- all transactions
- all users
- all imports
- all reports
- unlock records
- audit

## Authorization
Every Apps Script endpoint checks actor role and ownership.
Frontend hiding is not authorization.

## Identity
Prefer Google account identity where deployment/domain configuration supports it.
If a custom login is used, define a server-verifiable identity mechanism before production.

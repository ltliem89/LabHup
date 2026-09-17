# RELEASE GATE V2

### G0 — DATA
[ ] Sheets created
[ ] Headers exact
[ ] Seed data validated

### G1 — AUTH
[ ] Teacher identity verified server-side
[ ] Room permissions enforced
[ ] Admin verified

### G2 — INVENTORY
[ ] Availability server-calculated
[ ] Maintenance/lost/damaged handled

### G3 — BORROW/RETURN
[ ] Atomic lock
[ ] Idempotency
[ ] Receipt
[ ] Duration
[ ] Overdue flag
[ ] Return

### G4 — IMPORT
[ ] Exact template
[ ] Validation
[ ] Preview
[ ] Approval
[ ] Audit
[ ] No destructive omission

### G5 — DATE LOCK
[ ] Same-day edit
[ ] Next-day lock
[ ] Admin unlock + reason

### G6 — REPORT
[ ] Teacher own scope
[ ] Admin all scope
[ ] Export tested

### G7 — PRODUCTION
[ ] Error handling
[ ] Logs
[ ] Backup
[ ] Deployment documented

Only mark RELEASE when all critical gates pass.

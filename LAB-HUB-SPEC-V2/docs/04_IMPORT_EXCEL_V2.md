# EXCEL IMPORT V2 — UPLOAD / VALIDATE / PREVIEW / APPROVE

## Exact workbook
Required sheets:
ROOMS
SUBJECTS
CLASSES
TOPICS
LESSONS
EQUIPMENT
TOPIC_EQUIPMENT
TEACHERS
TEACHER_ROOMS

Template version is mandatory.

## Workflow
UPLOAD
→ detect template/version
→ parse
→ schema validation
→ reference validation
→ duplicate validation
→ business-rule validation
→ PREVIEW
→ ADMIN APPROVE
→ COMMIT
→ AUDIT

## Preview counts
- total
- valid
- new
- update
- unchanged
- errors

## Hard errors
- missing stable ID
- duplicate stable ID
- unknown foreign key
- invalid room
- equipment room mismatch
- topic/equipment mapping invalid
- negative quantity
- invalid status
- malformed email
- duplicate mapping
- invalid template version

## Commit
Only ADMIN can commit.
Commit must be idempotent by batch_id.
If a batch fails during commit, do not silently report success.
Never delete omitted master rows.
Instead mark inactive manually when needed.

## Direct form
Admin can add equipment:
Room → Subject → Class → Topic → Equipment fields.
For equipment master, subject/class/topic are mapping context, not duplicated ownership fields. The actual mapping is written to TOPIC_EQUIPMENT.

## Bulk upload
Do not import arbitrary Excel columns.
Only the declared template is accepted.

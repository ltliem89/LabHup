# GOOGLE SHEETS SCHEMA V2

Create one spreadsheet as database.

Recommended tabs:
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

All tabs have stable header rows.
IDs are immutable.
Timestamps stored in ISO/standard Date values consistently.
Timezone configured explicitly, e.g. Asia/Ho_Chi_Minh.

Never use sheet row number as business ID.

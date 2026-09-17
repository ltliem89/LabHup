# REPORTING / EXPORT V2

## Teacher scope
Only own borrow records.

Filters:
- from_date
- to_date
- room
- subject
- class
- topic
- lesson
- status

Columns:
date, borrow_id, room, subject, class, topic, lesson, equipment, quantity, borrowed_at, returned_at, duration, status.

Formats:
- CSV/Excel
- printable HTML/PDF through server/report flow

## Admin
Additional filters:
teacher, receiver, controller, room, equipment, incident status, overdue.

## Security
Export endpoint re-checks authorization; never rely on frontend filter.

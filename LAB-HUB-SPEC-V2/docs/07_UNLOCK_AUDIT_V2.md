# DATE LOCK / ADMIN UNLOCK / AUDIT

## Locked record
When current local calendar date differs from borrowed date:
unlock_state = LOCKED_BY_DATE

Teacher cannot edit ordinary fields.

## Admin unlock
Request:
- borrow_id
- reason
- requested changes

Server:
- verify ADMIN
- capture before state
- apply allowed changes
- set unlock_state = UNLOCKED_BY_ADMIN
- create audit event with reason
- retain original timestamps

## Audit minimum
Every event records:
who
when
action
entity
request_id
before
after
reason

Never edit or delete audit history through normal UI.

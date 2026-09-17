# BORROW / RETURN ENGINE V2

## Borrow transaction
1. Resolve authenticated actor.
2. Check TEACHER role and room permission.
3. Validate room/subject/class/topic/lesson relationship.
4. Validate equipment belongs to selected room.
5. Acquire Apps Script LockService.
6. Re-read current inventory/active borrow state.
7. Check every requested quantity.
8. Reject entire transaction if any item lacks availability.
9. Generate stable borrow_id.
10. Write BORROW_RECORDS + BORROW_ITEMS.
11. Write AUDIT_LOG.
12. Release lock.
13. Return receipt.

## Idempotency
Every mutation from client must contain client_request_id.
If an identical request was already committed, return its previous result instead of creating a duplicate.

## Return
- Resolve actor.
- Teacher may return only own active record unless ADMIN.
- Re-read current state.
- Set returned_at.
- Set BORROWED → RETURNED.
- Update returned_quantity.
- Record incidents.
- Audit.
- Return updated duration and availability.

## Duration
returned:
duration = returned_at - borrowed_at
active:
duration = now - borrowed_at

UI: `Đã mượn X giờ Y phút`.
If local date(now) > local date(borrowed_at): flag `QUÁ NGÀY / CHƯA TRẢ`.

## Date lock
- Same calendar date: teacher may edit permitted fields.
- After date changes: record is LOCKED_BY_DATE.
- Return remains possible.
- ADMIN may unlock with reason.
- Unlock does not erase original audit history.

## Atomicity
Inventory check and borrow write must occur inside one server-side lock.
Never decrement inventory only in React.

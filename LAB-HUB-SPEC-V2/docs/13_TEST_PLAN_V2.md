# TEST PLAN V2

## Persistence
1. Borrow.
2. Reload page.
3. Verify record remains.
4. Open from another browser.
5. Verify inventory is consistent.

## Concurrency
Two teachers request the last available item simultaneously.
Expected: one succeeds, one gets CONFLICT/INSUFFICIENT_STOCK.

## Idempotency
Send same client_request_id twice.
Expected: one transaction only.

## Return
Borrow → return → reload.
Expected: status RETURNED and availability restored.

## Midnight
Borrow today, inspect tomorrow.
Expected: remains BORROWED, duration continues, flagged overdue; never auto-return.

## Permissions
Teacher A requests teacher B's record.
Expected: FORBIDDEN.

## Import
- valid workbook
- duplicate IDs
- unknown topic
- negative quantity
- wrong template
- missing sheet
- omitted existing row
Expected: preview/errors, no destructive delete.

## Unlock
Past record → teacher edit rejected.
Admin unlock without reason rejected.
Admin unlock with reason succeeds and creates audit.

## Export
Teacher export contains only own records.
Admin export can include all authorized data.

# MIGRATION FROM LAB HUB V1

Current V1 UI is a prototype with React state/mock receipts.
V2 migration must:
1. Keep UI navigation.
2. Replace mock inventory mutations with API calls.
3. Replace browser timestamps with server timestamps.
4. Add real teacher identity.
5. Add master-data repositories.
6. Add borrow/return transaction engine.
7. Add import workflow.
8. Add audit.
9. Add reporting.
10. Add tests.

Do not rewrite UI blindly. Refactor around the existing screen flow.

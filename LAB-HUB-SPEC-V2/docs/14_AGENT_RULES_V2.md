# AI CODING AGENT RULES — LAB HUB

## MUST
- Read all V2 MD files before modifying architecture.
- Preserve current UI flow unless a spec explicitly changes it.
- Implement server-side business rules.
- Never replace persistence with localStorage/mock state.
- Never silently delete data.
- Add tests for each business rule.
- Keep a development log.
- Make small verifiable commits.

## MUST NOT
- Guess API behavior.
- Hard-code inventory counts.
- Trust teacher_id from client.
- Allow direct import without validation/approval.
- Auto-return at midnight.
- Attach equipment permanently to a lesson.
- Add AI recommendation features unless explicitly requested.

## Definition of done
Feature is not done until:
implementation
+ validation
+ authorization
+ audit
+ error handling
+ test
+ documentation
are all present.

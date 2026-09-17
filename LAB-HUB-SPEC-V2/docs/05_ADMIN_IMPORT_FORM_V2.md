# ADMIN FORM + MASTER DATA V2

## Equipment form
Required:
- equipment_code
- equipment_name
- category
- room
- unit
- total_quantity
- status

Mapping section:
- subject
- class
- chapter/topic
- default_quantity
- required
- note

## Edit rules
- Equipment code is stable.
- Changing name/category/image/note is allowed.
- Changing total quantity is audited.
- Cannot physically delete an equipment item referenced by history.
- Use INACTIVE.

## Topic form
Subject → Chapter/Topic → Lesson.
Lesson belongs to Topic.
Equipment belongs to Topic through TOPIC_EQUIPMENT.

## Teacher form
- email
- display name
- role
- status
- authorized rooms

Deactivate with INACTIVE, never delete historical identity references.

# DATA MODEL V2

## ROOMS
room_id, room_code, room_name, status, note, updated_at

## SUBJECTS
subject_id, subject_code, subject_name, status

## CLASSES
class_id, class_code, class_name, grade, school_year, status

## TOPICS
topic_id, topic_code, subject_id, chapter_no, topic_name, status

## LESSONS
lesson_id, lesson_code, topic_id, lesson_no, lesson_name, status

## EQUIPMENT
equipment_id, equipment_code, equipment_name, category, room_id, unit, total_quantity, blocked_quantity, status, image_url, note, updated_at

## TOPIC_EQUIPMENT
mapping_id, topic_id, equipment_id, default_quantity, required, status, note

## TEACHERS
teacher_id, email, display_name, role, status

## TEACHER_ROOMS
teacher_room_id, teacher_id, room_id, status

## BORROW_RECORDS
borrow_id, client_request_id, teacher_id, receiver_id, controller_id, room_id, subject_id, class_id, topic_id, lesson_id, borrowed_at, returned_at, status, unlock_state, note, created_at, updated_at

## BORROW_ITEMS
borrow_item_id, borrow_id, equipment_id, quantity, returned_quantity, incident_status, note

## IMPORT_BATCHES
batch_id, uploaded_by, uploaded_at, template_version, status, total_rows, valid_rows, new_rows, update_rows, unchanged_rows, error_rows, approved_by, approved_at

## IMPORT_ERRORS
error_id, batch_id, sheet_name, row_no, field_name, error_code, message, raw_value

## AUDIT_LOG
audit_id, event_at, actor_id, actor_role, action, entity_type, entity_id, request_id, before_json, after_json, reason, ip_hint, user_agent_hint

## REPORT_REQUESTS
report_id, requested_by, scope_type, from_date, to_date, format, status, file_url

## IDENTITY / AUTH
Teacher identity must be resolved server-side from authenticated Google account/deployment context or an approved identity mechanism. Never trust teacher_id supplied by browser as authorization.

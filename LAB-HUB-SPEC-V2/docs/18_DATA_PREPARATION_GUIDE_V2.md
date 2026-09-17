# DATA PREPARATION GUIDE

Prepare master data in this order:
1. ROOMS
2. SUBJECTS
3. CLASSES
4. TOPICS
5. LESSONS
6. EQUIPMENT
7. TOPIC_EQUIPMENT
8. TEACHERS
9. TEACHER_ROOMS

Use stable codes.
Example:
ROOM-PHY
SUB-PHY
CLS-07A1
TOP-PHY-C01
LES-PHY-C01-L02
EQ-PHY-0001

Do not use Vietnamese names as IDs.
Names may change; codes should remain stable.

For equipment mapping:
same equipment can map to many topics.
Do not duplicate equipment master rows merely because it is used in multiple topics.

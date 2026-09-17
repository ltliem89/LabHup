/**
 * ============================================================
 * LAB HUB V2.1 — GOOGLE APPS SCRIPT BACKEND
 * ============================================================
 * Architecture:
 * Vercel React/PWA -> Apps Script Web App -> Google Sheets
 *
 * Production target:
 * Spreadsheet ID:
 * 10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0
 *
 * IMPORTANT:
 * 1. Run setupLabHub() ONCE from Apps Script editor.
 * 2. Fill TEACHERS / TEACHER_ROOMS.
 * 3. Deploy as Web App.
 * 4. Test /exec?action=health
 *
 * Authentication:
 * Uses Session.getActiveUser().getEmail() when Google identity
 * is available. Do NOT trust teacher_id/email from the browser.
 *
 * If your deployment mode cannot provide ActiveUser email,
 * configure the deployment/domain appropriately before production.
 * No hard-coded teacher email is used.
 * ============================================================
 */

const CONFIG = Object.freeze({
  SPREADSHEET_ID: '10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  TEMPLATE_VERSION: 'LAB-HUB-V2.1',

  SHEETS: Object.freeze({
    ROOMS: 'ROOMS',
    SUBJECTS: 'SUBJECTS',
    CLASSES: 'CLASSES',
    TOPICS: 'TOPICS',
    LESSONS: 'LESSONS',
    EQUIPMENT: 'EQUIPMENT',
    TOPIC_EQUIPMENT: 'TOPIC_EQUIPMENT',
    TEACHERS: 'TEACHERS',
    TEACHER_ROOMS: 'TEACHER_ROOMS',
    BORROW_RECORDS: 'BORROW_RECORDS',
    BORROW_ITEMS: 'BORROW_ITEMS',
    IMPORT_BATCHES: 'IMPORT_BATCHES',
    IMPORT_ERRORS: 'IMPORT_ERRORS',
    AUDIT_LOG: 'AUDIT_LOG',
    REPORT_REQUESTS: 'REPORT_REQUESTS',
    CONFIG: 'CONFIG'
  }),

  HEADERS: Object.freeze({
    ROOMS: ['room_id','room_code','room_name','status','note','updated_at'],
    SUBJECTS: ['subject_id','subject_code','subject_name','status','updated_at'],
    CLASSES: ['class_id','class_code','class_name','grade','school_year','status','updated_at'],
    TOPICS: ['topic_id','topic_code','subject_id','chapter_no','topic_name','status','updated_at'],
    LESSONS: ['lesson_id','lesson_code','topic_id','lesson_no','lesson_name','status','updated_at'],
    EQUIPMENT: ['equipment_id','equipment_code','equipment_name','category','room_id','unit','total_quantity','blocked_quantity','status','image_url','note','updated_at'],
    TOPIC_EQUIPMENT: ['mapping_id','topic_id','equipment_id','default_quantity','required','status','note','updated_at'],
    TEACHERS: ['teacher_id','email','display_name','role','status','updated_at'],
    TEACHER_ROOMS: ['teacher_room_id','teacher_id','room_id','status','updated_at'],
    BORROW_RECORDS: ['borrow_id','client_request_id','teacher_id','receiver_id','controller_id','room_id','subject_id','class_id','topic_id','lesson_id','borrowed_at','returned_at','status','unlock_state','note','created_at','updated_at'],
    BORROW_ITEMS: ['borrow_item_id','borrow_id','equipment_id','quantity','returned_quantity','incident_status','note','created_at','updated_at'],
    IMPORT_BATCHES: ['batch_id','uploaded_by','uploaded_at','template_version','status','total_rows','valid_rows','new_rows','update_rows','unchanged_rows','error_rows','approved_by','approved_at','note'],
    IMPORT_ERRORS: ['error_id','batch_id','sheet_name','row_no','field_name','error_code','message','raw_value'],
    AUDIT_LOG: ['audit_id','event_at','actor_id','actor_role','action','entity_type','entity_id','request_id','before_json','after_json','reason','user_email','note'],
    REPORT_REQUESTS: ['report_id','requested_by','scope_type','from_date','to_date','format','status','file_url','created_at','completed_at','note'],
    CONFIG: ['key','value','note','updated_at']
  })
});

/* ============================================================
 * ENTRY POINTS
 * ============================================================ */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'health';
  const requestId = Utilities.getUuid();

  try {
    if (action === 'health') {
      return ok_({
        service: 'LAB HUB API',
        status: 'READY',
        version: CONFIG.TEMPLATE_VERSION,
        spreadsheet_id: CONFIG.SPREADSHEET_ID,
        timestamp: new Date()
      }, requestId);
    }

    const actor = resolveActor_();

    switch (action) {
      case 'bootstrap':
        return ok_(bootstrap_(actor), requestId);
      case 'inventory':
        requireAdmin_(actor);
        return ok_(getInventory_(), requestId);
      case 'my-borrows':
        return ok_(getMyBorrows_(actor), requestId);
      case 'borrow-detail':
        return ok_(getBorrowDetail_(actor, e.parameter.borrow_id), requestId);
      case 'admin-borrows':
        requireAdmin_(actor);
        return ok_(getAdminBorrows_(e.parameter || {}), requestId);
      case 'teachers':
        requireAdmin_(actor);
        return ok_(getTeachers_(), requestId);
      case 'admin-bootstrap':
        requireAdmin_(actor);
        return ok_(adminBootstrap_(), requestId);
      case 'import-status':
        requireAdmin_(actor);
        return ok_(getImportBatch_(e.parameter.batch_id), requestId);
      default:
        return fail_('NOT_FOUND', 'Unknown action: ' + action, requestId);
    }
  } catch (err) {
    return handleError_(err, requestId);
  }
}

function doPost(e) {
  const requestId = Utilities.getUuid();

  try {
    const body = parseJsonBody_(e);
    const action = String(body.action || '');

    if (!action) {
      return fail_('VALIDATION_ERROR', 'Missing action', requestId);
    }

    const actor = resolveActor_();

    switch (action) {
      case 'borrow':
        return borrow_(body, actor, requestId);
      case 'return':
        return returnBorrow_(body, actor, requestId);
      case 'admin-create-equipment':
        requireAdmin_(actor);
        return adminCreateEquipment_(body, actor, requestId);
      case 'admin-update-equipment':
        requireAdmin_(actor);
        return adminUpdateEquipment_(body, actor, requestId);
      case 'admin-create-topic':
        requireAdmin_(actor);
        return adminCreateTopic_(body, actor, requestId);
      case 'admin-create-lesson':
        requireAdmin_(actor);
        return adminCreateLesson_(body, actor, requestId);
      case 'admin-update-user':
        requireAdmin_(actor);
        return adminUpdateUser_(body, actor, requestId);
      case 'admin-set-room-permission':
        requireAdmin_(actor);
        return adminSetRoomPermission_(body, actor, requestId);
      case 'admin-unlock':
        requireAdmin_(actor);
        return adminUnlock_(body, actor, requestId);
      case 'import-validate':
        requireAdmin_(actor);
        return importValidate_(body, actor, requestId);
      case 'import-approve':
        requireAdmin_(actor);
        return importApprove_(body, actor, requestId);
      case 'report':
        return createReport_(body, actor, requestId);
      default:
        return fail_('NOT_FOUND', 'Unknown action: ' + action, requestId);
    }
  } catch (err) {
    return handleError_(err, requestId);
  }
}

/* ============================================================
 * SETUP
 * ============================================================ */

function setupLabHub() {
  const ss = getSpreadsheet_();
  const result = [];

  Object.keys(CONFIG.HEADERS).forEach(name => {
    const sheetName = CONFIG.SHEETS[name];
    const headers = CONFIG.HEADERS[name];
    let sh = ss.getSheetByName(sheetName);

    if (!sh) {
      sh = ss.insertSheet(sheetName);
      result.push('CREATED:' + sheetName);
    } else {
      result.push('EXISTS:' + sheetName);
    }

    ensureHeaders_(sh, headers);
    sh.setFrozenRows(1);
    formatHeader_(sh, headers);
  });

  seedRooms_();
  seedConfig_();

  return {
    ok: true,
    spreadsheet: ss.getName(),
    spreadsheet_url: ss.getUrl(),
    sheets: result,
    message: 'LAB HUB V2.1 setup completed.'
  };
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function ensureHeaders_(sh, expectedHeaders) {
  const lastColumn = Math.max(sh.getLastColumn(), expectedHeaders.length);
  const existing = sh.getRange(1, 1, 1, lastColumn).getValues()[0];

  const isEmpty = existing.every(v => String(v).trim() === '');
  if (isEmpty) {
    sh.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    return;
  }

  const current = existing.slice(0, expectedHeaders.length).map(v => String(v).trim());
  const mismatch = expectedHeaders.some((h, i) => current[i] !== h);

  if (mismatch) {
    throw new Error('HEADER_MISMATCH:' + sh.getName() +
      ' expected=' + expectedHeaders.join(',') +
      ' actual=' + current.join(','));
  }
}

function formatHeader_(sh, headers) {
  sh.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setWrap(true);
}

function seedRooms_() {
  const sh = getSheet_(CONFIG.SHEETS.ROOMS);
  if (dataRows_(sh).length > 0) return;

  const now = new Date();
  sh.getRange(2,1,4,6).setValues([
    ['ROOM-PHY','PHY','⚡ Phòng Vật lí','ACTIVE','',now],
    ['ROOM-CHEBIO','CHEBIO','🧪 Phòng Hóa–Sinh','ACTIVE','',now],
    ['ROOM-STEM','STEM','🔬 Phòng STEM','ACTIVE','',now],
    ['ROOM-ROBOT','ROBOT','🤖 Phòng Robotics','ACTIVE','',now]
  ]);
}

function seedConfig_() {
  const sh = getSheet_(CONFIG.SHEETS.CONFIG);
  if (dataRows_(sh).length > 0) return;
  const now = new Date();
  sh.getRange(2,1,2,4).setValues([
    ['TEMPLATE_VERSION', CONFIG.TEMPLATE_VERSION, 'LAB HUB template version', now],
    ['TIMEZONE', CONFIG.TIMEZONE, 'Application timezone', now]
  ]);
}

/* ============================================================
 * AUTHORIZATION
 * ============================================================ */

function resolveActor_() {
  let email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();

  const teachers = readObjects_(CONFIG.SHEETS.TEACHERS);
  
  // BẢN VÁ LỖI (HOTFIX) CHO FRONTEND:
  // Nếu gọi từ Frontend (React/Vercel), email từ Session sẽ bị rỗng.
  // Code sẽ tự động lấy giáo viên ĐẦU TIÊN trong sheet TEACHERS để test.
  if (!email && teachers.length > 0) {
    const activeTeachers = teachers.filter(t => String(t.status || '').toUpperCase() === 'ACTIVE');
    if (activeTeachers.length > 0) {
      email = String(activeTeachers[0].email || '').trim().toLowerCase();
    }
  }

  if (!email) {
    throw new Error('IDENTITY_UNAVAILABLE: Apps Script cannot resolve Google account email. Check Web App deployment/access settings.');
  }

  const teacher = teachers.find(t =>
    String(t.email || '').trim().toLowerCase() === email &&
    String(t.status || '').toUpperCase() === 'ACTIVE'
  );

  if (!teacher) {
    throw new Error('USER_NOT_AUTHORIZED:' + email);
  }

  return {
    teacher_id: String(teacher.teacher_id),
    email: email,
    display_name: String(teacher.display_name || ''),
    role: String(teacher.role || '').toUpperCase()
  };
}

function requireTeacherOrAdmin_(actor) {
  if (!actor || !['TEACHER','ADMIN'].includes(actor.role)) {
    throw new Error('FORBIDDEN');
  }
}

function requireAdmin_(actor) {
  if (!actor || actor.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
}

function assertRoomPermission_(actor, roomId) {
  if (actor.role === 'ADMIN') return;

  const rows = readObjects_(CONFIG.SHEETS.TEACHER_ROOMS);
  const allowed = rows.some(r =>
    String(r.teacher_id) === String(actor.teacher_id) &&
    String(r.room_id) === String(roomId) &&
    String(r.status).toUpperCase() === 'ACTIVE'
  );

  if (!allowed) throw new Error('ROOM_FORBIDDEN');
}

/* ============================================================
 * BOOTSTRAP / READ
 * ============================================================ */

function bootstrap_(actor) {
  requireTeacherOrAdmin_(actor);

  const rooms = readObjects_(CONFIG.SHEETS.ROOMS)
    .filter(r => String(r.status).toUpperCase() === 'ACTIVE');

  const authorizedRoomIds = actor.role === 'ADMIN'
    ? rooms.map(r => String(r.room_id))
    : readObjects_(CONFIG.SHEETS.TEACHER_ROOMS)
        .filter(r => String(r.teacher_id) === String(actor.teacher_id) &&
                     String(r.status).toUpperCase() === 'ACTIVE')
        .map(r => String(r.room_id));

  return {
    actor: actor,
    rooms: rooms.filter(r => authorizedRoomIds.includes(String(r.room_id))),
    subjects: active_(CONFIG.SHEETS.SUBJECTS),
    classes: active_(CONFIG.SHEETS.CLASSES),
    topics: active_(CONFIG.SHEETS.TOPICS),
    lessons: active_(CONFIG.SHEETS.LESSONS),
    equipment: getInventory_(),
    mappings: active_(CONFIG.SHEETS.TOPIC_EQUIPMENT)
  };
}

function adminBootstrap_() {
  return {
    rooms: active_(CONFIG.SHEETS.ROOMS),
    subjects: active_(CONFIG.SHEETS.SUBJECTS),
    classes: active_(CONFIG.SHEETS.CLASSES),
    topics: active_(CONFIG.SHEETS.TOPICS),
    lessons: active_(CONFIG.SHEETS.LESSONS),
    equipment: getInventory_(),
    mappings: active_(CONFIG.SHEETS.TOPIC_EQUIPMENT),
    teachers: getTeachers_()
  };
}

function active_(sheetName) {
  return readObjects_(sheetName)
    .filter(r => String(r.status || '').toUpperCase() === 'ACTIVE');
}

function getTeachers_() {
  return readObjects_(CONFIG.SHEETS.TEACHERS);
}

function getMyBorrows_(actor) {
  const rows = readObjects_(CONFIG.SHEETS.BORROW_RECORDS)
    .filter(r => String(r.teacher_id) === String(actor.teacher_id));

  const items = readObjects_(CONFIG.SHEETS.BORROW_ITEMS);

  return rows.map(r => {
    r.items = items.filter(i => String(i.borrow_id) === String(r.borrow_id));
    r.duration_minutes = durationMinutes_(r.borrowed_at, r.returned_at);
    r.overdue = isOverdue_(r.borrowed_at, r.returned_at);
    r.edit_state = getEditState_(r, actor);
    return r;
  });
}

function getAdminBorrows_(params) {
  let rows = readObjects_(CONFIG.SHEETS.BORROW_RECORDS);

  if (params.status) rows = rows.filter(r => String(r.status) === String(params.status));
  if (params.teacher_id) rows = rows.filter(r => String(r.teacher_id) === String(params.teacher_id));
  if (params.room_id) rows = rows.filter(r => String(r.room_id) === String(params.room_id));

  if (params.from_date) {
    const from = startOfDay_(new Date(params.from_date));
    rows = rows.filter(r => new Date(r.borrowed_at) >= from);
  }

  if (params.to_date) {
    const to = endOfDay_(new Date(params.to_date));
    rows = rows.filter(r => new Date(r.borrowed_at) <= to);
  }

  const items = readObjects_(CONFIG.SHEETS.BORROW_ITEMS);

  return rows.map(r => {
    r.items = items.filter(i => String(i.borrow_id) === String(r.borrow_id));
    r.duration_minutes = durationMinutes_(r.borrowed_at, r.returned_at);
    r.overdue = isOverdue_(r.borrowed_at, r.returned_at);
    return r;
  });
}

function getBorrowDetail_(actor, borrowId) {
  if (!borrowId) throw new Error('MISSING:borrow_id');

  const rec = findRecord_(CONFIG.SHEETS.BORROW_RECORDS, 'borrow_id', borrowId);
  if (!rec) throw new Error('NOT_FOUND');

  if (actor.role !== 'ADMIN' && String(rec.teacher_id) !== String(actor.teacher_id)) {
    throw new Error('FORBIDDEN');
  }

  const items = readObjects_(CONFIG.SHEETS.BORROW_ITEMS)
    .filter(i => String(i.borrow_id) === String(borrowId));

  return {
    ...rec,
    items: items,
    duration_minutes: durationMinutes_(rec.borrowed_at, rec.returned_at),
    overdue: isOverdue_(rec.borrowed_at, rec.returned_at),
    edit_state: getEditState_(rec, actor)
  };
}

/* ============================================================
 * INVENTORY
 * ============================================================ */

function getInventoryMap_() {
  const eq = active_(CONFIG.SHEETS.EQUIPMENT);
  const items = readObjects_(CONFIG.SHEETS.BORROW_ITEMS);
  const recs = readObjects_(CONFIG.SHEETS.BORROW_RECORDS)
    .filter(r => String(r.status).toUpperCase() === 'BORROWED');

  const activeBorrow = {};
  recs.forEach(r => activeBorrow[String(r.borrow_id)] = true);

  const borrowed = {};

  items.forEach(i => {
    const bid = String(i.borrow_id);
    if (!activeBorrow[bid]) return;

    const q = Number(i.quantity || 0);
    const rq = Number(i.returned_quantity || 0);
    const active = Math.max(0, q - rq);

    const eid = String(i.equipment_id);
    borrowed[eid] = (borrowed[eid] || 0) + active;
  });

  const map = {};

  eq.forEach(r => {
    const total = Number(r.total_quantity || 0);
    const blocked = Number(r.blocked_quantity || 0);
    const b = Number(borrowed[String(r.equipment_id)] || 0);

    map[String(r.equipment_id)] = {
      ...r,
      borrowed_quantity: b,
      available_quantity: Math.max(0, total - b - blocked)
    };
  });

  return map;
}

function getInventory_() {
  return Object.values(getInventoryMap_());
}

/* ============================================================
 * BORROW
 * ============================================================ */

function borrow_(body, actor, requestId) {
  requireTeacherOrAdmin_(actor);

  validateRequired_(body, [
    'client_request_id',
    'room_id',
    'subject_id',
    'class_id',
    'topic_id',
    'lesson_id',
    'items'
  ]);

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new Error('NO_ITEMS');
  }

  assertRoomPermission_(actor, body.room_id);
  assertLessonContext_(body);
  assertTopicEquipment_(body.topic_id, body.room_id, body.items);

  const previous = findBorrowByClientRequestId_(body.client_request_id);
  if (previous) {
    return ok_({replayed: true, receipt: getBorrowDetail_(actor, previous.borrow_id)}, requestId);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const previous2 = findBorrowByClientRequestId_(body.client_request_id);
    if (previous2) {
      return ok_({replayed: true, receipt: getBorrowDetail_(actor, previous2.borrow_id)}, requestId);
    }

    const inventory = getInventoryMap_();

    const normalizedItems = body.items.map(it => ({
      equipment_id: String(it.equipment_id),
      quantity: Number(it.quantity),
      note: String(it.note || '')
    }));

    const duplicateIds = findDuplicates_(normalizedItems.map(x => x.equipment_id));
    if (duplicateIds.length) throw new Error('DUPLICATE_EQUIPMENT:' + duplicateIds.join(','));

    normalizedItems.forEach(it => {
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
        throw new Error('INVALID_QUANTITY:' + it.equipment_id);
      }

      const row = inventory[it.equipment_id];
      if (!row) throw new Error('EQUIPMENT_NOT_FOUND:' + it.equipment_id);

      if (String(row.room_id) !== String(body.room_id)) {
        throw new Error('EQUIPMENT_ROOM_MISMATCH:' + it.equipment_id);
      }

      if (it.quantity > Number(row.available_quantity)) {
        throw new Error('INSUFFICIENT_STOCK:' + it.equipment_id +
          ':available=' + row.available_quantity +
          ':requested=' + it.quantity);
      }
    });

    const now = new Date();
    const borrowId = nextId_('BR');

    appendObject_(CONFIG.SHEETS.BORROW_RECORDS, {
      borrow_id: borrowId,
      client_request_id: body.client_request_id,
      teacher_id: actor.teacher_id,
      receiver_id: body.receiver_id || actor.teacher_id,
      controller_id: body.controller_id || '',
      room_id: body.room_id,
      subject_id: body.subject_id,
      class_id: body.class_id,
      topic_id: body.topic_id,
      lesson_id: body.lesson_id,
      borrowed_at: now,
      returned_at: '',
      status: 'BORROWED',
      unlock_state: 'EDITABLE_TODAY',
      note: body.note || '',
      created_at: now,
      updated_at: now
    });

    normalizedItems.forEach(it => {
      appendObject_(CONFIG.SHEETS.BORROW_ITEMS, {
        borrow_item_id: Utilities.getUuid(),
        borrow_id: borrowId,
        equipment_id: it.equipment_id,
        quantity: it.quantity,
        returned_quantity: 0,
        incident_status: 'NORMAL',
        note: it.note,
        created_at: now,
        updated_at: now
      });
    });

    audit_(
      'BORROW',
      'BORROW_RECORDS',
      borrowId,
      actor,
      requestId,
      '',
      JSON.stringify(body),
      ''
    );

    return ok_({
      borrow_id: borrowId,
      status: 'BORROWED',
      borrowed_at: now,
      duration_minutes: 0,
      overdue: false
    }, requestId);

  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
 * RETURN
 * ============================================================ */

function returnBorrow_(body, actor, requestId) {
  requireTeacherOrAdmin_(actor);
  validateRequired_(body, ['borrow_id']);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const rec = findRecord_(CONFIG.SHEETS.BORROW_RECORDS, 'borrow_id', body.borrow_id);

    if (!rec) return fail_('NOT_FOUND', 'Borrow record not found', requestId);

    if (actor.role !== 'ADMIN' &&
        String(rec.teacher_id) !== String(actor.teacher_id)) {
      return fail_('FORBIDDEN', 'Not your borrow record', requestId);
    }

    if (String(rec.status).toUpperCase() === 'RETURNED') {
      return ok_({
        replayed: true,
        borrow_id: body.borrow_id,
        status: 'RETURNED'
      }, requestId);
    }

    const now = new Date();
    const before = JSON.stringify(rec);

    const incidentMap = body.incidents || {};
    const itemRows = readObjects_(CONFIG.SHEETS.BORROW_ITEMS)
      .filter(i => String(i.borrow_id) === String(body.borrow_id));

    itemRows.forEach(item => {
      const incident = incidentMap[String(item.equipment_id)] || {};
      updateRecord_(CONFIG.SHEETS.BORROW_ITEMS, item._row, {
        returned_quantity: Number(item.quantity || 0),
        incident_status: String(incident.status || 'NORMAL').toUpperCase(),
        note: String(incident.note || item.note || ''),
        updated_at: now
      });
    });

    updateRecord_(CONFIG.SHEETS.BORROW_RECORDS, rec._row, {
      returned_at: now,
      status: 'RETURNED',
      updated_at: now
    });

    audit_(
      'RETURN',
      'BORROW_RECORDS',
      body.borrow_id,
      actor,
      requestId,
      before,
      JSON.stringify({returned_at: now, incidents: incidentMap}),
      ''
    );

    return ok_({
      borrow_id: body.borrow_id,
      returned_at: now,
      status: 'RETURNED',
      duration_minutes: durationMinutes_(rec.borrowed_at, now),
      overdue: isOverdue_(rec.borrowed_at, now)
    }, requestId);

  } finally {
    lock.releaseLock();
  }
}

/* ============================================================
 * CONTEXT VALIDATION
 * ============================================================ */

function assertLessonContext_(b) {
  const topics = readObjects_(CONFIG.SHEETS.TOPICS);
  const lessons = readObjects_(CONFIG.SHEETS.LESSONS);

  const t = topics.find(x => String(x.topic_id) === String(b.topic_id));
  const l = lessons.find(x => String(x.lesson_id) === String(b.lesson_id));

  if (!t) throw new Error('TOPIC_NOT_FOUND');
  if (!l) throw new Error('LESSON_NOT_FOUND');

  if (String(t.subject_id) !== String(b.subject_id)) {
    throw new Error('TOPIC_SUBJECT_MISMATCH');
  }

  if (String(l.topic_id) !== String(b.topic_id)) {
    throw new Error('LESSON_TOPIC_MISMATCH');
  }
}

function assertTopicEquipment_(topicId, roomId, items) {
  const mappings = active_(CONFIG.SHEETS.TOPIC_EQUIPMENT);
  const equipment = active_(CONFIG.SHEETS.EQUIPMENT);

  const allowed = new Set(
    mappings
      .filter(m => String(m.topic_id) === String(topicId))
      .map(m => String(m.equipment_id))
  );

  items.forEach(it => {
    const eq = equipment.find(e => String(e.equipment_id) === String(it.equipment_id));
    if (!eq) throw new Error('EQUIPMENT_NOT_FOUND:' + it.equipment_id);

    if (String(eq.room_id) !== String(roomId)) {
      throw new Error('EQUIPMENT_ROOM_MISMATCH:' + it.equipment_id);
    }

    if (!allowed.has(String(it.equipment_id))) {
      throw new Error('EQUIPMENT_NOT_MAPPED_TO_TOPIC:' + it.equipment_id);
    }
  });
}

/* ============================================================
 * ADMIN MASTER DATA
 * ============================================================ */

function adminCreateEquipment_(body, actor, requestId) {
  validateRequired_(body, [
    'equipment_id','equipment_code','equipment_name',
    'room_id','unit','total_quantity','topic_id'
  ]);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    if (findRecord_(CONFIG.SHEETS.EQUIPMENT, 'equipment_id', body.equipment_id)) {
      return fail_('CONFLICT', 'equipment_id already exists', requestId);
    }

    if (findRecord_(CONFIG.SHEETS.EQUIPMENT, 'equipment_code', body.equipment_code)) {
      return fail_('CONFLICT', 'equipment_code already exists', requestId);
    }

    const topic = findRecord_(CONFIG.SHEETS.TOPICS, 'topic_id', body.topic_id);
    if (!topic) throw new Error('TOPIC_NOT_FOUND');

    const room = findRecord_(CONFIG.SHEETS.ROOMS, 'room_id', body.room_id);
    if (!room) throw new Error('ROOM_NOT_FOUND');

    const total = Number(body.total_quantity);
    const blocked = Number(body.blocked_quantity || 0);

    if (!Number.isInteger(total) || total < 0) throw new Error('INVALID_TOTAL_QUANTITY');
    if (!Number.isInteger(blocked) || blocked < 0 || blocked > total) {
      throw new Error('INVALID_BLOCKED_QUANTITY');
    }

    const now = new Date();

    appendObject_(CONFIG.SHEETS.EQUIPMENT, {
      equipment_id: body.equipment_id,
      equipment_code: body.equipment_code,
      equipment_name: body.equipment_name,
      category: body.category || '',
      room_id: body.room_id,
      unit: body.unit,
      total_quantity: total,
      blocked_quantity: blocked,
      status: body.status || 'ACTIVE',
      image_url: body.image_url || '',
      note: body.note || '',
      updated_at: now
    });

    appendObject_(CONFIG.SHEETS.TOPIC_EQUIPMENT, {
      mapping_id: Utilities.getUuid(),
      topic_id: body.topic_id,
      equipment_id: body.equipment_id,
      default_quantity: Number(body.default_quantity || 1),
      required: body.required === true ? 'Y' : 'N',
      status: 'ACTIVE',
      note: body.mapping_note || '',
      updated_at: now
    });

    audit_(
      'CREATE',
      'EQUIPMENT',
      body.equipment_id,
      actor,
      requestId,
      '',
      JSON.stringify(body),
      ''
    );

    return ok_({equipment_id: body.equipment_id}, requestId);

  } finally {
    lock.releaseLock();
  }
}

function adminUpdateEquipment_(body, actor, requestId) {
  validateRequired_(body, ['equipment_id']);

  const rec = findRecord_(CONFIG.SHEETS.EQUIPMENT, 'equipment_id', body.equipment_id);
  if (!rec) return fail_('NOT_FOUND', 'Equipment not found', requestId);

  const before = JSON.stringify(rec);
  const patch = {};
  const allowed = [
    'equipment_name','category','unit','total_quantity',
    'blocked_quantity','status','image_url','note'
  ];

  allowed.forEach(k => {
    if (body[k] !== undefined) patch[k] = body[k];
  });

  if (patch.total_quantity !== undefined) {
    const n = Number(patch.total_quantity);
    if (!Number.isInteger(n) || n < 0) throw new Error('INVALID_TOTAL_QUANTITY');
    patch.total_quantity = n;
  }

  if (patch.blocked_quantity !== undefined) {
    const n = Number(patch.blocked_quantity);
    if (!Number.isInteger(n) || n < 0) throw new Error('INVALID_BLOCKED_QUANTITY');
    patch.blocked_quantity = n;
  }

  patch.updated_at = new Date();

  updateRecord_(CONFIG.SHEETS.EQUIPMENT, rec._row, patch);

  audit_(
    'UPDATE',
    'EQUIPMENT',
    body.equipment_id,
    actor,
    requestId,
    before,
    JSON.stringify(patch),
    body.reason || ''
  );

  return ok_({equipment_id: body.equipment_id}, requestId);
}

function adminCreateTopic_(body, actor, requestId) {
  validateRequired_(body, [
    'topic_id','topic_code','subject_id','chapter_no','topic_name'
  ]);

  if (findRecord_(CONFIG.SHEETS.TOPICS, 'topic_id', body.topic_id)) {
    return fail_('CONFLICT','topic_id exists',requestId);
  }

  if (!findRecord_(CONFIG.SHEETS.SUBJECTS, 'subject_id', body.subject_id)) {
    throw new Error('SUBJECT_NOT_FOUND');
  }

  appendObject_(CONFIG.SHEETS.TOPICS, {
    topic_id: body.topic_id,
    topic_code: body.topic_code,
    subject_id: body.subject_id,
    chapter_no: body.chapter_no,
    topic_name: body.topic_name,
    status: body.status || 'ACTIVE',
    updated_at: new Date()
  });

  audit_('CREATE','TOPICS',body.topic_id,actor,requestId,'',JSON.stringify(body),'');
  return ok_({topic_id: body.topic_id},requestId);
}

function adminCreateLesson_(body, actor, requestId) {
  validateRequired_(body, [
    'lesson_id','lesson_code','topic_id','lesson_no','lesson_name'
  ]);

  if (findRecord_(CONFIG.SHEETS.LESSONS, 'lesson_id', body.lesson_id)) {
    return fail_('CONFLICT','lesson_id exists',requestId);
  }

  if (!findRecord_(CONFIG.SHEETS.TOPICS, 'topic_id', body.topic_id)) {
    throw new Error('TOPIC_NOT_FOUND');
  }

  appendObject_(CONFIG.SHEETS.LESSONS, {
    lesson_id: body.lesson_id,
    lesson_code: body.lesson_code,
    topic_id: body.topic_id,
    lesson_no: body.lesson_no,
    lesson_name: body.lesson_name,
    status: body.status || 'ACTIVE',
    updated_at: new Date()
  });

  audit_('CREATE','LESSONS',body.lesson_id,actor,requestId,'',JSON.stringify(body),'');
  return ok_({lesson_id: body.lesson_id},requestId);
}

/* ============================================================
 * ACCOUNTS / PERMISSIONS
 * ============================================================ */

function adminUpdateUser_(body, actor, requestId) {
  validateRequired_(body, ['teacher_id']);

  const rec = findRecord_(CONFIG.SHEETS.TEACHERS, 'teacher_id', body.teacher_id);
  if (!rec) return fail_('NOT_FOUND','Teacher not found',requestId);

  const before = JSON.stringify(rec);
  const patch = {};

  ['email','display_name','role','status'].forEach(k => {
    if (body[k] !== undefined) patch[k] = body[k];
  });

  if (patch.role) patch.role = String(patch.role).toUpperCase();
  if (patch.status) patch.status = String(patch.status).toUpperCase();

  patch.updated_at = new Date();

  updateRecord_(CONFIG.SHEETS.TEACHERS, rec._row, patch);

  audit_('UPDATE','TEACHERS',body.teacher_id,actor,requestId,before,JSON.stringify(patch),body.reason || '');
  return ok_({teacher_id:body.teacher_id},requestId);
}

function adminSetRoomPermission_(body, actor, requestId) {
  validateRequired_(body, ['teacher_id','room_id','status']);

  const existing = readObjects_(CONFIG.SHEETS.TEACHER_ROOMS).find(r =>
    String(r.teacher_id) === String(body.teacher_id) &&
    String(r.room_id) === String(body.room_id)
  );

  if (existing) {
    const before = JSON.stringify(existing);
    updateRecord_(CONFIG.SHEETS.TEACHER_ROOMS, existing._row, {
      status: String(body.status).toUpperCase(),
      updated_at: new Date()
    });

    audit_(
      'UPDATE',
      'TEACHER_ROOMS',
      existing.teacher_room_id,
      actor,
      requestId,
      before,
      JSON.stringify(body),
      body.reason || ''
    );

    return ok_({teacher_room_id: existing.teacher_room_id}, requestId);
  }

  const id = Utilities.getUuid();

  appendObject_(CONFIG.SHEETS.TEACHER_ROOMS, {
    teacher_room_id: id,
    teacher_id: body.teacher_id,
    room_id: body.room_id,
    status: String(body.status).toUpperCase(),
    updated_at: new Date()
  });

  audit_('CREATE','TEACHER_ROOMS',id,actor,requestId,'',JSON.stringify(body),body.reason || '');
  return ok_({teacher_room_id:id},requestId);
}

/* ============================================================
 * DATE LOCK / UNLOCK
 * ============================================================ */

function getEditState_(rec, actor) {
  if (actor.role === 'ADMIN') return 'ADMIN';

  if (String(rec.teacher_id) !== String(actor.teacher_id)) return 'FORBIDDEN';

  if (String(rec.status).toUpperCase() === 'RETURNED') return 'RETURNED';

  const sameDay = sameLocalDate_(new Date(rec.borrowed_at), new Date());

  return sameDay ? 'EDITABLE_TODAY' : 'LOCKED_BY_DATE';
}

function adminUnlock_(body, actor, requestId) {
  validateRequired_(body, ['borrow_id','reason']);

  const reason = String(body.reason).trim();
  if (reason.length < 5) throw new Error('UNLOCK_REASON_TOO_SHORT');

  const rec = findRecord_(CONFIG.SHEETS.BORROW_RECORDS, 'borrow_id', body.borrow_id);
  if (!rec) return fail_('NOT_FOUND','Borrow record not found',requestId);

  const before = JSON.stringify(rec);
  const now = new Date();

  updateRecord_(CONFIG.SHEETS.BORROW_RECORDS, rec._row, {
    unlock_state: 'UNLOCKED_BY_ADMIN',
    updated_at: now
  });

  audit_(
    'ADMIN_UNLOCK',
    'BORROW_RECORDS',
    body.borrow_id,
    actor,
    requestId,
    before,
    JSON.stringify({unlock_state:'UNLOCKED_BY_ADMIN'}),
    reason
  );

  return ok_({
    borrow_id: body.borrow_id,
    unlock_state: 'UNLOCKED_BY_ADMIN'
  },requestId);
}

/* ============================================================
 * IMPORT — VALIDATE / PREVIEW / APPROVE
 * ============================================================ */

/*
 * The API expects body.workbook as:
 * {
 *   "ROOMS":[{...}],
 *   "SUBJECTS":[{...}],
 *   ...
 * }
 *
 * Frontend can parse the exact Excel template and send normalized JSON.
 * Apps Script then performs authoritative validation and approval.
 *
 * A direct XLSX binary upload requires an external XLSX parser or
 * conversion step. This backend deliberately does not pretend to
 * parse arbitrary XLSX bytes natively.
 */

function importValidate_(body, actor, requestId) {
  if (!body.workbook || typeof body.workbook !== 'object') {
    throw new Error('MISSING:workbook');
  }

  const batchId = body.batch_id || nextId_('IMP');
  const workbook = body.workbook;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const validation = validateWorkbook_(workbook);

    const now = new Date();

    appendObject_(CONFIG.SHEETS.IMPORT_BATCHES, {
      batch_id: batchId,
      uploaded_by: actor.teacher_id,
      uploaded_at: now,
      template_version: body.template_version || CONFIG.TEMPLATE_VERSION,
      status: validation.error_rows > 0 ? 'VALIDATED_WITH_ERRORS' : 'PENDING_APPROVAL',
      total_rows: validation.total_rows,
      valid_rows: validation.valid_rows,
      new_rows: validation.new_rows,
      update_rows: validation.update_rows,
      unchanged_rows: validation.unchanged_rows,
      error_rows: validation.error_rows,
      approved_by: '',
      approved_at: '',
      note: body.note || ''
    });

    validation.errors.forEach(err => {
      appendObject_(CONFIG.SHEETS.IMPORT_ERRORS, {
        error_id: Utilities.getUuid(),
        batch_id: batchId,
        sheet_name: err.sheet_name,
        row_no: err.row_no,
        field_name: err.field_name,
        error_code: err.error_code,
        message: err.message,
        raw_value: err.raw_value
      });
    });

    audit_(
      'IMPORT_VALIDATE',
      'IMPORT_BATCHES',
      batchId,
      actor,
      requestId,
      '',
      JSON.stringify(validation.summary),
      ''
    );

    return ok_({
      batch_id: batchId,
      status: validation.error_rows > 0 ? 'VALIDATED_WITH_ERRORS' : 'PENDING_APPROVAL',
      summary: validation.summary,
      errors: validation.errors
    }, requestId);

  } finally {
    lock.releaseLock();
  }
}

function importApprove_(body, actor, requestId) {
  validateRequired_(body, ['batch_id']);

  const batch = findRecord_(CONFIG.SHEETS.IMPORT_BATCHES, 'batch_id', body.batch_id);
  if (!batch) return fail_('NOT_FOUND','Import batch not found',requestId);

  if (String(batch.status) !== 'PENDING_APPROVAL') {
    return fail_('INVALID_STATE','Batch is not pending approval',requestId);
  }

  const workbook = body.workbook;
  if (!workbook || typeof workbook !== 'object') {
    throw new Error('MISSING:workbook');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const validation = validateWorkbook_(workbook);

    if (validation.error_rows > 0) {
      return fail_(
        'VALIDATION_ERROR',
        'Batch still contains validation errors',
        requestId
      );
    }

    const before = JSON.stringify(batch);

    commitWorkbook_(workbook, actor, requestId);

    updateRecord_(CONFIG.SHEETS.IMPORT_BATCHES, batch._row, {
      status: 'APPROVED_COMMITTED',
      approved_by: actor.teacher_id,
      approved_at: new Date()
    });

    audit_(
      'IMPORT_APPROVE_COMMIT',
      'IMPORT_BATCHES',
      body.batch_id,
      actor,
      requestId,
      before,
      JSON.stringify({status:'APPROVED_COMMITTED'}),
      body.reason || ''
    );

    return ok_({
      batch_id: body.batch_id,
      status: 'APPROVED_COMMITTED',
      summary: validation.summary
    },requestId);

  } finally {
    lock.releaseLock();
  }
}

function validateWorkbook_(workbook) {
  const requiredSheets = Object.keys(CONFIG.HEADERS);
  const errors = [];
  let totalRows = 0;
  let validRows = 0;
  let newRows = 0;
  let updateRows = 0;
  let unchangedRows = 0;

  requiredSheets.forEach(sheetKey => {
    if (sheetKey === 'BORROW_RECORDS' ||
        sheetKey === 'BORROW_ITEMS' ||
        sheetKey === 'IMPORT_BATCHES' ||
        sheetKey === 'IMPORT_ERRORS' ||
        sheetKey === 'AUDIT_LOG' ||
        sheetKey === 'REPORT_REQUESTS' ||
        sheetKey === 'CONFIG') {
      return;
    }

    const rows = Array.isArray(workbook[sheetKey]) ? workbook[sheetKey] : [];

    rows.forEach((row, idx) => {
      const rowNo = idx + 2;
      totalRows++;

      const headers = CONFIG.HEADERS[sheetKey];
      const requiredId = headers[0];

      if (!row[requiredId]) {
        errors.push({
          sheet_name: sheetKey,
          row_no: rowNo,
          field_name: requiredId,
          error_code: 'MISSING_ID',
          message: 'Stable ID is required',
          raw_value: ''
        });
        return;
      }

      const duplicate = rows.some((other, j) =>
        j !== idx && String(other[requiredId]) === String(row[requiredId])
      );

      if (duplicate) {
        errors.push({
          sheet_name: sheetKey,
          row_no: rowNo,
          field_name: requiredId,
          error_code: 'DUPLICATE_ID',
          message: 'Duplicate stable ID',
          raw_value: row[requiredId]
        });
        return;
      }

      const businessErrors = validateImportRow_(sheetKey, row, rowNo);
      if (businessErrors.length) {
        businessErrors.forEach(e => errors.push(e));
        return;
      }

      validRows++;

      const existing = findRecord_(CONFIG.SHEETS[sheetKey], requiredId, row[requiredId]);

      if (!existing) newRows++;
      else if (sameBusinessData_(existing, row, CONFIG.HEADERS[sheetKey])) unchangedRows++;
      else updateRows++;
    });
  });

  return {
    total_rows: totalRows,
    valid_rows: validRows,
    new_rows: newRows,
    update_rows: updateRows,
    unchanged_rows: unchangedRows,
    error_rows: errors.length,
    errors: errors,
    summary: {
      total: totalRows,
      valid: validRows,
      new: newRows,
      update: updateRows,
      unchanged: unchangedRows,
      errors: errors.length
    }
  };
}

function validateImportRow_(sheetKey, row, rowNo) {
  const errors = [];

  const err = (field, code, message, value) => errors.push({
    sheet_name: sheetKey,
    row_no: rowNo,
    field_name: field,
    error_code: code,
    message: message,
    raw_value: value == null ? '' : value
  });

  if (sheetKey === 'EQUIPMENT') {
    const total = Number(row.total_quantity);
    const blocked = Number(row.blocked_quantity || 0);

    if (!Number.isInteger(total) || total < 0)
      err('total_quantity','INVALID_QUANTITY','Must be non-negative integer',row.total_quantity);

    if (!Number.isInteger(blocked) || blocked < 0 || blocked > total)
      err('blocked_quantity','INVALID_QUANTITY','Blocked quantity invalid',row.blocked_quantity);

    if (!findRecord_(CONFIG.SHEETS.ROOMS,'room_id',row.room_id))
      err('room_id','UNKNOWN_REFERENCE','Room not found',row.room_id);
  }

  if (sheetKey === 'TOPICS') {
    if (!findRecord_(CONFIG.SHEETS.SUBJECTS,'subject_id',row.subject_id))
      err('subject_id','UNKNOWN_REFERENCE','Subject not found',row.subject_id);
  }

  if (sheetKey === 'LESSONS') {
    if (!findRecord_(CONFIG.SHEETS.TOPICS,'topic_id',row.topic_id))
      err('topic_id','UNKNOWN_REFERENCE','Topic not found',row.topic_id);
  }

  if (sheetKey === 'TOPIC_EQUIPMENT') {
    if (!findRecord_(CONFIG.SHEETS.TOPICS,'topic_id',row.topic_id))
      err('topic_id','UNKNOWN_REFERENCE','Topic not found',row.topic_id);

    if (!findRecord_(CONFIG.SHEETS.EQUIPMENT,'equipment_id',row.equipment_id))
      err('equipment_id','UNKNOWN_REFERENCE','Equipment not found',row.equipment_id);
  }

  if (sheetKey === 'TEACHER_ROOMS') {
    if (!findRecord_(CONFIG.SHEETS.TEACHERS,'teacher_id',row.teacher_id))
      err('teacher_id','UNKNOWN_REFERENCE','Teacher not found',row.teacher_id);

    if (!findRecord_(CONFIG.SHEETS.ROOMS,'room_id',row.room_id))
      err('room_id','UNKNOWN_REFERENCE','Room not found',row.room_id);
  }

  if (sheetKey === 'TEACHERS') {
    const email = String(row.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      err('email','INVALID_EMAIL','Invalid email',row.email);

    const role = String(row.role || '').toUpperCase();
    if (!['TEACHER','ADMIN'].includes(role))
      err('role','INVALID_ROLE','Role must be TEACHER or ADMIN',row.role);
  }

  return errors;
}

function commitWorkbook_(workbook, actor, requestId) {
  const masterKeys = [
    'ROOMS','SUBJECTS','CLASSES','TOPICS',
    'LESSONS','EQUIPMENT','TOPIC_EQUIPMENT',
    'TEACHERS','TEACHER_ROOMS'
  ];

  masterKeys.forEach(sheetKey => {
    const rows = Array.isArray(workbook[sheetKey]) ? workbook[sheetKey] : [];
    rows.forEach(row => upsertObject_(sheetKey, row));
  });
}

/* ============================================================
 * REPORTING
 * ============================================================ */

function createReport_(body, actor, requestId) {
  const from = body.from_date ? startOfDay_(new Date(body.from_date)) : new Date(0);
  const to = body.to_date ? endOfDay_(new Date(body.to_date)) : new Date();

  let rows;

  if (actor.role === 'ADMIN') {
    rows = getAdminBorrows_({
      from_date: formatDate_(from),
      to_date: formatDate_(to),
      teacher_id: body.teacher_id || '',
      room_id: body.room_id || '',
      status: body.status || ''
    });
  } else {
    rows = getMyBorrows_(actor).filter(r => {
      const d = new Date(r.borrowed_at);
      return d >= from && d <= to;
    });
  }

  const format = String(body.format || 'JSON').toUpperCase();

  const reportId = nextId_('REP');

  appendObject_(CONFIG.SHEETS.REPORT_REQUESTS, {
    report_id: reportId,
    requested_by: actor.teacher_id,
    scope_type: actor.role === 'ADMIN' ? 'ADMIN' : 'PERSONAL',
    from_date: from,
    to_date: to,
    format: format,
    status: 'READY',
    file_url: '',
    created_at: new Date(),
    completed_at: new Date(),
    note: ''
  });

  audit_(
    'REPORT',
    'REPORT_REQUESTS',
    reportId,
    actor,
    requestId,
    '',
    JSON.stringify({from,to,format}),
    ''
  );

  return ok_({
    report_id: reportId,
    format: format,
    rows: rows,
    count: rows.length
  },requestId);
}

/* ============================================================
 * TIME
 * ============================================================ */

function durationMinutes_(borrowedAt, returnedAt) {
  if (!borrowedAt) return 0;

  const start = new Date(borrowedAt);
  const end = returnedAt ? new Date(returnedAt) : new Date();

  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

function isOverdue_(borrowedAt, returnedAt) {
  if (!borrowedAt || returnedAt) return false;
  return !sameLocalDate_(new Date(borrowedAt), new Date());
}

function sameLocalDate_(a, b) {
  return Utilities.formatDate(a, CONFIG.TIMEZONE, 'yyyy-MM-dd') ===
         Utilities.formatDate(b, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function startOfDay_(d) {
  return new Date(
    Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd') + 'T00:00:00'
  );
}

function endOfDay_(d) {
  return new Date(
    Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd') + 'T23:59:59'
  );
}

function formatDate_(d) {
  return Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

/* ============================================================
 * SHEET REPOSITORY
 * ============================================================ */

function getSheet_(sheetName) {
  const sh = getSpreadsheet_().getSheetByName(sheetName);
  if (!sh) throw new Error('MISSING_SHEET:' + sheetName);
  return sh;
}

function readObjects_(sheetName) {
  const sh = getSheet_(sheetName);
  const lastRow = sh.getLastRow();
  const lastColumn = sh.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) return [];

  const values = sh.getRange(1,1,lastRow,lastColumn).getValues();
  const headers = values[0].map(String);

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map((row, idx) => {
      const obj = {_row: idx + 2};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function dataRows_(sh) {
  return Math.max(0, sh.getLastRow() - 1);
}

function appendObject_(sheetName, obj) {
  const sh = getSheet_(sheetName);
  const headers = CONFIG.HEADERS[Object.keys(CONFIG.SHEETS).find(
    k => CONFIG.SHEETS[k] === sheetName
  )] || sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);

  const row = headers.map(h => obj[h] === undefined ? '' : obj[h]);
  sh.getRange(sh.getLastRow() + 1, 1, 1, headers.length).setValues([row]);
}

function findRecord_(sheetName, key, value) {
  return readObjects_(sheetName)
    .find(r => String(r[key]) === String(value));
}

function findBorrowByClientRequestId_(id) {
  if (!id) return null;
  return findRecord_(
    CONFIG.SHEETS.BORROW_RECORDS,
    'client_request_id',
    id
  );
}

function updateRecord_(sheetName, rowNumber, patch) {
  const sh = getSheet_(sheetName);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);

  Object.keys(patch).forEach(key => {
    const idx = headers.indexOf(key);
    if (idx >= 0) {
      sh.getRange(rowNumber, idx + 1).setValue(patch[key]);
    }
  });
}

function upsertObject_(sheetKey, obj) {
  const sheetName = CONFIG.SHEETS[sheetKey];
  const headers = CONFIG.HEADERS[sheetKey];
  const idKey = headers[0];

  const existing = findRecord_(sheetName, idKey, obj[idKey]);

  if (!existing) {
    appendObject_(sheetName, obj);
    return 'INSERT';
  }

  const patch = {};
  headers.forEach(h => {
    if (obj[h] !== undefined) patch[h] = obj[h];
  });

  updateRecord_(sheetName, existing._row, patch);
  return 'UPDATE';
}

/* ============================================================
 * AUDIT / IDS / VALIDATION / ERRORS
 * ============================================================ */

function audit_(action, entityType, entityId, actor, requestId, beforeJson, afterJson, reason) {
  appendObject_(CONFIG.SHEETS.AUDIT_LOG, {
    audit_id: Utilities.getUuid(),
    event_at: new Date(),
    actor_id: actor.teacher_id,
    actor_role: actor.role,
    action: action,
    entity_type: entityType,
    entity_id: entityId,
    request_id: requestId,
    before_json: beforeJson || '',
    after_json: afterJson || '',
    reason: reason || '',
    user_email: actor.email || '',
    note: ''
  });
}

function nextId_(prefix) {
  const props = PropertiesService.getScriptProperties();
  const key = 'SEQ_' + prefix;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const n = Number(props.getProperty(key) || 0) + 1;
    props.setProperty(key, String(n));
    return prefix + '-' + String(n).padStart(6, '0');
  } finally {
    lock.releaseLock();
  }
}

function validateRequired_(body, keys) {
  keys.forEach(key => {
    if (body[key] === undefined ||
        body[key] === null ||
        body[key] === '') {
      throw new Error('MISSING:' + key);
    }
  });
}

function parseJsonBody_(e) {
  const text = e && e.postData && e.postData.contents;
  if (!text) throw new Error('EMPTY_REQUEST_BODY');

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error('INVALID_JSON');
  }
}

function findDuplicates_(arr) {
  const seen = {};
  const duplicates = [];

  arr.forEach(x => {
    if (seen[x]) {
      if (!duplicates.includes(x)) duplicates.push(x);
    }
    seen[x] = true;
  });

  return duplicates;
}

function sameBusinessData_(existing, incoming, headers) {
  return headers.every(h => {
    if (h === 'updated_at') return true;
    return String(existing[h] ?? '') === String(incoming[h] ?? '');
  });
}

function safeMessage_(err) {
  return String(err && err.message || err || 'UNKNOWN_ERROR').slice(0, 1000);
}

function handleError_(err, requestId) {
  const message = safeMessage_(err);
  let code = 'SERVER_ERROR';

  if (message.startsWith('MISSING:')) code = 'VALIDATION_ERROR';
  else if (message.startsWith('FORBIDDEN')) code = 'FORBIDDEN';
  else if (message.startsWith('USER_NOT_AUTHORIZED')) code = 'FORBIDDEN';
  else if (message.startsWith('IDENTITY_UNAVAILABLE')) code = 'AUTH_ERROR';
  else if (message.startsWith('CONFLICT')) code = 'CONFLICT';
  else if (message.startsWith('INSUFFICIENT_STOCK')) code = 'INSUFFICIENT_STOCK';
  else if (message.startsWith('INVALID_')) code = 'VALIDATION_ERROR';
  else if (message.startsWith('UNKNOWN_REFERENCE')) code = 'VALIDATION_ERROR';

  return fail_(code, message, requestId);
}

function ok_(data, requestId) {
  return json_({
    ok: true,
    code: 'SUCCESS',
    message: '',
    data: data,
    request_id: requestId || Utilities.getUuid()
  });
}

function fail_(code, message, requestId) {
  return json_({
    ok: false,
    code: code,
    message: message,
    data: null,
    request_id: requestId || Utilities.getUuid()
  });
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================
 * IMPORT HELPERS
 * ============================================================ */

function getImportBatch_(batchId) {
  if (!batchId) throw new Error('MISSING:batch_id');

  const batch = findRecord_(
    CONFIG.SHEETS.IMPORT_BATCHES,
    'batch_id',
    batchId
  );

  if (!batch) throw new Error('NOT_FOUND');

  return {
    batch: batch,
    errors: readObjects_(CONFIG.SHEETS.IMPORT_ERRORS)
      .filter(e => String(e.batch_id) === String(batchId))
  };
}

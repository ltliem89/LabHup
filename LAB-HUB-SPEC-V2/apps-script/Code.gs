/**
 * LAB HUB V2 — Apps Script API starter
 * IMPORTANT: set CONFIG.SPREADSHEET_ID before deployment.
 * This file provides real persistence primitives and transaction skeletons.
 */

const CONFIG = {
  SPREADSHEET_ID: 'REPLACE_WITH_SPREADSHEET_ID',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  SHEETS: {
    ROOMS:'ROOMS', SUBJECTS:'SUBJECTS', CLASSES:'CLASSES', TOPICS:'TOPICS',
    LESSONS:'LESSONS', EQUIPMENT:'EQUIPMENT', TOPIC_EQUIPMENT:'TOPIC_EQUIPMENT',
    TEACHERS:'TEACHERS', TEACHER_ROOMS:'TEACHER_ROOMS',
    BORROW_RECORDS:'BORROW_RECORDS', BORROW_ITEMS:'BORROW_ITEMS',
    AUDIT_LOG:'AUDIT_LOG'
  }
};

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'health';
    const actor = resolveActor_();
    if (action === 'health') return ok_({service:'LAB HUB API', status:'READY'});
    if (action === 'bootstrap') return requireTeacherOrAdmin_(actor, () => ok_(bootstrap_(actor)));
    if (action === 'my-borrows') return requireTeacherOrAdmin_(actor, () => ok_(getMyBorrows_(actor)));
    if (action === 'inventory') return requireAdmin_(actor, () => ok_(getInventory_()));
    return fail_('NOT_FOUND','Unknown action');
  } catch (err) {
    return fail_('SERVER_ERROR', safeMessage_(err));
  }
}

function doPost(e) {
  const requestId = Utilities.getUuid();
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action;
    const actor = resolveActor_();

    if (action === 'borrow') return borrow_(body, actor, requestId);
    if (action === 'return') return returnBorrow_(body, actor, requestId);
    if (action === 'admin-create-equipment') return requireAdmin_(actor, () => adminCreateEquipment_(body, actor, requestId));
    if (action === 'admin-unlock') return requireAdmin_(actor, () => adminUnlock_(body, actor, requestId));
    return fail_('NOT_FOUND','Unknown action', requestId);
  } catch (err) {
    return fail_('SERVER_ERROR', safeMessage_(err), requestId);
  }
}

function borrow_(body, actor, requestId) {
  requireTeacherOrAdmin_(actor, () => {});
  validate_(body, ['client_request_id','room_id','subject_id','class_id','topic_id','lesson_id','items']);
  assertRoomPermission_(actor, body.room_id);
  assertLessonContext_(body);

  const existing = findBorrowByClientRequestId_(body.client_request_id);
  if (existing) return ok_({replayed:true, receipt:existing}, requestId);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const existing2 = findBorrowByClientRequestId_(body.client_request_id);
    if (existing2) return ok_({replayed:true, receipt:existing2}, requestId);

    const inventory = getInventoryMap_();
    body.items.forEach(it => {
      const row = inventory[it.equipment_id];
      if (!row) throw new Error('Equipment not found: '+it.equipment_id);
      if (String(row.room_id) !== String(body.room_id)) throw new Error('Equipment room mismatch');
      if (Number(it.quantity) <= 0) throw new Error('Invalid quantity');
      if (Number(it.quantity) > Number(row.available)) {
        throw new Error('INSUFFICIENT_STOCK: '+it.equipment_id);
      }
    });

    const borrowId = nextId_('BR');
    const now = new Date();
    append_(CONFIG.SHEETS.BORROW_RECORDS, [
      borrowId, body.client_request_id, actor.teacher_id, body.receiver_id || actor.teacher_id,
      body.controller_id || '', body.room_id, body.subject_id, body.class_id,
      body.topic_id, body.lesson_id, now, '', 'BORROWED', 'EDITABLE_TODAY',
      body.note || '', now, now
    ]);

    body.items.forEach(it => append_(CONFIG.SHEETS.BORROW_ITEMS, [
      Utilities.getUuid(), borrowId, it.equipment_id, Number(it.quantity), 0, 'NORMAL', it.note || ''
    ]));

    audit_('BORROW','BORROW_RECORDS',borrowId,actor,requestId,'',JSON.stringify(body),'');
    return ok_({borrow_id:borrowId, borrowed_at:now, status:'BORROWED'}, requestId);
  } finally {
    lock.releaseLock();
  }
}

function returnBorrow_(body, actor, requestId) {
  requireTeacherOrAdmin_(actor, () => {});
  validate_(body, ['borrow_id']);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const rec = findRecord_(CONFIG.SHEETS.BORROW_RECORDS, 'borrow_id', body.borrow_id);
    if (!rec) return fail_('NOT_FOUND','Borrow record not found',requestId);
    if (actor.role !== 'ADMIN' && String(rec.teacher_id) !== String(actor.teacher_id))
      return fail_('FORBIDDEN','Not your borrow record',requestId);
    if (rec.status === 'RETURNED') return ok_({replayed:true, borrow_id:body.borrow_id},requestId);

    const now = new Date();
    updateRecord_(CONFIG.SHEETS.BORROW_RECORDS, rec._row, {
      returned_at: now, status:'RETURNED', updated_at:now
    });
    audit_('RETURN','BORROW_RECORDS',body.borrow_id,actor,requestId,JSON.stringify(rec),JSON.stringify({returned_at:now}),'');
    return ok_({borrow_id:body.borrow_id, returned_at:now, status:'RETURNED'},requestId);
  } finally {
    lock.releaseLock();
  }
}

function adminCreateEquipment_(body, actor, requestId) {
  validate_(body, ['equipment_id','equipment_code','equipment_name','room_id','unit','total_quantity','topic_id']);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (findRecord_(CONFIG.SHEETS.EQUIPMENT,'equipment_id',body.equipment_id))
      return fail_('CONFLICT','equipment_id already exists',requestId);
    const now=new Date();
    append_(CONFIG.SHEETS.EQUIPMENT,[
      body.equipment_id,body.equipment_code,body.equipment_name,body.category||'',
      body.room_id,body.unit,Number(body.total_quantity),Number(body.blocked_quantity||0),
      body.status||'ACTIVE',body.image_url||'',body.note||'',now
    ]);
    append_(CONFIG.SHEETS.TOPIC_EQUIPMENT,[
      Utilities.getUuid(),body.topic_id,body.equipment_id,
      Number(body.default_quantity||1),body.required===true?'Y':'N','ACTIVE',body.mapping_note||''
    ]);
    audit_('CREATE','EQUIPMENT',body.equipment_id,actor,requestId,'',JSON.stringify(body),'');
    return ok_({equipment_id:body.equipment_id},requestId);
  } finally { lock.releaseLock(); }
}

function adminUnlock_(body, actor, requestId) {
  validate_(body, ['borrow_id','reason']);
  const rec=findRecord_(CONFIG.SHEETS.BORROW_RECORDS,'borrow_id',body.borrow_id);
  if(!rec) return fail_('NOT_FOUND','Borrow record not found',requestId);
  const before=JSON.stringify(rec);
  updateRecord_(CONFIG.SHEETS.BORROW_RECORDS,rec._row,{unlock_state:'UNLOCKED_BY_ADMIN',updated_at:new Date()});
  audit_('ADMIN_UNLOCK','BORROW_RECORDS',body.borrow_id,actor,requestId,before,JSON.stringify({reason:body.reason} ),body.reason);
  return ok_({borrow_id:body.borrow_id,unlock_state:'UNLOCKED_BY_ADMIN'},requestId);
}

function resolveActor_() {
  // Deployment-dependent. Do NOT trust an email/teacher_id sent by the client.
  let email = Session.getActiveUser().getEmail();
  
  // VERCEL WORKAROUND: Trình duyệt chặn 3rd-party cookie nên fetch từ Vercel sẽ không có email
  // Hãy điền cứng email của bạn vào đây để test
  if (!email) {
    email = 'admin@example.com'; // SỬA DÒNG NÀY THÀNH EMAIL CỦA BẠN (giống trong tab TEACHERS)
  }

  if (!email) throw new Error('IDENTITY_UNAVAILABLE');
  const rows=readObjects_(CONFIG.SHEETS.TEACHERS);
  const teacher=rows.find(r=>String(r.email).toLowerCase()===String(email).toLowerCase() && r.status==='ACTIVE');
  if (!teacher) throw new Error('USER_NOT_AUTHORIZED');
  return {teacher_id:teacher.teacher_id, email:teacher.email, role:teacher.role, display_name:teacher.display_name};
}

function requireTeacherOrAdmin_(actor, fn) {
  if (!actor || (actor.role!=='TEACHER' && actor.role!=='ADMIN')) throw new Error('FORBIDDEN');
  return fn ? fn() : true;
}
function requireAdmin_(actor, fn) {
  if (!actor || actor.role!=='ADMIN') throw new Error('FORBIDDEN');
  return fn ? fn() : true;
}

function assertRoomPermission_(actor, roomId) {
  if (actor.role==='ADMIN') return;
  const rows=readObjects_(CONFIG.SHEETS.TEACHER_ROOMS);
  const ok=rows.some(r=>String(r.teacher_id)===String(actor.teacher_id)&&String(r.room_id)===String(roomId)&&r.status==='ACTIVE');
  if(!ok) throw new Error('ROOM_FORBIDDEN');
}

function assertLessonContext_(b) {
  const topics=readObjects_(CONFIG.SHEETS.TOPICS);
  const lessons=readObjects_(CONFIG.SHEETS.LESSONS);
  const t=topics.find(x=>String(x.topic_id)===String(b.topic_id));
  const l=lessons.find(x=>String(x.lesson_id)===String(b.lesson_id));
  if(!t || String(t.subject_id)!==String(b.subject_id)) throw new Error('TOPIC_CONTEXT_INVALID');
  if(!l || String(l.topic_id)!==String(b.topic_id)) throw new Error('LESSON_CONTEXT_INVALID');
}

function getInventoryMap_() {
  const eq=readObjects_(CONFIG.SHEETS.EQUIPMENT);
  const items=readObjects_(CONFIG.SHEETS.BORROW_ITEMS);
  const recs=readObjects_(CONFIG.SHEETS.BORROW_RECORDS).filter(r=>r.status==='BORROWED');
  const activeByBorrow={};
  recs.forEach(r=>activeByBorrow[r.borrow_id]=true);
  const borrowed={};
  items.forEach(i=>{
    if(activeByBorrow[i.borrow_id]) borrowed[i.equipment_id]=(borrowed[i.equipment_id]||0)+Number(i.quantity||0)-Number(i.returned_quantity||0);
  });
  const map={};
  eq.forEach(r=>{
    const total=Number(r.total_quantity||0), blocked=Number(r.blocked_quantity||0), b=Number(borrowed[r.equipment_id]||0);
    map[r.equipment_id]={...r,available:total-b-blocked};
  });
  return map;
}

function getInventory_(){ return Object.values(getInventoryMap_()); }
function getMyBorrows_(actor){ 
  const recs = readObjects_(CONFIG.SHEETS.BORROW_RECORDS).filter(r=>String(r.teacher_id)===String(actor.teacher_id));
  const allItems = readObjects_(CONFIG.SHEETS.BORROW_ITEMS);
  recs.forEach(r => {
    r.items = allItems.filter(i => String(i.borrow_id) === String(r.borrow_id));
  });
  return recs;
}

function bootstrap_(actor) {
  const out={rooms:readObjects_(CONFIG.SHEETS.ROOMS).filter(r=>r.status==='ACTIVE'),
    subjects:readObjects_(CONFIG.SHEETS.SUBJECTS).filter(r=>r.status==='ACTIVE'),
    classes:readObjects_(CONFIG.SHEETS.CLASSES).filter(r=>r.status==='ACTIVE'),
    topics:readObjects_(CONFIG.SHEETS.TOPICS).filter(r=>r.status==='ACTIVE'),
    lessons:readObjects_(CONFIG.SHEETS.LESSONS).filter(r=>r.status==='ACTIVE'),
    inventory:getInventory_()};
  return out;
}

function readObjects_(sheetName) {
  const sh=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
  if(!sh) throw new Error('MISSING_SHEET:'+sheetName);
  const values=sh.getDataRange().getValues();
  if(values.length<2) return [];
  const headers=values[0].map(String);
  return values.slice(1).filter(r=>r.some(v=>v!=='' )).map((r,idx)=>{
    const o={_row:idx+2}; headers.forEach((h,i)=>o[h]=r[i]); return o;
  });
}
function append_(sheetName,row) {
  const sh=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
  if(!sh) throw new Error('MISSING_SHEET:'+sheetName);
  sh.appendRow(row);
}
function findRecord_(sheetName,key,value){
  return readObjects_(sheetName).find(r=>String(r[key])===String(value));
}
function findBorrowByClientRequestId_(id){ return readObjects_(CONFIG.SHEETS.BORROW_RECORDS).find(r=>String(r.client_request_id)===String(id)); }
function updateRecord_(sheetName,row,patch){
  const sh=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  Object.keys(patch).forEach(k=>{const i=headers.indexOf(k); if(i>=0) sh.getRange(row,i+1).setValue(patch[k]);});
}
function audit_(action,entityType,entityId,actor,requestId,beforeJson,afterJson,reason){
  append_(CONFIG.SHEETS.AUDIT_LOG,[Utilities.getUuid(),new Date(),actor.teacher_id,actor.role,action,entityType,entityId,requestId,beforeJson,afterJson,reason,'','']);
}
function nextId_(prefix){
  const props=PropertiesService.getScriptProperties();
  const key='SEQ_'+prefix; const n=Number(props.getProperty(key)||0)+1; props.setProperty(key,String(n));
  return prefix+'-'+String(n).padStart(6,'0');
}
function validate_(body,required){
  required.forEach(k=>{if(body[k]===undefined||body[k]===null||body[k]==='') throw new Error('MISSING:'+k);});
}
function safeMessage_(err){ return String(err && err.message || err).slice(0,500); }
function ok_(data,requestId){return json_({ok:true,code:'SUCCESS',message:'',data:data,request_id:requestId||Utilities.getUuid()});}
function fail_(code,message,requestId){return json_({ok:false,code:code,message:message,data:null,request_id:requestId||Utilities.getUuid()});}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}

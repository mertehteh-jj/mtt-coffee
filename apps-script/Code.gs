/*  ═══════════════════════════════════════════════════════════
    ระบบต้นทุนและสต๊อกกาแฟ "เม่อะ เต เต"
    ลำดับการบันทึก 6 ขั้น
      1 ซื้อกาแฟกะลา
      2 ผลิตสารเขียว   (ตัดกะลา → ได้สารเขียว + ค่าสี + ค่าส่ง)
      3 ผลิตเมล็ดคั่ว   (ตัดสารเขียว → ได้หลายระดับคั่ว + ค่าแรง + ค่าเช่าเครื่อง)
      4 ซื้อวัสดุอุปกรณ์
      5 ขายเมล็ดคั่ว    (ตัดเมล็ด + ซอง + สติ๊กเกอร์ + กล่อง + เทป + ค่าส่ง)
      6 สรุปต้นทุน-กำไร ต่อซอง / ต่อวัน / ต่อเดือน / ต่อปี
    ต้นทุน: ถัวเฉลี่ยถ่วงน้ำหนัก · ตัดล็อต: FEFO
    ═══════════════════════════════════════════════════════════ */

var SH = {
  PRODUCT: 'สินค้า',
  LOT: 'ล็อตสินค้า',
  BUYPC: '1 ซื้อกะลา',
  MILL: '2 ผลิตสารเขียว',
  ROAST: '3 ผลิตเมล็ดคั่ว',
  BUYMAT: '4 ซื้อวัสดุ',
  ORDER: '5 ขาย',
  LINE: '5 รายการขาย',
  ISSUE: 'ตัดจ่ายอื่นๆ',
  COUNT: 'ตรวจนับ',
  PACKSPEC: 'สูตรซอง',
  SETTING: 'ตั้งค่า'
};

var H = {};
H[SH.PRODUCT]  = ['รหัสสินค้า','ชื่อสินค้า','ประเภท','ระดับคั่ว','หน่วยนับ','ราคาขาย','จุดสั่งซื้อ','คงเหลือ','ต้นทุนเฉลี่ย/หน่วย','มูลค่าคงคลัง','สถานะ','เคลื่อนไหวล่าสุด'];
H[SH.LOT]      = ['เลขที่ล็อต','รหัสสินค้า','ชื่อสินค้า','วันที่รับ','วันหมดอายุ','จำนวนรับ','คงเหลือ','ต้นทุน/หน่วย','ที่มา','อ้างอิงเอกสาร'];
H[SH.BUYPC]    = ['เลขที่เอกสาร','วันที่','รหัสสินค้า','ชื่อสินค้า','จำนวน (kg)','ราคา/kg','ค่าขนส่ง','ต้นทุนรวม','ต้นทุนจริง/kg','เลขที่ล็อต','ผู้ขาย/เกษตรกร','หมายเหตุ','ผู้บันทึก','บันทึกเมื่อ','สถานะ'];
H[SH.MILL]     = ['เลขที่เอกสาร','วันที่','กะลาที่ตัดเบิก (kg)','ต้นทุนกะลา','สารเขียวที่ได้ (kg)','น้ำหนักหาย (kg)','% Yield','ค่าสี/kg','ค่าสีรวม','ค่าส่งสารเขียว','ต้นทุนรวม','ต้นทุนสารเขียว/kg','เลขที่ล็อต','วันหมดอายุ','โรงสี','หมายเหตุ','ผู้บันทึก','บันทึกเมื่อ','สถานะ'];
H[SH.ROAST]    = ['เลขที่เอกสาร','วันที่','ระดับคั่ว','รหัสผลผลิต','สารเขียวรวมทั้งรอบ (kg)','สารเขียวที่ปันส่วน (kg)','เมล็ดคั่วที่ได้ (kg)','น้ำหนักหาย (kg)','% Yield','ต้นทุนสารเขียว','ค่าแรงจ้างคั่ว','ค่าเช่าเครื่องคั่ว','ต้นทุนรวม','ต้นทุน/kg','เลขที่ล็อต','วันหมดอายุ','ผู้คั่ว','หมายเหตุ','ผู้บันทึก','บันทึกเมื่อ','สถานะ'];
H[SH.BUYMAT]   = ['เลขที่เอกสาร','วันที่','รหัสสินค้า','ชื่อวัสดุ','จำนวน','ราคา/หน่วย','ค่าขนส่ง','ต้นทุนรวม','ต้นทุนจริง/หน่วย','เลขที่ล็อต','ผู้ขาย','หมายเหตุ','ผู้บันทึก','บันทึกเมื่อ','สถานะ'];
H[SH.ORDER]    = ['เลขที่ออร์เดอร์','วันที่','ลูกค้า','ช่องทางขาย','มูลค่าสินค้า','ค่าส่งที่เก็บลูกค้า','รายได้รวม','ต้นทุนเมล็ด','ต้นทุนซอง+สติ๊กเกอร์','ต้นทุนกล่อง+เทป','ค่าส่งที่จ่ายจริง','ต้นทุนรวม','กำไรสุทธิ','% กำไร','กล่อง/เทปที่ใช้','หมายเหตุ','ผู้บันทึก','บันทึกเมื่อ','สถานะ'];
H[SH.LINE]     = ['เลขที่ออร์เดอร์','วันที่','ประเภท','ระดับคั่ว','ขนาด (g)','จำนวน (ซอง/kg)','น้ำหนักรวม (kg)','ราคา/หน่วย','มูลค่า','ต้นทุนเมล็ด/หน่วย','ต้นทุนซอง/หน่วย','ต้นทุนสติ๊กเกอร์/หน่วย','ต้นทุนรวม/หน่วย','ต้นทุนรวม','กำไรขั้นต้น','ล็อตที่ตัด','สถานะ'];
H[SH.ISSUE]    = ['เลขที่เอกสาร','วันที่','ประเภท','รหัสสินค้า','ชื่อสินค้า','จำนวน','ต้นทุน/หน่วย','มูลค่าที่ตัด','ล็อตที่ตัด','หมายเหตุ','ผู้บันทึก','บันทึกเมื่อ','สถานะ'];
H[SH.COUNT]    = ['วันที่','รหัสสินค้า','ชื่อสินค้า','ยอดตามระบบ','ยอดนับจริง','ผลต่าง','มูลค่าผลต่าง','เหตุผล','ผู้ตรวจนับ','บันทึกเมื่อ','สถานะ'];
H[SH.PACKSPEC] = ['ขนาด (g)','รหัสซอง','ชื่อซอง','ซอง/หน่วย','รหัสสติ๊กเกอร์','สติ๊กเกอร์/หน่วย'];

var TYPES = ['กาแฟกะลา','สารเขียว','เมล็ดคั่ว','วัสดุอุปกรณ์'];
/* ชื่อแบรนด์ของเมล็ดคั่วแต่ละระดับ — ระดับคั่วยังเป็นตัวเชื่อมของระบบ ชื่อเป็นแค่ป้ายที่แสดง */
var BEAN_NAMES = [
  { key: 'LT',  roast: 'คั่วอ่อน',           name: 'Little My' },
  { key: 'MD',  roast: 'คั่วกลาง',           name: 'Wednesday' },
  { key: 'MDK', roast: 'คั่วกลางค่อนเข้ม',   name: 'ตาหนวด' },
  { key: 'DK',  roast: 'คั่วเข้ม',           name: 'เห็น"นม"สู้ตาย' }
];

/* ขนาดกล่องพัสดุมาตรฐานที่ใช้กันทั่วไป — แก้ชื่อ/ขนาดให้ตรงกับที่ร้านใช้จริงได้ในชีตสินค้า */
var BOX_SIZES = [
  { key: '00', label: 'เบอร์ 00', dim: '9.75×14.25×6 ซม.', reorder: 30 },
  { key: '0',  label: 'เบอร์ 0',  dim: '11×17×6 ซม.',      reorder: 30 },
  { key: 'A',  label: 'เบอร์ A',  dim: '14×20×6 ซม.',      reorder: 50 },
  { key: 'AA', label: 'เบอร์ AA', dim: '13×17×7 ซม.',      reorder: 30 },
  { key: 'B',  label: 'เบอร์ B',  dim: '17×25×9 ซม.',      reorder: 30 },
  { key: 'C',  label: 'เบอร์ C',  dim: '20×30×11 ซม.',     reorder: 20 },
  { key: 'D',  label: 'เบอร์ D',  dim: '22×35×14 ซม.',     reorder: 10 }
];

function boxItems_() {
  return BOX_SIZES.map(function (b) {
    return {
      code: 'MT-BOX-' + b.key,
      name: 'กล่องพัสดุ ' + b.label + ' (' + b.dim + ')',
      type: 'วัสดุอุปกรณ์', unit: 'ใบ', reorder: b.reorder
    };
  });
}

function beanNameOf_(roastName) {
  var n = String(roastName || '').trim();
  for (var i = 0; i < BEAN_NAMES.length; i++) if (BEAN_NAMES[i].roast === n) return BEAN_NAMES[i].name;
  return 'เมล็ดคั่ว ' + n;
}

var SIZES = [250, 500, 1000];

var DEFAULT_SETTINGS = [
  ['หัวข้อ','ค่า','คำอธิบาย'],
  ['ระดับการคั่ว','คั่วอ่อน, คั่วกลาง, คั่วกลางค่อนเข้ม, คั่วเข้ม','คั่นด้วยจุลภาค'],
  ['ช่องทางขาย','นัดรับ, ส่งพัสดุ, ฝากส่ง','คั่นด้วยจุลภาค'],
  ['ประเภทการตัดจ่าย','ของเสีย/เสียหาย, ตัวอย่างชิม, เบิกใช้ภายใน, คืนผู้ขาย, สูญหาย','คั่นด้วยจุลภาค'],
  ['Yield มาตรฐาน สี (%)','80','กะลา 100 kg สีแล้วได้สารเขียวกี่ kg'],
  ['Yield มาตรฐาน คั่ว (%)','84','สารเขียว 100 kg คั่วแล้วได้กี่ kg'],
  ['Yield มาตรฐานรายระดับ (%)','คั่วอ่อน:87, คั่วกลาง:84, คั่วกลางค่อนเข้ม:82, คั่วเข้ม:79','ใช้ปันส่วนสารเขียวและต้นทุนให้แต่ละระดับ คั่วเข้มน้ำหนักหายมากกว่าจึงกินสารเขียวมากกว่า'],
  ['เตือนเมื่อ Yield ต่างจากมาตรฐานเกิน (%)','5',''],
  ['อายุสารเขียว (วัน)','365','ใช้ตั้งวันหมดอายุอัตโนมัติหลังสี'],
  ['อายุเมล็ดคั่ว (วัน)','180','ใช้ตั้งวันหมดอายุอัตโนมัติหลังคั่ว'],
  ['เตือนก่อนหมดอายุ (วัน)','30',''],
  ['เกณฑ์สินค้าค้างสต๊อก (วัน)','90',''],
  ['เป้าหมายอัตรากำไร (%)','40','ใช้คำนวณราคาขายที่แนะนำ'],
  ['ค่าใช้จ่ายคงที่ต่อเดือน','0','ค่าเช่าที่เก็บ ค่าน้ำค่าไฟ ค่าแรงประจำ — ใช้หักในสรุปรายเดือน'],
  ['อีเมลรับแจ้งเตือน','','เว้นว่างได้']
];

/* ══════════ Entry ══════════ */

function doGet() { return HtmlService.createHtmlOutput('<h3>ระบบต้นทุนกาแฟ เม่อะ เต เต — API พร้อมใช้งาน</h3>'); }

/* กันบันทึกซ้ำ: แอปแนบ reqId มากับทุกคำขอ ถ้าคำขอเดิมทำสำเร็จไปแล้ว
   (แต่คำตอบหายระหว่างทางจนแอปขึ้น failed to fetch แล้วส่งซ้ำ)
   ระบบจะคืนผลเดิมกลับไป ไม่บันทึกซ้ำอีกรอบ                        */
function seen_(id) {
  if (!id) return null;
  try { var v = CacheService.getScriptCache().get('rq_' + id); return v ? JSON.parse(v) : null; }
  catch (e) { return null; }
}
function remember_(id, payload) {
  if (!id) return;
  try { CacheService.getScriptCache().put('rq_' + id, JSON.stringify(payload), 21600); } catch (e) {}
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); }
  catch (parseErr) { return json_({ ok: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }); }

  /* คำขออ่านอย่างเดียว ไม่ต้องกันซ้ำและไม่ต้องล็อก */
  var readOnly = { ping: 1, bootstrap: 1, summary: 1, listDocs: 1, getDoc: 1, productDetail: 1 };

  if (!readOnly[req.action]) {
    var prev = seen_(req.reqId);
    if (prev) return json_({ ok: true, data: prev, duplicate: true });
  }

  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    locked = lock.tryLock(45000);
    if (!locked) throw new Error('ระบบกำลังบันทึกรายการอื่นอยู่ กรุณารอสักครู่แล้วลองใหม่');
    cacheClear_();
    ensureSheets_();
    var out = route_(req.action, req.payload || {});
    flush_();
    if (!readOnly[req.action]) remember_(req.reqId, out);
    return json_({ ok: true, data: out });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally { if (locked) { try { lock.releaseLock(); } catch (ig) {} } }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function route_(a, p) {
  switch (a) {
    case 'ping':          return { time: new Date().toISOString() };
    case 'bootstrap':     return bootstrap_();
    case 'buyParchment':  return buyParchment_(p);
    case 'mill':          return mill_(p);
    case 'roast':         return roast_(p);
    case 'buyMaterial':   return buyMaterial_(p);
    case 'sell':          return sell_(p);
    case 'issue':         return issue_(p);
    case 'count':         return count_(p);
    case 'saveProduct':   return saveProduct_(p);
    case 'savePackSpec':  return savePackSpec_(p);
    case 'summary':       return summary_(p);
    case 'listDocs':      return listDocs_(p);
    case 'getDoc':        return getDoc_(p);
    case 'voidDoc':       return voidDoc_(p);
    case 'updateDoc':     return updateDoc_(p);
    case 'productDetail': return productDetail_(p);
    default: throw new Error('ไม่รู้จักคำสั่ง: ' + a);
  }
}

/* ══════════ Plumbing ══════════ */

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(n) { return ss_().getSheetByName(n); }

function ensureColumns_(name) {
  var sh = sheet_(name);
  if (!sh) return;
  var want = H[name];
  var lastCol = Math.max(1, sh.getLastColumn());
  var have = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (x) { return String(x).trim(); });
  var add = want.filter(function (h) { return have.indexOf(h) < 0; });
  if (!add.length) return;
  sh.getRange(1, have.length + 1, 1, add.length).setValues([add])
    .setFontWeight('bold').setBackground('#6F6486').setFontColor('#FFFFFF');
}

function ensureSheets_(migrate) {
  var s = ss_();
  Object.keys(H).forEach(function (name) {
    if (s.getSheetByName(name)) { if (migrate) ensureColumns_(name); return; }
    var sh = s.insertSheet(name);
    sh.getRange(1, 1, 1, H[name].length).setValues([H[name]])
      .setFontWeight('bold').setBackground('#6F6486').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, H[name].length);
  });
  if (!s.getSheetByName(SH.SETTING)) {
    var st = s.insertSheet(SH.SETTING);
    st.getRange(1, 1, DEFAULT_SETTINGS.length, 3).setValues(DEFAULT_SETTINGS);
    st.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#6F6486').setFontColor('#FFFFFF');
    st.setFrozenRows(1);
    st.autoResizeColumns(1, 3);
  }
  var d = s.getSheetByName('Sheet1') || s.getSheetByName('ชีต1');
  if (d && d.getLastRow() === 0 && s.getSheets().length > 1) s.deleteSheet(d);
}

/* ══════════ แคชระดับคำขอ ══════════
   Apps Script เสียเวลากับการคุยกับ Google Sheets มากกว่าการคำนวณหลายเท่า
   ชีตแต่ละแผ่นจึงถูกอ่านจริงแค่ครั้งเดียวต่อ 1 คำขอ ที่เหลืออ่านจากหน่วยความจำ
   ทุกจุดที่เขียนค่าจะอัปเดตแคชไปพร้อมกัน (write-through) ข้อมูลจึงตรงเสมอ  */
var _C = {}, _DIRTY = {};
function cacheClear_() { _C = {}; _DIRTY = {}; }

/* ค่าคงเหลือของสินค้าและล็อตถูกแก้หลายครั้งใน 1 คำขอ
   จึงเก็บไว้ในแคชก่อน แล้วเขียนลงชีตครั้งเดียวตอนจบ */
function flush_() {
  if (_DIRTY[SH.PRODUCT] && _C[SH.PRODUCT] && _C[SH.PRODUCT].length) {
    var rows = _C[SH.PRODUCT];
    var block = rows.map(function (r) {
      return [n_(r['คงเหลือ']), n_(r['ต้นทุนเฉลี่ย/หน่วย']), n_(r['มูลค่าคงคลัง']), r['สถานะ'] || 'ใช้งาน', r['เคลื่อนไหวล่าสุด'] || ''];
    });
    sheet_(SH.PRODUCT).getRange(rows[0]._row, 8, block.length, 5).setValues(block);
  }
  if (_DIRTY[SH.LOT] && _C[SH.LOT] && _C[SH.LOT].length) {
    var lots = _C[SH.LOT];
    var col = lots.map(function (l) { return [n_(l['คงเหลือ'])]; });
    sheet_(SH.LOT).getRange(lots[0]._row, 7, col.length, 1).setValues(col);
  }
  _DIRTY = {};
}

function readAll_(name) {
  if (_C[name]) return _C[name];
  var sh = sheet_(name), last = sh.getLastRow();
  var head = H[name], out = [];
  if (last >= 2) {
    out = sh.getRange(2, 1, last - 1, head.length).getValues().map(function (row, i) {
      var o = { _row: i + 2 };
      head.forEach(function (h, c) { o[h] = row[c]; });
      return o;
    });
  }
  _C[name] = out;
  return out;
}

function append_(name, obj) {
  var head = H[name];
  var vals = head.map(function (h) { return obj[h] === undefined ? '' : obj[h]; });
  var sh = sheet_(name);
  sh.appendRow(vals);
  if (_C[name]) {                       /* ต่อแถวใหม่เข้าแคชแทนการอ่านชีตซ้ำ */
    var rows = _C[name];
    var o = { _row: (rows.length ? rows[rows.length - 1]._row + 1 : 2) };
    head.forEach(function (h, c) { o[h] = vals[c]; });
    rows.push(o);
  }
}

/* เขียนค่าลงชีตพร้อมอัปเดตแถวในแคชให้ตรงกัน */
function put_(name, rowObj, colName, value) {
  var col = H[name].indexOf(colName) + 1;
  if (col < 1) return;
  sheet_(name).getRange(rowObj._row, col).setValue(value);
  rowObj[colName] = value;
}

function settings_() {
  if (_C.__set) return _C.__set;
  var sh = sheet_(SH.SETTING), last = sh.getLastRow(), o = {};
  if (last < 2) { _C.__set = o; return o; }
  sh.getRange(2, 1, last - 1, 2).getValues().forEach(function (r) { if (r[0]) o[String(r[0]).trim()] = r[1]; });
  _C.__set = o;
  return o;
}
function list_(k) {
  var v = settings_()[k];
  return v ? String(v).split(',').map(function (x) { return x.trim(); }).filter(String) : [];
}

function live_(rows) { return rows.filter(function (r) { return r['สถานะ'] !== 'ยกเลิก'; }); }

function n_(v) { var x = Number(v); return isNaN(x) ? 0 : x; }
function r2_(x) { return Math.round((x + Number.EPSILON) * 100) / 100; }
function r4_(x) { return Math.round((x + Number.EPSILON) * 10000) / 10000; }
function d_(v) {
  if (!v) return '';
  var dt = (v instanceof Date) ? v : new Date(v);
  return isNaN(dt.getTime()) ? String(v) : Utilities.formatDate(dt, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
function today_() { return d_(new Date()); }
function addDays_(isoStr, days) {
  var dt = new Date(isoStr + 'T00:00:00');
  dt.setDate(dt.getDate() + n_(days));
  return d_(dt);
}
function doc_(prefix, sheetName) {
  var ym = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMM');
  var n = Math.max(0, sheet_(sheetName).getLastRow() - 1) + 1;
  return prefix + ym + '-' + ('000' + n).slice(-3);
}

/* ══════════ Inventory core ══════════ */

function findP_(code) {
  var rows = readAll_(SH.PRODUCT);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i]['รหัสสินค้า']).trim() === String(code).trim()) return rows[i];
  }
  return null;
}
function mustP_(code) {
  var p = findP_(code);
  if (!p) throw new Error('ไม่พบสินค้ารหัส ' + code);
  return p;
}
function firstOfType_(type) {
  var rows = readAll_(SH.PRODUCT);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['ประเภท'] === type && rows[i]['สถานะ'] !== 'ยกเลิกใช้') return rows[i];
  }
  return null;
}

function setBal_(p, qty, avg) {
  readAll_(SH.PRODUCT);                     /* ให้แน่ใจว่าแคชพร้อม */
  p['คงเหลือ'] = r4_(qty); p['ต้นทุนเฉลี่ย/หน่วย'] = r2_(avg);
  p['มูลค่าคงคลัง'] = r2_(qty * avg); p['เคลื่อนไหวล่าสุด'] = today_();
  _DIRTY[SH.PRODUCT] = true;
}

function receive_(code, qty, totalCost, opt) {
  opt = opt || {};
  var p = mustP_(code);
  if (qty <= 0) throw new Error('จำนวนรับเข้าต้องมากกว่า 0');
  var oldQ = n_(p['คงเหลือ']), oldA = n_(p['ต้นทุนเฉลี่ย/หน่วย']);
  var newQ = oldQ + qty, newA = newQ > 0 ? (oldQ * oldA + totalCost) / newQ : 0;
  var lotNo = opt.lotNo || doc_('L', SH.LOT);
  append_(SH.LOT, {
    'เลขที่ล็อต': lotNo, 'รหัสสินค้า': code, 'ชื่อสินค้า': p['ชื่อสินค้า'],
    'วันที่รับ': opt.date || today_(), 'วันหมดอายุ': opt.expiry || '',
    'จำนวนรับ': r4_(qty), 'คงเหลือ': r4_(qty), 'ต้นทุน/หน่วย': r2_(totalCost / qty),
    'ที่มา': opt.source || '', 'อ้างอิงเอกสาร': opt.ref || ''
  });
  setBal_(p, newQ, newA);
  return { lotNo: lotNo, unitCost: r2_(totalCost / qty), newQty: r4_(newQ), newAvg: r2_(newA) };
}

function consume_(code, qty, allowNeg) {
  var p = mustP_(code);
  if (qty <= 0) throw new Error('จำนวนต้องมากกว่า 0');
  var have = n_(p['คงเหลือ']);
  if (qty > have + 0.0001 && !allowNeg) {
    throw new Error(p['ชื่อสินค้า'] + ' คงเหลือไม่พอ: มี ' + r4_(have) + ' ' + p['หน่วยนับ'] + ' ต้องการ ' + r4_(qty));
  }
  var avg = n_(p['ต้นทุนเฉลี่ย/หน่วย']);
  var sh = sheet_(SH.LOT), remain = qty, used = [];
  readAll_(SH.LOT)
    .filter(function (l) { return String(l['รหัสสินค้า']).trim() === String(code).trim() && n_(l['คงเหลือ']) > 0; })
    .sort(function (a, b) {
      var ea = a['วันหมดอายุ'] ? d_(a['วันหมดอายุ']) : '9999-12-31';
      var eb = b['วันหมดอายุ'] ? d_(b['วันหมดอายุ']) : '9999-12-31';
      if (ea !== eb) return ea < eb ? -1 : 1;
      return d_(a['วันที่รับ']) < d_(b['วันที่รับ']) ? -1 : 1;
    })
    .forEach(function (l) {
      if (remain <= 0) return;
      var take = Math.min(n_(l['คงเหลือ']), remain);
      l['คงเหลือ'] = r4_(n_(l['คงเหลือ']) - take); _DIRTY[SH.LOT] = true;
      used.push(l['เลขที่ล็อต'] + '(' + r4_(take) + ')');
      remain -= take;
    });
  if (remain > 0.0001) used.push('ไม่ระบุล็อต(' + r4_(remain) + ')');
  setBal_(p, have - qty, avg);
  return { cost: r2_(avg * qty), unitCost: r2_(avg), lots: used.join(', '), product: p };
}

function saveProduct_(p) {
  var code = String(p.code || '').trim();
  if (!code) throw new Error('กรุณาระบุรหัสสินค้า');
  if (!p.name) throw new Error('กรุณาระบุชื่อสินค้า');
  var ex = findP_(code), sh = sheet_(SH.PRODUCT);
  if (ex) {
    var vals = [p.name, p.type || ex['ประเภท'], p.roast || '', p.unit || '', n_(p.price), n_(p.reorder)];
    sh.getRange(ex._row, 2, 1, 6).setValues([vals]);
    sh.getRange(ex._row, 11).setValue(p.active === false ? 'ยกเลิกใช้' : 'ใช้งาน');
    ['ชื่อสินค้า','ประเภท','ระดับคั่ว','หน่วยนับ','ราคาขาย','จุดสั่งซื้อ'].forEach(function (h, i) { ex[h] = vals[i]; });
    ex['สถานะ'] = p.active === false ? 'ยกเลิกใช้' : 'ใช้งาน';
    return { code: code, updated: true };
  }
  append_(SH.PRODUCT, {
    'รหัสสินค้า': code, 'ชื่อสินค้า': p.name, 'ประเภท': p.type || 'วัสดุอุปกรณ์',
    'ระดับคั่ว': p.roast || '', 'หน่วยนับ': p.unit || '', 'ราคาขาย': n_(p.price), 'จุดสั่งซื้อ': n_(p.reorder),
    'คงเหลือ': 0, 'ต้นทุนเฉลี่ย/หน่วย': 0, 'มูลค่าคงคลัง': 0, 'สถานะ': 'ใช้งาน', 'เคลื่อนไหวล่าสุด': today_()
  });
  if (n_(p.openingQty) > 0) {
    receive_(code, n_(p.openingQty), n_(p.openingQty) * n_(p.openingCost), {
      lotNo: 'ยกมา-' + code, source: 'ยอดยกมา', ref: 'ยอดยกมา'
    });
  }
  return { code: code, created: true };
}

function savePackSpec_(p) {
  var rows = readAll_(SH.PACKSPEC), sh = sheet_(SH.PACKSPEC);
  var pouch = p.pouchCode ? findP_(p.pouchCode) : null;
  var vals = [n_(p.size), p.pouchCode || '', pouch ? pouch['ชื่อสินค้า'] : '', n_(p.pouchQty) || 1, p.stickerCode || '', n_(p.stickerQty) || 1];
  for (var i = 0; i < rows.length; i++) {
    if (n_(rows[i]['ขนาด (g)']) === n_(p.size)) {
      sh.getRange(rows[i]._row, 1, 1, 6).setValues([vals]);
      H[SH.PACKSPEC].forEach(function (h, c) { rows[i][h] = vals[c]; });
      return { updated: true };
    }
  }
  sh.appendRow(vals);
  return { created: true };
}

function packSpec_(size) {
  var rows = readAll_(SH.PACKSPEC);
  for (var i = 0; i < rows.length; i++) if (n_(rows[i]['ขนาด (g)']) === n_(size)) return rows[i];
  return null;
}

/* ══════════ 1. ซื้อกาแฟกะลา ══════════ */

function buyParchment_(p) {
  var code = p.code || (firstOfType_('กาแฟกะลา') || {})['รหัสสินค้า'];
  if (!code) throw new Error('ยังไม่มีรายการกาแฟกะลาในระบบ');
  var prod = mustP_(code);
  var qty = n_(p.qty);
  var total = qty * n_(p.unitPrice) + n_(p.freight);
  var docNo = doc_('PC', SH.BUYPC);
  var res = receive_(code, qty, total, { date: p.date || today_(), lotNo: p.lotNo, source: 'ซื้อกะลา', ref: docNo });
  append_(SH.BUYPC, {
    'เลขที่เอกสาร': docNo, 'วันที่': p.date || today_(),
    'รหัสสินค้า': code, 'ชื่อสินค้า': prod['ชื่อสินค้า'],
    'จำนวน (kg)': r4_(qty), 'ราคา/kg': n_(p.unitPrice), 'ค่าขนส่ง': n_(p.freight),
    'ต้นทุนรวม': r2_(total), 'ต้นทุนจริง/kg': res.unitCost, 'เลขที่ล็อต': res.lotNo,
    'ผู้ขาย/เกษตรกร': p.supplier || '', 'หมายเหตุ': p.note || '',
    'ผู้บันทึก': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
  });
  return { docNo: docNo, unitCost: res.unitCost, newAvg: res.newAvg, qty: res.newQty };
}

/* ══════════ 2. ผลิตสารเขียว ══════════ */

function mill_(p) {
  var st = settings_();
  var qtyIn = n_(p.qtyIn), qtyOut = n_(p.qtyOut);
  if (qtyIn <= 0) throw new Error('กรอกน้ำหนักกะลาที่ตัดเบิก');
  if (qtyOut <= 0) throw new Error('กรอกน้ำหนักสารเขียวที่ได้');
  if (qtyOut > qtyIn) throw new Error('สารเขียวที่ได้มากกว่ากะลาที่ใช้ กรุณาตรวจสอบตัวเลข');

  var inCode = p.inCode || (firstOfType_('กาแฟกะลา') || {})['รหัสสินค้า'];
  var outCode = p.outCode || (firstOfType_('สารเขียว') || {})['รหัสสินค้า'];
  if (!inCode || !outCode) throw new Error('ยังไม่มีรายการกะลาหรือสารเขียวในระบบ');

  var used = consume_(inCode, qtyIn, false);
  var millRate = n_(p.millRate);
  var millTotal = (p.millTotal !== undefined && p.millTotal !== '') ? n_(p.millTotal) : millRate * qtyIn;
  var freight = n_(p.freight);
  var total = used.cost + millTotal + freight;
  var unit = total / qtyOut;
  var yieldPct = qtyOut / qtyIn * 100;

  var date = p.date || today_();
  var shelf = n_(st['อายุสารเขียว (วัน)']);
  var expiry = p.expiry || (shelf > 0 ? addDays_(date, shelf) : '');
  var docNo = doc_('GB', SH.MILL);
  var res = receive_(outCode, qtyOut, total, { date: date, expiry: expiry, source: 'ผลิตสารเขียว', ref: docNo });

  append_(SH.MILL, {
    'เลขที่เอกสาร': docNo, 'วันที่': date,
    'กะลาที่ตัดเบิก (kg)': r4_(qtyIn), 'ต้นทุนกะลา': used.cost,
    'สารเขียวที่ได้ (kg)': r4_(qtyOut), 'น้ำหนักหาย (kg)': r4_(qtyIn - qtyOut), '% Yield': r2_(yieldPct),
    'ค่าสี/kg': millRate, 'ค่าสีรวม': r2_(millTotal), 'ค่าส่งสารเขียว': freight,
    'ต้นทุนรวม': r2_(total), 'ต้นทุนสารเขียว/kg': r2_(unit),
    'เลขที่ล็อต': res.lotNo, 'วันหมดอายุ': expiry, 'โรงสี': p.vendor || '', 'หมายเหตุ': p.note || '',
    'ผู้บันทึก': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
  });

  var std = n_(st['Yield มาตรฐาน สี (%)']);
  var tol = n_(st['เตือนเมื่อ Yield ต่างจากมาตรฐานเกิน (%)']) || 5;
  return {
    docNo: docNo, lost: r4_(qtyIn - qtyOut), yieldPct: r2_(yieldPct),
    materialCost: used.cost, totalCost: r2_(total), unitCost: r2_(unit), newAvg: res.newAvg, expiry: expiry,
    warn: (std > 0 && Math.abs(yieldPct - std) > tol) ? 'Yield ' + r2_(yieldPct) + '% ต่างจากมาตรฐาน ' + std + '%' : ''
  };
}

/* ══════════ 3. ผลิตเมล็ดคั่ว ══════════
   กรอกสารเขียวเป็นยอดเดียว แล้วกรอกเมล็ดคั่วที่ได้แยกตามระดับ
   ระบบปันส่วนสารเขียวและต้นทุนให้แต่ละระดับตาม Yield มาตรฐานรายระดับ
   (คั่วเข้มน้ำหนักหายมากกว่า จึงกินสารเขียวต่อ 1 kg ผลผลิตมากกว่า)
   ═══════════════════════════════════════════════════════════ */

function stdByRoast_() {
  var st = settings_();
  var raw = st['Yield มาตรฐานรายระดับ (%)'];
  var fallback = n_(st['Yield มาตรฐาน คั่ว (%)']) || 84;
  var map = {};
  if (raw) {
    String(raw).split(',').forEach(function (part) {
      var kv = part.split(':');
      if (kv.length === 2) {
        var k = kv[0].trim(), v = n_(kv[1]);
        if (k && v > 0) map[k] = v;
      }
    });
  }
  return { map: map, fallback: fallback };
}

/* หา (หรือสร้าง) รายการเมล็ดคั่วของระดับที่ระบุ */
function beanForRoast_(roastName, code) {
  if (code) { var byCode = findP_(code); if (byCode) return String(byCode['รหัสสินค้า']); }
  var name = String(roastName || '').trim();
  if (!name) throw new Error('ไม่ได้ระบุระดับคั่ว');
  var rows = readAll_(SH.PRODUCT);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['ประเภท'] === 'เมล็ดคั่ว' && String(rows[i]['ระดับคั่ว']).trim() === name)
      return String(rows[i]['รหัสสินค้า']);
  }
  for (var j = 0; j < rows.length; j++) {
    if (rows[j]['ประเภท'] === 'เมล็ดคั่ว' && String(rows[j]['ชื่อสินค้า']).indexOf(name) >= 0)
      return String(rows[j]['รหัสสินค้า']);
  }
  /* ยังไม่มี — สร้างให้อัตโนมัติ */
  var map = { 'คั่วอ่อน': 'LT', 'คั่วกลาง': 'MD', 'คั่วกลางค่อนเข้ม': 'MDK', 'คั่วเข้ม': 'DK' };
  var suffix = map[name] || ('R' + (rows.length + 1));
  var newCode = 'RB-' + suffix;
  if (findP_(newCode)) newCode = 'RB-' + suffix + '-' + (rows.length + 1);
  saveProduct_({ code: newCode, name: beanNameOf_(name), type: 'เมล็ดคั่ว', roast: name, unit: 'kg', reorder: 3 });
  return newCode;
}

function roast_(p) {
  var st = settings_();
  var qtyIn = n_(p.qtyIn);
  var lines = (p.lines || []).filter(function (l) { return n_(l.qtyOut) > 0; });
  if (qtyIn <= 0) throw new Error('กรอกน้ำหนักสารเขียวที่ตัดเบิก');
  if (!lines.length) throw new Error('กรอกน้ำหนักเมล็ดคั่วอย่างน้อยหนึ่งระดับ');

  lines.forEach(function (l) { l.code = beanForRoast_(l.roast, l.code); });

  var totalOut = 0;
  lines.forEach(function (l) { totalOut += n_(l.qtyOut); });
  if (totalOut > qtyIn) throw new Error('เมล็ดคั่วรวม ' + r4_(totalOut) + ' kg มากกว่าสารเขียวที่ใช้ ' + r4_(qtyIn) + ' kg');

  var inCode = p.inCode || (firstOfType_('สารเขียว') || {})['รหัสสินค้า'];
  if (!inCode) throw new Error('ยังไม่มีรายการสารเขียวในระบบ');

  var used = consume_(inCode, qtyIn, false);
  var laborTotal = (p.laborTotal !== undefined && p.laborTotal !== '') ? n_(p.laborTotal) : n_(p.laborRate) * qtyIn;
  var rentTotal = (p.rentTotal !== undefined && p.rentTotal !== '') ? n_(p.rentTotal) : n_(p.rentRate) * qtyIn;

  /* ปันส่วนสารเขียวตามความ "กินวัตถุดิบ" ของแต่ละระดับ */
  var sb = stdByRoast_();
  var weights = [], sumW = 0;
  lines.forEach(function (l) {
    var name = l.roast || (findP_(l.code) || {})['ระดับคั่ว'] || '';
    var std = sb.map[name] || sb.fallback;
    var w = n_(l.qtyOut) / (std / 100);
    weights.push({ w: w, std: std, name: name });
    sumW += w;
  });

  var date = p.date || today_();
  var shelf = n_(st['อายุเมล็ดคั่ว (วัน)']);
  var expiry = p.expiry || (shelf > 0 ? addDays_(date, shelf) : '');
  var docNo = doc_('RB', SH.ROAST);

  var tol = n_(st['เตือนเมื่อ Yield ต่างจากมาตรฐานเกิน (%)']) || 5;
  var out = [], warns = [];

  lines.forEach(function (l, idx) {
    var share = sumW > 0 ? weights[idx].w / sumW : 1 / lines.length;
    var greenAlloc = qtyIn * share;
    var matCost = r2_(used.unitCost * greenAlloc);
    var labor = r2_(laborTotal * share);
    var rent = r2_(rentTotal * share);
    var tot = matCost + labor + rent;
    var qOut = n_(l.qtyOut);
    var unit = tot / qOut;
    var y = greenAlloc > 0 ? qOut / greenAlloc * 100 : 0;
    var res = receive_(l.code, qOut, tot, { date: date, expiry: expiry, source: 'ผลิตเมล็ดคั่ว', ref: docNo });

    append_(SH.ROAST, {
      'เลขที่เอกสาร': docNo, 'วันที่': date, 'ระดับคั่ว': weights[idx].name || l.code,
      'รหัสผลผลิต': l.code,
      'สารเขียวรวมทั้งรอบ (kg)': r4_(qtyIn), 'สารเขียวที่ปันส่วน (kg)': r4_(greenAlloc),
      'เมล็ดคั่วที่ได้ (kg)': r4_(qOut), 'น้ำหนักหาย (kg)': r4_(greenAlloc - qOut), '% Yield': r2_(y),
      'ต้นทุนสารเขียว': matCost, 'ค่าแรงจ้างคั่ว': labor, 'ค่าเช่าเครื่องคั่ว': rent,
      'ต้นทุนรวม': r2_(tot), 'ต้นทุน/kg': r2_(unit),
      'เลขที่ล็อต': res.lotNo, 'วันหมดอายุ': expiry, 'ผู้คั่ว': p.vendor || '', 'หมายเหตุ': p.note || '',
      'ผู้บันทึก': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
    });

    if (Math.abs(y - weights[idx].std) > tol) warns.push(weights[idx].name + ' ' + r2_(y) + '%');
    out.push({
      roast: weights[idx].name, code: l.code, greenAlloc: r4_(greenAlloc),
      qtyOut: r4_(qOut), yieldPct: r2_(y), unitCost: r2_(unit), newAvg: res.newAvg
    });
  });

  var overall = qtyIn > 0 ? totalOut / qtyIn * 100 : 0;
  return {
    docNo: docNo, totalIn: r4_(qtyIn), totalOut: r4_(totalOut),
    lost: r4_(qtyIn - totalOut), yieldPct: r2_(overall),
    materialCost: used.cost, labor: r2_(laborTotal), rent: r2_(rentTotal),
    totalCost: r2_(used.cost + laborTotal + rentTotal), lines: out, expiry: expiry,
    warn: warns.length ? 'Yield ต่างจากมาตรฐาน: ' + warns.join(', ') : ''
  };
}

/* ══════════ 4. ซื้อวัสดุอุปกรณ์ ══════════ */

function buyMaterial_(p) {
  var prod = mustP_(p.code);
  var qty = n_(p.qty);
  var total = qty * n_(p.unitPrice) + n_(p.freight);
  var docNo = doc_('MT', SH.BUYMAT);
  var res = receive_(p.code, qty, total, { date: p.date || today_(), source: 'ซื้อวัสดุ', ref: docNo });
  append_(SH.BUYMAT, {
    'เลขที่เอกสาร': docNo, 'วันที่': p.date || today_(),
    'รหัสสินค้า': p.code, 'ชื่อวัสดุ': prod['ชื่อสินค้า'],
    'จำนวน': r4_(qty), 'ราคา/หน่วย': n_(p.unitPrice), 'ค่าขนส่ง': n_(p.freight),
    'ต้นทุนรวม': r2_(total), 'ต้นทุนจริง/หน่วย': res.unitCost, 'เลขที่ล็อต': res.lotNo,
    'ผู้ขาย': p.supplier || '', 'หมายเหตุ': p.note || '',
    'ผู้บันทึก': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
  });
  return { docNo: docNo, unitCost: res.unitCost, newAvg: res.newAvg, qty: res.newQty };
}

/* ══════════ 5. ขาย ══════════ */

function sell_(p) {
  var lines = p.lines || [];
  if (!lines.length) throw new Error('ยังไม่ได้เพิ่มรายการขาย');
  var date = p.date || today_();
  var docNo = doc_('SO', SH.ORDER);

  var goods = 0, beanCost = 0, packCost = 0;

  lines.forEach(function (ln) {
    var qty = n_(ln.qty);
    if (qty <= 0) return;
    var prod = mustP_(ln.code);
    var isBag = String(ln.kind) === 'ซอง';
    var size = isBag ? n_(ln.size) : 0;
    var kg = isBag ? qty * size / 1000 : qty;

    var res = consume_(ln.code, kg, !!p.allowNegative);
    var beanUnit = isBag ? r2_(res.unitCost * size / 1000) : res.unitCost;

    var pouchUnit = 0, stickUnit = 0;
    if (isBag) {
      var spec = packSpec_(size);
      if (spec) {
        if (spec['รหัสซอง']) {
          var pc = consume_(spec['รหัสซอง'], qty * (n_(spec['ซอง/หน่วย']) || 1), true);
          pouchUnit = r2_(pc.cost / qty); packCost += pc.cost;
        }
        if (spec['รหัสสติ๊กเกอร์']) {
          var sc = consume_(spec['รหัสสติ๊กเกอร์'], qty * (n_(spec['สติ๊กเกอร์/หน่วย']) || 1), true);
          stickUnit = r2_(sc.cost / qty); packCost += sc.cost;
        }
      }
    }

    var unitCost = beanUnit + pouchUnit + stickUnit;
    var value = qty * n_(ln.price);
    goods += value; beanCost += res.cost;

    append_(SH.LINE, {
      'เลขที่ออร์เดอร์': docNo, 'วันที่': date,
      'ประเภท': isBag ? 'เมล็ดคั่ว' : prod['ประเภท'],
      'ระดับคั่ว': prod['ระดับคั่ว'] || '', 'ขนาด (g)': isBag ? size : '',
      'จำนวน (ซอง/kg)': r4_(qty), 'น้ำหนักรวม (kg)': r4_(kg),
      'ราคา/หน่วย': n_(ln.price), 'มูลค่า': r2_(value),
      'ต้นทุนเมล็ด/หน่วย': beanUnit, 'ต้นทุนซอง/หน่วย': pouchUnit, 'ต้นทุนสติ๊กเกอร์/หน่วย': stickUnit,
      'ต้นทุนรวม/หน่วย': r2_(unitCost), 'ต้นทุนรวม': r2_(unitCost * qty),
      'กำไรขั้นต้น': r2_(value - unitCost * qty), 'ล็อตที่ตัด': res.lots, 'สถานะ': 'ใช้งาน'
    });
  });

  /* กล่อง + เทป ต่อออร์เดอร์ */
  var boxCost = 0, boxUsed = [];
  (p.packItems || []).forEach(function (it) {
    if (n_(it.qty) <= 0) return;
    var c = consume_(it.code, n_(it.qty), true);
    boxCost += c.cost;
    boxUsed.push(it.code + '(' + r4_(n_(it.qty)) + '@' + c.unitCost + ')');
  });

  var shipIn = n_(p.shipCharged), shipOut = n_(p.shipPaid);
  var revenue = goods + shipIn;
  var totalCost = beanCost + packCost + boxCost + shipOut;
  var profit = revenue - totalCost;

  append_(SH.ORDER, {
    'เลขที่ออร์เดอร์': docNo, 'วันที่': date, 'ลูกค้า': p.customer || '', 'ช่องทางขาย': p.channel || '',
    'มูลค่าสินค้า': r2_(goods), 'ค่าส่งที่เก็บลูกค้า': shipIn, 'รายได้รวม': r2_(revenue),
    'ต้นทุนเมล็ด': r2_(beanCost), 'ต้นทุนซอง+สติ๊กเกอร์': r2_(packCost), 'ต้นทุนกล่อง+เทป': r2_(boxCost),
    'ค่าส่งที่จ่ายจริง': shipOut, 'ต้นทุนรวม': r2_(totalCost), 'กำไรสุทธิ': r2_(profit),
    '% กำไร': revenue > 0 ? r2_(profit / revenue * 100) : 0,
    'กล่อง/เทปที่ใช้': boxUsed.join(', '), 'หมายเหตุ': p.note || '', 'ผู้บันทึก': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
  });

  return {
    docNo: docNo, revenue: r2_(revenue), beanCost: r2_(beanCost), packCost: r2_(packCost),
    boxCost: r2_(boxCost), shipPaid: shipOut, profit: r2_(profit),
    marginPct: revenue > 0 ? r2_(profit / revenue * 100) : 0
  };
}

/* ══════════ ตัดจ่ายอื่นๆ / ตรวจนับ ══════════ */

function issue_(p) {
  var res = consume_(p.code, n_(p.qty), true);
  var docNo = doc_('IS', SH.ISSUE);
  append_(SH.ISSUE, {
    'เลขที่เอกสาร': docNo, 'วันที่': p.date || today_(), 'ประเภท': p.type || 'ของเสีย/เสียหาย',
    'รหัสสินค้า': p.code, 'ชื่อสินค้า': res.product['ชื่อสินค้า'], 'จำนวน': r4_(n_(p.qty)),
    'ต้นทุน/หน่วย': res.unitCost, 'มูลค่าที่ตัด': res.cost, 'ล็อตที่ตัด': res.lots,
    'หมายเหตุ': p.note || '', 'ผู้บันทึก': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
  });
  return { docNo: docNo, value: res.cost };
}

function count_(p) {
  var prod = mustP_(p.code);
  var sys = n_(prod['คงเหลือ']), real = n_(p.countedQty);
  var diff = r4_(real - sys), avg = n_(prod['ต้นทุนเฉลี่ย/หน่วย']);
  append_(SH.COUNT, {
    'วันที่': p.date || today_(), 'รหัสสินค้า': p.code, 'ชื่อสินค้า': prod['ชื่อสินค้า'],
    'ยอดตามระบบ': sys, 'ยอดนับจริง': real, 'ผลต่าง': diff, 'มูลค่าผลต่าง': r2_(diff * avg),
    'เหตุผล': p.reason || '', 'ผู้ตรวจนับ': p.user || '', 'บันทึกเมื่อ': new Date(), 'สถานะ': 'ใช้งาน'
  });
  if (diff < 0) consume_(p.code, Math.abs(diff), true);
  else if (diff > 0) receive_(p.code, diff, diff * avg, { source: 'ปรับยอดตรวจนับ', ref: 'ตรวจนับ ' + today_() });
  setBal_(mustP_(p.code), real, avg);
  return { diff: diff, value: r2_(diff * avg) };
}

/* ══════════ Bootstrap ══════════ */

function bootstrap_() {
  var st = settings_(), SB = stdByRoast_();
  var expDays = n_(st['เตือนก่อนหมดอายุ (วัน)']) || 30;
  var deadDays = n_(st['เกณฑ์สินค้าค้างสต๊อก (วัน)']) || 90;
  var target = n_(st['เป้าหมายอัตรากำไร (%)']) || 40;
  var t = today_();

  var products = readAll_(SH.PRODUCT).map(function (p) {
    return {
      code: String(p['รหัสสินค้า']), name: p['ชื่อสินค้า'], type: p['ประเภท'], roast: p['ระดับคั่ว'],
      unit: p['หน่วยนับ'], price: n_(p['ราคาขาย']), reorder: n_(p['จุดสั่งซื้อ']),
      qty: n_(p['คงเหลือ']), avgCost: n_(p['ต้นทุนเฉลี่ย/หน่วย']),
      value: r2_(n_(p['คงเหลือ']) * n_(p['ต้นทุนเฉลี่ย/หน่วย'])),
      active: p['สถานะ'] !== 'ยกเลิกใช้', lastMove: d_(p['เคลื่อนไหวล่าสุด'])
    };
  });

  var lots = readAll_(SH.LOT).filter(function (l) { return n_(l['คงเหลือ']) > 0; }).map(function (l) {
    return {
      lotNo: l['เลขที่ล็อต'], code: String(l['รหัสสินค้า']), name: l['ชื่อสินค้า'],
      received: d_(l['วันที่รับ']), expiry: d_(l['วันหมดอายุ']),
      qty: n_(l['คงเหลือ']), cost: n_(l['ต้นทุน/หน่วย']), source: l['ที่มา']
    };
  });

  var specs = readAll_(SH.PACKSPEC).map(function (s) {
    return {
      size: n_(s['ขนาด (g)']), pouchCode: String(s['รหัสซอง'] || ''), pouchQty: n_(s['ซอง/หน่วย']) || 1,
      stickerCode: String(s['รหัสสติ๊กเกอร์'] || ''), stickerQty: n_(s['สติ๊กเกอร์/หน่วย']) || 1
    };
  });

  var mills = live_(readAll_(SH.MILL)), roasts = live_(readAll_(SH.ROAST));
  var mi = 0, mo = 0, ri = 0, ro = 0;
  mills.forEach(function (r) { mi += n_(r['กะลาที่ตัดเบิก (kg)']); mo += n_(r['สารเขียวที่ได้ (kg)']); });
  roasts.forEach(function (r) { ri += n_(r['สารเขียวที่ปันส่วน (kg)']); ro += n_(r['เมล็ดคั่วที่ได้ (kg)']); });
  var yMill = mi > 0 ? mo / mi : n_(st['Yield มาตรฐาน สี (%)']) / 100;
  var yRoast = ri > 0 ? ro / ri : n_(st['Yield มาตรฐาน คั่ว (%)']) / 100;

  var yieldByRoast = {};
  roasts.forEach(function (r) {
    var k = r['ระดับคั่ว'] || 'ไม่ระบุ';
    if (!yieldByRoast[k]) yieldByRoast[k] = { i: 0, o: 0 };
    yieldByRoast[k].i += n_(r['สารเขียวที่ปันส่วน (kg)']); yieldByRoast[k].o += n_(r['เมล็ดคั่วที่ได้ (kg)']);
  });
  var roastYields = Object.keys(yieldByRoast).map(function (k) {
    var v = yieldByRoast[k];
    return { roast: k, yieldPct: v.i > 0 ? r2_(v.o / v.i * 100) : 0, kgIn: r4_(v.i), kgOut: r4_(v.o) };
  });

  var ym = t.slice(0, 7);
  var orders = live_(readAll_(SH.ORDER));
  var mRev = 0, mProfit = 0, mOrders = 0;
  orders.forEach(function (o) {
    if (d_(o['วันที่']).slice(0, 7) !== ym) return;
    mRev += n_(o['รายได้รวม']); mProfit += n_(o['กำไรสุทธิ']); mOrders++;
  });

  var recent = [];
  live_(readAll_(SH.BUYPC)).slice(-6).forEach(function (r) {
    recent.push({ step: 1, doc: r['เลขที่เอกสาร'], date: d_(r['วันที่']), name: 'ซื้อกะลา ' + r4_(n_(r['จำนวน (kg)'])) + ' kg', amt: n_(r['ต้นทุนรวม']) });
  });
  mills.slice(-6).forEach(function (r) {
    recent.push({ step: 2, doc: r['เลขที่เอกสาร'], date: d_(r['วันที่']), name: 'สารเขียว ' + r4_(n_(r['สารเขียวที่ได้ (kg)'])) + ' kg', amt: n_(r['ต้นทุนรวม']), yieldPct: n_(r['% Yield']) });
  });
  roasts.slice(-8).forEach(function (r) {
    recent.push({ step: 3, doc: r['เลขที่เอกสาร'], date: d_(r['วันที่']), name: r['ระดับคั่ว'] + ' ' + r4_(n_(r['เมล็ดคั่วที่ได้ (kg)'])) + ' kg', amt: n_(r['ต้นทุนรวม']), yieldPct: n_(r['% Yield']) });
  });
  live_(readAll_(SH.BUYMAT)).slice(-6).forEach(function (r) {
    recent.push({ step: 4, doc: r['เลขที่เอกสาร'], date: d_(r['วันที่']), name: 'ซื้อ ' + r['ชื่อวัสดุ'], amt: n_(r['ต้นทุนรวม']) });
  });
  orders.slice(-10).forEach(function (r) {
    recent.push({ step: 5, doc: r['เลขที่ออร์เดอร์'], date: d_(r['วันที่']), name: 'ขาย ' + (r['ลูกค้า'] || r['ช่องทางขาย'] || ''), amt: n_(r['รายได้รวม']), profit: n_(r['กำไรสุทธิ']) });
  });
  recent.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : (a.doc < b.doc ? 1 : -1)); });

  return {
    today: t, products: products, lots: lots, packSpecs: specs, sizes: SIZES,
    expiring: lots.filter(function (l) { return l.expiry && days_(t, l.expiry) <= expDays; })
      .sort(function (a, b) { return a.expiry < b.expiry ? -1 : 1; }),
    lowStock: products.filter(function (p) { return p.active && p.reorder > 0 && p.qty <= p.reorder; }),
    deadStock: products.filter(function (p) { return p.active && p.qty > 0 && p.lastMove && days_(p.lastMove, t) > deadDays; }),
    recent: recent.slice(0, 20),
    yields: {
      mill: r2_(yMill * 100), roast: r2_(yRoast * 100),
      stdMill: n_(st['Yield มาตรฐาน สี (%)']), stdRoast: n_(st['Yield มาตรฐาน คั่ว (%)']),
      stdLevels: SB.map, stdFallback: SB.fallback,
      parchmentPerRoastedKg: (yMill * yRoast) > 0 ? r2_(1 / (yMill * yRoast)) : 0,
      byRoast: roastYields, hasActual: mi > 0 || ri > 0, batches: mills.length + roasts.length
    },
    totals: {
      stockValue: r2_(products.reduce(function (s, p) { return s + p.value; }, 0)),
      skuCount: products.filter(function (p) { return p.active; }).length,
      monthRevenue: r2_(mRev), monthProfit: r2_(mProfit), monthOrders: mOrders
    },
    settings: {
      types: TYPES, roastLevels: list_('ระดับการคั่ว'), channels: list_('ช่องทางขาย'),
      issueTypes: list_('ประเภทการตัดจ่าย'), expiryDays: expDays, targetMargin: target,
      fixedMonthly: n_(st['ค่าใช้จ่ายคงที่ต่อเดือน'])
    }
  };
}

function days_(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

/* ══════════ 6. สรุปต้นทุน-กำไร ══════════ */

/* ต้นทุนต่อซอง ไล่ย้อนจากกะลาถึงวัสดุ */
function costPerBag_() {
  var st = settings_();
  var parch = firstOfType_('กาแฟกะลา'), green = firstOfType_('สารเขียว');
  var mills = live_(readAll_(SH.MILL)), roasts = live_(readAll_(SH.ROAST));
  var mi = 0, mo = 0, ri = 0, ro = 0;
  mills.forEach(function (r) { mi += n_(r['กะลาที่ตัดเบิก (kg)']); mo += n_(r['สารเขียวที่ได้ (kg)']); });
  roasts.forEach(function (r) { ri += n_(r['สารเขียวที่ปันส่วน (kg)']); ro += n_(r['เมล็ดคั่วที่ได้ (kg)']); });
  var yM = mi > 0 ? mo / mi : n_(st['Yield มาตรฐาน สี (%)']) / 100;
  var yR = ri > 0 ? ro / ri : n_(st['Yield มาตรฐาน คั่ว (%)']) / 100;

  var parchAvg = parch ? n_(parch['ต้นทุนเฉลี่ย/หน่วย']) : 0;
  var greenAvg = green ? n_(green['ต้นทุนเฉลี่ย/หน่วย']) : 0;
  var target = n_(st['เป้าหมายอัตรากำไร (%)']) || 40;

  var beans = readAll_(SH.PRODUCT).filter(function (p) {
    return p['ประเภท'] === 'เมล็ดคั่ว' && p['สถานะ'] !== 'ยกเลิกใช้';
  });

  var out = [];
  beans.forEach(function (b) {
    var roastAvg = n_(b['ต้นทุนเฉลี่ย/หน่วย']);
    /* แยกส่วนประกอบต้นทุนต่อ kg เมล็ดคั่ว */
    var greenPerKg = yR > 0 ? greenAvg / yR : 0;                  // มูลค่าสารเขียวที่ใช้
    var roastFee = Math.max(0, roastAvg - greenPerKg);            // ค่าแรง + ค่าเช่าเครื่อง
    var parchPerKg = (yM > 0 && yR > 0) ? parchAvg / (yM * yR) : 0; // มูลค่ากะลา
    var millFee = Math.max(0, greenPerKg - parchPerKg);           // ค่าสี + ค่าส่ง

    SIZES.forEach(function (size) {
      var kg = size / 1000;
      var spec = packSpec_(size);
      var pouch = spec && spec['รหัสซอง'] ? findP_(spec['รหัสซอง']) : null;
      var stick = spec && spec['รหัสสติ๊กเกอร์'] ? findP_(spec['รหัสสติ๊กเกอร์']) : null;
      var pouchCost = pouch ? n_(pouch['ต้นทุนเฉลี่ย/หน่วย']) * (spec ? n_(spec['ซอง/หน่วย']) || 1 : 1) : 0;
      var stickCost = stick ? n_(stick['ต้นทุนเฉลี่ย/หน่วย']) * (spec ? n_(spec['สติ๊กเกอร์/หน่วย']) || 1 : 1) : 0;
      var beanCost = roastAvg * kg;
      var total = beanCost + pouchCost + stickCost;
      out.push({
        code: b['รหัสสินค้า'], roast: b['ชื่อสินค้า'] || b['ระดับคั่ว'], level: b['ระดับคั่ว'] || '', size: size,
        parchKg: r4_(kg / (yM * yR || 1)),
        parch: r2_(parchPerKg * kg), mill: r2_(millFee * kg),
        roastFee: r2_(roastFee * kg), bean: r2_(beanCost),
        pouch: r2_(pouchCost), sticker: r2_(stickCost),
        total: r2_(total), suggest: target < 100 ? r2_(total / (1 - target / 100)) : 0
      });
    });
  });
  return { rows: out, yieldMill: r2_(yM * 100), yieldRoast: r2_(yR * 100), target: target };
}

function summary_(p) {
  var mode = p.mode || 'month';           // day | month | year
  var key = p.key || today_();            // 2026-07-24 | 2026-07 | 2026
  var cut = mode === 'day' ? 10 : (mode === 'month' ? 7 : 4);
  var match = function (r) { return d_(r['วันที่']).slice(0, cut) === key; };

  var orders = live_(readAll_(SH.ORDER)).filter(match);
  var lines = live_(readAll_(SH.LINE)).filter(match);
  var pc = live_(readAll_(SH.BUYPC)).filter(match);
  var mt = live_(readAll_(SH.BUYMAT)).filter(match);
  var mills = live_(readAll_(SH.MILL)).filter(match);
  var roasts = live_(readAll_(SH.ROAST)).filter(match);
  var issues = live_(readAll_(SH.ISSUE)).filter(match);

  var sum = function (a, f) { return a.reduce(function (s, r) { return s + n_(r[f]); }, 0); };

  var revenue = sum(orders, 'รายได้รวม');
  var cogs = sum(orders, 'ต้นทุนรวม');
  var profit = sum(orders, 'กำไรสุทธิ');

  var fixed = 0;
  var st = settings_();
  var fm = n_(st['ค่าใช้จ่ายคงที่ต่อเดือน']);
  if (fm > 0) fixed = mode === 'month' ? fm : (mode === 'year' ? fm * 12 : r2_(fm / 30));

  /* แยกตามระดับคั่ว × ขนาด */
  var grid = {};
  lines.forEach(function (l) {
    var k = (l['ระดับคั่ว'] || l['ประเภท']) + '|' + (l['ขนาด (g)'] || '');
    if (!grid[k]) grid[k] = { roast: l['ระดับคั่ว'] || l['ประเภท'], size: l['ขนาด (g)'], qty: 0, sales: 0, cost: 0, profit: 0 };
    grid[k].qty += n_(l['จำนวน (ซอง/kg)']);
    grid[k].sales += n_(l['มูลค่า']);
    grid[k].cost += n_(l['ต้นทุนรวม']);
    grid[k].profit += n_(l['กำไรขั้นต้น']);
  });
  var rows = Object.keys(grid).map(function (k) {
    var r = grid[k];
    r.qty = r4_(r.qty); r.sales = r2_(r.sales); r.cost = r2_(r.cost); r.profit = r2_(r.profit);
    r.margin = r.sales > 0 ? r2_(r.profit / r.sales * 100) : 0;
    r.perUnit = r.qty > 0 ? r2_(r.cost / r.qty) : 0;
    return r;
  }).sort(function (a, b) { return b.profit - a.profit; });

  var byChannel = {};
  orders.forEach(function (o) {
    var k = o['ช่องทางขาย'] || 'ไม่ระบุ';
    if (!byChannel[k]) byChannel[k] = { channel: k, orders: 0, revenue: 0, profit: 0 };
    byChannel[k].orders++; byChannel[k].revenue += n_(o['รายได้รวม']); byChannel[k].profit += n_(o['กำไรสุทธิ']);
  });

  var mIn = sum(mills, 'กะลาที่ตัดเบิก (kg)'), mOut = sum(mills, 'สารเขียวที่ได้ (kg)');
  var rIn = sum(roasts, 'สารเขียวที่ปันส่วน (kg)'), rOut = sum(roasts, 'เมล็ดคั่วที่ได้ (kg)');

  return {
    mode: mode, key: key,
    summary: {
      revenue: r2_(revenue), goods: r2_(sum(orders, 'มูลค่าสินค้า')),
      shipCharged: r2_(sum(orders, 'ค่าส่งที่เก็บลูกค้า')), shipPaid: r2_(sum(orders, 'ค่าส่งที่จ่ายจริง')),
      shipGap: r2_(sum(orders, 'ค่าส่งที่เก็บลูกค้า') - sum(orders, 'ค่าส่งที่จ่ายจริง')),
      beanCost: r2_(sum(orders, 'ต้นทุนเมล็ด')), pouchCost: r2_(sum(orders, 'ต้นทุนซอง+สติ๊กเกอร์')),
      boxCost: r2_(sum(orders, 'ต้นทุนกล่อง+เทป')),
      cogs: r2_(cogs), profit: r2_(profit),
      margin: revenue > 0 ? r2_(profit / revenue * 100) : 0,
      fixed: r2_(fixed), netProfit: r2_(profit - fixed),
      orders: orders.length, avgOrder: orders.length ? r2_(revenue / orders.length) : 0,
      buyParchment: r2_(sum(pc, 'ต้นทุนรวม')), buyParchmentKg: r4_(sum(pc, 'จำนวน (kg)')),
      buyMaterial: r2_(sum(mt, 'ต้นทุนรวม')),
      millFee: r2_(sum(mills, 'ค่าสีรวม') + sum(mills, 'ค่าส่งสารเขียว')),
      roastFee: r2_(sum(roasts, 'ค่าแรงจ้างคั่ว') + sum(roasts, 'ค่าเช่าเครื่องคั่ว')),
      lossValue: r2_(sum(issues, 'มูลค่าที่ตัด')),
      millIn: r4_(mIn), millOut: r4_(mOut), millYield: mIn > 0 ? r2_(mOut / mIn * 100) : 0,
      millLost: r4_(mIn - mOut),
      roastIn: r4_(rIn), roastOut: r4_(rOut), roastYield: rIn > 0 ? r2_(rOut / rIn * 100) : 0,
      roastLost: r4_(rIn - rOut)
    },
    rows: rows,
    channels: Object.keys(byChannel).map(function (k) {
      var c = byChannel[k]; c.revenue = r2_(c.revenue); c.profit = r2_(c.profit); return c;
    }).sort(function (a, b) { return b.profit - a.profit; }),
    perBag: costPerBag_()
  };
}

function productDetail_(p) {
  var code = String(p.code), m = [];
  live_(readAll_(SH.BUYPC)).filter(function (r) { return String(r['รหัสสินค้า']) === code; }).forEach(function (r) {
    m.push({ kind: 'in', label: 'ซื้อกะลา', date: d_(r['วันที่']), doc: r['เลขที่เอกสาร'], qty: n_(r['จำนวน (kg)']), unit: n_(r['ต้นทุนจริง/kg']) });
  });
  live_(readAll_(SH.BUYMAT)).filter(function (r) { return String(r['รหัสสินค้า']) === code; }).forEach(function (r) {
    m.push({ kind: 'in', label: 'ซื้อวัสดุ', date: d_(r['วันที่']), doc: r['เลขที่เอกสาร'], qty: n_(r['จำนวน']), unit: n_(r['ต้นทุนจริง/หน่วย']) });
  });
  live_(readAll_(SH.MILL)).forEach(function (r) {
    var green = firstOfType_('สารเขียว'), parch = firstOfType_('กาแฟกะลา');
    if (green && String(green['รหัสสินค้า']) === code) m.push({ kind: 'in', label: 'ผลิตสารเขียว', date: d_(r['วันที่']), doc: r['เลขที่เอกสาร'], qty: n_(r['สารเขียวที่ได้ (kg)']), unit: n_(r['ต้นทุนสารเขียว/kg']) });
    if (parch && String(parch['รหัสสินค้า']) === code) m.push({ kind: 'out', label: 'ตัดเบิกไปสี', date: d_(r['วันที่']), doc: r['เลขที่เอกสาร'], qty: n_(r['กะลาที่ตัดเบิก (kg)']), unit: 0 });
  });
  live_(readAll_(SH.ROAST)).forEach(function (r) {
    if (String(r['รหัสผลผลิต']) === code) m.push({ kind: 'in', label: 'ผลิตเมล็ดคั่ว', date: d_(r['วันที่']), doc: r['เลขที่เอกสาร'], qty: n_(r['เมล็ดคั่วที่ได้ (kg)']), unit: n_(r['ต้นทุน/kg']) });
  });
  live_(readAll_(SH.LINE)).forEach(function (r) {
    m.push({ kind: 'out', label: 'ขาย', date: d_(r['วันที่']), doc: r['เลขที่ออร์เดอร์'], qty: n_(r['น้ำหนักรวม (kg)']), unit: n_(r['ราคา/หน่วย']), code: r['ระดับคั่ว'] });
  });
  live_(readAll_(SH.ISSUE)).filter(function (r) { return String(r['รหัสสินค้า']) === code; }).forEach(function (r) {
    m.push({ kind: 'out', label: r['ประเภท'], date: d_(r['วันที่']), doc: r['เลขที่เอกสาร'], qty: n_(r['จำนวน']), unit: n_(r['ต้นทุน/หน่วย']) });
  });
  m = m.filter(function (x) { return x.qty > 0; });
  m.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  return { moves: m.slice(0, 40) };
}

/* ══════════ แจ้งเตือนรายวัน ══════════ */

function dailyAlert() {
  cacheClear_(); ensureSheets_();
  var b = bootstrap_(), mail = settings_()['อีเมลรับแจ้งเตือน'];
  if (!mail || (!b.expiring.length && !b.lowStock.length)) return;
  var h = '<div style="font-family:sans-serif"><h3>แจ้งเตือนสต๊อกกาแฟ ' + b.today + '</h3>';
  if (b.expiring.length) {
    h += '<h4>ล็อตใกล้หมดอายุ</h4><ul>';
    b.expiring.forEach(function (l) { h += '<li>' + l.name + ' ล็อต ' + l.lotNo + ' หมดอายุ ' + l.expiry + ' เหลือ ' + l.qty + '</li>'; });
    h += '</ul>';
  }
  if (b.lowStock.length) {
    h += '<h4>ต่ำกว่าจุดสั่งซื้อ</h4><ul>';
    b.lowStock.forEach(function (p) { h += '<li>' + p.name + ' เหลือ ' + p.qty + ' ' + p.unit + '</li>'; });
    h += '</ul>';
  }
  MailApp.sendEmail({ to: mail, subject: 'แจ้งเตือนสต๊อกกาแฟ ' + b.today, htmlBody: h + '</div>' });
}

/* ══════════ ติดตั้งครั้งแรก ══════════ */

function setupSheets() { ensureSheets_(true); cacheClear_(); return 'ตรวจและอัปเดตโครงสร้างชีตเรียบร้อย'; }

function seedCoffeeCatalog() {
  cacheClear_(); ensureSheets_(true);
  var roasts = BEAN_NAMES.map(function (b) { return { key: b.key, name: b.roast }; });
  var items = [
    { code: 'PC-001', name: 'กาแฟกะลา', type: 'กาแฟกะลา', unit: 'kg', reorder: 20 },
    { code: 'GB-001', name: 'สารเขียว', type: 'สารเขียว', unit: 'kg', reorder: 10 },
    { code: 'MT-POUCH250', name: 'ซองกาแฟ 250g', type: 'วัสดุอุปกรณ์', unit: 'ใบ', reorder: 100 },
    { code: 'MT-POUCH500', name: 'ซองกาแฟ 500g', type: 'วัสดุอุปกรณ์', unit: 'ใบ', reorder: 100 },
    { code: 'MT-POUCH1000', name: 'ซองกาแฟ 1000g', type: 'วัสดุอุปกรณ์', unit: 'ใบ', reorder: 50 },
    { code: 'MT-LABEL', name: 'สติ๊กเกอร์สินค้า', type: 'วัสดุอุปกรณ์', unit: 'ดวง', reorder: 300 },
    { code: 'MT-TAPE', name: 'เทปกาว', type: 'วัสดุอุปกรณ์', unit: 'ม้วน', reorder: 5 }
  ];
  boxItems_().forEach(function (b) { items.push(b); });
  roasts.forEach(function (r) {
    items.push({ code: 'RB-' + r.key, name: beanNameOf_(r.name), type: 'เมล็ดคั่ว', roast: r.name, unit: 'kg', reorder: 3 });
  });
  items.forEach(function (it) { try { saveProduct_(it); } catch (e) {} });

  SIZES.forEach(function (g) {
    savePackSpec_({ size: g, pouchCode: 'MT-POUCH' + g, pouchQty: 1, stickerCode: 'MT-LABEL', stickerQty: 1 });
  });
  flush_();
  return 'สร้างรายการสินค้าและสูตรซองตั้งต้นเรียบร้อย';
}

/*  ═══════════════════════════════════════════════════════════
    แก้ไข / ยกเลิกรายการที่บันทึกไปแล้ว
    หลักการ: "ลบ" = ย้อนผลกระทบต่อสต๊อกแล้วทำเครื่องหมายยกเลิก
              แถวยังอยู่ในชีตเพื่อให้ตรวจสอบย้อนหลังได้ แต่ไม่นับในทุกยอดสรุป
              "แก้ไข" = ยกเลิกของเดิม แล้วบันทึกใหม่ด้วยตัวเลขที่แก้
    ═══════════════════════════════════════════════════════════ */

var KINDS = {
  buyParchment: { sheet: SH.BUYPC,  key: 'เลขที่เอกสาร',   label: 'ซื้อกะลา' },
  mill:         { sheet: SH.MILL,   key: 'เลขที่เอกสาร',   label: 'ผลิตสารเขียว' },
  roast:        { sheet: SH.ROAST,  key: 'เลขที่เอกสาร',   label: 'ผลิตเมล็ดคั่ว' },
  buyMaterial:  { sheet: SH.BUYMAT, key: 'เลขที่เอกสาร',   label: 'ซื้อวัสดุ' },
  sell:         { sheet: SH.ORDER,  key: 'เลขที่ออร์เดอร์', label: 'ขาย' },
  issue:        { sheet: SH.ISSUE,  key: 'เลขที่เอกสาร',   label: 'ตัดจ่าย' }
};

function rowsOfDoc_(sheetName, keyCol, docNo) {
  return readAll_(sheetName).filter(function (r) { return String(r[keyCol]).trim() === String(docNo).trim(); });
}

function setStatus_(sheetName, rows, status) {
  var col = H[sheetName].indexOf('สถานะ') + 1;
  if (col < 1) return;
  var sh = sheet_(sheetName);
  rows.forEach(function (r) { sh.getRange(r._row, col).setValue(status); r['สถานะ'] = status; });
}

/* แปลงข้อความ "L2607-001(5), L2607-002(3)" เป็นรายการล็อต */
function parseLots_(str) {
  var out = [], re = /([^(,]+)\(([0-9.]+)\)/g, m;
  while ((m = re.exec(String(str || '')))) out.push({ lotNo: m[1].trim(), qty: n_(m[2]) });
  return out;
}

/* ถอนของที่เคยรับเข้า — ล็อตนั้นต้องยังไม่ถูกใช้ */
function unreceive_(code, lotNo, qty, totalCost) {
  if (qty <= 0) return;
  var p = mustP_(code), sh = sheet_(SH.LOT);
  var lot = null, all = readAll_(SH.LOT);
  for (var i = 0; i < all.length; i++) {
    if (String(all[i]['เลขที่ล็อต']).trim() === String(lotNo).trim() &&
        String(all[i]['รหัสสินค้า']).trim() === String(code).trim()) { lot = all[i]; break; }
  }
  if (!lot) throw new Error('ไม่พบล็อต ' + lotNo + ' ของ ' + p['ชื่อสินค้า']);
  var left = n_(lot['คงเหลือ']);
  if (left + 0.0001 < qty) {
    throw new Error(p['ชื่อสินค้า'] + ' ล็อต ' + lotNo + ' ถูกใช้ไปแล้ว ' + r4_(qty - left) +
      ' ' + p['หน่วยนับ'] + ' — ต้องยกเลิกรายการที่ใช้ของล็อตนี้ก่อน');
  }
  lot['คงเหลือ'] = r4_(left - qty); _DIRTY[SH.LOT] = true;
  var oldQ = n_(p['คงเหลือ']), oldA = n_(p['ต้นทุนเฉลี่ย/หน่วย']);
  var newQ = oldQ - qty;
  var newA = newQ > 0.0001 ? Math.max(0, (oldQ * oldA - totalCost) / newQ) : 0;
  setBal_(p, Math.max(0, newQ), newA);
}

/* คืนของที่เคยตัดออก กลับเข้าล็อตเดิม */
function restore_(code, lotStr, unitCost) {
  var parts = parseLots_(lotStr);
  if (!parts.length) return 0;
  var sh = sheet_(SH.LOT), all = readAll_(SH.LOT), total = 0;
  parts.forEach(function (pt) {
    total += pt.qty;
    var found = null;
    for (var i = 0; i < all.length; i++) {
      if (String(all[i]['เลขที่ล็อต']).trim() === pt.lotNo &&
          String(all[i]['รหัสสินค้า']).trim() === String(code).trim()) { found = all[i]; break; }
    }
    if (found) { found['คงเหลือ'] = r4_(n_(found['คงเหลือ']) + pt.qty); _DIRTY[SH.LOT] = true; }
    else {
      var p0 = mustP_(code);
      append_(SH.LOT, {
        'เลขที่ล็อต': 'คืน-' + pt.lotNo, 'รหัสสินค้า': code, 'ชื่อสินค้า': p0['ชื่อสินค้า'],
        'วันที่รับ': today_(), 'วันหมดอายุ': '', 'จำนวนรับ': r4_(pt.qty), 'คงเหลือ': r4_(pt.qty),
        'ต้นทุน/หน่วย': r2_(unitCost), 'ที่มา': 'คืนจากการยกเลิก', 'อ้างอิงเอกสาร': ''
      });
    }
  });
  var p = mustP_(code);
  var oldQ = n_(p['คงเหลือ']), oldA = n_(p['ต้นทุนเฉลี่ย/หน่วย']);
  var newQ = oldQ + total;
  setBal_(p, newQ, newQ > 0 ? (oldQ * oldA + unitCost * total) / newQ : 0);
  return total;
}

/* ══════════ อ่านรายการที่บันทึกไว้ ══════════ */

function listDocs_(p) {
  var k = KINDS[p.kind];
  if (!k) throw new Error('ไม่รู้จักประเภทรายการ');
  var limit = n_(p.limit) || 30;
  var rows = readAll_(k.sheet);
  var seen = {}, out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < limit; i--) {
    var r = rows[i], id = String(r[k.key]);
    if (seen[id]) continue;
    seen[id] = 1;
    var o = { doc: id, date: d_(r['วันที่']), cancelled: r['สถานะ'] === 'ยกเลิก' };
    if (p.kind === 'buyParchment') { o.title = 'กะลา ' + r4_(n_(r['จำนวน (kg)'])) + ' kg'; o.sub = (r['ผู้ขาย/เกษตรกร'] || '') + ' · ' + f2_(n_(r['ต้นทุนจริง/kg'])) + ' บ./kg'; o.amt = n_(r['ต้นทุนรวม']); }
    else if (p.kind === 'mill') { o.title = 'สารเขียว ' + r4_(n_(r['สารเขียวที่ได้ (kg)'])) + ' kg'; o.sub = 'จากกะลา ' + r4_(n_(r['กะลาที่ตัดเบิก (kg)'])) + ' kg · yield ' + r2_(n_(r['% Yield'])) + '%'; o.amt = n_(r['ต้นทุนรวม']); }
    else if (p.kind === 'roast') {
      var grp = rowsOfDoc_(k.sheet, k.key, id);
      var tot = 0, cost = 0, names = [];
      grp.forEach(function (g) { tot += n_(g['เมล็ดคั่วที่ได้ (kg)']); cost += n_(g['ต้นทุนรวม']); names.push(g['ระดับคั่ว']); });
      o.title = 'เมล็ดคั่ว ' + r4_(tot) + ' kg';
      o.sub = names.join(', ') + ' · สารเขียว ' + r4_(n_(r['สารเขียวรวมทั้งรอบ (kg)'])) + ' kg';
      o.amt = r2_(cost);
    }
    else if (p.kind === 'buyMaterial') { o.title = r['ชื่อวัสดุ']; o.sub = r4_(n_(r['จำนวน'])) + ' × ' + f2_(n_(r['ราคา/หน่วย'])); o.amt = n_(r['ต้นทุนรวม']); }
    else if (p.kind === 'sell') { o.title = r['ลูกค้า'] || r['ช่องทางขาย'] || 'ขาย'; o.sub = 'กำไร ' + f2_(n_(r['กำไรสุทธิ'])) + ' (' + r2_(n_(r['% กำไร'])) + '%)'; o.amt = n_(r['รายได้รวม']); }
    else { o.title = r['ชื่อสินค้า']; o.sub = r['ประเภท'] + ' · ' + r4_(n_(r['จำนวน'])); o.amt = n_(r['มูลค่าที่ตัด']); }
    out.push(o);
  }
  return { kind: p.kind, label: k.label, docs: out };
}

function f2_(x) { return String(r2_(x)); }

/* ══════════ ดึงรายการเดิมมาแก้ ══════════ */

function getDoc_(p) {
  var k = KINDS[p.kind];
  if (!k) throw new Error('ไม่รู้จักประเภทรายการ');
  var rows = rowsOfDoc_(k.sheet, k.key, p.docNo);
  if (!rows.length) throw new Error('ไม่พบเอกสาร ' + p.docNo);
  var r = rows[0], o = { doc: p.docNo, date: d_(r['วันที่']), cancelled: r['สถานะ'] === 'ยกเลิก' };

  if (p.kind === 'buyParchment') {
    o.qty = n_(r['จำนวน (kg)']); o.unitPrice = n_(r['ราคา/kg']); o.freight = n_(r['ค่าขนส่ง']);
    o.supplier = r['ผู้ขาย/เกษตรกร']; o.note = r['หมายเหตุ'];
  } else if (p.kind === 'mill') {
    o.qtyIn = n_(r['กะลาที่ตัดเบิก (kg)']); o.qtyOut = n_(r['สารเขียวที่ได้ (kg)']);
    o.millRate = n_(r['ค่าสี/kg']); o.freight = n_(r['ค่าส่งสารเขียว']); o.vendor = r['โรงสี']; o.note = r['หมายเหตุ'];
  } else if (p.kind === 'roast') {
    o.qtyIn = n_(r['สารเขียวรวมทั้งรอบ (kg)']);
    o.laborTotal = 0; o.rentTotal = 0; o.lines = [];
    rows.forEach(function (g) {
      o.laborTotal += n_(g['ค่าแรงจ้างคั่ว']); o.rentTotal += n_(g['ค่าเช่าเครื่องคั่ว']);
      o.lines.push({ code: String(g['รหัสผลผลิต']), roast: g['ระดับคั่ว'], qtyOut: n_(g['เมล็ดคั่วที่ได้ (kg)']) });
    });
    o.laborTotal = r2_(o.laborTotal); o.rentTotal = r2_(o.rentTotal);
    o.vendor = r['ผู้คั่ว']; o.note = r['หมายเหตุ'];
  } else if (p.kind === 'buyMaterial') {
    o.code = String(r['รหัสสินค้า']); o.qty = n_(r['จำนวน']); o.unitPrice = n_(r['ราคา/หน่วย']);
    o.freight = n_(r['ค่าขนส่ง']); o.supplier = r['ผู้ขาย'];
  } else if (p.kind === 'sell') {
    o.customer = r['ลูกค้า']; o.channel = r['ช่องทางขาย'];
    o.shipCharged = n_(r['ค่าส่งที่เก็บลูกค้า']); o.shipPaid = n_(r['ค่าส่งที่จ่ายจริง']);
    o.note = r['หมายเหตุ']; o.lines = [];
    readAll_(SH.LINE).forEach(function (l) {
      if (String(l['เลขที่ออร์เดอร์']).trim() !== String(p.docNo).trim()) return;
      var size = n_(l['ขนาด (g)']);
      o.lines.push({
        kind: size > 0 ? 'ซอง' : 'kg', size: size, qty: n_(l['จำนวน (ซอง/kg)']),
        price: n_(l['ราคา/หน่วย']), roast: l['ระดับคั่ว'],
        cost: n_(l['ต้นทุนรวม/หน่วย'])
      });
    });
    o.packItems = [];
    String(r['กล่อง/เทปที่ใช้'] || '').split(',').forEach(function (part) {
      var m = /([^(]+)\(([0-9.]+)@/.exec(part.trim());
      if (m) o.packItems.push({ code: m[1].trim(), qty: n_(m[2]) });
    });
  } else {
    o.code = String(r['รหัสสินค้า']); o.qty = n_(r['จำนวน']); o.type = r['ประเภท']; o.note = r['หมายเหตุ'];
  }
  return o;
}

/* ══════════ ยกเลิก (ลบ) ══════════ */

function voidDoc_(p) {
  var k = KINDS[p.kind];
  if (!k) throw new Error('ไม่รู้จักประเภทรายการ');
  var rows = rowsOfDoc_(k.sheet, k.key, p.docNo);
  if (!rows.length) throw new Error('ไม่พบเอกสาร ' + p.docNo);
  if (rows[0]['สถานะ'] === 'ยกเลิก') throw new Error('เอกสาร ' + p.docNo + ' ถูกยกเลิกไปแล้ว');

  if (p.kind === 'buyParchment') {
    var r = rows[0];
    unreceive_(String(r['รหัสสินค้า']), r['เลขที่ล็อต'], n_(r['จำนวน (kg)']), n_(r['ต้นทุนรวม']));
  }
  else if (p.kind === 'buyMaterial') {
    var rm = rows[0];
    unreceive_(String(rm['รหัสสินค้า']), rm['เลขที่ล็อต'], n_(rm['จำนวน']), n_(rm['ต้นทุนรวม']));
  }
  else if (p.kind === 'mill') {
    var rl = rows[0];
    var green = firstOfType_('สารเขียว'), parch = firstOfType_('กาแฟกะลา');
    unreceive_(String(green['รหัสสินค้า']), rl['เลขที่ล็อต'], n_(rl['สารเขียวที่ได้ (kg)']), n_(rl['ต้นทุนรวม']));
    var qIn = n_(rl['กะลาที่ตัดเบิก (kg)']), cIn = n_(rl['ต้นทุนกะลา']);
    restoreQty_(String(parch['รหัสสินค้า']), qIn, qIn > 0 ? cIn / qIn : 0, 'คืนจากยกเลิก ' + p.docNo);
  }
  else if (p.kind === 'roast') {
    var totalGreen = 0, totalGreenCost = 0;
    rows.forEach(function (g) {
      unreceive_(String(g['รหัสผลผลิต']), g['เลขที่ล็อต'], n_(g['เมล็ดคั่วที่ได้ (kg)']), n_(g['ต้นทุนรวม']));
      totalGreen += n_(g['สารเขียวที่ปันส่วน (kg)']);
      totalGreenCost += n_(g['ต้นทุนสารเขียว']);
    });
    var gp = firstOfType_('สารเขียว');
    restoreQty_(String(gp['รหัสสินค้า']), totalGreen, totalGreen > 0 ? totalGreenCost / totalGreen : 0, 'คืนจากยกเลิก ' + p.docNo);
  }
  else if (p.kind === 'sell') {
    var lineRows = readAll_(SH.LINE).filter(function (l) {
      return String(l['เลขที่ออร์เดอร์']).trim() === String(p.docNo).trim();
    });
    lineRows.forEach(function (l) {
      var size = n_(l['ขนาด (g)']), qty = n_(l['จำนวน (ซอง/kg)']);
      var kg = n_(l['น้ำหนักรวม (kg)']) || qty;
      var beanUnit = size > 0 ? (n_(l['ต้นทุนเมล็ด/หน่วย']) / (size / 1000)) : n_(l['ต้นทุนเมล็ด/หน่วย']);
      var beanCode = beanCodeOf_(l['ระดับคั่ว'], size);
      if (beanCode) restore_(beanCode, l['ล็อตที่ตัด'], beanUnit);
      if (size > 0) {
        var spec = packSpec_(size);
        if (spec) {
          if (spec['รหัสซอง'] && n_(l['ต้นทุนซอง/หน่วย']) >= 0)
            restoreQty_(String(spec['รหัสซอง']), qty * (n_(spec['ซอง/หน่วย']) || 1),
              n_(l['ต้นทุนซอง/หน่วย']) / (n_(spec['ซอง/หน่วย']) || 1), 'คืนจากยกเลิก ' + p.docNo);
          if (spec['รหัสสติ๊กเกอร์'])
            restoreQty_(String(spec['รหัสสติ๊กเกอร์']), qty * (n_(spec['สติ๊กเกอร์/หน่วย']) || 1),
              n_(l['ต้นทุนสติ๊กเกอร์/หน่วย']) / (n_(spec['สติ๊กเกอร์/หน่วย']) || 1), 'คืนจากยกเลิก ' + p.docNo);
        }
      }
    });
    setStatus_(SH.LINE, lineRows, 'ยกเลิก');
    String(rows[0]['กล่อง/เทปที่ใช้'] || '').split(',').forEach(function (part) {
      var m = /([^(]+)\(([0-9.]+)@([0-9.]+)\)/.exec(part.trim());
      if (m) restoreQty_(m[1].trim(), n_(m[2]), n_(m[3]), 'คืนจากยกเลิก ' + p.docNo);
    });
  }
  else if (p.kind === 'issue') {
    var ri = rows[0];
    restore_(String(ri['รหัสสินค้า']), ri['ล็อตที่ตัด'], n_(ri['ต้นทุน/หน่วย']));
  }

  setStatus_(k.sheet, rows, 'ยกเลิก');
  return { docNo: p.docNo, cancelled: true };
}

/* เพิ่มจำนวนกลับเข้าคลังเป็นล็อตใหม่ (ใช้ตอนคืนของที่ตัดไปโดยไม่มีเลขล็อตอ้างอิง) */
function restoreQty_(code, qty, unitCost, note) {
  if (qty <= 0) return;
  var p = mustP_(code);
  append_(SH.LOT, {
    'เลขที่ล็อต': 'คืน-' + doc_('R', SH.LOT), 'รหัสสินค้า': code, 'ชื่อสินค้า': p['ชื่อสินค้า'],
    'วันที่รับ': today_(), 'วันหมดอายุ': '', 'จำนวนรับ': r4_(qty), 'คงเหลือ': r4_(qty),
    'ต้นทุน/หน่วย': r2_(unitCost), 'ที่มา': note || 'คืนจากการยกเลิก', 'อ้างอิงเอกสาร': ''
  });
  var oldQ = n_(p['คงเหลือ']), oldA = n_(p['ต้นทุนเฉลี่ย/หน่วย']);
  var newQ = oldQ + qty;
  setBal_(p, newQ, newQ > 0 ? (oldQ * oldA + unitCost * qty) / newQ : 0);
}

function beanCodeOf_(roastName, size) {
  var rows = readAll_(SH.PRODUCT);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i]['ประเภท'] === 'เมล็ดคั่ว' && String(rows[i]['ระดับคั่ว']).trim() === String(roastName).trim())
      return String(rows[i]['รหัสสินค้า']);
  }
  for (var j = 0; j < rows.length; j++) {
    if (rows[j]['ประเภท'] === 'สารเขียว') return String(rows[j]['รหัสสินค้า']);
  }
  return '';
}

/* ══════════ แก้ไข = ยกเลิกของเดิม + บันทึกใหม่ ══════════ */

function updateDoc_(p) {
  voidDoc_({ kind: p.kind, docNo: p.docNo });
  var payload = p.payload || {};
  payload.note = (payload.note ? payload.note + ' · ' : '') + 'แก้ไขจาก ' + p.docNo;
  var res = route_(p.kind, payload);
  res.replaced = p.docNo;
  return res;
}

/* ══════════ เปลี่ยนชื่อเมล็ดคั่วเป็นชื่อแบรนด์ — รันครั้งเดียวหลังอัปเดตโค้ด ══════════
   จับคู่ด้วย "ระดับคั่ว" จึงไม่กระทบสต๊อก ล็อต หรือประวัติการขายที่บันทึกไว้แล้ว   */
function renameBeansToBrand() {
  cacheClear_(); ensureSheets_(true);
  var sh = sheet_(SH.PRODUCT), rows = readAll_(SH.PRODUCT), done = [];
  rows.forEach(function (r) {
    if (r['ประเภท'] !== 'เมล็ดคั่ว') return;
    var want = beanNameOf_(r['ระดับคั่ว']);
    if (!want || String(r['ชื่อสินค้า']).trim() === want) return;
    put_(SH.PRODUCT, r, 'ชื่อสินค้า', want);
    done.push(r['ระดับคั่ว'] + ' → ' + want);
  });

  /* ชื่อสินค้าที่ประทับไว้ในล็อตให้ตรงกันด้วย */
  var ls = sheet_(SH.LOT), lots = readAll_(SH.LOT);
  lots.forEach(function (l) {
    var p = findP_(l['รหัสสินค้า']);
    if (p && p['ประเภท'] === 'เมล็ดคั่ว' && String(l['ชื่อสินค้า']).trim() !== String(p['ชื่อสินค้า']).trim())
      put_(SH.LOT, l, 'ชื่อสินค้า', p['ชื่อสินค้า']);
  });

  BEAN_NAMES.forEach(function (b) {
    var exists = readAll_(SH.PRODUCT).some(function (r) {
      return r['ประเภท'] === 'เมล็ดคั่ว' && String(r['ระดับคั่ว']).trim() === b.roast;
    });
    if (!exists) {
      saveProduct_({ code: 'RB-' + b.key, name: b.name, type: 'เมล็ดคั่ว', roast: b.roast, unit: 'kg', reorder: 3 });
      done.push('สร้างใหม่ ' + b.roast + ' → ' + b.name);
    }
  });

  flush_();
  return done.length ? done.join(' · ') : 'ชื่อตรงอยู่แล้ว ไม่มีอะไรต้องเปลี่ยน';
}

/* ══════════ เพิ่มขนาดกล่องพัสดุมาตรฐาน — รันครั้งเดียว ══════════
   ไม่แตะรายการกล่องเดิมที่มีอยู่ และไม่กระทบสต๊อกหรือประวัติใด ๆ   */
function seedBoxSizes() {
  cacheClear_(); ensureSheets_(true);
  var added = [];
  boxItems_().forEach(function (b) {
    if (findP_(b.code)) return;
    saveProduct_(b);
    added.push(b.name);
  });
  flush_();
  return added.length ? 'เพิ่มแล้ว: ' + added.join(' · ') : 'มีครบทุกขนาดแล้ว';
}

/* ══════════ อัปเดตช่องทางขายเป็น นัดรับ / ส่งพัสดุ / ฝากส่ง — รันครั้งเดียว ══════════
   แก้เฉพาะค่าตั้งต้น ไม่กระทบออร์เดอร์ที่บันทึกไว้แล้ว                              */
function updateChannels() {
  ensureSheets_();
  var sh = sheet_(SH.SETTING), last = sh.getLastRow();
  var want = 'นัดรับ, ส่งพัสดุ, ฝากส่ง';
  for (var r = 2; r <= last; r++) {
    if (String(sh.getRange(r, 1).getValue()).trim() === 'ช่องทางขาย') {
      var before = String(sh.getRange(r, 2).getValue());
      sh.getRange(r, 2).setValue(want); delete _C.__set;
      return 'เปลี่ยนช่องทางขายจาก "' + before + '" เป็น "' + want + '" แล้ว';
    }
  }
  sh.appendRow(['ช่องทางขาย', want, 'คั่นด้วยจุลภาค']);
  return 'เพิ่มช่องทางขาย: ' + want;
}

/* ══════════ ย้ายล็อตที่ใช้หมดแล้วไปเก็บในชีตประวัติ — รันเดือนละครั้ง ══════════
   ชีตล็อตสินค้าถูกอ่านทั้งแผ่นทุกครั้งที่ตัดสต๊อก ยิ่งแถวเยอะยิ่งช้า
   ล็อตที่คงเหลือ 0 ไม่ถูกใช้ในการคำนวณอีกแล้ว จึงย้ายออกได้โดยไม่กระทบตัวเลขใด ๆ  */
function archiveEmptyLots() {
  cacheClear_(); ensureSheets_(true);
  var name = 'ล็อตสินค้า (ประวัติ)';
  var src = sheet_(SH.LOT), all = readAll_(SH.LOT);
  var keepDays = 30, t = today_();
  var move = all.filter(function (l) {
    if (n_(l['คงเหลือ']) > 0.0001) return false;
    var d = d_(l['วันที่รับ']);
    return !d || days_(d, t) > keepDays;      /* เก็บล็อตใหม่ ๆ ไว้ก่อนเผื่อต้องยกเลิกรายการ */
  });
  if (!move.length) return 'ไม่มีล็อตที่ต้องย้าย';

  var arc = ss_().getSheetByName(name);
  if (!arc) {
    arc = ss_().insertSheet(name);
    arc.getRange(1, 1, 1, H[SH.LOT].length).setValues([H[SH.LOT]])
      .setFontWeight('bold').setBackground('#6F6486').setFontColor('#FFFFFF');
    arc.setFrozenRows(1);
  }
  arc.getRange(arc.getLastRow() + 1, 1, move.length, H[SH.LOT].length)
     .setValues(move.map(function (l) { return H[SH.LOT].map(function (h) { return l[h]; }); }));

  /* ลบจากล่างขึ้นบน เพื่อไม่ให้เลขแถวเลื่อน */
  move.sort(function (a, b) { return b._row - a._row; })
      .forEach(function (l) { src.deleteRow(l._row); });

  cacheClear_();
  return 'ย้ายล็อตที่ใช้หมดแล้ว ' + move.length + ' แถวไปชีตประวัติ · เหลือในชีตหลัก ' +
         (all.length - move.length) + ' แถว';
}

/* ══════════════════════════════════════════════════════════════
   ลบรายการขายทั้งหมด แล้วคืนสต๊อกกลับ  — รันครั้งเดียวจากเมนู Apps Script
   คืนให้ครบทั้งเมล็ดคั่ว ซอง สติ๊กเกอร์ กล่อง และเทป
   (ต้องคืนวัสดุด้วย ไม่งั้นพอบันทึกขายใหม่จะถูกตัดซ้ำสองรอบ)
   ข้อมูลส่วนอื่น — ซื้อกะลา ผลิตสารเขียว ผลิตเมล็ดคั่ว ซื้อวัสดุ — ไม่ถูกแตะ
   ══════════════════════════════════════════════════════════════ */
function deleteAllSales() {
  cacheClear_(); ensureSheets_(true);

  var orders = readAll_(SH.ORDER).filter(function (o) { return o['สถานะ'] !== 'ยกเลิก'; });
  if (!orders.length) { flush_(); return 'ไม่มีรายการขายที่ยังใช้งานอยู่'; }

  var allLines = readAll_(SH.LINE);
  var restored = {}, failed = [], nLines = 0;

  function add_(code, qty) {
    if (!code || qty <= 0) return;
    var p = findP_(code);
    var key = p ? p['ชื่อสินค้า'] : code;
    restored[key] = r4_((restored[key] || 0) + qty);
  }

  orders.forEach(function (o) {
    var docNo = String(o['เลขที่ออร์เดอร์']).trim();
    try {
      var lines = allLines.filter(function (l) {
        return String(l['เลขที่ออร์เดอร์']).trim() === docNo && l['สถานะ'] !== 'ยกเลิก';
      });

      lines.forEach(function (l) {
        var size = n_(l['ขนาด (g)']);
        var qty = n_(l['จำนวน (ซอง/kg)']);
        var kg = n_(l['น้ำหนักรวม (kg)']) || qty;
        if (qty <= 0) return;

        /* หาว่าบรรทัดนี้ตัดสินค้าตัวไหนออกไป */
        var code = '';
        if (size > 0) code = beanCodeOf_(l['ระดับคั่ว'], size);
        else {
          var byType = firstOfType_(l['ประเภท'] || 'สารเขียว');
          code = byType ? String(byType['รหัสสินค้า']) : '';
        }
        if (!code) { failed.push(docNo + ' (หาสินค้าไม่พบ: ' + l['ระดับคั่ว'] + ')'); return; }

        /* ต้นทุนต่อหน่วยตอนที่ขาย ใช้คืนกลับให้ค่าเฉลี่ยตรงเหมือนเดิม */
        var unit = size > 0
          ? (n_(l['ต้นทุนเมล็ด/หน่วย']) / (size / 1000))
          : n_(l['ต้นทุนเมล็ด/หน่วย']);

        var lotStr = String(l['ล็อตที่ตัด'] || '');
        var back = lotStr ? restore_(code, lotStr, unit) : 0;
        if (back <= 0) { restoreQty_(code, kg, unit, 'คืนจากลบการขาย ' + docNo); back = kg; }
        add_(code, back);

        /* ซองและสติ๊กเกอร์ตามสูตรของขนาดนั้น */
        if (size > 0) {
          var spec = packSpec_(size);
          if (spec) {
            var pq = n_(spec['ซอง/หน่วย']) || 1, sq = n_(spec['สติ๊กเกอร์/หน่วย']) || 1;
            if (spec['รหัสซอง']) {
              restoreQty_(String(spec['รหัสซอง']), qty * pq, n_(l['ต้นทุนซอง/หน่วย']) / pq, 'คืนจากลบการขาย ' + docNo);
              add_(String(spec['รหัสซอง']), qty * pq);
            }
            if (spec['รหัสสติ๊กเกอร์']) {
              restoreQty_(String(spec['รหัสสติ๊กเกอร์']), qty * sq, n_(l['ต้นทุนสติ๊กเกอร์/หน่วย']) / sq, 'คืนจากลบการขาย ' + docNo);
              add_(String(spec['รหัสสติ๊กเกอร์']), qty * sq);
            }
          }
        }
        nLines++;
      });

      /* กล่องและเทปที่บันทึกไว้ระดับออร์เดอร์ */
      String(o['กล่อง/เทปที่ใช้'] || '').split(',').forEach(function (part) {
        var m = /([^(]+)\(([0-9.]+)@([0-9.]+)\)/.exec(part.trim());
        if (!m) return;
        restoreQty_(m[1].trim(), n_(m[2]), n_(m[3]), 'คืนจากลบการขาย ' + docNo);
        add_(m[1].trim(), n_(m[2]));
      });

      setStatus_(SH.LINE, lines, 'ยกเลิก');
      setStatus_(SH.ORDER, [o], 'ยกเลิก');
    } catch (err) {
      failed.push(docNo + ' (' + (err && err.message ? err.message : err) + ')');
    }
  });

  flush_();

  var lines2 = Object.keys(restored).map(function (k) { return '  ' + k + ' +' + restored[k]; });
  var msg = 'ลบรายการขาย ' + orders.length + ' บิล (' + nLines + ' รายการย่อย) เรียบร้อย\n\nคืนสต๊อกแล้ว:\n' + lines2.join('\n');
  if (failed.length) msg += '\n\n⚠ มีปัญหา ' + failed.length + ' บิล:\n  ' + failed.join('\n  ');
  return msg;
}

/* ลบแถวที่ยกเลิกแล้วออกจากชีตขายให้หมดจด — ไม่บังคับ รันหลัง deleteAllSales ถ้าอยากให้ชีตสะอาด
   ทำหลังตรวจสต๊อกแล้วว่าถูกต้อง เพราะลบแล้วย้อนไม่ได้                                        */
function purgeCancelledSales() {
  cacheClear_(); ensureSheets_(true);
  var n = 0;
  [SH.LINE, SH.ORDER].forEach(function (name) {
    var sh = sheet_(name);
    var rows = readAll_(name).filter(function (r) { return r['สถานะ'] === 'ยกเลิก'; });
    rows.sort(function (a, b) { return b._row - a._row; }).forEach(function (r) { sh.deleteRow(r._row); n++; });
  });
  cacheClear_();
  return 'ลบแถวที่ยกเลิกแล้วออก ' + n + ' แถว';
}

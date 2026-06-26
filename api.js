// ============================================================
// api.js — ASTROVERA Client-side API + Supabase
// ============================================================

const API_BASE = '/.netlify/functions';

// ── Supabase config (public keys ใส่ได้เลย) ──
const SUPA_URL = 'https://orxteuufqeohptpbwkqx.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeHRldXVmcWVvaHB0cGJ3a3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.placeholder';

// ── โหลด Supabase SDK ──
(function loadSupabase() {
  if (window._supabaseLoading) return;
  window._supabaseLoading = true;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  s.onload = function() {
    try {
      window._supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
      console.log('✅ Supabase ready');
    } catch(e) {
      console.warn('Supabase init failed:', e.message);
    }
  };
  document.head.appendChild(s);
})();

// ── Helper: โหลด profile จาก localStorage ──
function _getProfile() {
  try { return JSON.parse(localStorage.getItem('av_p')) || {}; }
  catch(e) { return {}; }
}

// ── Helper: คำนวณ derived data ก่อนส่ง AI ──
function _buildAstroData(profile) {
  var dob = profile.dob || '';          // "YYYY-MM-DD"
  var data = {};

  if (!dob) return data;

  var parts = dob.split('-');
  var year  = parseInt(parts[0]) || 0;
  var month = parseInt(parts[1]) || 0;
  var day   = parseInt(parts[2]) || 0;

  // 1. เลขศาสตร์ — เลขชีวิต (Life Path)
  var digits = dob.replace(/-/g,'').split('').map(Number);
  var sum = digits.reduce(function(a,b){return a+b;},0);
  while(sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').map(Number).reduce(function(a,b){return a+b;},0);
  }
  data.life_path = sum;

  // 2. ราศีตะวันตก (Sun Sign)
  var sunSigns = [
    {name:'มังกร',   from:[12,22],to:[1,19]},
    {name:'กุมภ์',   from:[1,20], to:[2,18]},
    {name:'มีน',     from:[2,19], to:[3,20]},
    {name:'เมษ',     from:[3,21], to:[4,19]},
    {name:'พฤษภ',   from:[4,20], to:[5,20]},
    {name:'เมถุน',   from:[5,21], to:[6,20]},
    {name:'กรกฎ',   from:[6,21], to:[7,22]},
    {name:'สิงห์',   from:[7,23], to:[8,22]},
    {name:'กันย์',   from:[8,23], to:[9,22]},
    {name:'ตุลย์',   from:[9,23], to:[10,22]},
    {name:'พิจิก',   from:[10,23],to:[11,21]},
    {name:'ธนู',     from:[11,22],to:[12,21]}
  ];
  var sunSign = 'มังกร';
  for(var i=0;i<sunSigns.length;i++){
    var s=sunSigns[i];
    var fromM=s.from[0],fromD=s.from[1],toM=s.to[0],toD=s.to[1];
    if((month===fromM&&day>=fromD)||(month===toM&&day<=toD)){
      sunSign=s.name; break;
    }
  }
  data.sun_sign = sunSign;

  // 3. ปีนักษัตร (Chinese Zodiac)
  var animals=['หนู','วัว','เสือ','กระต่าย','มังกร','งู','ม้า','แพะ','ลิง','ไก่','หมา','หมู'];
  data.chinese_zodiac = animals[(year - 2020 % 12 + 1200) % 12];

  // 4. Five Element (ธาตุ 5 ปีจีน)
  var elements=['โลหะ','โลหะ','น้ำ','น้ำ','ไม้','ไม้','ไฟ','ไฟ','ดิน','ดิน'];
  data.five_element = elements[(year - 2020 % 10 + 1000) % 10];

  // 5. เลขปีส่วนตัว (Personal Year)
  var now = new Date();
  var currentYear = now.getFullYear();
  var pyDigits = String(month) + String(day) + String(currentYear);
  var py = pyDigits.split('').map(Number).reduce(function(a,b){return a+b;},0);
  while(py>9&&py!==11&&py!==22){
    py=String(py).split('').map(Number).reduce(function(a,b){return a+b;},0);
  }
  data.personal_year = py;

  // 6. Numerology Expression Number (จากชื่อ A-Z)
  if(profile.name){
    var nameEn=(profile.nameEn||profile.name).toUpperCase().replace(/[^A-Z]/g,'');
    var numMap={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
    var expSum=nameEn.split('').reduce(function(a,c){return a+(numMap[c]||0);},0);
    while(expSum>9&&expSum!==11&&expSum!==22){
      expSum=String(expSum).split('').map(Number).reduce(function(a,b){return a+b;},0);
    }
    data.expression_number = expSum;
  }

  // 7. ทิศเกิด / Kua Number (ฮวงจุ้ย)
  var kuaYear = year % 100;
  var kuaSum = String(kuaYear).split('').map(Number).reduce(function(a,b){return a+b;},0);
  while(kuaSum>9) kuaSum=String(kuaSum).split('').map(Number).reduce(function(a,b){return a+b;},0);
  var kua = (10 - kuaSum) % 9 || 9; // สำหรับผู้ชาย (simplified)
  data.kua_number = kua;

  // 8. อายุปัจจุบัน
  var today = new Date();
  var birthDate = new Date(year, month-1, day);
  var age = today.getFullYear() - birthDate.getFullYear();
  if(today < new Date(today.getFullYear(), month-1, day)) age--;
  data.age = age;

  // 9. วันเกิด (0=อาทิตย์)
  var dayOfWeek = new Date(year, month-1, day).getDay();
  var dayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'];
  data.birth_day = dayNames[dayOfWeek];

  // 10. กลุ่มพลังงาน (Energy archetype แบบง่าย)
  var energyGroups = {
    1:'ผู้นำอิสระ',2:'นักสร้างสรรค์คู่',3:'นักสื่อสาร',4:'นักสร้างรากฐาน',
    5:'นักสำรวจเสรี',6:'ผู้ดูแลรักษา',7:'นักวิเคราะห์ลึก',8:'นักบริหารพลัง',
    9:'นักมนุษยธรรม',11:'ผู้มีสัญชาตญาณสูง',22:'ผู้สร้างระบบใหญ่',33:'ครูแห่งความรัก'
  };
  data.energy_archetype = energyGroups[sum] || 'นักสำรวจ';

  return data;
}

// ============================================================
// analyzeWithDeepseek — เรียกจาก app.js และ analysis.html
// ============================================================
window.analyzeWithDeepseek = async function(lens) {
  var profile = _getProfile();
  if (!profile || !profile.dob) {
    throw new Error('กรุณากรอกข้อมูลโปรไฟล์ (ชื่อ + วันเกิด) ก่อน');
  }

  var astroData = _buildAstroData(profile);

  var payload = {
    name:        profile.name || 'ผู้ใช้',
    gender:      profile.gender || '',
    birth_date:  profile.dob,
    birth_time:  profile.time || '',
    birth_place: profile.place || '',
    blood_type:  profile.bloodType || '',
    astro_data:  astroData,   // ← ข้อมูลคำนวณแล้ว 10 มิติ
    lens:        lens || 'general',
    question:    'วิเคราะห์ชีวิตโดยรวมจากข้อมูลทั้งหมด'
  };

  var res = await fetch(API_BASE + '/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    var err = await res.json().catch(function(){return {};});
    throw new Error(err.error || 'API error ' + res.status);
  }

  var data = await res.json();
  return data.data || data.result || 'ไม่ได้รับข้อมูลจาก AI';
};

// ============================================================
// askFollowUp — ถามต่อจาก context เดิม
// ============================================================
window.askFollowUp = async function(question, lens) {
  var profile = _getProfile();
  var history = [];
  try {
    var h = JSON.parse(localStorage.getItem('av_analysis_history') || '[]');
    history = h.slice(0,3).map(function(x){return {role:'assistant',content:x.result};});
  } catch(e) {}

  var payload = {
    name:       profile.name || '',
    birth_date: profile.dob  || '',
    lens:       lens || 'general',
    question:   question,
    history:    history,
    context:    'follow-up'
  };

  var res = await fetch(API_BASE + '/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    var err = await res.json().catch(function(){return {};});
    throw new Error(err.error || 'API error ' + res.status);
  }

  var data = await res.json();
  return data.data || data.result || 'ไม่ได้รับคำตอบ';
};

// ============================================================
// saveToSupabase — บันทึกผลวิเคราะห์
// ============================================================
window.saveToSupabase = async function(text, lens, ai) {
  var profile = _getProfile();
  var record = {
    user_id:    profile.user_id || 'anon_' + Date.now(),
    name:       profile.name || '',
    birth_date: profile.dob  || '',
    lens:       lens || 'general',
    ai:         ai   || 'vela',
    result:     text,
    created_at: new Date().toISOString()
  };

  // บันทึก localStorage เสมอ
  var history = JSON.parse(localStorage.getItem('av_analysis_history') || '[]');
  history.unshift(record);
  if (history.length > 100) history = history.slice(0,100);
  localStorage.setItem('av_analysis_history', JSON.stringify(history));

  // บันทึก Supabase ถ้าพร้อม
  if (window._supa) {
    var res = await window._supa.from('analysis_history').insert([record]);
    if (res.error) throw new Error('Supabase: ' + res.error.message);
  }
  return true;
};

// ============================================================
// loadFromSupabase — โหลดประวัติวิเคราะห์
// ============================================================
window.loadFromSupabase = async function(userId) {
  if (!window._supa) {
    // fallback: localStorage
    return JSON.parse(localStorage.getItem('av_analysis_history') || '[]');
  }

  var res = await window._supa
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (res.error) throw new Error('Supabase: ' + res.error.message);
  return res.data || [];
};

// ============================================================
// Life Copilot (ใช้ใน index.html)
// ============================================================
window.callLifeCopilot = async function(message, history, profile) {
  var res = await fetch(API_BASE + '/life-copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, profile })
  });
  if (!res.ok) { var e=await res.json().catch(function(){return{};}); throw new Error(e.error||'API error'); }
  var data = await res.json();
  return data.reply;
};

// ============================================================
// Life Coach Report
// ============================================================
window.generateLifeCoachReport = async function(profile) {
  var res = await fetch(API_BASE + '/life-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!res.ok) { var e=await res.json().catch(function(){return{};}); throw new Error(e.error||'API error'); }
  var data = await res.json();
  return data.script;
};

// ============================================================
// Natal Chart
// ============================================================
window.fetchNatalChart = async function(dob, time, place) {
  var res = await fetch(API_BASE + '/natal-chart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dob, time, place })
  });
  if (!res.ok) { var e=await res.json().catch(function(){return{};}); throw new Error(e.error||'Natal chart error'); }
  return await res.json();
};

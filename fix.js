/* ============================================================
   ASTROVERA — fix.js
   แก้ไข: ข้อมูลผู้ใช้เก่าค้างอยู่ใน localStorage
   วิธีใช้: วาง <script src="./fix.js"></script>
   ก่อน </body> ทั้ง index.html และ analysis.html
   ============================================================ */

(function() {
  'use strict';

  /* ── 1. ล้างข้อมูลเก่าเมื่อกรอกฟอร์มใหม่ทับ ── */
  function clearStaleProfile() {
    // ดึง key ที่เกี่ยวกับ profile ทั้งหมด
    var profileKey = 'av_p';
    var stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(profileKey));
    } catch(e) { stored = null; }

    // ถ้าไม่มีข้อมูลเดิมก็ไม่ต้องทำอะไร
    if (!stored) return;

    // ฟัง event กรอกข้อมูลใหม่ในฟอร์ม landing
    var nameInput = document.getElementById('userName') || document.querySelector('input[name="name"]') || document.querySelector('.name-input');
    var dayInput  = document.getElementById('birthDay')  || document.querySelector('input[name="day"]')  || document.querySelector('input[placeholder="วัน"]');

    function onNewInput() {
      // เมื่อมีการแก้ไข input ใดๆ ในฟอร์ม ให้ mark ว่า "กำลังกรอกใหม่"
      window._avFormDirty = true;
    }

    if (nameInput) nameInput.addEventListener('input', onNewInput);
    if (dayInput)  dayInput.addEventListener('input', onNewInput);
  }

  /* ── 2. เพิ่มปุ่ม "เริ่มใหม่" ใน Profile section ── */
  function addResetButton() {
    // รอให้ DOM โหลดเสร็จ
    var profileSection = document.getElementById('profile') || document.querySelector('.profile-section');
    if (!profileSection) return;

    // ตรวจว่ามีปุ่มอยู่แล้วไหม
    if (document.getElementById('av-reset-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'av-reset-btn';
    btn.textContent = '🔄 ล้างข้อมูลและเริ่มใหม่';
    btn.style.cssText = [
      'display:block',
      'width:100%',
      'margin-top:12px',
      'padding:12px',
      'border-radius:12px',
      'border:1px solid rgba(176,64,255,0.3)',
      'background:rgba(176,64,255,0.08)',
      'color:rgba(200,150,255,0.8)',
      'font-size:14px',
      'font-weight:600',
      'cursor:pointer',
      'text-align:center'
    ].join(';');

    btn.addEventListener('click', function() {
      if (confirm('ต้องการล้างข้อมูลทั้งหมดและเริ่มกรอกใหม่?')) {
        resetAllData();
      }
    });

    profileSection.appendChild(btn);
  }

  /* ── 3. ฟังก์ชัน reset ข้อมูล ── */
  function resetAllData() {
    // keys ที่เกี่ยวกับ profile และ session
    var keysToRemove = [
      'av_p',        // profile หลัก
      'av_natal',    // natal chart
      'av_sum',      // summary
      'av_vera',     // vera state
      'av_lc_script',// life coach script
      'av_ai',       // AI ที่เลือก
      'av_quiz',     // quiz answers
      'av_phase',    // life phase
    ];

    keysToRemove.forEach(function(key) {
      localStorage.removeItem(key);
    });

    // ไม่ลบ: av_j (journal), av_sound (sound pref) เพราะเป็นข้อมูลที่ผู้ใช้บันทึกไว้

    // reload กลับหน้า landing
    window.location.href = './index.html';
  }

  /* ── 4. แก้ input วัน/เดือน/ปี/เวลา ไม่ให้ค้างหลัง submit ── */
  function watchFormSubmit() {
    // ฟัง submit form หรือคลิกปุ่มวิเคราะห์
    var analyzeBtn = document.querySelector('[onclick*="analyze"]') ||
                     document.querySelector('.analyze-btn') ||
                     document.querySelector('button[class*="analyze"]');

    if (!analyzeBtn) return;

    analyzeBtn.addEventListener('click', function() {
      // บันทึก timestamp ที่กรอกล่าสุด
      localStorage.setItem('av_last_submit', Date.now().toString());
    });
  }

  /* ── 5. ตรวจสอบ profile ว่าสมบูรณ์ไหม ── */
  function validateProfileOnLoad() {
    var profileKey = 'av_p';
    var stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(profileKey));
    } catch(e) {
      // JSON เสีย ล้างทิ้ง
      localStorage.removeItem(profileKey);
      return;
    }

    if (!stored) return;

    // ถ้า profile ไม่มี dob เท่านั้นให้ล้างทิ้ง (name เป็น optional)
    if (!stored.dob) {
      localStorage.removeItem(profileKey);
      return;
    }

    // ถ้า dob ผิดรูปแบบ ล้างทิ้ง
    if (typeof stored.dob === 'string' && stored.dob.trim() === '') {
      localStorage.removeItem(profileKey);
    }
  }

  /* ── 6. expose resetAllData ให้เรียกจากที่อื่นได้ ── */
  window.avResetAll = resetAllData;

  /* ── รัน ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      validateProfileOnLoad();
      clearStaleProfile();
      watchFormSubmit();
      setTimeout(addResetButton, 800); // รอ DOM render เสร็จ
    });
  } else {
    validateProfileOnLoad();
    clearStaleProfile();
    watchFormSubmit();
    setTimeout(addResetButton, 800);
  }

})();

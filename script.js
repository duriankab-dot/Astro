// ============================================================
// script.js - ASTROVERA Frontend
// รวม AI ทั้งหมดเข้าเป็น VERA ตัวเดียว
// ============================================================

const API_URL = '/.netlify/functions/natal-chart';

// ============================================================
// 🧠 ฟังก์ชันหลัก: VERA
// ============================================================

async function callVERA(mode, message, context = {}) {
  try {
    showLoading('vera-result');
    
    // เก็บประวัติการสนทนา
    const history = JSON.parse(localStorage.getItem('vera_chat_history') || '[]');
    history.push({ mode, message, timestamp: new Date().toISOString() });
    if (history.length > 50) history.shift(); // จำกัด 50 ข้อความ
    localStorage.setItem('vera_chat_history', JSON.stringify(history));
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vera',
        mode: mode,
        message: message,
        userId: localStorage.getItem('userId') || 'guest',
        context: {
          userType: localStorage.getItem('userType') || 'Visionary Builder',
          lifePhase: localStorage.getItem('lifePhase') || 'Building Phase',
          recentDecisions: JSON.parse(localStorage.getItem('astrovera_decisions') || '[]').slice(-5),
          stats: JSON.parse(localStorage.getItem('astrovera_stats') || '{}')
        }
      })
    });

    const result = await response.json();
    hideLoading('vera-result');

    if (result.success) {
      displayVERAResult(result.data);
      showNotification('success', 'VERA ตอบกลับแล้ว 💬');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถติดต่อ VERA ได้');
      return null;
    }
  } catch (error) {
    console.error('VERA Error:', error);
    hideLoading('vera-result');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// ============================================================
// 🎨 ฟังก์ชันแสดงผล VERA
// ============================================================

function displayVERAResult(data) {
  const container = document.getElementById('vera-result');
  if (!container) return;
  
  let html = `<div class="vera-response mode-${data.mode}">`;
  
  // แสดงข้อความตอบกลับ
  html += `<div class="vera-message">${formatMessage(data.reply)}</div>`;
  
  // แสดงสถานการณ์จำลอง (โหมด analyze)
  if (data.mode === 'analyze' && data.scenarios) {
    html += `<div class="scenarios-container"><h4>📊 สถานการณ์จำลอง</h4>`;
    html += `<div class="scenario-grid">`;
    data.scenarios.forEach(s => {
      const cls = s.successRate > 70 ? 'high' : s.successRate > 50 ? 'medium' : 'low';
      html += `
        <div class="scenario-card ${cls}">
          <h5>${s.name}</h5>
          <p>${s.description}</p>
          <div class="pros-cons">
            <div class="pros">✅ ${s.pros.join(' · ')}</div>
            <div class="cons">❌ ${s.cons.join(' · ')}</div>
          </div>
          <div class="success-rate">🎯 โอกาสสำเร็จ: ${s.successRate}%</div>
        </div>
      `;
    });
    html += `</div>`;
    
    if (data.recommendation) {
      html += `<div class="recommendation">💡 คำแนะนำ: ${data.recommendation}</div>`;
    }
    html += `</div>`;
  }
  
  // แสดงการติดตาม (โหมด track)
  if (data.mode === 'track' && data.nextSteps) {
    html += `<div class="track-container"><h4>🎯 ขั้นตอนต่อไป</h4><ul>`;
    data.nextSteps.forEach(step => {
      html += `<li>✅ ${step}</li>`;
    });
    html += `</ul>`;
    
    if (data.progress) {
      html += `<div class="progress-summary">
        <span>📊 การตัดสินใจ: ${data.progress.totalDecisions || 0}</span>
        <span>📈 อัตราสำเร็จ: ${data.progress.completionRate || 0}%</span>
        <span>💡 Insights: ${data.progress.insights || 0}</span>
      </div>`;
    }
    html += `</div>`;
  }
  
  // แสดงโหมด
  html += `<div class="mode-badge">${getModeLabel(data.mode)}</div>`;
  html += `<div class="timestamp">${new Date(data.timestamp).toLocaleString('th-TH')}</div>`;
  
  html += `</div>`;
  container.innerHTML = html;
  
  // เลื่อนไปที่ผลลัพธ์
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatMessage(text) {
  // แปลง newline เป็น <br>
  return text.replace(/\n/g, '<br>');
}

function getModeLabel(mode) {
  const labels = {
    'chat': '💬 โหมดแชท',
    'analyze': '🧠 โหมดวิเคราะห์',
    'track': '📊 โหมดติดตาม',
    'info': 'ℹ️ ข้อมูล'
  };
  return labels[mode] || '💬 VERA';
}

// ============================================================
// 🟢 ฟังก์ชัน UI ทั่วไป
// ============================================================

function showNotification(type, message) {
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.display = 'block';
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.padding = '16px 24px';
  notification.style.borderRadius = '8px';
  notification.style.color = 'white';
  notification.style.fontWeight = '500';
  notification.style.zIndex = '10000';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  notification.style.maxWidth = '400px';
  
  if (type === 'success') {
    notification.style.background = '#4caf50';
  } else if (type === 'error') {
    notification.style.background = '#f44336';
  } else {
    notification.style.background = '#2196f3';
  }
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '<div class="loading-spinner"><span class="spinner"></span> กำลังประมวลผล...</div>';
    el.style.display = 'block';
  }
}

function hideLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '';
    el.style.display = 'none';
  }
}

// ============================================================
// 🎯 Event Listeners
// ============================================================

function setupEventListeners() {
  console.log('🎯 Setting up VERA event listeners...');
  
  // 1. ฟอร์มหลักของ VERA
  const veraForm = document.getElementById('vera-form');
  if (veraForm) {
    veraForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const mode = document.getElementById('vera-mode')?.value || 'chat';
      const message = document.getElementById('vera-message')?.value?.trim();
      if (message) {
        callVERA(mode, message);
        this.reset();
        // รักษาโหมดไว้
        document.getElementById('vera-mode').value = mode;
      } else {
        showNotification('error', 'กรุณาพิมพ์ข้อความ');
      }
    });
    console.log('✅ VERA form attached');
  } else {
    console.warn('⚠️ VERA form not found');
  }
  
  // 2. ปุ่มโหมดด่วน
  document.querySelectorAll('.vera-mode-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const mode = this.dataset.mode;
      const presetMessage = this.dataset.presetMessage || '';
      
      // เปลี่ยนโหมดใน select
      const modeSelect = document.getElementById('vera-mode');
      if (modeSelect) modeSelect.value = mode;
      
      // ใส่ข้อความตัวอย่าง
      const messageInput = document.getElementById('vera-message');
      if (messageInput && presetMessage) {
        messageInput.value = presetMessage;
        messageInput.focus();
      }
      
      showNotification('info', `เปลี่ยนเป็น ${getModeLabel(mode)} แล้ว`);
    });
  });
  
  // 3. ฟังก์ชันอื่นๆ ที่ยังใช้งาน
  setupOtherFunctions();
}

function setupOtherFunctions() {
  // ฟอร์มวิเคราะห์ตัวตน (ถ้ามี)
  const analysisForm = document.getElementById('analysis-form');
  if (analysisForm) {
    analysisForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // ... ฟังก์ชันเดิม
    });
  }
  
  // ฟอร์ม Decision (ถ้ามี)
  const decisionForm = document.getElementById('decision-form');
  if (decisionForm) {
    decisionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // ... ฟังก์ชันเดิม
    });
  }
  
  // ฟอร์ม Journal (ถ้ามี)
  const journalForm = document.getElementById('journal-form');
  if (journalForm) {
    journalForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // ... ฟังก์ชันเดิม
    });
  }
}

// ============================================================
// 🚀 เริ่มต้น
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 ASTROVERA VERA System Initializing...');
  
  // ตั้งค่า Event Listeners
  setupEventListeners();
  
  console.log('✅ VERA System Ready!');
});

// ============================================================
// 📤 Export
// ============================================================

window.callVERA = callVERA;
window.showNotification = showNotification;

console.log('✅ ASTROVERA Script Loaded');

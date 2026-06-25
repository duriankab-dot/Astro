// script.js
// แก้ไขระบบบันทึกข้อมูลและแสดงผล

const API_URL = '/.netlify/functions/natal-chart';

// ============================================================
// 🔴 ฟังก์ชันหลัก
// ============================================================

// 1. AI ที่ปรึกษาชีวิต
async function askAIAdivsor(question, context = {}) {
  try {
    showLoading('ai-advisor');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai_advisor',
        question: question,
        userType: localStorage.getItem('userType') || 'Visionary Builder',
        lifePhase: localStorage.getItem('lifePhase') || 'Building Phase',
        context: context
      })
    });

    const result = await response.json();
    hideLoading('ai-advisor');

    if (result.success) {
      displayAIAdvisorResult(result.data);
      showNotification('success', 'วิเคราะห์สถานการณ์สำเร็จ');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถวิเคราะห์ได้');
      return null;
    }
  } catch (error) {
    console.error('AI Advisor Error:', error);
    hideLoading('ai-advisor');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 2. Scenario Intelligence
async function analyzeScenario(options, context = {}) {
  try {
    showLoading('scenario');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'scenario',
        options: options,
        userType: localStorage.getItem('userType') || 'Visionary Builder',
        context: context
      })
    });

    const result = await response.json();
    hideLoading('scenario');

    if (result.success) {
      displayScenarioResult(result.data);
      showNotification('success', 'วิเคราะห์สถานการณ์สำเร็จ');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถวิเคราะห์ได้');
      return null;
    }
  } catch (error) {
    console.error('Scenario Error:', error);
    hideLoading('scenario');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 3. VERA Chat
async function askVERA(question, history = []) {
  try {
    showLoading('vera-chat');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vera_chat',
        question: question,
        userId: localStorage.getItem('userId') || null,
        history: history
      })
    });

    const result = await response.json();
    hideLoading('vera-chat');

    if (result.success) {
      addVERAMessage(result.data.answer, 'bot');
      showNotification('success', 'ได้รับคำตอบแล้ว');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถตอบได้');
      return null;
    }
  } catch (error) {
    console.error('VERA Chat Error:', error);
    hideLoading('vera-chat');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 4. Decision Tracker
async function saveDecision(decisionData) {
  try {
    showLoading('decision-tracker');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_decision',
        decisionData: decisionData,
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    hideLoading('decision-tracker');

    if (result.success) {
      // บันทึกใน Local Storage
      const decisions = JSON.parse(localStorage.getItem('astrovera_decisions') || '[]');
      decisions.push(result.data);
      localStorage.setItem('astrovera_decisions', JSON.stringify(decisions));
      
      showNotification('success', '🎯 บันทึกการตัดสินใจสำเร็จ!');
      updateDecisionStats();
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถบันทึกได้');
      return null;
    }
  } catch (error) {
    console.error('Save Decision Error:', error);
    hideLoading('decision-tracker');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// ============================================================
// 🟡 ฟังก์ชันรอง
// ============================================================

// 5. บันทึก Journal
async function saveJournal(journalData) {
  try {
    showLoading('journal');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_journal',
        journalData: journalData,
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    hideLoading('journal');

    if (result.success) {
      const journals = JSON.parse(localStorage.getItem('astrovera_journals') || '[]');
      journals.push(result.data);
      localStorage.setItem('astrovera_journals', JSON.stringify(journals));
      
      showNotification('success', '📝 บันทึก Journal สำเร็จ!');
      updateJournalStats();
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถบันทึกได้');
      return null;
    }
  } catch (error) {
    console.error('Save Journal Error:', error);
    hideLoading('journal');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 6. Daily Inner Sync
async function saveDailySync(syncData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync',
        data: {
          type: 'daily_sync',
          ...syncData,
          date: new Date().toISOString().split('T')[0]
        },
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('lastDailySync', JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        data: syncData
      }));
      
      showNotification('success', '🌅 บันทึก Daily Sync สำเร็จ!');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถบันทึกได้');
      return null;
    }
  } catch (error) {
    console.error('Save Daily Sync Error:', error);
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 7. Weekly Evolution
async function saveWeeklyEvolution(weeklyData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync',
        data: {
          type: 'weekly_evolution',
          ...weeklyData,
          week: getWeekNumber(),
          year: new Date().getFullYear()
        },
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('lastWeeklyEvolution', JSON.stringify({
        week: getWeekNumber(),
        year: new Date().getFullYear(),
        data: weeklyData
      }));
      
      showNotification('success', '🌱 บันทึก Weekly Evolution สำเร็จ!');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถบันทึกได้');
      return null;
    }
  } catch (error) {
    console.error('Save Weekly Evolution Error:', error);
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 8. โหลดสถิติ Dashboard
async function loadDashboardStats() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_stats',
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      displayDashboardStats(result.data);
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถโหลดสถิติได้');
      return null;
    }
  } catch (error) {
    console.error('Load Stats Error:', error);
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// ============================================================
// 🟢 ฟังก์ชัน UI และ Utility
// ============================================================

// แสดง Notification
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
  notification.style.animation = 'slideIn 0.3s ease';
  
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

// แสดง Loading
function showLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '<div class="loading-spinner"><span class="spinner"></span> กำลังประมวลผล...</div>';
  }
}

function hideLoading(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = '';
  }
}

// แสดงผลลัพธ์ AI Advisor
function displayAIAdvisorResult(data) {
  const container = document.getElementById('ai-advisor-result');
  if (!container) return;
  
  container.innerHTML = `
    <div class="ai-result">
      <h3>${data.summary || 'ผลการวิเคราะห์'}</h3>
      <div class="user-profile">
        <span class="badge">${data.userProfile}</span>
        <span class="badge phase">${data.currentPhase}</span>
      </div>
      <div class="recommendations">
        <h4>คำแนะนำ</h4>
        <ul>${data.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="scenarios">
        <h4>สถานการณ์จำลอง</h4>
        ${data.scenarios.map(s => `
          <div class="scenario-card">
            <h5>${s.name}</h5>
            <p>${s.description}</p>
            <div class="pros-cons">
              <div class="pros">✅ ${s.pros.join(', ')}</div>
              <div class="cons">❌ ${s.cons.join(', ')}</div>
            </div>
            <div class="success-rate">โอกาสสำเร็จ: ${s.successRate}%</div>
          </div>
        `).join('')}
      </div>
      <div class="decision-factors">
        <h4>ปัจจัยการตัดสินใจ</h4>
        <ul>
          <li>ความเสี่ยง: ${data.decisionFactors.risk}</li>
          <li>ผลตอบแทน: ${data.decisionFactors.reward}</li>
          <li>ระยะเวลา: ${data.decisionFactors.timeframe}</li>
          <li>ความสอดคล้อง: ${data.decisionFactors.alignment}</li>
        </ul>
      </div>
    </div>
  `;
}

// แสดงผลลัพธ์ Scenario
function displayScenarioResult(data) {
  const container = document.getElementById('scenario-result');
  if (!container) return;
  
  container.innerHTML = `
    <div class="scenario-result">
      <h3>📊 ผลการจำลองสถานการณ์</h3>
      <div class="scenario-grid">
        ${data.scenarios.map(s => `
          <div class="scenario-card ${s.successRate > 70 ? 'high' : s.successRate > 50 ? 'medium' : 'low'}">
            <h4>${s.name}</h4>
            <p>${s.description}</p>
            <div class="rate">${s.successRate}%</div>
            <div class="details">
              <div class="pros">✅ ${s.pros.join(' · ')}</div>
              <div class="cons">❌ ${s.cons.join(' · ')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// แสดงข้อความ VERA
function addVERAMessage(text, sender) {
  const container = document.getElementById('vera-chat-messages');
  if (!container) return;
  
  const message = document.createElement('div');
  message.className = `vera-message ${sender}`;
  message.innerHTML = `
    <div class="avatar">${sender === 'bot' ? '🤖' : '👤'}</div>
    <div class="message-content">${text}</div>
  `;
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
}

// อัปเดตสถิติ Decision
function updateDecisionStats() {
  const decisions = JSON.parse(localStorage.getItem('astrovera_decisions') || '[]');
  const statsEl = document.getElementById('decision-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-item">📊 ทั้งหมด: ${decisions.length}</div>
      <div class="stat-item">✅ สำเร็จ: ${decisions.filter(d => d.status === 'completed').length}</div>
      <div class="stat-item">⏳ กำลังดำเนินการ: ${decisions.filter(d => d.status === 'active').length}</div>
    `;
  }
}

// อัปเดตสถิติ Journal
function updateJournalStats() {
  const journals = JSON.parse(localStorage.getItem('astrovera_journals') || '[]');
  const statsEl = document.getElementById('journal-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-item">📝 ทั้งหมด: ${journals.length}</div>
      <div class="stat-item">📆 7 วันล่าสุด: ${journals.filter(j => {
        const d = new Date(j.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d > weekAgo;
      }).length}</div>
    `;
  }
}

// แสดง Dashboard Stats
function displayDashboardStats(data) {
  const container = document.getElementById('dashboard-stats');
  if (!container) return;
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <h4>📊 ภาพรวม</h4>
        <div class="stat-value">${data.overview.totalDecisions} ตัดสินใจ</div>
        <div class="stat-value">${data.overview.totalJournals} Journal</div>
        <div class="stat-value">อัตราสำเร็จ ${data.overview.completionRate}%</div>
      </div>
      <div class="stat-card">
        <h4>📈 รูปแบบ</h4>
        <div class="stat-value">หมวดหมู่หลัก: ${data.patterns.topCategories.join(', ')}</div>
        <div class="stat-value">เวลาที่ดีที่สุด: ${data.patterns.bestTime}</div>
        <div class="stat-value">แนวโน้ม: ${data.patterns.confidenceTrend}</div>
      </div>
      <div class="stat-card">
        <h4>🌱 การเติบโต</h4>
        <div class="stat-value">💡 Insight: ${data.growth.insights}</div>
        <div class="stat-value">📚 บทเรียน: ${data.growth.lessons}</div>
        <div class="stat-value">🏆 Milestone: ${data.growth.milestones}</div>
      </div>
      <div class="stat-card">
        <h4>📅 กิจกรรมล่าสุด</h4>
        ${data.recentActivity.map(a => `
          <div class="activity-item">
            <span class="activity-type">${a.type === 'decision' ? '🎯' : '📝'}</span>
            <span>${a.title}</span>
            <span class="activity-date">${a.date}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Utility: หาสัปดาห์ปัจจุบัน
function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ============================================================
// เริ่มต้นใช้งาน
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 ASTROVERA Loaded');
  
  // โหลดข้อมูลจาก Local Storage
  loadUserData();
  updateDecisionStats();
  updateJournalStats();
  
  // โหลด Dashboard Stats
  loadDashboardStats();
  
  // ตั้งค่า Event Listeners
  setupEventListeners();
});

function loadUserData() {
  const saved = localStorage.getItem('astrovera_user_data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      displayUserData(data);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }
}

function displayUserData(data) {
  const userTypeEl = document.getElementById('user-type');
  if (userTypeEl) userTypeEl.textContent = data.userType || 'Visionary Builder';
  
  const descriptionEl = document.getElementById('user-description');
  if (descriptionEl) descriptionEl.textContent = data.description || '';
}

function setupEventListeners() {
  // AI Advisor
  const aiForm = document.getElementById('ai-advisor-form');
  if (aiForm) {
    aiForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const question = document.getElementById('ai-question').value;
      if (question) {
        askAIAdivsor(question);
      }
    });
  }
  
  // VERA Chat
  const veraForm = document.getElementById('vera-chat-form');
  if (veraForm) {
    veraForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = document.getElementById('vera-input');
      const question = input.value.trim();
      if (question) {
        addVERAMessage(question, 'user');
        askVERA(question);
        input.value = '';
      }
    });
  }
  
  // Decision Form
  const decisionForm = document.getElementById('decision-form');
  if (decisionForm) {
    decisionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const decisionData = {
        title: document.getElementById('decision-title').value,
        description: document.getElementById('decision-description').value,
        category: document.getElementById('decision-category').value,
        confidence: parseInt(document.getElementById('decision-confidence').value) || 5
      };
      if (decisionData.title) {
        saveDecision(decisionData);
        this.reset();
      }
    });
  }
  
  // Journal Form
  const journalForm = document.getElementById('journal-form');
  if (journalForm) {
    journalForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const journalData = {
        content: document.getElementById('journal-content').value,
        mood: document.getElementById('journal-mood').value || 'neutral',
        tags: document.getElementById('journal-tags').value.split(',').map(t => t.trim()).filter(Boolean)
      };
      if (journalData.content) {
        saveJournal(journalData);
        this.reset();
      }
    });
  }
  
  // Daily Sync
  const syncForm = document.getElementById('daily-sync-form');
  if (syncForm) {
    syncForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const syncData = {
        energy: parseInt(document.getElementById('sync-energy').value) || 5,
        mood: document.getElementById('sync-mood').value || 'neutral',
        focus: document.getElementById('sync-focus').value || ''
      };
      saveDailySync(syncData);
    });
  }
  
  // Weekly Evolution
  const weeklyForm = document.getElementById('weekly-evolution-form');
  if (weeklyForm) {
    weeklyForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const weeklyData = {
        proud: document.getElementById('weekly-proud').value,
        challenge: document.getElementById('weekly-challenge').value,
        lesson: document.getElementById('weekly-lesson').value,
        focus: document.getElementById('weekly-focus').value
      };
      saveWeeklyEvolution(weeklyData);
    });
  }
}

// Export functions for use in HTML
window.askAIAdivsor = askAIAdivsor;
window.analyzeScenario = analyzeScenario;
window.askVERA = askVERA;
window.saveDecision = saveDecision;
window.saveJournal = saveJournal;
window.saveDailySync = saveDailySync;
window.saveWeeklyEvolution = saveWeeklyEvolution;
window.loadDashboardStats = loadDashboardStats;

console.log('✅ ASTROVERA Script Loaded Successfully');

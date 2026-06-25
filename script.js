// ============================================================
// script.js - ASTROVERA Full System
// ============================================================

const API_URL = '/.netlify/functions/natal-chart';

// ============================================================
// 🔴 ฟังก์ชันหลัก
// ============================================================

// 1. วิเคราะห์ตัวตน
async function analyzeIdentity(data) {
  try {
    showLoading('analysis-result');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze',
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthPlace: data.birthPlace,
        bloodType: data.bloodType,
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    hideLoading('analysis-result');

    if (result.success) {
      // บันทึกข้อมูลใน Local Storage
      localStorage.setItem('astrovera_user_data', JSON.stringify(result.data));
      displayAnalysisResult(result.data);
      showNotification('success', '🌟 วิเคราะห์ตัวตนสำเร็จ!');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถวิเคราะห์ได้');
      return null;
    }
  } catch (error) {
    console.error('Analysis Error:', error);
    hideLoading('analysis-result');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 2. AI ที่ปรึกษาชีวิต
async function askAIAdivsor(question, context = {}) {
  try {
    showLoading('ai-advisor-result');
    
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
    hideLoading('ai-advisor-result');

    if (result.success) {
      displayAIAdvisorResult(result.data);
      showNotification('success', '✨ วิเคราะห์สถานการณ์สำเร็จ!');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถวิเคราะห์ได้');
      return null;
    }
  } catch (error) {
    console.error('AI Advisor Error:', error);
    hideLoading('ai-advisor-result');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 3. Scenario Intelligence
async function analyzeScenario(options, context = {}) {
  try {
    showLoading('scenario-result');
    
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
    hideLoading('scenario-result');

    if (result.success) {
      displayScenarioResult(result.data);
      showNotification('success', '📊 จำลองสถานการณ์สำเร็จ!');
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถจำลองได้');
      return null;
    }
  } catch (error) {
    console.error('Scenario Error:', error);
    hideLoading('scenario-result');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 4. VERA Chat
async function askVERA(question, history = []) {
  try {
    showLoading('vera-chat-messages');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'vera_chat',
        question: question,
        userId: localStorage.getItem('userId') || 'guest',
        history: history
      })
    });

    const result = await response.json();
    hideLoading('vera-chat-messages');

    if (result.success) {
      addVERAMessage(result.data.answer, 'bot');
      return result.data;
    } else {
      addVERAMessage('ขออภัย ฉันไม่สามารถตอบคำถามนี้ได้ในตอนนี้', 'bot');
      showNotification('error', result.message || 'ไม่สามารถตอบได้');
      return null;
    }
  } catch (error) {
    console.error('VERA Chat Error:', error);
    hideLoading('vera-chat-messages');
    addVERAMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่', 'bot');
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 5. Decision Tracker - บันทึกการตัดสินใจ
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
      updateDashboard();
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

// 6. บันทึก Journal
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
      updateDashboard();
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

// 7. บันทึก Follow-up
async function saveFollowUp(followUpData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_followup',
        followUpData: followUpData,
        userId: localStorage.getItem('userId') || 'guest'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      const followUps = JSON.parse(localStorage.getItem('astrovera_followups') || '[]');
      followUps.push(result.data);
      localStorage.setItem('astrovera_followups', JSON.stringify(followUps));
      
      showNotification('success', '📅 บันทึกการติดตามผลสำเร็จ!');
      updateDashboard();
      return result.data;
    } else {
      showNotification('error', result.message || 'ไม่สามารถบันทึกได้');
      return null;
    }
  } catch (error) {
    console.error('Save FollowUp Error:', error);
    showNotification('error', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    return null;
  }
}

// 8. Daily Inner Sync
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
      updateDashboard();
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

// 9. Weekly Evolution
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
      updateDashboard();
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

// 10. โหลดสถิติ Dashboard
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
      console.warn('Cannot load stats:', result.message);
      return null;
    }
  } catch (error) {
    console.error('Load Stats Error:', error);
    return null;
  }
}

// ============================================================
// 🟢 ฟังก์ชัน UI และ Display
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

// แสดงผลการวิเคราะห์ตัวตน
function displayAnalysisResult(data) {
  const container = document.getElementById('analysis-result');
  if (!container) return;
  
  container.innerHTML = `
    <div class="analysis-result-card">
      <div class="user-type-badge">🔮 ${data.userType}</div>
      <p class="user-description">${data.description}</p>
      <div class="life-phase">📍 ${data.lifePhase}</div>
      
      <div class="strengths-section">
        <h4>⚡ จุดแข็ง</h4>
        <ul>${data.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
      
      <div class="weaknesses-section">
        <h4>⚠️ จุดที่ควรพัฒนา</h4>
        <ul>${data.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>
      
      <div class="advice-section">
        <h4>💡 คำแนะนำ</h4>
        <p>${data.advice}</p>
      </div>
      
      <div class="reflection-section">
        <h4>🤔 คำถามชวนคิด</h4>
        <ul>${data.reflectionQuestions.map(q => `<li>${q}</li>`).join('')}</ul>
      </div>
      
      <div class="journal-prompt">
        <h4>📝 Journal Prompt</h4>
        <p>${data.journalPrompt}</p>
      </div>
    </div>
  `;
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
        <h4>📌 คำแนะนำ</h4>
        <ul>${data.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="scenarios">
        <h4>📊 สถานการณ์จำลอง</h4>
        ${data.scenarios.map(s => `
          <div class="scenario-card ${s.successRate > 70 ? 'high' : s.successRate > 50 ? 'medium' : 'low'}">
            <h5>${s.name}</h5>
            <p>${s.description}</p>
            <div class="pros-cons">
              <div class="pros">✅ ${s.pros.join(' · ')}</div>
              <div class="cons">❌ ${s.cons.join(' · ')}</div>
            </div>
            <div class="success-rate">🎯 โอกาสสำเร็จ: ${s.successRate}%</div>
          </div>
        `).join('')}
      </div>
      <div class="decision-factors">
        <h4>🔍 ปัจจัยการตัดสินใจ</h4>
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
        <div class="stat-value">🎯 ${data.overview.totalDecisions} การตัดสินใจ</div>
        <div class="stat-value">📝 ${data.overview.totalJournals} Journal</div>
        <div class="stat-value">📅 ${data.overview.totalFollowUps} การติดตามผล</div>
        <div class="stat-value">📈 อัตราสำเร็จ ${data.overview.completionRate}%</div>
      </div>
      <div class="stat-card">
        <h4>📈 รูปแบบ</h4>
        <div class="stat-value">📂 หมวดหมู่หลัก: ${data.patterns.topCategories.join(', ')}</div>
        <div class="stat-value">⏰ เวลาที่ดีที่สุด: ${data.patterns.bestTime}</div>
        <div class="stat-value">📊 แนวโน้มความมั่นใจ: ${data.patterns.confidenceTrend}</div>
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

// อัปเดต Dashboard ทั้งหมด
function updateDashboard() {
  loadDashboardStats();
  updateDecisionStats();
  updateJournalStats();
}

// ============================================================
// 🛠️ Utility Functions
// ============================================================

// หาสัปดาห์ปัจจุบัน
function getWeekNumber() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// โหลดข้อมูลผู้ใช้จาก Local Storage
function loadUserData() {
  const saved = localStorage.getItem('astrovera_user_data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      displayUserData(data);
      return data;
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }
  return null;
}

// แสดงข้อมูลผู้ใช้
function displayUserData(data) {
  const userTypeEl = document.getElementById('user-type');
  if (userTypeEl) userTypeEl.textContent = data.userType || 'Visionary Builder';
  
  const descriptionEl = document.getElementById('user-description');
  if (descriptionEl) descriptionEl.textContent = data.description || '';
}

// ============================================================
// 🎯 Event Listeners Setup
// ============================================================

function setupEventListeners() {
  console.log('🎯 Setting up event listeners...');
  
  // 1. ฟอร์มวิเคราะห์ตัวตน
  const analysisForm = document.getElementById('analysis-form');
  if (analysisForm) {
    analysisForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = {
        birthDate: document.getElementById('birth-date').value,
        birthTime: document.getElementById('birth-time').value,
        birthPlace: document.getElementById('birth-place').value,
        bloodType: document.getElementById('blood-type').value
      };
      if (data.birthDate && data.birthTime) {
        analyzeIdentity(data);
      } else {
        showNotification('error', 'กรุณากรอกวันเกิดและเวลาเกิด');
      }
    });
    console.log('✅ Analysis form attached');
  } else {
    console.warn('⚠️ Analysis form not found');
  }
  
  // 2. AI Advisor
  const aiForm = document.getElementById('ai-advisor-form');
  if (aiForm) {
    aiForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const question = document.getElementById('ai-question').value;
      if (question) {
        askAIAdivsor(question);
      } else {
        showNotification('error', 'กรุณาใส่คำถาม');
      }
    });
    console.log('✅ AI Advisor form attached');
  }
  
  // 3. Scenario
  const scenarioForm = document.getElementById('scenario-form');
  if (scenarioForm) {
    scenarioForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const options = [
        {
          name: document.getElementById('scenario-a-name').value || 'ทางเลือก A',
          description: document.getElementById('scenario-a-desc').value || '',
          pros: document.getElementById('scenario-a-pros').value.split(',').map(s => s.trim()),
          cons: document.getElementById('scenario-a-cons').value.split(',').map(s => s.trim()),
          successRate: parseInt(document.getElementById('scenario-a-rate').value) || 50
        },
        {
          name: document.getElementById('scenario-b-name').value || 'ทางเลือก B',
          description: document.getElementById('scenario-b-desc').value || '',
          pros: document.getElementById('scenario-b-pros').value.split(',').map(s => s.trim()),
          cons: document.getElementById('scenario-b-cons').value.split(',').map(s => s.trim()),
          successRate: parseInt(document.getElementById('scenario-b-rate').value) || 50
        }
      ];
      analyzeScenario(options);
    });
    console.log('✅ Scenario form attached');
  }
  
  // 4. VERA Chat
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
    console.log('✅ VERA Chat form attached');
  }
  
  // 5. Decision Form
  const decisionForm = document.getElementById('decision-form');
  if (decisionForm) {
    decisionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const decisionData = {
        title: document.getElementById('decision-title').value,
        description: document.getElementById('decision-description').value,
        category: document.getElementById('decision-category').value || 'ทั่วไป',
        confidence: parseInt(document.getElementById('decision-confidence').value) || 5
      };
      if (decisionData.title) {
        saveDecision(decisionData);
        this.reset();
      } else {
        showNotification('error', 'กรุณาใส่หัวข้อการตัดสินใจ');
      }
    });
    console.log('✅ Decision form attached');
  }
  
  // 6. Journal Form
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
      } else {
        showNotification('error', 'กรุณาเขียนเนื้อหา Journal');
      }
    });
    console.log('✅ Journal form attached');
  }
  
  // 7. Daily Sync
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
    console.log('✅ Daily Sync form attached');
  }
  
  // 8. Weekly Evolution
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
    console.log('✅ Weekly Evolution form attached');
  }
  
  // 9. Follow-up
  const followUpForm = document.getElementById('followup-form');
  if (followUpForm) {
    followUpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const followUpData = {
        decisionId: document.getElementById('followup-decision-id').value,
        status: document.getElementById('followup-status').value || 'pending',
        reflection: document.getElementById('followup-reflection').value || ''
      };
      if (followUpData.decisionId) {
        saveFollowUp(followUpData);
        this.reset();
      } else {
        showNotification('error', 'กรุณาเลือกการตัดสินใจ');
      }
    });
    console.log('✅ Follow-up form attached');
  }
}

// ============================================================
// 🚀 เริ่มต้นเมื่อ DOM โหลดเสร็จ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 ASTROVERA System Initializing...');
  
  // 1. โหลดข้อมูลผู้ใช้
  loadUserData();
  
  // 2. อัปเดตสถิติ
  updateDecisionStats();
  updateJournalStats();
  
  // 3. โหลด Dashboard
  loadDashboardStats();
  
  // 4. ตั้งค่า Event Listeners
  setupEventListeners();
  
  // 5. เพิ่ม CSS animation keyframes (ถ้ายังไม่มี)
  addAnimationStyles();
  
  console.log('✅ ASTROVERA System Ready!');
});

// ============================================================
// 🎨 เพิ่ม CSS Animation (ถ้ายังไม่มีใน style.css)
// ============================================================

function addAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      color: #aaa;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(108, 99, 255, 0.2);
      border-top: 3px solid #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(108, 99, 255, 0.2);
      color: #6c63ff;
      font-size: 12px;
      font-weight: 500;
      margin: 4px;
    }
    .badge.phase {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }
    .scenario-card {
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      margin: 12px 0;
    }
    .scenario-card.high { border-left: 4px solid #4caf50; }
    .scenario-card.medium { border-left: 4px solid #ff9800; }
    .scenario-card.low { border-left: 4px solid #f44336; }
    .scenario-card .rate { font-size: 24px; font-weight: bold; color: #6c63ff; }
    .scenario-card .pros { color: #4caf50; }
    .scenario-card .cons { color: #f44336; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }
    .stat-card {
      padding: 16px;
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
    }
    .stat-card h4 { margin: 0 0 12px 0; color: #fff; }
    .stat-value { padding: 4px 0; font-size: 14px; color: #ccc; }
    .activity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .activity-date { margin-left: auto; color: #888; font-size: 12px; }
    .vera-chat-messages {
      max-height: 400px;
      overflow-y: auto;
      padding: 16px;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
    }
    .vera-message {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      align-items: flex-start;
    }
    .vera-message.user { flex-direction: row-reverse; }
    .vera-message .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.1);
      font-size: 18px;
      flex-shrink: 0;
    }
    .vera-message.bot .avatar { background: rgba(108, 99, 255, 0.3); }
    .vera-message.user .avatar { background: rgba(76, 175, 80, 0.3); }
    .vera-message .message-content {
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      max-width: 70%;
    }
    .vera-message.user .message-content {
      background: rgba(108, 99, 255, 0.2);
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// 📤 Export functions for use in HTML
// ============================================================

window.analyzeIdentity = analyzeIdentity;
window.askAIAdivsor = askAIAdivsor;
window.analyzeScenario = analyzeScenario;
window.askVERA = askVERA;
window.saveDecision = saveDecision;
window.saveJournal = saveJournal;
window.saveFollowUp = saveFollowUp;
window.saveDailySync = saveDailySync;
window.saveWeeklyEvolution = saveWeeklyEvolution;
window.loadDashboardStats = loadDashboardStats;
window.showNotification = showNotification;

console.log('✅ ASTROVERA Script Loaded Successfully');

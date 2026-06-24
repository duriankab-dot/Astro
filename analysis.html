```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASTROVERA — ผลวิเคราะห์</title>
    <style>
        :root {
            --bg: #0a0a0f;
            --bg2: #12121a;
            --tx: #e0dcd0;
            --tx2: #a09a8c;
            --gold: #c4a45a;
            --gold2: #8b7535;
            --accent: #2a2a35;
            --border: #2a2820;
            --radius: 12px;
            --font: 'Sarabun', 'Noto Sans Thai', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background: var(--bg);
            color: var(--tx);
            font-family: var(--font);
            line-height: 1.7;
            min-height: 100vh;
        }

        .container { max-width: 480px; margin: 0 auto; padding: 20px; }

        /* Top Bar */
        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            margin-bottom: 20px;
        }
        .back-btn {
            background: none;
            border: 1px solid var(--border);
            color: var(--tx2);
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-family: var(--font);
            font-size: 13px;
            transition: all 0.2s;
        }
        .back-btn:hover { border-color: var(--gold); color: var(--gold); }
        .logo-sm {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 2px;
            color: var(--gold);
        }

        /* User Info Bar */
        .user-bar {
            background: var(--bg2);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .user-info h2 {
            font-size: 16px;
            font-weight: 600;
        }
        .user-info span {
            font-size: 12px;
            color: var(--tx2);
        }
        .archetype-badge {
            background: rgba(196, 164, 90, 0.1);
            border: 1px solid var(--gold2);
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 11px;
            color: var(--gold);
            white-space: nowrap;
        }

        /* AI Selector */
        .ai-selector {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
        }
        .ai-btn {
            flex: 1;
            padding: 10px 6px;
            background: var(--bg2);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--tx2);
            font-family: var(--font);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }
        .ai-btn.active {
            border-color: var(--gold);
            color: var(--gold);
            background: rgba(196, 164, 90, 0.06);
        }
        .ai-btn .ai-icon { font-size: 18px; display: block; }
        .ai-btn .ai-name { font-weight: 600; font-size: 13px; }
        .ai-btn .ai-lens { font-size: 10px; color: var(--tx2); }

        /* Live Voice Card */
        .voice-card {
            background: var(--bg2);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px 20px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
        }
        .voice-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }
        .voice-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: var(--tx2);
            text-align: center;
            margin-bottom: 16px;
        }
        .voice-title {
            text-align: center;
            font-size: 14px;
            color: var(--tx);
            margin-bottom: 20px;
            font-weight: 500;
        }

        /* Progress Bar */
        .progress-wrap {
            margin-bottom: 20px;
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background: var(--accent);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 6px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--gold), var(--gold2));
            border-radius: 3px;
            transition: width 0.3s;
            width: 0%;
        }
        .progress-time {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: var(--tx2);
        }

        /* Playback Controls */
        .playback-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        .ctrl-btn {
            width: 44px; height: 44px;
            border-radius: 50%;
            border: 1px solid var(--border);
            background: var(--bg);
            color: var(--tx);
            font-size: 18px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .ctrl-btn:hover { border-color: var(--gold); color: var(--gold); }
        .ctrl-btn.play-btn {
            width: 56px; height: 56px;
            background: var(--gold);
            color: #1a1a1a;
            border: none;
            font-size: 22px;
        }
        .ctrl-btn.play-btn:hover { opacity: 0.9; }
        .ctrl-btn.play-btn.playing { background: var(--gold2); }
        .speed-indicator {
            font-size: 10px;
            color: var(--tx2);
            text-align: center;
            margin-bottom: 12px;
        }

        /* Voice Options */
        .voice-options {
            display: flex;
            gap: 10px;
            margin-bottom: 16px;
            justify-content: center;
        }
        .voice-opt {
            font-size: 10px;
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--tx2);
            cursor: pointer;
            font-family: var(--font);
            transition: all 0.2s;
        }
        .voice-opt:hover { border-color: var(--gold); color: var(--gold); }
        .voice-opt.selected { border-color: var(--gold); color: var(--gold); background: rgba(196,164,90,0.08); }

        /* Download */
        .download-area {
            text-align: center;
            margin-bottom: 16px;
        }
        .download-btn {
            background: none;
            border: 1px solid var(--border);
            color: var(--tx2);
            padding: 8px 16px;
            border-radius: 8px;
            font-family: var(--font);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .download-btn:hover { border-color: var(--gold); color: var(--gold); }

        /* Chat Area */
        .chat-section {
            margin-bottom: 20px;
        }
        .chat-section h3 {
            font-size: 13px;
            color: var(--tx2);
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .chat-input-wrap {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
        }
        .chat-input-wrap input {
            flex: 1;
            padding: 12px;
            background: var(--bg2);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--tx);
            font-family: var(--font);
            font-size: 14px;
            outline: none;
        }
        .chat-input-wrap input:focus { border-color: var(--gold); }
        .chat-input-wrap button {
            padding: 12px 18px;
            background: var(--gold);
            border: none;
            border-radius: 8px;
            color: #1a1a1a;
            font-family: var(--font);
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.2s;
        }
        .chat-input-wrap button:hover { opacity: 0.9; }
        .mic-btn {
            padding: 12px;
            background: var(--bg2);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--tx2);
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s;
        }
        .mic-btn:hover { border-color: var(--gold); color: var(--gold); }
        .mic-btn.listening {
            border-color: #e74c3c;
            color: #e74c3c;
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
            50% { box-shadow: 0 0 0 12px rgba(231, 76, 60, 0); }
        }

        /* Chat History */
        .chat-history {
            max-height: 300px;
            overflow-y: auto;
        }
        .chat-msg {
            margin-bottom: 12px;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.6;
        }
        .chat-msg.user {
            background: var(--accent);
            text-align: right;
            margin-left: 30px;
        }
        .chat-msg.ai {
            background: var(--bg2);
            border: 1px solid var(--border);
            margin-right: 30px;
        }
        .chat-msg .sender {
            font-size: 10px;
            color: var(--gold);
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Analysis Cards */
        .analysis-grid {
            display: grid;
            gap: 12px;
            margin-bottom: 20px;
        }
        .analysis-card {
            background: var(--bg2);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 16px;
        }
        .analysis-card h4 {
            font-size: 13px;
            color: var(--gold);
            margin-bottom: 8px;
        }
        .analysis-card p {
            font-size: 13px;
            color: var(--tx2);
            line-height: 1.6;
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 4px;
            margin-bottom: 20px;
            background: var(--bg2);
            border-radius: 8px;
            padding: 4px;
            border: 1px solid var(--border);
        }
        .tab {
            flex: 1;
            padding: 10px;
            text-align: center;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            color: var(--tx2);
            transition: all 0.2s;
            border: none;
            background: transparent;
            font-family: var(--font);
        }
        .tab.active {
            background: var(--gold);
            color: #1a1a1a;
            font-weight: 600;
        }

        /* Toast */
        .toast {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--gold);
            color: #1a1a1a;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
        }
        .toast.show { opacity: 1; }

        /* Responsive */
        @media (max-width: 360px) {
            .container { padding: 12px; }
            .ai-btn { padding: 8px 4px; font-size: 10px; }
            .ai-btn .ai-name { font-size: 11px; }
        }
    </style>
</head>
<body>

<div class="container">

    <!-- Top Bar -->
    <div class="topbar">
        <button class="back-btn" onclick="window.location.href='index.html'">← กลับ</button>
        <div class="logo-sm">ASTROVERA</div>
        <div style="width:50px;"></div>
    </div>

    <!-- User Info -->
    <div class="user-bar">
        <div class="user-info">
            <h2 id="userNameDisplay">—</h2>
            <span id="userDetailDisplay">กำลังโหลด...</span>
        </div>
        <div class="archetype-badge" id="archetypeBadge">🔮 วิเคราะห์...</div>
    </div>

    <!-- AI Selector -->
    <div class="ai-selector">
        <button class="ai-btn active" onclick="switchAI('auto')" id="tab-auto">
            <span class="ai-icon">🔮</span>
            <span class="ai-name">อัตโนมัติ</span>
        </button>
        <button class="ai-btn" onclick="switchAI('vela')" id="tab-vela">
            <span class="ai-icon">⚡</span>
            <span class="ai-name">เวล่า</span>
            <span class="ai-lens">Western · ตัวตน</span>
        </button>
        <button class="ai-btn" onclick="switchAI('wellani')" id="tab-wellani">
            <span class="ai-icon">🌟</span>
            <span class="ai-name">เว็ลลานี่</span>
            <span class="ai-lens">Vedic+Thai · แนวโน้ม</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
        <button class="tab active" onclick="switchTab('voice')" id="tab-voice">🎙️ Live Voice</button>
        <button class="tab" onclick="switchTab('analysis')" id="tab-analysis">📊 วิเคราะห์</button>
    </div>

    <!-- === VOICE TAB === -->
    <div id="voiceTab">

        <!-- Live Voice Card -->
        <div class="voice-card">
            <div class="voice-label">🎙️ Live Voice Summary</div>
            <div class="voice-title" id="voiceTitle">กำลังสร้างบทสรุปของคุณ...</div>

            <!-- Progress -->
            <div class="progress-wrap">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-time">
                    <span id="currentTime">0:00</span>
                    <span id="totalTime">0:00</span>
                </div>
            </div>

            <!-- Controls -->
            <div class="playback-controls">
                <button class="ctrl-btn" onclick="skipBack()" title="ย้อนกลับ 10s">⏪</button>
                <button class="ctrl-btn play-btn" id="playBtn" onclick="togglePlay()">▶</button>
                <button class="ctrl-btn" onclick="skipForward()" title="เดินหน้า 10s">⏩</button>
            </div>
            <div class="speed-indicator">ความเร็ว <strong id="speedDisplay">0.9x</strong></div>

            <!-- Voice Options -->
            <div class="voice-options">
                <button class="voice-opt selected" onclick="setSpeed(0.9)">0.9x</button>
                <button class="voice-opt" onclick="setSpeed(1.0)">1.0x</button>
                <button class="voice-opt" onclick="setSpeed(1.2)">1.2x</button>
                <button class="voice-opt" onclick="restartAudio()">↺ เริ่มใหม่</button>
            </div>

            <!-- Download -->
            <div class="download-area">
                <button class="download-btn" onclick="downloadReport()">📥 ดาวน์โหลดรายงาน (.txt)</button>
            </div>
        </div>

        <!-- Chat Section -->
        <div class="chat-section">
            <h3>💬 ถามต่อเนื่อง (Real-time)</h3>
            <div class="chat-input-wrap">
                <input type="text" id="chatInput" placeholder="พิมพ์คำถาม... (เช่น 'ควรรับเงินลงทุนไหม')" onkeydown="if(event.key==='Enter')sendMessage()">
                <button onclick="sendMessage()">ส่ง</button>
                <button class="mic-btn" id="micBtn" onclick="toggleMic()">🎤</button>
            </div>
            <div class="chat-history" id="chatHistory">
                <div class="chat-msg ai">
                    <div class="sender">🔮 ASTROVERA</div>
                    สวัสดี คุณสามารถถามเพิ่มเติมเกี่ยวกับผลวิเคราะห์ แนวโน้มชีวิต หรือการตัดสินใจสำคัญได้เลย
                </div>
            </div>
        </div>

    </div>

    <!-- === ANALYSIS TAB === -->
    <div id="analysisTab" style="display:none;">
        <div class="analysis-grid" id="analysisGrid">
            <!-- Filled by JS -->
        </div>
    </div>

</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
// ============================================
// STATE
// ============================================
let currentAI = 'auto';
let currentTab = 'voice';
let isPlaying = false;
let currentSpeed = 0.9;
let audioProgress = 0;
let audioDuration = 120; // seconds (simulated)
let progressInterval = null;
let isListening = false;

// Mock analysis data
let analysisData = {
    vela: {
        personality: 'คุณเป็นนักรบแห่งราศีสิงห์...',
        strength: 'สื่อสารหนักแน่น ทำงานละเอียด เป็นผู้นำโดยธรรมชาติ',
        weakness: 'แบกทุกอย่างไว้คนเดียว ไม่ค่อยขอความช่วยเหลือ',
        talent: 'ผู้นำ นักพัฒนา นักวิเคราะห์ข้อมูล นักเจรจาต่อรอง'
    },
    wellani: {
        finance_trend: 'แนวโน้มการเงินดีในปี 2028-2029 ระวังครึ่งหลังปี 2027',
        investment_advice: 'ดีลนี้มีแนวโน้มสำเร็จ แต่ระวังโครงสร้างทีมและสัญญา',
        relationship_trend: 'ควรสื่อสารให้ชัดเจน หลีกเลี่ยงการเก็บความรู้สึก',
        forecast_5y: '2026 เริ่มต้น, 2027 ปรับตัว, 2028 เติบโต, 2029 ขยาย, 2030 เก็บเกี่ยว'
    }
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    renderAnalysisCards();
    
    // Check if returning from somewhere with lens preference
    const savedLens = localStorage.getItem('astrovera_selected_lens');
    if (savedLens && savedLens !== 'auto') {
        switchAI(savedLens);
    }
});

function loadUserData() {
    const saved = localStorage.getItem('astrovera_user_data');
    if (saved) {
        const data = JSON.parse(saved);
        document.getElementById('userNameDisplay').textContent = data.name || 'ไม่ระบุ';
        
        const details = [];
        if (data.birth_date) details.push('เกิด ' + formatDate(data.birth_date));
        if (data.blood_type) details.push('กรุ๊ป ' + data.blood_type);
        document.getElementById('userDetailDisplay').textContent = details.join(' · ') || '—';
        
        // Set archetype
        document.getElementById('archetypeBadge').textContent = '🔮 The Visionary Builder';
    } else {
        // Demo data
        document.getElementById('userNameDisplay').textContent = 'ตัวอย่าง';
        document.getElementById('userDetailDisplay').textContent = 'เกิด 30 ก.ค. 1981 · กรุ๊ป O';
        document.getElementById('archetypeBadge').textContent = '🔮 The Visionary Builder';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

// ============================================
// AI SWITCHING
// ============================================
function switchAI(lens) {
    currentAI = lens;
    
    // Update buttons
    document.querySelectorAll('.ai-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${lens}`).classList.add('active');
    
    // Update voice title based on lens
    const titles = {
        auto: 'ระบบเลือกเลนส์ที่เหมาะสมให้คุณ...',
        Vellani: '⚡ เว็ลลานี่ วิเคราะห์ตัวตน · Western Astrology',
        Vera: '🌟 เวร่า วิเคราะห์แนวโน้ม · Vedic + Thai'
    };
    document.getElementById('voiceTitle').textContent = titles[lens] || titles.auto;
    
    // Reset audio
    resetAudio();
    
    // Update analysis cards
    renderAnalysisCards();
    
    showToast(`เปลี่ยนเป็น: ${lens === 'auto' ? 'ระบบอัตโนมัติ' : lens === 'vela' ? 'เวล่า (Western)' : 'เว็ลลานี่ (Vedic+Thai)'}`);
}

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    
    document.getElementById('voiceTab').style.display = tab === 'voice' ? 'block' : 'none';
    document.getElementById('analysisTab').style.display = tab === 'analysis' ? 'block' : 'none';
}

// ============================================
// AUDIO PLAYBACK (Simulated)
// ============================================
function togglePlay() {
    const btn = document.getElementById('playBtn');
    
    if (isPlaying) {
        // Pause
        isPlaying = false;
        btn.textContent = '▶';
        btn.classList.remove('playing');
        clearInterval(progressInterval);
    } else {
        // Play
        isPlaying = true;
        btn.textContent = '⏸';
        btn.classList.add('playing');
        
        progressInterval = setInterval(() => {
            if (audioProgress < audioDuration) {
                audioProgress += 0.5;
                updateProgress();
            } else {
                // Finished
                isPlaying = false;
                btn.textContent = '▶';
                btn.classList.remove('playing');
                clearInterval(progressInterval);
            }
        }, 500 / currentSpeed);
    }
}

function updateProgress() {
    const percent = (audioProgress / audioDuration) * 100;
    document.getElementById('progressFill').style.width = percent + '%';
    
    const current = Math.floor(audioProgress);
    const mins = Math.floor(current / 60);
    const secs = current % 60;
    document.getElementById('currentTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    const totalMins = Math.floor(audioDuration / 60);
    const totalSecs = Math.floor(audioDuration % 60);
    document.getElementById('totalTime').textContent = `${totalMins}:${totalSecs.toString().padStart(2, '0')}`;
}

function skipForward() {
    audioProgress = Math.min(audioProgress + 10, audioDuration);
    updateProgress();
}

function skipBack() {
    audioProgress = Math.max(audioProgress - 10, 0);
    updateProgress();
}

function setSpeed(speed) {
    currentSpeed = speed;
    document.getElementById('speedDisplay').textContent = speed + 'x';
    document.querySelectorAll('.voice-opt').forEach(o => o.classList.remove('selected'));
    // Update selected speed button
    const speedBtns = document.querySelectorAll('.voice-opt');
    speedBtns.forEach(b => {
        if (b.textContent.includes(speed + 'x')) b.classList.add('selected');
    });
    
    // Restart interval with new speed if playing
    if (isPlaying) {
        clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            if (audioProgress < audioDuration) {
                audioProgress += 0.5;
                updateProgress();
            }
        }, 500 / currentSpeed);
    }
    
    showToast(`ปรับความเร็วเป็น ${speed}x`);
}

function restartAudio() {
    audioProgress = 0;
    updateProgress();
    if (isPlaying) {
        clearInterval(progressInterval);
        isPlaying = false;
        document.getElementById('playBtn').textContent = '▶';
        document.getElementById('playBtn').classList.remove('playing');
    }
    showToast('เริ่มใหม่');
}

function resetAudio() {
    clearInterval(progressInterval);
    isPlaying = false;
    audioProgress = 0;
    document.getElementById('playBtn').textContent = '▶';
    document.getElementById('playBtn').classList.remove('playing');
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('currentTime').textContent = '0:00';
}

function downloadReport() {
    // Generate report content
    let report = '=== ASTROVERA — รายงานวิเคราะห์ชีวิต ===\n\n';
    
    const saved = localStorage.getItem('astrovera_user_data');
    if (saved) {
        const data = JSON.parse(saved);
        report += `ชื่อ: ${data.name || 'ไม่ระบุ'}\n`;
        report += `วันเกิด: ${formatDate(data.birth_date)}\n`;
        report += `เวลาเกิด: ${data.birth_time || 'ไม่ระบุ'}\n`;
        report += `สถานที่เกิด: ${data.birth_place || 'ไม่ระบุ'}\n`;
        report += `กรุ๊ปเลือด: ${data.blood_type || 'ไม่ระบุ'}\n\n`;
    }
    
    report += '--- เลนส์ที่ใช้: ' + (currentAI === 'auto' ? 'อัตโนมัติ' : currentAI === 'vela' ? 'เวล่า (Western)' : 'เว็ลลานี่ (Vedic+Thai)') + ' ---\n\n';
    report += '[เวล่า — ตัวตน]\n';
    report += 'บุคลิกภาพ: ' + analysisData.vela.personality + '\n';
    report += 'จุดแข็ง: ' + analysisData.vela.strength + '\n';
    report += 'จุดอ่อน: ' + analysisData.vela.weakness + '\n';
    report += 'พรสวรรค์: ' + analysisData.vela.talent + '\n\n';
    report += '[เว็ลลานี่ — แนวโน้ม]\n';
    report += 'แนวโน้มการเงิน: ' + analysisData.wellani.finance_trend + '\n';
    report += 'คำแนะนำการลงทุน: ' + analysisData.wellani.investment_advice + '\n';
    report += 'แนวโน้มความสัมพันธ์: ' + analysisData.wellani.relationship_trend + '\n';
    report += 'พยากรณ์ 5 ปี: ' + analysisData.wellani.forecast_5y + '\n';
    
    // Download
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrovera-report-' + new Date().toISOString().split('T')[0] + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📥 ดาวน์โหลดรายงานเรียบร้อย');
}

// ============================================
// CHAT
// ============================================
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addChatMessage('user', 'คุณ', message);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const lensName = currentAI === 'auto' ? 'ASTROVERA' : currentAI === 'vela' ? 'เวล่า' : 'เว็ลลานี่';
        let response = generateAIResponse(message, currentAI);
        addChatMessage('ai', lensName, response);
    }, 800 + Math.random() * 1500);
}

function generateAIResponse(question, lens) {
    const responses = {
        vela: [
            'จากมุมมองตัวตนของคุณ (Western Astrology) — คุณมีพลังงานของชาวราศีสิงห์ผสมกับความเป็นนักวางแผนจากตำแหน่งดาวพุธ ซึ่งหมายความว่าคุณจะทำได้ดีเมื่อมีอิสระในการตัดสินใจ',
            'การวิเคราะห์บุคลิกภาพเชิงลึกชี้ว่า จุดแข็งหลักของคุณคือการมองภาพใหญ่และความสามารถในการสร้างแรงบันดาลใจให้ผู้อื่น',
        ],
        wellani: [
            'จากมุมมอง Vedic + Thai — จังหวะชีวิตคุณกำลังเข้าสู่ช่วงที่ดีในช่วงไตรมาสแรกของปี 2027 ดาวพฤหัสจะเคลื่อนผ่านเรือนการเงินของคุณ',
            'ตามหลักโหราศาสตร์ไทย ดาวเสาร์กำลังทดสอบความอดทนของคุณในปีนี้ แต่ผลลัพธ์จะออกมาดีหากคุณไม่รีบร้อนเกินไป',
        ]
    };
    
    // Default to auto (mix)
    const pool = currentAI === 'vela' ? responses.vela : 
                 currentAI === 'wellani' ? responses.wellani :
                 [...responses.vela, ...responses.wellani];
    
    return pool[Math.floor(Math.random() * pool.length)];
}

function addChatMessage(type, sender, text) {
    const history = document.getElementById('chatHistory');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.innerHTML = `<div class="sender">${sender === 'คุณ' ? '👤 คุณ' : '🔮 ' + sender}</div>${text}`;
    history.appendChild(msg);
    history.scrollTop = history.scrollHeight;
}

function toggleMic() {
    const micBtn = document.getElementById('micBtn');
    isListening = !isListening;
    
    if (isListening) {
        micBtn.classList.add('listening');
        showToast('🎤 กำลังฟัง... (พูดได้เลย)');
        
        // Simulate voice recognition after 2 seconds
        setTimeout(() => {
            if (isListening) {
                document.getElementById('chatInput').value = 'แนวโน้มการเงินปีนี้เป็นยังไง';
                micBtn.classList.remove('listening');
                isListening = false;
                showToast('✅ รับข้อความแล้ว');
            }
        }, 2000);
    } else {
        micBtn.classList.remove('listening');
        showToast('หยุดฟัง');
    }
}

// ============================================
// ANALYSIS CARDS
// ============================================
function renderAnalysisCards() {
    const grid = document.getElementById('analysisGrid');
    let html = '';
    
    if (currentAI === 'auto' || currentAI === 'vela') {
        html += `
            <div class="analysis-card">
                <h4>⚡ บุคลิกภาพ (เวล่า · Western)</h4>
                <p>${analysisData.vela.personality}</p>
            </div>
            <div class="analysis-card">
                <h4>💪 จุดแข็ง</h4>
                <p>${analysisData.vela.strength}</p>
            </div>
            <div class="analysis-card">
                <h4>⚠️ จุดที่ควรระวัง</h4>
                <p>${analysisData.vela.weakness}</p>
            </div>
            <div class="analysis-card">
                <h4>🎯 พรสวรรค์</h4>
                <p>${analysisData.vela.talent}</p>
            </div>
        `;
    }
    
    if (currentAI === 'auto' || currentAI === 'wellani') {
        html += `
            <div class="analysis-card">
                <h4>🌟 แนวโน้มการเงิน (เว็ลลานี่ · Vedic+Thai)</h4>
                <p>${analysisData.wellani.finance_trend}</p>
            </div>
            <div class="analysis-card">
                <h4>💰 คำแนะนำการลงทุน</h4>
                <p>${analysisData.wellani.investment_advice}</p>
            </div>
            <div class="analysis-card">
                <h4>💞 แนวโน้มความสัมพันธ์</h4>
                <p>${analysisData.wellani.relationship_trend}</p>
            </div>
            <div class="analysis-card">
                <h4>📅 พยากรณ์ 5 ปี</h4>
                <p>${analysisData.wellani.forecast_5y}</p>
            </div>
        `;
    }
    
    grid.innerHTML = html;
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============================================
// INIT PROGRESS DISPLAY
// ============================================
updateProgress();
</script>

</body>
</html

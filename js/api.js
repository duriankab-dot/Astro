// ===== AI CONFIG =====
const AI_CONFIG = {
    vela: {
        id: 'vela',
        name: 'เวล่า (VELA)',
        icon: '🧠',
        desc: 'ผู้รู้ หนักแน่น วิเคราะห์ชีวิต',
        voice: 'Female',
        color: '#B040FF'
    },
    wellany: {
        id: 'wellany',
        name: 'เว็ลลานี่ (WELLANY)',
        icon: '💚',
        desc: 'นุ่มนวล ดูแลสุขภาพใจ',
        voice: 'Male',
        color: '#34D399'
    }
};

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
    // ---- LENS SELECTOR ----
    const lensBtns = document.querySelectorAll('.lens-btn');
    const resultBox = document.getElementById('analysis-result');

    if (lensBtns.length) {
        lensBtns.forEach(btn => {
            btn.addEventListener('click', async function() {
                lensBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const lens = this.dataset.lens;
                resultBox.innerHTML = '⏳ กำลังโหลดผลวิเคราะห์...';

                try {
                    const ai = localStorage.getItem('av_ai') || 'vela';
                    const data = await window.analyzeWithDeepseek(lens, ai);
                    resultBox.innerHTML = data;
                } catch (err) {
                    resultBox.innerHTML = '❌ เกิดข้อผิดพลาด: ' + err.message;
                }
            });
        });
    }

    // ---- AI SELECTOR ----
    const aiBtns = document.querySelectorAll('.ai-btn');
    if (aiBtns.length) {
        aiBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const ai = this.dataset.ai;
                localStorage.setItem('av_ai', ai);
                
                aiBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // เลือกเสียง
                if (window.selectVoiceForAI) {
                    window.selectVoiceForAI(ai);
                }
                
                toast('เลือก ' + AI_CONFIG[ai].name + ' แล้ว');
                
                // วิเคราะห์ใหม่อัตโนมัติ
                const activeLens = document.querySelector('.lens-btn.active');
                if (activeLens) {
                    activeLens.click();
                }
            });
        });
    }

    // ---- VOICE CONTROLS ----
    const playBtn = document.getElementById('playVoiceBtn');
    const stopBtn = document.getElementById('stopVoiceBtn');

    if (playBtn && window.speakText) {
        playBtn.addEventListener('click', function() {
            const resultBox = document.getElementById('analysis-result');
            const text = resultBox ? resultBox.innerText : '';
            if (text && !text.includes('⏳') && !text.includes('👋')) {
                const ai = localStorage.getItem('av_ai') || 'vela';
                const voice = window.selectVoiceForAI ? 
                    window.selectVoiceForAI(ai) : null;
                window.speakText(text, voice, 0.9);
            } else {
                toast('ยังไม่มีข้อความให้อ่าน กรุณาวิเคราะห์ก่อน');
            }
        });
    }

    if (stopBtn && window.stopSpeaking) {
        stopBtn.addEventListener('click', function() {
            window.stopSpeaking();
        });
    }

    // ---- FOLLOW-UP QUESTION ----
    const askBtn = document.querySelector('.ask-more button');
    const questionInput = document.getElementById('followUpQuestion');

    if (askBtn && questionInput) {
        askBtn.addEventListener('click', async function() {
            const q = questionInput.value.trim();
            if (!q) {
                toast('กรุณาพิมพ์คำถาม');
                return;
            }
            
            const activeLens = document.querySelector('.lens-btn.active');
            const lens = activeLens ? activeLens.dataset.lens : 'general';
            const ai = localStorage.getItem('av_ai') || 'vela';
            const resultBox = document.getElementById('analysis-result');

            resultBox.innerHTML = '⏳ กำลังคิดคำตอบ...';
            try {
                const answer = await window.askFollowUp(q, lens, ai);
                resultBox.innerHTML = answer;
                questionInput.value = '';
            } catch (err) {
                resultBox.innerHTML = '❌ ' + err.message;
            }
        });
    }

    // ---- SAVE TO SUPABASE ----
    const saveBtn = document.querySelector('.tb-act');
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            const resultBox = document.getElementById('analysis-result');
            const text = resultBox ? resultBox.innerText : '';
            if (!text || text.includes('⏳') || text.includes('👋')) {
                toast('ยังไม่มีข้อมูลให้บันทึก');
                return;
            }
            
            const activeLens = document.querySelector('.lens-btn.active');
            const lens = activeLens ? activeLens.dataset.lens : 'general';
            const ai = localStorage.getItem('av_ai') || 'vela';
            
            try {
                await window.saveToSupabase(text, lens, ai);
                toast('✅ บันทึกสำเร็จ!');
            } catch (err) {
                toast('❌ บันทึกไม่สำเร็จ: ' + err.message);
            }
        });
    }

    // ---- AUTO-LOAD DEFAULT LENS ----
    const defaultLens = document.querySelector('.lens-btn.active') || document.querySelector('.lens-btn');
    if (defaultLens) {
        defaultLens.click();
    }
});

// ===== TOAST HELPER =====
function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() {
        el.classList.remove('on');
    }, 2500);
}

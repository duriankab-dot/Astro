// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {

    // ---- LENS SELECTOR ----
    const lensBtns = document.querySelectorAll('.lens-btn');
    const resultBox = document.getElementById('result');

    if (lensBtns.length) {
        lensBtns.forEach(btn => {
            btn.addEventListener('click', async function () {
                // update active state
                lensBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const lens = this.dataset.lens;
                resultBox.innerHTML = '⏳ กำลังโหลดผลวิเคราะห์...';

                try {
                    const data = await window.analyzeWithDeepseek(lens);
                    resultBox.innerHTML = data;
                } catch (err) {
                    resultBox.innerHTML = '❌ เกิดข้อผิดพลาด: ' + err.message;
                }
            });
        });
    }

    // ---- VOICE CONTROLS ----
    const playBtn = document.getElementById('playVoiceBtn');
    const stopBtn = document.getElementById('stopVoiceBtn');
    const rateControl = document.getElementById('rateControl');

    if (playBtn && window.speakText) {
        playBtn.addEventListener('click', () => {
            const text = resultBox ? resultBox.innerText : '';
            if (text && text !== '⏳ กำลังโหลดผลวิเคราะห์...') {
                const rate = parseFloat(rateControl?.value || 0.9);
                window.speakText(text, rate);
            } else {
                alert('ยังไม่มีข้อความให้อ่าน กรุณาวิเคราะห์ก่อน');
            }
        });
    }

    if (stopBtn && window.stopSpeaking) {
        stopBtn.addEventListener('click', () => {
            window.stopSpeaking();
        });
    }

    // ---- FOLLOW-UP QUESTION ----
    const askBtn = document.getElementById('askBtn');
    const questionInput = document.getElementById('followUpQuestion');

    if (askBtn && questionInput) {
        askBtn.addEventListener('click', async () => {
            const q = questionInput.value.trim();
            if (!q) return alert('กรุณาพิมพ์คำถาม');
            const activeLens = document.querySelector('.lens-btn.active');
            const lens = activeLens ? activeLens.dataset.lens : 'vela';

            resultBox.innerHTML = '⏳ กำลังคิดคำตอบ...';
            try {
                const answer = await window.askFollowUp(q, lens);
                resultBox.innerHTML = answer;
                questionInput.value = '';
            } catch (err) {
                resultBox.innerHTML = '❌ ' + err.message;
            }
        });
    }

    // ---- SAVE TO SUPABASE ----
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const text = resultBox ? resultBox.innerText : '';
            if (!text || text === '⏳ กำลังโหลดผลวิเคราะห์...') {
                return alert('ยังไม่มีข้อมูลให้บันทึก');
            }
            try {
                await window.saveToSupabase(text);
                alert('✅ บันทึกสำเร็จ!');
            } catch (err) {
                alert('❌ บันทึกไม่สำเร็จ: ' + err.message);
            }
        });
    }

    // ---- AUTO-LOAD DEFAULT LENS ----
    const defaultLens = document.querySelector('.lens-btn.active') || document.querySelector('.lens-btn');
    if (defaultLens) {
        defaultLens.click();
    }
});
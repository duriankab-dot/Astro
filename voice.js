// ===== SPEECH SYNTHESIS =====
let currentUtterance = null;

window.speakText = function (text, rate = 0.9) {
    if (!window.speechSynthesis) {
        alert('เบราว์เซอร์ของคุณไม่รองรับการอ่านออกเสียง');
        return;
    }

    // หยุดเสียงที่กำลังเล่น
    window.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // เลือกเสียงผู้หญิง (ถ้ามี)
    const voices = window.speechSynthesis.getVoices();
    const thaiVoice = voices.find(v => v.lang.startsWith('th') && v.name.includes('Female'));
    if (thaiVoice) utterance.voice = thaiVoice;

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
};

window.stopSpeaking = function () {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
};

// โหลดเสียงล่วงหน้า (สำหรับเบราว์เซอร์บางตัว)
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
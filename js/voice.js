// ===== SPEECH SYNTHESIS =====
let currentUtterance = null;
let currentVoice = null;

// เลือกเสียงตาม AI
window.selectVoiceForAI = function(ai) {
    if (!window.speechSynthesis) return;
    
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
        // ถ้ายังโหลดไม่เสร็จ รอ
        window.speechSynthesis.onvoiceschanged = function() {
            selectVoiceForAI(ai);
        };
        return;
    }
    
    // VELA = เสียงผู้หญิง (หนักแน่น), WELLANY = เสียงผู้ชาย (นุ่มนวล)
    const voiceName = ai === 'vela' ? 'Female' : 'Male';
    const lang = 'th-TH';
    
    let selected = voices.find(v => 
        v.lang.startsWith(lang) && v.name.includes(voiceName)
    );
    
    // ถ้าไม่เจอ ให้ใช้เสียงภาษาไทยอันแรก
    if (!selected) {
        selected = voices.find(v => v.lang.startsWith('th'));
    }
    
    // ถ้ายังไม่เจอ ใช้เสียง default
    if (!selected) {
        selected = voices[0];
    }
    
    currentVoice = selected;
    localStorage.setItem('av_voice_uri', selected ? selected.voiceURI : '');
    
    return selected;
};

// พูดข้อความ
window.speakText = function(text, voice = null, rate = 0.9) {
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

    // ใช้เสียงที่เลือก
    if (voice) {
        utterance.voice = voice;
    } else if (currentVoice) {
        utterance.voice = currentVoice;
    } else {
        // เลือกอัตโนมัติ
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find(v => v.lang.startsWith('th'));
        if (thaiVoice) utterance.voice = thaiVoice;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    
    return utterance;
};

window.stopSpeaking = function() {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    currentUtterance = null;
};

// โหลดเสียงล่วงหน้า
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
        // เลือกเสียงตาม AI ที่บันทึกไว้
        const savedAI = localStorage.getItem('av_ai') || 'vela';
        selectVoiceForAI(savedAI);
    };
}

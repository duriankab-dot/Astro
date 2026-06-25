// ===== CONFIG =====
const API_BASE = '/.netlify/functions';

// ===== ANALYZE WITH DEEPSEEK =====
window.analyzeWithDeepseek = async function (lens = 'vela') {
    const payload = {
        user_id: 'demo-user',
        name: 'ธีรชัย พรั่งยืน',
        gender: 'ชาย',
        birth_date: '1981-07-30',
        birth_time: '10:24',
        birth_place: 'กรุงเทพฯ, ไทย',
        blood_type: 'O',
        events: {
            start_work_year: 2009,
            job_change_year: 2011,
            business_peak_year: 2022,
            best_finance_year: 2022,
            worst_finance_year: 2024,
            lost_family_year: 2024,
            major_issues: 'ย้ายประเทศไปมา 2 ปี'
        },
        question: 'เน้นอาชีพ การเงิน ความรัก แนวโน้ม 5 ปี',
        lens: lens
    };

    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    return result.data || 'ไม่ได้รับข้อมูลจาก Deepseek';
};

// ===== ASK FOLLOW-UP =====
window.askFollowUp = async function (question, lens = 'vela') {
    const payload = {
        user_id: 'demo-user',
        question: question,
        lens: lens,
        context: 'follow-up'
    };

    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('ไม่สามารถส่งคำถามได้');
    }

    const result = await response.json();
    return result.data || 'ไม่ได้รับคำตอบ';
};

// ===== SAVE TO SUPABASE =====
window.saveToSupabase = async function (content) {
    const payload = {
        user_id: 'demo-user',
        content: content,
        lens: document.querySelector('.lens-btn.active')?.dataset.lens || 'unknown',
        created_at: new Date().toISOString()
    };

    const response = await fetch(`${API_BASE}/save-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
    }

    return await response.json();
};
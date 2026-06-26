// netlify/functions/analyze.js
// วิเคราะห์ชีวิตด้วย DeepSeek API
// env vars ที่ต้องตั้งใน Netlify UI:
//   DEEPSEEK_API_KEY  — จาก platform.deepseek.com
//   ANTHROPIC_API_KEY — จาก console.anthropic.com (fallback)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ── System prompt ตาม lens ──
function buildSystemPrompt(lens, userData) {
  const lensMap = {
    general: 'วิเคราะห์ภาพรวมตัวตน จุดแข็ง แนวโน้มชีวิต และคำแนะนำเชิงปฏิบัติ',
    career:  'เน้นวิเคราะห์ด้านอาชีพ ความสามารถ ทิศทางการทำงาน และโอกาส',
    love:    'เน้นวิเคราะห์ด้านความสัมพันธ์ รูปแบบความรัก และการสื่อสารระหว่างบุคคล',
    finance: 'เน้นวิเคราะห์ด้านการเงิน นิสัยการใช้เงิน และแนวโน้มความมั่งคั่ง',
    health:  'เน้นวิเคราะห์ด้านสุขภาพ พลังงาน วงจรชีวิต และการดูแลตัวเอง'
  };

  return `คุณคือนักวิเคราะห์ชีวิตผู้เชี่ยวชาญของ ASTROVERA — Life Intelligence Platform

โฟกัส: ${lensMap[lens] || lensMap.general}

กฎการตอบ:
- ตอบเป็นภาษาไทย กระชับ อ่านง่าย
- ใช้คำว่า "มีแนวโน้ม" "มักจะ" "ควรพิจารณา" — ห้ามใช้ "จะ" "ต้อง" "แน่นอน" เชิงทำนาย
- ห้ามใช้คำว่า "ดูดวง" "ทำนาย" "โชคชะตา"
- แบ่งเป็นหัวข้อชัดเจน ใช้ emoji นำแต่ละหัวข้อ
- ท้ายสุดให้ 2-3 คำถามสะท้อนตัวเองที่ practical

ข้อมูลผู้ใช้จะถูกส่งมาพร้อมคำถาม`;
}

// ── เรียก DeepSeek ──
async function callDeepSeek(systemPrompt, userContent) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY ยังไม่ได้ตั้งค่า');

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent  }
      ],
      stream: false,
      max_tokens: 2048,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'ไม่ได้รับข้อมูลจาก AI';
}

// ── สร้าง user content จาก payload ──
function buildUserContent(userData) {
  const {
    name, gender, birth_date, birth_time, birth_place, blood_type,
    events, question, lens
  } = userData;

  let content = `ข้อมูลผู้ใช้:\n`;
  if (name)        content += `- ชื่อ: ${name}\n`;
  if (gender)      content += `- เพศ: ${gender}\n`;
  if (birth_date)  content += `- วันเกิด: ${birth_date}\n`;
  if (birth_time)  content += `- เวลาเกิด: ${birth_time}\n`;
  if (birth_place) content += `- สถานที่เกิด: ${birth_place}\n`;
  if (blood_type)  content += `- กรุ๊ปเลือด: ${blood_type}\n`;

  if (events && Object.keys(events).length > 0) {
    content += `\nเหตุการณ์สำคัญในชีวิต:\n`;
    const labels = {
      start_work_year:     'ปีเริ่มทำงาน',
      job_change_year:     'ปีเปลี่ยนงาน',
      start_business_year: 'ปีเริ่มธุรกิจ',
      business_peak_year:  'ปีธุรกิจรุ่งเรือง',
      best_finance_year:   'ปีการเงินดีที่สุด',
      worst_finance_year:  'ปีการเงินแย่ที่สุด',
      marriage_year:       'ปีแต่งงาน',
      lost_family_year:    'ปีสูญเสียคนใกล้ชิด',
      major_issues:        'เหตุการณ์สำคัญอื่นๆ'
    };
    for (const [k, v] of Object.entries(events)) {
      if (v) content += `- ${labels[k] || k}: ${v}\n`;
    }
  }

  if (question) content += `\nคำถามที่ต้องการคำตอบ: ${question}\n`;
  content += `\nโฟกัสการวิเคราะห์: ${lens || 'general'}`;

  return content;
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };
  }

  let userData;
  try {
    userData = JSON.parse(event.body || '{}');
  } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  try {
    const lens = userData.lens || 'general';
    const systemPrompt = buildSystemPrompt(lens, userData);
    const userContent  = buildUserContent(userData);
    const result       = await callDeepSeek(systemPrompt, userContent);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ data: result })
    };
  } catch(error) {
    console.error('❌ analyze error:', error.message);
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ error: error.message })
    };
  }
};

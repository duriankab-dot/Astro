// netlify/functions/life-coach.js
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }) };

  let payload;
  try { payload = JSON.parse(event.body || '{}'); } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, archetype, archetypeDesc, phase, phaseDesc, bloodType, lifePathNum, lifePathMeaning, baziDayMaster, baziDesc, sunSign, strengths = [], blindspot = [] } = payload;

  const prompt = `คุณคือ ASTROVERA Life Coach AI ผู้เชี่ยวชาญด้านปัญญาชีวิต

ข้อมูลผู้ใช้:
- ชื่อ: ${name || 'คุณ'}
- ตัวตน (Archetype): ${archetype || '-'} — ${archetypeDesc || '-'}
- ช่วงชีวิต: ${phase || '-'} — ${phaseDesc || '-'}
- กรุ๊ปเลือด: ${bloodType || 'ไม่ระบุ'}
- เลขชีวิต: ${lifePathNum || '-'} — ${lifePathMeaning || '-'}
- BaZi Day Master: ${baziDayMaster || '-'} — ${baziDesc || '-'}
- ราศีดวงอาทิตย์: ${sunSign || '-'}
- จุดแข็ง: ${strengths.join(', ') || '-'}
- จุดระวัง: ${blindspot.join(', ') || '-'}

สร้างรายงานไลฟ์โค้ชส่วนตัวเป็นภาษาไทย ความยาว 400-600 คำ แบ่งเป็น 4 ส่วน:

1. **ภาพรวมตัวตนของคุณตอนนี้** — สังเคราะห์จากข้อมูลทั้งหมดว่าช่วงนี้คุณเป็นใคร
2. **สิ่งที่ระบบเห็นว่าคุณกำลังเผชิญ** — pattern และความท้าทายที่ซ่อนอยู่
3. **3 สิ่งที่ควรทำใน 30 วันนี้** — เฉพาะเจาะจง ลงมือได้จริง
4. **คำถามสำคัญสำหรับคุณ** — 1 คำถามที่ถ้าตอบได้จะเปลี่ยนชีวิต

เขียนเป็นกันเอง อบอุ่น ตรงไปตรงมา ไม่ใช้ศัพท์เทคนิคมากเกินไป`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Anthropic API error');
    const script = data.content?.[0]?.text || '';
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ script }) };
  } catch(e) {
    console.error('life-coach error:', e.message);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: e.message }) };
  }
};

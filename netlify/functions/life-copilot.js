// ═══════════════════════════════════════════════════════════
// ASTROVERA — Netlify Function: life-copilot
// VERA AI Chat Assistant — ตอบคำถามชีวิตส่วนตัว
// ใช้โดย: VERA chat screen / AI Advisor
// ENV: ANTHROPIC_API_KEY
// ═══════════════════════════════════════════════════════════

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    message = '',
    history = [],
    profile = {},
  } = payload;

  if (!message.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message is required' }) };
  }

  // ─── Build profile context ───
  const p = profile;
  const profileContext = [
    p.name ? `ชื่อ: ${p.name}` : '',
    p.archetype ? `ลักษณะตัวตน: ${p.archetype}` : '',
    p.archetypeDesc ? `→ ${p.archetypeDesc}` : '',
    p.phase ? `ช่วงชีวิตปัจจุบัน: ${p.phase}` : '',
    p.phaseDesc ? `→ ${p.phaseDesc}` : '',
    p.lifePathNum ? `เลขชีวิต: ${p.lifePathNum} (${p.lifePathMeaning || ''})` : '',
    p.baziDayMaster ? `Day Master ปาจื้อ: ${p.baziDayMaster} — ${p.baziDesc || ''}` : '',
    p.sunSign ? `ราศีดวงอาทิตย์: ${p.sunSign}` : '',
    p.moonSign ? `ราศีดวงจันทร์: ${p.moonSign}` : '',
    p.strengths?.length ? `จุดแข็ง: ${p.strengths.map(s => s.t).join(', ')}` : '',
    p.blindspot?.length ? `จุดระวัง: ${p.blindspot.map(b => b.t).join(', ')}` : '',
    p.missingEl?.length ? `ธาตุที่ขาด: ${p.missingEl.join(', ')}` : '',
    p.journals?.length ? `บันทึกล่าสุด: ${p.journals.map(j => j.title || j.type).join(', ')}` : '',
    p.emotions?.length ? `อารมณ์ล่าสุด: ${p.emotions.map(e => e.label).join(', ')}` : '',
    p.opportunities?.length
      ? `โอกาสที่กำลังติดตาม: ${p.opportunities.map(o => o.name).join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const systemPrompt = `คุณคือ VERA — AI ผู้ช่วยชีวิตส่วนตัวของ ASTROVERA

บุคลิก:
- ฉลาด อบอุ่น ตรงไปตรงมา เหมือนเพื่อนสนิทที่ฉลาดมาก
- ใช้ภาษาไทยปกติ ไม่เป็นทางการมากเกินไป ไม่ใช้ภาษาดูดวง
- ตอบตรงประเด็น ไม่อ้อมค้อม ไม่พูดซ้ำ
- ไม่ทำนายอนาคตแบบตายตัว — ใช้มุมมองช่วยคิด ไม่ใช่คำสั่ง
- ถามกลับ 1 คำถามเมื่อต้องการข้อมูลเพิ่ม อย่าถามหลายคำถามพร้อมกัน

ข้อมูลผู้ใช้ที่รู้:
${profileContext || 'ยังไม่มีข้อมูลโปรไฟล์ — ถามชื่อและสิ่งที่อยากรู้ก่อน'}

ความยาวคำตอบ: 2-4 ประโยค สั้นและตรงจุด ยกเว้นถ้าถามเรื่องซับซ้อนให้ขยายได้ถึง 6 ประโยค`;

  // ─── Build message history ───
  const messages = [
    ...history
      .filter(h => h.role && h.content)
      .slice(-10) // เก็บแค่ 10 ข้อความล่าสุดเพื่อประหยัด tokens
      .map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Anthropic API error: ' + err }) };
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'ขอโทษ ไม่สามารถตอบได้ตอนนี้';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

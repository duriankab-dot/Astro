// ═══════════════════════════════════════════════════════════
// ASTROVERA — Netlify Function: advisor-deep
// AI ที่ปรึกษาชีวิต (Premium) — DeepSeek API
// ใช้โดย: sc-advisor screen
// ENV: DEEPSEEK_API_KEY
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

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    question = '',
    profile = {},
    form = {},
  } = payload;

  if (!question.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Question is required' }) };
  }

  // ─── Build profile context ───
  const p = profile;
  const profileContext = [
    p.name ? `ชื่อ: ${p.name}` : '',
    p.archetype ? `ลักษณะตัวตน: ${p.archetype} — ${p.archetypeDesc || ''}` : '',
    p.phase ? `ช่วงชีวิต: ${p.phase} — ${p.phaseDesc || ''}` : '',
    p.lifePathNum ? `เลขชีวิต: ${p.lifePathNum}` : '',
    p.strengths?.length ? `จุดแข็ง: ${p.strengths.map(s => s.t || s).join(', ')}` : '',
    p.blindspot?.length ? `จุดระวัง: ${p.blindspot.map(b => b.t || b).join(', ')}` : '',
    p.journals?.length ? `การตัดสินใจล่าสุด: ${p.journals.map(j => j.title).filter(Boolean).join(', ')}` : '',
    p.opportunities?.length ? `โอกาสที่ติดตาม: ${p.opportunities.map(o => o.name).join(', ')}` : '',
  ].filter(Boolean).join('\n');

  // ─── Build form context ───
  const formContext = [
    form.category ? `ประเภทเรื่อง: ${form.category}` : '',
    form.background ? `บริบท/ข้อมูลพื้นหลัง: ${form.background}` : '',
    form.goal ? `เป้าหมายที่ต้องการ: ${form.goal}` : '',
    form.constraints ? `ข้อจำกัด/ความกังวล: ${form.constraints}` : '',
    form.resources ? `ทรัพยากรที่มี: ${form.resources}` : '',
    form.timeline ? `กรอบเวลา: ${form.timeline}` : '',
    form.tried ? `สิ่งที่ลองทำแล้ว: ${form.tried}` : '',
  ].filter(Boolean).join('\n');

  const systemPrompt = `คุณคือ AI ที่ปรึกษาชีวิตระดับสูงของ ASTROVERA

บทบาท:
- วิเคราะห์เชิงลึกเหมือนที่ปรึกษาธุรกิจมืออาชีพ + นักจิตวิทยา
- ใช้ข้อมูลโปรไฟล์และบริบทที่ให้มาในการวิเคราะห์
- ตอบเป็นภาษาไทย ชัดเจน มีโครงสร้าง
- ไม่ทำนายแบบตายตัว แต่ให้มุมมองที่นำไปใช้ได้จริง

ข้อมูลโปรไฟล์ผู้ใช้:
${profileContext || 'ไม่มีข้อมูลโปรไฟล์'}

ข้อมูลเพิ่มเติมจากแบบฟอร์ม:
${formContext || 'ไม่มีข้อมูลเพิ่มเติม'}

รูปแบบการตอบ (JSON):
{
  "summary": "สรุปสถานการณ์ 1-2 ประโยค",
  "support": ["สิ่งที่สนับสนุน 1", "สิ่งที่สนับสนุน 2", "สิ่งที่สนับสนุน 3"],
  "caution": ["ข้อควรระวัง 1", "ข้อควรระวัง 2"],
  "missing": ["ข้อมูลที่ยังขาด 1", "ข้อมูลที่ยังขาด 2"],
  "recommendation": "คำแนะนำหลัก 2-3 ประโยค",
  "nextStep": "ขั้นตอนแรกที่ทำได้ทันที",
  "confidence": 75
}

ตอบเป็น JSON เท่านั้น ไม่มี markdown หรือข้อความอื่น`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'DeepSeek API error: ' + err }) };
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';

    let result;
    try {
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      result = {
        summary: raw,
        support: [], caution: [], missing: [],
        recommendation: raw, nextStep: '', confidence: 50,
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

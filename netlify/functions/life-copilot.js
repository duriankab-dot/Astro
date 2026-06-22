// netlify/functions/life-copilot.js
// Life Copilot — AI จริงด้วย Claude Haiku
// รับ: ข้อความผู้ใช้ + ประวัติการสนทนา + ข้อมูลชีวิตจริงทั้งหมด
// ส่งคืน: คำตอบ AI ที่ personalized + soft upsell เมื่อจำเป็น
// ใช้ ANTHROPIC_API_KEY เดียวกับ life-coach.js

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({
      error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY ใน Netlify'
    })};
  }

  const {
    message,      // ข้อความล่าสุดจากผู้ใช้
    history,      // [{role:"user"|"assistant", content:"..."}] ประวัติการสนทนา
    profile,      // ข้อมูล profile ทั้งหมด
    isPremium     // boolean
  } = body;

  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ต้องระบุ message' }) };
  }

  // ─── สร้าง System Prompt ที่รู้จักผู้ใช้จริง ───
  const p = profile || {};
  const journals = p.journals || [];
  const emotions = p.emotions || [];
  const weekly = p.weekly || [];
  const opps = p.opportunities || [];
  const hasJournals = journals.length > 0;
  const hasEmotions = emotions.length > 0;
  const hasOpps = opps.length > 0;

  // สรุปข้อมูล Journal เป็น context
  const journalSummary = journals.length > 0
    ? journals.slice(0,5).map(j =>
        `• [${j.type||'ทั่วไป'}] ${j.title||''} (${j.date||''}) — มั่นใจ ${j.confidence||0}/5`
      ).join('\n')
    : 'ยังไม่มี Journal';

  // recent emotions
  const emotionSummary = emotions.slice(0,3).map(e => e.emoji+' '+e.label).join(', ') || 'ยังไม่มี check-in';

  // top opportunity
  const topOpp = opps.length > 0 ? opps[0].name : null;

  // premium features ที่ผู้ใช้ยังไม่มีสิทธิ์ (free tier)
  const lockedFeatures = !isPremium
    ? ['PDF Report', 'Memory Engine', 'AI Strategic Advisor เต็มรูปแบบ', 'Pattern Mining เชิงลึก']
    : [];

  const systemPrompt = `คุณคือ Life Copilot ของ ASTROVERA — AI ผู้ช่วยส่วนตัวที่รู้จักข้อมูลชีวิตของผู้ใช้จริงๆ

== ข้อมูลผู้ใช้ ==
ชื่อ: ${p.name || 'ผู้ใช้'}
Archetype: ${p.archetype || ''} — ${p.archetypeDesc || ''}
ช่วงชีวิตตอนนี้: ${p.phase || ''} — ${p.phaseDesc || ''}
Day Master (ปาจื้อ): ธาตุ${p.baziDayMaster || ''} — ${p.baziDesc || ''}
เลขชีวิต: ${p.lifePathNum || ''} — ${p.lifePathMeaning || ''}
ดาวอาทิตย์: ${p.sunSign || ''}, ดาวจันทร์: ${p.moonSign || ''}
จุดแข็ง: ${(p.strengths||[]).join(', ')}
สิ่งที่ควรระวัง: ${(p.blindspot||[]).join(', ')}
ธาตุที่ขาด: ${(p.missingEl||[]).join(', ') || 'ไม่มี'}

== ข้อมูลที่บันทึกไว้ ==
Journal (${journals.length} รายการ):
${journalSummary}
Emotion Check-in ล่าสุด: ${emotionSummary}
Weekly Reflection: ${weekly.length} ครั้ง
Opportunity Radar: ${opps.length} รายการ${topOpp ? ' (อันดับ 1: '+topOpp+')' : ''}
สถานะ: ${isPremium ? 'Premium' : 'Free'}
${!isPremium ? 'ฟีเจอร์ที่ยังไม่ได้ใช้: '+lockedFeatures.join(', ') : ''}

== วิธีตอบ ==
- ตอบภาษาไทยเป็นธรรมชาติ เหมือนเพื่อนที่รู้จักผู้ใช้ดี ไม่ใช่ bot
- ดึงข้อมูลจริงมาใช้ในการตอบเสมอ ไม่ตอบแบบกว้างๆ
- ความยาวตอบพอดี — สั้นถ้าถามง่าย ยาวขึ้นถ้าต้องการรายละเอียด
- ถ้าผู้ใช้ถามเรื่องที่ไม่มีข้อมูลพอ บอกตรงๆ ว่าต้องบันทึกเพิ่ม

== Soft Upsell (ใช้เมื่อเหมาะสมเท่านั้น) ==
${!isPremium ? `ถ้าผู้ใช้ถามเรื่องที่ Premium เท่านั้นที่ทำได้ ให้ตอบให้ประโยชน์ก่อน แล้วจึงพูดถึงความเป็นไปได้เพิ่มเติมแบบนุ่มนวล เช่น:
"...ถ้าอยากเห็นภาพรวมลึกกว่านี้ Self Intelligence Report (399 บาท) มีวิเคราะห์ครบ Pattern ระยะยาวของคุณด้วยครับ"
- ห้าม upsell ทุกข้อความ — เฉพาะตอนที่ผู้ใช้ถามเรื่องที่เกี่ยวข้องจริงๆ เท่านั้น
- ห้ามกดดัน พูดแค่ครั้งเดียวต่อการสนทนา แล้วไม่พูดอีก
- ถ้า upsell แล้วผู้ใช้ไม่สนใจ ให้ drop เรื่องนี้ทันที` : 'ผู้ใช้เป็น Premium แล้ว ไม่ต้อง upsell'}`;

  // สร้าง messages array สำหรับ API (รวม history)
  const messages = [
    ...((history || []).slice(-8)), // เก็บแค่ 8 รอบล่าสุด ป้องกัน context ยาวเกิน
    { role: 'user', content: message }
  ];

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Claude API error: ' + err }) };
    }

    const data = await res.json();
    const reply = data.content && data.content[0] && data.content[0].text;
    if (!reply) throw new Error('No content');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };
  } catch(e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'ตอบไม่ได้: ' + e.message }) };
  }
};

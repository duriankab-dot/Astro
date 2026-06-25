// netlify/functions/life-copilot.js
// Life Copilot API — ใช้ AI ภายนอก (OpenAI) ตอบคำถาม

const fetch = require('node-fetch');

exports.handler = async (event) => {
  // อนุญาตเฉพาะ POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history, profile, isPremium } = JSON.parse(event.body);

    // ใช้ OpenAI API Key จาก Environment Variable
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('❌ Missing OPENAI_API_KEY environment variable');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // สร้าง system prompt จาก profile ของผู้ใช้
    const systemPrompt = buildSystemPrompt(profile, isPremium);

    // สร้าง messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    // เรียก OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: isPremium ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'AI service error' })
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'ขอโทษครับ ตอบไม่ได้ในตอนนี้';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    console.error('❌ Life Copilot error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function buildSystemPrompt(profile, isPremium) {
  const { name, archetype, archetypeDesc, phase, baziDayMaster, lifePathNum, strengths, blindspot } = profile || {};

  let prompt = `คุณคือ VERA ผู้ช่วยชีวิตส่วนตัวของ ${name || 'ผู้ใช้'} คุณเป็นผู้ช่วยที่อบอุ่น ฉลาด และเข้าใจมนุษย์อย่างลึกซึ้ง

ข้อมูลของผู้ใช้:
- ผลวิเคราะห์ตัวตน: ${archetype || 'ยังไม่ระบุ'} — ${archetypeDesc || ''}
- ช่วงชีวิต: ${phase || 'ยังไม่ระบุ'}
${baziDayMaster ? `- พลังงานหลัก: ธาตุ${baziDayMaster}` : ''}
${lifePathNum ? `- เลขชีวิต: ${lifePathNum}` : ''}
${strengths?.length ? `- จุดแข็ง: ${strengths.join(', ')}` : ''}
${blindspot?.length ? `- จุดที่ควรระวัง: ${blindspot.map(b => b.t).join(', ')}` : ''}

${isPremium ? 'คุณสามารถให้คำแนะนำที่ลึกซึ้งและเฉพาะตัวมากขึ้น' : 'คุณให้คำแนะนำทั่วไปตามข้อมูลที่มี'}

กฎการตอบ:
1. ตอบเป็นภาษาไทย
2. ใช้คำพูดที่อบอุ่นและเข้าใจ
3. อ้างอิงข้อมูลของผู้ใช้เมื่อเกี่ยวข้อง
4. ถ้าคำถามอยู่นอกขอบเขต ให้ตอบอย่างสุภาพว่าช่วยไม่ได้
5. ตอบสั้นกระชับ แต่มีประโยชน์`;

  return prompt;
}

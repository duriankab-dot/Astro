// netlify/functions/life-copilot.js
// Life Copilot — ใช้ DeepSeek API

exports.handler = async (event) => {
  // อนุญาตเฉพาะ POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, history, profile } = JSON.parse(event.body);

    // ใช้ DeepSeek API Key จาก Environment Variable
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (!DEEPSEEK_API_KEY) {
      console.error('❌ Missing DEEPSEEK_API_KEY environment variable');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // สร้าง system prompt จาก profile ของผู้ใช้
    const systemPrompt = buildSystemPrompt(profile);

    // สร้าง messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    // เรียก DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', errorText);
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

function buildSystemPrompt(profile) {
  const { name, archetype, archetypeDesc, phase, baziDayMaster, lifePathNum, strengths, blindspot } = profile || {};

  let prompt = `คุณคือ VERA ผู้ช่วยชีวิตส่วนตัวของ ${name || 'ผู้ใช้'} คุณเป็นผู้ช่วยที่อบอุ่น ฉลาด และเข้าใจมนุษย์อย่างลึกซึ้ง

ข้อมูลของผู้ใช้:
- ผลวิเคราะห์ตัวตน: ${archetype || 'ยังไม่ระบุ'} — ${archetypeDesc || ''}
- ช่วงชีวิต: ${phase || 'ยังไม่ระบุ'}
${baziDayMaster ? `- พลังงานหลัก: ธาตุ${baziDayMaster}` : ''}
${lifePathNum ? `- เลขชีวิต: ${lifePathNum}` : ''}
${strengths?.length ? `- จุดแข็ง: ${strengths.join(', ')}` : ''}
${blindspot?.length ? `- จุดที่ควรระวัง: ${blindspot.map(b => b.t).join(', ')}` : ''}

กฎการตอบ:
1. ตอบเป็นภาษาไทย
2. ใช้คำพูดที่อบอุ่นและเข้าใจ
3. อ้างอิงข้อมูลของผู้ใช้เมื่อเกี่ยวข้อง
4. ถ้าคำถามอยู่นอกขอบเขต ให้ตอบอย่างสุภาพว่าช่วยไม่ได้
5. ตอบสั้นกระชับ แต่มีประโยชน์
6. ถ้าผู้ใช้ดูเศร้าหรือเครียด ให้กำลังใจอย่างเหมาะสม`;

  return prompt;
}

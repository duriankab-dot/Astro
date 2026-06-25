// netlify/functions/life-coach.js
// สร้างรายงานไลฟ์โค้ชส่วนตัวด้วย DeepSeek

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const payload = JSON.parse(event.body);
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const systemPrompt = buildCoachPrompt(payload);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'สร้างรายงานไลฟ์โค้ชส่วนตัวให้ฉัน' }
        ],
        temperature: 0.5,
        max_tokens: 1500,
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
    const script = data.choices?.[0]?.message?.content || 'ไม่สามารถสร้างรายงานได้ในตอนนี้';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script })
    };

  } catch (error) {
    console.error('❌ Life Coach error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function buildCoachPrompt(payload) {
  const { name, archetype, archetypeDesc, phase, lifePathNum, strengths, blindspot } = payload;

  return `คุณเป็นไลฟ์โค้ชมืออาชีพ กำลังเขียนรายงานให้ ${name || 'ลูกค้า'}

ข้อมูล:
- ผลวิเคราะห์ตัวตน: ${archetype || 'ยังไม่ระบุ'} — ${archetypeDesc || ''}
- ช่วงชีวิต: ${phase || 'ยังไม่ระบุ'}
- เลขชีวิต: ${lifePathNum || 'ยังไม่ระบุ'}
${strengths?.length ? `- จุดแข็ง: ${strengths.join(', ')}` : ''}
${blindspot?.length ? `- จุดที่ควรระวัง: ${blindspot.map(b => b.t).join(', ')}` : ''}

เขียนรายงานที่มีส่วนดังนี้:
1. บทนำ — สรุปภาพรวม
2. จุดแข็งหลัก 3 ข้อ
3. จุดที่ควรพัฒนา 2-3 ข้อ
4. คำแนะนำเฉพาะสำหรับช่วงชีวิตปัจจุบัน
5. การ์ดเตือนใจ (1 ประโยคสั้นๆ)

ใช้ภาษาไทย ตรงไปตรงมา ให้กำลังใจ และนำไปใช้ได้จริง`;
}

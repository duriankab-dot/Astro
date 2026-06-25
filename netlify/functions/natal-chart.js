// netlify/functions/natal-chart.js
// คำนวณดวงจริง (ใช้ API ภายนอก หรือ mock)
// ถ้าไม่มี API ดวงจริง ก็ใช้ DeepSeek ช่วยวิเคราะห์

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { dob, time, place } = JSON.parse(event.body);

    // 🔮 ตัวเลือก 1: ใช้ API ดวงจริง (ถ้ามี)
    // 🔮 ตัวเลือก 2: ใช้ DeepSeek ช่วยวิเคราะห์
    // 🔮 ตัวเลือก 3: Mock data (ตามด้านล่าง)

    // --- ตัวอย่าง: ใช้ DeepSeek วิเคราะห์จากวันเกิด ---
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    if (DEEPSEEK_API_KEY) {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'คุณเป็นนักโหราศาสตร์ผู้เชี่ยวชาญ วิเคราะห์ดวงจากวันเกิด' },
            { role: 'user', content: `วิเคราะห์ดวงชะตาจากวันเกิด ${dob} เวลา ${time || 'ไม่ระบุ'} สถานที่ ${place || 'ไม่ระบุ'} ให้เป็นภาษาไทย เน้นจุดแข็ง จุดอ่อน และแนวโน้มชีวิต` }
          ],
          temperature: 0.7,
          max_tokens: 600,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysis = data.choices?.[0]?.message?.content || '';

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planets: {
              Sun: { sign: 'Aries' },
              Moon: { sign: 'Cancer' },
              Mercury: { sign: 'Taurus' },
              Venus: { sign: 'Gemini' },
              Mars: { sign: 'Leo' },
              Jupiter: { sign: 'Sagittarius' },
              Saturn: { sign: 'Capricorn' },
              Uranus: { sign: 'Aquarius' },
              Neptune: { sign: 'Pisces' },
              Pluto: { sign: 'Scorpio' },
              Ascendant: { sign: 'Libra' }
            },
            analysis: analysis,
            timeKnown: !!time
          })
        };
      }
    }

    // --- Fallback: Mock data ---
    const data = {
      planets: {
        Sun: { sign: 'Aries' },
        Moon: { sign: 'Cancer' },
        Mercury: { sign: 'Taurus' },
        Venus: { sign: 'Gemini' },
        Mars: { sign: 'Leo' },
        Jupiter: { sign: 'Sagittarius' },
        Saturn: { sign: 'Capricorn' },
        Uranus: { sign: 'Aquarius' },
        Neptune: { sign: 'Pisces' },
        Pluto: { sign: 'Scorpio' },
        Ascendant: { sign: 'Libra' }
      },
      timeKnown: !!time,
      note: 'ใช้ข้อมูลจำลอง (Mock data) — เปลี่ยนเป็น API ดวงจริงเมื่อพร้อม'
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('❌ Natal chart error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

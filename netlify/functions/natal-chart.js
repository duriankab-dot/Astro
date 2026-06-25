// netlify/functions/natal-chart.js
// คำนวณดวงจริง (ใช้ API ภายนอก)
// ถ้าไม่มี API จริง ก็ตอบข้อมูล mock หรือใช้บริการอื่น

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { dob, time, place } = JSON.parse(event.body);

    // 🔮 เปลี่ยนเป็น API ดวงจริงที่คุณใช้
    // ตัวอย่าง: ใช้ astrology API หรือ mock data
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
      timeKnown: !!time
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

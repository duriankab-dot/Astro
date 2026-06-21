// netlify/functions/natal-chart.js
//
// Server-side proxy to a real astrology (ephemeris) API. This exists because
// API keys can never be safely embedded in client-side code (astrovera-v5.html
// is one public HTML file — anyone can View Source and steal an embedded key).
// This function keeps the key secret on Netlify's server and only returns the
// computed planet positions to the browser.
//
// Default provider wired up below: FreeAstrologyAPI.com (https://freeastrologyapi.com)
// — has a free tier, clear docs, real Swiss-Ephemeris-based Western/tropical
// calculations. If you sign up with a different provider, only the section
// marked "PROVIDER-SPECIFIC" below needs to change — everything else (geocoding,
// response shape returned to the client) stays the same.
//
// Setup required in Netlify dashboard (Site settings → Environment variables):
//   ASTROLOGY_API_KEY = <your real key from whichever provider you sign up with>

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'ใช้ได้แค่ POST เท่านั้น' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ข้อมูลที่ส่งมาไม่ใช่ JSON ที่ถูกต้อง' }) };
  }

  const { dob, time, place } = body;
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ต้องระบุวันเกิดรูปแบบ YYYY-MM-DD' }) };
  }

  const apiKey = process.env.ASTROLOGY_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ยังไม่ได้ตั้งค่า ASTROLOGY_API_KEY ใน Netlify (Site settings → Environment variables)' })
    };
  }

  // ── 1. แปลง "สถานที่เกิด" (ข้อความ) เป็นพิกัด lat/lon ──
  let lat = 13.7563, lon = 100.5018;
  if (place && place.trim()) {
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place.trim())}`,
        { headers: { 'User-Agent': 'ASTROVERA-app/1.0' } }
      );
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData[0]) {
        lat = parseFloat(geoData[0].lat);
        lon = parseFloat(geoData[0].lon);
      }
    } catch (e) {
      // หาพิกัดไม่ได้ก็ไม่เป็นไร ใช้ค่าเริ่มต้น (กรุงเทพ) ต่อไป
    }
  }

  // ── 2. แยกวัน-เดือน-ปี และเวลาเกิด ──
  const [year, month, date] = dob.split('-').map(Number);
  let hours = 12, minutes = 0, timeKnown = false;
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    [hours, minutes] = time.split(':').map(Number);
    timeKnown = true;
  }

  // ── 3. เรียก Astrology API จริง ──
  let apiData;
  try {
    const apiRes = await fetch('https://json.freeastrologyapi.com/western/planets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        year, month, date, hours, minutes, seconds: 0,
        latitude: lat, longitude: lon,
        timezone: 7,
        config: { observation_point: 'topocentric', ayanamsha: 'tropical', language: 'en' }
      })
    });
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'เรียก astrology API ไม่สำเร็จ', detail: errText }) };
    }
    apiData = await apiRes.json();
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'เชื่อมต่อ astrology API ไม่ได้', detail: e.message }) };
  }

  // ── 4. แปลงผลลัพธ์ดิบให้เป็นรูปแบบสะอาด ส่งกลับไปให้ฝั่งแอป ──
  const planets = {};
  (apiData.output || []).forEach((p) => {
    const enName = p.planet && p.planet.en;
    if (!enName) return;
    planets[enName] = {
      sign: p.zodiac_sign && p.zodiac_sign.name && p.zodiac_sign.name.en,
      degree: typeof p.normDegree === 'number' ? Math.round(p.normDegree * 10) / 10 : null,
      retrograde: p.isRetro === 'True' || p.isRetro === true
    };
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planets, timeKnown, lat, lon })
  };
};

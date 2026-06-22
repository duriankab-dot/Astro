// netlify/functions/natal-chart.js
// รองรับทั้ง Western (ayanamsha: tropical/sayana) และ Vedic (ayanamsha: lahiri)
// ส่ง { ..., mode: "vedic" } มาใน request body เพื่อเปลี่ยนเป็น Vedic mode
// ไม่ต้องสมัคร API key ใหม่ — ใช้ ASTROLOGY_API_KEY เดิม

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'ใช้ได้แค่ POST เท่านั้น' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'ข้อมูลที่ส่งมาไม่ใช่ JSON ที่ถูกต้อง' }) }; }

  const { dob, time, place, mode } = body;
  const isVedic = mode === 'vedic';

  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ต้องระบุวันเกิดรูปแบบ YYYY-MM-DD' }) };
  }

  const apiKey = process.env.ASTROLOGY_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({
      error: 'ยังไม่ได้ตั้งค่า ASTROLOGY_API_KEY ใน Netlify (Site settings → Environment variables)'
    })};
  }

  // Geocode place
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
    } catch(e) {}
  }

  const [year, month, date] = dob.split('-').map(Number);
  let hours = 12, minutes = 0, timeKnown = false;
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    [hours, minutes] = time.split(':').map(Number);
    timeKnown = true;
  }

  let apiData;
  try {
    const apiRes = await fetch('https://json.freeastrologyapi.com/planets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        year, month, date, hours, minutes, seconds: 0,
        latitude: lat, longitude: lon,
        timezone: 7,
        config: {
          observation_point: 'topocentric',
          ayanamsha: isVedic ? 'lahiri' : 'sayana',
          language: 'en'
        }
      })
    });
    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'เรียก astrology API ไม่สำเร็จ', detail: errText }) };
    }
    apiData = await apiRes.json();
  } catch(e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'เชื่อมต่อ astrology API ไม่ได้', detail: e.message }) };
  }

  // แปลงผลลัพธ์ดิบ — Vedic มี field เพิ่มคือ nakshatra, house, planet_awastha
  const planets = {};
  const output = apiData.output || apiData; // รองรับ response format ทั้ง 2 แบบ
  (Array.isArray(output) ? output : []).forEach(p => {
    const enName = p.name || (p.planet && p.planet.en);
    if (!enName) return;
    planets[enName] = {
      sign: p.sign || (p.zodiac_sign && p.zodiac_sign.name && p.zodiac_sign.name.en),
      degree: typeof p.normDegree === 'number' ? Math.round(p.normDegree * 10) / 10 : null,
      fullDegree: typeof p.fullDegree === 'number' ? Math.round(p.fullDegree * 100) / 100 : null,
      retrograde: p.isRetro === 'true' || p.isRetro === 'True' || p.isRetro === true,
      house: p.house || null,
      // Vedic-specific fields
      nakshatra: p.nakshatra || null,
      nakshatraLord: p.nakshatraLord || null,
      nakshatra_pad: p.nakshatra_pad || null,
      planet_awastha: p.planet_awastha || null
    };
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planets, timeKnown, lat, lon, mode: isVedic ? 'vedic' : 'western' })
  };
};

// netlify/functions/human-design.js
// Human Design — คำนวณ Gate จาก 2 วันเวลา:
//   Conscious   = วันเกิดจริง (สิ่งที่รู้ตัว)
//   Unconscious = 88.736 วันก่อนวันเกิด (สิ่งที่คนอื่นเห็น)
// Gate 1-64 map จาก ecliptic degree ผ่าน I Ching wheel
// ใช้ ASTROLOGY_API_KEY เดิม เรียก planets API 2 ครั้ง (parallel)

// I Ching 64 Gate wheel เริ่มจาก 0° Capricorn (270° ecliptic)
// ลำดับตามมาตรฐาน Human Design (Ra Uru Hu)
const HD_WHEEL = [
  41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,
  27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,
  31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,
  28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60
];

// Channel definitions (คู่ Gate ที่เชื่อมเป็น Channel)
const HD_CHANNELS = {
  '1-8':'Channel of Inspiration — ความคิดสร้างสรรค์ที่แสดงออก',
  '2-14':'Channel of the Beat — ทิศทางและพลังงาน',
  '3-60':'Channel of Mutation — การเปลี่ยนแปลงผ่านข้อจำกัด',
  '4-63':'Channel of Logic — ความสงสัยและการวิเคราะห์',
  '5-15':'Channel of Rhythm — รูปแบบตามธรรมชาติ',
  '6-59':'Channel of Mating — การเชื่อมต่อสัมพันธ์',
  '7-31':'Channel of the Alpha — ความเป็นผู้นำ',
  '9-52':'Channel of Concentration — สมาธิและรายละเอียด',
  '10-20':'Channel of Awakening — ความตื่นรู้และพฤติกรรม',
  '11-56':'Channel of Curiosity — ความอยากรู้',
  '12-22':'Channel of Openness — การแสดงออกทางอารมณ์',
  '13-33':'Channel of the Prodigal — ความทรงจำและประสบการณ์',
  '16-48':'Channel of the Wavelength — ความลึกและทักษะ',
  '17-62':'Channel of Acceptance — ความคิดที่จัดระเบียบ',
  '18-58':'Channel of Judgment — ความสมบูรณ์แบบ',
  '19-49':'Channel of Synthesis — ความรู้สึกและหลักการ',
  '20-34':'Channel of Charisma — พลังงานที่แสดงออก',
  '20-57':'Channel of the Brain Wave — สัญชาตญาณในปัจจุบัน',
  '21-45':'Channel of Money — วัตถุและอำนาจ',
  '23-43':'Channel of Structuring — การถ่ายทอดความเข้าใจ',
  '24-61':'Channel of Awareness — ความรู้ภายใน',
  '25-51':'Channel of Initiation — ความกล้าและการเริ่มต้น',
  '26-44':'Channel of Surrender — ความทรงจำและสัญชาตญาณ',
  '27-50':'Channel of Preservation — การดูแลและคุณค่า',
  '28-38':'Channel of Struggle — การต่อสู้เพื่อความหมาย',
  '29-46':'Channel of Discovery — การอุทิศตน',
  '30-41':'Channel of Recognition — ความฝันและประสบการณ์',
  '32-54':'Channel of Transformation — ความทะเยอทะยาน',
  '35-36':'Channel of Transitoriness — วิกฤตและประสบการณ์',
  '37-40':'Channel of Community — ชุมชนและการทำงาน',
  '39-55':'Channel of Emoting — จิตวิญญาณและอารมณ์',
  '42-53':'Channel of Maturation — วัฏจักรและการเติบโต',
  '47-64':'Channel of Abstraction — การตีความและความสับสน',
  '57-20':'Channel of the Brain Wave — สัญชาตญาณ'
};

// HD Type logic (simplified from defined motors/channels)
// ใช้ Gate ที่ active ทั้ง Conscious + Unconscious
function determineType(allGates) {
  const sacralGates = [5,14,29,34,9,3,42,27,59];
  const throatGates = [45,35,12,56,62,17,23,43,20,31,8,33,7,1,13];
  const motorGates = [21,26,51,40,54,32,28,38,48,57,18,58,41,39,30,55,6,37]; // simplified
  
  const hasSacral = allGates.some(g => sacralGates.includes(g));
  const hasThroat = allGates.some(g => throatGates.includes(g));
  const hasMotor = allGates.some(g => motorGates.includes(g));
  
  if (hasSacral && hasThroat) return 'Generator'; // รวม Manifesting Generator
  if (!hasSacral && hasMotor && hasThroat) return 'Manifestor';
  if (!hasSacral && !hasMotor) return 'Projector';
  return 'Reflector'; // ถ้าไม่มี defined center เลย
}

function degreeToGate(fullDeg) {
  if (fullDeg === null || fullDeg === undefined) return null;
  // 0° Capricorn = 270° ecliptic เป็นจุดเริ่มของ HD wheel
  const adjusted = ((fullDeg - 270) + 360) % 360;
  const idx = Math.floor(adjusted / 5.625) % 64;
  return HD_WHEEL[idx];
}

async function fetchPlanets(params, apiKey) {
  const res = await fetch('https://json.freeastrologyapi.com/planets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const planets = {};
  const output = Array.isArray(data.output) ? data.output : (Array.isArray(data) ? data : []);
  output.forEach(p => {
    const name = p.name || (p.planet && p.planet.en);
    if (!name) return;
    planets[name] = {
      fullDegree: typeof p.fullDegree === 'number' ? p.fullDegree : null,
      sign: p.sign || (p.zodiac_sign && p.zodiac_sign.name && p.zodiac_sign.name.en),
      retrograde: p.isRetro === 'true' || p.isRetro === 'True' || p.isRetro === true
    };
  });
  return planets;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { dob, time, place } = body;
  if (!dob) return { statusCode: 400, body: JSON.stringify({ error: 'ต้องระบุ dob' }) };

  const apiKey = process.env.ASTROLOGY_API_KEY;
  if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'ไม่พบ ASTROLOGY_API_KEY' }) };

  // Geocode
  let lat = 13.7563, lon = 100.5018;
  if (place && place.trim()) {
    try {
      const g = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`,
        { headers: { 'User-Agent': 'ASTROVERA-app/1.0' } }
      );
      const gd = await g.json();
      if (gd[0]) { lat = parseFloat(gd[0].lat); lon = parseFloat(gd[0].lon); }
    } catch(e) {}
  }

  // วันเกิดจริง
  const [yr, mo, dy] = dob.split('-').map(Number);
  let bHr = 12, bMn = 0, timeKnown = false;
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    [bHr, bMn] = time.split(':').map(Number);
    timeKnown = true;
  }

  // Design date = 88.736 วันก่อนวันเกิด (มาตรฐาน Human Design)
  const birthMs = Date.UTC(yr, mo - 1, dy, bHr - 7, bMn); // แปลงเป็น UTC
  const designMs = birthMs - Math.round(88.736 * 24 * 60 * 60 * 1000);
  const dd = new Date(designMs);

  function makeParams(y, mo, d, hr, mn) {
    return {
      year: y, month: mo, date: d, hours: hr, minutes: mn, seconds: 0,
      latitude: lat, longitude: lon, timezone: 7,
      config: { observation_point: 'topocentric', ayanamsha: 'tropical', language: 'en' }
    };
  }

  // เรียก API 2 ครั้งพร้อมกัน
  let conscious, unconscious;
  try {
    [conscious, unconscious] = await Promise.all([
      fetchPlanets(makeParams(yr, mo, dy, bHr, bMn), apiKey),
      fetchPlanets(makeParams(dd.getUTCFullYear(), dd.getUTCMonth()+1, dd.getUTCDate(), (dd.getUTCHours()+7)%24, dd.getUTCMinutes()), apiKey)
    ]);
  } catch(e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'เรียก API ไม่สำเร็จ: ' + e.message }) };
  }

  // แปลง degree → Gate
  const KEY = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Ascendant'];
  const cGates = {}, uGates = {};
  KEY.forEach(pl => {
    if (conscious[pl]?.fullDegree != null) cGates[pl] = degreeToGate(conscious[pl].fullDegree);
    if (unconscious[pl]?.fullDegree != null) uGates[pl] = degreeToGate(unconscious[pl].fullDegree);
  });

  // หา Channel ที่ active
  const allGates = [...new Set([...Object.values(cGates), ...Object.values(uGates)].filter(Boolean))];
  const activeChannels = [];
  Object.entries(HD_CHANNELS).forEach(([key, desc]) => {
    const [g1, g2] = key.split('-').map(Number);
    if (allGates.includes(g1) && allGates.includes(g2)) {
      activeChannels.push({ gates: `${g1}-${g2}`, desc });
    }
  });

  const hdType = determineType(allGates);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conscious: cGates,
      unconscious: uGates,
      allGates: allGates.sort((a,b) => a-b),
      activeChannels,
      hdType,
      designDate: dd.toISOString().split('T')[0],
      timeKnown
    })
  };
};

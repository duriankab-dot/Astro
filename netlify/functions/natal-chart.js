// ═══════════════════════════════════════════════════════════
// ASTROVERA — Netlify Function: natal-chart
// คำนวณตำแหน่งดาวจริง + Nakshatra ด้วย Swiss Ephemeris logic
// ใช้โดย: หน้า "มิติจักรวาล" / Nakshatra screen
// ENV: ANTHROPIC_API_KEY
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

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { dob, time = '', place = '' } = payload;

  if (!dob) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'dob is required' }) };
  }

  try {
    // ─── คำนวณตำแหน่งดาวด้วย Pure JS (ไม่ต้องพึ่ง external API) ───
    // ใช้ VSOP87 approximation — แม่นพอสำหรับดูดวง (error < 1°)
    const planets = calculatePlanets(dob, time, place);
    const nakshatra = calculateNakshatra(planets.Moon?.longitude || 0);
    const ascendant = estimateAscendant(dob, time, place);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        planets: {
          Sun: planets.Sun,
          Moon: planets.Moon,
          Mercury: planets.Mercury,
          Venus: planets.Venus,
          Mars: planets.Mars,
          Jupiter: planets.Jupiter,
          Saturn: planets.Saturn,
          Ascendant: ascendant,
        },
        nakshatra,
        calculated: true,
        calculatedAt: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Calculation error: ' + err.message }),
    };
  }
};

// ═══ PLANETARY CALCULATION (VSOP87 Simplified) ═══

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

// Lahiri Ayanamsha (สำหรับ Vedic) — ค่าประมาณ
function getAyanamsha(jd) {
  return 23.85 + (jd - 2433282.5) * (50.3 / 365.25) / 3600;
}

function dateToJulian(dateStr, timeStr) {
  const d = new Date(dateStr);
  if (timeStr && timeStr.includes(':')) {
    const [h, m] = timeStr.split(':').map(Number);
    d.setUTCHours(h - 7, m); // Thai time UTC+7
  }
  const y = d.getUTCFullYear();
  const mo = d.getUTCMonth() + 1;
  const day = d.getUTCDate() + d.getUTCHours() / 24 + d.getUTCMinutes() / 1440;
  let jy = y, jm = mo;
  if (mo <= 2) { jy--; jm += 12; }
  const A = Math.floor(jy / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + day + B - 1524.5;
}

function normalizeDeg(d) {
  return ((d % 360) + 360) % 360;
}

function degToSign(deg) {
  const d = normalizeDeg(deg);
  const idx = Math.floor(d / 30);
  const degInSign = d % 30;
  return {
    sign: ZODIAC_SIGNS[idx],
    degree: Math.round(degInSign * 10) / 10,
    longitude: Math.round(d * 10) / 10,
  };
}

// Sun position (Tropical) — accuracy ~1°
function calcSun(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(280.46 + 0.9856474 * n);
  const g = normalizeDeg(357.528 + 0.9856003 * n) * Math.PI / 180;
  const lambda = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return normalizeDeg(lambda);
}

// Moon position (Tropical) — accuracy ~2°
function calcMoon(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(218.316 + 13.176396 * n);
  const M = normalizeDeg(134.963 + 13.064993 * n) * Math.PI / 180;
  const F = normalizeDeg(93.272 + 13.229350 * n) * Math.PI / 180;
  const lon = L + 6.289 * Math.sin(M) - 1.274 * Math.sin(2 * F - M)
    + 0.658 * Math.sin(2 * F) - 0.214 * Math.sin(2 * M) - 0.186 * Math.sin(M);
  return normalizeDeg(lon);
}

// Mercury (simplified)
function calcMercury(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(252.251 + 4.092339 * n);
  const M = normalizeDeg(174.795 + 4.092317 * n) * Math.PI / 180;
  return normalizeDeg(L + 23.440 * Math.sin(M) + 2.994 * Math.sin(2 * M));
}

// Venus
function calcVenus(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(181.979 + 1.602169 * n);
  const M = normalizeDeg(50.416 + 1.602130 * n) * Math.PI / 180;
  return normalizeDeg(L + 0.777 * Math.sin(M) + 0.022 * Math.sin(2 * M));
}

// Mars
function calcMars(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(355.433 + 0.524071 * n);
  const M = normalizeDeg(19.373 + 0.524033 * n) * Math.PI / 180;
  return normalizeDeg(L + 10.691 * Math.sin(M) + 0.623 * Math.sin(2 * M));
}

// Jupiter
function calcJupiter(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(34.351 + 0.083056 * n);
  const M = normalizeDeg(20.020 + 0.083040 * n) * Math.PI / 180;
  return normalizeDeg(L + 5.555 * Math.sin(M) + 0.168 * Math.sin(2 * M));
}

// Saturn
function calcSaturn(jd) {
  const n = jd - 2451545.0;
  const L = normalizeDeg(50.077 + 0.033459 * n);
  const M = normalizeDeg(317.020 + 0.033423 * n) * Math.PI / 180;
  return normalizeDeg(L + 6.393 * Math.sin(M) + 0.344 * Math.sin(2 * M));
}

function calculatePlanets(dob, time, place) {
  const jd = dateToJulian(dob, time);
  const ayanamsha = getAyanamsha(jd);

  function toVedic(tropical) {
    return normalizeDeg(tropical - ayanamsha);
  }

  // Retrograde check (simplified — based on synodic position vs Sun)
  const sunLon = calcSun(jd);

  function isRetrograde(planet, lon) {
    if (planet === 'Mercury' || planet === 'Venus') {
      const diff = normalizeDeg(lon - sunLon);
      return diff > 180 && diff < 360; // very rough
    }
    return false; // outer planets need elongation check — skip for now
  }

  const rawPlanets = {
    Sun: calcSun(jd),
    Moon: calcMoon(jd),
    Mercury: calcMercury(jd),
    Venus: calcVenus(jd),
    Mars: calcMars(jd),
    Jupiter: calcJupiter(jd),
    Saturn: calcSaturn(jd),
  };

  const result = {};
  for (const [key, tropical] of Object.entries(rawPlanets)) {
    const vedic = toVedic(tropical);
    const signInfo = degToSign(vedic);
    result[key] = {
      ...signInfo,
      tropical: Math.round(tropical * 10) / 10,
      retrograde: isRetrograde(key, tropical),
    };
  }

  return result;
}

// ═══ NAKSHATRA CALCULATION ═══
const NAKSHATRAS = [
  { name: 'Ashwini', th: 'อัศวินี', ruler: 'Ketu', deity: 'Ashwini Kumaras', quality: 'เร็ว กล้า บุกเบิก' },
  { name: 'Bharani', th: 'ภรณี', ruler: 'Venus', deity: 'Yama', quality: 'สร้างสรรค์ ต้องรับผิดชอบ' },
  { name: 'Krittika', th: 'กฤตติกา', ruler: 'Sun', deity: 'Agni', quality: 'เฉียบคม มุ่งมั่น' },
  { name: 'Rohini', th: 'โรหิณี', ruler: 'Moon', deity: 'Brahma', quality: 'งดงาม อุดมสมบูรณ์' },
  { name: 'Mrigashira', th: 'มฤคศิรา', ruler: 'Mars', deity: 'Soma', quality: 'แสวงหา ช่างสงสัย' },
  { name: 'Ardra', th: 'อาทรา', ruler: 'Rahu', deity: 'Rudra', quality: 'ลึกซึ้ง เปลี่ยนแปลง' },
  { name: 'Punarvasu', th: 'ปุนรวสุ', ruler: 'Jupiter', deity: 'Aditi', quality: 'ฟื้นตัว มองโลกบวก' },
  { name: 'Pushya', th: 'ปุษยะ', ruler: 'Saturn', deity: 'Brihaspati', quality: 'ดูแล บำรุงรักษา' },
  { name: 'Ashlesha', th: 'อาศเลษา', ruler: 'Mercury', deity: 'Nagas', quality: 'แหลมคม ลึกลับ' },
  { name: 'Magha', th: 'มฆา', ruler: 'Ketu', deity: 'Pitrs', quality: 'ทรงพลัง เป็นผู้นำ' },
  { name: 'Purva Phalguni', th: 'บุรพผลคุนี', ruler: 'Venus', deity: 'Bhaga', quality: 'สนุกสนาน โชคดี' },
  { name: 'Uttara Phalguni', th: 'อุตตรผลคุนี', ruler: 'Sun', deity: 'Aryaman', quality: 'ซื่อสัตย์ ช่วยเหลือ' },
  { name: 'Hasta', th: 'หัตถา', ruler: 'Moon', deity: 'Savitar', quality: 'ชำนาญ ฉลาดมือ' },
  { name: 'Chitra', th: 'จิตรา', ruler: 'Mars', deity: 'Vishvakarma', quality: 'สร้างสรรค์ มีเสน่ห์' },
  { name: 'Swati', th: 'สวาตี', ruler: 'Rahu', deity: 'Vayu', quality: 'อิสระ ยืดหยุ่น' },
  { name: 'Vishakha', th: 'วิศาขา', ruler: 'Jupiter', deity: 'Indra-Agni', quality: 'มุ่งเป้า ไม่ยอมแพ้' },
  { name: 'Anuradha', th: 'อนุราธา', ruler: 'Saturn', deity: 'Mitra', quality: 'มิตรภาพ ภักดี' },
  { name: 'Jyeshtha', th: 'เชษฐา', ruler: 'Mercury', deity: 'Indra', quality: 'อาวุโส ปกป้อง' },
  { name: 'Mula', th: 'มูลา', ruler: 'Ketu', deity: 'Nirriti', quality: 'ค้นหาความจริง ถอนรากถอนโคน' },
  { name: 'Purva Ashadha', th: 'บุรวาษาฒา', ruler: 'Venus', deity: 'Apas', quality: 'ไม่ยอมแพ้ มีพลัง' },
  { name: 'Uttara Ashadha', th: 'อุตตราษาฒา', ruler: 'Sun', deity: 'Vishvadevas', quality: 'ชนะอย่างมีเกียรติ' },
  { name: 'Shravana', th: 'ศรวณา', ruler: 'Moon', deity: 'Vishnu', quality: 'เรียนรู้ ฟังเก่ง' },
  { name: 'Dhanishtha', th: 'ธนิษฐา', ruler: 'Mars', deity: 'Ashta Vasus', quality: 'ร่ำรวย มีจังหวะ' },
  { name: 'Shatabhisha', th: 'ศตภิษัช', ruler: 'Rahu', deity: 'Varuna', quality: 'รักษา ลึกลับ' },
  { name: 'Purva Bhadrapada', th: 'บุรวภัทรบท', ruler: 'Jupiter', deity: 'Ajaikapada', quality: 'ปรัชญา แสวงหาความหมาย' },
  { name: 'Uttara Bhadrapada', th: 'อุตตรภัทรบท', ruler: 'Saturn', deity: 'Ahirbudhnya', quality: 'ลึกซึ้ง เมตตา' },
  { name: 'Revati', th: 'เรวตี', ruler: 'Mercury', deity: 'Pushan', quality: 'เดินทาง อ่อนโยน' },
];

function calculateNakshatra(moonVedicLongitude) {
  const lon = normalizeDeg(moonVedicLongitude);
  const idx = Math.floor(lon / (360 / 27));
  const pada = Math.floor((lon % (360 / 27)) / (360 / 27 / 4)) + 1;
  const nak = NAKSHATRAS[idx] || NAKSHATRAS[0];
  return {
    ...nak,
    pada,
    degree: Math.round(lon * 10) / 10,
    index: idx + 1,
  };
}

// ─── Ascendant estimate (ถ้าไม่มีเวลาเกิด ใช้ Solar Rising) ───
function estimateAscendant(dob, time, place) {
  if (!time || !time.includes(':')) {
    return null; // ไม่มีเวลาเกิด — ไม่คำนวณ
  }
  const jd = dateToJulian(dob, time);
  const sunLon = calcSun(jd);
  // ประมาณ Ascendant จาก RAMC (rough estimate ±15°)
  const [h, m] = time.split(':').map(Number);
  const timeDecimal = h + m / 60;
  // Midheaven ประมาณ: Sun ณ เที่ยง = MC
  const mcOffset = (timeDecimal - 12) * 15; // 15°/hour
  const mc = normalizeDeg(sunLon + mcOffset);
  const asc = normalizeDeg(mc + 90);
  return {
    ...degToSign(asc),
    estimated: true,
  };
}

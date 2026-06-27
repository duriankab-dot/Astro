// netlify/functions/analyze.js
// วิเคราะห์ชีวิตด้วย DeepSeek + รับ astro_data ที่คำนวณมาแล้วจาก client
// env vars ที่ต้องตั้งใน Netlify UI:
//   DEEPSEEK_API_KEY
//   SUPABASE_URL       (optional — เพื่อ log ฝั่ง server)
//   SUPABASE_SERVICE_KEY (optional)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ── lens map ──
const LENS_MAP = {
  general: 'วิเคราะห์ภาพรวมตัวตน จุดแข็ง แนวโน้มชีวิต และคำแนะนำเชิงปฏิบัติ',
  career:  'เน้นวิเคราะห์ด้านอาชีพ ความสามารถ ทิศทางการทำงาน และโอกาสใหม่',
  love:    'เน้นวิเคราะห์ด้านความสัมพันธ์ รูปแบบความรัก และการสื่อสารระหว่างบุคคล',
  finance: 'เน้นวิเคราะห์ด้านการเงิน นิสัยการใช้เงิน และแนวโน้มความมั่งคั่ง',
  health:  'เน้นวิเคราะห์ด้านสุขภาพ พลังงาน วงจรชีวิต และการดูแลตัวเอง'
};

// ── AI persona ──
const AI_PERSONA = {
  vela:    'คุณคือ VELA — นักวิเคราะห์ชีวิตผู้เชี่ยวชาญ ลึกซึ้ง หนักแน่น พูดตรง ให้ insight ที่จริงใจ',
  wellany: 'คุณคือ WELLANY — ผู้ดูแลสุขภาวะจิตใจ อบอุ่น นุ่มนวล เข้าใจความรู้สึก ช่วยให้ผ่อนคลายและเติบโต'
};

function buildSystemPrompt(lens, ai) {
  return `${AI_PERSONA[ai] || AI_PERSONA.vela} ของ ASTROVERA — Personal Life Intelligence Platform

โฟกัสการวิเคราะห์: ${LENS_MAP[lens] || LENS_MAP.general}

📐 Framework ที่ใช้วิเคราะห์ (10 มิติ):
1. เลขชีวิต (Life Path Number) — แนวทางหลักของชีวิต
2. เลขแสดงออก (Expression Number) — พรสวรรค์และบุคลิก
3. ปีส่วนตัว (Personal Year) — พลังงานปีปัจจุบัน
4. ราศีตะวันตก (Sun Sign) — บุคลิกและพลังงานดาว
5. นักษัตรจีน (Chinese Zodiac) — วงจรชีวิต 12 ปี
6. ธาตุ 5 (Five Element) — สมดุลพลังงาน
7. เลขมงคล Kua (Feng Shui) — ทิศและทิศทางพลังงาน
8. วันเกิด — บุคลิกตาม Numerology วัน
9. กรุ๊ปเลือด — มิติพลังงานชีวภาพ
10. Archetype พลังงาน — บทบาทในชีวิตและความสัมพันธ์

กฎการตอบ:
- ตอบเป็นภาษาไทย กระชับ อ่านง่าย ความยาวพอดี (ไม่สั้นเกิน ไม่ยาวเกิน)
- ใช้ "มีแนวโน้ม" "มักจะ" "ควรพิจารณา" — ห้ามใช้ "จะ" "ต้อง" เชิงทำนายตายตัว
- ห้ามใช้คำว่า "ดูดวง" "ทำนาย" "โชคชะตา" — ใช้ "ข้อมูล" "Pattern" "แนวโน้ม"
- ใช้ emoji นำแต่ละ section
- จบด้วย 2 คำถามสะท้อนตัวเองที่ practical
- ถ้าเป็น follow-up ตอบตรงคำถาม อ้างอิงข้อมูลเดิมที่มี`;
}

function buildUserContent(d) {
  const a = d.astro_data || {};
  let c = `👤 ข้อมูลผู้ใช้:\n`;
  if (d.name)        c += `• ชื่อ: ${d.name}\n`;
  if (d.birth_date)  c += `• วันเกิด: ${d.birth_date}\n`;
  if (d.birth_time)  c += `• เวลาเกิด: ${d.birth_time || 'ไม่ทราบ'}\n`;
  if (d.birth_place) c += `• สถานที่เกิด: ${d.birth_place}\n`;
  if (d.blood_type)  c += `• กรุ๊ปเลือด: ${d.blood_type}\n`;
  if (a.age)         c += `• อายุ: ${a.age} ปี\n`;

  if (Object.keys(a).length > 0) {
    c += `\n🔢 ข้อมูลคำนวณ 10 มิติ:\n`;
    if (a.life_path)         c += `• เลขชีวิต: ${a.life_path} (${a.energy_archetype || ''})\n`;
    if (a.expression_number) c += `• เลขแสดงออก: ${a.expression_number}\n`;
    if (a.personal_year)     c += `• ปีส่วนตัว ${new Date().getFullYear()}: ${a.personal_year}\n`;
    if (a.sun_sign)          c += `• ราศี: ${a.sun_sign}\n`;
    if (a.chinese_zodiac)    c += `• นักษัตร: ${a.chinese_zodiac}\n`;
    if (a.five_element)      c += `• ธาตุ: ${a.five_element}\n`;
    if (a.kua_number)        c += `• Kua: ${a.kua_number}\n`;
    if (a.birth_day)         c += `• วันเกิด: ${a.birth_day}\n`;
  }

  // เหตุการณ์สำคัญ (ถ้ามี)
  if (d.events && Object.keys(d.events).length > 0) {
    c += `\n📅 เหตุการณ์สำคัญในชีวิต:\n`;
    const labels = {
      start_work_year:'ปีเริ่มทำงาน',job_change_year:'ปีเปลี่ยนงาน',
      start_business_year:'ปีเริ่มธุรกิจ',business_peak_year:'ปีธุรกิจรุ่งเรือง',
      best_finance_year:'ปีการเงินดีที่สุด',worst_finance_year:'ปีการเงินแย่ที่สุด',
      marriage_year:'ปีแต่งงาน',lost_family_year:'ปีสูญเสียคนใกล้ชิด',
      major_issues:'เหตุการณ์อื่นๆ'
    };
    for (const [k,v] of Object.entries(d.events)) {
      if (v) c += `• ${labels[k]||k}: ${v}\n`;
    }
  }

  // follow-up history
  if (d.history && d.history.length) {
    c += `\n💬 บทสนทนาก่อนหน้า:\n`;
    d.history.slice(0,3).forEach(function(h) {
      c += `[AI]: ${String(h.content||'').slice(0,200)}...\n`;
    });
  }

  c += `\n🎯 คำถาม/โจทย์: ${d.question || 'วิเคราะห์ภาพรวม'}\n`;
  c += `🔭 เลนส์: ${d.lens || 'general'}`;
  return c;
}

// ── เรียก DeepSeek ──
async function callDeepSeek(systemPrompt, userContent) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY ยังไม่ได้ตั้งค่าใน Netlify Environment Variables');

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent  }
      ],
      stream: false,
      max_tokens: 2048,
      temperature: 0.75
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek error (${res.status}): ${errText.slice(0,200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'ไม่ได้รับข้อมูลจาก AI';
}

// ── Optional: log ไป Supabase ฝั่ง server ──
async function logToSupabase(payload, result) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return; // ข้ามถ้าไม่มี env

  try {
    await fetch(`${url}/rest/v1/analysis_history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id:    payload.user_id || 'anon',
        name:       payload.name || '',
        birth_date: payload.birth_date || '',
        lens:       payload.lens || 'general',
        ai:         payload.ai || 'vela',
        result:     result,
        created_at: new Date().toISOString()
      })
    });
  } catch(e) {
    console.warn('Supabase log failed (non-critical):', e.message);
  }
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };
  }

  let userData;
  try {
    userData = JSON.parse(event.body || '{}');
  } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  try {
    const lens         = userData.lens || 'general';
    const ai           = userData.ai   || 'vela';
    const systemPrompt = buildSystemPrompt(lens, ai);
    const userContent  = buildUserContent(userData);
    const result       = await callDeepSeek(systemPrompt, userContent);

    // log ไป Supabase (ถ้ามี env)
    await logToSupabase(userData, result);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ data: result })
    };
  } catch(error) {
    console.error('❌ analyze error:', error.message);
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ error: error.message })
    };
  }
};

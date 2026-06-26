// ═══════════════════════════════════════════════════════════
// ASTROVERA — Netlify Function: life-coach
// สร้างรายงานวิเคราะห์ชีวิตส่วนตัว (Life Coach Script)
// ใช้โดย: ปุ่ม "สร้างรายงาน" ใน Life Coach screen
// ENV: ANTHROPIC_API_KEY
// ═══════════════════════════════════════════════════════════

exports.handler = async function (event) {
  // ─── CORS ───
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const {
    name = 'คุณ',
    archetype = '',
    archetypeTh = '',
    archetypeDesc = '',
    phase = '',
    phaseDesc = '',
    lifePathNum = '',
    lifePathMeaning = '',
    baziDayMaster = '',
    baziDesc = '',
    sunSign = '',
    moonSign = '',
    strengths = [],
    blindspot = [],
    dominantEl = '',
    missingEl = [],
  } = payload;

  const strengthsText = strengths.map(s => `• ${s.t}: ${s.d}`).join('\n');
  const blindsText = blindspot.map(b => `• ${b.i} ${b.t}: ${b.d}`).join('\n');
  const missingText = missingEl.length ? missingEl.join(', ') : 'ไม่มี';

  const systemPrompt = `คุณคือ ASTROVERA Life Intelligence Engine — นักวิเคราะห์ชีวิตเชิงลึกที่ผสมผสาน โหราศาสตร์ จิตวิทยา และการพัฒนาตนเอง

สไตล์การเขียน:
- ใช้ภาษาไทยที่อบอุ่น ฉลาด ลึกซึ้ง — ไม่ใช่ภาษาดูดวงทั่วไป
- พูดตรงถึงผู้อ่าน ใช้ "คุณ" เสมอ
- ไม่ใช้คำว่า "จะ" หรือ "ต้อง" แบบทำนาย — ใช้ "มีแนวโน้ม" "มักจะ" "น่าสนใจที่"
- เขียนแบบโค้ชส่วนตัวที่รู้จักคุณจริงๆ ไม่ใช่ template
- ความยาว 400-600 คำ แบ่งเป็นย่อหน้าสั้นๆ 4-5 ย่อหน้า อ่านง่ายเมื่อฟังเป็นเสียง`;

  const userPrompt = `สร้างรายงานวิเคราะห์ชีวิตส่วนตัวสำหรับ ${name}

ข้อมูลที่วิเคราะห์ได้:
- ลักษณะตัวตน (Archetype): ${archetype} / ${archetypeTh}
  → ${archetypeDesc}
- ช่วงชีวิตปัจจุบัน: ${phase}
  → ${phaseDesc}
${lifePathNum ? `- เลขชีวิต (Life Path): ${lifePathNum} — ${lifePathMeaning}` : ''}
${baziDayMaster ? `- Day Master ปาจื้อ: ${baziDayMaster} — ${baziDesc}` : ''}
${sunSign ? `- ราศีดวงอาทิตย์: ${sunSign}` : ''}
${moonSign ? `- ราศีดวงจันทร์: ${moonSign}` : ''}
${dominantEl ? `- ธาตุเด่น: ${dominantEl}` : ''}
${missingEl.length ? `- ธาตุที่ขาด: ${missingText}` : ''}

จุดแข็ง:
${strengthsText || '• ยืดหยุ่นและปรับตัวได้ดี'}

จุดที่ควรระวัง:
${blindsText || '• ระวังการผัดวันประกันพรุ่ง'}

โครงสร้างรายงาน (เขียนเป็นร้อยแก้วต่อเนื่อง ไม่ใช่หัวข้อ):
1. ย่อหน้าเปิด — สะท้อนตัวตนที่แท้จริงของ ${name} ให้รู้สึกว่า "นี่คือฉันจริงๆ"
2. ช่วงชีวิตและพลังงานตอนนี้ — อธิบายว่าตอนนี้กำลังอยู่ในจังหวะไหนและมันหมายความว่าอะไร
3. จุดแข็งที่ควรใช้ให้เต็มที่ตอนนี้ — เชื่อมกับช่วงชีวิตปัจจุบัน
4. สิ่งที่ควรระวังและวิธีรับมือ — ให้เหตุผลและแนวทางปฏิบัติ
5. ย่อหน้าปิด — ประโยคกำลังใจที่จริงใจและเฉพาะเจาะจง ไม่ใช่คำพูดทั่วไป

ห้ามใช้หัวข้อ bullet หรือ markdown — เขียนเป็นร้อยแก้วที่ฟังแล้วไหลลื่น`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Anthropic API error: ' + err }) };
    }

    const data = await response.json();
    const script = data.content?.[0]?.text || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ script }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// netlify/functions/life-coach.js
// สร้าง script ไลฟ์โค้ชส่วนตัวด้วย Claude Haiku
// รับข้อมูลผู้ใช้จริงจากแอป → ส่งให้ Claude สร้าง script ภาษาไทยแบบ personalized
// ใช้ claude-haiku-4-5-20251001 (ราคาถูกสุด ~฿0.09/ครั้ง แต่คุณภาพดีพอสำหรับงานนี้)
//
// ต้องตั้งค่า env var ใน Netlify:
//   ANTHROPIC_API_KEY = key จาก console.anthropic.com (คนละตัวกับ ASTROLOGY_API_KEY)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST only' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch(e) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({
      error: 'ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY ใน Netlify — ไปที่ console.anthropic.com เพื่อรับ key'
    })};
  }

  // ดึงข้อมูลผู้ใช้จริงจากแอป
  const {
    name,          // ชื่อผู้ใช้
    archetype,     // เช่น "The Analytical Strategist"
    archetypeTh,   // เช่น "นักวางแผนเชิงกลยุทธ์"
    archetypeDesc, // คำอธิบาย archetype
    phase,         // เช่น "ช่วงสร้าง · Building Phase"
    phaseDesc,     // คำอธิบาย phase
    lifePathNum,   // เช่น 7
    lifePathMeaning, // ความหมายเลขชีวิต
    baziDayMaster, // เช่น "ไฟ"
    baziDesc,      // Day Master meaning
    sunSign,       // เช่น "Gemini" → "ราศีเมถุน"
    moonSign,      // เช่น "Pisces"
    strengths,     // จุดแข็ง (array)
    blindspot,     // จุดระวัง (array)
    dominantEl,    // ธาตุเด่นจาก Ba Zi
    missingEl      // ธาตุที่ขาด
  } = body;

  if (!name) {
    return { statusCode: 400, body: JSON.stringify({ error: 'ต้องระบุชื่อผู้ใช้' }) };
  }

  // สร้าง prompt ที่รวมข้อมูลจริงทั้งหมดของผู้ใช้
  const userProfile = `
ข้อมูลผู้ใช้:
- ชื่อ: ${name}
- Archetype: ${archetype || ''} (${archetypeTh || ''}) — ${archetypeDesc || ''}
- ช่วงชีวิตตอนนี้: ${phase || ''} — ${phaseDesc || ''}
- เลขชีวิต (Life Path): ${lifePathNum || ''} — ${lifePathMeaning || ''}
- Day Master (ปาจื้อ): ธาตุ${baziDayMaster || ''} — ${baziDesc || ''}
- ดาวอาทิตย์: ${sunSign || ''}, ดาวจันทร์: ${moonSign || ''}
- จุดแข็ง: ${(strengths || []).join(', ')}
- สิ่งที่ควรระวัง: ${(blindspot || []).join(', ')}
- ธาตุเด่น: ${dominantEl || ''}, ธาตุที่ขาด: ${(missingEl || []).join(', ')}
`.trim();

  const systemPrompt = `คุณคือไลฟ์โค้ชชาวไทยที่ชื่อ "วีร์" — พูดจาอบอุ่น จริงจัง แต่ไม่เคร่งขรึม เหมือนเพื่อนที่เชี่ยวชาญจริงๆ คุยกับลูกค้าแบบตัวต่อตัว

สร้าง script พูดความยาว 3-4 นาที (ประมาณ 350-450 คำ) ภาษาไทยล้วน โดย:
1. ทักทายด้วยชื่อจริง อบอุ่นและเป็นธรรมชาติ ไม่ขึ้นต้น "สวัสดีครับ" แบบทื่อๆ
2. สะท้อนตัวตนหลักจาก Archetype — ให้รู้สึกว่า "นี่คือฉันจริงๆ"
3. เชื่อม Day Master กับสถานการณ์ชีวิตตอนนี้ — ถ้าขาดธาตุอะไร ให้แนะนำจริงๆ ว่าควรทำอะไร
4. พูดถึง Life Phase ตอนนี้ว่าหมายความว่าอะไรในทางปฏิบัติ — ให้ 1-2 สิ่งที่ทำได้เดือนนี้เลย
5. ปิดด้วยกำลังใจที่รู้สึก personalized จริง ไม่ใช่คำพูดทั่วไป

สิ่งที่ต้องหลีกเลี่ยง:
- ห้ามใช้ภาษาวิชาการ ภาษาโหราศาสตร์ดิบๆ ที่คนทั่วไปไม่เข้าใจ
- ห้ามพูดว่า "จากการวิเคราะห์ระบบ" หรือ "Layer ที่" หรือชื่อ system ใดๆ
- ห้ามเขียนหัวข้อ ใช้ตัวหนา หรือ bullet point — เป็น script พูดล้วนๆ
- ห้ามขึ้นต้นประโยคด้วย "ดังนั้น" "จากที่" "อย่างไรก็ตาม" บ่อยเกินไป
- output เป็น plain text เท่านั้น ไม่มี markdown`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userProfile }]
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Claude API error: ' + err }) };
    }

    const data = await res.json();
    const script = data.content && data.content[0] && data.content[0].text;
    if (!script) throw new Error('No content in response');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script })
    };
  } catch(e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'สร้าง script ไม่สำเร็จ: ' + e.message }) };
  }
};

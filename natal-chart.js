// netlify/functions/natal-chart.js
// Multi-action handler หลักของ ASTROVERA
// env vars ที่ต้องตั้งใน Netlify UI:
//   ANTHROPIC_API_KEY — จาก console.anthropic.com
//   ASTROLOGY_API_KEY — จาก freeastrologyapi.com (สำหรับ natal chart)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ── Claude Haiku helper ──
async function callClaude(system, userMsg, maxTokens = 1024) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่า');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMsg }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('No content from Claude');
  return text;
}

// ════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════
exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };

  try {
    let requestData = {};
    let action = 'analyze';

    if (event.httpMethod === 'POST' && event.body) {
      requestData = JSON.parse(event.body);
      action = requestData.action || 'analyze';
    }

    let result;
    switch (action) {
      case 'analyze':             result = await handleAnalyze(requestData);       break;
      case 'ai_advisor':
      case 'scenario':            result = await handleAIScenario(requestData);    break;
      case 'vera_chat':
      case 'ask_vera':            result = await handleVERAChat(requestData);      break;
      case 'save_decision':       result = await handleSaveDecision(requestData);  break;
      case 'save_journal':        result = await handleSaveJournal(requestData);   break;
      case 'save_followup':       result = await handleSaveFollowUp(requestData);  break;
      case 'get_stats':           result = await handleGetStats(requestData);      break;
      case 'sync':                result = await handleSync(requestData);          break;
      case 'save_push_subscription':
        result = { success: true, message: 'Push subscription noted' }; break;
      case 'sync_decisions':
        result = { success: true, message: 'Sync noted' }; break;
      default:
        result = {
          success: false,
          message: 'ไม่รู้จักคำสั่ง: ' + action,
          availableActions: ['analyze','ai_advisor','scenario','vera_chat','save_decision','save_journal','save_followup','get_stats','sync']
        };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };

  } catch (error) {
    console.error('❌ natal-chart error:', error.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ success: false, error: error.message, message: 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    };
  }
};

// ════════════════════════════════════════
// 1. ANALYZE — ต่อ Claude จริง
// ════════════════════════════════════════
async function handleAnalyze(data) {
  const { birthDate, birthTime, birthPlace, bloodType, name, gender, events, question } = data;

  const system = `คุณคือนักวิเคราะห์ชีวิตของ ASTROVERA

CRITICAL: ตอบเป็น JSON object เท่านั้น ห้ามมี text นำหน้า ห้ามมี markdown ห้ามมี backtick ห้ามมีคำอธิบายใดๆ
เริ่มต้นด้วย { และจบด้วย } เท่านั้น

ตอบตาม schema นี้เสมอ:
{"userType":"archetype EN","userTypeTh":"archetype TH","description":"คำอธิบาย 1-2 ประโยค","lifePhase":"phase name","lifePhaseDesc":"phase desc","elements":{"fire":70,"earth":50,"air":45,"water":35},"strengths":["จุดแข็ง 1","จุดแข็ง 2","จุดแข็ง 3","จุดแข็ง 4"],"blindspot":["จุดระวัง 1","จุดระวัง 2","จุดระวัง 3"],"advice":"คำแนะนำ 2-3 ประโยค","reflectionQuestions":["คำถาม 1","คำถาม 2","คำถาม 3"],"journalPrompt":"prompt journal","lifePathNum":7,"lifePathMeaning":"ความหมายเลขชีวิต"}

กฎ: ใช้ "มีแนวโน้ม" "มักจะ" แทน "จะ" "ต้อง" — วิเคราะห์จากข้อมูลจริงที่ให้มา`;

  let userContent = `วิเคราะห์ชีวิตสำหรับ:\n`;
  if (name)       userContent += `ชื่อ: ${name}\n`;
  if (gender)     userContent += `เพศ: ${gender}\n`;
  if (birthDate)  userContent += `วันเกิด: ${birthDate}\n`;
  if (birthTime)  userContent += `เวลาเกิด: ${birthTime}\n`;
  if (birthPlace) userContent += `สถานที่เกิด: ${birthPlace}\n`;
  if (bloodType)  userContent += `กรุ๊ปเลือด: ${bloodType}\n`;
  if (events && Object.keys(events).length > 0) {
    userContent += `เหตุการณ์: ${JSON.stringify(events)}\n`;
  }
  if (question) userContent += `คำถามเพิ่มเติม: ${question}\n`;

  try {
    const raw = await callClaude(system, userContent, 1024);

    // ── พยายาม extract JSON หลายวิธี ──
    let result = null;

    // วิธี 1: strip markdown fences แล้ว parse ตรงๆ
    try {
      const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      result = JSON.parse(clean);
    } catch(_) {}

    // วิธี 2: หา { ... } block แรกใน text
    if (!result) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { result = JSON.parse(match[0]); } catch(_) {}
      }
    }

    // วิธี 3: ถ้ายังไม่ได้ — log raw แล้ว throw
    if (!result) {
      console.error('Claude raw response:', raw.substring(0, 500));
      throw new Error('JSON parse failed');
    }

    result.timestamp = new Date().toISOString();
    result.birthInfo = { birthDate, birthTime, birthPlace, bloodType };

    return { success: true, data: result, message: 'วิเคราะห์ตัวตนสำเร็จ! 🌟' };

  } catch(e) {
    console.error('handleAnalyze error:', e.message);
    return {
      success: false,
      message: 'วิเคราะห์ไม่สำเร็จ: ' + e.message
    };
  }
}

// ════════════════════════════════════════
// 2. AI ADVISOR / SCENARIO — Claude จริง
// ════════════════════════════════════════
async function handleAIScenario(data) {
  const { question, options, userType, lifePhase, context } = data;

  const system = `คุณคือที่ปรึกษาชีวิตเชิงกลยุทธ์ของ ASTROVERA
ตอบเป็น JSON ที่ valid เท่านั้น ตาม schema:
{
  "summary": "สรุปสถานการณ์ 1-2 ประโยค",
  "recommendations": ["แนะนำ 1","แนะนำ 2","แนะนำ 3"],
  "scenarios": [
    {"name":"ทางเลือก A","description":"...","pros":["..."],"cons":["..."],"successRate":0-100},
    {"name":"ทางเลือก B","description":"...","pros":["..."],"cons":["..."],"successRate":0-100},
    {"name":"ทางเลือก C","description":"...","pros":["..."],"cons":["..."],"successRate":0-100}
  ],
  "decisionFactors": {"risk":"ต่ำ/กลาง/สูง","reward":"ต่ำ/กลาง/สูง","timeframe":"...","alignment":"..."}
}
ใช้คำว่า "มีแนวโน้ม" "ควรพิจารณา" ไม่ใช่ "จะ" หรือ "ต้อง"`;

  const userMsg = `Profile: ${userType || 'ไม่ระบุ'}, Phase: ${lifePhase || 'ไม่ระบุ'}
คำถาม: ${question || 'ช่วยวิเคราะห์สถานการณ์ของฉัน'}
ตัวเลือกที่พิจารณา: ${options ? JSON.stringify(options) : 'ยังไม่ระบุ'}`;

  try {
    const raw = await callClaude(system, userMsg, 1024);
    const result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return { success: true, data: result, message: 'วิเคราะห์สถานการณ์สำเร็จ' };
  } catch(e) {
    return { success: false, message: 'วิเคราะห์ไม่สำเร็จ: ' + e.message };
  }
}

// ════════════════════════════════════════
// 3. VERA CHAT — Claude จริง
// ════════════════════════════════════════
async function handleVERAChat(data) {
  const { question, history, userProfile } = data;

  const p = userProfile || {};
  const system = `คุณคือ VERA — Life Copilot ของ ASTROVERA
ข้อมูลผู้ใช้: Archetype=${p.archetype||'ไม่ระบุ'}, Phase=${p.phase||'ไม่ระบุ'}, จุดแข็ง=${(p.strengths||[]).join(',')||'ไม่ระบุ'}
ตอบภาษาไทยเป็นธรรมชาติ อบอุ่น เหมือนเพื่อนที่รู้จักผู้ใช้ดี
ความยาว: สั้น-กลาง (2-4 ประโยค) เว้นแต่ต้องการรายละเอียด
ห้ามใช้ bullet point ห้ามทำนาย ใช้ "มีแนวโน้ม" แทน`;

  const messages = [
    ...((history || []).slice(-6)),
    { role: 'user', content: question || 'สวัสดี' }
  ];

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY ยังไม่ได้ตั้งค่า');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system,
        messages
      })
    });

    if (!res.ok) throw new Error(await res.text());
    const d = await res.json();
    const answer = d.content?.[0]?.text || 'ขอโทษครับ ไม่สามารถตอบได้ตอนนี้';

    return {
      success: true,
      data: { answer, question, timestamp: new Date().toISOString() },
      message: 'ตอบกลับสำเร็จ'
    };
  } catch(e) {
    return { success: false, message: 'VERA ตอบไม่ได้: ' + e.message };
  }
}

// ════════════════════════════════════════
// 4. SAVE DECISION (localStorage-based, no DB)
// ════════════════════════════════════════
async function handleSaveDecision(data) {
  const { decisionData, userId } = data;
  if (!decisionData?.title) {
    return { success: false, message: 'กรุณาระบุหัวข้อการตัดสินใจ' };
  }
  const now = Date.now();
  const saved = {
    id:          now.toString(),
    userId:      userId || 'guest',
    title:       decisionData.title,
    description: decisionData.description || '',
    category:    decisionData.category    || 'ทั่วไป',
    confidence:  decisionData.confidence  || 5,
    status:      'active',
    createdAt:   new Date().toISOString(),
    followUp: {
      day30:  new Date(now + 30  * 86400000).toISOString(),
      day90:  new Date(now + 90  * 86400000).toISOString(),
      day180: new Date(now + 180 * 86400000).toISOString(),
      day365: new Date(now + 365 * 86400000).toISOString()
    }
  };
  return { success: true, data: saved, message: 'บันทึกการตัดสินใจสำเร็จ! 🎯' };
}

// ════════════════════════════════════════
// 5. SAVE JOURNAL
// ════════════════════════════════════════
async function handleSaveJournal(data) {
  const { journalData, userId } = data;
  if (!journalData?.content) {
    return { success: false, message: 'กรุณาเขียนเนื้อหา Journal' };
  }
  const saved = {
    id:        Date.now().toString(),
    userId:    userId || 'guest',
    content:   journalData.content,
    mood:      journalData.mood  || 'neutral',
    tags:      journalData.tags  || [],
    createdAt: new Date().toISOString()
  };
  return { success: true, data: saved, message: 'บันทึก Journal สำเร็จ! 📝' };
}

// ════════════════════════════════════════
// 6. SAVE FOLLOW-UP
// ════════════════════════════════════════
async function handleSaveFollowUp(data) {
  const { followUpData, userId } = data;
  if (!followUpData?.decisionId) {
    return { success: false, message: 'กรุณาระบุ decisionId' };
  }
  const saved = {
    id:          Date.now().toString(),
    userId:      userId || 'guest',
    decisionId:  followUpData.decisionId,
    status:      followUpData.status     || 'pending',
    reflection:  followUpData.reflection || '',
    scheduledAt: followUpData.scheduledAt || new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt:   new Date().toISOString()
  };
  return { success: true, data: saved, message: 'บันทึกการติดตามผลสำเร็จ! 📅' };
}

// ════════════════════════════════════════
// 7. GET STATS
// ════════════════════════════════════════
async function handleGetStats(data) {
  // stats คำนวณบน client จาก localStorage เป็นหลัก
  // function นี้ไว้รองรับ future Supabase sync
  return {
    success: true,
    data: {
      overview:       { totalDecisions: 0, totalJournals: 0, totalFollowUps: 0, completionRate: 0 },
      patterns:       { topCategories: [], bestTime: '', confidenceTrend: '0%' },
      growth:         { insights: 0, lessons: 0, milestones: 0 },
      recentActivity: []
    },
    message: 'โหลดสถิติสำเร็จ 📊'
  };
}

// ════════════════════════════════════════
// 8. SYNC
// ════════════════════════════════════════
async function handleSync(data) {
  const { userId, data: syncData } = data;
  return {
    success: true,
    data: {
      syncedAt: new Date().toISOString(),
      userId:   userId || 'guest',
      items: {
        decisions: syncData?.decisions?.length || 0,
        journals:  syncData?.journals?.length  || 0,
        followups: syncData?.followups?.length || 0
      }
    },
    message: 'ซิงค์ข้อมูลสำเร็จ 🔄'
  };
}

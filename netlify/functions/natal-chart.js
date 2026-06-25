// netlify/functions/natal-chart.js
// เชื่อมต่อกับ Supabase และ DeepSeek API

// ตั้งค่า Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    let requestData = {};
    let action = 'analyze';
    
    if (event.httpMethod === 'POST' && event.body) {
      requestData = JSON.parse(event.body);
      action = requestData.action || 'analyze';
    }

    let result;
    switch (action) {
      case 'analyze':
        result = await handleAnalyzeWithDeepSeek(requestData);
        break;
      case 'save_decision':
        result = await handleSaveDecisionToSupabase(requestData);
        break;
      case 'save_journal':
        result = await handleSaveJournalToSupabase(requestData);
        break;
      case 'save_followup':
        result = await handleSaveFollowUpToSupabase(requestData);
        break;
      case 'ask_vera':
        result = await handleAskVERAWithDeepSeek(requestData);
        break;
      case 'sync_decisions':
        result = await handleSyncDecisionsToSupabase(requestData);
        break;
      case 'save_push_subscription':
        result = await handleSavePushSubscriptionToSupabase(requestData);
        break;
      default:
        result = { success: false, message: 'Unknown action' };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to process request'
      })
    };
  }
};

// ============ ฟังก์ชันเชื่อมต่อ Supabase ============

async function getSupabaseClient() {
  // ใช้ Supabase client แบบ REST (ไม่ต้องติดตั้ง library)
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ============ ฟังก์ชันเชื่อมต่อ DeepSeek ============

async function callDeepSeekAPI(prompt, systemPrompt = '') {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'คุณคือผู้เชี่ยวชาญด้านโหราศาสตร์ จิตวิทยา และการพัฒนาตนเอง'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ============ ฟังก์ชันหลัก ============

// 1. วิเคราะห์ด้วย DeepSeek + Supabase
async function handleAnalyzeWithDeepSeek(data) {
  try {
    const { birthDate, birthTime, birthPlace, bloodType, userId } = data;

    // 1. ดึงข้อมูลผู้ใช้จาก Supabase (ถ้ามี)
    let userData = null;
    if (userId) {
      const supabase = await getSupabaseClient();
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && existingUser) {
        userData = existingUser;
      }
    }

    // 2. สร้าง Prompt สำหรับ DeepSeek
    const prompt = `
      วิเคราะห์ชะตาชีวิตจากข้อมูลต่อไปนี้:
      - วันเกิด: ${birthDate}
      - เวลาเกิด: ${birthTime}
      - สถานที่เกิด: ${birthPlace}
      - กรุ๊ปเลือด: ${bloodType}
      ${userData ? `- ข้อมูลเพิ่มเติม: ${JSON.stringify(userData)}` : ''}

      กรุณาวิเคราะห์ตามหัวข้อ:
      1. ประเภทบุคลิกภาพ (Visionary Builder, Strategic Thinker, Creative Innovator, หรืออื่นๆ)
      2. จุดแข็งและจุดอ่อน
      3. จังหวะชีวิตในปัจจุบัน
      4. คำแนะนำในการพัฒนา
      5. คำถามชวนคิด 3 ข้อ
      6. Journal Prompt 1 ข้อ

      ตอบในรูปแบบ JSON เท่านั้น
    `;

    const systemPrompt = `
      คุณคือ ASTROVERA ผู้เชี่ยวชาญด้านการวิเคราะห์ชีวิตด้วยศาสตร์แห่งดวงดาว มิติพลังงาน และจิตวิทยา
      ตอบในรูปแบบ JSON ที่มี key ดังนี้:
      {
        "userType": "ชื่อประเภทบุคลิกภาพ",
        "description": "คำอธิบายสั้น",
        "lifePhase": "จังหวะชีวิตปัจจุบัน",
        "strengths": ["จุดแข็ง 1", "จุดแข็ง 2", "จุดแข็ง 3"],
        "weaknesses": ["จุดอ่อน 1", "จุดอ่อน 2"],
        "advice": "คำแนะนำ",
        "reflectionQuestions": ["คำถาม 1", "คำถาม 2", "คำถาม 3"],
        "journalPrompt": "หัวข้อ Journal"
      }
    `;

    // 3. เรียก DeepSeek API
    const analysisResult = await callDeepSeekAPI(prompt, systemPrompt);
    const parsedResult = JSON.parse(analysisResult);

    // 4. บันทึกผลลัพธ์ลง Supabase
    const supabase = await getSupabaseClient();
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId || null,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_place: birthPlace,
        blood_type: bloodType,
        result: parsedResult,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving to Supabase:', saveError);
    }

    // 5. ส่งผลลัพธ์กลับ
    return {
      success: true,
      data: {
        ...parsedResult,
        userId: userId || null,
        analysisId: savedAnalysis?.id || null,
        timestamp: new Date().toISOString()
      },
      message: 'วิเคราะห์สำเร็จ'
    };

  } catch (error) {
    console.error('Error in analyze with DeepSeek:', error);
    return {
      success: false,
      message: error.message || 'Analysis failed'
    };
  }
}

// 2. บันทึกการตัดสินใจลง Supabase
async function handleSaveDecisionToSupabase(data) {
  try {
    const { userId, decisionData } = data;
    const supabase = await getSupabaseClient();

    const { data: savedDecision, error } = await supabase
      .from('decisions')
      .insert({
        user_id: userId || null,
        title: decisionData.title,
        description: decisionData.description,
        category: decisionData.category || 'ทั่วไป',
        confidence: decisionData.confidence || 5,
        expected_outcome: decisionData.expectedOutcome,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // ถ้ามีการวิเคราะห์เพิ่มเติมด้วย DeepSeek
    let analysis = null;
    if (decisionData.title) {
      const prompt = `
        วิเคราะห์การตัดสินใจนี้:
        - หัวข้อ: ${decisionData.title}
        - รายละเอียด: ${decisionData.description || 'ไม่มี'}
        - หมวดหมู่: ${decisionData.category || 'ทั่วไป'}
        - ความมั่นใจ: ${decisionData.confidence || 5}/10

        ให้คำแนะนำและมุมมองในการตัดสินใจนี้
      `;
      analysis = await callDeepSeekAPI(prompt);
    }

    return {
      success: true,
      data: {
        ...savedDecision,
        analysis: analysis
      },
      message: 'บันทึกการตัดสินใจสำเร็จ'
    };

  } catch (error) {
    console.error('Error saving decision:', error);
    return {
      success: false,
      message: error.message || 'Failed to save decision'
    };
  }
}

// 3. บันทึก Journal ลง Supabase
async function handleSaveJournalToSupabase(data) {
  try {
    const { userId, journalData } = data;
    const supabase = await getSupabaseClient();

    const { data: savedJournal, error } = await supabase
      .from('journals')
      .insert({
        user_id: userId || null,
        content: journalData.content,
        mood: journalData.mood || 'neutral',
        tags: journalData.tags || [],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: savedJournal,
      message: 'บันทึก Journal สำเร็จ'
    };

  } catch (error) {
    console.error('Error saving journal:', error);
    return {
      success: false,
      message: error.message || 'Failed to save journal'
    };
  }
}

// 4. บันทึกการติดตามผล
async function handleSaveFollowUpToSupabase(data) {
  try {
    const { userId, followUpData } = data;
    const supabase = await getSupabaseClient();

    const { data: savedFollowUp, error } = await supabase
      .from('followups')
      .insert({
        user_id: userId || null,
        decision_id: followUpData.decisionId,
        status: followUpData.status || 'pending',
        result: followUpData.result || null,
        reflection: followUpData.reflection || null,
        scheduled_at: followUpData.scheduledAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: savedFollowUp,
      message: 'บันทึกการติดตามผลสำเร็จ'
    };

  } catch (error) {
    console.error('Error saving follow-up:', error);
    return {
      success: false,
      message: error.message || 'Failed to save follow-up'
    };
  }
}

// 5. VERA AI Chat ด้วย DeepSeek
async function handleAskVERAWithDeepSeek(data) {
  try {
    const { userId, question } = data;

    // ดึงข้อมูลผู้ใช้จาก Supabase เพื่อใช้เป็น Context
    let userContext = '';
    if (userId) {
      const supabase = await getSupabaseClient();
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userData) {
        userContext = `ข้อมูลผู้ใช้: ${JSON.stringify(userData)}`;
      }
    }

    const prompt = `
      ${userContext}
      
      คำถาม: ${question}

      กรุณาตอบในฐานะ VERA ผู้ช่วยชีวิตที่เข้าใจผู้ใช้และให้คำแนะนำที่มีประโยชน์
    `;

    const systemPrompt = `
      คุณคือ VERA ผู้ช่วยชีวิตของ ASTROVERA
      มีบุคลิกที่อบอุ่น เข้าใจผู้อื่น ให้คำแนะนำที่มีประโยชน์และสร้างแรงบันดาลใจ
      ตอบด้วยภาษาไทยที่เป็นธรรมชาติ
    `;

    const answer = await callDeepSeekAPI(prompt, systemPrompt);

    return {
      success: true,
      answer: answer,
      question: question,
      userId: userId || null,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in VERA chat:', error);
    return {
      success: false,
      message: error.message || 'Failed to process question'
    };
  }
}

// 6. ซิงค์ข้อมูลขึ้น Supabase
async function handleSyncDecisionsToSupabase(data) {
  try {
    const { userId, decisions } = data;
    const supabase = await getSupabaseClient();

    const results = [];
    for (const decision of decisions) {
      const { data: saved, error } = await supabase
        .from('decisions')
        .insert({
          user_id: userId || null,
          title: decision.title,
          description: decision.description,
          category: decision.category || 'ทั่วไป',
          confidence: decision.confidence || 5,
          expected_outcome: decision.expectedOutcome,
          created_at: decision.timestamp || new Date().toISOString()
        })
        .select()
        .single();

      if (!error) {
        results.push(saved);
      }
    }

    return {
      success: true,
      data: {
        synced: results.length,
        total: decisions.length
      },
      message: 'ซิงค์ข้อมูลสำเร็จ'
    };

  } catch (error) {
    console.error('Error syncing decisions:', error);
    return {
      success: false,
      message: error.message || 'Failed to sync decisions'
    };
  }
}

// 7. บันทึก Push Subscription
async function handleSavePushSubscriptionToSupabase(data) {
  try {
    const { userId, subscription } = data;
    const supabase = await getSupabaseClient();

    const { data: savedSubscription, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId || null,
        subscription: subscription,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: savedSubscription,
      message: 'บันทึก Push Subscription สำเร็จ'
    };

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return {
      success: false,
      message: error.message || 'Failed to save push subscription'
    };
  }
}

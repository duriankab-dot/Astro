// netlify/functions/natal-chart.js
// ใช้ CommonJS แทน ESM (ใช้ require และ exports)

// ตั้งค่า Environment Variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// ใช้ exports.handler แทน export const handler
exports.handler = async function(event, context) {
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
        result = await handleAnalyze(requestData);
        break;
      case 'save_decision':
        result = await handleSaveDecision(requestData);
        break;
      case 'save_journal':
        result = await handleSaveJournal(requestData);
        break;
      case 'save_followup':
        result = await handleSaveFollowUp(requestData);
        break;
      case 'ask_vera':
        result = await handleAskVERA(requestData);
        break;
      case 'sync_decisions':
        result = await handleSyncDecisions(requestData);
        break;
      case 'save_push_subscription':
        result = await handleSavePushSubscription(requestData);
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

// ============ ฟังก์ชันหลัก (Mock) ============

// 1. วิเคราะห์ข้อมูล
async function handleAnalyze(data) {
  try {
    const { birthDate, birthTime, birthPlace, bloodType } = data;

    const result = {
      userType: 'The Visionary Builder',
      description: 'ผู้นำแห่งการเปลี่ยนแปลง · ชอบริเริ่ม · เห็นภาพใหญ่แต่ทำได้จริง',
      lifePhase: 'ช่วงสร้าง · Building Phase',
      strengths: ['มองการณ์ไกล', 'คิดสร้างสรรค์', 'ลงมือทำ'],
      weaknesses: ['ใจร้อน', 'ละเลยรายละเอียด'],
      advice: 'ลองโฟกัสที่กระบวนการมากกว่าผลลัพธ์',
      reflectionQuestions: [
        'อะไรคือสิ่งที่คุณกลัวที่สุดในตอนนี้?',
        'ถ้ารู้ว่าคำตอบอยู่แล้ว คุณกำลังรออะไร?',
        'อะไรคือก้าวเล็กๆ ที่ทำได้วันนี้?'
      ],
      journalPrompt: 'เขียนถึงตัวเองในอนาคต 1 ปีข้างหน้า'
    };

    return {
      success: true,
      data: {
        ...result,
        birthInfo: { birthDate, birthTime, birthPlace, bloodType },
        timestamp: new Date().toISOString()
      },
      message: 'วิเคราะห์สำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Analysis failed'
    };
  }
}

// 2. บันทึกการตัดสินใจ
async function handleSaveDecision(data) {
  try {
    const { decisionData } = data;
    
    return {
      success: true,
      data: {
        id: Date.now(),
        ...decisionData,
        timestamp: new Date().toISOString()
      },
      message: 'บันทึกการตัดสินใจสำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to save decision'
    };
  }
}

// 3. บันทึก Journal
async function handleSaveJournal(data) {
  try {
    const { journalData } = data;
    
    return {
      success: true,
      data: {
        id: Date.now(),
        ...journalData,
        timestamp: new Date().toISOString()
      },
      message: 'บันทึก Journal สำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to save journal'
    };
  }
}

// 4. บันทึกการติดตามผล
async function handleSaveFollowUp(data) {
  try {
    const { followUpData } = data;
    
    return {
      success: true,
      data: {
        id: Date.now(),
        ...followUpData,
        timestamp: new Date().toISOString(),
        followUpSchedule: {
          day30: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          day90: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          day180: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          day365: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      message: 'บันทึกการติดตามผลสำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to save follow-up'
    };
  }
}

// 5. VERA AI Chat
async function handleAskVERA(data) {
  try {
    const { question } = data;
    
    const responses = {
      'สวัสดี': 'สวัสดีครับ/ค่ะ ฉันคือ VERA ผู้ช่วยชีวิตของคุณ มีอะไรให้ช่วยไหม?',
      'ควรโฟกัสอะไร': 'จากข้อมูลของคุณ ช่วงนี้ควรโฟกัสที่การสร้างรากฐานที่แข็งแกร่ง',
      'วันนี้รู้สึกเหนื่อย': 'เข้าใจค่ะ ลองพักผ่อนสัก 5 นาที แล้วกลับมาใหม่นะคะ',
      'default': 'ขอบคุณสำหรับคำถามครับ/ค่ะ ฉันกำลังเรียนรู้ที่จะตอบคำถามนี้ให้ดีขึ้น'
    };

    const answer = responses[question] || responses.default;

    return {
      success: true,
      answer: answer,
      question: question,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to process question'
    };
  }
}

// 6. ซิงค์ข้อมูล
async function handleSyncDecisions(data) {
  try {
    const { decisions } = data;
    
    return {
      success: true,
      data: {
        synced: decisions?.length || 0,
        timestamp: new Date().toISOString()
      },
      message: 'ซิงค์ข้อมูลสำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to sync decisions'
    };
  }
}

// 7. บันทึก Push Subscription
async function handleSavePushSubscription(data) {
  try {
    const { subscription } = data;
    
    return {
      success: true,
      data: {
        ...subscription,
        savedAt: new Date().toISOString()
      },
      message: 'บันทึก Push Subscription สำเร็จ'
    };

  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to save push subscription'
    };
  }
}

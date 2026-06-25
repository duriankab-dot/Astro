// netlify/functions/natal-chart.js
// รองรับการทำงานครบวงจรสำหรับ ASTROVERA

export const handler = async (event, context) => {
  // ตั้งค่า CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // จัดการ OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // รับข้อมูลจาก request
    let requestData = {};
    let action = 'analyze'; // default action
    
    if (event.httpMethod === 'POST' && event.body) {
      requestData = JSON.parse(event.body);
      action = requestData.action || 'analyze';
    }

    // รับ query parameters (ถ้าเป็น GET)
    const queryParams = event.queryStringParameters || {};
    if (event.httpMethod === 'GET' && queryParams.action) {
      action = queryParams.action;
    }

    // จัดการตาม action
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
        result = {
          success: false,
          message: 'Unknown action'
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Error in natal-chart function:', error);

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

// ฟังก์ชันวิเคราะห์ตัวตน
async function handleAnalyze(data) {
  try {
    // จำลองการวิเคราะห์ (ในระบบจริงจะเชื่อมต่อกับ API ภายนอก)
    const birthDate = data.birthDate || '1990-01-01';
    const birthTime = data.birthTime || '12:00';
    const birthPlace = data.birthPlace || 'Bangkok';
    const bloodType = data.bloodType || 'O';

    // ข้อมูลตัวอย่าง (ในระบบจริงจะคำนวณจากข้อมูล)
    const analysisResult = {
      success: true,
      data: {
        userType: 'The Visionary Builder',
        description: 'ผู้นำแห่งการเปลี่ยนแปลง · ชอบริเริ่ม · เห็นภาพใหญ่แต่ทำได้จริง',
        lifePhase: 'ช่วงสร้าง · Building Phase',
        analysisLayers: {
          meaning: 'คุณมีพลังงานของนักสร้างที่มีวิสัยทัศน์ ผสมผสานความสามารถในการมองภาพใหญ่กับการลงมือทำ',
          feeling: 'ลึกลงไป คุณอาจกำลังมองหาความหมายในสิ่งที่ทำ',
          question: 'ถ้าคุณรู้อยู่แล้วว่าคำตอบคืออะไร คุณกำลังรอสิ่งใดอยู่?',
          action: 'เลือกโปรเจกต์ที่ใช้ทั้งวิสัยทัศน์และการลงมือทำภายในเดือนนี้',
          journal: 'เขียนถึงเวอร์ชั่นของตัวเองในอีก 1 ปี'
        },
        birthInfo: {
          date: birthDate,
          time: birthTime,
          place: birthPlace,
          bloodType: bloodType
        },
        timestamp: new Date().toISOString()
      }
    };

    // ถ้ามี Premium ให้เพิ่มข้อมูลเพิ่มเติม
    if (data.premium) {
      analysisResult.data.premiumLayers = {
        layer3: 'ข้อมูลชั้นที่ 3 สำหรับพรีเมียม',
        layer4: 'ข้อมูลชั้นที่ 4 สำหรับพรีเมียม',
        layer5: 'ข้อมูลชั้นที่ 5 สำหรับพรีเมียม',
        layer6: 'ข้อมูลชั้นที่ 6 สำหรับพรีเมียม'
      };
    }

    return analysisResult;

  } catch (error) {
    console.error('Error in analyze:', error);
    return {
      success: false,
      message: 'Analysis failed'
    };
  }
}

// ฟังก์ชันบันทึกการตัดสินใจ
async function handleSaveDecision(data) {
  try {
    const decisionData = data.data || {};
    
    // บันทึกข้อมูล (ในระบบจริงจะบันทึกลง Database)
    const savedDecision = {
      id: Date.now(),
      ...decisionData,
      timestamp: new Date().toISOString(),
      status: 'saved'
    };

    return {
      success: true,
      data: savedDecision,
      message: 'บันทึกการตัดสินใจสำเร็จ'
    };

  } catch (error) {
    console.error('Error saving decision:', error);
    return {
      success: false,
      message: 'Failed to save decision'
    };
  }
}

// ฟังก์ชันบันทึก Journal
async function handleSaveJournal(data) {
  try {
    const journalData = data.data || {};
    
    const savedJournal = {
      id: Date.now(),
      ...journalData,
      timestamp: new Date().toISOString(),
      status: 'saved'
    };

    return {
      success: true,
      data: savedJournal,
      message: 'บันทึก Journal สำเร็จ'
    };

  } catch (error) {
    console.error('Error saving journal:', error);
    return {
      success: false,
      message: 'Failed to save journal'
    };
  }
}

// ฟังก์ชันบันทึกการติดตามผล
async function handleSaveFollowUp(data) {
  try {
    const followUpData = data.data || {};
    
    const savedFollowUp = {
      id: Date.now(),
      ...followUpData,
      timestamp: new Date().toISOString(),
      status: 'saved'
    };

    return {
      success: true,
      data: savedFollowUp,
      message: 'บันทึกการติดตามผลสำเร็จ',
      followUpSchedule: {
        day30: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        day90: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        day180: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        day365: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

  } catch (error) {
    console.error('Error saving follow-up:', error);
    return {
      success: false,
      message: 'Failed to save follow-up'
    };
  }
}

// ฟังก์ชัน VERA AI Chat
async function handleAskVERA(data) {
  try {
    const question = data.question || 'สวัสดี';
    
    // จำลองการตอบ (ในระบบจริงจะใช้ AI)
    const responses = {
      'สวัสดี': 'สวัสดีครับ/ค่ะ ฉันคือ VERA ผู้ช่วยชีวิตของคุณ มีอะไรให้ช่วยไหม?',
      'ควรโฟกัสอะไร': 'จากข้อมูลของคุณ ช่วงนี้ควรโฟกัสที่การสร้างรากฐานที่แข็งแกร่ง และอย่าลืมดูแลสุขภาพกายและใจไปด้วย',
      'วันนี้รู้สึกเหนื่อย': 'เข้าใจค่ะ การพักผ่อนเป็นสิ่งสำคัญ ลองทำสมาธิสัก 5 นาที หรือเดินเล่นสูดอากาศบริสุทธิ์ดูนะคะ',
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
    console.error('Error in VERA chat:', error);
    return {
      success: false,
      message: 'Failed to process question'
    };
  }
}

// ฟังก์ชันซิงค์ข้อมูล
async function handleSyncDecisions(data) {
  try {
    const decisions = data.data || [];
    
    // ในระบบจริงจะบันทึกลง Database
    const syncResult = {
      synced: decisions.length,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: syncResult,
      message: 'ซิงค์ข้อมูลสำเร็จ'
    };

  } catch (error) {
    console.error('Error syncing decisions:', error);
    return {
      success: false,
      message: 'Failed to sync decisions'
    };
  }
}

// ฟังก์ชันบันทึก Push Subscription
async function handleSavePushSubscription(data) {
  try {
    const subscription = data.data || {};
    
    // ในระบบจริงจะบันทึก Subscription ลง Database
    const savedSubscription = {
      ...subscription,
      savedAt: new Date().toISOString()
    };

    return {
      success: true,
      data: savedSubscription,
      message: 'บันทึก Push Subscription สำเร็จ'
    };

  } catch (error) {
    console.error('Error saving push subscription:', error);
    return {
      success: false,
      message: 'Failed to save push subscription'
    };
  }
}

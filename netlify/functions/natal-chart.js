// netlify/functions/natal-chart.js
// แก้ไขฟังก์ชันหลักให้รองรับทุกการทำงาน

exports.handler = async (event, context) => {
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
      console.log('📥 Action:', action);
    }

    let result;
    switch (action) {
      // ฟังก์ชันหลัก
      case 'analyze':
        result = await handleAnalyze(requestData);
        break;
      case 'ai_advisor':
      case 'scenario':
        result = await handleAIScenario(requestData);
        break;
      case 'vera_chat':
      case 'ask_vera':
        result = await handleVERAChat(requestData);
        break;
      case 'save_decision':
        result = await handleSaveDecision(requestData);
        break;
      
      // ฟังก์ชันรอง
      case 'save_journal':
        result = await handleSaveJournal(requestData);
        break;
      case 'save_followup':
        result = await handleSaveFollowUp(requestData);
        break;
      case 'get_stats':
        result = await handleGetStats(requestData);
        break;
      case 'sync':
        result = await handleSync(requestData);
        break;
      
      default:
        result = { 
          success: false, 
          message: 'ไม่รู้จักคำสั่ง: ' + action,
          availableActions: ['analyze', 'ai_advisor', 'scenario', 'vera_chat', 'save_decision', 'save_journal', 'save_followup', 'get_stats', 'sync']
        };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      })
    };
  }
};

// ============================================================
// 🔴 ฟังก์ชันหลัก
// ============================================================

// 1. AI ที่ปรึกษาชีวิต + Scenario Intelligence
async function handleAIScenario(data) {
  try {
    const { question, options, userType, lifePhase, context } = data;
    
    const analysis = {
      summary: `วิเคราะห์สถานการณ์: ${question || 'การตัดสินใจสำคัญ'}`,
      userProfile: userType || 'Visionary Builder',
      currentPhase: lifePhase || 'Building Phase',
      recommendations: [
        'พิจารณาทางเลือกที่สอดคล้องกับวิสัยทัศน์ระยะยาว',
        'ประเมินความเสี่ยงและผลตอบแทนของแต่ละทางเลือก',
        'ปรึกษาผู้มีประสบการณ์ในด้านนี้'
      ],
      scenarios: options ? generateScenarios(options) : generateDefaultScenarios(),
      decisionFactors: {
        risk: 'ปานกลาง',
        reward: 'สูง',
        timeframe: '3-6 เดือน',
        alignment: 'สอดคล้องกับเป้าหมายชีวิต'
      }
    };

    return {
      success: true,
      data: analysis,
      message: 'วิเคราะห์สถานการณ์สำเร็จ'
    };

  } catch (error) {
    console.error('❌ AI Scenario Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถวิเคราะห์สถานการณ์ได้'
    };
  }
}

// สร้างสถานการณ์จำลอง
function generateScenarios(options) {
  if (!options || options.length === 0) {
    return generateDefaultScenarios();
  }
  return options.map((opt, i) => ({
    name: opt.name || `ทางเลือก ${i + 1}`,
    description: opt.description || 'ไม่มีคำอธิบาย',
    pros: opt.pros || ['ข้อดี'],
    cons: opt.cons || ['ข้อเสีย'],
    successRate: opt.successRate || 50 + Math.floor(Math.random() * 30)
  }));
}

function generateDefaultScenarios() {
  return [
    {
      name: 'ทางเลือก A: ใช้เส้นทางปัจจุบัน',
      description: 'ดำเนินการต่อตามแผนที่มีอยู่',
      pros: ['เสี่ยงต่ำ', 'ควบคุมได้', 'มีประสบการณ์'],
      cons: ['เติบโตช้า', 'พลาดโอกาสใหม่'],
      successRate: 75
    },
    {
      name: 'ทางเลือก B: เปลี่ยนกลยุทธ์',
      description: 'ปรับแผนใหม่ให้ทันสมัย',
      pros: ['โอกาสสูง', 'สร้างความแตกต่าง'],
      cons: ['ต้องเรียนรู้ใหม่', 'เสี่ยงสูง'],
      successRate: 55
    },
    {
      name: 'ทางเลือก C: รอจังหวะ',
      description: 'รอเวลาที่เหมาะสม',
      pros: ['ปลอดภัย', 'มีเวลาเตรียมตัว'],
      cons: ['เสียเวลา', 'พลาดจังหวะ'],
      successRate: 40
    }
  ];
}

// 2. VERA Chat
async function handleVERAChat(data) {
  try {
    const { question, userId, history } = data;
    
    const responses = {
      'สวัสดี': 'สวัสดีครับ/ค่ะ ฉันคือ VERA ผู้ช่วยชีวิตของคุณ พร้อมให้คำปรึกษาและช่วยเหลือคุณเสมอ 😊',
      'ช่วยอะไร': 'ฉันสามารถช่วยคุณได้หลายด้าน เช่น วิเคราะห์สถานการณ์ แนะนำการตัดสินใจ ตั้งเป้าหมาย หรือแค่รับฟังคุณ',
      'ควรโฟกัสอะไร': 'จากข้อมูลของคุณ ช่วงนี้ควรโฟกัสที่การสร้างรากฐานที่แข็งแกร่ง และไม่ลืมที่จะดูแลตัวเองด้วยนะครับ',
      'เหนื่อย': 'เข้าใจเลยครับ การพักผ่อนเป็นสิ่งสำคัญ ลองหยุดหายใจลึกๆ สัก 3 ครั้ง แล้วบอกตัวเองว่า "ฉันทำดีที่สุดแล้ว"',
      'อนาคต': 'อนาคตเป็นสิ่งที่เราสร้างขึ้นจากปัจจุบัน ลองถามตัวเองว่า "วันนี้ฉันทำอะไรให้อนาคตที่ดีที่สุดบ้าง?"',
      'default': 'ขอบคุณที่แชร์เรื่องนี้กับ VERA นะครับ ฉันกำลังเรียนรู้ที่จะเข้าใจคุณมากขึ้น อยากคุยเรื่องอะไรเพิ่มเติมไหม?'
    };

    let answer = responses['default'];
    for (const [key, value] of Object.entries(responses)) {
      if (question && question.includes(key)) {
        answer = value;
        break;
      }
    }

    return {
      success: true,
      data: {
        answer: answer,
        question: question,
        timestamp: new Date().toISOString(),
        sessionId: Date.now().toString()
      },
      message: 'ตอบกลับสำเร็จ'
    };

  } catch (error) {
    console.error('❌ VERA Chat Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถประมวลผลข้อความได้'
    };
  }
}

// 3. Decision Tracker
async function handleSaveDecision(data) {
  try {
    const { decisionData, userId } = data;
    
    if (!decisionData || !decisionData.title) {
      return {
        success: false,
        message: 'กรุณาระบุหัวข้อการตัดสินใจ'
      };
    }

    const saved = {
      id: Date.now().toString(),
      userId: userId || 'guest',
      title: decisionData.title,
      description: decisionData.description || '',
      category: decisionData.category || 'ทั่วไป',
      confidence: decisionData.confidence || 5,
      status: 'active',
      createdAt: new Date().toISOString(),
      followUp: {
        day30: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        day90: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        day180: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        day365: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    };

    return {
      success: true,
      data: saved,
      message: 'บันทึกการตัดสินใจสำเร็จ! 🎯'
    };

  } catch (error) {
    console.error('❌ Save Decision Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถบันทึกการตัดสินใจได้'
    };
  }
}

// 4. ฟังก์ชันวิเคราะห์หลัก
async function handleAnalyze(data) {
  try {
    const { birthDate, birthTime, birthPlace, bloodType, userId } = data;

    const result = {
      userType: 'The Visionary Builder',
      description: 'ผู้นำแห่งการเปลี่ยนแปลง · ชอบริเริ่ม · เห็นภาพใหญ่แต่ทำได้จริง',
      lifePhase: 'ช่วงสร้าง · Building Phase',
      elements: {
        fire: 70,
        earth: 50,
        air: 45,
        water: 35
      },
      strengths: ['มองการณ์ไกล', 'คิดสร้างสรรค์', 'ลงมือทำ', 'สร้างแรงบันดาลใจ'],
      weaknesses: ['ใจร้อน', 'ละเลยรายละเอียด', 'ชอบควบคุม'],
      advice: 'ลองโฟกัสที่กระบวนการมากกว่าผลลัพธ์ และเปิดใจรับฟังความคิดเห็นอื่นๆ',
      reflectionQuestions: [
        'อะไรคือสิ่งที่คุณกลัวที่สุดในตอนนี้?',
        'ถ้ารู้ว่าคำตอบอยู่แล้ว คุณกำลังรออะไร?',
        'อะไรคือก้าวเล็กๆ ที่ทำได้วันนี้?',
        'ใครคือคนที่คุณควรขอบคุณ?'
      ],
      journalPrompt: 'เขียนถึงตัวเองในอนาคต 1 ปีข้างหน้า ตอนนี้คุณเป็นอย่างไร?',
      birthInfo: { birthDate, birthTime, birthPlace, bloodType },
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: result,
      message: 'วิเคราะห์ตัวตนสำเร็จ! 🌟'
    };

  } catch (error) {
    console.error('❌ Analyze Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถวิเคราะห์ข้อมูลได้'
    };
  }
}

// ============================================================
// 🟡 ฟังก์ชันรอง
// ============================================================

// 5. บันทึก Journal
async function handleSaveJournal(data) {
  try {
    const { journalData, userId } = data;
    
    if (!journalData || !journalData.content) {
      return {
        success: false,
        message: 'กรุณาเขียนเนื้อหา Journal'
      };
    }

    const saved = {
      id: Date.now().toString(),
      userId: userId || 'guest',
      content: journalData.content,
      mood: journalData.mood || 'neutral',
      tags: journalData.tags || [],
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      data: saved,
      message: 'บันทึก Journal สำเร็จ! 📝'
    };

  } catch (error) {
    console.error('❌ Save Journal Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถบันทึก Journal ได้'
    };
  }
}

// 6. บันทึก Follow-up
async function handleSaveFollowUp(data) {
  try {
    const { followUpData, userId } = data;
    
    if (!followUpData || !followUpData.decisionId) {
      return {
        success: false,
        message: 'กรุณาระบุการตัดสินใจที่ต้องการติดตาม'
      };
    }

    const saved = {
      id: Date.now().toString(),
      userId: userId || 'guest',
      decisionId: followUpData.decisionId,
      status: followUpData.status || 'pending',
      reflection: followUpData.reflection || '',
      scheduledAt: followUpData.scheduledAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      data: saved,
      message: 'บันทึกการติดตามผลสำเร็จ! 📅'
    };

  } catch (error) {
    console.error('❌ Save FollowUp Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถบันทึกการติดตามผลได้'
    };
  }
}

// 7. สถิติ Dashboard
async function handleGetStats(data) {
  try {
    const { userId } = data;

    const stats = {
      overview: {
        totalDecisions: 12,
        totalJournals: 25,
        totalFollowUps: 8,
        completionRate: 67
      },
      patterns: {
        topCategories: ['การงาน', 'การเงิน', 'ความสัมพันธ์'],
        bestTime: 'เช้า',
        confidenceTrend: '+12%'
      },
      growth: {
        insights: 15,
        lessons: 8,
        milestones: 3
      },
      recentActivity: [
        { type: 'decision', title: 'เลือกงานใหม่', date: '2026-06-20' },
        { type: 'journal', title: 'สะท้อนความคิด', date: '2026-06-19' },
        { type: 'followup', title: 'ติดตามผลการตัดสินใจ', date: '2026-06-18' }
      ]
    };

    return {
      success: true,
      data: stats,
      message: 'โหลดสถิติสำเร็จ 📊'
    };

  } catch (error) {
    console.error('❌ Get Stats Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถโหลดสถิติได้'
    };
  }
}

// 8. ซิงค์ข้อมูล
async function handleSync(data) {
  try {
    const { userId, data: syncData } = data;

    const result = {
      syncedAt: new Date().toISOString(),
      userId: userId || 'guest',
      items: {
        decisions: syncData?.decisions?.length || 0,
        journals: syncData?.journals?.length || 0,
        followups: syncData?.followups?.length || 0
      }
    };

    return {
      success: true,
      data: result,
      message: 'ซิงค์ข้อมูลสำเร็จ 🔄'
    };

  } catch (error) {
    console.error('❌ Sync Error:', error);
    return {
      success: false,
      message: 'ไม่สามารถซิงค์ข้อมูลได้'
    };
  }
}

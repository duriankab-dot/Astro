// ============================================================
// netlify/functions/natal-chart.js
// รวม AI ทั้งหมดเข้าเป็น VERA Ecosystem
// ============================================================

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
      // ============================================================
      // ฟังก์ชันหลัก: VERA Ecosystem (รวมทุกอย่าง)
      // ============================================================
      case 'vera':
        result = await handleVERA(requestData);
        break;
      
      // ============================================================
      // ฟังก์ชันรองที่ยังใช้งาน (อาจค่อยๆ ย้ายไป VERA)
      // ============================================================
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
      case 'get_stats':
        result = await handleGetStats(requestData);
        break;
      case 'sync':
        result = await handleSync(requestData);
        break;
      
      // ============================================================
      // ฟังก์ชันเก่า (DEPRECATED) - จะค่อยๆ เลิกใช้
      // ============================================================
      case 'ai_advisor':
      case 'scenario':
      case 'vera_chat':
      case 'ask_vera':
        result = await handleDeprecatedAction(action, requestData);
        break;
      
      default:
        result = { 
          success: false, 
          message: 'ไม่รู้จักคำสั่ง: ' + action,
          availableActions: ['vera', 'analyze', 'save_decision', 'save_journal', 'save_followup', 'get_stats', 'sync']
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
// 🧠 VERA Ecosystem - ฟังก์ชันหลัก
// ============================================================

async function handleVERA(data) {
  try {
    const { mode, message, context = {} } = data;
    
    // ดึงข้อมูลผู้ใช้จาก Local Storage ที่ส่งมา
    const userContext = {
      userType: context.userType || 'Visionary Builder',
      lifePhase: context.lifePhase || 'Building Phase',
      recentDecisions: context.recentDecisions || [],
      stats: context.stats || {}
    };

    let response = {};

    switch (mode) {
      case 'chat':
        response = await handleVERAChat(message, userContext);
        break;
      case 'analyze':
        response = await handleVERAAnalyze(message, userContext);
        break;
      case 'track':
        response = await handleVERATrack(message, userContext);
        break;
      default:
        response = {
          reply: 'สวัสดีครับ/ค่ะ ฉัน VERA ผู้ช่วยชีวิตของคุณ 🧠\n\nเลือกโหมดที่ต้องการ:\n• 💬 แชท - พูดคุยให้คำปรึกษาทั่วไป\n• 🧠 วิเคราะห์ - วิเคราะห์สถานการณ์เชิงลึก\n• 📊 ติดตาม - สรุปและติดตามความก้าวหน้า',
          mode: 'info'
        };
    }

    return {
      success: true,
      data: response,
      message: 'VERA ตอบกลับแล้ว'
    };

  } catch (error) {
    console.error('❌ VERA Error:', error);
    return {
      success: false,
      message: error.message || 'VERA ไม่สามารถตอบกลับได้'
    };
  }
}

// --- โหมดแชท ---
async function handleVERAChat(message, context) {
  const responses = {
    'สวัสดี': 'สวัสดีครับ/ค่ะ ฉัน VERA ผู้ช่วยชีวิตของคุณ พร้อมให้คำปรึกษาและช่วยเหลือคุณเสมอ 😊\n\nวันนี้มีอะไรให้ฉันช่วยไหม?',
    'ช่วยอะไร': 'ฉันสามารถช่วยคุณได้หลายด้าน:\n• ให้คำปรึกษาเรื่องชีวิตและการงาน\n• วิเคราะห์สถานการณ์และทางเลือก\n• ติดตามความก้าวหน้าและเป้าหมาย\n• รับฟังและสะท้อนความคิด\n\nคุณอยากเริ่มเรื่องอะไรดี?',
    'ควรโฟกัสอะไร': `จากข้อมูลของคุณ (${context.userType}) ช่วงนี้ควรโฟกัสที่การสร้างรากฐานที่แข็งแกร่ง\n\n🎯 3 สิ่งที่แนะนำ:\n1. ตั้งเป้าหมายที่ชัดเจนและวัดผลได้\n2. สร้างระบบการทำงานที่มีประสิทธิภาพ\n3. อย่าลืมดูแลสุขภาพกายและใจ`,
    'เหนื่อย': 'เข้าใจเลยครับ/ค่ะ การพักผ่อนเป็นสิ่งสำคัญ 😌\n\nลองทำตามนี้ดูนะ:\n1. หยุดหายใจลึกๆ 5 ครั้ง\n2. บอกตัวเองว่า "ฉันทำดีที่สุดแล้ว"\n3. หาเวลาพัก 10 นาทีทำสิ่งที่ชอบ\n\nคุณสำคัญมาก อย่าลืมดูแลตัวเองนะครับ/ค่ะ',
    'อนาคต': 'อนาคตเป็นสิ่งที่เราสร้างขึ้นจากปัจจุบัน 🌟\n\nลองถามตัวเองว่า:\n• วันนี้ฉันทำอะไรให้อนาคตที่ดีที่สุดบ้าง?\n• อะไรคือสิ่งที่ฉันอยากให้อนาคตฉันเป็น?\n• ก้าวเล็กๆ ที่ฉันทำได้วันนี้คืออะไร?',
    'default': `ขอบคุณที่แชร์เรื่องนี้กับ VERA นะครับ/ค่ะ 🤗\n\nฉันพร้อมรับฟังและช่วยเหลือคุณเสมอ\n\n${context.userType} อย่างคุณมีจุดแข็งที่ยอดเยี่ยม ลองใช้มันเพื่อสร้างสิ่งที่คุณต้องการดูไหม?`
  };

  let reply = responses['default'];
  for (const [key, value] of Object.entries(responses)) {
    if (message && message.includes(key)) {
      reply = value;
      break;
    }
  }

  return {
    reply: reply,
    mode: 'chat',
    timestamp: new Date().toISOString()
  };
}

// --- โหมดวิเคราะห์เชิงลึก ---
async function handleVERAAnalyze(message, context) {
  // สร้างสถานการณ์จำลองตามบริบท
  const scenarios = [
    {
      name: 'ทางเลือก A: ใช้เส้นทางปัจจุบัน',
      description: 'ดำเนินการต่อตามแผนที่มีอยู่',
      pros: ['เสี่ยงต่ำ', 'ควบคุมได้', 'มีประสบการณ์'],
      cons: ['เติบโตช้า', 'พลาดโอกาสใหม่'],
      successRate: 75
    },
    {
      name: 'ทางเลือก B: ปรับเปลี่ยนกลยุทธ์',
      description: 'ปรับแผนใหม่ให้ทันสมัย',
      pros: ['โอกาสสูง', 'สร้างความแตกต่าง', 'สอดคล้องกับวิสัยทัศน์'],
      cons: ['ต้องเรียนรู้ใหม่', 'เสี่ยงสูงกว่า'],
      successRate: 55
    },
    {
      name: 'ทางเลือก C: รอจังหวะที่เหมาะสม',
      description: 'รอเวลาที่เหมาะสมก่อนตัดสินใจ',
      pros: ['ปลอดภัย', 'มีเวลาเตรียมตัว', 'ได้ข้อมูลเพิ่ม'],
      cons: ['เสียเวลา', 'อาจพลาดจังหวะ'],
      successRate: 40
    }
  ];

  // วิเคราะห์ตามประเภทผู้ใช้
  let analysis = '';
  if (context.userType === 'Visionary Builder') {
    analysis = 'คุณเป็น Visionary Builder มีจุดแข็งในการมองภาพใหญ่และลงมือทำ ทางเลือก B อาจตอบโจทย์คุณที่สุด เพราะสอดคล้องกับธรรมชาติของการสร้างสิ่งใหม่';
  } else {
    analysis = 'จากข้อมูลของคุณ การตัดสินใจควรพิจารณาทั้งความเสี่ยงและผลตอบแทน ทางเลือก A เป็นตัวเลือกที่ปลอดภัย แต่ B อาจให้ผลลัพธ์ที่มากกว่า';
  }

  return {
    reply: `🧠 วิเคราะห์สถานการณ์: "${message || 'การตัดสินใจสำคัญ'}"\n\n${analysis}\n\n📊 สถานการณ์จำลอง:`,
    mode: 'analyze',
    scenarios: scenarios,
    recommendation: 'ลองเริ่มด้วยการทดลองทางเลือก B ในระยะสั้น แล้วประเมินผลก่อนตัดสินใจเต็มรูปแบบ',
    timestamp: new Date().toISOString()
  };
}

// --- โหมดติดตาม ---
async function handleVERATrack(message, context) {
  const stats = context.stats || {};
  const decisions = context.recentDecisions || [];
  
  let progress = 'คุณยังไม่มีข้อมูลการติดตาม';
  let nextSteps = ['เริ่มบันทึกการตัดสินใจ', 'ตั้งเป้าหมายแรกของคุณ', 'ติดตามผลทุก 30 วัน'];
  
  if (decisions.length > 0) {
    progress = `คุณมี ${decisions.length} การตัดสินใจที่บันทึกไว้`;
    nextSteps = [
      'ติดตามผลการตัดสินใจล่าสุด',
      'บันทึกการเรียนรู้จากผลลัพธ์',
      `ครบ 30 วัน: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`
    ];
  }

  return {
    reply: `📊 สรุปความก้าวหน้า\n\n${progress}\n\n🎯 ขั้นตอนต่อไป:`,
    mode: 'track',
    progress: {
      totalDecisions: decisions.length,
      completionRate: stats.completionRate || 0,
      insights: stats.insights || 0
    },
    nextSteps: nextSteps,
    timestamp: new Date().toISOString()
  };
}

// ============================================================
// 🟡 ฟังก์ชันรอง (ยังใช้งาน)
// ============================================================

// วิเคราะห์ตัวตน
async function handleAnalyze(data) {
  try {
    const { birthDate, birthTime, birthPlace, bloodType } = data;

    const result = {
      userType: 'The Visionary Builder',
      description: 'ผู้นำแห่งการเปลี่ยนแปลง · ชอบริเริ่ม · เห็นภาพใหญ่แต่ทำได้จริง',
      lifePhase: 'ช่วงสร้าง · Building Phase',
      strengths: ['มองการณ์ไกล', 'คิดสร้างสรรค์', 'ลงมือทำ', 'สร้างแรงบันดาลใจ'],
      weaknesses: ['ใจร้อน', 'ละเลยรายละเอียด', 'ชอบควบคุม'],
      advice: 'ลองโฟกัสที่กระบวนการมากกว่าผลลัพธ์ และเปิดใจรับฟังความคิดเห็นอื่นๆ',
      reflectionQuestions: [
        'อะไรคือสิ่งที่คุณกลัวที่สุดในตอนนี้?',
        'ถ้ารู้ว่าคำตอบอยู่แล้ว คุณกำลังรออะไร?',
        'อะไรคือก้าวเล็กๆ ที่ทำได้วันนี้?'
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

// บันทึกการตัดสินใจ
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

// บันทึก Journal
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

// บันทึก Follow-up
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

// สถิติ Dashboard
async function handleGetStats(data) {
  try {
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

// ซิงค์ข้อมูล
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

// ============================================================
// ⚠️ ฟังก์ชันเก่า (Deprecated) - แนะนำให้ใช้ VERA แทน
// ============================================================

async function handleDeprecatedAction(action, data) {
  console.warn(`⚠️ Deprecated action: ${action} - กรุณาใช้ VERA แทน`);
  
  // แปลงเป็นรูปแบบ VERA
  let mode = 'chat';
  let message = data.question || data.message || 'สวัสดี';
  
  if (action === 'ai_advisor' || action === 'scenario') {
    mode = 'analyze';
  }
  
  // เรียก VERA แทน
  const result = await handleVERA({
    mode: mode,
    message: message,
    context: data
  });
  
  return result;
}

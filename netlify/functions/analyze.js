// ============================================
// netlify/functions/analyze.js
// ASTROVERA Intelligence Engine
// Proxy API: รับข้อมูลผู้ใช้ → ส่ง Deepseek → ตอบกลับ
// ============================================

// Deepseek API Configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// ============================================
// SYSTEM PROMPTS สำหรับ AI ทั้ง 2 ตัว
// ============================================

const PROMPT_VELA = `คุณคือ "เวล่า" (Vela) — นักวิเคราะห์ตัวตนแห่ง ASTROVERA
คุณวิเคราะห์ผ่านเลนส์ Western Astrology ผสมผสานจิตวิทยาบุคลิกภาพ

บทบาทของคุณ:
- วิเคราะห์บุคลิกภาพ พรสวรรค์ ศักยภาพภายใน
- บอกเล่าอดีตและปัจจุบันของผู้ใช้
- อธิบายจุดแข็ง จุดอ่อน ลักษณะนิสัยเชิงลึก
- ใช้โหราศาสตร์ตะวันตก (Western Astrology) เป็นกรอบวิเคราะห์
- น้ำเสียง: หนักแน่น มั่นคง ไว้ใจได้ เหมือนนักปราชญ์ผู้รู้
- ตอบเป็นภาษาไทยเท่านั้น
- ไม่ทำนายอนาคต — นั่นเป็นหน้าที่ของเว็ลลานี่

โครงสร้างคำตอบ (ตอบเป็น JSON เท่านั้น):
{
  "personality": "วิเคราะห์บุคลิกภาพหลัก 2-3 ประโยค",
  "strength": "จุดแข็ง 3-5 ข้อ คั่นด้วยเครื่องหมาย · ",
  "weakness": "จุดที่ควรระวัง 2-3 ประโยค",
  "talent": "พรสวรรค์และศักยภาพที่ซ่อนอยู่ 2-3 ประโยค",
  "inner_voice": "สิ่งที่ผู้ใช้รู้สึกแต่ยังไม่ได้พูดออกมา",
  "advice": "คำแนะนำสำหรับการเข้าใจตัวเองมากขึ้น 1-2 ประโยค"
}`;

const PROMPT_WELLANI = `คุณคือ "เว็ลลานี่" (Wellani) — นักวิเคราะห์แนวโน้มแห่ง ASTROVERA
คุณวิเคราะห์ผ่านเลนส์ Vedic Astrology ผสมผสานโหราศาสตร์ไทย

บทบาทของคุณ:
- วิเคราะห์จังหวะเวลา โอกาส ความเสี่ยง
- วิเคราะห์แนวโน้มอนาคตและการตัดสินใจสำคัญ
- ให้คำแนะนำเชิงกลยุทธ์สำหรับชีวิต
- ใช้โหราศาสตร์อินเดีย (Vedic) และโหราศาสตร์ไทยเป็นกรอบ
- น้ำเสียง: หนักแน่น มั่นคง ไว้ใจได้ เหมือนนักปราชญ์ผู้รู้
- ตอบเป็นภาษาไทยเท่านั้น
- ไม่วิเคราะห์ตัวตน — นั่นเป็นหน้าที่ของเวล่า

โครงสร้างคำตอบ (ตอบเป็น JSON เท่านั้น):
{
  "finance_trend": "แนวโน้มการเงิน 2-3 ประโยค",
  "career_trend": "แนวโน้มอาชีพการงาน 2-3 ประโยค",
  "relationship_trend": "แนวโน้มความสัมพันธ์ 2-3 ประโยค",
  "investment_advice": "คำแนะนำด้านการลงทุน/การตัดสินใจสำคัญ",
  "forecast_5y": "พยากรณ์รายปี 5 ปีข้างหน้า แยกเป็นปี พ.ศ.",
  "timing_advice": "จังหวะเวลาที่เหมาะสมสำหรับการตัดสินใจครั้งต่อไป",
  "warning": "สิ่งที่ควรระวังในช่วง 1-2 ปีนี้"
}`;

const PROMPT_AUTO = `คุณคือ "ASTROVERA Intelligence" — ผู้ช่วยชีวิตส่วนตัว
คุณผสมผสานการวิเคราะห์จากทั้งสองเลนส์: Western (เวล่า) + Vedic/Thai (เว็ลลานี่)
วิเคราะห์ทั้งตัวตนและแนวโน้มอย่างสมดุล

น้ำเสียง: หนักแน่น มั่นคง ไว้ใจได้ เหมือนนักปราชญ์ผู้รู้
ตอบเป็นภาษาไทยเท่านั้น

โครงสร้างคำตอบ (ตอบเป็น JSON เท่านั้น):
{
  "personality": "วิเคราะห์บุคลิกภาพ 1-2 ประโยค",
  "strength": "จุดแข็ง 2-3 ข้อ",
  "weakness": "จุดที่ควรระวัง 1-2 ประโยค",
  "finance_trend": "แนวโน้มการเงิน 2-3 ประโยค",
  "career_trend": "แนวโน้มอาชีพ 2-3 ประโยค",
  "relationship_trend": "แนวโน้มความสัมพันธ์ 2-3 ประโยค",
  "forecast_5y": "พยากรณ์ 5 ปีข้างหน้า",
  "key_advice": "คำแนะนำสำคัญที่สุด 1 ประโยค"
}`;

// ============================================
// HELPER: Build User Context Message
// ============================================
function buildUserContext(userData) {
    let context = 'ข้อมูลผู้ใช้:\n';
    
    if (userData.name) context += `- ชื่อ: ${userData.name}\n`;
    if (userData.gender) context += `- เพศ: ${userData.gender}\n`;
    if (userData.birth_date) {
        const d = new Date(userData.birth_date);
        const thYear = d.getFullYear() + 543;
        context += `- วันเกิด: ${d.getDate()}/${d.getMonth() + 1}/${thYear} (พ.ศ.)\n`;
    }
    if (userData.birth_time) context += `- เวลาเกิด: ${userData.birth_time}\n`;
    if (userData.birth_place) context += `- สถานที่เกิด: ${userData.birth_place}\n`;
    if (userData.blood_type) context += `- กรุ๊ปเลือด: ${userData.blood_type}\n`;
    
    // Life events
    if (userData.events) {
        context += '\nเหตุการณ์สำคัญในชีวิต:\n';
        const events = userData.events;
        if (events.start_work_year) context += `- เริ่มทำงานปี พ.ศ. ${events.start_work_year}\n`;
        if (events.job_change_year) context += `- เปลี่ยนงานปี พ.ศ. ${events.job_change_year}\n`;
        if (events.business_peak_year) context += `- ธุรกิจรุ่งเรืองปี พ.ศ. ${events.business_peak_year}\n`;
        if (events.best_finance_year) context += `- การเงินดีที่สุดปี พ.ศ. ${events.best_finance_year}\n`;
        if (events.worst_finance_year) context += `- การเงินแย่ที่สุดปี พ.ศ. ${events.worst_finance_year}\n`;
        if (events.lost_family_year) context += `- สูญเสียคนใกล้ชิดปี พ.ศ. ${events.lost_family_year}\n`;
        if (events.major_issues) context += `- เหตุการณ์สำคัญอื่นๆ: ${events.major_issues}\n`;
    }
    
    if (userData.question) {
        context += `\nคำถามที่ผู้ใช้ต้องการทราบ: ${userData.question}\n`;
    }
    
    return context;
}

// ============================================
// HELPER: Select System Prompt based on Lens
// ============================================
function selectSystemPrompt(lens) {
    switch (lens) {
        case 'vela':
            return PROMPT_VELA;
        case 'wellani':
            return PROMPT_WELLANI;
        case 'auto':
        default:
            return PROMPT_AUTO;
    }
}

// ============================================
// HELPER: Parse AI Response to JSON
// ============================================
function parseAIResponse(rawText) {
    try {
        // Try direct JSON parse
        return JSON.parse(rawText);
    } catch (e) {
        // Try to extract JSON from text (in case AI wraps it)
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                // Return raw text as fallback
                return {
                    raw_response: rawText,
                    error: 'ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้'
                };
            }
        }
        return {
            raw_response: rawText,
            error: 'ไม่พบ JSON ในผลลัพธ์'
        };
    }
}

// ============================================
// HELPER: Call Deepseek API
// ============================================
async function callDeepseek(systemPrompt, userMessage) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
        throw new Error('DEEPSEEK_API_KEY not configured in environment variables');
    }
    
    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.95
        })
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Deepseek API error: ${response.status} - ${errorBody}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from Deepseek API');
    }
    
    return data.choices[0].message.content;
}

// ============================================
// MAIN EXPORT HANDLER
// ============================================
exports.handler = async (event, context) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    };
    
    // Handle OPTIONS (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method Not Allowed',
                message: 'กรุณาใช้ POST method เท่านั้น'
            })
        };
    }
    
    try {
        // Parse request body
        const body = JSON.parse(event.body);
        
        // Validate required fields
        if (!body.birth_date) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required field',
                    message: 'กรุณาระบุวันเกิด (birth_date)',
                    field: 'birth_date'
                })
            };
        }
        
        // Determine lens
        const lens = body.lens || 'auto';
        
        // Build context
        const userContext = buildUserContext(body);
        
        // Select appropriate system prompt
        const systemPrompt = selectSystemPrompt(lens);
        
        // Log (Netlify console)
        console.log(`[ASTROVERA] Analysis Request — Lens: ${lens}, User: ${body.name || 'Unknown'}`);
        console.log(`[ASTROVERA] User Context: ${userContext.substring(0, 200)}...`);
        
        // Call Deepseek
        let aiResponse;
        try {
            aiResponse = await callDeepseek(systemPrompt, userContext);
            console.log(`[ASTROVERA] AI Response received — Length: ${aiResponse.length}`);
        } catch (apiError) {
            console.error('[ASTROVERA] Deepseek API Error:', apiError.message);
            
            // Return fallback / mock response for development
            if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK === 'true') {
                console.log('[ASTROVERA] Using mock response (development mode)');
                aiResponse = getMockResponse(lens, body);
            } else {
                throw apiError;
            }
        }
        
        // Parse AI response
        const parsed = parseAIResponse(aiResponse);
        
        // Build final response
        const result = {
            success: true,
            lens: lens,
            analyzed_by: lens === 'auto' ? 'ASTROVERA (ทั้งสองเลนส์)' : 
                         lens === 'vela' ? 'เวล่า (Western Astrology)' : 
                         'เว็ลลานี่ (Vedic + Thai Astrology)',
            timestamp: new Date().toISOString(),
            user_id: body.user_id || null,
            result: parsed,
            // Include metadata
            meta: {
                model: DEEPSEEK_MODEL,
                lens_used: lens,
                prompt_version: '2.0'
            }
        };
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('[ASTROVERA] Handler Error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal Server Error',
                message: 'เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง',
                detail: process.env.NODE_ENV === 'development' ? error.message : null
            })
        };
    }
};

// ============================================
// MOCK RESPONSE (สำหรับ Development เท่านั้น)
// ============================================
function getMockResponse(lens, userData) {
    const name = userData.name || 'คุณ';
    
    const mockVela = {
        personality: `${name} เป็นผู้มีพลังงานของนักสร้างที่มีวิสัยทัศน์ ผสมผสานความสามารถในการมองภาพใหญ่กับการลงมือทำ คุณเห็นโอกาสที่คนอื่นยังมองไม่ออก และสามารถสร้างสิ่งใหม่จากความคิดได้อย่างรวดเร็ว`,
        strength: "สื่อสารหนักแน่น · ทำงานละเอียด · เป็นผู้นำโดยธรรมชาติ · มองภาพใหญ่ได้ดี · กล้าตัดสินใจ",
        weakness: "แบกทุกอย่างไว้คนเดียว ไม่ค่อยขอความช่วยเหลือ บางครั้งรีบร้อนเกินไปจนพลาดรายละเอียด",
        talent: "คุณมีพรสวรรค์ด้านการเป็นผู้นำและการสร้างสิ่งใหม่จากศูนย์ ความสามารถในการมองเห็นโอกาสก่อนคนอื่นคือของขวัญที่ติดตัวมา",
        inner_voice: "ลึกๆ แล้วคุณกำลังมองหาความหมายที่มากกว่าความสำเร็จทางการเงิน — คุณอยากรู้ว่าสิ่งที่ทำนั้นมีคุณค่าจริงๆ",
        advice: "ปล่อยวางความสมบูรณ์แบบบ้าง — ไม่ใช่ทุกอย่างต้องทำคนเดียว การขอความช่วยเหลือไม่ใช่ความอ่อนแอ"
    };
    
    const mockWellani = {
        finance_trend: "แนวโน้มการเงินดีขึ้นในช่วงกลางปี 2028 ถึงต้นปี 2029 ดาวพฤหัสจะเคลื่อนผ่านเรือนการเงินของคุณ ระวังค่าใช้จ่ายไม่คาดคิดช่วงไตรมาส 2 ปี 2027",
        career_trend: "อาชีพการงานจะมีการเปลี่ยนแปลงครั้งสำคัญในปี 2027 — เตรียมตัวรับโอกาสใหม่ที่จะเข้ามา",
        relationship_trend: "ควรสื่อสารให้ชัดเจนกับคนใกล้ชิด หลีกเลี่ยงการเก็บความรู้สึก — ช่วงปลายปี 2026 เป็นจังหวะดีสำหรับการเปิดใจ",
        investment_advice: "ดีลที่กำลังพิจารณามีแนวโน้มสำเร็จ 60-70% แต่แนะนำให้ตรวจสอบทีมและสัญญาอย่างละเอียดก่อนตัดสินใจ",
        forecast_5y: "2026: เริ่มต้นวางรากฐาน, 2027: ปรับตัวและเรียนรู้, 2028: เติบโตอย่างก้าวกระโดด, 2029: ขยายผลและสร้างทีม, 2030: เก็บเกี่ยวผลลัพธ์",
        timing_advice: "ช่วงไตรมาส 3 ปี 2026 เป็นจังหวะดีที่สุดสำหรับการตัดสินใจครั้งสำคัญครั้งต่อไป",
        warning: "ระวังการลงทุนที่ให้ผลตอบแทนสูงเกินจริงในช่วงปี 2027 — มีโอกาสถูกหลอกสูง"
    };
    
    if (lens === 'vela') {
        return JSON.stringify(mockVela);
    } else if (lens === 'wellani') {
        return JSON.stringify(mockWellani);
    } else {
        // Auto — return combined
        return JSON.stringify({
            ...mockVela,
            finance_trend: mockWellani.finance_trend,
            career_trend: mockWellani.career_trend,
            relationship_trend: mockWellani.relationship_trend,
            forecast_5y: mockWellani.forecast_5y,
            key_advice: mockWellani.timing_advice
        });
    }
}

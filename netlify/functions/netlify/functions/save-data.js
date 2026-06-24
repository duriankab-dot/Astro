// ============================================
// netlify/functions/save-data.js
// ASTROVERA Intelligence Engine
// บันทึกข้อมูลผู้ใช้และผลวิเคราะห์ที่ Supabase
// ============================================

const { createClient } = require('@supabase/supabase-js');

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // ใช้ Service Role Key สำหรับ Server-side

// ============================================
// Initialize Supabase Client
// ============================================
function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
    }
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ============================================
// HELPER: Validate User Data
// ============================================
function validateUserData(data) {
    const errors = [];
    
    if (!data.user_id) {
        errors.push('user_id is required');
    }
    if (!data.birth_date) {
        errors.push('birth_date is required');
    }
    
    return errors;
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
        const body = JSON.parse(event.body);
        const supabase = getSupabaseClient();
        
        // Determine operation type
        const operation = body.operation || 'save_analysis';
        
        switch (operation) {
            // ============================================
            // SAVE USER PROFILE
            // ============================================
            case 'save_profile':
                {
                    const { user_id, name, birth_date, birth_time, birth_place, blood_type, gender } = body;
                    
                    if (!user_id) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'user_id is required' })
                        };
                    }
                    
                    // Upsert user profile
                    const { data, error } = await supabase
                        .from('user_profiles')
                        .upsert({
                            user_id: user_id,
                            name: name || null,
                            birth_date: birth_date,
                            birth_time: birth_time || null,
                            birth_place: birth_place || null,
                            blood_type: blood_type || null,
                            gender: gender || null,
                            updated_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id'
                        })
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            operation: 'save_profile',
                            data: data,
                            message: 'บันทึกข้อมูลโปรไฟล์เรียบร้อย'
                        })
                    };
                }
            
            // ============================================
            // SAVE ANALYSIS RESULT
            // ============================================
            case 'save_analysis':
                {
                    const { user_id, lens, result, question } = body;
                    
                    if (!user_id) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'user_id is required' })
                        };
                    }
                    
                    // Insert analysis record
                    const { data, error } = await supabase
                        .from('analysis_results')
                        .insert({
                            user_id: user_id,
                            lens: lens || 'auto',
                            result: result || {},
                            question: question || null,
                            created_at: new Date().toISOString()
                        })
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            operation: 'save_analysis',
                            data: data,
                            message: 'บันทึกผลวิเคราะห์เรียบร้อย'
                        })
                    };
                }
            
            // ============================================
            // SAVE LIFE EVENT
            // ============================================
            case 'save_event':
                {
                    const { user_id, event_type, event_year, description } = body;
                    
                    if (!user_id || !event_type || !event_year) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'user_id, event_type, and event_year are required' })
                        };
                    }
                    
                    const { data, error } = await supabase
                        .from('life_events')
                        .insert({
                            user_id: user_id,
                            event_type: event_type,
                            event_year: event_year,
                            description: description || null,
                            created_at: new Date().toISOString()
                        })
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            operation: 'save_event',
                            data: data,
                            message: 'บันทึกเหตุการณ์สำคัญเรียบร้อย'
                        })
                    };
                }
            
            // ============================================
            // GET USER DATA (all records)
            // ============================================
            case 'get_user_data':
                {
                    const { user_id } = body;
                    
                    if (!user_id) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'user_id is required' })
                        };
                    }
                    
                    // Get profile
                    const { data: profile, error: profileError } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('user_id', user_id)
                        .single();
                    
                    // Get analyses
                    const { data: analyses, error: analysesError } = await supabase
                        .from('analysis_results')
                        .select('*')
                        .eq('user_id', user_id)
                        .order('created_at', { ascending: false })
                        .limit(10);
                    
                    // Get life events
                    const { data: events, error: eventsError } = await supabase
                        .from('life_events')
                        .select('*')
                        .eq('user_id', user_id)
                        .order('event_year', { ascending: false });
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            operation: 'get_user_data',
                            data: {
                                profile: profile || null,
                                analyses: analyses || [],
                                events: events || []
                            }
                        })
                    };
                }
            
            // ============================================
            // DELETE USER DATA
            // ============================================
            case 'delete_user_data':
                {
                    const { user_id } = body;
                    
                    if (!user_id) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({ error: 'user_id is required' })
                        };
                    }
                    
                    // Delete in order (respect foreign keys)
                    await supabase.from('analysis_results').delete().eq('user_id', user_id);
                    await supabase.from('life_events').delete().eq('user_id', user_id);
                    await supabase.from('user_profiles').delete().eq('user_id', user_id);
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            operation: 'delete_user_data',
                            message: 'ลบข้อมูลทั้งหมดเรียบร้อย'
                        })
                    };
                }
            
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Unknown operation',
                        message: `ไม่รู้จัก operation: ${operation}`,
                        supported_operations: ['save_profile', 'save_analysis', 'save_event', 'get_user_data', 'delete_user_data']
                    })
                };
        }
        
    } catch (error) {
        console.error('[ASTROVERA] Save Data Error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal Server Error',
                message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                detail: process.env.NODE_ENV === 'development' ? error.message : null
            })
        };
    }
};

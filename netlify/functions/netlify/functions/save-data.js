// netlify/functions/save-data.js
// บันทึกผลวิเคราะห์ลง Supabase
// env vars ที่ต้องตั้งใน Netlify UI:
//   SUPABASE_URL              — เช่น https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — service_role key (ไม่ใช่ anon)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'POST only' }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY ยังไม่ได้ตั้งค่า' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/analysis_history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id:    payload.user_id    || 'anonymous',
        lens:       payload.lens       || 'general',
        question:   payload.question   || 'initial_analysis',
        result:     payload.content    || payload.data || {},
        created_at: payload.created_at || new Date().toISOString()
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Supabase error (${response.status}): ${err}`);
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true })
    };
  } catch(error) {
    console.error('❌ save-data error:', error.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: error.message })
    };
  }
};

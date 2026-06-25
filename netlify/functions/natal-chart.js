// netlify/functions/natal-chart.js
// ใช้ fetch แบบ Built-in ของ Node.js (ไม่ต้องใช้ node-fetch)

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
    // รับข้อมูลจาก request body (ถ้าเป็น POST)
    let requestData = {};
    if (event.httpMethod === 'POST' && event.body) {
      requestData = JSON.parse(event.body);
    }

    // รับ query parameters (ถ้าเป็น GET)
    const queryParams = event.queryStringParameters || {};

    // ตัวอย่างการเรียก API ภายนอก
    // เปลี่ยน URL เป็น API ที่คุณต้องการเรียก
    const apiUrl = 'https://api.example.com/natal-chart';
    
    // สร้าง options สำหรับ fetch
    const fetchOptions = {
      method: event.httpMethod || 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // ถ้าเป็น POST หรือ PUT ให้ส่ง body
    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      fetchOptions.body = JSON.stringify(requestData);
    }

    // เรียก API
    const response = await fetch(apiUrl, fetchOptions);

    // ตรวจสอบสถานะ
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    // แปลงข้อมูลเป็น JSON
    const data = await response.json();

    // ส่ง response กลับ
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data,
        message: 'Natal chart generated successfully'
      })
    };

  } catch (error) {
    console.error('Error in natal-chart function:', error);

    // ส่ง error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to generate natal chart'
      })
    };
  }
};

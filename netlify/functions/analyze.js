export default async (request, context) => {
    try {
        const userData = await request.json();

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์ตัวตนและแนวโน้มชีวิต 
                                  ตอบเป็นภาษาไทย กระชับ เข้าใจง่าย 
                                  ใช้คำว่า "วิเคราะห์" แทน "ทำนาย"
                                  lens: ${userData.lens || 'vela'}`
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(userData, null, 2)
                    }
                ],
                stream: false,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const err = await response.text();
            return new Response(JSON.stringify({ error: err }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || 'ไม่ได้รับข้อมูล';

        return new Response(JSON.stringify({ data: content }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

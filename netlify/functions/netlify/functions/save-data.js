export default async (request, context) => {
    try {
        const payload = await request.json();

        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/analysis_history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({
                user_id: payload.user_id || 'demo-user',
                lens: payload.lens || 'unknown',
                question: payload.question || 'initial_analysis',
                result: payload.content || payload.data || {},
                created_at: payload.created_at || new Date().toISOString()
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(err);
        }

        return new Response(JSON.stringify({ success: true }), {
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

export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    if (!message) {
      return new Response(JSON.stringify({ feedback: 'No input provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = context.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a startup validation expert for a government incubation program. The user will give you a startup idea. Your job is to critically evaluate it across 5 categories:

1. Clarity of idea
2. Market size and need
3. Uniqueness / Innovation
4. Feasibility in emerging markets like Pakistan
5. Monetization potential

Your response should be in this format:
"✅ Clarity: ...
📊 Market: ...
💡 Uniqueness: ...
⚙️ Feasibility: ...
💰 Monetization: ...

🌟 Overall verdict: [Strongly Recommend / Recommend with Revisions / Not Recommended]"

Do not add anything else. Be realistic, concise, and helpful.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    const result = await response.json();

    const feedback = result.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ feedback: feedback || 'No feedback returned.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'AI request failed.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
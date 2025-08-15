export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    if (!message) {
      return new Response(JSON.stringify({ feedback: '⚠️ No input provided.' }), {
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
            content: `You are a startup validation expert for a government incubation program. Evaluate the startup idea the user gives you across:

1. ✅ Clarity of idea  
2. 📊 Market size and demand  
3. 💡 Uniqueness and innovation  
4. ⚙️ Feasibility in emerging markets like Pakistan  
5. 💰 Monetization potential  

Use this format:
✅ Clarity: ...  
📊 Market: ...  
💡 Uniqueness: ...  
⚙️ Feasibility: ...  
💰 Monetization: ...  

🌟 Overall verdict: Strongly Recommend / Recommend with Revisions / Not Recommended  

No intro or outro. Just the analysis.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    const result = await response.json();

    const feedback = result?.choices?.[0]?.message?.content;

    if (!feedback || feedback.trim() === '') {
      return new Response(
        JSON.stringify({ feedback: '⚠️ AI response was empty. Please try again.' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ feedback }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ feedback: '❌ Something went wrong.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
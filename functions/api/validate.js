export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.OPENROUTER_API_KEY;

    const payload = {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a startup idea evaluator. Given a startup idea, score it out of 100 using these 5 criteria (each out of 20): 
1) Problem clarity, 
2) Market size, 
3) Uniqueness, 
4) Feasibility, 
5) Revenue potential.

Then give a short written feedback to help improve the idea. Format your answer like:
1) Problem clarity: X/20
...
Total score: Y/100
Feedback: ...`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    const feedback =
      result?.choices?.[0]?.message?.content || "⚠️ AI response was empty. Please try again.";

    return new Response(JSON.stringify({ feedback }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ feedback: "❌ Error: " + err.message }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
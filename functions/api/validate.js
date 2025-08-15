export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.OPENROUTER_API_KEY;

    const prompt = `
You are a startup validation expert at a government incubator.

A founder has submitted the following startup idea:
"${message}"

Please evaluate the idea across the following 5 criteria:
1. ✅ Clarity – Is the idea clearly described?
2. 📊 Market Size – Does it target a meaningful audience?
3. 💡 Uniqueness – Is it innovative or already common?
4. 🔧 Feasibility – Can it realistically be built with reasonable resources?
5. 💰 Monetization – Is there a viable way to make money?

Return clear feedback under each point. Use plain English.
Be honest but supportive. Avoid fluff.
`.trim();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      })
    });

    const raw = await response.text(); // Get full response text for debugging
    let data;

    try {
      data = JSON.parse(raw);
    } catch (jsonErr) {
      return new Response(JSON.stringify({
        feedback: "⚠️ Failed to parse AI response.",
        rawResponse: raw,
        error: jsonErr.message
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) {
      return new Response(JSON.stringify({
        feedback: "⚠️ AI returned no message.",
        rawResponse: raw
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ feedback: aiReply }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      feedback: "⚠️ Unexpected error.",
      error: err.message
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
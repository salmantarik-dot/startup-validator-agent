export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const OPENROUTER_API_KEY = context.env.OPENROUTER_API_KEY;

    const prompt = `
You are a startup evaluator. Review the startup idea below based on 5 key factors:
1. Clarity – Is the idea clearly described?
2. Market Size – Does it target a meaningful market?
3. Uniqueness – What’s new or different?
4. Feasibility – Can this actually be built?
5. Monetization – Is there a viable way to make money?

Startup Idea:
${message}

Format the output like this:

1. ✅ Clarity – your response  
2. 📊 Market Size – your response  
3. 💡 Uniqueness – your response  
4. 🔧 Feasibility – your response  
5. 💰 Monetization – your response  

End with a 2–3 line overall verdict.`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      })
    });

    const raw = await aiResponse.json();
    const feedback = raw.choices?.[0]?.message?.content || "⚠️ AI returned no message.";

    return new Response(JSON.stringify({ feedback }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ feedback: "⚠️ Something went wrong." }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
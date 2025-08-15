// functions/api/validate.js

export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.OPENROUTER_API_KEY;

    const prompt = `
You are a brutally honest startup idea evaluator who uses international startup frameworks like Y Combinator’s checklist, VC scoring, and the OECD innovation model. Analyze the following idea across:

1. ✅ Clarity – Is the idea clearly described?
2. 📊 Market Size – Is the target market meaningful in size and need?
3. 💡 Uniqueness – Is this solving a truly new or underserved problem?
4. 🔧 Feasibility – Is it realistic to build and scale this?
5. 💰 Monetization – Is there a clear path to make money?

For each point, rate it 1–5 with short reasoning.

📌 Overall Summary:
Provide a blunt verdict — is this idea worth pursuing? Be honest, even if it hurts.

Startup Idea:
${message}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    // DEBUGGING
    console.log("🔍 OpenRouter raw response:", JSON.stringify(data, null, 2));

    const aiMessage = data.choices?.[0]?.message?.content || "⚠️ AI returned no message.";
    return new Response(JSON.stringify({ feedback: aiMessage }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ Internal error:", err);
    return new Response(JSON.stringify({
      feedback: "📌 Overall Summary:\nAn internal error occurred.",
      error: err.message
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}
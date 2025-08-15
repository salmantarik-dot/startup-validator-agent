// functions/api/validate.js

export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.OPENROUTER_API_KEY;

    const prompt = `
You are a brutally honest startup idea evaluator using global best practices (Y Combinator checklist, VC scoring, OECD innovation model). Evaluate the idea below using these five criteria, and give:

- A rating (1–5) for each
- A one-line reason
- Real-world context/data if possible

Criteria:
1. ✅ Clarity – Is the idea clear and understandable?
2. 📊 Market Size – Is it targeting a large or growing market?
3. 💡 Uniqueness – Is it solving a truly unique or underserved problem?
4. 🔧 Feasibility – Can it realistically be built and scaled?
5. 💰 Monetization – Is there a clear path to sustainable revenue?

📌 Overall Summary: Should this idea be pursued? Be blunt and clear.

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
        messages: [{ role: "user", content: prompt }]
      })
    });

    const raw = await response.text();

    console.log("🧾 RAW API RESPONSE:", raw); // debug log

    const data = JSON.parse(raw);

    const aiMessage = data.choices?.[0]?.message?.content || "⚠️ AI returned no message.";
    return new Response(JSON.stringify({ feedback: aiMessage }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("❌ INTERNAL ERROR:", err);
    return new Response(JSON.stringify({
      feedback: "📌 Overall Summary:\nAn internal error occurred.",
      error: err.message
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}
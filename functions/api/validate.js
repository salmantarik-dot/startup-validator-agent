export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.OPENROUTER_API_KEY;

    const prompt = `
You are a brutally honest but helpful startup evaluator. Given a startup idea, evaluate it across the following 5 international validation criteria:

1. Clarity (Is the idea clearly explained?)
2. Market Size (Is there a large enough market opportunity?)
3. Uniqueness (Is this idea novel or differentiated?)
4. Feasibility (Can this realistically be built, scaled, and sustained?)
5. Monetization (Are there clear ways to make money?)

For each criterion:
- Give a score out of 10
- Explain your reasoning in plain language
- Include real data or a relevant source if possible

Use this format exactly:

📌 AI Feedback:

1. ✅ Clarity – [score]/10 – [reasoning] (e.g., “The idea is well-articulated and easy to understand.”)

2. 📊 Market Size – [score]/10 – [reasoning] with real-world data (e.g., “Freelancer market in Pakistan exceeds X million”)

3. 💡 Uniqueness – [score]/10 – [reasoning] (e.g., “There are many clones, but this twist is original.”)

4. 🔧 Feasibility – [score]/10 – [reasoning] based on tech or team needs

5. 💰 Monetization – [score]/10 – [reasoning] and potential models

Then conclude with:

📌 Overall Verdict:
[Brief summary]
    `;

    const fullPrompt = `${prompt}\n\nStartup Idea: ${message}`;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: fullPrompt
          }
        ]
      })
    });

    const aiData = await aiRes.json();

    const feedback =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      "⚠️ AI returned no message.";

    return new Response(
      JSON.stringify({ feedback, raw: aiData }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error occurred", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
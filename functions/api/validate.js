export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${context.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a startup idea evaluator. For the given idea, evaluate it based on:
1. Clarity of the idea
2. Market size and growth
3. Uniqueness / Competitive Advantage
4. Feasibility of execution
5. Monetization potential

For each:
- Give a rating out of 5
- Explain reasoning in plain English
- Reference real-world data if possible

At the end:
- Calculate total score (out of 25)
- Add a badge:
  • 21–25: 🚀 Investor-Ready
  • 16–20: ⭐️ Promising MVP
  • 11–15: ⚠️ Needs Refinement
  • 0–10: ❌ High Risk or Unclear

Respond in clean Markdown with headers.`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return new Response(
        JSON.stringify({ evaluation: "⚠️ AI returned no message." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ evaluation: reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ evaluation: "⚠️ Error occurred during evaluation." }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
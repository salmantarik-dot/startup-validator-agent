export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `
You are a cynical startup analyst. A user wants to validate a startup idea.

The idea is: "${message}"

Your task is to evaluate the idea using the following criteria. Use plain language, real-world data if available, and give a numeric rating (1–5) for each point.

**Evaluation Template:**

1. Clarity of the idea:
- Rating:
- Reasoning:

2. Market size and growth:
- Rating:
- Reasoning:
- Use real data if possible (e.g., TAM, market reports, country-specific stats).

3. Uniqueness / Competitive Advantage:
- Rating:
- Reasoning:
- Compare against existing players.

4. Feasibility of execution:
- Rating:
- Reasoning:
- Be honest about tech, resources, legal, and operations.

5. Monetization potential:
- Rating:
- Reasoning:
- Mention realistic models (ads, subscriptions, SaaS, etc.).

Then give a:
📊 Total Score (out of 25):
📌 Verdict (Choose one): [Strong Potential / Needs Work / Unlikely to Succeed]

Be brutally honest, but constructive. No generic praise.
            `,
          },
        ],
      }),
    });

    const data = await response.json();

    const aiMessage = data.choices?.[0]?.message?.content || "⚠️ AI returned no message.";
    return new Response(JSON.stringify({ evaluation: aiMessage }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "⚠️ Internal error: " + err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
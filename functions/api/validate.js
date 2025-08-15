export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const prompt = `
You are a seasoned and slightly cynical startup evaluator.

The user’s idea is: "${message}"

Evaluate the idea on the following 5 criteria using the best global startup evaluation practices (Y Combinator, Bill Gross, Startup Commons):

1. **Clarity of the Idea** – Is it understandable in one sentence?
2. **Market Size & Growth** – Is the market big and growing?
3. **Uniqueness / Competitive Advantage** – Is it better or different?
4. **Feasibility of Execution** – Can the team build and scale this?
5. **Monetization Potential** – Is there a clear path to revenue?

For each criterion:
- Give a rating out of 5
- Explain your reasoning
- Use real-world data or comparables if relevant

End with:
📊 **Total Score (out of 25)**
📌 **Verdict**: Strong Potential / Needs Work / Unlikely to Succeed

Keep the tone professional, honest, and grounded in reality.
    `;

    const payload = {
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a startup evaluation expert." },
        { role: "user", content: prompt },
      ],
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    const result = data?.choices?.[0]?.message?.content || "⚠️ AI returned no message.";

    return new Response(JSON.stringify({ evaluation: result }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
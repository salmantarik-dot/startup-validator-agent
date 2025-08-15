export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const userMessage = body.message;

  const apiKey = env.OPENROUTER_API_KEY; // ✅ Using context.env correctly

  const systemPrompt = `
You are a cynical startup evaluator. Evaluate the startup idea using 5 criteria:

1. Clarity of the idea
2. Market size and growth
3. Uniqueness / Competitive Advantage
4. Feasibility of execution
5. Monetization potential

For each criteria:
- Give a rating out of 5
- Explain in plain language
- Refer to real-world data if possible

Respond only in this format:
**Evaluation of the Startup Idea:**
1. **Clarity**
   - **Rating:** X/5
   - **Reasoning:** ...

2. **Market size**
   - **Rating:** X/5
   - **Reasoning:** ...

...

**Summary:** ...
`;

  const payload = {
    model: "openai/gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data || !data.choices || data.choices.length === 0) {
      return new Response("⚠️ AI returned no message", { status: 500 });
    }

    const aiReply = data.choices[0].message.content;

    return new Response(JSON.stringify({ evaluation: aiReply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Internal error",
      details: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
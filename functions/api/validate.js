export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const userMessage = body.message;

  const apiKey = env.OPENROUTER_API_KEY;

  const systemPrompt = `
You are a cynical startup evaluator. Evaluate the startup idea using 5 criteria:

1. Clarity of the idea
2. Market size and growth
3. Uniqueness / Competitive Advantage
4. Feasibility of execution
5. Monetization potential

For each criteria:
- Give a rating out of 5
- Give a short explanation in plain language
- Refer to real-world examples or data if applicable

End with a brief summary about the overall potential.

Respond only in this format:
**Evaluation of the Startup Idea:**
1. **Clarity of the idea**
   - **Rating:** X/5
   - **Reasoning:** ...

2. **Market size and growth**
   - **Rating:** X/5
   - **Reasoning:** ...

... and so on

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
      return new Response("No AI response returned.", { status: 500 });
    }

    const aiReply = data.choices[0].message.content;

    return new Response(JSON.stringify({ evaluation: aiReply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
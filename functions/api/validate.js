export async function onRequestPost(context) {
  const body = await context.request.json();
  const message = body.message;

  if (!message) {
    return new Response(JSON.stringify({ feedback: "No startup idea provided." }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  const prompt = `
You are a startup evaluator bot. Rate this idea across 5 categories on a 20-point scale each:
1) Problem clarity
2) Market size
3) Uniqueness
4) Feasibility
5) Revenue potential

Then give a total score out of 100 and brief feedback.

Startup idea: ${message}
`;

  const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer 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",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a startup evaluator AI assistant." },
        { role: "user", content: prompt }
      ]
    })
  });

  const result = await apiRes.json();
  const feedback = result?.choices?.[0]?.message?.content;

  return new Response(JSON.stringify({ feedback }), {
    headers: { "Content-Type": "application/json" }
  });
}
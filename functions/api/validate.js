export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const prompt = `
You are a cynical investor evaluating a startup idea. Rate the idea across the following five international-standard dimensions (1–10 scale), and give a reason for each score:

1. Clarity – How clearly is the idea communicated?
2. Market Size – Is there a real and large addressable market?
3. Uniqueness – Is this idea meaningfully different from existing solutions?
4. Feasibility – Can this be realistically built and launched?
5. Monetization – Are there viable paths to generate revenue?

Then provide a brief summary on whether the idea is worth exploring further. If helpful, cite real-world trends or examples.

Startup idea: "${message}"

Output as strict JSON like this:
{
  "feedback": "Overall feedback text...",
  "scores": {
    "Clarity": { "score": 8, "reason": "..." },
    "Market Size": { "score": 6, "reason": "..." },
    ...
  },
  "summary": "Final verdict"
}
`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`, // replace with your secret binding
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a critical startup evaluator." },
          { role: "user", content: prompt }
        ],
      }),
    });

    const result = await aiResponse.json();

    const content = result.choices?.[0]?.message?.content || "";

    // Try to safely parse
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      return new Response(
        JSON.stringify({
          feedback: "⚠️ AI returned an invalid JSON format.",
          scores: {},
          summary: "The AI could not generate structured feedback.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        feedback: "❌ Server error.",
        scores: {},
        summary: "An internal error occurred.",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
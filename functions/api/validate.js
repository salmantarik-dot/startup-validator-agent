export async function onRequestPost(context) {
  try {
    const { idea, market, uniqueness, feasibility, monetization } = await context.request.json();

    const prompt = `
Evaluate the following startup idea based on 5 key dimensions. For each, provide a rating from 1 to 5, a brief reasoning, and real-world context or market data. Present the result in a clear, bolded, and visually professional format with headings and bullet points.

Startup Idea Description:
1. Clarity of the idea: ${idea}
2. Market size and growth: ${market}
3. Uniqueness / Competitive Advantage: ${uniqueness}
4. Feasibility of execution: ${feasibility}
5. Monetization potential: ${monetization}

Format:
- Use **bold** headings.
- Add line breaks for readability.
- Respond as if giving feedback to a real founder.
`;

    const OPENROUTER_API_KEY = context.env.OPENROUTER_API_KEY;

    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
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

    const data = await completion.json();

    const reply = data.choices?.[0]?.message?.content || "⚠️ No valid feedback returned.";

    return new Response(JSON.stringify({ result: reply }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Error during AI evaluation:", error);
    return new Response(JSON.stringify({ result: "⚠️ AI returned no message." }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();
    const apiKey = context.env.OPENROUTER_API_KEY;

    const prompt = `
You are a cynical but fair startup evaluator. The user will give you a startup idea. Your task is to evaluate it on 5 internationally accepted criteria. For each one:

1. Give a **rating out of 5**
2. Give **brief reasoning in plain language**
3. Use **real-world data or examples** where possible
4. Be honest – don’t hype weak ideas. But don’t kill ambition unfairly either.

Evaluate this startup idea:
"${message}"

Criteria:
1. Clarity of the idea
2. Market size and growth
3. Uniqueness / Competitive Advantage
4. Feasibility of execution
5. Monetization potential

End with a clear summary. Format the response cleanly and professionally.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a no-fluff startup evaluator who gives honest, data-backed assessments.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return new Response(
        JSON.stringify({ feedback: "⚠️ AI returned no message." }),
        { status: 200 }
      );
    }

    const aiReply = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ feedback: aiReply }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Internal error:", err);
    return new Response(
      JSON.stringify({ feedback: "📌 Overall Summary:\nAn internal error occurred." }),
      { status: 500 }
    );
  }
}
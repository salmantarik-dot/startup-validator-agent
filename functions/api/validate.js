export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;

    const messages = [
      {
        role: "system",
        content: `You are a startup evaluation expert. Rate and review a startup based on five dimensions: Clarity, Market Size, Uniqueness, Feasibility, and Monetization. For each, provide a rating out of 5, give short reasoning, and mention real-world examples or market data if relevant. End with a short professional summary. Format the output in Markdown with bolded headings and bullet points.`,
      },
      {
        role: "user",
        content: JSON.stringify(body),
      },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content || "⚠️ No valid feedback returned.";

    return new Response(result, {
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
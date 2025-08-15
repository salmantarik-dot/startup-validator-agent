export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const prompt = `
You are a startup evaluator AI agent. Based on the startup idea below, evaluate the following 5 dimensions and return your feedback in a structured way:

1. ✅ Clarity – Is the idea clearly stated?
2. 📊 Market Size – Is the target market significant?
3. 💡 Uniqueness – Is this idea differentiated from others?
4. 🔧 Feasibility – Is it realistic to build this?
5. 💰 Monetization – Are there valid ways to earn money?

Startup Idea:
"${message}"

Respond only in the format below:

AI Feedback:
1. ✅ Clarity – ...
2. 📊 Market Size – ...
3. 💡 Uniqueness – ...
4. 🔧 Feasibility – ...
5. 💰 Monetization – ...

Then provide a 1-paragraph summary giving overall advice or encouragement.
`;

    const apiKey = context.env.OPENROUTER_API_KEY;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openrouter/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful and structured startup idea evaluator." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      return new Response(JSON.stringify({ feedback: "⚠️ AI returned no message." }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ feedback: aiMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ feedback: "❌ Error processing request", error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
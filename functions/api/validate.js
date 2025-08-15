export async function onRequestPost(context) {
  const { request, env } = context;

  const { message } = await request.json();

  const prompt = `
You are a brutally honest but fair startup evaluator in an accelerator panel.

Given the following startup idea: "${message}", evaluate it across these 5 criteria:

1. Clarity (is the idea clearly defined?)
2. Market Size (is it targeting a big and real market?)
3. Uniqueness (what sets it apart from existing solutions?)
4. Feasibility (can it be realistically built and scaled?)
5. Monetization (are there viable ways to make money?)

For each, rate it out of 10 and give 1–2 lines of reason. Be constructive but also skeptical. Use real data where possible (you may simulate if needed, but sound grounded). Conclude with a 2–3 line verdict summarizing the potential, red flags, and one key recommendation.

Format the output like this:

👓 Idea: [idea]

🔍 Evaluation:

1. Clarity – ?/10  
   Reason...

2. Market Size – ?/10  
   Reason...

...

🧠 Verdict:
Your final thoughts and recommendation.
`;

  try {
    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // or gpt-4 if you want and have access
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const { choices } = await completion.json();
    const feedback = choices?.[0]?.message?.content || "No feedback returned.";

    return new Response(JSON.stringify({ feedback }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ feedback: null, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
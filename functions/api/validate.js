export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const message = body.message || "";

  const prompt = `
You are a brutally honest startup evaluator trained in global investor frameworks (Y Combinator, Sequoia, Index Ventures, etc.). A founder will share their idea. You must:

1. Evaluate the idea across 7 categories:
   - Clarity
   - Problem Significance
   - Market Size
   - Competitive Edge
   - Execution Feasibility
   - Monetization
   - Realism Check (especially in emerging markets like Pakistan)

2. For each category, give:
   - A clear explanation
   - A cynical truth if needed
   - A score from 1 (terrible) to 5 (excellent)

3. End with a final recommendation:
   - Use blunt language like “not ready”, “average pitch”, “promising but naive”, etc.

4. Reference real data or known patterns if applicable (e.g. Pakistan’s freelancer export value, app competition, funding trends).

Here is the idea to evaluate:
"${message}"

Respond in the following format:

AI Feedback:
1. Clarity [Score: x/5] - your comment
2. Problem Significance [Score: x/5] - your comment
3. Market Size [Score: x/5] - your comment
4. Competitive Edge [Score: x/5] - your comment
5. Execution Feasibility [Score: x/5] - your comment
6. Monetization [Score: x/5] - your comment
7. Realism Check [Score: x/5] - your comment

🎯 Final Verdict: [your honest assessment]
`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openrouter/gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "⚠️ AI returned no message.";
    return new Response(JSON.stringify({ feedback: aiMessage }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ feedback: "❌ Server error. Please try again later." }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
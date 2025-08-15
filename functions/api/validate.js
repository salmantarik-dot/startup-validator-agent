export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${context.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
You are a cynical but helpful startup evaluator. Evaluate the startup idea across 5 criteria:

1. Clarity of idea  
2. Market size  
3. Uniqueness  
4. Feasibility  
5. Monetization

For each:
- Give a short explanation
- Give a rating out of 5 in the format: **Rating: X/5**
- Use real examples or data if possible

Do not give the final verdict — only score and reasoning per criterion.
          `
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    let aiReply = data.choices?.[0]?.message?.content || "⚠️ AI returned no message.";

    // Extract ratings
    const ratingRegex = /Rating:\s*([1-5])\/5/g;
    let match;
    let totalScore = 0;
    while ((match = ratingRegex.exec(aiReply)) !== null) {
      totalScore += parseInt(match[1]);
    }

    // Decide verdict
    let verdict = "";
    if (totalScore <= 10) verdict = "❌ Not Viable";
    else if (totalScore <= 17) verdict = "⚠️ Needs Refinement";
    else if (totalScore <= 22) verdict = "✅ Promising";
    else verdict = "🌟 High-Potential";

    // Append total and verdict
    aiReply += `

📌 **Total Score:** ${totalScore}/25  
📌 **Verdict:** ${verdict}`;

    return new Response(JSON.stringify({ evaluation: aiReply }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
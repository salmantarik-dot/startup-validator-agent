export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const { clarity, marketSize, uniqueness, feasibility, monetization } = body;

    const prompt = `
You are a Startup Evaluation Expert.

Evaluate a startup idea based on the following inputs:

1. Clarity of the idea:
${clarity}

2. Market size and growth:
${marketSize}

3. Uniqueness / Competitive Advantage:
${uniqueness}

4. Feasibility of execution:
${feasibility}

5. Monetization potential:
${monetization}

Respond in the following format using Markdown:

**Clarity: X/5**
- [reason]

**Market Size: X/5**
- [reason]

**Uniqueness: X/5**
- [reason]

**Feasibility: X/5**
- [reason]

**Monetization: X/5**
- [reason]

**Professional Summary:**
[summary paragraph]
`;

    const apiKey = context.env.OPENROUTER_API_KEY;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful startup evaluation assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const aiResponseText = data.choices?.[0]?.message?.content || "No valid feedback returned.";

    return new Response(JSON.stringify({
      draft: aiResponseText.trim()
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      draft: "❌ Something went wrong. Please try again."
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 500
    });
  }
}
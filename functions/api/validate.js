export async function onRequestPost(context) {
  try {
    const { message } = await context.request.json();

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer "Authorization":`Bearer ${OPENROUTER_API_KEY}',
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
Return a startup evaluation report in clean HTML with bold headings and scores. Make sure it is SHORT, FORMATTED, and safe to include inside a JSON string.
DO NOT use line breaks outside of HTML.
DO NOT use markdown.
Wrap everything inside a <div>.
            `.trim()
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const json = await apiResponse.json();
    const aiText = json?.choices?.[0]?.message?.content || "";

    // Ensure we return proper JSON
    return new Response(
      JSON.stringify({ html: aiText }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error) {
    console.error("Validation Error:", error);
    return new Response(
      JSON.stringify({ html: "<p>❌ AI error. Try again later.</p>" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}
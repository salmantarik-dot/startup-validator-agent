const form = document.getElementById("validator-form");
const pointsInput = document.getElementById("points");
const resultContainer = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const idea = pointsInput.value.trim();
  resultContainer.innerHTML = "⏳ Evaluating your idea...";

  try {
    const response = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: idea }),
    });

    const data = await response.json();
    const feedback = data.feedback || "⚠️ AI returned no message.";

    resultContainer.innerHTML = formatFeedback(feedback);
  } catch (err) {
    resultContainer.innerHTML = "❌ Could not connect to AI.";
    console.error(err);
  }
});

function formatFeedback(rawText) {
  const lines = rawText.trim().split("\n").filter(line => line.trim() !== "");
  const sections = [];
  let current = [];

  for (const line of lines) {
    if (/^\d\./.test(line)) {
      if (current.length) sections.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) sections.push(current.join("\n"));

  const formatted = sections.map((section, idx) => {
    return `<div style="margin-bottom: 20px; padding: 10px; border-left: 5px solid #2c3e50; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
      <strong>Criterion ${idx + 1}</strong><br>
      <pre style="white-space: pre-wrap; margin: 0; font-size: 0.95rem;">${section}</pre>
    </div>`;
  });

  // Look for summary
  const summaryMatch = rawText.match(/📌 Overall Summary:\s*([\s\S]*)/);
  const summary = summaryMatch ? summaryMatch[1].trim() : null;

  return `
    <h2 style="color: #2c3e50;">📌 Validation Results</h2>
    ${formatted.join("")}
    ${summary ? `<div style="margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px;"><strong>📌 Overall Summary:</strong><br><p style="margin-top: 5px;">${summary}</p></div>` : ""}
  `;
}
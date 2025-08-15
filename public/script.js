document.getElementById("validator-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const idea = document.getElementById("idea").value;
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "⏳ Validating your idea...";

  try {
    const res = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: idea }),
    });

    const data = await res.json();

    // Show both feedback and raw response
    resultDiv.innerHTML = `
      <h3>AI Feedback:</h3>
      <pre>${data.feedback || "⚠️ No feedback returned."}</pre>
      <h4 style="margin-top:1em;">Raw Response:</h4>
      <pre style="background:#eee;padding:1em;">${JSON.stringify(data.rawResponse || {}, null, 2)}</pre>
    `;
  } catch (err) {
    resultDiv.innerHTML = `❌ Error: ${err.message}`;
  }
});
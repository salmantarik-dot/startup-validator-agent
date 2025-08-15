document.getElementById("startup-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const clarity = document.getElementById("clarity").value.trim();
  const market = document.getElementById("market").value.trim();
  const uniqueness = document.getElementById("uniqueness").value.trim();
  const feasibility = document.getElementById("feasibility").value.trim();
  const monetization = document.getElementById("monetization").value.trim();

  const message = `
Clarity of idea: ${clarity}
Market size and growth: ${market}
Uniqueness / Competitive Advantage: ${uniqueness}
Feasibility of execution: ${feasibility}
Monetization potential: ${monetization}
`;

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>🔍 Evaluating your startup...</p>";

  try {
    const response = await fetch("/api/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (data.html) {
      resultDiv.innerHTML = data.html;
    } else {
      resultDiv.innerHTML = "<p>⚠️ No valid feedback returned.</p>";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    resultDiv.innerHTML = "<p>❌ An error occurred while evaluating.</p>";
  }
});
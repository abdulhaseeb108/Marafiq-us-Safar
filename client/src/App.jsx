import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({
    adults: 4,
    makkahNights: 7,
    madinahNights: 5,
    makkahRatePp: 40,
    madinahRatePp: 44,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:4000/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setResult(data);
    } catch {
      setError("Cannot reach the server. Is it running?");
    }
  }

  const fields = [
    ["adults", "Adults"],
    ["makkahNights", "Makkah nights"],
    ["madinahNights", "Madinah nights"],
    ["makkahRatePp", "Makkah rate (SAR per person per night)"],
    ["madinahRatePp", "Madinah rate (SAR per person per night)"],
  ];

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Umrah Cost Estimate</h1>
      <form onSubmit={handleSubmit}>
        {fields.map(([name, label]) => (
          <div key={name} style={{ marginBottom: 12 }}>
            <label>
              {label}
              <br />
              <input
                type="number"
                name={name}
                value={form[name]}
                onChange={handleChange}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
          </div>
        ))}
        <button type="submit" style={{ padding: "10px 20px" }}>
          Calculate estimate
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Estimate (not a confirmed booking)</h2>
          <ul>
            {result.lineItems.map((item) => (
              <li key={item.label}>
                {item.label}: {item.sar} SAR
              </li>
            ))}
          </ul>
          <p><strong>Total: {result.totalSar} SAR</strong></p>
          <p>Per person: {result.perPersonSar} SAR</p>
        </div>
      )}
    </div>
  );
}
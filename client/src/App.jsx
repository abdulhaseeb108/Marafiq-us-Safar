import { useEffect, useState } from "react";

const API = "http://localhost:4000";
const fmt = (n) => Number(n).toLocaleString("en-US");

export default function App() {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({
    adults: 4,
    children: 0,
    infants: 0,
    roomType: 4,
    startDate: "2026-11-10",
    makkahNights: 7,
    madinahNights: 5,
    makkahHotelId: "",
    madinahHotelId: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/hotels`)
      .then((r) => r.json())
      .then((list) => {
        setHotels(list);
        const mk = list.find((h) => h.city === "makkah");
        const md = list.find((h) => h.city === "madinah");
        setForm((f) => ({
          ...f,
          makkahHotelId: mk?._id || "",
          madinahHotelId: md?._id || "",
        }));
      })
      .catch(() => setError("Cannot reach the server. Is it running?"));
  }, []);

  const setNumber = (e) =>
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  const setText = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/api/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong");
      setResult(data);
    } catch {
      setError("Cannot reach the server. Is it running?");
    }
  }

  const box = { width: "100%", padding: 8 };
  const row = { marginBottom: 12 };
  const numberField = (name, label) => (
    <div style={row}>
      <label>{label}<br />
        <input type="number" min="0" name={name} value={form[name]} onChange={setNumber} style={box} />
      </label>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "sans-serif", padding: "0 12px" }}>
      <h1>Umrah Cost Estimate</h1>
      <form onSubmit={handleSubmit}>
        {numberField("adults", "Adults")}
        {numberField("children", "Children (priced as adults)")}
        {numberField("infants", "Infants (under 2)")}

        <div style={row}>
          <label>Guests per room<br />
            <select name="roomType" value={form.roomType} onChange={setNumber} style={box}>
              <option value={4}>Quad (4 per room)</option>
              <option value={3}>Triple (3 per room)</option>
              <option value={2}>Double (2 per room)</option>
            </select>
          </label>
        </div>

        <div style={row}>
          <label>Start date (first night in Makkah)<br />
            <input type="date" name="startDate" value={form.startDate} onChange={setText} style={box} />
          </label>
        </div>

        <div style={row}>
          <label>Makkah hotel<br />
            <select name="makkahHotelId" value={form.makkahHotelId} onChange={setText} style={box}>
              {hotels.filter((h) => h.city === "makkah").map((h) => (
                <option key={h._id} value={h._id}>{h.name} ({h.distanceM} m)</option>
              ))}
            </select>
          </label>
        </div>
        {numberField("makkahNights", "Makkah nights")}

        <div style={row}>
          <label>Madinah hotel<br />
            <select name="madinahHotelId" value={form.madinahHotelId} onChange={setText} style={box}>
              {hotels.filter((h) => h.city === "madinah").map((h) => (
                <option key={h._id} value={h._id}>{h.name} ({h.distanceM} m)</option>
              ))}
            </select>
          </label>
        </div>
        {numberField("madinahNights", "Madinah nights")}

        <button type="submit" style={{ padding: "10px 20px" }}>Calculate estimate</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Estimate (not a confirmed booking)</h2>
          <p style={{ fontSize: 22, margin: "4px 0" }}>
            <strong>PKR {fmt(result.totalPkr)} to {fmt(result.highPkr)}</strong>
          </p>
          <p style={{ margin: "4px 0" }}>
            SAR {fmt(result.totalSar)} to {fmt(result.highSar)}
          </p>
          <p>Average per traveler: PKR {fmt(result.perPersonPkr)}</p>

          <h3>Breakdown (SAR, lower figure)</h3>
          <ul>
            {result.lineItems.map((item) => (
              <li key={item.label}>{item.label}: {fmt(item.sar)} SAR</li>
            ))}
          </ul>

          <h3>Assumptions</h3>
          <ul style={{ fontSize: 14 }}>
            {result.assumptions.map((a) => <li key={a}>{a}</li>)}
          </ul>

          <p style={{ fontSize: 13, color: "#555" }}>
            Valid until {new Date(result.expiresAt).toLocaleString()}.
            This is an estimate, not a booking or a guaranteed price.
          </p>
        </div>
      )}
    </div>
  );
}
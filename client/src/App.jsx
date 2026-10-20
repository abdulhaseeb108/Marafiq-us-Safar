import { useEffect, useState } from "react";
import {
  Users, Building2, CalendarDays, Send, Check, User, UserRound, Baby,
  BedDouble, Plane, Package, Lock, Globe, Info, ReceiptText, FilePenLine, Headset,
  Moon, Minus, Plus,
} from "lucide-react";
import { Logo, Lantern, Kaaba, Skyline, WhatsAppIcon } from "./art.jsx";

const API = "http://localhost:4000";
const WHATSAPP_NUMBER = "923000000000"; // CHANGE to your business number
const fmt = (n) => Number(n).toLocaleString("en-US");
const STEPS = [
  [Users, "Travellers", "Who is going?"],
  [Building2, "Hotels", "Where will you stay?"],
  [CalendarDays, "Dates", "When will you travel?"],
  [Send, "Request", "Get your quotation"],
];

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}
const showDate = (d) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function Counter({ value, onChange, min = 0, max = 30, label }) {
  return (
    <div className="ctl">
      <button type="button" className="rb" aria-label={`Fewer ${label}`} disabled={value <= min}
        onClick={() => onChange(value - 1)}><Minus size={16} /></button>
      <div className="val" style={{ textAlign: "center" }}>{value}</div>
      <button type="button" className="rb" aria-label={`More ${label}`} disabled={value >= max}
        onClick={() => onChange(value + 1)}><Plus size={16} /></button>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({
    adults: 4, children: 0, infants: 0, roomType: 4,
    startDate: "2026-11-10", makkahNights: 7, madinahNights: 5,
    makkahHotelId: "", madinahHotelId: "",
  });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [lead, setLead] = useState({ name: "", phone: "", note: "", consent: false });
  const [sent, setSent] = useState(null);
  const [leadError, setLeadError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/hotels`)
      .then((r) => r.json())
      .then((list) => {
        setHotels(list);
        const mk = list.find((h) => h.city === "makkah");
        const md = list.find((h) => h.city === "madinah");
        setForm((f) => ({ ...f, makkahHotelId: mk?._id || "", madinahHotelId: md?._id || "" }));
      })
      .catch(() => setError("Cannot reach the server. Is it running?"));
  }, []);

  // Live estimate (preview only, not saved)
  useEffect(() => {
    if (!form.makkahHotelId || !form.madinahHotelId || !form.startDate) return;
    let cancelled = false;
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, preview: true }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) { setError(data.error || "Something went wrong"); setResult(null); }
        else { setError(""); setResult(data); }
      } catch {
        if (!cancelled) setError("Cannot reach the server. Is it running?");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form]);

  const set = (name) => (value) => {
    setSent(null);
    setForm((f) => ({ ...f, [name]: value }));
  };
  const setText = (e) => set(e.target.name)(e.target.value);

  async function submitLead(e) {
    e.preventDefault();
    setLeadError("");
    setSending(true);
    try {
      const calc = await fetch(`${API}/api/calculate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const saved = await calc.json();
      if (!calc.ok) return setLeadError(saved.error || "Something went wrong");

      const res = await fetch(`${API}/api/leads`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, snapshotId: saved.snapshotId }),
      });
      const data = await res.json();
      if (!res.ok) return setLeadError(data.error || "Something went wrong");
      setSent(data.referenceNo);
    } catch {
      setLeadError("Cannot reach the server. Is it running?");
    } finally {
      setSending(false);
    }
  }

  const travellers = form.adults + form.children + form.infants;
  const makkahHotel = hotels.find((h) => h._id === form.makkahHotelId);
  const madinahHotel = hotels.find((h) => h._id === form.madinahHotelId);
  const makkahOut = addDays(form.startDate, form.makkahNights);
  const madinahOut = addDays(form.startDate, form.makkahNights + form.madinahNights);

  const waText = result
    ? `Assalamu alaikum. I would like a confirmed quote for Umrah.\n` +
      `${travellers} travellers, ${form.makkahNights} nights Makkah, ${form.madinahNights} nights Madinah.\n` +
      `Estimate: PKR ${fmt(result.totalPkr)} - ${fmt(result.highPkr)}` +
      (sent ? `\nReference: ${sent}` : "")
    : "Assalamu alaikum. I would like to plan an Umrah trip.";
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

  const hotelSelect = (city, name) => (
    <div className="field">
      <label className="lab"><Building2 />Hotel</label>
      <select name={name} value={form[name]} onChange={setText}>
        {hotels.filter((h) => h.city === city).map((h) => (
          <option key={h._id} value={h._id}>{h.name} · {h.distanceM} m from the Haram</option>
        ))}
      </select>
    </div>
  );

  const feeAndPackage = result
    ? result.lineItems.filter((i) => i.label.startsWith("Package") || i.label.startsWith("Service"))
    : [];

  return (
    <>
      <div className="skyline-deco"><Skyline /></div>

      <section className="hero">
        <div className="hero-lantern"><Lantern /></div>

        <nav className="nav">
          <a className="logo" href="#top">
            <Logo />
            <span><b>Marafiq us Safar</b><small>Your Umrah journey partner</small></span>
          </a>
          <div className="links">
            <a className="on" href="#top">Home</a>
            <a href="#calculator">Umrah Calculator</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-right">
            <div className="lang-wrap">
              <Globe />
              <select className="lang" aria-label="Language" defaultValue="en">
                <option value="en">English</option>
                <option value="ur" disabled>اردو (coming soon)</option>
              </select>
            </div>
            <span className="ar">مرافق السفر</span>
          </div>
        </nav>

        <div className="hero-body" id="top">
          <p className="kicker">Plan · Estimate · Request · Confirm</p>
          <h1>Your Umrah Journey, <em>Simplified.</em></h1>
          <p className="lede">
            Get a personalised cost estimate for your Umrah trip, choose your hotels in
            Makkah and Madinah, and request a confirmed quotation, all in one place.
          </p>
          <p className="hero-quote">{/* add a verified verse here */}</p>
        </div>
      </section>

      <main className="stage" id="calculator">
        {/* ---------- Wizard ---------- */}
        <div className="wizard">
          <div className="steps">
            {STEPS.map(([Icon, name, sub], i) => (
              <button key={name} type="button"
                className={`stp ${i === step ? "on" : i < step ? "done" : ""}`}
                onClick={() => setStep(i)}>
                <span className="c">{i < step ? <Check /> : <Icon />}</span>
                <span><b>{name}</b><small>{sub}</small></span>
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="panel">
              <h2>1. Travellers</h2>
              <p className="sub">Tell us who is travelling and how many you will have in your group.</p>
              <div className="tiles">
                <div className="tile">
                  <div className="t"><User /> Adults</div>
                  <Counter label="adults" value={form.adults} min={1} onChange={set("adults")} />
                  <div className="small">Ages 12+</div>
                </div>
                <div className="tile">
                  <div className="t"><UserRound /> Children</div>
                  <Counter label="children" value={form.children} onChange={set("children")} />
                  <div className="small">Ages 2–11, priced as adults</div>
                </div>
                <div className="tile">
                  <div className="t"><Baby /> Infants</div>
                  <Counter label="infants" value={form.infants} onChange={set("infants")} />
                  <div className="small">Under 2 years (no seat)</div>
                </div>
              </div>

              <div className="two">
                <div className="tile">
                  <label className="lab"><CalendarDays />First night in Makkah</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={setText} />
                </div>
                <div className="tile">
                  <label className="lab"><BedDouble />Guests per room</label>
                  <div className="seg">
                    {[[4, "Quad", "4 per room"], [3, "Triple", "3 per room"], [2, "Double", "2 per room"]].map(([v, n, s]) => (
                      <button type="button" key={v} className={form.roomType === v ? "on" : ""}
                        onClick={() => set("roomType")(v)}>{n}<small>{s}</small></button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <div className="error">{error}</div>}
              <div className="actions">
                <button type="button" className="btn" onClick={() => setStep(1)}>Next: Choose Hotels →</button>
              </div>
              <p className="secure"><Lock />Your information is safe and secure</p>
            </div>
          )}

          {step === 1 && (
            <div className="panel">
              <h2>2. Hotels</h2>
              <p className="sub">Choose where you will stay in each city.</p>
              <div className="block"><h3>Makkah</h3>{hotelSelect("makkah", "makkahHotelId")}</div>
              <div className="block"><h3>Madinah</h3>{hotelSelect("madinah", "madinahHotelId")}</div>
              {error && <div className="error">{error}</div>}
              <div className="actions">
                <button type="button" className="btn ghost" onClick={() => setStep(0)}>← Back</button>
                <button type="button" className="btn" onClick={() => setStep(2)}>Next: Dates →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="panel">
              <h2>3. Dates</h2>
              <p className="sub">How many nights in each city? We assume Makkah first, then Madinah.</p>
              <div className="block">
                <div className="nights">
                  <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Moon size={20} /> Makkah nights</h3>
                  <Counter label="Makkah nights" value={form.makkahNights} onChange={set("makkahNights")} />
                </div>
              </div>
              <div className="block">
                <div className="nights">
                  <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Moon size={20} /> Madinah nights</h3>
                  <Counter label="Madinah nights" value={form.madinahNights} onChange={set("madinahNights")} />
                </div>
              </div>
              <ul className="route block">
                <li><span>Makkah</span><b>{showDate(addDays(form.startDate, 0))} → {showDate(makkahOut)}</b></li>
                <li><span>Madinah</span><b>{showDate(makkahOut)} → {showDate(madinahOut)}</b></li>
                <li><span>Total nights</span><b>{form.makkahNights + form.madinahNights}</b></li>
              </ul>
              {error && <div className="error">{error}</div>}
              <div className="actions">
                <button type="button" className="btn ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn" onClick={() => setStep(3)}>Next: Request →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel">
              <h2>4. Request a confirmed quote</h2>
              <p className="sub">No payment now. Our team checks availability and contacts you.</p>

              {sent ? (
                <div className="done-box">
                  <h3 style={{ fontSize: 28, margin: 0 }}>Jazakallahu khayran</h3>
                  <p style={{ color: "var(--mute)", margin: "6px 0 0" }}>Your reference number</p>
                  <div className="ref">{sent}</div>
                  <p style={{ color: "var(--mute)", fontSize: 14 }}>
                    Our team will send a confirmed quote once availability is checked.
                    This is not yet a booking.
                  </p>
                  <div className="actions">
                    <a className="btn gold" href={waLink} target="_blank" rel="noreferrer">
                      <WhatsAppIcon size={18} /> Continue on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitLead}>
                  <div className="field">
                    <label className="lab">Your name</label>
                    <input type="text" value={lead.name}
                      onChange={(e) => setLead({ ...lead, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="lab">WhatsApp / phone</label>
                    <input type="text" placeholder="+92 300 1234567" value={lead.phone}
                      onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="lab">Note (optional)</label>
                    <textarea rows={3} value={lead.note}
                      onChange={(e) => setLead({ ...lead, note: e.target.value })} />
                  </div>
                  <label className="check">
                    <input type="checkbox" checked={lead.consent}
                      onChange={(e) => setLead({ ...lead, consent: e.target.checked })} />
                    I agree to be contacted about this request by phone or WhatsApp.
                  </label>
                  {leadError && <div className="error">{leadError}</div>}
                  <div className="actions">
                    <button type="button" className="btn ghost" onClick={() => setStep(2)}>← Back</button>
                    <button type="submit" className="btn gold" disabled={sending || !result}>
                      {sending ? "Sending…" : "Request a confirmed quote"}
                    </button>
                  </div>
                  <p className="secure"><Lock />Please do not send passport details here.</p>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ---------- Estimate card ---------- */}
        <aside className="estimate" id="estimate">
          <div className="est-top">
            <h3>Your Estimated Cost</h3>
            <span className="pill">{busy ? "Updating" : "Estimate"}</span>
          </div>

          {!result ? (
            <div className="est-empty">
              Complete the journey steps to see your personalised estimate.
              <div className="kaaba-art"><Kaaba /></div>
            </div>
          ) : (
            <>
              <div className="kaaba-art" style={{ width: 150 }}><Kaaba /></div>
              <ul className="est-lines">
                <li>
                  <span><i className="ei"><Building2 /></i>Makkah{makkahHotel ? ` · ${makkahHotel.name}` : ""}</span>
                  <span>{fmt(result.lineItems.find((i) => i.label === "Makkah hotel")?.sar ?? 0)} SAR</span>
                </li>
                <li>
                  <span><i className="ei"><Building2 /></i>Madinah{madinahHotel ? ` · ${madinahHotel.name}` : ""}</span>
                  <span>{fmt(result.lineItems.find((i) => i.label === "Madinah hotel")?.sar ?? 0)} SAR</span>
                </li>
                {feeAndPackage.map((i) => (
                  <li key={i.label}>
                    <span><i className="ei"><Package /></i>{i.label}</span>
                    <span>{fmt(i.sar)} SAR</span>
                  </li>
                ))}
                <li className="na">
                  <span><i className="ei"><Plane /></i>Flights & other services</span>
                  <span>Not included</span>
                </li>
              </ul>

              <div className="total-lab">Estimated Total</div>
              <div className={`total ${busy ? "dim" : ""}`}>
                {fmt(result.totalPkr)} – {fmt(result.highPkr)} <small>PKR</small>
              </div>
              <div className="sar">
                SAR {fmt(result.totalSar)} – {fmt(result.highSar)} · about PKR {fmt(result.perPersonPkr)} per traveller
              </div>

              {sent && (
                <div className="stampbox"><small>Request received</small><strong>{sent}</strong></div>
              )}

              <details>
                <summary>Assumptions</summary>
                <ul>{result.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
              </details>

              <div className="note">
                <Info />This is an estimate only, not a booking or guaranteed price. Valid until{" "}
                {new Date(result.expiresAt).toLocaleString()}. Final price may vary based on
                availability and confirmation.
              </div>
            </>
          )}
        </aside>
      </main>

      <section className="trust" id="about">
        <div className="tr"><i><Building2 /></i><span><b>Trusted Hotels</b>Prime locations in Makkah & Madinah</span></div>
        <div className="tr"><i><ReceiptText /></i><span><b>Transparent Pricing</b>A clear breakdown, always a range</span></div>
        <div className="tr"><i><FilePenLine /></i><span><b>Easy Request</b>Ask for a quotation in minutes</span></div>
        <div className="tr"><i><Headset /></i><span><b>Real Support</b>Every request gets a reference number</span></div>
      </section>

      <a className="wa-float" href={waLink} target="_blank" rel="noreferrer" id="contact">
        <WhatsAppIcon size={24} />
        <span>Chat on WhatsApp<small>Get quick support</small></span>
      </a>

      {result && (
        <div className="mobilebar">
          <div>
            <small>Estimate</small>
            <strong>PKR {fmt(result.totalPkr)} – {fmt(result.highPkr)}</strong>
          </div>
          <a href="#estimate">Details</a>
        </div>
      )}

      <p className="footer">Final prices and availability are confirmed in writing by our team.</p>
    </>
  );
}
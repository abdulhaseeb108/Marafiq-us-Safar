import { Info, Lock } from "lucide-react";

export function LeadForm({ lead, setLead, onSubmit, error, sending, disabled }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="field">
        <label className="lab" htmlFor="ld-name">Your name</label>
        <input
          id="ld-name"
          type="text"
          autoComplete="name"
          value={lead.name}
          onChange={(event) => setLead({ ...lead, name: event.target.value })}
        />
      </div>
      <div className="field">
        <label className="lab" htmlFor="ld-phone">WhatsApp / phone</label>
        <input
          id="ld-phone"
          type="text"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+92 300 1234567"
          value={lead.phone}
          onChange={(event) => setLead({ ...lead, phone: event.target.value })}
        />
      </div>
      <div className="field">
        <label className="lab" htmlFor="ld-note">Note (optional)</label>
        <textarea
          id="ld-note"
          rows={3}
          value={lead.note}
          onChange={(event) => setLead({ ...lead, note: event.target.value })}
        />
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={lead.consent}
          onChange={(event) => setLead({ ...lead, consent: event.target.checked })}
        />
        I agree to be contacted about this request by phone or WhatsApp.
      </label>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn grow" disabled={sending || disabled}>
          {sending ? "Sending…" : "Request a confirmed quote"}
        </button>
      </div>
      <p className="hint"><Lock size={13} aria-hidden="true" /> Please do not send passport details here.</p>
    </form>
  );
}

export function RequestConfirmation({ reference, waLink }) {
  if (!reference) return null;
  return (
    <div className="note" role="status">
      <Info aria-hidden="true" />
      <span>
        <b>Request received. Your reference is {reference}.</b> Our team will check availability and send a confirmed quote.
        This is not yet a booking.{" "}
        <a href={waLink} target="_blank" rel="noreferrer">Continue on WhatsApp</a>
      </span>
    </div>
  );
}

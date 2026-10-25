import { Baby, CalendarDays, MapPin, Users } from "lucide-react";
import { NEEDS, PLACES, SERVICES, TRIP_TYPES } from "../data/calculator.jsx";
import Counter from "./Counter.jsx";
import CheckGroup from "./CheckGroup.jsx";

export default function OtherTripPage({
  trip, updateTrip, tripTravellers, leadForm, doneBox, sent, headingRef, onHome, service,
}) {
  const pageContent = {
    hajj: {
      title: "Plan your Hajj journey",
      description: "Tell us what you need, and our team will help you plan the details of your Hajj travel.",
    },
    tours: {
      title: "Plan your guided tour",
      description: "Share your destination and preferences so our team can prepare a thoughtful travel quotation.",
    },
    flights: {
      title: "Find the right flights",
      description: "Send us your travel details and our team will help with flight options and availability.",
    },
    visa: {
      title: "Get visa assistance",
      description: "Tell us where you are travelling and our team will guide you through the visa assistance options.",
    },
  }[service] || {
    title: "Tell us about your trip",
    description: "A rough idea is enough. We do not show instant prices for this service yet. Our team prepares a quotation.",
  };

  return (
    <div className="layout">
      <section className="box panel" aria-labelledby="h-other">
        <button type="button" className="link" onClick={onHome}>← Back to home</button>
        <h2 id="h-other" ref={headingRef} tabIndex={-1}>{pageContent.title}</h2>
        <p className="lead">{pageContent.description}</p>

        <div className="field">
          <label className="lab" htmlFor="o-dest"><MapPin aria-hidden="true" />Destination</label>
          <input
            id="o-dest"
            type="text"
            placeholder="e.g. Turkey"
            value={trip.destination}
            onChange={(event) => updateTrip({ destination: event.target.value })}
          />
          <div className="chips">
            {PLACES.map((place) => (
              <button
                type="button"
                key={place}
                className="chip"
                aria-pressed={trip.destination === place}
                onClick={() => updateTrip({ destination: place })}
              >{place}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="lab" htmlFor="o-type">Type of trip</label>
          <select id="o-type" value={trip.tripType} onChange={(event) => updateTrip({ tripType: event.target.value })}>
            {TRIP_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div className="grid2">
          <div className="field">
            <span className="lab" id="o-ad"><Users aria-hidden="true" />Adults</span>
            <Counter id="o-ad" label="adults" value={trip.adults} min={1} onChange={(value) => updateTrip({ adults: value })} />
          </div>
          <div className="field">
            <span className="lab" id="o-in"><Baby aria-hidden="true" />Infants</span>
            <Counter id="o-in" label="infants" value={trip.infants} max={trip.adults} onChange={(value) => updateTrip({ infants: value })} />
          </div>
          <div className="field">
            <span className="lab" id="o-ch">Children (2–11)</span>
            <Counter id="o-ch" label="children" value={trip.children} onChange={(value) => updateTrip({ children: value })} />
          </div>
          <div className="field">
            <span className="lab" id="o-ni">Nights</span>
            <Counter id="o-ni" label="nights" value={trip.nights} min={1} max={90} onChange={(value) => updateTrip({ nights: value })} />
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label className="lab" htmlFor="o-date"><CalendarDays aria-hidden="true" />Approximate start date</label>
            <input
              id="o-date"
              type="date"
              value={trip.startDate}
              onChange={(event) => updateTrip({ startDate: event.target.value })}
            />
          </div>
          <div className="field">
            <label className="lab" htmlFor="o-bud">Budget per person in PKR (optional)</label>
            <input
              id="o-bud"
              type="text"
              inputMode="numeric"
              value={trip.budgetPkr}
              onChange={(event) => updateTrip({ budgetPkr: event.target.value.replace(/[^0-9]/g, "") })}
            />
          </div>
        </div>
        <CheckGroup
          legend="What do you need help with?"
          options={SERVICES}
          value={trip.services}
          onChange={(value) => updateTrip({ services: value })}
        />
        <CheckGroup
          legend="Muslim travel needs"
          options={NEEDS}
          value={trip.needs}
          onChange={(value) => updateTrip({ needs: value })}
        />

        <h3>Your contact details</h3>
        <p className="lead" style={{ marginTop: 4 }}>No payment now.</p>
        {sent ? doneBox : leadForm}
      </section>
      <aside className="box sum" aria-label="Trip summary">
        <div className="sum-body">
          <h2>Your trip</h2>
          <dl>
            <dt>Destination</dt><dd>{trip.destination || "Not selected"}</dd>
            <dt>Trip type</dt><dd>{trip.tripType}</dd>
            <dt>Travellers</dt><dd>{tripTravellers}</dd>
            <dt>Nights</dt><dd>{trip.nights}</dd>
            <dt>Departing from</dt><dd>{trip.departureCity || "Not specified"}</dd>
            {trip.requestPreference && <><dt>Preference</dt><dd>{trip.requestPreference}</dd></>}
            <dt>Price</dt><dd>Quoted by our team</dd>
          </dl>
        </div>
      </aside>
    </div>
  );
}

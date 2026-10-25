import { Bus, Check, MapPin } from "lucide-react";
import { CITY } from "../data/calculator.jsx";
import { fmt, plural, priceFor, showDate } from "../utils/travel.js";
import Counter from "./Counter.jsx";

export default function HotelStep({
  city, stay, nights, onNights, list, status, value, onPick, roomType, error,
  calcError, headingRef, onBack, onNext, routeSelected,
}) {
  if (!stay) return null;
  const name = CITY[city];
  const landmark = city === "makkah" ? "Haram" : "Masjid an-Nabawi";

  return (
    <section aria-labelledby={`h-${city}`}>
      <h2 id={`h-${city}`} ref={headingRef} tabIndex={-1}>Select a Hotel in {name}</h2>
      <p className="lead">
        Choose a hotel that suits your group. Prices include service fees; our team will confirm the final price.
      </p>
      {!routeSelected && <p className="hint">Hotel dates are a starting point based on Route 1 and may update after you choose your route.</p>}

      <div className="stay">
        <div className="stay-card">
          <span className="lab">Check-in</span>
          <b>{showDate(stay.checkIn)}</b>
        </div>
        <div className="stay-card">
          <span className="lab">Check-out</span>
          <b>{showDate(stay.checkOut)}</b>
        </div>
        <div className="stay-card stay-nights">
          <span className="lab" id={`n-${city}`}>Nights in {name}</span>
          <Counter id={`n-${city}`} label={`nights in ${name}`} value={nights} min={1} max={60} onChange={onNights} />
        </div>
      </div>
      <p className="range">{showDate(stay.checkIn)} → {showDate(stay.checkOut)} · {plural(nights, "night")} in {name}</p>
      <div className="slide">
        <div className="slide-head">
          <label htmlFor={`sl-${city}`}>Adjust nights in {name}</label>
          <b>{nights}</b>
        </div>
        <input
          id={`sl-${city}`}
          type="range"
          className="slider"
          min={1}
          max={30}
          value={Math.min(nights, 30)}
          style={{ "--p": `${((Math.min(nights, 30) - 1) / 29) * 100}%` }}
          onChange={(event) => onNights(Number(event.target.value))}
        />
      </div>
      <fieldset>
        <legend className="lab">{name} hotels</legend>
        {status === "loading" && <p className="hint">Loading hotels…</p>}
        {status === "error" && (
          <p className="err" role="alert">Could not load hotels. Check that the server is running, then try again.</p>
        )}
        <div className="opts">
          {list.map((hotel) => {
            const price = priceFor(hotel, roomType);
            const selected = value === hotel._id;
            const distance = hotel.distanceText || (hotel.distanceM ? `${fmt(hotel.distanceM)} m` : null);
            return (
              <label key={hotel._id} className={`opt ${selected ? "on" : ""} ${price.off ? "off" : ""}`}>
                <input
                  type="radio"
                  className="sr"
                  name={`hotel-${city}`}
                  value={hotel._id}
                  checked={selected}
                  disabled={!!price.off}
                  onChange={() => onPick(hotel._id)}
                />
                <span className="opt-main">
                  <b>{hotel.name}</b>
                  {hotel.oldName && <small>Formerly {hotel.oldName}</small>}
                  {hotel.area && <small>{hotel.area}</small>}
                  <span className="tags">
                    {hotel.category && <span>{hotel.category}</span>}
                    {distance && <span><MapPin aria-hidden="true" />Distance from {landmark}: {distance}</span>}
                    {hotel.shuttle && <span><Bus aria-hidden="true" />{landmark} access: Shuttle</span>}
                  </span>
                </span>
                <span className="opt-price">
                  <strong>{price.text}</strong>
                  {price.secondary && <small>{price.secondary}</small>}
                  <small>{price.note}</small>
                </span>
                {selected && <Check className="tick" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {calcError && <p className="err" role="alert">{calcError}</p>}
      </fieldset>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onBack}>Back</button>
        <button type="button" className="btn" onClick={onNext}>Continue</button>
      </div>
    </section>
  );
}

import {
  Baby, BedDouble, Building2, CalendarDays, Check, ChevronDown, Clock, Download,
  Info, MapPin, Plane, Route as RouteIcon, Users, X,
} from "lucide-react";
import {
  CITY, DEPARTURE_CITIES, ROUTES, ROOM_NAME, ROOMS, STEP_ICONS, STEPS,
  TRANSPORTS, TRANSPORT_ICONS,
} from "../data/calculator.jsx";
import { allocateRoomBeds, fmt, plural, showDate, validDate } from "../utils/travel.js";
import Counter from "./Counter.jsx";
import HotelStep from "./HotelStep.jsx";
import ArrivalDatePicker from "./ArrivalDatePicker.jsx";

function TravelDetailsStep({ form, errors, updateForm, onNext, onHome, headingRef }) {
  const soloTraveler = form.adults === 1 && form.children === 0 && form.infants === 0;
  const roomOccupants = form.adults + form.children + (form.infantBed === "required" ? form.infants : 0);
  const roomOptions = soloTraveler
    ? ROOMS.filter(([value]) => value === "sharing" || value === 1)
    : ROOMS.filter(([value]) => value !== 1);
  const roomBeds = allocateRoomBeds(
    roomOccupants,
    form.roomType,
    form.primaryRoomCount,
    form.additionalRoomType,
    form.children > 2 ? 2 : 1
  );

  return (
    <form className="travel-details-form" onSubmit={(event) => { event.preventDefault(); onNext(); }} noValidate>
      <div className="travel-details-intro">
        <h2 ref={headingRef} tabIndex={-1}>Tell us about your trip</h2>
        <p className="lead">Choose your travel dates and room arrangement to begin your estimate.</p>
      </div>
      {Object.keys(errors).length > 0 && (
        <p className="err" role="alert">Please fix the highlighted fields before continuing.</p>
      )}
      <div className="grid2 traveler-grid">
        <div className="field traveler-card">
          <span className="lab" id="l-adults"><Users aria-hidden="true" />Adults</span>
          <Counter id="l-adults" label="adults" value={form.adults} min={1} onChange={(value) => updateForm({ adults: value })} />
          {errors.adults && <p className="err" role="alert">{errors.adults}</p>}
        </div>
        <div className="field traveler-card">
          <span className="lab" id="l-infants"><Baby aria-hidden="true" />Infants</span>
          <Counter id="l-infants" label="infants" value={form.infants} max={form.adults} onChange={(value) => updateForm({ infants: value })} />
          {errors.infants && <p className="err" role="alert">{errors.infants}</p>}
        </div>
        <div className="field traveler-card">
          <span className="lab" id="l-children"><Users aria-hidden="true" />Children</span>
          <Counter id="l-children" label="children" value={form.children} max={30} onChange={(value) => updateForm({ children: value })} />
          {errors.children && <p className="err" role="alert">{errors.children}</p>}
        </div>
      </div>
      {(form.infants > 0 || form.children > 0) && (
        <fieldset className="infant-bed-options" aria-describedby={errors.infantBed ? "e-infant-bed" : undefined}>
          <legend className="lab">Infant and child mattress preference</legend>
          <p className="hint">Choose whether infants and children need a separate mattress.</p>
          <div className="infant-bed-choices">
            <label className={`infant-bed-choice ${form.infantBed === "required" ? "selected" : ""}`}>
              <input type="radio" name="infantBed" value="required" checked={form.infantBed === "required"} onChange={() => updateForm({ infantBed: "required" })} />
              <span><b>Mattress required</b><small>For infants, the additional mattress rate needs confirmation.</small></span>
            </label>
            <label className={`infant-bed-choice ${form.infantBed === "none" ? "selected" : ""}`}>
              <input type="radio" name="infantBed" value="none" checked={form.infantBed === "none"} onChange={() => updateForm({ infantBed: "none" })} />
              <span><b>No separate mattress</b><small>Infants and children will share existing bedding.</small></span>
            </label>
          </div>
          {errors.infantBed && <p className="err" id="e-infant-bed" role="alert">{errors.infantBed}</p>}
        </fieldset>
      )}
      <div className="departure-arrival-grid">
        <div className="field departure-field">
          <label className="lab" htmlFor="departure-city"><Plane aria-hidden="true" />Departure city</label>
          <input
            id="departure-city"
            type="text"
            list="departure-city-options"
            autoComplete="off"
            placeholder="Enter your departure city"
            value={form.departureCity}
            onChange={(event) => updateForm({ departureCity: event.target.value })}
          />
          <datalist id="departure-city-options">
            {DEPARTURE_CITIES.filter((city) => city !== "Other").map((city) => <option key={city} value={city} />)}
          </datalist>
        </div>
        <div className="field">
          <span className="lab"><CalendarDays aria-hidden="true" />Arrival date (first check-in)</span>
          <ArrivalDatePicker
            value={form.startDate}
            error={errors.date}
            onChange={(startDate) => updateForm({ startDate })}
          />
          <p className="hint" id="h-date">Travel dates are flexible by ±7 days, subject to availability.</p>
          {errors.date && <p className="err" id="e-date" role="alert">{errors.date}</p>}
        </div>
      </div>
      <fieldset>
        <legend className="lab"><BedDouble aria-hidden="true" />Room type</legend>
        <div className="opts cols">
          {roomOptions.map(([value, name, description]) => {
            const selected = String(form.roomType) === String(value);
            return (
              <label key={value} className={`opt ${selected ? "on" : ""}`}>
                <input
                  type="radio"
                  className="sr"
                  name="room"
                  checked={selected}
                  onChange={() => updateForm({
                    roomType: value,
                    primaryRoomCount: 1,
                    additionalRoomType: [2, 3, 4].includes(Number(value)) ? Number(value) : 4,
                  })}
                />
                <span className="opt-main"><b>{name}</b><small>{description}</small></span>
                {selected && <Check className="tick" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
        {errors.roomType && <p className="err" role="alert">{errors.roomType}</p>}
      </fieldset>
      {form.children > 2 && (
        <div className="note child-room-reminder" role="status">
          <Info aria-hidden="true" />
          <span>With more than two children, an additional room is required. Our team will confirm the room arrangement and final price.</span>
        </div>
      )}
      {form.adults > 3 && [2, 3, 4].includes(Number(form.roomType)) && (
        <fieldset className="allocation-panel">
          <legend className="lab"><BedDouble aria-hidden="true" />Additional room allocation</legend>
          <p className="hint">Choose how many rooms use {ROOM_NAME[form.roomType]} first, then select a preferred size for the remaining guests. Rates follow actual occupancy and existing supplier rates.</p>
          <div className="grid2 allocation-fields">
            <div className="field traveler-card allocation-count">
              <span className="lab" id="l-primary-rooms">Number of {ROOM_NAME[form.roomType]} rooms</span>
              <Counter
                id="l-primary-rooms"
                label={`${ROOM_NAME[form.roomType]} rooms`}
                value={form.primaryRoomCount}
                min={1}
                max={Math.max(1, Math.floor(roomOccupants / Number(form.roomType)))}
                onChange={(value) => updateForm({ primaryRoomCount: value })}
              />
            </div>
            <label className="field">
              <span className="lab" htmlFor="additional-room-type">Additional room size preference</span>
              <select
                id="additional-room-type"
                value={form.additionalRoomType}
                onChange={(event) => updateForm({ additionalRoomType: Number(event.target.value) })}
              >
                {ROOMS.filter(([value]) => [2, 3, 4].includes(Number(value))).map(([value, name]) => (
                  <option key={value} value={value}>{name}</option>
                ))}
              </select>
            </label>
          </div>
          {roomBeds.length > 0 && <p className="allocation-result" role="status">Room occupancy: {roomBeds.join(" + ")} guest(s)</p>}
        </fieldset>
      )}
      <div className="note visa-reminder"><Info aria-hidden="true" />
        <span>If you do not have your Umrah visa, we recommend applying at least 10 days before your expected travel date.</span>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onHome}>Change destination</button>
        <button type="submit" className="btn">Continue</button>
      </div>
    </form>
  );
}

function RouteStep({ form, errors, updateForm, onBack, onNext, headingRef }) {
  return (
    <section aria-labelledby="h-route">
      <h2 id="h-route" ref={headingRef} tabIndex={-1}>Choose your route</h2>
      <p className="lead">Select the order for your Makkah and Madinah stays.</p>
      <p className="hint">Hotel rates and availability will be rechecked against the dates in your selected route.</p>
      <fieldset className="route-transport-section">
        <legend className="lab"><MapPin aria-hidden="true" />Route and itinerary</legend>
        <div className="opts cols">
          {Object.entries(ROUTES).filter(([id]) => ["route2", "route3", "custom"].includes(id)).map(([id, route]) => {
            const selected = form.route === id;
            return (
              <label key={id} className={`route-card ${selected ? "on" : ""}`}>
                <input
                  type="radio"
                  className="sr"
                  name="route"
                  checked={selected}
                  onChange={() => updateForm({ route: id })}
                />
                <span className="route-card-heading">
                  <span className="ico"><RouteIcon aria-hidden="true" /></span>
                  <b>{route.title}</b>
                  <span className="route-select-indicator" aria-hidden="true">
                    {selected && <Check />}
                  </span>
                </span>
                {id === "custom" ? (
                  <span className="custom-route-preview">
                    <MapPin aria-hidden="true" />
                    <span>Enter your preferred itinerary.</span>
                  </span>
                ) : (
                  <ol className="route-stops" aria-label={`${route.title} stops`}>
                    {route.stops.map((stop, index) => (
                      <li key={`${stop}-${index}`} className={index === 0 || index === route.stops.length - 1 ? "terminal" : ""}>
                        <span className="route-stop-icon" aria-hidden="true">
                          {stop === "Jeddah" ? <Plane /> : <Building2 />}
                        </span>
                        <span>{stop}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </label>
            );
          })}
        </div>
        {errors.route && <p className="err" role="alert">{errors.route}</p>}
        {form.route === "custom" && (
          <div className="field custom-route-field">
            <label className="lab" htmlFor="custom-route">Your preferred itinerary</label>
            <input
              id="custom-route"
              type="text"
              value={form.customRoute}
              placeholder="e.g. Jeddah → Makkah → Madinah → Jeddah"
              aria-invalid={!!errors.customRoute}
              onChange={(event) => updateForm({ customRoute: event.target.value })}
            />
            {errors.customRoute && <p className="err" role="alert">{errors.customRoute}</p>}
            <p className="hint">Custom itineraries are recorded for your request; transport availability and pricing are confirmed by our team.</p>
          </div>
        )}
      </fieldset>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onBack}>Back</button>
        <button type="button" className="btn" onClick={onNext}>Continue</button>
      </div>
    </section>
  );
}

function ZiyaratStep({ form, updateForm, transport, plan, fxSarToPkr, onBack, onNext, headingRef }) {
  const ziyaratCities = [...new Set(plan?.order || [])];
  return (
    <section aria-labelledby="h-veh">
      <h2 id="h-veh" ref={headingRef} tabIndex={-1}>Choose transport & ziyarat</h2>
      <p className="lead">Choose how you would like to travel between destinations, then add any optional ziyarat visits.</p>
      <fieldset className="route-transport-section">
        <legend className="lab"><RouteIcon aria-hidden="true" />Ground transport</legend>
        <div className="opts cols">
          {TRANSPORTS.map((option) => {
            const selected = form.transport === option.id;
            return (
              <label key={option.id} className={`opt stack ${selected ? "on" : ""}`}>
                <input
                  type="radio"
                  className="sr"
                  name="transport"
                  checked={selected}
                  onChange={() => updateForm({ transport: option.id })}
                />
                <span className="ico">{TRANSPORT_ICONS[option.id]}</span>
                <b>{option.name}</b>
                {option.priceSar ? (
                  <span className="transport-price">
                    <b>{fxSarToPkr
                      ? `PKR ${fmt(Math.round(option.priceSar.min * fxSarToPkr))} – ${fmt(Math.round(option.priceSar.max * fxSarToPkr))}`
                      : "Price depends on group size"}</b>
                    {fxSarToPkr && <small>SAR {fmt(option.priceSar.min)} – {fmt(option.priceSar.max)} per person</small>}
                  </span>
                ) : (
                  <span className="price-big">{option.price}</span>
                )}
                <small>{option.note}</small>
                <p style={{ margin: "8px 0 0", fontSize: 14 }}>{option.text}</p>
                {selected && <Check className="tick" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
        {form.transport !== "bus" && (
          <div className="note"><Info aria-hidden="true" />
            <span>The supplier sheets have no private-transport prices. Our team quotes vehicles separately, and the visa price may change.</span>
          </div>
        )}
      </fieldset>
      {form.transport === "bus" ? (
        <p className="lead">All route transport travels by shared bus and is included with your visa.</p>
      ) : (
        <div className="note" style={{ marginTop: 16 }}><Info aria-hidden="true" />
          <span>
            <b>{transport.name}.</b> Vehicle choices and prices are not loaded online yet. Our team will quote vehicles for each
            {form.transport === "partial" ? " city-to-city leg (airport transfers stay on the shared bus)" : " leg"} and
            confirm the visa price. Nothing is added to your estimate for vehicles.
          </span>
        </div>
      )}
      <h3 style={{ marginTop: 32 }}>Add ziyarat trips</h3>
      <p className="lead" style={{ marginTop: 4 }}>
        Optional guided visits to historical sites, priced per vehicle. Our team quotes the price; nothing is added to your estimate.
      </p>
      <fieldset>
        <legend className="sr">Optional ziyarat trips</legend>
        <div className="opts">
          {ziyaratCities.map((city) => {
            const selected = form.ziyarat.includes(city);
            return (
              <label key={city} className={`opt ${selected ? "on" : ""}`}>
                <input
                  type="checkbox"
                  className="sr"
                  checked={selected}
                  onChange={() => updateForm({
                    ziyarat: selected
                      ? form.ziyarat.filter((item) => item !== city)
                      : [...form.ziyarat, city],
                  })}
                />
                <span className="ico"><MapPin aria-hidden="true" /></span>
                <span className="opt-main"><b>{CITY[city]} Hotel → {CITY[city]} Ziyarat</b><small>Priced per vehicle</small></span>
                <span className="opt-price"><small>Price on request</small></span>
                {selected && <Check className="tick" aria-hidden="true" />}
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="hint">Ziyarat is optional. You can continue without selecting any.</p>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={onBack}>Back</button>
        <button type="button" className="btn" onClick={onNext}>Continue</button>
      </div>
    </section>
  );
}

function EstimateStep({
  result, plan, form, route, transport, busy, calcError, nameOf, onBack, onDownloadPdf,
  pdfBusy, pdfError, sent, doneBox, leadForm, headingRef, quoteOnly, quoteReason,
}) {
  const toPkr = (sar) => Math.round(sar * result.fxSarToPkr);

  return (
    <section aria-labelledby="h-sum">
      <h2 id="h-sum" ref={headingRef} tabIndex={-1}>Review your package</h2>
      {busy && <p className="hint" role="status">Updating your estimate…</p>}
      {calcError && <p className="err" role="alert">{calcError}</p>}
      {quoteOnly && (
        <div className="note"><Info aria-hidden="true" />
          <span>{quoteReason} No price has been estimated; request a confirmed quote from our team.</span>
        </div>
      )}
      {!result && !busy && !calcError && !quoteOnly && <p className="err" role="alert">Select both hotels to see a price.</p>}

      {quoteOnly && (
        <>
          <div className="sumlist">
            <p className="big">
              {plural(form.adults, "adult")}{form.children ? ` · ${plural(form.children, "child")}` : ""}{form.infants ? ` · ${plural(form.infants, "infant")}` : ""}
            </p>
            <p>{route.text} · {transport.name} · {plural(form.makkahNights + form.madinahNights, "night")} total</p>
          </div>
          <h3>Request your confirmed quote</h3>
          {sent ? doneBox : leadForm}
          <div className="actions"><button type="button" className="btn ghost" onClick={onBack}>Back</button></div>
        </>
      )}

      {result && plan && (
        <>
          <div className="sumlist">
            <p className="big">
              {plural(form.adults, "adult")}{form.children ? ` · ${plural(form.children, "child")}` : ""}{form.infants ? ` · ${plural(form.infants, "infant")}` : ""} · {showDate(form.startDate)} → {showDate(plan.end)}
            </p>
            <p>{route.text} · {transport.name} · {plural(result.totalNights, "night")} total · Departing from {form.departureCity}</p>
          </div>
          <h3>Itinerary</h3>
          <ul className="bd" style={{ listStyle: "none", padding: 0 }}>
            {plan.order.map((city) => (
              <li key={city} className="r">
                <span><b>{CITY[city]}</b><small>{nameOf(city)}</small></span>
                <span>{showDate(plan.stays[city].checkIn)} → {showDate(plan.stays[city].checkOut)} ({plural(plan.stays[city].nights, "night")})</span>
              </li>
            ))}
          </ul>

          <h3>Cost breakdown</h3>
          <div className="bd">
            <div className="r">
              <span>
                <b>Umrah visa · {transport.name} · {plural(form.adults, "adult")}{form.children ? ` · ${plural(form.children, "child")}` : ""}{form.infants ? ` · ${plural(form.infants, "infant")}` : ""}</b>
                <small>{result.pkg.payers} × SAR {fmt(result.pkg.perPerson)} per person{form.infants ? ` + ${form.infants} × SAR ${fmt(result.pkg.infantSar)} per infant` : ""}</small>
              </span>
              <span className="price-breakdown">
                <strong>PKR {fmt(toPkr(result.lineItems[0].sar))}</strong>
                <small>SAR {fmt(result.lineItems[0].sar)}</small>
              </span>
            </div>
            <div className="r">
              <span><b>{form.transport === "bus" ? "Ground transport by sharing bus" : "Private vehicles"}</b>
                <small>{form.transport === "bus" ? "Included with the visa" : "Quoted by our team"}</small></span>
              <span className="price-breakdown">
                <strong>{form.transport === "bus" ? "PKR 0" : "On request"}</strong>
                {form.transport === "bus" && <small>SAR 0</small>}
              </span>
            </div>
            {result.stays.map((stay) => (
              <div className="r" key={stay.city}>
                <span><b>{stay.hotel} · {plural(stay.nights, "night")}</b><small>{stay.detail}</small></span>
                <span className="price-breakdown">
                  <strong>PKR {fmt(toPkr(stay.sar))}</strong>
                  <small>SAR {fmt(stay.sar)}</small>
                </span>
              </div>
            ))}
            <div className="r">
              <span><b>Service and payment fee</b></span>
              <span className="price-breakdown">
                <strong>PKR {fmt(toPkr(result.lineItems[3].sar))}</strong>
                <small>SAR {fmt(result.lineItems[3].sar)}</small>
              </span>
            </div>
            <div className="r">
              <span><b>Ziyarat</b><small>{result.ziyarat.length ? "Requested, priced per vehicle by our team" : "Not selected"}</small></span>
              <span className="price-breakdown">
                <strong>{result.ziyarat.length ? "On request" : "PKR 0"}</strong>
                {!result.ziyarat.length && <small>SAR 0</small>}
              </span>
            </div>
          </div>

          <div className="grand">
            <span>Estimated total</span>
            <b>PKR {fmt(result.totalPkr)} – {fmt(result.highPkr)}</b>
            <small className="grand-secondary">Approx. SAR {fmt(result.totalSar)} – {fmt(result.highSar)}</small>
            <span>About PKR {fmt(result.perPersonPkr)} per traveller</span>
          </div>
          {result.pending.length > 0 && (
            <ul className="note" style={{ display: "block", listStyle: "none" }}>
              {result.pending.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <details style={{ margin: "16px 0" }}>
            <summary>Assumptions</summary>
            <ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
          </details>
          <div className="note"><Info aria-hidden="true" />
            <span>
              This is an estimate, not a confirmed booking. Valid until {new Date(result.expiresAt).toLocaleString()}.
              Cancellation and refund terms, final availability and final prices are confirmed by our team in writing before any payment.
            </span>
          </div>
          <div className="actions">
            <button type="button" className="btn ghost" onClick={onBack}>Back</button>
            <button type="button" className="btn" onClick={onDownloadPdf} disabled={pdfBusy}>
              <Download size={18} aria-hidden="true" /> {pdfBusy ? "Preparing PDF…" : "Download estimate as PDF"}
            </button>
          </div>
          {pdfError && <p className="err dl-err" role="alert">{pdfError}</p>}
          <h3 style={{ marginTop: 32 }}>Request a confirmed quote</h3>
          <p className="lead" style={{ marginTop: 4 }}>No payment now. Our team checks availability and contacts you.</p>
          {sent ? doneBox : leadForm}
        </>
      )}
      {!result && !quoteOnly && (
        <div className="actions"><button type="button" className="btn ghost" onClick={onBack}>Back</button></div>
      )}
    </section>
  );
}

function SummaryPanel({
  form, plan, result, route, transport, nameOf, busy, calcError, totalText, roomAllocations,
  liveMessage, open, setOpen, inRange, quoteOnly,
}) {
  return (
    <aside className={`box sum ${open ? "" : "closed"}`} aria-label="Live package summary">
      <button type="button" className="sum-toggle" aria-expanded={open} aria-controls="sum-body" onClick={() => setOpen((value) => !value)}>
        <span><small>Your package</small><br /><b>{busy ? "Updating…" : totalText}</b></span>
        <ChevronDown aria-hidden="true" />
      </button>
      <div className="sum-body" id="sum-body">
        <h2>Your package</h2>
        <div className="stats">
          <div><b>{form.makkahNights + form.madinahNights}</b><span>Nights</span></div>
          <div><b>{form.adults + form.children + form.infants}</b><span>Travellers</span></div>
          <div><b>{form.roomType === "sharing" ? "Shared" : (result?.rooms.length ?? roomAllocations.length) || "–"}</b><span>Rooms</span></div>
        </div>
        <dl>
          <dt>Travellers</dt><dd>{plural(form.adults, "adult")}{form.children ? `, ${plural(form.children, "child")}` : ""}{form.infants ? `, ${plural(form.infants, "infant")}` : ""}</dd>
          <dt>Departure city</dt><dd>{form.departureCity || "Not selected"}</dd>
          <dt>Arrival</dt><dd>{validDate(form.startDate) ? showDate(form.startDate) : "Not selected"}</dd>
          <dt>Room type</dt><dd>{ROOM_NAME[form.roomType] || "Not selected"}</dd>
          {(form.infants > 0 || form.children > 0) && (
            <>
              <dt>Infant/child mattress</dt>
              <dd>{form.infantBed === "required" ? "Required" : form.infantBed === "none" ? "Not required" : "Not selected"}</dd>
            </>
          )}
          {[1, 2, 3, 4].includes(Number(form.roomType)) && roomAllocations.length > 0 && (
            <>
              <dt>Room allocation</dt>
              <dd>{roomAllocations.join(" + ")} guest(s) per room</dd>
            </>
          )}
          {form.children > 2 && (
            <>
              <dt>Room note</dt><dd>An additional room is required; final arrangement and price will be confirmed by our team.</dd>
            </>
          )}
          <dt>Transport</dt><dd>{transport.name}</dd>
          <dt>Route</dt><dd>{route.text}</dd>
        </dl>
        <h3>Journey</h3>
        <ol className="timeline">
          <li>
            <span className="pt"><Plane aria-hidden="true" /></span>
            <b>{form.route ? `Arrive in ${route.land}` : "Route not selected"}</b>
            <small>{validDate(form.startDate) ? showDate(form.startDate) : "Choose an arrival date"}</small>
          </li>
          {!form.route ? (
            <li>
              <span className="pt"><RouteIcon aria-hidden="true" /></span>
              <b>Choose a route</b>
              <small>Your journey itinerary will appear after you select one.</small>
            </li>
          ) : ["route3", "route4"].includes(form.route) ? (
            <>
              {ROUTES[form.route].order.map((city, index) => (
                <li key={`${city}-${index}`}>
                  <span className="pt"><Building2 aria-hidden="true" /></span>
                  <b>Visit {index + 1}: {CITY[city]}</b>
                  <small>{CITY[city]} night allocation to be confirmed</small>
                  <small>{nameOf(city) || "Hotel not selected"}</small>
                </li>
              ))}
              <li>
                <span className="pt"><Plane aria-hidden="true" /></span>
                <b>{form.route === "route4" ? "Depart from Jeddah airport" : `Depart from ${route.home}`}</b>
                <small>Departure date confirmed with your itinerary quote</small>
              </li>
            </>
          ) : form.route === "custom" ? (
            <>
              <li>
                <span className="pt"><RouteIcon aria-hidden="true" /></span>
                <b>Custom itinerary</b>
                <small>{route.text}</small>
                <small>Visit order and stay dates confirmed with your quote</small>
              </li>
              <li>
                <span className="pt"><Plane aria-hidden="true" /></span>
                <b>Departure details</b>
                <small>Confirmed with your itinerary quote</small>
              </li>
            </>
          ) : (
            <>
              {(plan ? plan.order : route.order).map((city) => (
                <li key={city}>
                  <span className="pt"><Building2 aria-hidden="true" /></span>
                  <b>{CITY[city]} · {plural(form[`${city}Nights`], "night")}</b>
                  <small>{plan ? `${showDate(plan.stays[city].checkIn)} → ${showDate(plan.stays[city].checkOut)}` : "Dates need an arrival date"}</small>
                  <small>{nameOf(city) || "Hotel not selected"}</small>
                </li>
              ))}
              <li>
                <span className="pt"><Plane aria-hidden="true" /></span>
                <b>Depart from {route.home}</b>
                <small>{plan ? showDate(plan.end) : ""}</small>
              </li>
            </>
          )}
        </ol>
        <h3>Included and not included</h3>
        <ul className="incl">
          {[
            ["yes", "Umrah visa", ""],
            [form.transport === "bus" ? "yes" : "ask", "Ground transport", form.transport === "bus" ? "Shared bus, included" : "Quoted by our team"],
            ["yes", "Hotels as selected", ""],
          ].map(([kind, label, sublabel]) => (
            <li key={label}>
              {kind === "yes" ? <Check className="y" aria-hidden="true" /> : kind === "no" ? <X className="n" aria-hidden="true" /> : <Clock className="a" aria-hidden="true" />}
              <span>
                <b>{label}</b>
                <span className="sr">: {kind === "yes" ? "included" : kind === "no" ? "not included" : "quoted separately"}</span>
                {sublabel && <small>{sublabel}</small>}
              </span>
            </li>
          ))}
        </ul>
        <div className="total-box" aria-busy={busy}>
          {quoteOnly ? (
            <span className="status">Quote required · no online rate</span>
          ) : !validDate(form.startDate) || !inRange ? (
            <span className="status">Choose an arrival date</span>
          ) : !form.makkahHotelId || !form.madinahHotelId ? (
            <span className="status">Select hotels to see a price</span>
          ) : calcError ? (
            <span className="status bad">Price unavailable</span>
          ) : busy ? (
            <span className="status">Updating…</span>
          ) : (
            <span className="status">Estimate · to be confirmed</span>
          )}
          {calcError && <p className="err">{calcError}</p>}
          {result && (
            <>
              <div className="amt">PKR {fmt(result.totalPkr)} – {fmt(result.highPkr)}</div>
              <div className="sar">SAR {fmt(result.totalSar)} – {fmt(result.highSar)}</div>
              {result.pending.length > 0 && <ul className="pend">{result.pending.map((item) => <li key={item}>{item}</li>)}</ul>}
            </>
          )}
          <p className="sr" role="status" aria-live="polite">{liveMessage}</p>
        </div>
      </div>
    </aside>
  );
}

export default function UmrahWizard({
  step, form, updateForm, errors, canReach, plan, hotels, hotelStatus, result,
  calcError, busy, onDownloadPdf, pdfBusy, pdfError, sent, doneBox, leadForm,
  headingRef, onHome, onBack, onNext, onGoToStep, nameOf, route, transport,
  fxSarToPkr, totalText, liveMessage, sumOpen, setSumOpen, inRange, quoteOnly, quoteReason, roomAllocations,
}) {
  return (
    <div className="layout">
      <div className="box">
        <nav aria-label="Progress">
          <ol className="progress">
            {STEPS.map((name, index) => (
              <li key={name}>
                <button
                  type="button"
                  aria-label={`Step ${index + 1}: ${name}`}
                  aria-current={index === step ? "step" : undefined}
                  className={index === step ? "on" : index < step ? "done" : ""}
                  disabled={index > step && !canReach(index)}
                  onClick={() => onGoToStep(index)}
                >
                  <span className="dot">{index < step ? <Check aria-hidden="true" /> : STEP_ICONS[index]}</span>
                  <span className="name"><span className="sr">Step {index + 1}: </span>{name}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className="panel">
          <p className="stepcount">Step {step + 1} of 6 · {STEPS[step]}</p>
          {step === 0 && (
            <TravelDetailsStep
              form={form}
              errors={errors}
              updateForm={updateForm}
              onNext={onNext}
              onHome={onHome}
              headingRef={headingRef}
            />
          )}
          {step === 1 && (
            <HotelStep
              city="makkah"
              stay={plan?.stays.makkah}
              nights={form.makkahNights}
              onNights={(value) => updateForm({ makkahNights: value })}
              list={hotels.makkah}
              status={hotelStatus}
              value={form.makkahHotelId}
              onPick={(id) => updateForm({ makkahHotelId: id })}
              roomType={form.roomType}
              error={errors.hotel}
              calcError={calcError}
              routeSelected={!!form.route}
              headingRef={headingRef}
              onBack={onBack}
              onNext={onNext}
            />
          )}
          {step === 2 && (
            <HotelStep
              city="madinah"
              stay={plan?.stays.madinah}
              nights={form.madinahNights}
              onNights={(value) => updateForm({ madinahNights: value })}
              list={hotels.madinah}
              status={hotelStatus}
              value={form.madinahHotelId}
              onPick={(id) => updateForm({ madinahHotelId: id })}
              roomType={form.roomType}
              error={errors.hotel}
              calcError={calcError}
              routeSelected={!!form.route}
              headingRef={headingRef}
              onBack={onBack}
              onNext={onNext}
            />
          )}
          {step === 3 && (
            <RouteStep form={form} errors={errors} updateForm={updateForm} onBack={onBack} onNext={onNext} headingRef={headingRef} />
          )}
          {step === 4 && (
            <ZiyaratStep
              form={form}
              updateForm={updateForm}
              transport={transport}
              fxSarToPkr={fxSarToPkr}
              plan={plan}
              onBack={onBack}
              onNext={onNext}
              headingRef={headingRef}
            />
          )}
          {step === 5 && (
            <EstimateStep
              result={result}
              plan={plan}
              form={form}
              route={route}
              transport={transport}
              busy={busy}
              calcError={calcError}
              nameOf={nameOf}
              onBack={onBack}
              onDownloadPdf={onDownloadPdf}
              pdfBusy={pdfBusy}
              pdfError={pdfError}
              sent={sent}
              doneBox={doneBox}
              leadForm={leadForm}
              headingRef={headingRef}
              quoteOnly={quoteOnly}
              quoteReason={quoteReason}
            />
          )}
        </div>
      </div>
      <SummaryPanel
        form={form}
        plan={plan}
        result={result}
        route={route}
        transport={transport}
        nameOf={nameOf}
        busy={busy}
        calcError={calcError}
        totalText={totalText}
        liveMessage={liveMessage}
        open={sumOpen}
        setOpen={setSumOpen}
        inRange={inRange}
        quoteOnly={quoteOnly}
        roomAllocations={roomAllocations}
      />
    </div>
  );
}

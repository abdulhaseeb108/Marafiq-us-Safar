import {
  ArrowRight, Check, Compass, FileText, Globe2, Info, Luggage, MapPin, Minus, Moon, Plane, Plus, Users,
} from "lucide-react";
import { Logo, WhatsAppIcon } from "../art.jsx";
import { DEPARTURE_CITIES, DURATION_OPTIONS, ROOMS } from "../data/calculator.jsx";
import { ComingSoonLoader } from "./ComingSoonLoader.jsx";

const SERVICES = [
  { id: "umrah", icon: <Moon aria-hidden="true" />, title: "Umrah packages", description: "Plan your Makkah and Madinah stay with a clear estimate.", status: "Available" },
  { id: "hajj", icon: <Users aria-hidden="true" />, title: "Hajj journeys", description: "Thoughtful guidance for your pilgrimage.", status: "Coming soon" },
  { id: "tours", icon: <Compass aria-hidden="true" />, title: "Guided tours", description: "Discover meaningful places with local insight.", status: "Coming soon" },
  { id: "flights", icon: <Plane aria-hidden="true" />, title: "Flight bookings", description: "Find a smoother way to get where you’re going.", status: "Coming soon" },
  { id: "visa", icon: <FileText aria-hidden="true" />, title: "Visa assistance", description: "Get clear guidance for your travel documents.", status: "Coming soon" },
];

export default function HomePage({
  bookingDays, setBookingDays, bookingPassengers,
  setBookingPassengers, bookingRoom, setBookingRoom, bookingDeparture,
  setBookingDeparture, customDeparture, setCustomDeparture, onSearch, onOpenService, waLink,
}) {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="h-home">
        <div className="hero-copy">
          <span className="eyebrow"><span /> TRAVEL, THOUGHTFULLY PLANNED</span>
          <h1 id="h-home">Go further.<br />Travel <em>better.</em></h1>
          <p>From meaningful journeys to memorable getaways, we make the details easier—so you can focus on the moments that matter.</p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn"
              onClick={() => document.getElementById("quote-search")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Umrah packages <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a href={waLink} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> Talk to a travel specialist</a>
          </div>
          <div className="hero-trust">
            <span><Check size={16} aria-hidden="true" /> Personal support</span>
            <span><Check size={16} aria-hidden="true" /> Clear, considered planning</span>
            <span><Check size={16} aria-hidden="true" /> A real team by your side</span>
          </div>
        </div>
        <div className="hero-art journey-art" aria-hidden="true">
          <span className="journey-orbit journey-orbit-one" />
          <span className="journey-orbit journey-orbit-two" />
          <div className="journey-globe"><Globe2 /></div>
          <svg className="journey-path" viewBox="0 0 360 260" fill="none">
            <path d="M48 188C92 215 110 75 174 104s67 118 135 45" />
          </svg>
          <div className="journey-pin pin-start"><MapPin /></div>
          <div className="journey-pin pin-end"><MapPin /></div>
          <Plane className="journey-plane" />
          <div className="journey-float-card">
            <span><Luggage /></span>
            <span><b>Made for your journey</b><small>Thoughtful details. Personal care.</small></span>
          </div>
          <span className="hero-art-caption">YOUR NEXT JOURNEY STARTS HERE</span>
        </div>
      </section>

      <section className="booking-shell" id="quote-search" aria-labelledby="h-search">
        <form className="booking-card" onSubmit={onSearch}>
          <div className="booking-title">
            <div>
              <span className="eyebrow">START WITH A JOURNEY THAT MATTERS</span>
              <h2 id="h-search">Plan your Umrah</h2>
              <p>Our Umrah planner is ready. More travel services are on their way.</p>
            </div>
            <span className="booking-title-icon"><Moon size={22} aria-hidden="true" /></span>
          </div>
          <div className="booking-fields">
            <label className="booking-field">
              <span>TRIP DURATION</span>
              <select value={bookingDays} onChange={(event) => setBookingDays(Number(event.target.value))}>
                {DURATION_OPTIONS.map((days) => <option key={days} value={days}>{days} days</option>)}
              </select>
            </label>
            <label className="booking-field">
              <span>ROOM PREFERENCE</span>
              <select value={bookingRoom} onChange={(event) => setBookingRoom(event.target.value)}>
                <option value="">Choose room type</option>
                {ROOMS.filter(([value]) => ["sharing", 2, 3, 4].includes(value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <div className="booking-field passenger-field">
              <span>TRAVELLERS</span>
              <div className="passenger-control">
                <button
                  type="button"
                  aria-label="Remove one traveller"
                  disabled={bookingPassengers <= 1}
                  onClick={() => setBookingPassengers((count) => Math.max(1, count - 1))}
                ><Minus size={17} aria-hidden="true" /></button>
                <b>{bookingPassengers}</b><span>{bookingPassengers === 1 ? "traveller" : "travellers"}</span>
                <button
                  type="button"
                  aria-label="Add one traveller"
                  disabled={bookingPassengers >= 30}
                  onClick={() => setBookingPassengers((count) => Math.min(30, count + 1))}
                ><Plus size={17} aria-hidden="true" /></button>
              </div>
            </div>
            <label className="booking-field">
              <span>DEPARTING FROM</span>
              <select value={bookingDeparture} onChange={(event) => setBookingDeparture(event.target.value)}>
                <option value="">Choose a departure city</option>
                {DEPARTURE_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
            {bookingDeparture === "Other" && (
              <label className="booking-field departure-custom">
                <span>YOUR CITY</span>
                <input
                  value={customDeparture}
                  onChange={(event) => setCustomDeparture(event.target.value)}
                  placeholder="Enter your departure city"
                  required
                />
              </label>
            )}
            <button type="submit" className="btn booking-submit">
              Search packages <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="booking-note">
            <Info size={15} aria-hidden="true" />
            Your dates and hotel preferences are confirmed in the next step. Estimates are not bookings.
          </p>
        </form>
      </section>

      <section className="service-section" aria-labelledby="h-services">
        <div className="section-heading">
          <span className="eyebrow">TRAVEL WITH CONFIDENCE</span>
          <h2 id="h-services">A better way to get there</h2>
          <p>Explore the services we offer today—and the journeys we’re preparing next.</p>
        </div>
        <div className="service-grid">
          {SERVICES.map(({ id, icon, title, description, status }) => (
            <button type="button" className={`service-card ${id === "umrah" ? "service-card-active" : "service-card-upcoming"}`} key={id} onClick={() => onOpenService(id)}>
              <span className="service-card-top">
                <span className="service-icon">{icon}</span>
                <span className={`service-status ${id === "umrah" ? "available" : ""}`}>{status}</span>
              </span>
              {id === "umrah" ? (
                <span className="service-copy"><b>{title}</b><small>{description}</small></span>
              ) : (
                <>
                  <span className="service-copy"><b>{title}</b><small>{description}</small></span>
                  <span className="service-coming-soon">
                    <ComingSoonLoader />
                    <b>Coming soon</b>
                  </span>
                </>
              )}
              {id === "umrah" && <ArrowRight className="service-arrow" size={19} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>
      <footer className="home-footer" id="contact">
        <Logo />
        <span><b>Marafiq us Safar</b><small>Here to help you travel with peace of mind.</small></span>
        <a href={waLink} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> Contact our team</a>
      </footer>
    </div>
  );
}

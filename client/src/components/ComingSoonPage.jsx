import { ArrowLeft, ArrowRight, Compass, Globe2, Plane } from "lucide-react";
import { ComingSoonLoader } from "./ComingSoonLoader.jsx";

const SERVICE_DETAILS = {
  hajj: { title: "Hajj journeys", icon: <Compass aria-hidden="true" /> },
  tours: { title: "Guided tours", icon: <Globe2 aria-hidden="true" /> },
  flights: { title: "Flight bookings", icon: <Plane aria-hidden="true" /> },
  visa: { title: "Visa assistance", icon: <ArrowRight aria-hidden="true" /> },
};

export default function ComingSoonPage({ service, onHome, onUmrah }) {
  const details = SERVICE_DETAILS[service] || SERVICE_DETAILS.tours;

  return (
    <section className="coming-soon-page" aria-labelledby="h-coming-soon">
      <div className="coming-soon-card">
        <div className="coming-soon-visual">
          <span className="coming-soon-orbit coming-soon-orbit-one" />
          <span className="coming-soon-orbit coming-soon-orbit-two" />
          <span className="coming-soon-service-icon">{details.icon}</span>
          <ComingSoonLoader />
          <span className="coming-soon-visual-caption">YOUR NEXT JOURNEY</span>
        </div>
        <div className="coming-soon-copy">
          <span className="eyebrow"><span /> MORE WAYS TO TRAVEL</span>
          <h1 id="h-coming-soon">{details.title}, coming soon</h1>
          <p>We’re preparing a thoughtful new way to plan this journey. In the meantime, our Umrah package planner is ready to help you get started.</p>
          <div className="coming-soon-actions">
            <button type="button" className="btn" onClick={onUmrah}>
              Explore Umrah packages <ArrowRight aria-hidden="true" />
            </button>
            <button type="button" className="btn ghost" onClick={onHome}>
              <ArrowLeft aria-hidden="true" /> Back to home
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

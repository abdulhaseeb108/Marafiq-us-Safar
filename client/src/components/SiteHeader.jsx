import { Link } from "react-router-dom";
import { Logo, WhatsAppIcon } from "../art.jsx";
import { APP_PATHS } from "../routes.js";

export default function SiteHeader({ page, waLink }) {
  const links = [
    ["home", "Home", APP_PATHS.home],
    ["umrah", "Umrah", APP_PATHS.umrah],
    ["hajj", "Hajj", APP_PATHS.hajj],
    ["tours", "Tours", APP_PATHS.tours],
    ["flights", "Flight deals", APP_PATHS.flights],
    ["visa", "Visa services", APP_PATHS.visa],
    ["calculator", "Package calculator", APP_PATHS.calculator],
  ];

  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <header className="top">
        <div className="top-in">
          <Link className="brand" to={APP_PATHS.home}>
            <Logo />
            <span><b>Marafiq us Safar</b><small>Your journey partner</small></span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            {links.map(([id, label, path]) => (
              <Link
                key={id}
                to={path}
                className={page === id ? "active" : ""}
                aria-current={page === id ? "page" : undefined}
              >{label}</Link>
            ))}
          </nav>
          <a className="wa-link" href={waLink} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={20} /><span>Chat on WhatsApp</span>
          </a>
        </div>
      </header>
    </>
  );
}

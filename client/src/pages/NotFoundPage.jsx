import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="box panel not-found" aria-labelledby="h-not-found">
      <span className="eyebrow">PAGE NOT FOUND</span>
      <h1 id="h-not-found">We couldn’t find that page.</h1>
      <p className="lead">The address may have changed, or the page may no longer be available.</p>
      <Link className="btn not-found-link" to="/">Return to home</Link>
    </section>
  );
}

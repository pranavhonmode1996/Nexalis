import Link from "next/link";
export default function NotFound() {
  return (
    <main className="state panel">
      <div className="eyebrow">NEXALIS WORKSPACE · 404</div>
      <h1>Page not found</h1>
      <p>This page may have moved or the link is incomplete.</p>
      <Link className="button primary" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type AppNavProps = {
  onBack?: () => void;
};

export default function AppNav({ onBack }: AppNavProps) {
  const pathname = usePathname();

  return (
    <header className="top-nav" role="banner">
      <div className="top-nav__leading">
        {onBack ? (
          <button
            type="button"
            className="top-nav__back"
            onClick={onBack}
            aria-label="Back to map"
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
            <span>Back</span>
          </button>
        ) : null}
        <Link href="/" className="top-nav__brand-link" aria-label="Stride home">
          <span className="top-nav__brand">Stride</span>
        </Link>
      </div>

      <nav className="top-nav__actions top-nav__actions--links" aria-label="Primary">
        <Link
          href="/"
          className={`top-nav__link${pathname === "/" ? " top-nav__link--active" : ""}`}
        >
          Map
        </Link>
        <Link
          href="/leaderboard"
          className={`top-nav__link${pathname === "/leaderboard" ? " top-nav__link--active" : ""}`}
        >
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}

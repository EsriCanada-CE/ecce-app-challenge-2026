"use client";

import { motion } from "framer-motion";
import { Crown, Bike, Clock, Leaf, MapPin, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

import AppNav from "@/components/AppNav";
import NameEditor from "@/components/NameEditor";
import { formatDistanceKilometers } from "@/lib/route-insights";
import type {
  LeaderboardPageData,
  LeaderboardEntry,
} from "@/lib/ride-persistence";

type Props = {
  data: LeaderboardPageData;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: EASE },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.09, duration: 0.5, ease: EASE },
  }),
};

function formatCo2(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  if (kg >= 10) return `${Math.round(kg)} kg`;
  return `${kg.toFixed(1)} kg`;
}

function formatCalories(cal: number) {
  if (cal >= 10000) return `${(cal / 1000).toFixed(1)}k`;
  return cal.toLocaleString();
}

function formatCardio(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${minutes}m`;
}

function timeAgo(isoString: string | null): string {
  if (!isoString) return "No rides yet";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

const PODIUM_HEIGHTS = [140, 190, 110];
const PODIUM_ORDER = [1, 0, 2] as const;

function PodiumSlot({ entry, height }: { entry: LeaderboardEntry; height: number }) {
  return (
    <motion.div
      className={`lb-podium__slot lb-podium__slot--r${entry.rank}`}
      variants={scaleIn}
      custom={entry.rank + 4}
    >
      <div className="lb-podium__avatar">
        {entry.rank === 1 ? (
          <Crown size={20} strokeWidth={2.4} />
        ) : (
          <Trophy size={16} strokeWidth={2.2} />
        )}
        <span className="lb-podium__medal">{entry.rank}</span>
      </div>
      <h3 className="lb-podium__name">{entry.name}</h3>
      <p className="lb-podium__distance">
        {formatDistanceKilometers(entry.totalDistanceMeters)}
      </p>
      {entry.isCurrentUser && <span className="lb-podium__you">YOU</span>}
      <div className="lb-podium__pillar" style={{ height }}>
        <span className="lb-podium__pillar-rank">{entry.rank}</span>
        <div className="lb-podium__pillar-stats">
          <span>{entry.rideCount} rides</span>
          <span>{formatCo2(entry.totalCo2Kg)} CO₂</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function LeaderboardView({ data }: Props) {
  const { currentUser, leaderboard } = data;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const communityDistance = leaderboard.reduce(
    (s, e) => s + e.totalDistanceMeters,
    0,
  );
  const communityCalories = leaderboard.reduce(
    (s, e) => s + e.totalCalories,
    0,
  );
  const communityCo2 = leaderboard.reduce((s, e) => s + e.totalCo2Kg, 0);
  const communityRides = leaderboard.reduce((s, e) => s + e.rideCount, 0);

  const orderedPodium = PODIUM_ORDER
    .map((idx) => top3[idx])
    .filter(Boolean) as LeaderboardEntry[];

  return (
    <>
      <style>{STYLES}</style>
      <div className="lb-root">
        <AppNav />

        {/* Hero */}
        <header className="lb-hero">
          <div className="lb-hero__leaf lb-hero__leaf--1" />
          <div className="lb-hero__leaf lb-hero__leaf--2" />
          <div className="lb-hero__leaf lb-hero__leaf--3" />

          <motion.div
            className="lb-hero__inner"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="lb-hero__badge">
              <Leaf size={14} /> Toronto Distance Rankings
            </span>
            <h1 className="lb-hero__title">Leaderboard</h1>
            <p className="lb-hero__subtitle">
              Every ride plants a seed. Watch the community grow.
            </p>
          </motion.div>
        </header>

        <main className="lb-main">
          {/* Community Stats */}
          <motion.section
            className="lb-section"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            <h2 className="lb-section__heading">Community Impact</h2>
            <div className="lb-stats-grid">
              {[
                {
                  icon: <Bike size={20} />,
                  value: communityRides,
                  label: "Total Rides",
                  tint: "sage",
                },
                {
                  icon: <MapPin size={20} />,
                  value: formatDistanceKilometers(communityDistance),
                  label: "Distance",
                  tint: "forest",
                },
                {
                  icon: <Clock size={20} />,
                  value: formatCalories(communityCalories),
                  label: "Calories",
                  tint: "mint",
                },
                {
                  icon: <Leaf size={20} />,
                  value: formatCo2(communityCo2),
                  label: "CO₂ Saved",
                  tint: "deep",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`lb-stat-card lb-stat-card--${stat.tint}`}
                  variants={scaleIn}
                  custom={i + 1}
                >
                  <span className="lb-stat-card__icon">{stat.icon}</span>
                  <span className="lb-stat-card__value">{stat.value}</span>
                  <span className="lb-stat-card__label">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Your Profile */}
          <motion.section
            className="lb-section"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <h2 className="lb-section__heading">Your Profile</h2>
            <div className="lb-profile-card">
              <div className="lb-profile-card__top">
                <div className="lb-profile-card__avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="lb-profile-card__info">
                  <span className="lb-profile-card__name">
                    {currentUser.name}
                  </span>
                  {currentUser.rank != null && (
                    <span className="lb-profile-card__rank-pill">
                      #{currentUser.rank}
                    </span>
                  )}
                </div>
              </div>

              <div className="lb-profile-card__stats">
                <div className="lb-profile-card__stat">
                  <span className="lb-profile-card__stat-val">
                    {currentUser.totalRides}
                  </span>
                  <span className="lb-profile-card__stat-lbl">Rides</span>
                </div>
                <div className="lb-profile-card__stat">
                  <span className="lb-profile-card__stat-val">
                    {formatDistanceKilometers(currentUser.totalDistanceMeters)}
                  </span>
                  <span className="lb-profile-card__stat-lbl">Distance</span>
                </div>
                <div className="lb-profile-card__stat">
                  <span className="lb-profile-card__stat-val">
                    {formatCardio(currentUser.totalCardioMinutes)}
                  </span>
                  <span className="lb-profile-card__stat-lbl">Active</span>
                </div>
                <div className="lb-profile-card__stat">
                  <span className="lb-profile-card__stat-val">
                    {formatCo2(currentUser.totalCo2Kg)}
                  </span>
                  <span className="lb-profile-card__stat-lbl">CO₂ Saved</span>
                </div>
              </div>

              <div className="lb-profile-card__editor">
                <NameEditor
                  initialName={currentUser.name}
                  defaultName={currentUser.defaultName}
                  refreshOnSuccess={true}
                />
              </div>
            </div>
          </motion.section>

          {/* Podium — Pedestal Style */}
          {top3.length > 0 && (
            <motion.section
              className="lb-section"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              custom={5}
            >
              <h2 className="lb-section__heading">Top Riders</h2>
              <div className="lb-podium">
                {orderedPodium.map((entry, i) => (
                  <PodiumSlot
                    key={entry.userId}
                    entry={entry}
                    height={PODIUM_HEIGHTS[i]}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Remaining Rankings */}
          {rest.length > 0 && (
            <motion.section
              className="lb-section"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={7}
            >
              <h2 className="lb-section__heading">Rankings</h2>
              <div className="lb-rankings">
                {rest.map((entry, i) => (
                  <motion.div
                    key={entry.userId}
                    className={`lb-rank-row${entry.isCurrentUser ? " lb-rank-row--you" : ""}`}
                    variants={fadeUp}
                    custom={i + 8}
                  >
                    <span className="lb-rank-row__pos">{entry.rank}</span>
                    <div className="lb-rank-row__avatar">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="lb-rank-row__body">
                      <span className="lb-rank-row__name">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <span className="lb-rank-row__you-tag">You</span>
                        )}
                      </span>
                      <span className="lb-rank-row__sub">
                        {formatDistanceKilometers(entry.totalDistanceMeters)} ·{" "}
                        {entry.rideCount} rides
                      </span>
                    </div>
                    <div className="lb-rank-row__right">
                      <span className="lb-rank-row__co2">
                        <Leaf size={13} /> {formatCo2(entry.totalCo2Kg)}
                      </span>
                      <span className="lb-rank-row__time">
                        {timeAgo(entry.latestRideAtIso)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {leaderboard.length === 0 && (
            <motion.section
              className="lb-section lb-empty"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              <div className="lb-empty__icon">
                <Leaf size={48} />
              </div>
              <h2 className="lb-empty__title">No rides yet</h2>
              <p className="lb-empty__body">
                Complete your first ride to plant the first seed on the
                leaderboard.
              </p>
              <Link href="/" className="lb-empty__cta">
                <ArrowLeft size={16} /> Start a ride
              </Link>
            </motion.section>
          )}
        </main>
      </div>
    </>
  );
}

const STYLES = /* css */ `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');

body { background: #FAFAF7 !important; }

/* ── Root ─────────────────────────────────────────────────────────── */
.lb-root {
  --lb-bg:       #FAFAF7;
  --lb-text:     #2D3436;
  --lb-sage:     #4A9B5A;
  --lb-forest:   #1B5E3B;
  --lb-mint:     #D8F3DC;
  --lb-deep:     #14332A;
  --lb-gold:     #D4A373;
  --lb-card:     #FFFFFF;
  --lb-border:   #E8E8E2;
  --lb-radius:   22px;
  --lb-radius-sm: 14px;
  --lb-shadow:   0 2px 16px rgba(45,52,54,.05);
  --lb-shadow-lg: 0 8px 32px rgba(45,52,54,.08);

  font-family: 'DM Sans', system-ui, sans-serif;
  color: var(--lb-text);
  min-height: 100dvh;
  background: var(--lb-bg);
  background-image: radial-gradient(circle, #d4d4c8 1px, transparent 1px);
  background-size: 28px 28px;
}

/* ── Hero ─────────────────────────────────────────────────────────── */
.lb-hero {
  position: relative;
  overflow: hidden;
  padding: 80px 24px 48px;
  background: linear-gradient(175deg, #D8F3DC 0%, #eaf7ec 38%, #FAFAF7 100%);
  text-align: center;
}

.lb-hero__inner { position: relative; z-index: 1; }

.lb-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--lb-forest);
  background: rgba(127,182,133,.18);
  padding: 6px 16px;
  border-radius: 100px;
  margin-bottom: 16px;
}

.lb-hero__title {
  font-family: 'Fraunces', serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 700;
  color: #0F2E1F;
  margin: 0 0 8px;
  line-height: 1.15;
}

.lb-hero__subtitle {
  font-size: 1.05rem;
  color: #3B4F44;
  max-width: 380px;
  margin: 0 auto;
  line-height: 1.5;
}

.lb-hero__leaf {
  position: absolute;
  border-radius: 0 70% 0 70%;
  opacity: 0.12;
  pointer-events: none;
}

.lb-hero__leaf--1 {
  width: 120px; height: 120px;
  background: var(--lb-sage);
  top: 12px; left: -30px;
  transform: rotate(-30deg);
}

.lb-hero__leaf--2 {
  width: 80px; height: 80px;
  background: var(--lb-forest);
  top: 24px; right: 10%;
  transform: rotate(25deg);
}

.lb-hero__leaf--3 {
  width: 60px; height: 60px;
  background: var(--lb-deep);
  bottom: 10px; right: 25%;
  transform: rotate(-15deg);
}

/* ── Main ─────────────────────────────────────────────────────────── */
.lb-main {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

/* ── Section ──────────────────────────────────────────────────────── */
.lb-section {
  margin-top: 40px;
}

.lb-section__heading {
  font-family: 'Fraunces', serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--lb-deep);
  margin: 0 0 18px;
}

/* ── Stats Grid ───────────────────────────────────────────────────── */
.lb-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

@media (max-width: 640px) {
  .lb-stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.lb-stat-card {
  background: var(--lb-card);
  border: 1px solid var(--lb-border);
  border-radius: var(--lb-radius);
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: var(--lb-shadow);
  position: relative;
  overflow: hidden;
}

.lb-stat-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.06;
  border-radius: inherit;
  pointer-events: none;
}

.lb-stat-card--sage::before   { background: var(--lb-sage); }
.lb-stat-card--forest::before { background: var(--lb-forest); }
.lb-stat-card--mint::before   { background: var(--lb-sage); }
.lb-stat-card--deep::before   { background: var(--lb-deep); }

.lb-stat-card__icon {
  width: 40px; height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
}

.lb-stat-card--sage   .lb-stat-card__icon { background: #3D8B4E; }
.lb-stat-card--forest .lb-stat-card__icon { background: var(--lb-forest); }
.lb-stat-card--mint   .lb-stat-card__icon { background: #2E8B57; }
.lb-stat-card--deep   .lb-stat-card__icon { background: var(--lb-deep); }

.lb-stat-card__value {
  font-family: 'Fraunces', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a1a;
}

.lb-stat-card__label {
  font-size: 0.78rem;
  color: #4a5550;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

/* ── Profile Card ─────────────────────────────────────────────────── */
.lb-profile-card {
  background: var(--lb-card);
  border: 1px solid var(--lb-border);
  border-radius: var(--lb-radius);
  padding: 28px 24px;
  box-shadow: var(--lb-shadow);
}

.lb-profile-card__top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.lb-profile-card__avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--lb-sage), var(--lb-forest));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}

.lb-profile-card__info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.lb-profile-card__name {
  font-family: 'Fraunces', serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--lb-deep);
}

.lb-profile-card__rank-pill {
  background: var(--lb-mint);
  color: var(--lb-forest);
  padding: 3px 12px;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 600;
}

.lb-profile-card__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 18px 0;
  border-top: 1px solid var(--lb-border);
  border-bottom: 1px solid var(--lb-border);
}

@media (max-width: 480px) {
  .lb-profile-card__stats { grid-template-columns: repeat(2, 1fr); }
}

.lb-profile-card__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.lb-profile-card__stat-val {
  font-family: 'Fraunces', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.lb-profile-card__stat-lbl {
  font-size: 0.72rem;
  color: #4a5550;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.lb-profile-card__editor {
  margin-top: 20px;
}

/* ── Podium — Pedestal System ─────────────────────────────────────── */
.lb-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 14px;
  padding-top: 32px;
}

.lb-podium__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 220px;
}

.lb-podium__avatar {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--lb-card);
  border: 2.5px solid var(--lb-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lb-forest);
  box-shadow: var(--lb-shadow);
}

.lb-podium__slot--r1 .lb-podium__avatar {
  width: 68px;
  height: 68px;
  border-color: var(--lb-gold);
  background: linear-gradient(135deg, #FFF8ED, #FFF3E0);
  color: #b8860b;
}

.lb-podium__slot--r2 .lb-podium__avatar {
  border-color: var(--lb-sage);
  background: linear-gradient(135deg, #f0f7f1, #e4f0e6);
  color: var(--lb-forest);
}

.lb-podium__slot--r3 .lb-podium__avatar {
  border-color: #c4b7a6;
  background: linear-gradient(135deg, #faf5ef, #f3ece3);
  color: #8b7355;
}

.lb-podium__medal {
  position: absolute;
  bottom: -5px;
  right: -3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.lb-podium__slot--r1 .lb-podium__medal {
  background: linear-gradient(135deg, #D4A373, #c49060);
}

.lb-podium__slot--r2 .lb-podium__medal {
  background: linear-gradient(135deg, var(--lb-sage), var(--lb-forest));
}

.lb-podium__slot--r3 .lb-podium__medal {
  background: linear-gradient(135deg, #c4b7a6, #a89279);
}

.lb-podium__name {
  font-family: 'Fraunces', serif;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--lb-text);
  margin: 0;
  text-align: center;
  line-height: 1.15;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-podium__distance {
  font-family: 'Fraunces', serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--lb-forest);
  margin: 0;
}

.lb-podium__you {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #fff;
  background: var(--lb-forest);
  padding: 2px 10px;
  border-radius: 100px;
}

.lb-podium__pillar {
  width: 100%;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.lb-podium__slot--r1 .lb-podium__pillar {
  background: linear-gradient(180deg, #2D6A4F 0%, #1B4332 100%);
}

.lb-podium__slot--r2 .lb-podium__pillar {
  background: linear-gradient(180deg, #52796F 0%, #3D5E55 100%);
}

.lb-podium__slot--r3 .lb-podium__pillar {
  background: linear-gradient(180deg, #74957A 0%, #52796F 100%);
}

.lb-podium__pillar-rank {
  font-family: 'Fraunces', serif;
  font-size: 48px;
  font-weight: 800;
  color: rgba(255,255,255,0.1);
  line-height: 1;
  position: absolute;
  top: 8px;
}

.lb-podium__pillar-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  position: relative;
  z-index: 1;
}

/* ── Rankings List ────────────────────────────────────────────────── */
.lb-rankings {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lb-rank-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--lb-card);
  border: 1px solid var(--lb-border);
  border-radius: var(--lb-radius-sm);
  padding: 14px 18px;
  box-shadow: var(--lb-shadow);
  transition: box-shadow 0.2s ease;
}

.lb-rank-row:hover {
  box-shadow: var(--lb-shadow-lg);
}

.lb-rank-row--you {
  border-color: var(--lb-sage);
  background: linear-gradient(90deg, #f6fbf7 0%, #fff 100%);
}

.lb-rank-row__pos {
  font-family: 'Fraunces', serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #6B7B72;
  min-width: 28px;
  text-align: center;
}

.lb-rank-row--you .lb-rank-row__pos {
  color: var(--lb-forest);
}

.lb-rank-row__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c1dcc5, var(--lb-sage));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Fraunces', serif;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
}

.lb-rank-row__body {
  flex: 1;
  min-width: 0;
}

.lb-rank-row__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--lb-text);
}

.lb-rank-row__you-tag {
  background: var(--lb-mint);
  color: var(--lb-forest);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 8px;
  border-radius: 100px;
}

.lb-rank-row__sub {
  font-size: 0.8rem;
  color: #556660;
  margin-top: 1px;
}

.lb-rank-row__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.lb-rank-row__co2 {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--lb-forest);
}

.lb-rank-row__time {
  font-size: 0.72rem;
  color: #6B7B72;
}

/* ── Empty State ──────────────────────────────────────────────────── */
.lb-empty {
  text-align: center;
  padding: 60px 20px;
}

.lb-empty__icon {
  width: 80px; height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: var(--lb-mint);
  color: var(--lb-forest);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lb-empty__title {
  font-family: 'Fraunces', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--lb-deep);
  margin: 0 0 8px;
}

.lb-empty__body {
  font-size: 1rem;
  color: #6b7c72;
  max-width: 340px;
  margin: 0 auto 24px;
  line-height: 1.5;
}

.lb-empty__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--lb-forest);
  color: #fff;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 100px;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s ease;
}

.lb-empty__cta:hover {
  background: var(--lb-deep);
}

/* ── Responsive ───────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .lb-hero {
    padding: 72px 16px 36px;
  }

  .lb-main {
    padding: 0 16px 60px;
  }

  .lb-podium {
    gap: 8px;
    padding-top: 20px;
  }

  .lb-podium__avatar {
    width: 46px;
    height: 46px;
  }

  .lb-podium__slot--r1 .lb-podium__avatar {
    width: 56px;
    height: 56px;
  }

  .lb-podium__name {
    font-size: 0.88rem;
    max-width: 100px;
  }

  .lb-podium__distance {
    font-size: 0.78rem;
  }

  .lb-podium__pillar-rank {
    font-size: 36px;
  }

  .lb-podium__pillar-stats {
    font-size: 0.62rem;
  }

  .lb-rank-row {
    gap: 10px;
    padding: 12px 14px;
  }

  .lb-rank-row__name {
    font-size: 0.88rem;
  }

  .lb-rank-row__sub {
    font-size: 0.74rem;
  }

  .lb-rank-row__co2 {
    font-size: 0.76rem;
  }

  .lb-profile-card {
    padding: 22px 18px;
  }

  .lb-profile-card__top {
    gap: 12px;
  }

  .lb-profile-card__avatar {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }

  .lb-profile-card__name {
    font-size: 1.05rem;
  }
}

@media (max-width: 420px) {
  .lb-podium__slot {
    gap: 4px;
  }

  .lb-podium__name {
    font-size: 0.78rem;
    max-width: 80px;
  }

  .lb-podium__distance {
    font-size: 0.7rem;
  }

  .lb-podium__you {
    font-size: 0.5rem;
    padding: 1px 6px;
  }
}
`;

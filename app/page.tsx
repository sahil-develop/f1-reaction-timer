import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "F1 Reaction Timer — Race Start Simulator",
  description:
    "Three reaction-time games inspired by Formula 1. Simulate an F1 race start, test your reflexes with red/green lights, or run a countdown alarm. How fast are you?",
  openGraph: {
    title: "F1 Reaction Timer — Race Start Simulator",
    description:
      "Three reaction-time games inspired by Formula 1. Simulate an F1 race start, test your reflexes, and beat your best time.",
  },
};

const games = [
  {
    href: "/f1-timer",
    label: "F1 RACE START",
    sublabel: "Starting Lights Simulator",
    description:
      "Watch 5 red lights illuminate one by one, then react the instant they go out. Set a target time and chase perfection.",
    accent: "#E8002D",
    icon: (
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-[#E8002D]"
            style={{ opacity: 0.4 + i * 0.15 }}
          />
        ))}
      </div>
    ),
    badge: "CLASSIC",
  },
  {
    href: "/red-green-light",
    label: "RED / GREEN LIGHT",
    sublabel: "10-Round Reaction Test",
    description:
      "Press on green, wait on red. 10 rapid-fire rounds test your raw reaction speed and self-control under pressure.",
    accent: "#22c55e",
    icon: (
      <div className="flex gap-2" aria-hidden="true">
        <div className="w-4 h-4 rounded-full bg-red-500 opacity-70" />
        <div className="w-4 h-4 rounded-full bg-green-500" />
      </div>
    ),
    badge: "REFLEX",
  },
  {
    href: "/timer",
    label: "ALARM TIMER",
    sublabel: "Countdown with Alert",
    description:
      "Simple countdown timer with a circular progress ring and alarm. Set any duration up to 99 minutes.",
    accent: "#E8002D",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#E8002D]"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    badge: "UTILITY",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg space-y-10">

        {/* Hero */}
        <section className="text-center space-y-4" aria-label="Hero">
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-[#E8002D]"
                  style={{ opacity: 0.3 + i * 0.14 }}
                />
              ))}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            F1 REACTION<span className="text-[#E8002D]"> TIMER</span>
          </h1>
          <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase">
            Race Start Simulator
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
            Three reaction-time games inspired by Formula&nbsp;1.
            Test your reflexes, chase your best time, and see how fast you really are.
          </p>
        </section>

        {/* Game Cards */}
        <section aria-label="Games" className="space-y-3">
          <h2 className="text-[10px] font-mono tracking-[0.3em] text-zinc-600 uppercase text-center">
            Choose a Game
          </h2>
          {games.map(({ href, label, sublabel, description, badge, icon }) => (
            <Link
              key={href}
              href={href}
              className="group block bg-[#111] hover:bg-[#161616] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-2xl p-5 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {icon}
                    <span className="text-xs font-mono text-zinc-600 border border-[#2a2a2a] rounded px-1.5 py-0.5 tracking-widest">
                      {badge}
                    </span>
                  </div>
                  <div>
                    <p className="font-black text-base tracking-tight text-white group-hover:text-zinc-100">
                      {label}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase mt-0.5">
                      {sublabel}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
                </div>
                <div className="shrink-0 self-center">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] group-hover:border-[#E8002D]/40 flex items-center justify-center transition-colors">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-zinc-600 group-hover:text-[#E8002D] transition-colors"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Quick start hint */}
        <p className="text-center text-[10px] text-zinc-700 font-mono tracking-widest">
          SELECT A GAME ABOVE TO BEGIN
        </p>

      </div>
    </main>
  );
}

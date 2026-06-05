import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "F1 Race Start Simulator",
  description:
    "Simulate an F1 race start with realistic starting lights. Set your target reaction time, watch the lights, and react the instant they go out. False starts are penalised.",
  keywords: [
    "F1 race start",
    "starting lights simulator",
    "Formula 1 reaction",
    "reaction time",
    "reflex test",
  ],
  openGraph: {
    title: "F1 Race Start Simulator | F1 Reaction Timer",
    description:
      "Simulate an F1 race start. Watch 5 red lights, react when they go out, and beat your target time.",
  },
};

export default function F1TimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

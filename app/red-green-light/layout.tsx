import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Red / Green Reaction Test",
  description:
    "10-round reaction time test — press on green, wait on red. False starts are penalised. How fast can you react under pressure?",
  keywords: [
    "reaction time test",
    "red green light",
    "reflex test",
    "speed test",
    "press on green",
  ],
  openGraph: {
    title: "Red / Green Reaction Test | F1 Reaction Timer",
    description:
      "10 rounds of rapid-fire reaction testing. Press on green, wait on red, avoid false starts.",
  },
};

export default function RedGreenLightLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alarm Timer",
  description:
    "Simple countdown timer with a circular progress ring and audio alarm. Set any duration up to 99 minutes, pause, resume, and get alerted when time is up.",
  keywords: [
    "countdown timer",
    "alarm timer",
    "online timer",
    "stopwatch",
    "interval timer",
  ],
  openGraph: {
    title: "Alarm Timer | F1 Reaction Timer",
    description:
      "Countdown timer with circular progress ring and alarm. Set any duration up to 99 minutes.",
  },
};

export default function TimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

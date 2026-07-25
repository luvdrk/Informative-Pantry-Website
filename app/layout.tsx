import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panzi | AI Smart Pantry",
  description:
    "Meet Panzi, the AI-powered smart pantry that helps households organize food, reduce waste, and plan meals with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

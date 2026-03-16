import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Postgame Page Creator",
  description: "Build and publish campaign recaps, run of shows, briefs, and more",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiPinter — Wireframe",
  description: "Low-fidelity wireframe for the SiPinter exam grading web app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

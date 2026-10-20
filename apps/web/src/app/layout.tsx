import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiPinter",
  description: "Bantuan penilaian hasil tugas dan ujian mahasiswa.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Ruang Biru — kirim rasa lewat lagu",
  description: "Titipkan lagu, ceritakan alasannya, lalu biarkan seseorang menemukannya di waktu yang tepat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}

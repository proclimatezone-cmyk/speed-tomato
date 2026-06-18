import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speed Tomato — Тест скорости интернета в помидорах",
  description: "Измерь реальную скорость скачивания, загрузки и пинг своего интернета и переведи их в сочные фермерские томаты и черри!",
  keywords: ["speedtest", "tomato", "speed tomato", "тест скорости", "помидоры", "интернет скорость", "ping"],
  authors: [{ name: "Speed Tomato Team" }],
  openGraph: {
    title: "Speed Tomato — Тест скорости интернета в помидорах",
    description: "Измерь скорость своего интернета в спелых помидорах!",
    type: "website",
    locale: "ru_RU",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">{children}</body>
    </html>
  );
}

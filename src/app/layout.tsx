import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "physics-ender.com",
  description: "物理終らせるチャンネル",
  twitter: {
    card: "summary_large_image",
    title: "physics-ender.com",
    description: "物理終らせるチャンネル",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <main className="bg-black" style={{ paddingTop: "var(--header-height)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

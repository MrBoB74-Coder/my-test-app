import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitspace Feasibility Study",
  description:
    "Check business connectivity feasibility across South African fibre and wireless providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col text-brand-navy">
        <header className="relative overflow-hidden border-b-2 border-brand-red bg-brand-navy">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% -30%, rgba(6,182,212,0.30), transparent 42%), radial-gradient(circle at 92% 130%, rgba(162,0,0,0.30), transparent 45%)",
            }}
          />
          <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12">
            <Link href="/" className="flex items-center" aria-label="Bitspace Business Solutions">
              <Image
                src="/bitspace-logo-light.png"
                alt="Bitspace Business Solutions"
                width={330}
                height={110}
                priority
                className="h-11 w-auto"
              />
            </Link>
            <span className="hidden text-sm font-medium tracking-wide text-cyan-300 sm:block">
              Connectivity Feasibility
            </span>
          </div>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-zinc-200 bg-brand-navy text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm sm:flex-row sm:px-8 lg:px-12">
            <span>© {new Date().getFullYear()} Bitspace Business Solutions</span>
            <a
              href="https://bitspace.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 transition hover:text-white"
            >
              bitspace.co.za
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

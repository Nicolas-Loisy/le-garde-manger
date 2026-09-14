import type { Metadata } from "next";
import { Caveat, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const script = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["500", "700"],
});

const hand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Le Garde-Manger",
  description: "Notre carnet de recettes de famille, à partager entre proches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${script.variable} ${hand.variable} font-hand bg-paper bg-paper-texture text-ink min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

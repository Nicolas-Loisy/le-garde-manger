"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";

export function Navbar() {
  const { user, isAllowed, loading } = useAuth();

  return (
    <nav className="border-b-2 border-cocoa/20 bg-paper-dark/60">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="text-3xl font-script text-cocoa">
          Le Garde-Manger
        </Link>
        <div className="flex items-center gap-4 text-lg">
          <Link href="/recipes" className="hover:text-rust">
            Toutes les recettes
          </Link>
          <Link href="/about" className="hover:text-rust">
            À propos
          </Link>
          {!loading && isAllowed && (
            <Link href="/recipes/new" className="hover:text-rust">
              Ajouter une recette
            </Link>
          )}
          {!loading && (user ? (
            <button onClick={() => signOut()} className="btn-secondary text-base">
              Se déconnecter
            </button>
          ) : (
            <Link href="/login" className="btn-secondary text-base">
              Se connecter
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeSignInIfNeeded } from "@/lib/auth";

export default function AuthActionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    completeSignInIfNeeded()
      .then((success) => {
        if (success) router.replace("/");
        else setError("Ce lien de connexion est invalide ou a expiré.");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      });
  }, [router]);

  return (
    <div className="notebook-card p-8 max-w-md mx-auto text-center">
      {error ? (
        <p className="text-stamp">{error}</p>
      ) : (
        <p className="text-cocoa/80">Connexion en cours...</p>
      )}
    </div>
  );
}

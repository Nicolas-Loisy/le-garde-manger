"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isAllowed, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAllowed)) {
      router.replace("/login");
    }
  }, [loading, user, isAllowed, router]);

  if (loading || !user || !isAllowed) {
    return <p className="text-cocoa/70">Vérification de l&apos;accès...</p>;
  }

  return <>{children}</>;
}

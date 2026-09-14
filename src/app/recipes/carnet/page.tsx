"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { NotebookView } from "@/components/NotebookView";
import { listRecipes } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";

function CarnetContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Le carnet</h1>
        <Link href="/recipes" className="text-rust hover:underline">
          Retour à la liste
        </Link>
      </div>
      {loading ? (
        <p className="text-cocoa/70 text-center">Chargement...</p>
      ) : (
        <NotebookView recipes={recipes} />
      )}
    </div>
  );
}

export default function CarnetPage() {
  return (
    <AuthGuard>
      <CarnetContent />
    </AuthGuard>
  );
}

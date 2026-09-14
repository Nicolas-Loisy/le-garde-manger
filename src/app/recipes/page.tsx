"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { RecipeFilters } from "@/components/RecipeFilters";
import { listRecipes } from "@/lib/recipes";
import { listAuthors } from "@/lib/authors";
import type { Author, Recipe } from "@/types/recipe";

function RecipesListContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listRecipes(), listAuthors()])
      .then(([r, a]) => {
        setRecipes(r);
        setAuthors(a);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-4xl">Toutes les recettes</h1>
        <Link href="/recipes/carnet" className="btn-secondary">
          Vue carnet
        </Link>
      </div>
      {loading ? (
        <p className="text-cocoa/70">Chargement...</p>
      ) : (
        <RecipeFilters recipes={recipes} authors={authors} />
      )}
    </div>
  );
}

export default function RecipesListPage() {
  return (
    <AuthGuard>
      <RecipesListContent />
    </AuthGuard>
  );
}

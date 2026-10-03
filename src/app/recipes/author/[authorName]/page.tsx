"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { RecipeCard } from "@/components/RecipeCard";
import { listRecipesByAuthor } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";

function AuthorContent() {
  const params = useParams<{ authorName: string }>();
  const authorName = decodeURIComponent(params.authorName);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRecipesByAuthor(authorName)
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, [authorName]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">{authorName}</h1>
      {loading ? (
        <p className="text-cocoa/70">Chargement...</p>
      ) : recipes.length === 0 ? (
        <p className="text-cocoa/70">Aucune recette pour cet auteur.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuthorPage() {
  return (
    <AuthGuard>
      <AuthorContent />
    </AuthGuard>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { RecipeCard } from "@/components/RecipeCard";
import { listRecipesByAuthor } from "@/lib/recipes";
import { getAuthor } from "@/lib/authors";
import type { Author, Recipe } from "@/types/recipe";

function AuthorContent() {
  const params = useParams<{ authorId: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAuthor(params.authorId), listRecipesByAuthor(params.authorId)])
      .then(([a, r]) => {
        setAuthor(a);
        setRecipes(r);
      })
      .finally(() => setLoading(false));
  }, [params.authorId]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">{author?.name ?? "Auteur"}</h1>
      {author?.bio && <p className="text-cocoa/80 italic">{author.bio}</p>}
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

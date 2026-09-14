"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { RecipeCard } from "@/components/RecipeCard";
import { listRecipesByCategory } from "@/lib/recipes";
import { CATEGORIES, type Category, type Recipe } from "@/types/recipe";

function CategoryContent() {
  const params = useParams<{ category: string }>();
  const category = params.category as Category;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRecipesByCategory(category)
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, [category]);

  const label = CATEGORIES.find((c) => c.value === category)?.label ?? category;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">{label}</h1>
      {loading ? (
        <p className="text-cocoa/70">Chargement...</p>
      ) : recipes.length === 0 ? (
        <p className="text-cocoa/70">Aucune recette dans cette catégorie.</p>
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

export default function CategoryPage() {
  return (
    <AuthGuard>
      <CategoryContent />
    </AuthGuard>
  );
}

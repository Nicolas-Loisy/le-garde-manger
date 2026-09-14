"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { RecipeForm } from "@/components/RecipeForm";
import { getRecipe } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";

function EditRecipeContent() {
  const params = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipe(params.id)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-cocoa/70">Chargement...</p>;
  if (!recipe) return <p className="text-cocoa/70">Recette introuvable.</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl">Modifier « {recipe.title} »</h1>
      <RecipeForm existing={recipe} />
    </div>
  );
}

export default function EditRecipePage() {
  return (
    <AuthGuard>
      <EditRecipeContent />
    </AuthGuard>
  );
}

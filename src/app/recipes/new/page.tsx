"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { RecipeForm } from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <AuthGuard>
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl">Ajouter une recette</h1>
        <RecipeForm />
      </div>
    </AuthGuard>
  );
}

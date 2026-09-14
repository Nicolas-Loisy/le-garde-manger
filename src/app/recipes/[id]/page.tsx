"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { PrintableRecipe } from "@/components/PrintableRecipe";
import { RecipeCard } from "@/components/RecipeCard";
import { useAuth } from "@/context/AuthContext";
import {
  deleteRecipe,
  findSimilarRecipes,
  getRecipe,
  listRecipes,
} from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";

function RecipeDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [similar, setSimilar] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipe(params.id).then(async (r) => {
      setRecipe(r);
      if (r) {
        const all = await listRecipes();
        setSimilar(findSimilarRecipes(r, all));
      }
      setLoading(false);
    });
  }, [params.id]);

  async function handleDelete() {
    if (!recipe) return;
    if (!window.confirm("Supprimer définitivement cette recette ?")) return;
    await deleteRecipe(recipe.id);
    router.push("/recipes");
  }

  if (loading) return <p className="text-cocoa/70">Chargement...</p>;
  if (!recipe) return <p className="text-cocoa/70">Recette introuvable.</p>;

  const canEdit = user?.uid === recipe.authorId;

  return (
    <div className="flex flex-col gap-8">
      <PrintableRecipe recipe={recipe} />

      {canEdit && (
        <div className="flex gap-3 no-print">
          <Link href={`/recipes/${recipe.id}/edit`} className="btn-secondary">
            Modifier
          </Link>
          <button onClick={handleDelete} className="btn-secondary text-stamp">
            Supprimer
          </button>
        </div>
      )}

      {similar.length > 0 && (
        <section>
          <h2 className="text-3xl mb-3">Recettes similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {similar.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function RecipeDetailPage() {
  return (
    <AuthGuard>
      <RecipeDetailContent />
    </AuthGuard>
  );
}

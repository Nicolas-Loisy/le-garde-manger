"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { listRecipes, pickRandomRecipe } from "@/lib/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import type { Recipe } from "@/types/recipe";

export default function HomePage() {
  const { user, isAllowed, loading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAllowed) {
      setFetching(false);
      return;
    }
    listRecipes()
      .then(setRecipes)
      .finally(() => setFetching(false));
  }, [isAllowed]);

  if (loading) return null;

  if (!user || !isAllowed) {
    return (
      <div className="notebook-card p-8 text-center flex flex-col gap-4 items-center">
        <h1 className="text-4xl">Bienvenue dans le Garde-Manger</h1>
        <p className="text-cocoa/80 max-w-xl">
          Ce carnet de recettes est réservé à la famille et aux proches. Connectez-vous
          avec l&apos;adresse email autorisée pour découvrir et partager les recettes.
        </p>
        <Link href="/login" className="btn-primary">
          Se connecter
        </Link>
      </div>
    );
  }

  const recetteDuJour = pickRandomRecipe(recipes);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-4xl mb-4">Bienvenue {user.displayName || user.email}</h1>
        <p className="text-cocoa/80">
          Retrouvez ici toutes nos recettes de famille, classées et prêtes à être
          cuisinées.
        </p>
      </section>

      {recetteDuJour && (
        <section>
          <h2 className="text-3xl mb-3">Recette du jour</h2>
          <div className="max-w-sm">
            <RecipeCard recipe={recetteDuJour} />
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl">Dernières recettes ajoutées</h2>
          <Link href="/recipes" className="text-rust hover:underline">
            Voir tout →
          </Link>
        </div>
        {fetching ? (
          <p className="text-cocoa/70">Chargement du carnet...</p>
        ) : recipes.length === 0 ? (
          <p className="text-cocoa/70">
            Aucune recette pour l&apos;instant. Soyez le premier à en ajouter une !
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recipes.slice(0, 6).map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

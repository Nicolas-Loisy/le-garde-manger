import { doc, runTransaction } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Category, Difficulty, Ingredient } from "@/types/recipe";

export interface ParsedRecipe {
  title: string;
  category: Category;
  cuisineType: string | null;
  ingredients: Ingredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  restMinutes: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
}

const DAILY_LIMIT = 20;

function todayId(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Réserve un remplissage automatique dans le quota du jour (collection
 * Firestore ai_usage, un document par jour). Lève une erreur si le quota
 * est déjà atteint. Transaction pour rester correct si deux personnes
 * utilisent la fonctionnalité en même temps.
 */
async function consumeDailyQuota(): Promise<void> {
  const ref = doc(db, "ai_usage", todayId());
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? ((snap.data().count as number) ?? 0) : 0;
    if (current >= DAILY_LIMIT) {
      throw new Error(
        `Limite quotidienne de ${DAILY_LIMIT} remplissages automatiques atteinte. Réessaie demain.`
      );
    }
    tx.set(ref, { count: current + 1 }, { merge: true });
  });
}

/** Analyse un texte de recette (collé ou dicté) et en extrait les champs structurés via Claude. */
export async function parseRecipeFromText(text: string): Promise<ParsedRecipe> {
  if (!auth.currentUser) {
    throw new Error("Vous devez être connecté.");
  }

  await consumeDailyQuota();

  const idToken = await auth.currentUser.getIdToken();
  const res = await fetch("/api/parse-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, idToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      (body as { error?: string } | null)?.error ?? "Impossible d'analyser la recette."
    );
  }

  return (await res.json()) as ParsedRecipe;
}

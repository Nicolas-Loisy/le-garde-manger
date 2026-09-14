import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Category, Recipe, RecipeInput } from "@/types/recipe";

const RECIPES_COLLECTION = "recipes";

export async function listRecipes(): Promise<Recipe[]> {
  const q = query(
    collection(db, RECIPES_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Recipe);
}

export async function listRecipesByCategory(
  category: Category
): Promise<Recipe[]> {
  const q = query(
    collection(db, RECIPES_COLLECTION),
    where("category", "==", category),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Recipe);
}

export async function listRecipesByAuthor(authorId: string): Promise<Recipe[]> {
  const q = query(
    collection(db, RECIPES_COLLECTION),
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Recipe);
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  const snap = await getDoc(doc(db, RECIPES_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as object) } as Recipe;
}

export async function createRecipe(input: RecipeInput): Promise<string> {
  const ref = await addDoc(collection(db, RECIPES_COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateRecipe(
  id: string,
  input: Partial<RecipeInput>
): Promise<void> {
  await updateDoc(doc(db, RECIPES_COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, RECIPES_COLLECTION, id));
}

/** Sélectionne une recette au hasard parmi la liste ("recette du jour"). */
export function pickRandomRecipe(recipes: Recipe[]): Recipe | null {
  if (recipes.length === 0) return null;
  const seed = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return recipes[hash % recipes.length];
}

/** Recettes similaires : même catégorie, puis tags en commun. */
export function findSimilarRecipes(
  recipe: Recipe,
  all: Recipe[],
  limit = 4
): Recipe[] {
  return all
    .filter((r) => r.id !== recipe.id)
    .map((r) => {
      let score = 0;
      if (r.category === recipe.category) score += 2;
      score += r.tags.filter((tag) => recipe.tags.includes(tag)).length;
      return { recipe: r, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.recipe);
}

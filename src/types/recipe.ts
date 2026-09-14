export type Category = "entree" | "plat" | "dessert" | "autre";

export type Difficulty = "facile" | "moyen" | "difficile";

export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Recipe {
  id: string;
  title: string;
  photoUrls: string[];
  authorId: string;
  authorName: string;
  category: Category;
  cuisineType?: string;
  ingredients: Ingredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  restMinutes: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecipeInput = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "entree", label: "Entrée" },
  { value: "plat", label: "Plat" },
  { value: "dessert", label: "Dessert" },
  { value: "autre", label: "Autre" },
];

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "facile", label: "Facile" },
  { value: "moyen", label: "Moyen" },
  { value: "difficile", label: "Difficile" },
];

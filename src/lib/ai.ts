import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  Schema,
  type GenerativeModel,
} from "firebase/ai";
import { app } from "./firebase";
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

const recipeSchema = Schema.object({
  properties: {
    title: Schema.string(),
    category: Schema.enumString({ enum: ["entree", "plat", "dessert", "autre"] }),
    cuisineType: Schema.string({ nullable: true }),
    ingredients: Schema.array({
      items: Schema.object({
        properties: {
          name: Schema.string(),
          quantity: Schema.number({ nullable: true }),
          unit: Schema.string({ nullable: true }),
        },
      }),
    }),
    steps: Schema.array({ items: Schema.string() }),
    prepMinutes: Schema.integer(),
    cookMinutes: Schema.integer(),
    restMinutes: Schema.integer(),
    difficulty: Schema.enumString({ enum: ["facile", "moyen", "difficile"] }),
    servings: Schema.integer(),
    tags: Schema.array({ items: Schema.string() }),
  },
});

const INSTRUCTIONS = `Tu es un assistant qui extrait les informations structurées d'une recette de cuisine à partir d'un texte libre (recette copiée depuis un site, un livre, ou transcrite depuis une dictée vocale). Réponds uniquement avec le JSON demandé, sans aucun texte autour.

Règles :
- Les quantités dans "ingredients" sont des nombres (convertis les fractions, ex. "1/2" -> 0.5). Si une quantité n'est pas chiffrable (ex. "une pincée", "au goût"), mets quantity à null et décris-la dans "unit".
- "category" doit être l'une de : entree, plat, dessert, autre.
- "difficulty" doit être l'une de : facile, moyen, difficile (déduis-la si elle n'est pas explicite).
- "prepMinutes", "cookMinutes", "restMinutes" sont des nombres de minutes ; mets 0 si l'information est absente.
- "servings" : nombre de portions, déduis une valeur raisonnable (4 par défaut) si absente.
- "tags" : quelques mots-clés pertinents (ex. "rapide", "végétarien", "hiver"), tableau vide si aucun ne se dégage clairement.
- "cuisineType" : type de cuisine si mentionné (ex. "Italienne"), sinon null.

Voici le texte à analyser :
`;

const AUDIO_INSTRUCTIONS = `Tu es un assistant qui transcrit une recette de cuisine dictée à voix haute, puis en extrait les informations structurées. Réponds uniquement avec le JSON demandé, sans aucun texte autour.

Règles :
- Les quantités dans "ingredients" sont des nombres (convertis les fractions, ex. "1/2" -> 0.5). Si une quantité n'est pas chiffrable (ex. "une pincée", "au goût"), mets quantity à null et décris-la dans "unit".
- "category" doit être l'une de : entree, plat, dessert, autre.
- "difficulty" doit être l'une de : facile, moyen, difficile (déduis-la si elle n'est pas explicite).
- "prepMinutes", "cookMinutes", "restMinutes" sont des nombres de minutes ; mets 0 si l'information est absente.
- "servings" : nombre de portions, déduis une valeur raisonnable (4 par défaut) si absente.
- "tags" : quelques mots-clés pertinents (ex. "rapide", "végétarien", "hiver"), tableau vide si aucun ne se dégage clairement.
- "cuisineType" : type de cuisine si mentionné (ex. "Italienne"), sinon null.`;

function getModel(): GenerativeModel {
  if (!app) {
    throw new Error("Firebase n'est disponible que côté navigateur.");
  }
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  return getGenerativeModel(ai, {
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
    },
  });
}

function parseResponse(raw: string): ParsedRecipe {
  try {
    return JSON.parse(raw) as ParsedRecipe;
  } catch {
    throw new Error("La réponse de l'IA n'a pas pu être analysée. Réessaie.");
  }
}

/** Analyse un texte de recette collé par l'utilisateur et en extrait les champs structurés. */
export async function parseRecipeFromText(text: string): Promise<ParsedRecipe> {
  const model = getModel();
  const result = await model.generateContent(INSTRUCTIONS + text);
  return parseResponse(result.response.text());
}

/** Transcrit et analyse une recette dictée (enregistrement audio du micro). */
export async function parseRecipeFromAudio(audio: Blob): Promise<ParsedRecipe> {
  const model = getModel();
  const data = await blobToBase64(audio);
  const result = await model.generateContent([
    AUDIO_INSTRUCTIONS,
    { inlineData: { mimeType: audio.type || "audio/webm", data } },
  ]);
  return parseResponse(result.response.text());
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

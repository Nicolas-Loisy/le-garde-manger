import { NextResponse } from "next/server";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

const INSTRUCTIONS = `Tu es un assistant qui extrait les informations structurées d'une recette de cuisine à partir d'un texte libre (recette copiée depuis un site, un livre, ou dictée à voix haute puis transcrite). Utilise l'outil "extract_recipe" pour renvoyer le résultat.

Règles :
- Les quantités dans "ingredients" sont des nombres (convertis les fractions, ex. "1/2" -> 0.5). Si une quantité n'est pas chiffrable (ex. "une pincée", "au goût"), mets quantity à null et décris-la dans "unit".
- "category" doit être l'une de : entree, plat, dessert, autre.
- "difficulty" doit être l'une de : facile, moyen, difficile (déduis-la si elle n'est pas explicite).
- "prepMinutes", "cookMinutes", "restMinutes" sont des nombres de minutes ; mets 0 si l'information est absente.
- "servings" : nombre de portions, déduis une valeur raisonnable (4 par défaut) si absente.
- "tags" : quelques mots-clés pertinents (ex. "rapide", "végétarien", "hiver"), tableau vide si aucun ne se dégage clairement.
- "cuisineType" : type de cuisine si mentionné (ex. "Italienne"), sinon null.`;

const RECIPE_TOOL = {
  name: "extract_recipe",
  description: "Enregistre les informations structurées extraites d'une recette de cuisine.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      category: { type: "string", enum: ["entree", "plat", "dessert", "autre"] },
      cuisineType: { type: ["string", "null"] },
      ingredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: ["number", "null"] },
            unit: { type: ["string", "null"] },
          },
          required: ["name", "quantity", "unit"],
        },
      },
      steps: { type: "array", items: { type: "string" } },
      prepMinutes: { type: "integer" },
      cookMinutes: { type: "integer" },
      restMinutes: { type: "integer" },
      difficulty: { type: "string", enum: ["facile", "moyen", "difficile"] },
      servings: { type: "integer" },
      tags: { type: "array", items: { type: "string" } },
    },
    required: [
      "title",
      "category",
      "cuisineType",
      "ingredients",
      "steps",
      "prepMinutes",
      "cookMinutes",
      "restMinutes",
      "difficulty",
      "servings",
      "tags",
    ],
  },
};

interface AnthropicToolUseBlock {
  type: "tool_use";
  input: unknown;
}

interface AnthropicResponse {
  content: Array<{ type: string } & Partial<AnthropicToolUseBlock>>;
}

/**
 * Vérifie que le jeton Firebase Auth fourni par le client est valide, via
 * l'API publique Identity Toolkit (même clé Web que côté client — aucun
 * compte de service requis). Empêche un appel public non authentifié de
 * consommer le quota Claude.
 */
async function isValidFirebaseIdToken(idToken: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false;

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  return res.ok;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY n'est pas configurée côté serveur." },
      { status: 500 }
    );
  }

  let body: { text?: unknown; idToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { text, idToken } = body;

  if (typeof idToken !== "string" || !idToken || !(await isValidFirebaseIdToken(idToken))) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Texte manquant." }, { status: 400 });
  }

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2048,
      tools: [RECIPE_TOOL],
      tool_choice: { type: "tool", name: "extract_recipe" },
      messages: [
        {
          role: "user",
          content: `${INSTRUCTIONS}\n\nTexte à analyser :\n${text}`,
        },
      ],
    }),
  });

  if (!anthropicResponse.ok) {
    const details = await anthropicResponse.text();
    return NextResponse.json(
      { error: `Erreur de l'API Claude : ${details}` },
      { status: 502 }
    );
  }

  const data = (await anthropicResponse.json()) as AnthropicResponse;
  const toolUse = data.content.find(
    (block): block is AnthropicToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    return NextResponse.json(
      { error: "La réponse de l'IA n'a pas pu être analysée." },
      { status: 502 }
    );
  }

  return NextResponse.json(toolUse.input);
}

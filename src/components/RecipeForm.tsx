"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createRecipe, updateRecipe } from "@/lib/recipes";
import {
  CATEGORIES,
  DIFFICULTIES,
  type Category,
  type Difficulty,
  type Ingredient,
  type Recipe,
} from "@/types/recipe";

export function RecipeForm({ existing }: { existing?: Recipe }) {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState<Category>(existing?.category ?? "plat");
  const [cuisineType, setCuisineType] = useState(existing?.cuisineType ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    existing?.ingredients ?? [{ name: "", quantity: null, unit: null }]
  );
  const [steps, setSteps] = useState<string[]>(existing?.steps ?? [""]);
  const [prepMinutes, setPrepMinutes] = useState(existing?.prepMinutes ?? 15);
  const [cookMinutes, setCookMinutes] = useState(existing?.cookMinutes ?? 15);
  const [restMinutes, setRestMinutes] = useState(existing?.restMinutes ?? 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    existing?.difficulty ?? "facile"
  );
  const [servings, setServings] = useState(existing?.servings ?? 4);
  const [tags, setTags] = useState(existing?.tags.join(", ") ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        photoUrls: existing?.photoUrls ?? [],
        authorId: user.uid,
        authorName: user.displayName || user.email || "Anonyme",
        category,
        cuisineType: cuisineType || undefined,
        ingredients: ingredients.filter((i) => i.name.trim() !== ""),
        steps: steps.filter((s) => s.trim() !== ""),
        prepMinutes,
        cookMinutes,
        restMinutes,
        difficulty,
        servings,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: notes || undefined,
      };

      let id: string;
      if (existing) {
        id = existing.id;
        await updateRecipe(id, payload);
      } else {
        id = await createRecipe(payload);
      }

      router.push(`/recipes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="notebook-card p-6 flex flex-col gap-5">
      <div>
        <label className="block mb-1">Titre</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block mb-1">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Type de cuisine</label>
          <input
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            placeholder="Italienne, asiatique..."
            className="bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
          />
        </div>
        <div>
          <label className="block mb-1">Difficulté</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block mb-1">Préparation (min)</label>
          <input
            type="number"
            min={0}
            value={prepMinutes}
            onChange={(e) => setPrepMinutes(Number(e.target.value))}
            className="w-24 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
          />
        </div>
        <div>
          <label className="block mb-1">Cuisson (min)</label>
          <input
            type="number"
            min={0}
            value={cookMinutes}
            onChange={(e) => setCookMinutes(Number(e.target.value))}
            className="w-24 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
          />
        </div>
        <div>
          <label className="block mb-1">Repos (min)</label>
          <input
            type="number"
            min={0}
            value={restMinutes}
            onChange={(e) => setRestMinutes(Number(e.target.value))}
            className="w-24 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
          />
        </div>
        <div>
          <label className="block mb-1">Portions</label>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-24 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1">Ingrédients</label>
        {ingredients.map((ing, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              placeholder="Ingrédient"
              value={ing.name}
              onChange={(e) => {
                const next = [...ingredients];
                next[idx] = { ...next[idx], name: e.target.value };
                setIngredients(next);
              }}
              className="flex-1 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
            />
            <input
              type="number"
              placeholder="Qté"
              value={ing.quantity ?? ""}
              onChange={(e) => {
                const next = [...ingredients];
                next[idx] = {
                  ...next[idx],
                  quantity: e.target.value ? Number(e.target.value) : null,
                };
                setIngredients(next);
              }}
              className="w-20 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
            />
            <input
              placeholder="Unité"
              value={ing.unit ?? ""}
              onChange={(e) => {
                const next = [...ingredients];
                next[idx] = { ...next[idx], unit: e.target.value || null };
                setIngredients(next);
              }}
              className="w-24 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
            />
            <button
              type="button"
              onClick={() =>
                setIngredients(ingredients.filter((_, i) => i !== idx))
              }
              className="text-stamp"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setIngredients([...ingredients, { name: "", quantity: null, unit: null }])
          }
          className="btn-secondary text-sm"
        >
          + Ajouter un ingrédient
        </button>
      </div>

      <div>
        <label className="block mb-1">Étapes de préparation</label>
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <span className="pt-2 text-cocoa/60">{idx + 1}.</span>
            <textarea
              value={step}
              onChange={(e) => {
                const next = [...steps];
                next[idx] = e.target.value;
                setSteps(next);
              }}
              className="flex-1 bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
              rows={2}
            />
            <button
              type="button"
              onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
              className="text-stamp"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSteps([...steps, ""])}
          className="btn-secondary text-sm"
        >
          + Ajouter une étape
        </button>
      </div>

      <div>
        <label className="block mb-1">Tags (séparés par des virgules)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="rapide, sans gluten, hiver"
          className="w-full bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
        />
      </div>

      <div>
        <label className="block mb-1">Notes personnelles / anecdotes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
        />
      </div>

      {error && <p className="text-stamp">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Enregistrement..." : existing ? "Mettre à jour" : "Ajouter la recette"}
      </button>
    </form>
  );
}

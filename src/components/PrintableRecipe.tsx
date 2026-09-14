"use client";

import type { Recipe } from "@/types/recipe";
import { DIFFICULTIES } from "@/types/recipe";

export function PrintableRecipe({ recipe }: { recipe: Recipe }) {
  const difficulty = DIFFICULTIES.find((d) => d.value === recipe.difficulty)?.label;

  return (
    <article className="notebook-card p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 no-print">
        <h1 className="text-3xl sm:text-4xl break-words">{recipe.title}</h1>
        <button onClick={() => window.print()} className="btn-secondary self-start">
          Imprimer la fiche
        </button>
      </div>
      <h1 className="text-4xl hidden print:block">{recipe.title}</h1>

      <p className="text-cocoa/80 mt-2">
        Par {recipe.authorName}
        {recipe.cuisineType ? ` · Cuisine ${recipe.cuisineType}` : ""}
      </p>

      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        <span>Préparation : {recipe.prepMinutes} min</span>
        <span>Cuisson : {recipe.cookMinutes} min</span>
        {recipe.restMinutes > 0 && <span>Repos : {recipe.restMinutes} min</span>}
        <span>Difficulté : {difficulty}</span>
        <span>{recipe.servings} portions</span>
      </div>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {recipe.tags.map((tag) => (
            <span key={tag} className="stamp text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-2xl mb-2">Ingrédients</h2>
        <ul className="list-disc list-inside space-y-1">
          {recipe.ingredients.map((ing, idx) => (
            <li key={idx}>
              {ing.quantity ? `${ing.quantity} ` : ""}
              {ing.unit ? `${ing.unit} ` : ""}
              {ing.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl mb-2">Préparation</h2>
        <ol className="list-decimal list-inside space-y-2">
          {recipe.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      {recipe.notes && (
        <section className="mt-6">
          <h2 className="text-2xl mb-2">Notes &amp; souvenirs</h2>
          <p className="italic text-cocoa/80">{recipe.notes}</p>
        </section>
      )}
    </article>
  );
}

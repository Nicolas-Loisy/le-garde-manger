"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/types/recipe";
import { CATEGORIES, DIFFICULTIES } from "@/types/recipe";

const RING_COUNT = 12;

function SpiralRings() {
  return (
    <div className="spiral-rings" aria-hidden="true">
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <Image key={i} src="/spiral-ring.png" alt="" width={64} height={20} />
      ))}
    </div>
  );
}

export function NotebookView({ recipes }: { recipes: Recipe[] }) {
  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState<"next" | "prev" | null>(null);

  const total = recipes.length;

  function goTo(newIndex: number, direction: "next" | "prev") {
    if (newIndex < 0 || newIndex >= total || flip) return;
    setFlip(direction);
    window.setTimeout(() => setIndex(newIndex), 250);
    window.setTimeout(() => setFlip(null), 500);
  }

  if (total === 0) {
    return (
      <div className="spiral-notebook mx-auto max-w-2xl" style={{ perspective: "1500px" }}>
        <SpiralRings />
        <div className="ruled-page p-10 pl-14 text-center">
          <p className="text-cocoa/70">
            Le carnet est encore vide. Ajoute une première recette pour la voir ici.
          </p>
        </div>
      </div>
    );
  }

  const recipe = recipes[index];
  const category = CATEGORIES.find((c) => c.value === recipe.category)?.label;
  const difficulty = DIFFICULTIES.find((d) => d.value === recipe.difficulty)?.label;

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="spiral-notebook mx-auto w-full max-w-2xl"
        style={{ perspective: "1500px" }}
      >
        <SpiralRings />
        <div
          key={recipe.id}
          className={`ruled-page p-8 pl-14 ${
            flip === "next" ? "page-flip-next" : flip === "prev" ? "page-flip-prev" : ""
          }`}
        >
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-4xl block mb-1 hover:text-rust"
          >
            {recipe.title}
          </Link>
          <p className="text-cocoa/70 text-sm mb-5">
            Par {recipe.authorName} · {category} · {difficulty} ·{" "}
            {recipe.prepMinutes + recipe.cookMinutes} min
          </p>

          <h3 className="text-xl mb-1">Ingrédients</h3>
          <ul className="list-disc list-inside mb-4 text-sm">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                {ing.quantity ? `${ing.quantity} ` : ""}
                {ing.unit ? `${ing.unit} ` : ""}
                {ing.name}
              </li>
            ))}
          </ul>

          <h3 className="text-xl mb-1">Préparation</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <p className="text-right text-cocoa/50 text-sm mt-6">
            Page {index + 1} / {total}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => goTo(index - 1, "prev")}
          disabled={index === 0 || !!flip}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Page précédente
        </button>
        <span className="text-cocoa/60 text-sm">
          {index + 1} / {total}
        </span>
        <button
          onClick={() => goTo(index + 1, "next")}
          disabled={index === total - 1 || !!flip}
          className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Page suivante →
        </button>
      </div>
    </div>
  );
}

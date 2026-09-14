"use client";

import { useMemo, useState } from "react";
import type { Author, Category, Difficulty, Recipe } from "@/types/recipe";
import { CATEGORIES, DIFFICULTIES } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";

type SortKey = "date" | "alpha" | "prepTime";

export function RecipeFilters({
  recipes,
  authors,
}: {
  recipes: Recipe[];
  authors: Author[];
}) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [authorId, setAuthorId] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<SortKey>("date");

  const allTags = useMemo(
    () => Array.from(new Set(recipes.flatMap((r) => r.tags))).sort(),
    [recipes]
  );

  const filtered = useMemo(() => {
    let result = recipes.filter((r) => {
      const matchesKeyword =
        !keyword ||
        r.title.toLowerCase().includes(keyword.toLowerCase()) ||
        r.ingredients.some((i) =>
          i.name.toLowerCase().includes(keyword.toLowerCase())
        );
      const matchesCategory = !category || r.category === category;
      const matchesAuthor = !authorId || r.authorId === authorId;
      const matchesDifficulty = !difficulty || r.difficulty === difficulty;
      const matchesTag = !tag || r.tags.includes(tag);
      return (
        matchesKeyword &&
        matchesCategory &&
        matchesAuthor &&
        matchesDifficulty &&
        matchesTag
      );
    });

    result = [...result].sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "prepTime")
        return a.prepMinutes + a.cookMinutes - (b.prepMinutes + b.cookMinutes);
      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [recipes, keyword, category, authorId, difficulty, tag, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="notebook-card p-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Rechercher un titre ou un ingrédient..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1"
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1"
          >
            <option value="">Tous les auteurs</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1"
          >
            <option value="">Toute difficulté</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1"
          >
            <option value="">Tous les tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-paper border border-cocoa/30 rounded-sm px-2 py-1 ml-auto"
          >
            <option value="date">Plus récentes</option>
            <option value="alpha">Ordre alphabétique</option>
            <option value="prepTime">Temps de préparation</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-cocoa/70">Aucune recette ne correspond à ces critères.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/types/recipe";
import { CATEGORIES, DIFFICULTIES } from "@/types/recipe";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const category = CATEGORIES.find((c) => c.value === recipe.category)?.label;
  const difficulty = DIFFICULTIES.find((d) => d.value === recipe.difficulty)?.label;

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="notebook-card p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-transform"
    >
      {recipe.photoUrls[0] ? (
        <div className="relative w-full h-40 rounded-sm overflow-hidden">
          <Image
            src={recipe.photoUrls[0]}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-40 rounded-sm bg-paper-dark flex items-center justify-center text-cocoa/40 text-sm">
          Pas de photo
        </div>
      )}
      <h3 className="text-2xl">{recipe.title}</h3>
      <p className="text-sm text-cocoa/80">
        Par {recipe.authorName} · {category} · {difficulty}
      </p>
      <p className="text-sm text-cocoa/70">
        {recipe.prepMinutes + recipe.cookMinutes} min · {recipe.servings} portions
      </p>
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {recipe.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="stamp text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

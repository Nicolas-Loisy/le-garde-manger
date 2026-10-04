"use client";

import { useRef, useState } from "react";
import { parseRecipeFromText, type ParsedRecipe } from "@/lib/ai";

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

interface MinimalSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => MinimalSpeechRecognition;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function RecipeAutofill({
  onParsed,
}: {
  onParsed: (parsed: ParsedRecipe) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  async function handleTextSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseRecipeFromText(text);
      onParsed(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'analyser la recette."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleDictation() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setError(
        "La dictée vocale n'est pas disponible sur ce navigateur (essaie Chrome ou Edge)."
      );
      return;
    }

    setError(null);
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let addition = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        addition += (addition ? " " : "") + event.results[i][0].transcript;
      }
      if (addition) {
        setText((prev) => (prev ? `${prev} ${addition}` : addition));
      }
    };
    recognition.onerror = () => {
      setError("Erreur pendant la dictée. Réessaie.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="notebook-card p-4 sm:p-6 flex flex-col gap-3">
      <h2 className="text-2xl">Remplir automatiquement</h2>
      <p className="text-sm text-cocoa/70">
        Colle une recette (depuis un site, un livre...) ou dicte-la au micro : les
        champs ci-dessous se rempliront tout seuls, à vérifier et corriger ensuite.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Colle ici le texte d'une recette, ou utilise le micro..."
        className="w-full bg-transparent border border-cocoa/30 rounded-sm p-2 focus:outline-none focus:border-rust"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleTextSubmit}
          disabled={loading || listening || !text.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Analyse en cours..." : "Remplir depuis le texte"}
        </button>
        <button
          type="button"
          onClick={toggleDictation}
          disabled={loading}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {listening ? "Arrêter la dictée" : "Dicter la recette"}
        </button>
        {listening && <span className="text-stamp text-sm">Écoute en cours...</span>}
      </div>
      {error && <p className="text-stamp text-sm">{error}</p>}
    </div>
  );
}

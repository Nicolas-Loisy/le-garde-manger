"use client";

import { useRef, useState } from "react";
import { parseRecipeFromAudio, parseRecipeFromText, type ParsedRecipe } from "@/lib/ai";

export function RecipeAutofill({
  onParsed,
}: {
  onParsed: (parsed: ParsedRecipe) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function runParse(task: () => Promise<ParsedRecipe>) {
    setLoading(true);
    setError(null);
    try {
      const parsed = await task();
      onParsed(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'analyser la recette."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleTextSubmit() {
    if (!text.trim()) return;
    await runParse(() => parseRecipeFromText(text));
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        void runParse(() => parseRecipeFromAudio(blob));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError(
        "Impossible d'accéder au micro. Vérifie les autorisations de ton navigateur."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
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
        placeholder="Colle ici le texte d'une recette..."
        className="w-full bg-transparent border border-cocoa/30 rounded-sm p-2 focus:outline-none focus:border-rust"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleTextSubmit}
          disabled={loading || recording || !text.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Analyse en cours..." : "Remplir depuis le texte"}
        </button>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
          className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {recording ? "Arrêter et analyser" : "Dicter la recette"}
        </button>
        {recording && (
          <span className="text-stamp text-sm">Enregistrement en cours...</span>
        )}
      </div>
      {error && <p className="text-stamp text-sm">{error}</p>}
    </div>
  );
}

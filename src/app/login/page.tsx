"use client";

import { useState } from "react";
import { sendMagicLink } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="notebook-card p-8 max-w-md mx-auto flex flex-col gap-4">
      <h1 className="text-3xl">Se connecter</h1>
      {sent ? (
        <p className="text-cocoa/80">
          Un lien de connexion vous a été envoyé à <strong>{email}</strong>. Ouvrez-le
          depuis cet appareil pour finaliser la connexion.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-cocoa/80">
            Entrez votre adresse email autorisée : vous recevrez un lien de connexion,
            sans mot de passe.
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="bg-transparent border-b border-cocoa/30 py-1 focus:outline-none focus:border-rust"
          />
          {error && <p className="text-stamp">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Envoi..." : "Recevoir le lien de connexion"}
          </button>
        </form>
      )}
    </div>
  );
}

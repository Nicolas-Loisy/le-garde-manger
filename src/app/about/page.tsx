export default function AboutPage() {
  return (
    <div className="notebook-card p-8 max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-4xl">À propos du Garde-Manger</h1>
      <p className="text-cocoa/80">
        Le Garde-Manger est un carnet de recettes numérique pensé comme un espace
        convivial pour stocker, organiser et retrouver nos recettes de famille. Il
        garde l&apos;esprit d&apos;un carnet manuscrit transmis de génération en
        génération : chaque recette porte le nom de son auteur, ses anecdotes et ses
        petits secrets.
      </p>
      <p className="text-cocoa/80">
        L&apos;accès est réservé aux proches invités par email — pas de compte public,
        juste un lien de connexion envoyé par email.
      </p>
    </div>
  );
}

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Storage n'est pas initialisé : Firebase exige désormais le plan payant
// Blaze pour créer un bucket Storage, ce qui est repoussé pour l'instant
// (voir README, section Photos). Les recettes n'ont donc pas de photoUrls
// pour le moment.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase n'est initialisé que côté navigateur : ce projet est un espace
// authentifié entièrement piloté par le client, et l'initialiser pendant le
// rendu/prerendering serveur échouerait sans les variables d'environnement
// (qui ne sont fournies qu'au runtime, cf. .env.local / variables Vercel).
function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  const apps = getApps();
  const firebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  initAppCheck(firebaseApp);
  return firebaseApp;
}

/**
 * App Check protège l'API Gemini (Firebase AI Logic) : sans token d'attestation
 * valide, les appels sont rejetés (401). Le vrai flux reCAPTCHA Enterprise /
 * Fraud Defense s'exécute silencieusement (aucune interaction utilisateur),
 * y compris sur localhost tant que ce domaine est autorisé pour la clé
 * (voir README, section IA).
 *
 * Appelée à chaque évaluation du module (y compris après un rechargement à
 * chaud en dev, où une app Firebase déjà enregistrée peut être réutilisée) :
 * initializeAppCheck() lève si elle a déjà été appelée pour cette app, d'où
 * le try/catch — on ignore alors l'erreur plutôt que de planter le rendu.
 */
function initAppCheck(app: FirebaseApp): void {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return;

  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // Déjà initialisée pour cette app (ex. re-render à chaud) : rien à faire.
  }
}

export const app = getFirebaseApp();

export const auth = (app ? getAuth(app) : null) as Auth;
export const db = (app ? getFirestore(app) : null) as Firestore;

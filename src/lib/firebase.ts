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
  if (apps.length > 0) return apps[0];
  const newApp = initializeApp(firebaseConfig);
  initAppCheck(newApp);
  return newApp;
}

/**
 * App Check protège l'API Gemini (Firebase AI Logic) : sans token d'attestation
 * valide, les appels sont rejetés (401). En local, le jeton de débogage
 * remplace reCAPTCHA Enterprise / Fraud Defense (voir README, section IA,
 * pour l'enregistrer une fois côté console Firebase).
 */
function initAppCheck(app: FirebaseApp): void {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return;

  if (process.env.NODE_ENV !== "production") {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      true;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const app = getFirebaseApp();

export const auth = (app ? getAuth(app) : null) as Auth;
export const db = (app ? getFirestore(app) : null) as Firestore;

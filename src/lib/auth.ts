import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const EMAIL_STORAGE_KEY = "gardeManger.emailForSignIn";

function getActionCodeSettings() {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/action`
      : process.env.NEXT_PUBLIC_APP_URL ?? "";

  return {
    url,
    handleCodeInApp: true,
  };
}

/** Envoie un lien de connexion ("magic link") à l'adresse email fournie. */
export async function sendMagicLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, getActionCodeSettings());
  window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

/** Termine la connexion si l'URL courante est un lien de connexion Firebase valide. */
export async function completeSignInIfNeeded(): Promise<boolean> {
  if (!isSignInWithEmailLink(auth, window.location.href)) return false;

  let email = window.localStorage.getItem(EMAIL_STORAGE_KEY);
  if (!email) {
    email = window.prompt(
      "Merci de confirmer votre adresse email pour finaliser la connexion :"
    );
  }
  if (!email) return false;

  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  return true;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Un email n'est autorisé que s'il figure dans la collection Firestore
 * `allowed_emails` (liste blanche gérée depuis la console Firebase).
 */
export async function isEmailAllowed(email: string): Promise<boolean> {
  const ref = doc(db, "allowed_emails", email.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

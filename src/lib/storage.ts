import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

/** Envoie une photo de recette et retourne son URL de téléchargement publique. */
export async function uploadRecipePhoto(
  recipeId: string,
  file: File
): Promise<string> {
  const path = `recipes/${recipeId}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

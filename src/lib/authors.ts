import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Author } from "@/types/recipe";

const AUTHORS_COLLECTION = "authors";

export async function listAuthors(): Promise<Author[]> {
  const q = query(collection(db, AUTHORS_COLLECTION), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Author);
}

export async function getAuthor(id: string): Promise<Author | null> {
  const snap = await getDoc(doc(db, AUTHORS_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as object) } as Author;
}

export async function upsertAuthor(author: Author): Promise<void> {
  await setDoc(doc(db, AUTHORS_COLLECTION, author.id), author, { merge: true });
}

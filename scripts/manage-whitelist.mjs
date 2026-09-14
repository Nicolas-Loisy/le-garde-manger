#!/usr/bin/env node
/**
 * Ajoute ou retire un email de la liste blanche `allowed_emails` (Firestore),
 * via le SDK Admin. Nécessite la variable d'environnement
 * GOOGLE_APPLICATION_CREDENTIALS pointant vers une clé de compte de service
 * (jamais commitée — voir .gitignore).
 *
 * Usage :
 *   node scripts/manage-whitelist.mjs add nicolas.loisy70@gmail.com
 *   node scripts/manage-whitelist.mjs remove quelquun@exemple.com
 *   node scripts/manage-whitelist.mjs list
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const [command, email] = process.argv.slice(2);

if (!command || (command !== "list" && !email)) {
  console.error("Usage: node scripts/manage-whitelist.mjs <add|remove|list> [email]");
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const collection = db.collection("allowed_emails");

switch (command) {
  case "add": {
    await collection.doc(email.toLowerCase()).set({ email: email.toLowerCase() });
    console.log(`✅ ${email} ajouté à la liste blanche.`);
    break;
  }
  case "remove": {
    await collection.doc(email.toLowerCase()).delete();
    console.log(`✅ ${email} retiré de la liste blanche.`);
    break;
  }
  case "list": {
    const snap = await collection.get();
    if (snap.empty) {
      console.log("Aucun email dans la liste blanche.");
    } else {
      snap.forEach((doc) => console.log(doc.id));
    }
    break;
  }
  default:
    console.error(`Commande inconnue : ${command}`);
    process.exit(1);
}

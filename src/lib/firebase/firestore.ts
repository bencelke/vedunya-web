"use client";

import { getFirestore, type Firestore } from "firebase/firestore";

import { getFirebaseApp } from "./client";

let firestoreInstance: Firestore | null = null;

export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  firestoreInstance ??= getFirestore(app);
  return firestoreInstance;
}

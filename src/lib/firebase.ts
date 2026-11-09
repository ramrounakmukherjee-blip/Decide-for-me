import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  onSnapshot
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { DecisionResult } from "../types";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Auth Helpers
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

export const loginAnonymously = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return await signOut(auth);
};

// Firestore Decisions API
export const saveDecisionToFirestore = async (userId: string, decision: DecisionResult) => {
  if (!userId) return;
  try {
    const decRef = doc(db, "users", userId, "decisions", decision.id);
    await setDoc(decRef, {
      ...decision,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error saving decision to Firestore:", err);
  }
};

export const subscribeUserDecisions = (
  userId: string,
  onUpdate: (decisions: DecisionResult[]) => void
) => {
  if (!userId) return () => {};

  const q = query(
    collection(db, "users", userId, "decisions"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const results: DecisionResult[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as DecisionResult);
    });
    onUpdate(results);
  });
};

export const deleteDecisionFromFirestore = async (userId: string, decisionId: string) => {
  if (!userId) return;
  try {
    await deleteDoc(doc(db, "users", userId, "decisions", decisionId));
  } catch (err) {
    console.error("Error deleting decision from Firestore:", err);
  }
};

// Firebase AI Logic Template SDK call for 'decider-flow'
export const callDeciderFlowTemplate = async (payload: {
  priorities: string;
  optionA: string;
  optionB: string;
}): Promise<{ verdict: string; justification: string; firstStep: string }> => {
  const response = await fetch("/api/decide-template", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      templateId: "decider-flow",
      priorities: payload.priorities,
      optionA: payload.optionA,
      optionB: payload.optionB,
    }),
  });

  const resData = await response.json();
  if (!response.ok || !resData.success) {
    throw new Error(resData.error || "Failed to execute decider-flow prompt template.");
  }

  return resData.data;
};


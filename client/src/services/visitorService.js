import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

import { db } from "../firebase";

const DOC_ID = "counter";
const COLLECTION = "analytics";

const STORAGE_KEY = "tokenos_last_visit";

export async function registerVisit() {
  try {
    const lastVisit = localStorage.getItem(STORAGE_KEY);

    // 24 saat içinde tekrar sayma
    if (lastVisit) {
      const diff = Date.now() - Number(lastVisit);

      if (diff < 24 * 60 * 60 * 1000) {
        return;
      }
    }

    const ref = doc(db, COLLECTION, DOC_ID);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        visitors: 1,
      });
    } else {
      await updateDoc(ref, {
        visitors: increment(1),
      });
    }

    localStorage.setItem(
      STORAGE_KEY,
      Date.now().toString()
    );
  } catch (err) {
    console.error(err);
  }
}

export async function getVisitors() {
  const ref = doc(db, COLLECTION, DOC_ID);

  const snap = await getDoc(ref);

  if (!snap.exists()) return 0;

  return snap.data().visitors || 0;
}
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "gen-lang-client-0212071453",
  appId: "1:863005145587:web:6d025757618d155ca0ba86",
  apiKey: "AIzaSyB56U5M7Whw8ibd6TivJ1P8eqH0ONZlkWA",
  authDomain: "gen-lang-client-0212071453.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-remixencryptedvi-9495fd29-e489-42d9-9570-b8b73bedc065",
  storageBucket: "gen-lang-client-0212071453.firebasestorage.app",
  messagingSenderId: "863005145587",
};

// Initialize Firebase App safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Safe background connection check without throwing or blocking UI
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firestore offline check:', error.message);
      }
    }
  }, 1000);
}

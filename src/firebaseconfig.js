import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// بيانات مشروعك تجدها في Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCxht7RnX25v9eXhTTkgyv-T8URPmK404o",
  authDomain: "asemstore99.firebaseapp.com",
  projectId: "asemstore99",
  storageBucket: "asemstore99.firebasestorage.app",
  messagingSenderId: "1046059115642",
  appId: "1:1046059115642:web:2b2308c5c8a73cba0a87c3",
  measurementId: "G-9S1NK8KGT0",
};

// تهيئة فايربيس
const app = initializeApp(firebaseConfig);

// تصدير الأدوات لاستخدامها في الصفحات
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = getAuth(app);

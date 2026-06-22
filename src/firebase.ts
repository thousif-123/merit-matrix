import { initializeApp, getApps, getApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyAzzvVTyB_gFxDcJszPkKiMVLKyI75cAr0",
  authDomain: "meritmatrix-13ba3.firebaseapp.com",
  databaseURL: "https://meritmatrix-13ba3-default-rtdb.firebaseio.com",
  projectId: "meritmatrix-13ba3",
  storageBucket: "meritmatrix-13ba3.firebasestorage.app",
  messagingSenderId: "571410545970",
  appId: "1:571410545970:web:9dcf7fb2342386aac9ab2b",
};

console.log(firebaseConfig);
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const db = getFirestore(app);

export { app, auth, db };

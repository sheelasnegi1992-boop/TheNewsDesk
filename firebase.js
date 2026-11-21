
import { initializeApp } from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6-5dFKe-Q9Ooa1t0d_4p2Ku49Tl1Jw-I",
  authDomain: "thenewsdesk.firebaseapp.com",
  projectId: "thenewsdesk",
  storageBucket: "thenewsdesk.firebasestorage.app",
  messagingSenderId: "788175321942",
  appId: "1:788175321942:web:d626fa099d39435f92f4f7",
  measurementId: "G-EXKL6K1HDB"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

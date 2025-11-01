// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // * AGREGADO

import { getAuth } from "firebase/auth"; // ← NUEVO 





// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



// ------------------------------------

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "epn-proyectos-5e98c.firebaseapp.com",
  projectId: "epn-proyectos-5e98c",
  storageBucket: "epn-proyectos-5e98c.firebasestorage.app",
  messagingSenderId: "973621161293",
  appId: "1:973621161293:web:bb707568a4f08436629b04"
};

// ------------------------------------


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);  // * AGREGADO Y EXPORTADO


export const auth = getAuth(app); // ← NUEVO: Autenticación 

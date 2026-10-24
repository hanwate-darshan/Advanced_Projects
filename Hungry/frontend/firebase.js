// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "hungry-900df.firebaseapp.com",
  projectId: "hungry-900df",
  storageBucket: "hungry-900df.firebasestorage.app",
  messagingSenderId: "181526392626",
  appId: "1:181526392626:web:95258a996cd794ac2e312b"
 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}





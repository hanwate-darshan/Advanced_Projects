// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "hungry-food-delivery-app-f916b.firebaseapp.com",
  projectId: "hungry-food-delivery-app-f916b",
  storageBucket: "hungry-food-delivery-app-f916b.firebasestorage.app",
  messagingSenderId: "221443189772",
  appId: "1:221443189772:web:52dadfecbe4ac996161229"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}





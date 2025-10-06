import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBN2rKiMfUg4qW98r1FxsCe9CeqO6E0Vgk",
  authDomain: "high-impact-events-6d1a9.firebaseapp.com",
  projectId: "high-impact-events-6d1a9",
  storageBucket: "high-impact-events-6d1a9.firebasestorage.app",
  messagingSenderId: "878823250089",
  appId: "1:878823250089:web:f985c5dbc42286620bb1b8",
  measurementId: "G-CP6MJ8EFK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;


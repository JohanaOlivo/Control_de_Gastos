import { initializeApp } from "firebase/app";  // Para inicializar la app de Firebase
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";  // Para autenticación con Google
import { getFirestore } from "firebase/firestore";  // Para Firestore, si lo necesitas

// Tu configuración de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyC3niSSglatnHVDHxqZEd0-wXyGb5yjiSM",
  authDomain: "johana-olivo.firebaseapp.com",
  projectId: "johana-olivo",
  storageBucket: "johana-olivo.firebasestorage.app",
  messagingSenderId: "672754968747",
  appId: "1:672754968747:web:78a4b119fabf7a17492fee"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Servicios de autenticación y Firestore
export const auth = getAuth(app);  // Autenticación
export const firestore = getFirestore(app);  // Firestore

// Función para el login con Google
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;  // Aquí tienes el usuario que se ha autenticado
    console.log("Usuario autenticado:", user);
  } catch (error) {
    console.error("Error al autenticar con Google:", error);
  }
};

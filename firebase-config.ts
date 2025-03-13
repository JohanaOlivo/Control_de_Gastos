import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC3niSSglatnHVDHxqZEd0-wXyGb5yjiSM",
  authDomain: "johana-olivo.firebaseapp.com",
  projectId: "johana-olivo",
  storageBucket: "johana-olivo.firebasestorage.app",
  messagingSenderId: "672754968747",
  appId: "1:672754968747:web:78a4b119fabf7a17492fee"
};

const app = initializeApp(firebaseConfig);

// Servicios de autenticación y Firestore
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Función para registrar un usuario con correo electrónico y contraseña
export const registerWithEmailPassword = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuario registrado:', result.user);
    return result.user; // Devolver el usuario registrado para su uso posterior
  } catch (error: any) {
    // Manejar el error y devolver un mensaje adecuado
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Este correo ya está en uso. Por favor usa otro.');
    }
    throw new Error('Hubo un error al crear la cuenta. Intenta de nuevo.');
  }
};

// Función para iniciar sesión con correo electrónico y contraseña
export const loginWithEmailPassword = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario autenticado:', result.user);
    return result.user; // Devolver el usuario autenticado para su uso posterior
  } catch (error: any) {
    // Manejar el error y devolver un mensaje adecuado
    if (error.code === 'auth/user-not-found') {
      throw new Error('No se encuentra una cuenta con este correo.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('La contraseña es incorrecta. Intenta de nuevo.');
    }
    throw new Error('Hubo un error al autenticarte. Intenta de nuevo.');
  }
};

import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../firebase-config"; // Asegúrate de tener configurado Firebase Auth

export default function Main() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login"); // Redirige al login si no hay usuario autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener cuando el componente se desmonta
  }, []);

}

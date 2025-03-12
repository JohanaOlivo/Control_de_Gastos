// app/login.tsx
import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { auth, loginWithGoogle } from "../firebase-config"; // Asegúrate de que loginWithGoogle esté importado
import { signInWithPopup } from "firebase/auth"; // Esto es para la autenticación

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);

    try {
      // Usamos la función de loginWithGoogle
      await loginWithGoogle();
      setLoading(false);
      router.push("/groups"); // Redirige a la página de grupos si la autenticación es exitosa
    } catch (error) {
      setLoading(false);
      console.error("Error de autenticación:", error);
      alert("Error de autenticación. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Page</Text>
      <Button title="Login with Google" onPress={handleLogin} disabled={loading} />
      {loading && <Text>Cargando...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

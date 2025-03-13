import { useState } from "react";
import { TextInput, Button, View, Text, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { useRouter } from "expo-router"; // Importa useRouter

export default function Signup() {
  const router = useRouter(); // Usa useRouter en lugar de navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleSignup = async () => {
    if (!email || !password) {
      setError("El correo y la contraseña son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signInWithEmailAndPassword(auth, email, password);

      setLoading(false);
      setSuccessMessage("¡Cuenta creada con éxito!");

      setTimeout(() => {
        router.push("/dashboard"); // Cambia navigation.navigate por router.push
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      console.log("Error de Firebase: ", err);

      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está registrado.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo no es válido.");
      } else if (err.code === "auth/weak-password") {
        setError("Contraseña demasiado débil.");
      } else {
        setError("Hubo un error al crear la cuenta.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crea una cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Registrar" onPress={handleSignup} disabled={loading} />
      {loading && <Text>Registrando...</Text>}
      {successMessage && <Text style={styles.success}>{successMessage}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      
      {/* Cambia navigation.navigate por router.push */}
      <Text onPress={() => router.push("/login")} style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  success: {
    color: "green",
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    color: "blue",
  },
});

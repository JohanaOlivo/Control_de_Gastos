import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";
import { useRouter } from "expo-router"; // Importa useRouter
import { Ionicons } from "@expo/vector-icons"; // Para íconos

export default function Signup() {
  const router = useRouter(); // Usa useRouter
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
    <View className="flex-1 justify-center bg-gray-100">
      {/* Encabezado con ícono y saludo */}
      <View className="items-center mb-6">
        <Ionicons name="person-add-outline" size={40} color="#10B981" />
        <Text className="text-2xl font-bold text-gray-800 mt-2">Crea una cuenta</Text>
        <Text className="text-gray-600 mt-1">Por favor, completa los campos para registrarte</Text>
      </View>

      {/* Contenedor principal con campos y botón */}
      <View className="mx-auto w-4/5 bg-white rounded-lg shadow-lg p-6">
        <View className="flex-row items-center border-b border-gray-300 mb-4">
          <Ionicons name="mail-outline" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 p-2"
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View className="flex-row items-center border-b border-gray-300 mb-4">
          <Ionicons name="lock-closed-outline" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 p-2"
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        {error && <Text className="text-red-500 mb-4">{error}</Text>}
        {successMessage && <Text className="text-green-500 mb-4">{successMessage}</Text>}

        <TouchableOpacity
          className={`w-full p-4 rounded-lg ${loading ? "bg-gray-400" : "bg-[#10B981]"}`}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">Registrar</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator className="mt-4" size="large" color="#10B981" />}
      </View>

      {/* Enlace a inicio de sesión */}
      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-[#10B981] font-semibold">Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

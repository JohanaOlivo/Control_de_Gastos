import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmailPassword } from '../firebase-config';
import { Ionicons } from '@expo/vector-icons'; // Para íconos

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLoginWithEmail = async () => {
    setLoading(true);
    setError('');

    if (!email || !password) {
      setLoading(false);
      setError('El correo y la contraseña son obligatorios.');
      return;
    }

    try {
      await loginWithEmailPassword(email, password);
      setLoading(false);
      router.push('/dashboard');
    } catch (error) {
      setLoading(false);
      setError('Error al autenticar con correo y contraseña');
    }
  };

  const handleRegister = () => {
    router.push('../signup');
  };

  return (
    <View className="flex-1 justify-center bg-gray-100">
      {/* Contenedor superior con saludo e ícono */}
      <View className="items-center mb-6">
        <Ionicons name="happy-outline" size={40} color="#10B981" /> {/* Verde personalizado */}
        <Text className="text-2xl font-bold text-gray-800 mt-2">¡Hola, bienvenido!</Text>
        <Text className="text-gray-600 mt-1">Por favor, inicia sesión para continuar</Text>
      </View>

      {/* Contenedor principal con campos de texto y botón */}
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

        <TouchableOpacity
          className={`w-full p-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-[#10B981]'}`}
          onPress={handleLoginWithEmail}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">Iniciar sesión</Text>
        </TouchableOpacity>
        {loading && <ActivityIndicator className="mt-4" size="large" color="#10B981" />}
      </View>

      {/* Enlace para registro */}
      <View className="mt-6 flex-row justify-center">
        <Text className="text-gray-600">¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text className="text-[#10B981] font-semibold">Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { loginWithEmailPassword } from '../firebase-config'; // Importamos las funciones de Firebase

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLoginWithEmail = async () => {
    setLoading(true);
    setError(''); // Limpiamos el mensaje de error antes de intentar el login
    
    // Validación: asegurarse de que el correo y la contraseña no estén vacíos
    if (!email || !password) {
      setLoading(false);
      setError('El correo y la contraseña son obligatorios.');
      return;
    }

    try {
      await loginWithEmailPassword(email, password); // Login con correo y contraseña
      setLoading(false);
      router.push('/dashboard'); // Redirige a la página de grupos si el login es exitoso
    } catch (error) {
      setLoading(false);
      setError('Error al autenticar con correo y contraseña');
    }
  };

  const handleRegister = () => {
    // Redirige a la pantalla de registro
    router.push('../signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
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
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Iniciar sesión con Correo" onPress={handleLoginWithEmail} disabled={loading} />
      {loading && <Text>Cargando...</Text>}
      
      {/* Enlace para registrarse si no tiene cuenta */}
      <View style={styles.registerContainer}>
        <Text>No tienes cuenta? </Text>
        <Button title="Registrarse" onPress={handleRegister} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
  registerContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

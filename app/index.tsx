import { useState } from "react";
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const router = useRouter();
  
  const [isPressed, setIsPressed] = useState(false);  // Estado para la animación del botón
  const [loading, setLoading] = useState(false);  // Estado para "Cargando..."

  // Función para navegar al login cuando el usuario presiona el botón
  const handleStart = () => {
    setLoading(true); // Cambiar el estado a "Cargando..."
    setTimeout(() => {
      router.replace("/login");  // Redirigir después de 1 segundo
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Contenedor de la imagen */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/logo.jpg")}  // Logo más grande
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Texto debajo del contenedor con la imagen */}
      <Text style={styles.mainText}>Gestor de Gastos</Text>

      {/* Mensaje motivacional */}
      <Text style={styles.subText}>¡Comienza a controlar tus finanzas de manera fácil!</Text>

      {/* Botón Comenzar */}
      <TouchableOpacity 
        style={[styles.button, isPressed && styles.buttonPressed]} 
        onPressIn={() => setIsPressed(true)} 
        onPressOut={() => setIsPressed(false)} 
        onPress={handleStart}
        disabled={loading}  // Deshabilitar el botón mientras carga
      >
        <Text style={styles.buttonText}>
          {loading ? "Cargando..." : "Comenzar"} {/* Mostrar "Cargando..." cuando se presiona */}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Fondo ligeramente gris
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  mainText: {
    fontSize: 32, // Aumentado el tamaño de la fuente
    fontWeight: "700",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "sans-serif-condensed",
  },
  subText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "sans-serif",
  },
  button: {
    backgroundColor: "#10B981",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],  // Animación de escala para el botón cuando se presiona
  },
});

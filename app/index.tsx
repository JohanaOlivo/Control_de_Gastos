// app/index.tsx
import { Text, View, Button } from "react-native";
import { useRouter } from "expo-router";  // Importa useRouter

export default function Index() {
  const router = useRouter();  // Inicializa el hook de navegación

  const navigateToLogin = () => {
    router.push("/login");  // Navega a la página de login
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Bienvenido a la app de cuentas grupales</Text>
      <Button title="Ir al Login" onPress={navigateToLogin} />
    </View>
  );

  
}


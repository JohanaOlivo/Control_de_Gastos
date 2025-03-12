// app/main.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Main() {
  const router = useRouter();

  const navigateToGroups = () => {
    router.push("/groups");  // Redirige a la página de grupos de gastos
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
      <Button title="Ir a Grupos de Gastos" onPress={navigateToGroups} />
    </View>
  );
}

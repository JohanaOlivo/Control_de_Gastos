import { Stack } from "expo-router";
import "../global.css"


export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="signup" options={{ title: "Registro" }} />
      <Stack.Screen name="login" options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />



      <Stack.Screen name="Gastos_Grupales" options={{ title: "Gastos Grupales" }} />
      <Stack.Screen name="Gastos_Individuales" options={{ title: "Gastos Individuales" }} />



    </Stack>
  );
}


import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="signup" options={{ title: "Registro" }} />
      <Stack.Screen name="login" options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
    </Stack>
  );
}


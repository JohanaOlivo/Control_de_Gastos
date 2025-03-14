import { Stack } from "expo-router";
import "../global.css"


export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="signup" options={{ title: "Registro" }} />
      <Stack.Screen name="login" options={{ title: "Iniciar sesión" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />


      <Stack.Screen name="ViewExpenses" options={{ title: "Tus Gastos" }} />
      <Stack.Screen name="GastosGrupales" options={{ title: "Gastos Grupales" }} />
      <Stack.Screen name="GastosIndividuales" options={{ title: "Gastos Individuales" }} />



    </Stack>
  );
}


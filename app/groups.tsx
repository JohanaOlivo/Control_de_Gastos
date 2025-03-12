// app/groups.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function Groups() {
  const router = useRouter();

  const navigateToAddExpense = () => {
    router.push("/add-expense");  // Redirige a la página para añadir gastos
  };

  const navigateToSplitExpense = () => {
    router.push("/split-expense");  // Redirige a la página para dividir gastos
  };

  const navigateToTransactionHistory = () => {
    router.push("/transaction-history");  // Redirige a la página de historial
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Grupos de Gastos</Text>
      <Button title="Añadir Gasto" onPress={navigateToAddExpense} />
      <Button title="Dividir Gasto" onPress={navigateToSplitExpense} />
      <Button title="Historial de Transacciones" onPress={navigateToTransactionHistory} />
    </View>
  );
}

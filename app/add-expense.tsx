// app/add-expense.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { firestore } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";  // Para agregar documentos a Firestore

export default function AddExpense() {
  const router = useRouter();
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [group, setGroup] = useState("");

  const handleAddExpense = async () => {
    if (!expense || !amount || !group) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const expenseData = {
        expense,
        amount: parseFloat(amount),
        group,
        timestamp: new Date(),
      };

      // Agregar gasto a Firestore
      await addDoc(collection(firestore, "expenses"), expenseData);
      alert("Gasto agregado exitosamente!");
      router.push("/groups");  // Regresar a la página de grupos
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      alert("Error al agregar el gasto.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Añadir Gasto</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción del Gasto"
        value={expense}
        onChangeText={setExpense}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Grupo"
        value={group}
        onChangeText={setGroup}
      />
      <Button title="Agregar Gasto" onPress={handleAddExpense} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});

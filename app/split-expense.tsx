// app/split-expense.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function SplitExpense() {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState("");
  const [members, setMembers] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleSplit = () => {
    const amount = parseFloat(totalAmount);
    const numMembers = parseInt(members);

    if (!amount || !numMembers || numMembers <= 0) {
      alert("Por favor, ingresa un monto válido y número de miembros.");
      return;
    }

    const splitAmount = amount / numMembers;
    setResult(`Cada miembro debe pagar: $${splitAmount.toFixed(2)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dividir Gasto</Text>
      <TextInput
        style={styles.input}
        placeholder="Monto total"
        keyboardType="numeric"
        value={totalAmount}
        onChangeText={setTotalAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Número de miembros"
        keyboardType="numeric"
        value={members}
        onChangeText={setMembers}
      />
      <Button title="Calcular" onPress={handleSplit} />
      {result && <Text style={styles.result}>{result}</Text>}
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
  result: {
    marginTop: 20,
    fontSize: 18,
    color: "green",
  },
});

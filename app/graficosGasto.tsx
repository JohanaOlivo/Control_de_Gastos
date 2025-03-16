import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, ScrollView } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { FontAwesome } from '@expo/vector-icons'; // Iconos de FontAwesome de Expo

// Configuración de Firestore
const db = getFirestore();
const screenWidth = Dimensions.get('window').width;

const GraficosGasto = () => {
  const [totalGastosGrupales, setTotalGastosGrupales] = useState<number>(0);
  const [totalGastosIndividuales, setTotalGastosIndividuales] = useState<number>(0);

  useEffect(() => {
    const obtenerGastosGrupales = async () => {
      const gastosCollection = collection(db, 'gastos_grupales');
      const snapshot = await getDocs(gastosCollection);
      let total = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const totalGeneral = parseFloat(data.totalGeneral);
        total += totalGeneral;
      });

      setTotalGastosGrupales(total);
    };

    const obtenerGastosIndividuales = async () => {
      const gastosCollection = collection(db, 'gastos_individuales');
      const snapshot = await getDocs(gastosCollection);
      let total = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const totalGeneral = parseFloat(data.totalGeneral);
        total += totalGeneral;
      });

      setTotalGastosIndividuales(total);
    };

    obtenerGastosGrupales();
    obtenerGastosIndividuales();
  }, []);

  const totalGeneral = totalGastosGrupales + totalGastosIndividuales;

  // Datos para el gráfico de pastel
  const dataPieChart = [
    {
      name: 'Gastos Grupales',
      population: totalGastosGrupales,
      color: '#4E73DF',
    },
    {
      name: 'Gastos Individuales',
      population: totalGastosIndividuales,
      color: '#FF6F61',
    },
  ];

  // Datos para el gráfico de barras
  const dataBarChart = {
    labels: ['Gastos Grupales', 'Gastos Individuales'],
    datasets: [
      {
        data: [totalGastosGrupales, totalGastosIndividuales],
        colors: [
          (opacity = 1) => `rgba(78, 115, 223, ${opacity})`,
          (opacity = 1) => `rgba(255, 111, 97, ${opacity})`,
        ],
      },
    ],
  };

  const chartWidth = screenWidth - 40;

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      {/* Contenedor superior con el gráfico de pastel */}
      <View className="bg-white rounded-3xl shadow-xl p-6 mb-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-4 flex-row items-center">
          <FontAwesome name="pie-chart" size={24} color="#4E73DF" style={{ marginRight: 10 }} />
          Distribución de Gastos
        </Text>
        <PieChart
          data={dataPieChart}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#e3e6f0',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 4,
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={false}
        />
        {/* Leyenda */}
        <View className="mt-4">
          {dataPieChart.map((item, index) => (
            <View className="flex-row items-center mb-3" key={index}>
              <View className="w-6 h-6 rounded-full mr-4" style={{ backgroundColor: item.color }} />
              <Text className="text-gray-700 font-medium">
                {item.name}: ${item.population.toFixed(2)} (
                {((item.population / totalGeneral) * 100).toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Gráfico de Barras Mejorado */}
      <View className="bg-white rounded-3xl shadow-xl p-6 mb-6" style={{ overflow: 'hidden' }}>
        <Text className="text-2xl font-semibold text-gray-800 mb-4 flex-row items-center">
          <FontAwesome name="bar-chart" size={24} color="#FF6F61" style={{ marginRight: 10 }} />
          Gastos por Categoría
        </Text>
        <BarChart
          data={dataBarChart}
          width={chartWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          fromZero
          withCustomBarColorFromData
          flatColor
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#e3e6f0',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 4,
            },
            propsForLabels: {
              fontSize: 14,
              fontWeight: 'bold',
            },
            propsForVerticalLabels: {
              fontSize: 14,
              fontWeight: 'bold',
            },
            propsForHorizontalLabels: {
              fontSize: 14,
              fontWeight: 'bold',
            },
            barPercentage: 0.5,
          }}
          style={{
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 4,
          }}
        />
      </View>

      {/* Resumen Total Mejorado */}
      <View className="bg-white rounded-3xl shadow-xl p-6">
        <Text className="text-2xl font-semibold text-gray-800 mb-4 flex-row items-center">
          <FontAwesome name="usd" size={24} color="#4CAF50" style={{ marginRight: 10 }} />
          Resumen Total
        </Text>
        <Text className="text-3xl font-bold text-green-600 mb-2">${totalGeneral.toFixed(2)}</Text>
        <Text className="text-gray-600 text-center">Total de Gastos (Grupales + Individuales)</Text>
      </View>
    </ScrollView>
  );
};

export default GraficosGasto;

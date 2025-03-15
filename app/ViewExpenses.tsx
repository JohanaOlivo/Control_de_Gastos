import { useState, useEffect, useCallback } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { firestore } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

// Definimos las interfaces para los tipos de gastos
interface GastoGrupal {
    id: string;
    nombre: string;
    descripcion: string;
    usuarios: string[];
}

interface GastoIndividual {
    id: string;
    nombre: string;
    descripcion: string;
}

export default function VerGastos() {
    const [gastosGrupales, setGastosGrupales] = useState<GastoGrupal[]>([]);
    const [gastosIndividuales, setGastosIndividuales] = useState<GastoIndividual[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    // Función para obtener los gastos grupales e individuales desde Firestore
    const obtenerGastos = async () => {
        try {
            setLoading(true);

            // Obtener gastos grupales
            const snapshotGrupales = await getDocs(collection(firestore, 'gastos_grupales'));
            const datosGrupales = snapshotGrupales.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre || 'Sin nombre',
                descripcion: doc.data().descripcion || 'Sin descripción',
                usuarios: doc.data().usuarios || []
            }));
            setGastosGrupales(datosGrupales);

            // Obtener gastos individuales
            const snapshotIndividuales = await getDocs(collection(firestore, 'gastos_individuales'));
            const datosIndividuales = snapshotIndividuales.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre || 'Sin nombre',
                descripcion: doc.data().descripcion || 'Sin descripción',
            }));
            setGastosIndividuales(datosIndividuales);

        } catch (error) {
            console.error('Error al obtener los gastos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerGastos();
    }, []);

    // Función para manejar el refresco de los gastos
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await obtenerGastos();
        setRefreshing(false);
    }, []);

    const circleColors = ['#34D399', '#60A5FA', '#FBBF24', '#F87171', '#8B5CF6']; // Colores para los círculos

    return (
        <View className="flex-1 p-4 bg-gray-50">

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            ) : (
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Gastos Grupales */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-gray-800 mb-3">Gastos Grupales</Text>
                        <View className="bg-white p-4 rounded-lg border border-gray-300">
                            <ScrollView style={{ maxHeight: 300 }}>
                                {gastosGrupales.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        className="p-4 mb-4 flex-row items-center border-b border-gray-200"
                                        onPress={() => router.push(`/detalle/${item.id}`)}
                                    >
                                        {/* Icono con círculo de color diferente */}
                                        <View className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: circleColors[index % circleColors.length] }}>
                                            <FontAwesome name="users" size={24} color="white" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-800">{item.nombre}</Text>
                                            <Text className="text-sm text-gray-600">{item.descripcion}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Gastos Individuales */}
                    <View>
                        <Text className="text-2xl font-bold text-gray-800 mb-3">Gastos Individuales</Text>
                        <View className="bg-white p-4 rounded-lg border border-gray-300">
                            <ScrollView style={{ maxHeight: 300 }}>
                                {gastosIndividuales.map((item, index) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        className="p-4 mb-4 flex-row items-center border-b border-gray-200"
                                        onPress={() => router.push(`/detalle/${item.id}`)}
                                    >
                                        {/* Icono con círculo de color diferente */}
                                        <View className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: circleColors[(index + gastosGrupales.length) % circleColors.length] }}>
                                            <FontAwesome name="user" size={24} color="white" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-gray-800">{item.nombre}</Text>
                                            <Text className="text-sm text-gray-600">{item.descripcion}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

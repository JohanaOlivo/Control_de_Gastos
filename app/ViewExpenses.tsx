import { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, SectionList } from 'react-native';
import { firestore } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Importamos FontAwesome

// Definimos las interfaces para los tipos de gastos
interface GastoGrupal {
    id: string;
    nombre: string;
    descripcion: string;
    usuarios: string[]; // Array de usuarios
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
                usuarios: doc.data().usuarios || [] // Usamos 'usuarios' en lugar de 'miembros'
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

    return (
        <View className="flex-1 p-4 bg-gray-100">
            <Text className="text-2xl font-bold mb-4 text-center text-gray-900">Gastos</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#10B981" />
            ) : (
                <SectionList
                    sections={[
                        { title: 'Gastos Grupales', data: gastosGrupales },
                        { title: 'Gastos Individuales', data: gastosIndividuales },
                    ]}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item, section }) => (
                        <TouchableOpacity
                            className="p-4 my-2 bg-white rounded-lg shadow-md flex-row items-center"
                            onPress={() => router.push(`/detalle/${item.id}`)} // Cambié la navegación a la página de detalle de gastos
                        >
                            {/* Icono representando un grupo de gastos o un gasto individual */}
                            <FontAwesome name={section.title === 'Gastos Grupales' ? "users" : "user"} size={40} color="#4B5563" className="mr-4" />

                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900">{item.nombre}</Text>
                                <Text className="text-md text-gray-600 italic">{item.descripcion}</Text>

                                {/* Lista de usuarios como bolitas (solo para gastos grupales) */}
                                {section.title === 'Gastos Grupales' && (
                                    <View className="flex-row flex-wrap mt-2">
                                        {(item as GastoGrupal).usuarios.slice(0, 4).map((usuario, index) => (
                                            <View key={index} className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2 mb-2">
                                                <Text className="text-white font-bold text-xs">{usuario.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        ))}
                                        {(item as GastoGrupal).usuarios.length > 4 && (
                                            <View className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mb-2">
                                                <Text className="text-white font-bold text-xs">+{(item as GastoGrupal).usuarios.length - 4}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    renderSectionHeader={({ section }) => (
                        <Text className="text-xl font-bold mt-4 mb-2 text-gray-900">{section.title}</Text>
                    )}
                />
            )}
        </View>
    );
}

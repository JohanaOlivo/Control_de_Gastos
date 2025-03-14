import { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { firestore } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Importamos FontAwesome

export default function VerColecciones() {
    const [colecciones, setColecciones] = useState<{ id: string; nombre: string; descripcion: string; miembros: string[] }[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const obtenerColecciones = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(firestore, 'colecciones'));
            const datos = snapshot.docs.map(doc => ({
                id: doc.id,
                nombre: doc.data().nombre || 'Sin nombre',
                descripcion: doc.data().descripcion || 'Sin descripción',
                miembros: doc.data().miembros || [] // Lista de miembros de la colección
            }));
            setColecciones(datos);
        } catch (error) {
            console.error('Error al obtener colecciones:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerColecciones();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await obtenerColecciones();
        setRefreshing(false);
    }, []);

    return (
        <View className="flex-1 p-4 bg-gray-100">
            <Text className="text-2xl font-bold mb-4 text-center text-gray-900">Colecciones</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#10B981" />
            ) : colecciones.length > 0 ? (
                <FlatList
                    data={colecciones}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="p-4 my-2 bg-white rounded-lg shadow-md flex-row items-center"
                            onPress={() => router.push(`/detalle/${item.id}`)}
                        >
                            {/* Cambié el icono por uno de FontAwesome, representando una libreta */}
                            <FontAwesome name="book" size={40} color="#4B5563" className="mr-4" />

                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900">{item.nombre}</Text>
                                <Text className="text-md text-gray-600 italic">{item.descripcion}</Text>

                                {/* Lista de miembros como bolitas */}
                                <View className="flex-row mt-2">
                                    {item.miembros.slice(0, 4).map((miembro, index) => (
                                        <View key={index} className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                                            <Text className="text-white font-bold text-sm">{miembro.charAt(0).toUpperCase()}</Text>
                                        </View>
                                    ))}
                                    {item.miembros.length > 4 && (
                                        <View className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                                            <Text className="text-white font-bold text-sm">+{item.miembros.length - 4}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text className="text-lg text-center mt-4 text-gray-500">No hay colecciones disponibles</Text>
            )}
        </View>
    );
}

import { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { firestore } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons'; // Icono de Expo

export default function Resumen() {
    const { id } = useLocalSearchParams();
    const [coleccion, setColeccion] = useState<any>(null);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const obtenerColeccion = async () => {
            if (!id) return;

            const docRef = doc(firestore, 'colecciones', id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setColeccion(docSnap.data());
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            } else {
                console.log("No se encontró la colección.");
            }
        };

        obtenerColeccion();
    }, [id]);

    if (!coleccion) return <Text className="text-lg text-gray-500 text-center mt-10">Cargando resumen...</Text>;

    // Calculamos el total de cada usuario
    const totalesPorUsuario = coleccion.productos.reduce((acc: any, producto: any) => {
        const { usuario, totalProducto } = producto;
        acc[usuario] = (acc[usuario] || 0) + parseFloat(totalProducto);
        return acc;
    }, {});

    return (
        <ScrollView className="flex-1 p-4 bg-gray-100">
            <Animated.View style={{ opacity: fadeAnim }}>
                <View className="mb-8 px-6">
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-3">{coleccion.nombre}</Text>
                    <Text className="text-lg text-gray-600 italic text-center mb-6">{coleccion.descripcion}</Text>
                </View>

                {/* Lista de usuarios con sus productos */}
                {coleccion.usuarios.map((usuario: string, index: number) => {
                    const productosUsuario = coleccion.productos.filter((producto: any) => producto.usuario === usuario);

                    return (
                        <View key={index} className="mb-6 p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
                            {/* Nombre del usuario */}
                            <Text className="text-2xl font-semibold text-blue-700 mb-4">{usuario}</Text>

                            {/* Lista de productos de cada usuario */}
                            {productosUsuario.map((producto: any, idx: number) => (
                                <TouchableOpacity key={idx}>
                                    <View className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                                        <MaterialIcons name="shopping-bag" size={30} color="#4B5563" style={{ marginRight: 10 }} />

                                        <View className="flex-1">
                                            <Text className="text-md text-gray-800 font-medium">{producto.nombre}</Text>
                                            <Text className="text-sm text-gray-600">Cantidad: {producto.cantidad}</Text>
                                        </View>

                                        <Text className="text-lg text-gray-800 font-semibold">${producto.precio}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {/* Total del usuario */}
                            <View className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <Text className="text-lg font-semibold text-blue-800 text-right">
                                    Total: ${totalesPorUsuario[usuario]?.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    );
                })}

                {/* Total General */}
                <View className="px-6 py-4 mt-8 bg-white shadow-md rounded-lg border-t-4 border-teal-500">
                    <Text className="text-2xl font-bold text-teal-600 text-center">Total General: ${coleccion.totalGeneral}</Text>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

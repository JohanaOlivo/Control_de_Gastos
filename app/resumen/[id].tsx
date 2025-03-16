import { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Animated, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { firestore } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons'; // Icono de Expo

export default function Resumen() {
    const { id } = useLocalSearchParams();
    const [gastoGrupal, setGastoGrupal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const obtenerGastoGrupal = async () => {
            if (!id) {
                console.log("ID no disponible");
                return;
            }

            console.log("ID recibido:", id);

            try {
                const docRef = doc(firestore, 'gastos_grupales', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const datos = docSnap.data();
                    console.log("Datos del documento:", datos);

                    // Calculamos el total general sumando los productos
                    const totalGeneral = datos.productos.reduce((total: number, producto: any) => {
                        return total + parseFloat(producto.totalProducto);
                    }, 0);

                    setGastoGrupal({ ...datos, totalGeneral });

                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }).start();
                } else {
                    console.log("No se encontró el gasto grupal.");
                    Alert.alert("Error", "No se encontró el gasto grupal.");
                }
            } catch (error) {
                console.error("Error obteniendo el gasto grupal:", error);
                Alert.alert("Error", "Hubo un problema al obtener el gasto grupal.");
            } finally {
                setLoading(false);
            }
        };

        obtenerGastoGrupal();
    }, [id]);

    if (loading) return <Text className="text-lg text-gray-500 text-center mt-10">Cargando resumen...</Text>;
    if (!gastoGrupal) return <Text className="text-lg text-red-500 text-center mt-10">No se encontró el gasto grupal.</Text>;

    // Calculamos el total de cada usuario
    const totalesPorUsuario = gastoGrupal.productos.reduce((acc: any, producto: any) => {
        const { usuario, totalProducto } = producto;
        acc[usuario] = (acc[usuario] || 0) + parseFloat(totalProducto);
        return acc;
    }, {});

    return (
        <ScrollView className="flex-1 p-4 bg-gray-100">
            <Animated.View style={{ opacity: fadeAnim }}>
                <View className="mb-8 px-6">
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-3">{gastoGrupal.nombre}</Text>
                    <Text className="text-lg text-gray-600 italic text-center mb-6">{gastoGrupal.descripcion}</Text>
                </View>

                {/* Lista de usuarios con sus productos */}
                {gastoGrupal.usuarios.map((usuario: string, index: number) => {
                    const productosUsuario = gastoGrupal.productos.filter((producto: any) => producto.usuario === usuario);

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
                    <Text className="text-2xl font-bold text-teal-600 text-center">Total General: ${gastoGrupal.totalGeneral.toFixed(2)}</Text>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

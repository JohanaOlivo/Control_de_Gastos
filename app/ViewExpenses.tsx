import { useState, useEffect, useCallback } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { firestore } from '../firebase-config';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; // Importar el BlurView

interface GastoGrupal {
    id: string;
    nombre: string;
    descripcion: string;
    usuarios: string[];
    totalGeneral?: number;
    productos: any[];
}

interface GastoIndividual {
    id: string;
    nombre: string;
    descripcion: string;
    total?: number;
}

export default function VerGastos() {
    const [gastosGrupales, setGastosGrupales] = useState<GastoGrupal[]>([]);
    const [gastosIndividuales, setGastosIndividuales] = useState<GastoIndividual[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState<{ id: string, type: 'grupal' | 'individual' } | null>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const router = useRouter();

    const obtenerTotalGrupal = async (id: string) => {
        try {
            const docRef = doc(firestore, 'gastos_grupales', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const datos = docSnap.data();
                const totalGeneral = datos.productos.reduce((total: number, producto: any) => {
                    return total + parseFloat(producto.totalProducto);
                }, 0);
                return totalGeneral;
            }
        } catch (error) {
            console.error('Error al obtener el total del gasto grupal:', error);
        }
        return 0;
    };

    const obtenerTotalIndividual = async (id: string) => {
        try {
            const docRef = doc(firestore, 'gastos_individuales', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const datos = docSnap.data();
                const total = parseFloat(datos.totalGeneral || "0");
                return total;
            }
        } catch (error) {
            console.error('Error al obtener el total del gasto individual:', error);
        }
        return 0;
    };

    const obtenerGastos = async () => {
        try {
            setLoading(true);

            const snapshotGrupales = await getDocs(collection(firestore, 'gastos_grupales'));
            const datosGrupales = await Promise.all(snapshotGrupales.docs.map(async (doc) => {
                const gastoGrupal: GastoGrupal = {
                    id: doc.id,
                    nombre: doc.data().nombre || 'Sin nombre',
                    descripcion: doc.data().descripcion || 'Sin descripción',
                    usuarios: doc.data().usuarios || [],
                    productos: doc.data().productos || [],
                };
                const totalGeneral = await obtenerTotalGrupal(doc.id);
                return { ...gastoGrupal, totalGeneral };
            }));
            setGastosGrupales(datosGrupales);

            const snapshotIndividuales = await getDocs(collection(firestore, 'gastos_individuales'));
            const datosIndividuales = await Promise.all(snapshotIndividuales.docs.map(async (doc) => {
                const gastoIndividual: GastoIndividual = {
                    id: doc.id,
                    nombre: doc.data().nombre || 'Sin nombre',
                    descripcion: doc.data().descripcion || 'Sin descripción',
                };
                const total = await obtenerTotalIndividual(doc.id);
                return { ...gastoIndividual, total };
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await obtenerGastos();
        setRefreshing(false);
    }, []);

    const handleDelete = async () => {
        if (selectedGasto) {
            try {
                if (selectedGasto.type === 'grupal') {
                    await deleteDoc(doc(firestore, 'gastos_grupales', selectedGasto.id));
                    setGastosGrupales(gastosGrupales.filter(gasto => gasto.id !== selectedGasto.id));
                } else {
                    await deleteDoc(doc(firestore, 'gastos_individuales', selectedGasto.id));
                    setGastosIndividuales(gastosIndividuales.filter(gasto => gasto.id !== selectedGasto.id));
                }
                setMenuVisible(false);
            } catch (error) {
                console.error('Error al eliminar el gasto:', error);
            }
        }
    };

    const handleEdit = () => {
        if (selectedGasto) {
            router.push(`/detalle/${selectedGasto.id}`);
            setMenuVisible(false);
        }
    };

    const handleMenuPress = (event: any, gastoId: string, type: 'grupal' | 'individual') => {
        const { pageX, pageY } = event.nativeEvent;
        const { width, height } = Dimensions.get('window');
        const menuWidth = 120; // Ancho del menú
        const menuHeight = 80; // Altura del menú

        // Ajustar la posición del menú para que esté más a la izquierda y más abajo
        const left = pageX - menuWidth - 20; // Desplazar más hacia la izquierda
        const top = pageY - menuHeight + 20; // Desplazar más hacia abajo

        // Asegurar que el menú no se salga de la pantalla
        const adjustedLeft = left < 0 ? 10 : left; // Si se sale por la izquierda, ajustar
        const adjustedTop = top < 0 ? 10 : top; // Si se sale por arriba, ajustar

        setMenuPosition({ top: adjustedTop, left: adjustedLeft });
        setSelectedGasto({ id: gastoId, type });
        setMenuVisible(true);
    };

    const circleColors = ['#34D399', '#60A5FA', '#FBBF24', '#F87171', '#8B5CF6'];

    return (
        <View className="flex-1 p-4 bg-gray-100">
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            ) : (
                <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                    {/* Gastos Grupales */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-gray-800 mb-4 flex-row items-center">
                            <FontAwesome name="users" size={24} color="#10B981" style={{ marginRight: 10 }} />
                            Gastos Grupales
                        </Text>
                        <View className="bg-white p-5 rounded-lg border border-gray-300 shadow-md">
                            <ScrollView style={{ maxHeight: 400 }}>
                                {gastosGrupales.map((item, index) => (
                                    <View key={item.id} className="mb-4">
                                        <TouchableOpacity
                                            className="absolute top-3 right-5 z-10"
                                            onPress={(event) => handleMenuPress(event, item.id, 'grupal')}
                                        >
                                            <FontAwesome name="ellipsis-v" size={24} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => router.push(`/detalle/${item.id}`)}>
                                            <View className="bg-gradient-to-r p-5 rounded-lg mb-4" style={{ backgroundColor: circleColors[index % circleColors.length] }}>
                                                <Text className="text-xl font-semibold text-white">{item.nombre}</Text>
                                                <Text className="text-sm text-white opacity-75">{item.descripcion}</Text>
                                                {item.totalGeneral && (
                                                    <View className="bg-white p-4 rounded-lg mt-4 flex-row items-center">
                                                        <FontAwesome name="money" size={28} color="#10B981" style={{ marginRight: 10 }} />
                                                        <View>
                                                            <Text className="text-lg font-semibold">Total:</Text>
                                                            <Text className="text-2xl font-bold text-red-500">${item.totalGeneral.toFixed(2)}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Gastos Individuales */}
                    <View>
                        <Text className="text-2xl font-bold text-gray-800 mb-4 flex-row items-center">
                            <FontAwesome name="user" size={24} color="#10B981" style={{ marginRight: 10 }} />
                            Gastos Individuales
                        </Text>
                        <View className="bg-white p-5 rounded-lg border border-gray-300 shadow-md">
                            <ScrollView style={{ maxHeight: 400 }}>
                                {gastosIndividuales.map((item, index) => (
                                    <View key={item.id} className="mb-4">
                                        <TouchableOpacity
                                            className="absolute top-3 right-5 z-10"
                                            onPress={(event) => handleMenuPress(event, item.id, 'individual')}
                                        >
                                            <FontAwesome name="ellipsis-v" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => router.push(`/detalle/${item.id}`)}>
                                            <View className="bg-gradient-to-r p-5 rounded-lg mb-4" style={{ backgroundColor: circleColors[(index + gastosGrupales.length) % circleColors.length] }}>
                                                <Text className="text-xl font-semibold text-white">{item.nombre}</Text>
                                                <Text className="text-sm text-white opacity-75">{item.descripcion}</Text>
                                                {item.total && (
                                                    <View className="bg-white p-4 rounded-lg mt-4 flex-row items-center">
                                                        <FontAwesome name="money" size={28} color="#10B981" style={{ marginRight: 10 }} />
                                                        <View>
                                                            <Text className="text-lg font-semibold">Total:</Text>
                                                            <Text className="text-2xl font-bold text-red-500">${item.total.toFixed(2)}</Text>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Menú contextual con desenfoque */}
                    {menuVisible && (
                        <BlurView intensity={10} style={styles.blurOverlay}>
                            <TouchableOpacity
                                style={styles.menuOverlay}
                                onPress={() => setMenuVisible(false)}
                            >
                                <View style={[styles.menu, { top: menuPosition.top, left: menuPosition.left }]}>
                                    <TouchableOpacity style={styles.menuOption} onPress={handleEdit}>
                                        <FontAwesome name="edit" size={20} color="#000" />
                                        <Text style={styles.menuOptionText}>Editar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.menuOption} onPress={handleDelete}>
                                        <FontAwesome name="trash" size={20} color="#F87171" />
                                        <Text style={styles.menuOptionText}>Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </BlurView>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro y translúcido
        zIndex: 1,
    },
    menuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    menu: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        width: 120,
    },
    menuOption: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuOptionText: {
        fontSize: 16,
        marginLeft: 10,
    },
});

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { firestore } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';

export default function Resumen() {
    const { id } = useLocalSearchParams(); // Obtener el ID de la URL
    const [coleccion, setColeccion] = useState<any>(null);

    useEffect(() => {
        const obtenerColeccion = async () => {
            if (!id) return;
            
            const docRef = doc(firestore, 'colecciones', id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setColeccion(docSnap.data());
            } else {
                console.log("No se encontró la colección.");
            }
        };

        obtenerColeccion();
    }, [id]);

    if (!coleccion) return <Text style={styles.cargando}>Cargando resumen...</Text>;

    // Calculamos el total de cada usuario
    const totalesPorUsuario = coleccion.productos.reduce((acc: any, producto: any) => {
        const { usuario, totalProducto } = producto;
        if (acc[usuario]) {
            acc[usuario] += parseFloat(totalProducto);
        } else {
            acc[usuario] = parseFloat(totalProducto);
        }
        return acc;
    }, {});

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{coleccion.nombre}</Text>
            <Text style={styles.subtitle}>{coleccion.descripcion}</Text>

            {coleccion.usuarios.map((usuario: string, index: number) => {
                // Filtramos los productos por usuario
                const productosUsuario = coleccion.productos.filter((producto: any) => producto.usuario === usuario);

                return (
                    <View key={index} style={styles.usuarioContainer}>
                        <Text style={styles.userTitle}>{usuario}</Text>
                        <Text style={styles.totalUser}>Total: ${totalesPorUsuario[usuario]?.toFixed(2) || 0}</Text>

                        {/* Mostrar productos de cada usuario */}
                        <View style={styles.productosContainer}>
                            {productosUsuario.map((producto: any, idx: number) => (
                                <View key={idx} style={[styles.productoContainer, { backgroundColor: getRandomColor() }]}>
                                    <Text style={styles.productoText}>Producto: {producto.nombre}</Text>
                                    <Text style={styles.productoText}>Cantidad: {producto.cantidad}</Text>
                                    <Text style={styles.productoText}>Precio: ${producto.precio}</Text>
                                    <Text style={styles.productoText}>Total: ${producto.totalProducto}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}

            <Text style={styles.totalGeneral}>Total General: ${coleccion.totalGeneral}</Text>
        </ScrollView>
    );
}

// Función para generar un color aleatorio para los productos
const getRandomColor = () => {
    const colors = ['#FFDDC1', '#D4E157', '#64B5F6', '#FFD54F', '#81C784', '#FF7043'];
    return colors[Math.floor(Math.random() * colors.length)];
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        flex: 1,
    },
    cargando: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E2A38',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    usuarioContainer: {
        marginBottom: 30,
    },
    userTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    totalUser: {
        fontSize: 18,
        color: '#4CAF50',
        marginVertical: 10,
        fontWeight: '600',
    },
    productosContainer: {
        marginTop: 10,
    },
    productoContainer: {
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    productoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    totalGeneral: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginTop: 20,
        textAlign: 'center',
    },
});

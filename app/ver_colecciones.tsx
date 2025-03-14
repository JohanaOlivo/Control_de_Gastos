import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { firestore } from '../firebase-config';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function VerColecciones() {
    const [colecciones, setColecciones] = useState<{ id: string; nombre: string; descripcion: string }[]>([]);
    const router = useRouter(); // Para navegar a otra pantalla

    useEffect(() => {
        const obtenerColecciones = async () => {
            try {
                const snapshot = await getDocs(collection(firestore, 'colecciones'));
                const datos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    nombre: doc.data().nombre || 'Sin nombre',
                    descripcion: doc.data().descripcion || 'Sin descripción'
                }));
                setColecciones(datos);
            } catch (error) {
                console.error('Error al obtener colecciones:', error);
            }
        };

        obtenerColecciones();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Colecciones en Firestore</Text>
            {colecciones.length > 0 ? (
                <FlatList
                    data={colecciones}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push({ pathname: "/detalle/[id]", params: { id: item.id } })}
                        >
                            <Text style={styles.name}>{item.nombre}</Text>
                            <Text style={styles.description}>{item.descripcion}</Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.noData}>No hay colecciones disponibles</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    card: { padding: 15, marginVertical: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
    name: { fontSize: 18, fontWeight: 'bold' },
    description: { fontSize: 16, color: '#666' },
    noData: { fontSize: 18, textAlign: 'center', marginTop: 20, color: '#888' },
});

import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { firestore } from '../../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import UsuarioItem from '../../components/usuario_item';

export default function DetalleGastosGrupales() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [usuarios, setUsuarios] = useState<{ id: number; nombre: string }[]>([]);
    const [nuevoUsuario, setNuevoUsuario] = useState('');
    const [mostrandoNuevoUsuario, setMostrandoNuevoUsuario] = useState(false);

    // Función para obtener los detalles del grupo de gastos
    useEffect(() => {
        const obtenerDetalle = async () => {
            try {
                const docRef = doc(firestore, 'gastos_grupales', id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setNombre(data.nombre || '');
                    setDescripcion(data.descripcion || '');
                    setUsuarios(
                        data.usuarios?.map((user: string) => ({ id: Date.now(), nombre: user })) || []
                    );
                }
            } catch (error) {
                console.error('Error al obtener detalles:', error);
            }
        };

        obtenerDetalle();
    }, [id]);

    // Función para actualizar los detalles del grupo de gastos
    const actualizarGastosGrupales = async () => {
        try {
            const docRef = doc(firestore, 'gastos_grupales', id as string);
            await updateDoc(docRef, {
                nombre,
                descripcion,
                usuarios: usuarios.map((user) => user.nombre),
            });
            alert('Grupo de gastos actualizado correctamente');
            router.back();
        } catch (error) {
            console.error('Error al actualizar grupo de gastos:', error);
        }
    };

    // Función para agregar un nuevo usuario al grupo de gastos
    const agregarUsuario = () => {
        if (nuevoUsuario.trim()) {
            setUsuarios((prevUsuarios) => [
                ...prevUsuarios,
                { id: Date.now(), nombre: nuevoUsuario },
            ]);
            setNuevoUsuario('');
            setMostrandoNuevoUsuario(false); // Ocultar el campo una vez se añade el usuario
        }
    };

    // Función para eliminar un usuario del grupo de gastos
    const eliminarUsuario = (usuarioId: number) => {
        setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.id !== usuarioId));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Grupo de Gastos</Text>

            <Text style={styles.subtitle}>Nombre del grupo de gastos</Text>
            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del grupo de gastos"
            />
            <Text style={styles.subtitle}>Descripción del grupo de gastos</Text>
            <TextInput
                style={styles.input}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción del grupo de gastos"
            />

            <Text style={styles.subtitle}>Usuarios en este grupo:</Text>
            <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <UsuarioItem usuario={item} onEliminar={eliminarUsuario} />
                )}
            />

            {/* Campo para añadir el nuevo usuario */}
            {mostrandoNuevoUsuario && (
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        value={nuevoUsuario}
                        onChangeText={setNuevoUsuario}
                        placeholder="Nuevo usuario"
                    />
                </View>
            )}

            {/* Botón para mostrar el campo de nuevo usuario */}
            <TouchableOpacity
                style={[styles.addUserButton, mostrandoNuevoUsuario && styles.cancelButton]}
                onPress={() => setMostrandoNuevoUsuario(!mostrandoNuevoUsuario)}
            >
                <Text style={styles.addUserText}>
                    {mostrandoNuevoUsuario ? 'Cancelar' : 'Añadir Usuario'}
                </Text>
            </TouchableOpacity>

            {/* Si estamos mostrando el campo de nuevo usuario, mostramos el botón para añadirlo */}
            {mostrandoNuevoUsuario && (
                <TouchableOpacity style={styles.addUserButton} onPress={agregarUsuario}>
                    <Text style={styles.addUserText}>Añadir Usuario</Text>
                </TouchableOpacity>
            )}

            {/* Botón para guardar cambios */}
            <View style={styles.saveButtonContainer}>
                <Button title="Guardar Cambios" onPress={actualizarGastosGrupales} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#333',
    },
    formContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    addUserButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF6347', // Cambiar color si está en modo "Cancelar"
    },
    addUserText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButtonContainer: {
        marginTop: 30,
    },
});

import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { firestore } from '../../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import UsuarioItem from '../../components/usuario_item';

export default function DetalleGastosGrupales() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [usuarios, setUsuarios] = useState<{ id: string; nombre: string; isEditing: boolean; newName: string }[]>([]);
    const [productos, setProductos] = useState<{ nombre: string; cantidad: string; precio: string; totalProducto: string; usuario: string }[]>([]);
    const [nuevoUsuario, setNuevoUsuario] = useState(""); // Estado para el nuevo usuario

    useEffect(() => {
        const obtenerDetalle = async () => {
            try {
                const docRef = doc(firestore, "gastos_grupales", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setNombre(data.nombre || "");
                    setDescripcion(data.descripcion || "");
                    setUsuarios(
                        data.usuarios?.map((user: string) => ({ id: user, nombre: user, isEditing: false, newName: "" })) || []
                    );
                    setProductos(data.productos || []);
                }
            } catch (error) {
                console.error("Error al obtener detalles:", error);
            }
        };

        obtenerDetalle();
    }, [id]);

    const actualizarGastosGrupales = async () => {
        try {
            const docRef = doc(firestore, "gastos_grupales", id as string);
            await updateDoc(docRef, {
                nombre,
                descripcion,
                usuarios: usuarios.map((user) => user.nombre),
            });
            alert("Grupo de gastos actualizado correctamente");
            router.back();
        } catch (error) {
            console.error("Error al actualizar grupo de gastos:", error);
        }
    };

    // Función para eliminar un usuario
    const eliminarUsuario = (userId: string) => {
        setUsuarios(usuarios.filter((usuario) => usuario.id !== userId));
    };

    // Función para activar el modo de edición de un usuario
    const editarUsuario = (userId: string) => {
        setUsuarios(usuarios.map((usuario) =>
            usuario.id === userId ? { ...usuario, isEditing: true, newName: usuario.nombre } : usuario
        ));
    };

    // Función para cancelar la edición de un usuario
    const cancelarEdicion = (userId: string) => {
        setUsuarios(usuarios.map((usuario) =>
            usuario.id === userId ? { ...usuario, isEditing: false, newName: "" } : usuario
        ));
    };

    // Función para guardar el cambio de nombre
    const guardarEdicion = (userId: string) => {
        setUsuarios(usuarios.map((usuario) =>
            usuario.id === userId ? { ...usuario, nombre: usuario.newName, isEditing: false } : usuario
        ));
    };

    // Función para manejar el cambio en el campo de nombre durante la edición
    const manejarCambioNombre = (userId: string, newName: string) => {
        setUsuarios(usuarios.map((usuario) =>
            usuario.id === userId ? { ...usuario, newName } : usuario
        ));
    };

    // Función para agregar un nuevo usuario
    const agregarUsuario = () => {
        if (nuevoUsuario.trim() !== "") {
            const newUser = {
                id: `${Date.now()}`, // Generamos un id único (puedes usar otro mecanismo si lo prefieres)
                nombre: nuevoUsuario,
                isEditing: false,
                newName: "",
            };
            setUsuarios([...usuarios, newUser]);
            setNuevoUsuario(""); // Limpiar el campo después de agregar
        }
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
                    <TouchableOpacity onPress={agregarUsuario} className="ml-3 p-3 bg-green-600 rounded-full">
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Título de Productos */}
            <View className="flex-row items-center mt-5">
                <ShoppingCart size={20} color="#10B981" />
                <Text className="ml-2 text-lg font-extrabold text-gray-700">Productos Consumidos:</Text>
            </View>

            {/* Lista de Productos */}
            <FlatList
                data={productos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View className="p-4 mt-3 bg-white rounded-lg shadow">
                        <View className="flex-row items-center">
                            <Box size={20} color="#4A90E2" />
                            <Text className="font-bold text-gray-700 ml-2">{item.nombre}</Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                            <Text className="text-gray-500">Cantidad:</Text>
                            <Text className="text-gray-700 ml-1">{item.cantidad}</Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                            <DollarSign size={20} color="#F59E0B" />
                            <Text className="text-gray-500">Precio:</Text>
                            <Text className="text-gray-700 ml-1">${item.precio}</Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                            <CheckCircle size={20} color="#10B981" />
                            <Text className="text-gray-500">Total:</Text>
                            <Text className="text-gray-700 ml-1">${item.totalProducto}</Text>
                        </View>
                        <Text className="text-gray-600 text-sm mt-2">Usuario: {item.usuario}</Text>
                    </View>
                )}
            />

            {/* Botón de Guardar Cambios */}
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

import { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { firestore } from "../../firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User, ClipboardList, FileText, Save, Users, ShoppingCart, Edit, Trash, DollarSign, Box, CheckCircle, Plus } from "lucide-react-native"; // Íconos adicionales

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
        <View className="flex-1 p-5 bg-gray-100">
            {/* Título Editar Grupo de Gastos */}
            <View className="flex-row items-center justify-center mb-5">
                <Edit size={24} color="#FF6347" />
                <Text className="ml-2 text-2xl font-extrabold text-red-600">Editar Grupo de Gastos</Text>
            </View>

            {/* Card para Nombre y Descripción */}
            <View className="bg-white p-4 rounded-2xl shadow mt-5">
                <View className="flex-row items-center mb-2">
                    <ClipboardList size={20} color="#10B981" />
                    <Text className="ml-2 text-lg font-bold text-gray-700">Nombre del Grupo</Text>
                </View>
                <TextInput
                    className="border border-gray-300 p-3 rounded-lg bg-gray-50"
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder="Nombre del grupo"
                />

                <View className="flex-row items-center mt-4 mb-2">
                    <FileText size={20} color="#10B981" />
                    <Text className="ml-2 text-lg font-bold text-gray-700">Descripción</Text>
                </View>
                <TextInput
                    className="border border-gray-300 p-3 rounded-lg bg-gray-50"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    placeholder="Descripción del grupo"
                />
            </View>

            {/* Título de Usuarios */}
            <View className="flex-row items-center mt-5">
                <Users size={20} color="#10B981" />
                <Text className="ml-2 text-lg font-extrabold text-gray-700">Usuarios:</Text>
            </View>

            {/* Contenedor de Usuarios con altura fija y scroll */}
            <View className="bg-white p-4 rounded-2xl shadow mt-3" style={{ height: 200 }}>
                {/* Lista de usuarios */}
                <FlatList
                    data={usuarios}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <User size={20} color="#10B981" />
                                {item.isEditing ? (
                                    <TextInput
                                        className="ml-3 text-lg font-medium text-gray-700 w-48 border border-gray-300 p-2 rounded-lg"
                                        value={item.newName}
                                        onChangeText={(text) => manejarCambioNombre(item.id, text)}
                                    />
                                ) : (
                                    <Text className="ml-3 text-lg font-medium text-gray-700">{item.nombre}</Text>
                                )}
                            </View>
                            <View className="flex-row items-center">
                                {item.isEditing ? (
                                    <>
                                        <TouchableOpacity onPress={() => guardarEdicion(item.id)} className="mr-3">
                                            <Save size={20} color="#10B981" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => cancelarEdicion(item.id)}>
                                            <Text className="text-red-500">Cancelar</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => editarUsuario(item.id)} className="mr-3">
                                            <Edit size={20} color="#ff5b14" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => eliminarUsuario(item.id)}>
                                            <Trash size={20} color="#FF6347" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    )}
                />

                {/* Campo para agregar un nuevo usuario y el botón "+" */}
                <View className="flex-row items-center mt-3">
                    <TextInput
                        className="border border-gray-300 p-3 rounded-lg bg-gray-50 flex-1"
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
                className="mt-6 p-3 rounded-lg bg-indigo-600 flex-row items-center justify-center"
                onPress={actualizarGastosGrupales}
            >
                <Save size={20} color="white" />
                <Text className="text-white font-semibold text-center ml-2">Guardar Cambios</Text>
            </TouchableOpacity>
        </View>
    );
}

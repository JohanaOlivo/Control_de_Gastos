import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
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
        <View className="flex-1 p-5 bg-gray-100">
            <Text className="text-2xl font-bold mb-3 text-center text-gray-700">Editar Grupo de Gastos</Text>

            <Text className="text-xl font-bold mt-4 text-gray-700">Nombre del grupo de gastos</Text>
            <TextInput
                className="border border-gray-300 p-3 rounded-md bg-white text-base"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del grupo de gastos"
            />
            <Text className="text-xl font-bold mt-4 text-gray-700">Descripción del grupo de gastos</Text>
            <TextInput
                className="border border-gray-300 p-3 rounded-md bg-white text-base"
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción del grupo de gastos"
            />

            <Text className="text-xl font-bold mt-4 text-gray-700">Usuarios en este grupo:</Text>
            <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <UsuarioItem usuario={item} onEliminar={eliminarUsuario} />
                )}
            />

            {/* Campo para añadir el nuevo usuario */}
            {mostrandoNuevoUsuario && (
                <View className="mt-5 mb-5">
                    <TextInput
                        className="border border-gray-300 p-3 rounded-md bg-white text-base"
                        value={nuevoUsuario}
                        onChangeText={setNuevoUsuario}
                        placeholder="Nuevo usuario"
                    />
                </View>
            )}

            {/* Botón para mostrar el campo de nuevo usuario */}
            <TouchableOpacity
                className={`p-3 rounded-md mt-4 items-center justify-center ${mostrandoNuevoUsuario ? 'bg-red-500' : 'bg-green-500'}`}
                onPress={() => setMostrandoNuevoUsuario(!mostrandoNuevoUsuario)}
            >
                <Text className="text-white font-bold text-lg">
                    {mostrandoNuevoUsuario ? 'Cancelar' : 'Añadir Usuario'}
                </Text>
            </TouchableOpacity>

            {/* Si estamos mostrando el campo de nuevo usuario, mostramos el botón para añadirlo */}
            {mostrandoNuevoUsuario && (
                <TouchableOpacity className="p-3 rounded-md mt-4 bg-blue-500 items-center justify-center" onPress={agregarUsuario}>
                    <Text className="text-white font-bold text-lg">Añadir Usuario</Text>
                </TouchableOpacity>
            )}

            {/* Botón para guardar cambios */}
            <View className="mt-8">
                <Button title="Guardar Cambios" onPress={actualizarGastosGrupales} />
            </View>
        </View>
    );
}

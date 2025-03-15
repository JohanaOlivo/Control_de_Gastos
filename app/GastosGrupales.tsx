import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { firestore } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons'; // Importar íconos

export default function NuevoGastoGrupal() {
    // Estados
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [usuarios, setUsuarios] = useState<string[]>([]); // Lista de usuarios
    const [productos, setProductos] = useState<{ nombre: string, cantidad: string, precio: string, usuario: string, totalProducto: string }[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const router = useRouter();

    // Modal para agregar productos
    const [modalVisible, setModalVisible] = useState(false);
    const [productoTemporal, setProductoTemporal] = useState({ nombre: '', cantidad: '', precio: '', usuario: '', totalProducto: '0.00' });

    // Modal para agregar usuario
    const [modalUsuarioVisible, setModalUsuarioVisible] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState('');

    const abrirModalProducto = () => {
        setProductoTemporal({ nombre: '', cantidad: '', precio: '', usuario: '', totalProducto: '0.00' });
        setModalVisible(true);
    };

    const cerrarModalProducto = () => {
        setModalVisible(false);
    };

    const abrirModalUsuario = () => {
        setNombreUsuario('');
        setModalUsuarioVisible(true);
    };

    const cerrarModalUsuario = () => {
        setModalUsuarioVisible(false);
    };

    const agregarProducto = () => {
        if (!productoTemporal.nombre || !productoTemporal.cantidad || !productoTemporal.precio || !productoTemporal.usuario) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Todos los campos del producto son obligatorios.',
                visibilityTime: 3000,
            });
            return;
        }

        // Calcular el total del producto
        const cantidad = parseFloat(productoTemporal.cantidad);
        const precio = parseFloat(productoTemporal.precio);
        const totalProducto = (cantidad * precio).toFixed(2); // Multiplicar cantidad por precio

        // Crear el producto con el total calculado
        const producto = {
            ...productoTemporal,
            totalProducto: totalProducto,
        };

        // Agregar el producto a la lista
        setProductos([...productos, producto]);
        cerrarModalProducto();
    };

    // Función para agregar un usuario
    const agregarUsuario = () => {
        if (!nombreUsuario.trim()) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'El nombre del usuario no puede estar vacío.',
                visibilityTime: 3000,
            });
            return;
        }
        if (!usuarios.includes(nombreUsuario)) {
            setUsuarios([...usuarios, nombreUsuario]);
            cerrarModalUsuario();
        } else {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'Este usuario ya ha sido agregado.',
                visibilityTime: 3000,
            });
        }
    };

    // Función para eliminar un usuario
    const eliminarUsuario = (index: number) => {
        const nuevaLista = usuarios.filter((_, i) => i !== index);
        setUsuarios(nuevaLista);
    };

    // Función para eliminar un producto
    const eliminarProducto = (index: number) => {
        const nuevaLista = productos.filter((_, i) => i !== index);
        setProductos(nuevaLista);
    };

    // Crear el gasto grupal en Firestore
    const crearGastoGrupal = async () => {
        if (!validarCampos()) return;

        try {
            // Agregar el documento en la colección 'gastos_grupales'
            const docRef = await addDoc(collection(firestore, 'gastos_grupales'), {
                nombre,
                descripcion,
                usuarios,
                productos,
                totalGeneral: calcularTotalGeneral(),
                createdAt: new Date(),
            });

            Toast.show({
                type: 'success',
                position: 'top',
                text1: '¡Gasto grupal creado!',
                text2: 'El gasto grupal y productos fueron guardados correctamente.',
                visibilityTime: 3000,
            });

            router.push({
                pathname: '/resumen/[id]',
                params: { id: docRef.id }
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'No se pudo guardar el gasto grupal.',
                visibilityTime: 3000,
            });
        }
    };

    // Calcular el total general de todos los productos
    const calcularTotalGeneral = () => {
        return productos.reduce((total, producto) => total + parseFloat(producto.totalProducto), 0).toFixed(2);
    };

    // Validar campos del formulario
    const validarCampos = () => {
        const erroresTemp: Record<string, string> = {};

        if (!nombre.trim()) erroresTemp.nombre = 'El nombre es obligatorio.';
        if (!descripcion.trim()) erroresTemp.descripcion = 'La descripción es obligatoria.';
        if (usuarios.length === 0) erroresTemp.usuarios = 'Debe haber al menos un usuario.';
        if (productos.some(producto => !producto.nombre.trim() || !producto.cantidad.trim() || !producto.precio.trim() || !producto.usuario.trim())) {
            erroresTemp.productos = 'Todos los productos deben tener nombre, cantidad, precio y comprador.';
        }

        setErrores(erroresTemp);
        return Object.keys(erroresTemp).length === 0;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-100"
        >
            <ScrollView className="px-4 py-6">
                <Text className="text-2xl font-bold text-center text-indigo-700">Nuevo Gasto Grupal</Text>

                <TextInput
                    className="mt-4 p-3 bg-white rounded-lg shadow-md border border-gray-300"
                    placeholder="Nombre del gasto grupal"
                    value={nombre}
                    onChangeText={setNombre}
                />
                {errores.nombre && <Text className="text-red-500">{errores.nombre}</Text>}

                <TextInput
                    className="mt-4 p-3 bg-white rounded-lg shadow-md border border-gray-300"
                    placeholder="Descripción del gasto grupal"
                    value={descripcion}
                    onChangeText={setDescripcion}
                />
                {errores.descripcion && <Text className="text-red-500">{errores.descripcion}</Text>}

                {/* Botón para agregar usuario */}
                <TouchableOpacity
                    className="mt-4 bg-blue-600 p-3 rounded-lg"
                    onPress={abrirModalUsuario}
                >
                    <Text className="text-white text-center font-semibold">Agregar Usuario</Text>
                </TouchableOpacity>

                {/* Listado de usuarios */}
                {usuarios.length > 0 && (
                    <View className="mt-4">
                        <Text className="font-semibold text-gray-700">Usuarios:</Text>
                        {usuarios.map((usuario, index) => (
                            <View key={index} className="flex-row justify-between items-center p-3 bg-white rounded-lg my-2 shadow-sm">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="person" size={20} color="#4F46E5" />
                                    <Text className="ml-2 text-gray-800">{usuario}</Text>
                                </View>
                                <TouchableOpacity onPress={() => eliminarUsuario(index)}>
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <Text className="mt-4 text-lg font-semibold text-gray-700">Productos agregados:</Text>
                {productos.map((producto, index) => (
                    <View key={index} className="mt-2 p-3 bg-white rounded-lg shadow-sm">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <MaterialIcons name="shopping-bag" size={20} color="#4F46E5" />
                                <Text className="ml-2 text-gray-800 font-semibold">{producto.nombre}</Text>
                            </View>
                            <TouchableOpacity onPress={() => eliminarProducto(index)}>
                                <MaterialIcons name="delete" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                        <View className="mt-2">
                            <Text className="text-gray-600">Cantidad: {producto.cantidad}</Text>
                            <Text className="text-gray-600">Precio unitario: ${producto.precio}</Text>
                            <Text className="text-gray-600">Total: ${producto.totalProducto}</Text>
                            <Text className="text-gray-800 font-semibold">Comprado por: {producto.usuario}</Text> {/* Nuevo campo */}
                        </View>
                    </View>
                ))}


                <Text className="mt-4 text-lg font-bold text-indigo-800">Total General: ${calcularTotalGeneral()}</Text>

                <TouchableOpacity
                    className="mt-6 bg-indigo-600 p-3 rounded-lg shadow-md"
                    onPress={abrirModalProducto}
                >
                    <Text className="text-white text-center font-semibold">Agregar Producto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-6 bg-green-600 p-3 rounded-lg shadow-md"
                    onPress={crearGastoGrupal}
                >
                    <Text className="text-white text-center font-semibold">Crear Gasto Grupal</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal para agregar usuario */}
            {modalUsuarioVisible && (
                <Modal transparent={true} animationType="fade">
                    <BlurView intensity={20} className="flex-1 justify-center items-center bg-black/40">
                        <View className="w-4/5 bg-white p-6 rounded-2xl shadow-lg">
                            <Text className="text-lg font-semibold text-gray-700 text-center">Agregar Usuario</Text>

                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Nombre del usuario"
                                value={nombreUsuario}
                                onChangeText={setNombreUsuario}
                            />

                            <TouchableOpacity
                                className="mt-4 bg-blue-600 p-3 rounded-lg"
                                onPress={agregarUsuario}
                            >
                                <Text className="text-white text-center">Agregar Usuario</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="mt-4 p-3 rounded-lg border border-gray-300"
                                onPress={cerrarModalUsuario}
                            >
                                <Text className="text-center text-red-500">Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Modal>
            )}

            {/* Modal con BlurView para productos */}
            {modalVisible && (
                <Modal transparent={true} animationType="fade">
                    <BlurView intensity={20} className="flex-1 justify-center items-center bg-black/40">
                        <View className="w-4/5 bg-white p-6 rounded-2xl shadow-lg">
                            <Text className="text-lg font-semibold text-gray-700 text-center">Agregar Producto</Text>

                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Nombre del producto"
                                value={productoTemporal.nombre}
                                onChangeText={(text) => setProductoTemporal({ ...productoTemporal, nombre: text })}
                            />
                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Cantidad"
                                keyboardType="numeric"
                                value={productoTemporal.cantidad}
                                onChangeText={(text) => setProductoTemporal({ ...productoTemporal, cantidad: text })}
                            />
                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Precio"
                                keyboardType="numeric"
                                value={productoTemporal.precio}
                                onChangeText={(text) => setProductoTemporal({ ...productoTemporal, precio: text })}
                            />
                            <RNPickerSelect
                                onValueChange={(value) => setProductoTemporal({ ...productoTemporal, usuario: value })}
                                items={usuarios.map(usuario => ({ label: usuario, value: usuario }))}
                                placeholder={{ label: 'Selecciona un usuario', value: null }}
                                value={productoTemporal.usuario}
                            />

                            <TouchableOpacity
                                className="mt-4 bg-blue-600 p-3 rounded-lg"
                                onPress={agregarProducto}
                            >
                                <Text className="text-white text-center">Agregar Producto</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="mt-4 p-3 rounded-lg border border-gray-300"
                                onPress={cerrarModalProducto}
                            >
                                <Text className="text-center text-red-500">Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
}
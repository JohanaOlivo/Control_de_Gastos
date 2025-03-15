import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { firestore } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import RNPickerSelect from 'react-native-picker-select';
import { BlurView } from 'expo-blur';

export default function NuevoGastoGrupal() {
    // Estados
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidadUsuarios, setCantidadUsuarios] = useState('');
    const [usuarios, setUsuarios] = useState<string[]>([]);
    const [productos, setProductos] = useState<{ nombre: string, cantidad: string, precio: string, usuario: string, totalProducto: string }[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const router = useRouter();

    // Modal para agregar productos
    const [modalVisible, setModalVisible] = useState(false);
    const [productoTemporal, setProductoTemporal] = useState({ nombre: '', cantidad: '', precio: '', usuario: '', totalProducto: '0.00' });

    const abrirModalProducto = () => {
        setProductoTemporal({ nombre: '', cantidad: '', precio: '', usuario: '', totalProducto: '0.00' });
        setModalVisible(true);
    };

    const cerrarModalProducto = () => {
        setModalVisible(false);
    };

    const actualizarProductoTemporal = (campo: string, valor: string) => {
        const nuevoProducto = { ...productoTemporal, [campo]: valor };

        if (campo === 'cantidad' || campo === 'precio') {
            const cantidadNum = parseFloat(nuevoProducto.cantidad) || 0;
            const precioNum = parseFloat(nuevoProducto.precio) || 0;
            nuevoProducto.totalProducto = (cantidadNum * precioNum).toFixed(2);
        }

        setProductoTemporal(nuevoProducto);
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
        setProductos([...productos, productoTemporal]);
        cerrarModalProducto();
    };

    // Actualizar la cantidad de usuarios
    const actualizarCantidadUsuarios = (cantidad: string) => {
        const numUsuarios = parseInt(cantidad) || 0;
        setCantidadUsuarios(cantidad);
        setUsuarios(Array(numUsuarios).fill(''));
    };

    // Actualizar el nombre de un usuario
    const actualizarNombreUsuario = (index: number, nombre: string) => {
        const nuevaLista = [...usuarios];
        nuevaLista[index] = nombre;
        setUsuarios(nuevaLista);
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
        if (!cantidadUsuarios.trim()) erroresTemp.cantidadUsuarios = 'La cantidad de usuarios es obligatoria.';
        if (usuarios.some(usuario => !usuario.trim())) erroresTemp.usuarios = 'Todos los usuarios deben tener un nombre.';
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

                <TextInput
                    className="mt-4 p-3 bg-white rounded-lg shadow-md border border-gray-300"
                    placeholder="Cantidad de usuarios"
                    keyboardType="numeric"
                    value={cantidadUsuarios}
                    onChangeText={actualizarCantidadUsuarios}
                />
                {errores.cantidadUsuarios && <Text className="text-red-500">{errores.cantidadUsuarios}</Text>}

                {/* Selección de usuarios */}
                {Array.from({ length: parseInt(cantidadUsuarios) }).map((_, index) => (
                    <TextInput
                        key={index}
                        className="mt-4 p-3 bg-white rounded-lg shadow-md border border-gray-300"
                        placeholder={`Nombre del usuario ${index + 1}`}
                        value={usuarios[index]}
                        onChangeText={(text) => actualizarNombreUsuario(index, text)}
                    />
                ))}

                <Text className="mt-4 text-lg font-semibold text-gray-700">Productos agregados:</Text>
                {productos.map((producto, index) => (
                    <View key={index} className="mt-2 p-3 bg-indigo-100 rounded-lg shadow-sm">
                        <Text className="text-gray-800">{producto.nombre} - ${producto.totalProducto}</Text>
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

            {/* Modal con BlurView */}
            {modalVisible && (
                <Modal transparent={true} animationType="fade">
                    <BlurView intensity={20} className="flex-1 justify-center items-center bg-black/40">
                        <View className="w-4/5 bg-white p-6 rounded-2xl shadow-lg">
                            <Text className="text-lg font-semibold text-gray-700 text-center">Agregar Producto</Text>

                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Nombre del producto"
                                value={productoTemporal.nombre}
                                onChangeText={(text) => actualizarProductoTemporal('nombre', text)}
                            />
                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Cantidad"
                                keyboardType="numeric"
                                value={productoTemporal.cantidad}
                                onChangeText={(text) => actualizarProductoTemporal('cantidad', text)}
                            />
                            <TextInput
                                className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-300"
                                placeholder="Precio"
                                keyboardType="numeric"
                                value={productoTemporal.precio}
                                onChangeText={(text) => actualizarProductoTemporal('precio', text)}
                            />

                            <RNPickerSelect
                                onValueChange={(value) => actualizarProductoTemporal('usuario', value)}
                                value={productoTemporal.usuario}
                                placeholder={{ label: 'Selecciona un usuario...', value: null }}
                                items={usuarios.map((usuario, index) => ({ label: usuario, value: usuario }))}
                                style={{
                                    inputAndroid: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 10 },
                                    inputIOS: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 10 }
                                }}
                            />

                            <TouchableOpacity
                                className="mt-6 bg-blue-600 p-3 rounded-lg"
                                onPress={agregarProducto}
                            >
                                <Text className="text-white text-center font-semibold">Agregar Producto</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="mt-4 p-3 rounded-lg"
                                onPress={cerrarModalProducto}
                            >
                                <Text className="text-center text-red-500">Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
}

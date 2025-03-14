import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { firestore } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

export default function NuevoGastoGrupal() {
    // Estados
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidadUsuarios, setCantidadUsuarios] = useState('');
    const [usuarios, setUsuarios] = useState<string[]>([]);
    const [productos, setProductos] = useState<{ nombre: string, cantidad: string, precio: string, usuario: string, totalProducto: string }[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const router = useRouter();

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

    // Agregar un nuevo producto
    const agregarProducto = () => {
        setProductos([...productos, { nombre: '', cantidad: '', precio: '', usuario: '', totalProducto: '0.00' }]);
    };

    // Actualizar un producto
    const actualizarProducto = (index: number, campo: string, valor: string) => {
        const nuevosProductos = [...productos];
        (nuevosProductos[index] as any)[campo] = valor;

        // Calcular el total del producto si se actualiza cantidad o precio
        if (campo === 'cantidad' || campo === 'precio') {
            const cantidadNum = parseFloat(nuevosProductos[index].cantidad) || 0;
            const precioNum = parseFloat(nuevosProductos[index].precio) || 0;
            nuevosProductos[index].totalProducto = (cantidadNum * precioNum).toFixed(2);
        }

        setProductos(nuevosProductos);
    };

    // Calcular el total general de todos los productos
    const calcularTotalGeneral = () => {
        return productos.reduce((total, producto) => {
            return total + parseFloat(producto.totalProducto);
        }, 0).toFixed(2);
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

            console.log("Documento agregado con ID:", docRef.id);

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
            console.error("Error al guardar el gasto grupal:", error);

            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'No se pudo guardar el gasto grupal.',
                visibilityTime: 3000,
            });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Nuevo Gasto Grupal</Text>

                {/* Campo: Nombre del gasto grupal */}
                <TextInput
                    style={[styles.input, errores.nombre && styles.inputError]}
                    placeholder="Nombre del gasto grupal"
                    value={nombre}
                    onChangeText={setNombre}
                />
                {errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}

                {/* Campo: Descripción del gasto grupal */}
                <TextInput
                    style={[styles.input, errores.descripcion && styles.inputError]}
                    placeholder="Descripción del gasto grupal"
                    value={descripcion}
                    onChangeText={setDescripcion}
                />
                {errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

                {/* Campo: Cantidad de usuarios */}
                <TextInput
                    style={[styles.input, errores.cantidadUsuarios && styles.inputError]}
                    placeholder="Número de usuarios en el gasto grupal"
                    keyboardType="numeric"
                    value={cantidadUsuarios}
                    onChangeText={actualizarCantidadUsuarios}
                />
                {errores.cantidadUsuarios && <Text style={styles.error}>{errores.cantidadUsuarios}</Text>}

                {/* Lista de usuarios */}
                {usuarios.length > 0 && <Text style={styles.sectionTitle}>USUARIOS:</Text>}
                {usuarios.map((usuario, index) => (
                    <View key={index.toString()} style={styles.usuarioContainer}>
                        <Text style={styles.usuarioLabel}>Usuario {index + 1}:</Text>
                        <TextInput
                            style={[styles.input, errores.usuarios && styles.inputError]}
                            placeholder={`Nombre del usuario ${index + 1}`}
                            value={usuario}
                            onChangeText={(text) => actualizarNombreUsuario(index, text)}
                        />
                    </View>
                ))}
                {errores.usuarios && <Text style={styles.error}>{errores.usuarios}</Text>}

                {/* Lista de productos */}
                <Text style={styles.sectionTitle}>PRODUCTOS:</Text>
                {productos.map((producto, index) => (
                    <View key={index.toString()} style={styles.productoContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre del producto"
                            value={producto.nombre}
                            onChangeText={(text) => actualizarProducto(index, 'nombre', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Cantidad"
                            keyboardType="numeric"
                            value={producto.cantidad}
                            onChangeText={(text) => actualizarProducto(index, 'cantidad', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Precio unitario"
                            keyboardType="numeric"
                            value={producto.precio}
                            onChangeText={(text) => actualizarProducto(index, 'precio', text)}
                        />
                        <Picker
                            selectedValue={producto.usuario}
                            style={styles.picker}
                            onValueChange={(itemValue) => actualizarProducto(index, 'usuario', itemValue)}
                        >
                            <Picker.Item label="Seleccione un usuario" value="" />
                            {usuarios.map((user, idx) => (
                                <Picker.Item key={idx} label={user} value={user} />
                            ))}
                        </Picker>
                        {/* Mostrar el total por producto */}
                        <Text style={styles.totalProducto}>
                            Total: ${producto.totalProducto}
                        </Text>
                    </View>
                ))}

                {/* Mostrar el total general */}
                <Text style={styles.totalGeneral}>
                    Total General: ${calcularTotalGeneral()}
                </Text>

                {/* Botones */}
                <TouchableOpacity style={styles.button} onPress={agregarProducto}>
                    <Text style={styles.buttonText}>Agregar Producto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={crearGastoGrupal}>
                    <Text style={styles.buttonText}>Crear Gasto Grupal</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: '#f7f7f7' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    input: { width: '100%', height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 10, backgroundColor: '#fff' },
    inputError: { borderColor: 'red', borderWidth: 2 },
    picker: { width: '100%', height: 50, marginBottom: 15, backgroundColor: '#fff' },
    button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    error: { color: 'red', marginBottom: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#444' },
    usuarioContainer: { marginBottom: 10 },
    usuarioLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 5, color: '#444' },
    productoContainer: { marginBottom: 15, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 8 },
    totalProducto: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10 },
    totalGeneral: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginTop: 20, textAlign: 'center' },
});
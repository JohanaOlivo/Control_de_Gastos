import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { firestore } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

export default function NuevaColeccion() {
    // Estados
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidadUsuarios, setCantidadUsuarios] = useState('');
    const [usuarios, setUsuarios] = useState<string[]>([]);
    const [productos, setProductos] = useState<{ nombre: string, cantidad: string, precio: string, usuario: string }[]>([]);
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
        setProductos([...productos, { nombre: '', cantidad: '', precio: '', usuario: '' }]);
    };

    // Actualizar un producto
    const actualizarProducto = (index: number, campo: string, valor: string) => {
        const nuevosProductos = [...productos];
        (nuevosProductos[index] as any)[campo] = valor;
        setProductos(nuevosProductos);
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

    // Crear la colección en Firestore
    const crearColeccion = async () => {
        if (!validarCampos()) return;

        try {
            await addDoc(collection(firestore, 'colecciones'), {
                nombre,
                descripcion,
                usuarios,
                productos,
                createdAt: new Date(),
            });

            Toast.show({
                type: 'success',
                position: 'top',
                text1: '¡Colección creada!',
                text2: 'La colección y productos fueron guardados correctamente.',
                visibilityTime: 3000,
            });

            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (error) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'No se pudo guardar la colección.',
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
                <Text style={styles.title}>Nueva Colección</Text>

                {/* Campo: Nombre de la colección */}
                <TextInput
                    style={[styles.input, errores.nombre && styles.inputError]}
                    placeholder="Nombre de la colección"
                    value={nombre}
                    onChangeText={setNombre}
                />
                {errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}

                {/* Campo: Descripción de la colección */}
                <TextInput
                    style={[styles.input, errores.descripcion && styles.inputError]}
                    placeholder="Descripción de la colección"
                    value={descripcion}
                    onChangeText={setDescripcion}
                />
                {errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

                {/* Campo: Cantidad de usuarios */}
                <TextInput
                    style={[styles.input, errores.cantidadUsuarios && styles.inputError]}
                    placeholder="Número de usuarios en la colección"
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
                    </View>
                ))}

                {/* Botones */}
                <TouchableOpacity style={styles.button} onPress={agregarProducto}>
                    <Text style={styles.buttonText}>Agregar Producto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={crearColeccion}>
                    <Text style={styles.buttonText}>Crear Colección</Text>
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
});
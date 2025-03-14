import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { firestore } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

export default function GastosIndividuales() {
    // Estados
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [productos, setProductos] = useState<{ nombre: string, cantidad: string, precio: string, totalProducto: string }[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const router = useRouter();

    // Agregar un nuevo producto
    const agregarProducto = () => {
        setProductos([...productos, { nombre: '', cantidad: '', precio: '', totalProducto: '0.00' }]);
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
        if (productos.some(producto => !producto.nombre.trim() || !producto.cantidad.trim() || !producto.precio.trim())) {
            erroresTemp.productos = 'Todos los productos deben tener nombre, cantidad y precio.';
        }

        setErrores(erroresTemp);
        return Object.keys(erroresTemp).length === 0;
    };

    // Crear el gasto individual en Firestore
    const crearGastoIndividual = async () => {
        if (!validarCampos()) return;

        try {
            // Agregar el gasto individual y obtener la referencia al documento creado
            const docRef = await addDoc(collection(firestore, 'gastos_individuales'), {
                nombre,
                descripcion,
                productos,
                totalGeneral: calcularTotalGeneral(),
                createdAt: new Date(),
            });

            console.log("Documento agregado con ID:", docRef.id);

            Toast.show({
                type: 'success',
                position: 'top',
                text1: '¡Gasto guardado!',
                text2: 'El gasto fue registrado correctamente.',
                visibilityTime: 3000,
            });

            router.push({
                pathname: '/resumen/[id]',
                params: { id: docRef.id }
            });
        } catch (error) {
            console.error("Error al guardar el gasto:", error);

            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error',
                text2: 'No se pudo guardar el gasto.',
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
                <Text style={styles.title}>Nuevo Gasto Individual</Text>

                {/* Campo: Nombre del gasto */}
                <TextInput
                    style={[styles.input, errores.nombre && styles.inputError]}
                    placeholder="Nombre del gasto"
                    value={nombre}
                    onChangeText={setNombre}
                />
                {errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}

                {/* Campo: Descripción del gasto */}
                <TextInput
                    style={[styles.input, errores.descripcion && styles.inputError]}
                    placeholder="Descripción del gasto"
                    value={descripcion}
                    onChangeText={setDescripcion}
                />
                {errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

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
                <TouchableOpacity style={styles.button} onPress={crearGastoIndividual}>
                    <Text style={styles.buttonText}>Guardar Gasto</Text>
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
    button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    error: { color: 'red', marginBottom: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#444' },
    productoContainer: { marginBottom: 15, padding: 10, backgroundColor: '#e0e0e0', borderRadius: 8 },
    totalProducto: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10 },
    totalGeneral: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginTop: 20, textAlign: 'center' },
});

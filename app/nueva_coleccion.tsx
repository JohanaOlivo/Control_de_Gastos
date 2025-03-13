import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { firestore } from '../firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

export default function NuevaColeccion() {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidadUsuarios, setCantidadUsuarios] = useState('');
    const [usuarios, setUsuarios] = useState<string[]>([]);
    const [errores, setErrores] = useState<Record<string, string>>({});
    const router = useRouter();

    const actualizarCantidadUsuarios = (cantidad: string) => {
        const numUsuarios = parseInt(cantidad) || 0;
        setCantidadUsuarios(cantidad);
        setUsuarios(Array(numUsuarios).fill(''));
    };

    const actualizarNombreUsuario = (index: number, nombre: string) => {
        const nuevaLista = [...usuarios];
        nuevaLista[index] = nombre;
        setUsuarios(nuevaLista);
    };

    const validarCampos = () => {
        const erroresTemp: Record<string, string> = {};

        if (!nombre.trim()) erroresTemp.nombre = 'El nombre es obligatorio.';
        if (!descripcion.trim()) erroresTemp.descripcion = 'La descripción es obligatoria.';
        if (!cantidadUsuarios.trim()) erroresTemp.cantidadUsuarios = 'La cantidad de usuarios es obligatoria.';
        if (usuarios.some(usuario => !usuario.trim())) erroresTemp.usuarios = 'Todos los usuarios deben tener un nombre.';

        setErrores(erroresTemp);
        return Object.keys(erroresTemp).length === 0;
    };

    const crearColeccion = async () => {
        if (!validarCampos()) return;

        try {
            await addDoc(collection(firestore, 'colecciones'), {
                nombre,
                descripcion,
                usuarios,
                createdAt: new Date(),
            });

            Toast.show({
                type: 'success',
                position: 'top',
                text1: '¡Colección creada!',
                text2: 'La colección se guardó correctamente.',
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
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Nueva Colección</Text>

            <TextInput
                style={[styles.input, errores.nombre && styles.inputError]}
                placeholder="Nombre de la colección"
                value={nombre}
                onChangeText={setNombre}
            />
            {errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}

            <TextInput
                style={[styles.input, errores.descripcion && styles.inputError]}
                placeholder="Descripción de la colección"
                value={descripcion}
                onChangeText={setDescripcion}
            />
            {errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

            <TextInput
                style={[styles.input, errores.cantidadUsuarios && styles.inputError]}
                placeholder="Número de usuarios en la colección"
                keyboardType="numeric"
                value={cantidadUsuarios}
                onChangeText={actualizarCantidadUsuarios}
            />
            {errores.cantidadUsuarios && <Text style={styles.error}>{errores.cantidadUsuarios}</Text>}

            {usuarios.length > 0 && <Text style={styles.sectionTitle}>USUARIOS:</Text>}

            {usuarios.map((usuario, index) => (
                <View key={index.toString()} style={styles.usuarioContainer}>
                    <Text style={styles.usuarioLabel}>
                        Usuario {index + 1}:
                    </Text>
                    <TextInput
                        style={[styles.input, errores.usuarios && styles.inputError]}
                        placeholder={`Nombre del usuario ${index + 1}`}
                        value={usuario}
                        onChangeText={(text) => actualizarNombreUsuario(index, text)}
                    />
                </View>
            ))}

            {errores.usuarios && <Text style={styles.error}>{errores.usuarios}</Text>}

            <TouchableOpacity style={styles.button} onPress={crearColeccion}>
                <Text style={styles.buttonText}>Crear Colección</Text>
            </TouchableOpacity>

            <Toast />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%', // Ancho completo para que el campo sea responsivo
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: 'red',
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#444',
        marginTop: 20,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    usuarioContainer: {
        width: '100%',
        marginBottom: 15,
    },
    usuarioLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 40,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
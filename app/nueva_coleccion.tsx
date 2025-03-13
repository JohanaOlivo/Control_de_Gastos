import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
        setUsuarios(prevUsuarios =>
            numUsuarios > prevUsuarios.length
                ? [...prevUsuarios, ...Array(numUsuarios - prevUsuarios.length).fill('')]
                : prevUsuarios.slice(0, numUsuarios)
        );
    };

    const actualizarNombreUsuario = (index: number, nombre: string) => {
        setUsuarios(prevUsuarios => {
            const nuevaLista = [...prevUsuarios];
            nuevaLista[index] = nombre;
            return nuevaLista;
        });
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
                position: 'top', // Cambié la posición a "top" para que el toast aparezca en la parte superior
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
        <View style={styles.container}>
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
                placeholder="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
            />
            {errores.descripcion && <Text style={styles.error}>{errores.descripcion}</Text>}

            <TextInput
                style={[styles.input, errores.cantidadUsuarios && styles.inputError]}
                placeholder="Cantidad de usuarios"
                keyboardType="numeric"
                value={cantidadUsuarios}
                onChangeText={actualizarCantidadUsuarios}
            />
            {errores.cantidadUsuarios && <Text style={styles.error}>{errores.cantidadUsuarios}</Text>}

            <FlatList
                data={usuarios}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TextInput
                        style={[styles.input, errores.usuarios && styles.inputError]}
                        placeholder={`Usuario ${index + 1}`}
                        value={item}
                        onChangeText={(text) => actualizarNombreUsuario(index, text)}
                    />
                )}
            />
            {errores.usuarios && <Text style={styles.error}>{errores.usuarios}</Text>}

            <TouchableOpacity style={styles.button} onPress={crearColeccion}>
                <Text style={styles.buttonText}>Crear Colección</Text>
            </TouchableOpacity>

            <Toast />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',  // Cambié el justificado para que los elementos estén más arriba
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f7f7f7',
    },
    title: {
        fontSize: 32,  // Aumenté el tamaño de la fuente del título
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 60,  // Aumenté la altura de los inputs
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,  // Aumenté el borde
        marginBottom: 20,  // Aumenté el margen inferior
        paddingHorizontal: 20,  // Aumenté el relleno horizontal
        fontSize: 18,  // Aumenté el tamaño de la fuente
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: 'red',
    },
    error: {
        color: 'red',
        fontSize: 14,  // Aumenté el tamaño de la fuente de los errores
        marginBottom: 15,  // Aumenté el margen de los errores
    },
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,  // Aumenté el radio del borde
        paddingVertical: 16,  // Aumenté el padding vertical
        paddingHorizontal: 40,  // Aumenté el padding horizontal
        marginTop: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,  // Aumenté el tamaño de la fuente del botón
        fontWeight: 'bold',
    },
});

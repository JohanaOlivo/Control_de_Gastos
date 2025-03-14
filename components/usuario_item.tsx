import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';

interface UsuarioProps {
    usuario: { id: number; nombre: string };
    onEliminar: (id: number) => void;
}

export default function UsuarioItem({ usuario, onEliminar }: UsuarioProps) {
    const [editando, setEditando] = useState(false);
    const [nombreEditado, setNombreEditado] = useState(usuario.nombre);

    const guardarEdicion = () => {
        usuario.nombre = nombreEditado;
        setEditando(false);
    };

    return (
        <View style={styles.userContainer}>
            {editando ? (
                <>
                    <TextInput
                        style={styles.input}
                        value={nombreEditado}
                        onChangeText={setNombreEditado}
                        placeholder="Editar nombre"
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={guardarEdicion}>
                        <Text style={styles.buttonText}>Guardar</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.user}>{usuario.nombre}</Text>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.editButton} onPress={() => setEditando(true)}>
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => onEliminar(usuario.id)}>
                            <Text style={styles.buttonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    userContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    user: {
        fontSize: 16,
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 5,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#E53935',
        padding: 8,
        borderRadius: 5,
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 8,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { FAB } from 'react-native-paper';

export default function Dashboard() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-2xl font-bold text-gray-800 mb-8">Bienvenido al Dashboard</Text>



      {/* Barra de navegación inferior */}
      <View className="absolute bottom-0 left-0 right-0 bg-white shadow-lg flex-row justify-around items-center p-4 border-t border-gray-200 h-16">
        
        {/* Icono de inicio */}
        <TouchableOpacity onPress={() => router.push('/dashboard')} className="items-center">
          <Ionicons name="home-outline" size={28} color="#4B5563" />
          <Text className="text-gray-600 text-xs">Inicio</Text>
        </TouchableOpacity>

        {/* Icono de colecciones */}
        <TouchableOpacity onPress={() => router.push('/ver_colecciones')} className="items-center">
          <MaterialIcons name="collections-bookmark" size={28} color="#4B5563" />
          <Text className="text-gray-600 text-xs">Colecciones</Text>
        </TouchableOpacity>

        {/* Botón flotante para agregar (centrado en la barra) */}
        <View className="absolute -top-6 left-1/2 -translate-x-1/2">
          <FAB
            icon="plus"
            color="white"
            onPress={() => router.push('/nueva_coleccion')}
            style={{
              backgroundColor: '#10B981',
              elevation: 5, // Sombra en Android
              shadowColor: '#000', // Sombra en iOS
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          />
        </View>

        {/* Icono de estadísticas */}
        <TouchableOpacity onPress={() => router.push('/estadisticas')} className="items-center">
          <FontAwesome5 name="chart-bar" size={28} color="#4B5563" />
          <Text className="text-gray-600 text-xs">Estadísticas</Text>
        </TouchableOpacity>

        {/* Icono de configuración */}
        <TouchableOpacity onPress={() => router.push('/configuracion')} className="items-center">
          <Ionicons name="settings-outline" size={28} color="#4B5563" />
          <Text className="text-gray-600 text-xs">Ajustes</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

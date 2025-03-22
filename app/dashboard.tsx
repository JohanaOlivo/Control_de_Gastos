import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'; // Importa los íconos
import { FAB } from 'react-native-paper';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false); // Control de visibilidad del menú
  const menuAnimation = useState(new Animated.Value(0))[0]; // Control de animación

  const handleCreateCollection = (type: string) => {
    setMenuVisible(false); // Ocultar el menú después de seleccionar una opción
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(); // Animación de salida
    if (type === 'grupo') {
      router.push('/GastosGrupales');
    } else {
      router.push('/GastosIndividuales');
    }
  };

  useEffect(() => {
    if (menuVisible) {
      // Animación de entrada
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Animación de salida
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      {/* Imagen de fondo o ilustración */}
      <Image source={{ uri: 'https://your-image-url.com/image.jpg' }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} resizeMode="cover" />

      {/* Contenedor de bienvenida */}
      <View className="z-10 mb-8 text-center">
        <Text className="text-3xl font-bold text-gray-800 mb-4">Bienvenido al Dashboard</Text>
        <Text className="text-lg text-gray-600">Aquí puedes gestionar tus gastos individuales y grupales</Text>
      </View>

      {/* Tarjetas informativas */}
      <View className="flex-row justify-between w-full mb-8 z-10">
        <View className="bg-white shadow-md rounded-lg p-4 flex-1 mr-2">
          <Text className="text-gray-600 text-sm">Total de Gastos</Text>
          <Text className="text-xl font-semibold text-green-500">$3,500</Text>
        </View>
        <View className="bg-white shadow-md rounded-lg p-4 flex-1 ml-2">
          <Text className="text-gray-600 text-sm">Gastos Pendientes</Text>
          <Text className="text-xl font-semibold text-yellow-500">$1,200</Text>
        </View>
      </View>

      {/* Barra de navegación inferior */}
      <View className="absolute bottom-0 left-0 right-0 bg-white shadow-lg flex-row justify-around items-center p-4 border-t border-gray-200 h-16 z-10">
        <TouchableOpacity onPress={() => router.push('/dashboard')} className="items-center">
          <Ionicons name="home-outline" size={28} color="#10B981" />
          <Text className="text-gray-600 text-xs">Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/ViewExpenses')} className="items-center">
          <MaterialIcons name="collections-bookmark" size={28} color="#10B981" />
          <Text className="text-gray-600 text-xs">Tus Gastos</Text>
        </TouchableOpacity>

        {/* Botón flotante para agregar */}
        <View className="relative">
          <FAB
            icon="plus"
            color="white"
            onPress={() => setMenuVisible(!menuVisible)} // Alterna la visibilidad del menú
            style={{
              backgroundColor: '#10B981',
              elevation: 5, // Sombra en Android
              shadowColor: '#000', // Sombra en iOS
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          />

          {/* Menú de opciones desplegable */}
          <Animated.View
            style={{
              opacity: menuAnimation,
              transform: [
                { translateY: menuAnimation.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) },
                { translateX: -128 },
              ],
              position: 'absolute',
              bottom: 90,
              left: '50%',
              backgroundColor: 'white',
              padding: 16,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              width: 230,
              pointerEvents: menuVisible ? 'auto' : 'none', // Desactiva interacciones cuando está oculto
              display: menuVisible ? 'flex' : 'none', // Oculta completamente el menú cuando no es visible
            }}
          >
            <TouchableOpacity
              onPress={() => handleCreateCollection('grupo')}
              className="py-2 px-4 mb-2 bg-blue-500 hover:bg-indigo-700 text-white rounded-lg shadow-md flex flex-row items-center justify-center transition-all duration-200"
            >
              <MaterialIcons name="groups" size={20} color="white" />
              <Text className="font-semibold text-sm ml-2">Gasto Grupal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCreateCollection('individual')}
              className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white rounded-lg shadow-md flex flex-row items-center justify-center transition-all duration-200"
            >
              <MaterialIcons name="person" size={20} color="white" />
              <Text className="font-semibold text-sm ml-2">Gasto Individual</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <TouchableOpacity onPress={() => router.push('/graficosGasto')} className="items-center">
          <FontAwesome5 name="chart-bar" size={28} color="#10B981" />
          <Text className="text-gray-600 text-xs">Graficos de Gastos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/configuracion')} className="items-center">
          <Ionicons name="settings-outline" size={28} color="#10B981" />
          <Text className="text-gray-600 text-xs">Ajustes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

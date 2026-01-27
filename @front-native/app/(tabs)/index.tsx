import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import AppHeader from '@/components/AppHeader';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <AppHeader 
        title={`Bonjour, ${user?.username || 'Utilisateur'}`}
        showBackButton={false}
        rightComponent={
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-lg"
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        }
      />

      <View className="flex-1 p-5 justify-center items-center">
        {/* Logo / Icône */}
        <View className="mb-8">
          <Ionicons name="people" size={80} color="#3B82F6" />
        </View>

        {/* Titre */}
        <Text className="text-3xl font-bold text-gray-900 mb-2.5 text-center">
          Bienvenue sur votre Family Team 🎉
        </Text>
        
        <Text className="text-base text-gray-500 max-w-[300px] text-center mb-10">
          Gérez votre famille et suivez vos parties
        </Text>

        {/* Cartes d'action */}
        <View className="flex-row gap-4 mb-8 flex-wrap justify-center">
          <TouchableOpacity
            className="w-40 bg-white rounded-2xl p-5 items-center shadow"
            onPress={() => router.push('/games')}
            activeOpacity={0.7}
          >
            <View className="mb-3">
              <Ionicons name="dice" size={40} color="#3B82F6" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2 text-center">Mes Jeux</Text>
            <Text className="text-xs text-gray-500 text-center">Explorez votre collection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-40 bg-white rounded-2xl p-5 items-center shadow"
            onPress={() => console.log('Sessions à venir')}
            activeOpacity={0.7}
          >
            <View className="mb-3">
              <Ionicons name="calendar" size={40} color="#8B5CF6" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2 text-center">Parties</Text>
            <Text className="text-xs text-gray-500 text-center">Historique des parties</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity
          className="flex-row items-center bg-blue-500 px-8 py-4 rounded-xl shadow"
          onPress={() => router.push('/games')}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-bold">Voir ma collection</Text>
          <View className="ml-2">
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

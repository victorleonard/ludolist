import { View, Text, TouchableOpacity, ScrollView, ImageBackground, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useFamilyStore } from '@/stores/familyStore';
import { StarRating } from '@/components/games/StarRating';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchFamily, getTransformedGames, getFamilyMembers, fetchLatestPlayedGames, isLoading } = useFamilyStore();
  const [games, setGames] = useState<any[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const members = getFamilyMembers();

  useEffect(() => {
    const loadGames = async () => {
      await fetchFamily();
      const transformedGames = getTransformedGames();
      setGames(transformedGames);
      
      // Récupérer les 10 derniers jeux joués depuis l'API
      const latestPlayedResult = await fetchLatestPlayedGames();
      
      if (latestPlayedResult.success && latestPlayedResult.data) {
        // Transformer les sessions en jeux avec leurs informations
        const playedGames = latestPlayedResult.data.map((session: any) => {
          const game = session.game;
          
          // Trouver le jeu transformé correspondant pour avoir toutes les infos
          const transformedGame = transformedGames.find(g => g.id === game.id);
          
          if (transformedGame) {
            return {
              ...transformedGame,
              averageRating: transformedGame.ratings && transformedGame.ratings.length > 0
                ? transformedGame.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / transformedGame.ratings.length
                : 0,
              lastPlayedAt: session.played_at
            };
          }
          
          return null;
        }).filter(Boolean);
        
        setRecentGames(playedGames);
      } else {
        // Fallback : si pas de sessions, afficher les derniers jeux ajoutés
        const lastGames = [...transformedGames]
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 10)
          .map(game => ({
            ...game,
            averageRating: game.ratings && game.ratings.length > 0
              ? game.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / game.ratings.length
              : 0
          }));
        
        setRecentGames(lastGames);
      }
    };
    loadGames();
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header fixe avec accents colorés subtils */}
      <View className="pt-16 pb-6 px-4 rounded-b-3xl overflow-hidden bg-white">
        {/* Bulle jaune en haut à droite */}
        <View className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ backgroundColor: '#F59E0B', opacity: 0.15, transform: [{ translateX: 80 }, { translateY: -80 }] }} />
        
        {/* Bulle rose en haut à gauche */}
        <View className="absolute top-0 left-0 w-56 h-56 rounded-full" style={{ backgroundColor: '#EC4899', opacity: 0.12, transform: [{ translateX: -50 }, { translateY: -30 }] }} />
        <View className="flex-row items-center justify-between">
          <View className="w-12" />
          
          <Text className="text-gray-900 text-2xl font-bold">Team Family</Text>
          
          <View className="w-12 h-12 rounded-full bg-yellow-400 items-center justify-center border-2 border-yellow-500 shadow-lg">
            <Text className="text-white font-bold text-xl">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
      </View>

      {/* Contenu scrollable */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-4">
          {/* Section Derniers Jeux Joués */}
          <Text className="text-lg font-bold text-gray-900 mb-3 px-4">Derniers Jeux Joués</Text>
          
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : recentGames.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 mx-4 items-center">
              <Ionicons name="dice-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2 text-center">
                Aucun jeu dans votre collection
              </Text>
              <TouchableOpacity 
                className="mt-4 bg-purple-500 px-6 py-3 rounded-xl"
                onPress={() => router.push('/games')}
              >
                <Text className="text-white font-semibold">Ajouter des jeux</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            >
              {recentGames.map((game, index) => (
                <TouchableOpacity
                  key={game.id}
                  className="w-72 h-80 rounded-3xl overflow-hidden shadow-lg"
                  style={{ marginRight: index < recentGames.length - 1 ? 16 : 0 }}
                  onPress={() => router.push(`/games/${game.id}`)}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={{ uri: game.image || 'https://via.placeholder.com/400x300' }}
                    className="flex-1"
                    resizeMode="cover"
                  >
                    <View className="flex-1 justify-end p-5" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                      {/* Icône bookmark */}
                      <View className="absolute top-3 right-3">
                        <TouchableOpacity className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                          <Ionicons name="bookmark-outline" size={24} color="white" />
                        </TouchableOpacity>
                      </View>

                      {/* Badge "Joué récemment" */}
                      <View className="absolute top-3 left-3">
                        <View className="bg-white/90 px-3 py-1 rounded-full flex-row items-center shadow">
                          <Ionicons name="game-controller" size={12} color="#7C3AED" />
                          <Text className="text-purple-900 text-xs font-bold ml-1">Joué</Text>
                        </View>
                      </View>

                      {/* Informations du jeu */}
                      <Text className="text-white text-xl font-bold mb-2" numberOfLines={2}>
                        {game.titre}
                      </Text>
                      
                      <View className="flex-row items-center mb-3">
                        <Ionicons name="people" size={16} color="#D1D5DB" />
                        <Text className="text-gray-200 text-sm ml-2">
                          {game.player_min}-{game.player_max} joueurs
                        </Text>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                          {game.averageRating > 0 ? (
                            <>
                              <Ionicons name="star" size={18} color="#EAB308" />
                              <Text className="text-white text-base ml-1 font-bold">
                                {game.averageRating.toFixed(1)}
                              </Text>
                            </>
                          ) : (
                            <Text className="text-gray-300 text-sm">Non noté</Text>
                          )}
                        </View>
                        <View className="bg-white/90 px-4 py-2 rounded-full shadow">
                          <Text className="text-purple-900 font-bold text-sm">
                            {game.duree} min
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Section Membres de la famille */}
          {members.length > 0 && (
            <View className="px-4">
              <Text className="text-lg font-bold text-gray-900 mt-6 mb-3">Membres de la famille</Text>
              {members.slice(0, 3).map((member) => (
                <View 
                  key={member.id}
                  className="bg-white rounded-2xl p-3 mb-3 flex-row items-center shadow"
                >
                  <View className="w-16 h-16 rounded-xl bg-purple-500 items-center justify-center">
                    {member.avatar ? (
                      <Image 
                        source={{ uri: member.avatar }}
                        className="w-full h-full rounded-xl"
                      />
                    ) : (
                      <Text className="text-white text-2xl font-bold">
                        {member.username[0].toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-semibold">{member.username}</Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="star" size={14} color="#EAB308" />
                      <Text className="text-gray-500 text-xs ml-1">Membre actif</Text>
                    </View>
                  </View>

                  <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Espacement en bas */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </View>
  );
}

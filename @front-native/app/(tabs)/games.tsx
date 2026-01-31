import { ScrollView, View, Text, ActivityIndicator, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { useEffect, useState } from 'react';
import { GameCard, Game } from '@/components/games';
import { useFamilyStore, TransformedGame } from '@/stores/familyStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function GamesScreen() {
  const router = useRouter();
  const { fetchFamily, getTransformedGames, isLoading } = useFamilyStore();
  const [games, setGames] = useState<TransformedGame[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'rated'>('all');

  useEffect(() => {
    const loadGames = async () => {
      await fetchFamily();
      const transformedGames = getTransformedGames();
      setGames(transformedGames);
    };
    loadGames();
  }, []);

  useEffect(() => {
    const transformedGames = getTransformedGames();
    setGames(transformedGames);
  }, [getTransformedGames]);

  // Filtrer les jeux selon la recherche
  const filteredGames = games.filter(game =>
    game.titre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrer selon le filtre sélectionné
  const displayedGames = filteredGames.filter(game => {
    if (selectedFilter === 'rated') {
      return game.ratings && game.ratings.length > 0;
    }
    return true;
  });

  const filters = [
    { id: 'all', label: 'Tous', icon: 'grid' },
    { id: 'recent', label: 'Récents', icon: 'time' },
    { id: 'rated', label: 'Notés', icon: 'star' },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header avec accents colorés subtils */}
      <View className="pt-16 pb-6 px-4 rounded-b-3xl overflow-hidden bg-white">
        {/* Bulle jaune en haut à droite */}
        <View className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ backgroundColor: '#F59E0B', opacity: 0.15, transform: [{ translateX: 80 }, { translateY: -80 }] }} />
        
        {/* Bulle rose en haut à gauche */}
        <View className="absolute top-0 left-0 w-56 h-56 rounded-full" style={{ backgroundColor: '#EC4899', opacity: 0.12, transform: [{ translateX: -50 }, { translateY: -30 }] }} />
        <View className="flex-row items-center justify-between mb-4">
          <View className="w-10" />
          <Text className="text-gray-900 text-2xl font-bold">Ma Collection</Text>
          <TouchableOpacity className="w-10 h-10 bg-yellow-400 rounded-full items-center justify-center shadow border-2 border-yellow-500">
            <Ionicons name="options" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-lg">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-700"
            placeholder="Rechercher un jeu..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-4 px-4"
        >
          <View className="flex-row gap-3">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={`flex-row items-center px-4 py-2 rounded-full shadow ${
                  selectedFilter === filter.id ? 'bg-yellow-400 border-2 border-yellow-500' : 'bg-gray-200'
                }`}
                onPress={() => setSelectedFilter(filter.id as any)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={filter.icon as any} 
                  size={16} 
                  color={selectedFilter === filter.id ? 'white' : '#6B7280'} 
                />
                <Text className={`ml-2 font-medium ${
                  selectedFilter === filter.id ? 'text-white' : 'text-gray-600'
                }`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Liste des jeux */}
      <ScrollView className="flex-1 pt-4" showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-24">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text className="mt-4 text-gray-600">Chargement des jeux...</Text>
            </View>
          ) : displayedGames.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center mt-4">
              <Ionicons name="search-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-900 font-bold text-lg mt-4">
                {searchQuery ? 'Aucun résultat' : 'Aucun jeu'}
              </Text>
              <Text className="text-gray-500 text-center mt-2">
                {searchQuery 
                  ? `Aucun jeu ne correspond à "${searchQuery}"`
                  : 'Commencez à ajouter des jeux à votre collection'
                }
              </Text>
              {searchQuery && (
                <TouchableOpacity 
                  className="mt-4 bg-purple-500 px-6 py-3 rounded-xl"
                  onPress={() => setSearchQuery('')}
                >
                  <Text className="text-white font-semibold">Effacer la recherche</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <Text className="text-gray-500 mb-4">
                {displayedGames.length} jeu{displayedGames.length > 1 ? 'x' : ''}
              </Text>
              <View className="flex-row flex-wrap gap-4">
                {displayedGames.map((game) => {
                  const averageRating = game.ratings && game.ratings.length > 0
                    ? game.ratings.reduce((acc, r) => acc + r.rating, 0) / game.ratings.length
                    : 0;

                  return (
                    <TouchableOpacity
                      key={game.id}
                      className="w-full bg-white rounded-2xl overflow-hidden shadow-md"
                      onPress={() => router.push(`/games/${game.id}`)}
                      activeOpacity={0.9}
                    >
                      <View className="flex-row">
                        {/* Image */}
                        <View className="w-32 h-32 bg-gray-100">
                          {game.image ? (
                            <ImageBackground
                              source={{ uri: game.image }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <View className="w-full h-full items-center justify-center">
                              <Ionicons name="dice-outline" size={48} color="#9CA3AF" />
                            </View>
                          )}
                        </View>

                        {/* Contenu */}
                        <View className="flex-1 p-4 justify-between">
                          <View>
                            <Text className="text-gray-900 font-bold text-base" numberOfLines={2}>
                              {game.titre}
                            </Text>
                            
                            {averageRating > 0 && (
                              <View className="flex-row items-center mt-2">
                                <Ionicons name="star" size={14} color="#EAB308" />
                                <Text className="text-gray-600 text-sm ml-1 font-medium">
                                  {averageRating.toFixed(1)}
                                </Text>
                              </View>
                            )}
                          </View>

                          <View className="flex-row items-center justify-between mt-2">
                            <View className="flex-row items-center">
                              <Ionicons name="people" size={14} color="#6B7280" />
                              <Text className="text-gray-500 text-xs ml-1">
                                {game.player_min}-{game.player_max}
                              </Text>
                            </View>
                            <View className="flex-row items-center">
                              <Ionicons name="time" size={14} color="#6B7280" />
                              <Text className="text-gray-500 text-xs ml-1">
                                {game.duree} min
                              </Text>
                            </View>
                            <View className="bg-purple-100 px-3 py-1 rounded-full">
                              <Text className="text-purple-600 text-xs font-medium">
                                {game.age_min}+ ans
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

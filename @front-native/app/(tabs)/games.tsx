import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { GameCard, Game } from '@/components/games';
import AppHeader from '@/components/AppHeader';
import { useFamilyStore, TransformedGame } from '@/stores/familyStore';

export default function GamesScreen() {
  const { fetchFamily, getTransformedGames, isLoading } = useFamilyStore();
  const [games, setGames] = useState<TransformedGame[]>([]);

  useEffect(() => {
    // Charger les jeux au montage
    const loadGames = async () => {
      await fetchFamily();
      const transformedGames = getTransformedGames();
      setGames(transformedGames);
    };

    loadGames();
  }, []);

  // Mettre à jour les jeux quand le store change
  useEffect(() => {
    const transformedGames = getTransformedGames();
    setGames(transformedGames);
  }, [getTransformedGames]);

  const handleGamePress = (game: TransformedGame) => {
    console.log('Jeu sélectionné:', game.titre);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <AppHeader title="Ma collection de jeux" showBackButton={false} />
      <ScrollView className="flex-1">
        <View className="p-5">
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-4 text-gray-600">Chargement des jeux...</Text>
            </View>
          ) : games.length === 0 ? (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-gray-500">Aucun jeu dans votre collection</Text>
            </View>
          ) : (
            <View>
              {games.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game}
                  onPress={handleGamePress}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

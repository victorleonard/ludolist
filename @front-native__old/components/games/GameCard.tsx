import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StarRating } from './StarRating';
import { Badge } from './Badge';
import type { TransformedGame } from '@/stores/familyStore';

export interface Game extends TransformedGame {
  rating?: number;
  topWinner?: {
    username: string;
    wins: number;
  } | null;
}

interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const router = useRouter();

  // Calculer la note moyenne à partir des ratings
  const averageRating = game.ratings && game.ratings.length > 0
    ? game.ratings.reduce((acc, r) => acc + r.rating, 0) / game.ratings.length
    : 0;

  const handlePress = () => {
    if (onPress) {
      onPress(game);
    }
    router.push(`/games/${game.id}`);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg mb-4 border border-gray-200"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="p-4">
        <View className="flex-row items-start gap-4">
          {/* Image du jeu - petite et carrée à gauche */}
          <View className="w-24 h-24 rounded-lg bg-gray-100 justify-center items-center overflow-hidden shrink-0">
            {game.image ? (
              <Image
                source={{ uri: game.image }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="dice-outline" size={32} color="#9CA3AF" />
            )}
          </View>

          {/* Contenu à droite */}
          <View className="flex-1 min-w-0">
            {/* Titre */}
            <View className="mb-2">
              <Text className="text-lg font-semibold text-gray-900" numberOfLines={2}>
                {game.titre}
              </Text>
            </View>

            {/* Rating */}
            {averageRating > 0 && (
              <View className="flex-row items-center gap-2 mb-2">
                <StarRating rating={averageRating} size={14} />
              </View>
            )}

            {/* Top Winner */}
            {game.topWinner && (
              <View className="flex-row items-center gap-1 mb-2">
                <Ionicons name="trophy" size={12} color="#EAB308" />
                <Text className="text-xs font-bold text-yellow-600">
                  {game.topWinner.username} ({game.topWinner.wins})
                </Text>
              </View>
            )}

            {/* Badges (Âge et tags) */}
            <View className="flex-row flex-wrap gap-2 mt-3">
              <Badge variant="neutral">
                {game.age_min}{game.age_max ? `-${game.age_max}` : '+'} ans
              </Badge>
              {game.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant={tag.includes('joueurs') ? 'info' : 'primary'}
                >
                  {tag}
                </Badge>
              ))}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

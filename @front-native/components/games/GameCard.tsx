import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  // Calculer la note moyenne à partir des ratings
  const averageRating = game.ratings && game.ratings.length > 0
    ? game.ratings.reduce((acc, r) => acc + r.rating, 0) / game.ratings.length
    : 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mb-4 shadow-md"
      onPress={() => onPress?.(game)}
      activeOpacity={0.7}
    >
      <View className="p-4">
        {/* En-tête avec titre */}
        <View className="mb-3">
          <Text className="text-xl font-bold text-gray-900">{game.titre}</Text>
        </View>

        {/* Image du jeu */}
        {game.image ? (
          <Image
            source={{ uri: game.image }}
            className="w-full h-52 rounded-lg bg-gray-200"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-52 rounded-lg bg-gray-200 justify-center items-center">
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}

        {/* Rating */}
        {averageRating > 0 && (
          <View className="mt-3 p-2 bg-blue-50 rounded-lg self-start">
            <StarRating rating={averageRating} size={18} />
          </View>
        )}

        {/* Top Winner */}
        {game.topWinner && (
          <View className="flex-row items-center mt-2 p-2 bg-yellow-50 rounded-lg">
            <Ionicons
              name="trophy"
              size={16}
              color="#F59E0B"
              style={{ marginRight: 6 }}
            />
            <Text className="font-bold text-yellow-700 text-sm">
              {game.topWinner.username} ({game.topWinner.wins}{' '}
              {game.topWinner.wins > 1 ? 'victoires' : 'victoire'})
            </Text>
          </View>
        )}

        {/* Badges (Âge et tags) */}
        <View className="flex-row flex-wrap gap-2 mt-3">
          <Badge 
            label={`${game.age_min}${game.age_max ? `-${game.age_max}` : '+'} ans`}
            backgroundColor="#6B7280"
          />
          {game.tags.map((tag, index) => (
            <Badge
              key={index}
              label={tag}
              backgroundColor={tag.includes('joueurs') ? '#3B82F6' : '#8B5CF6'}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

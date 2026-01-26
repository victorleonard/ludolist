import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StarRating } from './StarRating';
import { Badge } from './Badge';

export interface Game {
  id: number;
  titre: string;
  image: string;
  age_min: number;
  age_max: number | null;
  tags: string[];
  rating: number;
  topWinner: {
    username: string;
    wins: number;
  } | null;
}

interface GameCardProps {
  game: Game;
  onPress?: (game: Game) => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(game)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* En-tête avec titre */}
        <View style={styles.header}>
          <Text style={styles.title}>{game.titre}</Text>
        </View>

        {/* Image du jeu */}
        <Image
          source={{ uri: game.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Rating */}
        {game.rating > 0 && (
          <View style={styles.ratingContainer}>
            <StarRating rating={game.rating} size={18} />
          </View>
        )}

        {/* Top Winner */}
        {game.topWinner && (
          <View style={styles.winnerContainer}>
            <Ionicons
              name="trophy"
              size={16}
              color="#F59E0B"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.winnerText}>
              {game.topWinner.username} ({game.topWinner.wins}{' '}
              {game.topWinner.wins > 1 ? 'victoires' : 'victoire'})
            </Text>
          </View>
        )}

        {/* Badges (Âge et tags) */}
        <View style={styles.badgesContainer}>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  ratingContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  winnerText: {
    fontWeight: 'bold',
    color: '#D97706',
    fontSize: 13,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
});

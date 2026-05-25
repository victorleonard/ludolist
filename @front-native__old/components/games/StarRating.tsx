import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 16 }: StarRatingProps) {
  return (
    <View className="flex-row items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={rating >= star ? 'star' : 'star-outline'}
          size={size}
          color={rating >= star ? '#FDB022' : '#9CA3AF'}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );
}

import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InteractiveStarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export function InteractiveStarRating({ 
  rating, 
  onRatingChange, 
  size = 32,
  readonly = false 
}: InteractiveStarRatingProps) {
  const handlePress = (star: number) => {
    if (readonly || !onRatingChange) return;
    onRatingChange(star);
  };

  return (
    <View className="flex-row items-center justify-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const StarComponent = readonly ? View : TouchableOpacity;
        return (
          <StarComponent
            key={star}
            onPress={() => handlePress(star)}
            className="px-1"
          >
            <Ionicons
              name={rating >= star ? 'star' : 'star-outline'}
              size={size}
              color={rating >= star ? '#FDB022' : '#9CA3AF'}
            />
          </StarComponent>
        );
      })}
    </View>
  );
}

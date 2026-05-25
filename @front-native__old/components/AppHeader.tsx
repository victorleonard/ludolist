import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function AppHeader({ 
  title, 
  showBackButton = true,
  onBackPress,
  rightComponent 
}: AppHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  leftContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  backButton: {
    padding: 8,
  },
});

import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function GamesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        gestureDirection: 'horizontal',
        contentStyle: { backgroundColor: '#f9fafb' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}

import { View, Text } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-700',
    info: 'bg-cyan-100 text-cyan-700',
    neutral: 'bg-gray-200 text-gray-700',
  };

  const variantClass = variantClasses[variant];

  return (
    <View className={`px-2.5 py-1.5 rounded-md ${variantClass.split(' ')[0]}`}>
      <Text className={`text-xs font-medium ${variantClass.split(' ')[1]}`}>
        {children}
      </Text>
    </View>
  );
}

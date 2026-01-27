import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
}

export function Badge({ 
  label, 
  backgroundColor = '#6B7280',
  textColor = '#FFFFFF'
}: BadgeProps) {
  return (
    <View 
      className="px-2.5 py-1.5 rounded-md"
      style={{ backgroundColor }}
    >
      <Text 
        className="text-xs font-medium"
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}

import { View, Text, StyleSheet } from 'react-native';

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
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

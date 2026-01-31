import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface Tab {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface TabsProps {
  tabs: Tab[];
  children: React.ReactNode;
  defaultTab?: string;
}

export function Tabs({ tabs, children, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  return (
    <View className="flex-1">
      {/* Tab Headers */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-row items-center px-4 py-3 border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? '#3B82F6' : '#9CA3AF'}
              />
              {tab.label && (
                <Text
                  className={`ml-2 font-medium ${
                    activeTab === tab.key
                      ? 'text-blue-500'
                      : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {children}
      </View>
    </View>
  );
}

interface TabPanelProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
}

export function TabPanel({ value, activeValue, children }: TabPanelProps) {
  if (value !== activeValue) return null;
  return <View className="flex-1">{children}</View>;
}

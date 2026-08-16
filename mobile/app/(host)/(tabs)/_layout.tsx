import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';

import { colors } from '@/theme/colors';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View className="items-center gap-0.5">
      <Ionicons name={name} size={20} color={color} />
      {focused ? (
        <View className="h-1 w-1 rounded-full bg-brand" />
      ) : (
        <View className="h-1 w-1" />
      )}
    </View>
  );
}

export default function HostTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.DEFAULT,
        tabBarInactiveTintColor: colors.ink.soft,
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          lineHeight: 16,
        },
        tabBarStyle: {
          backgroundColor: colors.surface.DEFAULT,
          borderTopColor: '#F5F5F5',
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'calendar' : 'calendar-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Propriedades',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'business' : 'business-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

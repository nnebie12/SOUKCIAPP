import { Tabs } from 'expo-router';
import { House, Search, Heart, User, Map } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.border.light,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ size, color }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
          tabBarIcon: ({ size, color }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

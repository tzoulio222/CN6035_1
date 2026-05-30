import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Film, Ticket, User } from 'lucide-react-native';
import { Colors } from '../../src/components/ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22d3ee', // Cyan 400
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: 'rgba(6, 8, 20, 0.75)',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
          paddingHorizontal: 24,
          position: 'absolute',
          bottom: 28,
          left: 28,
          right: 28,
          borderRadius: 36,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.6,
          shadowRadius: 30,
          elevation: 30,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '900',
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center rounded-2xl ${focused ? 'bg-cyan-400/10' : ''} p-2`}>
              <Film color={color} size={focused ? 22 : 20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center rounded-2xl ${focused ? 'bg-cyan-400/10' : ''} p-2`}>
              <Ticket color={color} size={focused ? 22 : 20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Member',
          tabBarIcon: ({ color, size, focused }) => (
            <View className={`items-center justify-center rounded-2xl ${focused ? 'bg-cyan-400/10' : ''} p-2`}>
              <User color={color} size={focused ? 22 : 20} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}



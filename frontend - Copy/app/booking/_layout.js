import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#050816' },
        headerShadowVisible: false,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF', fontWeight: '700' },
        contentStyle: { backgroundColor: '#050816' },
      }}
    >
      <Stack.Screen
        name="[showId]"
        options={{
          title: 'Showtimes',
        }}
      />
    </Stack>
  );
}

import React from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Ticket, Trash2, Sparkles } from 'lucide-react-native';
import apiClient from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { EmptyState, ScreenShell, StatCard, Colors } from '../../src/components/ui';
import { formatCurrency, formatShortDateTime } from '../../src/lib/format';

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const res = await apiClient.get('/api/user/reservations');
      return res.data.data;
    },
    enabled: !!user,
  });

  // Διαγραφή κράτησης από το backend και ανανέωση της λίστας.
  const cancelMutation = useMutation({
    mutationFn: async (id) => apiClient.delete(`/api/reservations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      Alert.alert('Booking Deleted', 'Your reservation entry has been removed.');
    },
    onError: (error) => {
      Alert.alert('Delete Failed', error.response?.data?.message || 'Unable to delete this booking.');
    },
  });

  const handleCancel = (id) => {
    // Επιβεβαίωση πριν τη διαγραφή για να αποφεύγονται λάθη.
    Alert.alert('Delete Booking', 'Are you sure you want to delete this reservation?', [
      { text: 'Keep Booking', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => cancelMutation.mutate(id),
      },
    ]);
  };

  if (!user) {
    return (
      <ScreenShell variant="dark" padded={false}>
        <View className="flex-1 justify-center px-6">
          <EmptyState
            title="Vault Encryption"
            description="Identification Required. Secure your session to synchronize your portfolio and manage active slots."
            actionLabel="Initialize Login"
            onAction={() => router.push('/(auth)/login')}
          />
        </View>
      </ScreenShell>
    );
  }

  const reservationsList = reservations || [];
  const upcomingCount = reservationsList.filter((item) => item.can_modify).length;

  return (
    <ScreenShell variant="dark" padded={false}>
      <FlatList
        data={reservationsList}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isLoading || isFetching} onRefresh={refetch} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 160, paddingTop: 40 }}
        ListHeaderComponent={
          <View className="px-6 mb-12">
            <View className="flex-row items-center mb-4">
               <View className="h-4 w-1 bg-cyan-400 mr-3 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
               <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Secure Portfolio</Text>
            </View>
            <Text className="text-7xl font-black tracking-tighter text-white leading-[0.85] mb-12">
              Reserved.
            </Text>
            <Text className="mb-10 max-w-[320px] text-sm font-medium leading-6 text-slate-400">
              Only future bookings can be deleted. Use the red action on each booking card.
            </Text>

            <View className="flex-row gap-5">
              <StatCard
                label="Portfolio Total"
                value={reservationsList.length}
                icon={Ticket}
                accentColor={Colors.primary}
              />
              <StatCard
                label="Active Slots"
                value={upcomingCount}
                icon={Sparkles}
                accentColor={Colors.secondary}
              />
            </View>
          </View>
        }
        ListEmptyComponent={() =>
          isLoading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View className="px-6">
              <EmptyState
                title="Portfolio Empty"
                description="Your cinematic history is currently waiting for content. Initialize a booking via the Browse network."
                actionLabel="Explore Network"
                onAction={() => router.push('/(tabs)')}
              />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View className="mx-6 mb-10 overflow-hidden rounded-[48px] border border-white/5 bg-white/[0.01] p-10 shadow-2xl">
            <View className="flex-row items-start justify-between mb-8">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-4">
                  <MapPin size={12} color={Colors.primary} />
                  <Text className="ml-2 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    {item.theatre_name}
                  </Text>
                </View>
                <Text className="text-3xl font-black text-white tracking-tighter leading-none">{item.show_title}</Text>
              </View>

              <View className={`rounded-xl px-4 py-2 border ${
                item.can_modify 
                  ? 'border-cyan-400/20 bg-cyan-400/5' 
                  : 'border-white/5 bg-white/5'
              }`}>
                <Text className={`text-[9px] font-black uppercase tracking-widest ${
                  item.can_modify ? 'text-cyan-400' : 'text-slate-500'
                }`}>
                  {item.can_modify ? 'Live' : 'Purged'}
                </Text>
              </View>
            </View>

              <View className="flex-row items-center justify-between py-8 border-y border-white/5 mb-8">
                <View>
                  <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Schedule</Text>
                  <Text className="text-lg font-black text-white">{formatShortDateTime(item.start_time)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Grid</Text>
                  <Text className="text-lg font-black text-cyan-400">{item.seat_number}</Text>
                </View>
              </View>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className={`h-2.5 w-2.5 rounded-full mr-3 ${item.status === 'confirmed' ? 'bg-cyan-400' : 'bg-violet-500'}`} />
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</Text>
              </View>
              <Text className={`text-[10px] font-black uppercase tracking-widest ${item.status !== 'cancelled' ? 'text-cyan-400' : 'text-slate-500'}`}>
                {item.status !== 'cancelled' ? 'Deletable' : 'Deleted'}
              </Text>
            </View>

            <TouchableOpacity
              disabled={item.status === 'cancelled' || cancelMutation.isPending}
              onPress={() => handleCancel(item.id)}
              className={`h-14 flex-row items-center justify-center rounded-2xl border ${
                item.status !== 'cancelled'
                  ? 'border-rose-500/30 bg-rose-500/10'
                  : 'border-white/5 bg-white/5 opacity-40'
              }`}
            >
              <Trash2 size={18} color={item.status !== 'cancelled' ? '#fb7185' : '#64748b'} />
              <Text className={`ml-3 text-sm font-black uppercase tracking-[0.2em] ${
                item.status !== 'cancelled' ? 'text-rose-300' : 'text-slate-500'
              }`}>
                {item.status !== 'cancelled' ? 'Delete Booking' : 'Deleted'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenShell>
  );
}

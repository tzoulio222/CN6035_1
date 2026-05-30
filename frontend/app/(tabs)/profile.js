import React from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Bell, BadgePercent, ChevronRight, LogOut, Settings, Shield, User, Ticket, Sparkles } from 'lucide-react-native';
import apiClient from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { EmptyState, ScreenShell, StatCard, Colors } from '../../src/components/ui';
import { formatCurrency, formatShortDateTime } from '../../src/lib/format';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const res = await apiClient.get('/api/user/reservations');
      return res.data.data;
    },
    enabled: !!user,
  });

  const activeReservations = (reservations || []).filter((item) => item.status !== 'cancelled');
  const upcomingReservations = activeReservations.filter((item) => item.is_future);
  const totalSpend = activeReservations.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const recentReservation = reservations?.[0];

  const handleLogout = () => {
    Alert.alert('Terminate Session', 'Are you sure you want to end your secure connection?', [
      { text: 'Keep Session', style: 'cancel' },
      {
        text: 'Terminate',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ScreenShell variant="dark" padded={false}>
        <View className="flex-1 justify-center px-6">
          <EmptyState
            title="Session Missing"
            description="Access exclusive member-only nodes. Identify via the portal to synchronize your portfolio."
            actionLabel="Portal Access"
            onAction={() => router.push('/(auth)/login')}
          />
        </View>
      </ScreenShell>
    );
  }

  const ProfileItem = ({ icon: Icon, label, onPress, destructive = false }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`flex-row items-center rounded-2xl border px-6 py-5 mb-4 ${
        destructive ? 'border-violet-500/20 bg-violet-500/5' : 'border-white/5 bg-white/[0.01]'
      }`}
    >
      <View className={`rounded-xl p-3 ${destructive ? 'bg-violet-500/10' : 'bg-white/5'}`}>
        <Icon size={18} color={destructive ? '#8b5cf6' : Colors.primary} />
      </View>
      <Text className={`ml-4 flex-1 text-base font-black tracking-tight ${destructive ? 'text-violet-400' : 'text-slate-100'}`}>{label}</Text>
      {!destructive ? <ChevronRight size={18} color="#334155" /> : null}
    </TouchableOpacity>
  );

  return (
    <ScreenShell variant="dark" padded={false}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 160, paddingTop: 40 }}>
        <View className="px-6 mb-10">
          <View className="flex-row items-center mb-4">
             <View className="h-4 w-1 bg-cyan-400 mr-3 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
             <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Node Identity</Text>
          </View>
          <Text className="text-7xl font-black tracking-tighter text-white leading-[0.85] mb-12">
            Member.
          </Text>

          <View className="items-center mb-10 overflow-hidden rounded-[56px] border border-white/5 bg-white/[0.01] p-12 shadow-2xl">
            <View 
              className="h-28 w-28 items-center justify-center rounded-[32px] shadow-[0_15px_40px_rgba(34,211,238,0.3)]"
              style={{ backgroundColor: Colors.primary }}
            >
              <Text className="text-5xl font-black text-[#0b0e23]">{user.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
            </View>
            <Text className="mt-8 text-4xl font-black text-white tracking-tighter leading-none">{user.name}</Text>
            <Text className="mt-2 text-base text-slate-500 font-bold">{user.email}</Text>
          </View>

          <View className="flex-row gap-5 mb-8">
            <StatCard
              label="Active Nodes"
              value={isLoading ? '...' : activeReservations.length}
              icon={Ticket}
              accentColor={Colors.primary}
            />
            <StatCard
              label="Upcoming"
              value={isLoading ? '...' : upcomingReservations.length}
              icon={Sparkles}
              accentColor={Colors.secondary}
            />
          </View>

          <View className="rounded-[32px] border border-cyan-400/10 bg-cyan-400/5 p-8 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <BadgePercent size={22} color={Colors.primary} />
              </View>
              <View className="ml-4">
                <Text className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.2em] mb-1">Portfolio Value</Text>
                <Text className="text-2xl font-black text-white tracking-tighter">{formatCurrency(totalSpend)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 mb-10">
          <Text className="mb-6 ml-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Activity</Text>
          {recentReservation ? (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/bookings')}
              className="bg-white/[0.01] p-10 rounded-[48px] border border-white/5 shadow-xl"
            >
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-1 pr-4">
                  <Text className="text-2xl font-black text-white tracking-tighter leading-none">{recentReservation.show_title}</Text>
                  <Text className="mt-2 text-sm text-slate-500 font-bold">{formatShortDateTime(recentReservation.start_time)}</Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 shadow-lg shadow-cyan-400/20">
                  <ChevronRight size={22} color="#0b0e23" />
                </View>
              </View>
              <View className="flex-row items-center justify-between pt-6 border-t border-white/5">
                <Text className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Grid {recentReservation.seat_number}</Text>
                <View className="rounded-full bg-cyan-400/10 px-3 py-1 border border-cyan-400/20">
                   <Text className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Active Node</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="px-4 py-8 bg-white/[0.01] rounded-[32px] border border-white/5 items-center">
              <Text className="text-sm text-slate-600 font-bold">No activity detected on this node.</Text>
            </View>
          )}
        </View>

        <View className="px-6 mb-10">
          <Text className="mb-6 ml-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Encryption & Nodes</Text>
          <View>
            <ProfileItem icon={Settings} label="Identity Config" />
            <ProfileItem icon={Bell} label="Comms Channel" />
            <ProfileItem icon={Shield} label="Security Protocol" />
            <ProfileItem icon={LogOut} label="Purge Session" destructive onPress={handleLogout} />
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')} 
          className="mx-12 h-[64px] items-center justify-center rounded-2xl border border-white/10 bg-white/5"
        >
          <Text className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Return to Grid</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenShell>
  );
}

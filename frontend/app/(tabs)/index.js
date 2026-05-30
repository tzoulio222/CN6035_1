import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ChevronRight, MapPin, Film, Ticket, Clock, Sparkles, Search } from 'lucide-react-native';
import apiClient from '../../src/api/client';
import { EmptyState, Pill, ScreenShell, StatCard, Colors, InputField } from '../../src/components/ui';

export default function BrowseScreen() {
  const router = useRouter();
  const [selectedTheatreId, setSelectedTheatreId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: theatres, isLoading: loadingTheatres } = useQuery({
    queryKey: ['theatres'],
    queryFn: async () => {
      const res = await apiClient.get('/api/theatres');
      return res.data.data;
    },
  });

  const { data: shows, isLoading: loadingShows, refetch } = useQuery({
    queryKey: ['shows', selectedTheatreId, searchQuery],
    queryFn: async () => {
      const params = {};
      if (selectedTheatreId !== 'all') params.theatreId = selectedTheatreId;
      if (searchQuery) params.title = searchQuery;
      
      const res = await apiClient.get('/api/shows', { params });
      return res.data.data;
    },
  });

  const { data: overview } = useQuery({
    queryKey: ['overview'],
    queryFn: async () => {
      const res = await apiClient.get('/api/overview');
      return res.data.data;
    },
  });

  const featuredShow = useMemo(() => shows?.[0], [shows]);
  const loading = loadingShows || loadingTheatres;

  return (
    <ScreenShell variant="dark" padded={false}>
      <FlatList
        data={shows || []}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loadingShows} onRefresh={refetch} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <View>
            {featuredShow ? (
              <View className="mb-12">
                <ImageBackground
                  source={{ uri: featuredShow.image_url }}
                  resizeMode="cover"
                  className="h-[680px] w-full"
                >
                  <View className="flex-1 justify-end bg-gradient-to-t from-[#0b0e23] via-[#0b0e23]/40 to-transparent p-8 pb-16">
                    <View className="mb-6 flex-row items-center">
                       <View className="h-2 w-2 rounded-full bg-cyan-400 mr-3 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                       <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Featured Experience</Text>
                    </View>
                    <Text className="text-7xl font-black leading-[0.9] tracking-tighter text-white">
                      {featuredShow.title}
                    </Text>
                    <View className="mt-6 flex-row items-center">
                       <MapPin size={14} color="#64748b" />
                       <Text className="ml-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        {featuredShow?.theatre_name}
                      </Text>
                    </View>
                    <Text className="mt-8 text-lg font-medium leading-7 text-slate-300" numberOfLines={3}>
                      {featuredShow.description}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => router.push(`/booking/${featuredShow.id}`)}
                      className="mt-10 h-[72px] flex-row items-center justify-center rounded-2xl bg-cyan-400 px-10 shadow-[0_15px_40px_rgba(34,211,238,0.3)]"
                    >
                      <Sparkles size={20} color="#0b0e23" />
                      <Text className="ml-3 text-lg font-black uppercase tracking-[0.2em] text-[#0b0e23]">
                        Reserve Entry
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </View>
            ) : null}

            <View className="px-6">
              <View className="mb-10 flex-row gap-5">
                <StatCard
                  label="Stages"
                  value={overview?.counts?.theatres ?? theatres?.length ?? 0}
                  icon={MapPin}
                  accentColor={Colors.primary}
                />
                <StatCard
                  label="Available"
                  value={overview?.counts?.shows ?? shows?.length ?? 0}
                  icon={Film}
                  accentColor={Colors.secondary}
                />
              </View>

              <View className="mb-6">
                <InputField
                  placeholder="Search titles or studios..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  icon={Search}
                />
              </View>

              <View className="mb-12">
                <Text className="mb-6 ml-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  Studio Network
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 40 }}>
                  <Pill
                    label="All Stages"
                    active={selectedTheatreId === 'all'}
                    onPress={() => setSelectedTheatreId('all')}
                  />
                  {theatres?.map((theatre) => (
                    <TouchableOpacity
                      key={theatre.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedTheatreId(theatre.id)}
                      className={`mr-4 flex-row items-center rounded-2xl border px-6 py-4 ${
                        selectedTheatreId === theatre.id 
                          ? 'border-cyan-400/50 bg-cyan-400 shadow-xl shadow-cyan-400/20' 
                          : 'border-white/5 bg-white/5'
                      }`}
                    >
                      <Text className={`text-sm font-black tracking-tight ${selectedTheatreId === theatre.id ? 'text-slate-950' : 'text-slate-400'}`}>
                        {theatre.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text className="mb-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">
                Live Selection.
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-20">
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View className="px-6">
              <EmptyState
                icon={Film}
                title="Curtains Closed"
                description="Our rotation is currently being updated with new premium screenings. Please check back shortly."
                actionLabel="Refresh View"
                onAction={() => setSelectedTheatreId('all')}
              />
            </View>
          )
        }
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => router.push(`/booking/${item.id}`)}
              className="mx-6 mb-10 overflow-hidden rounded-[40px] border border-white/5 bg-white/[0.01] shadow-2xl"
            >
              <ImageBackground
                source={{ uri: item.image_url }}
                resizeMode="cover"
                className="h-[420px]"
              >
                <View className="flex-1 justify-end bg-gradient-to-t from-[#0b0e23] via-transparent to-transparent p-10">
                  <View className="flex-row items-center justify-between mb-5">
                    <View className="rounded-xl bg-cyan-400 px-4 py-2">
                      <Text className="text-[9px] font-black text-[#0b0e23] uppercase tracking-[0.1em]">{item.theatre_name}</Text>
                    </View>
                    <View className="bg-white/10 rounded-xl px-3 py-1.5 border border-white/10 backdrop-blur-sm">
                      <Text className="text-[9px] font-black text-white uppercase tracking-widest">{item.age_rating || 'PG-13'}</Text>
                    </View>
                  </View>
                  <Text className="text-5xl font-black text-white tracking-tighter leading-none">{item.title}</Text>
                </View>
              </ImageBackground>
              <View className="p-8 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/5">
                    <Clock size={22} color={Colors.primary} />
                  </View>
                  <View className="ml-5">
                    <Text className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Runtime</Text>
                    <Text className="text-lg font-black text-white">{item.duration ? `${item.duration}m` : '120m'}</Text>
                  </View>
                </View>
                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 shadow-lg shadow-cyan-400/20">
                  <ChevronRight size={24} color="#0b0e23" />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenShell>
  );
}

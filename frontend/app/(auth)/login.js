import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LockKeyhole, Mail, Sparkles, Ticket } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import apiClient from '../../src/api/client';
import { PrimaryButton, ScreenShell, SurfaceCard, InputField, Colors } from '../../src/components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Protocol Error', 'Identity credentials must be established to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/api/login', { email, password });
      await setSession(res.data);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Authentication Failed', error.response?.data?.message || 'Access denied. Security key invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell variant="dark" padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 60, paddingTop: 40 }}
        >
          <View className="mb-12 items-center px-10">
            <View className="mb-6 flex-row items-center">
               <View className="h-4 w-1 bg-cyan-400 mr-3 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
               <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Security Gateway</Text>
            </View>
            <View
              className="mb-8 h-24 w-24 items-center justify-center rounded-[32px] shadow-[0_15px_40px_rgba(34,211,238,0.3)]"
              style={{ backgroundColor: Colors.primary }}
            >
              <Ticket size={48} color="#0b0e23" />
            </View>
            <Text className="text-7xl font-black tracking-tighter text-white leading-[0.85]">StageLine</Text>
            <Text className="mt-6 max-w-[280px] text-center text-lg font-medium leading-7 text-slate-400">
              The world's premier cinematic network. Initialize your session.
            </Text>
          </View>

          <View className="px-6 mb-10">
            <SurfaceCard glass className="p-10">
              <View className="mb-10 flex-row items-center rounded-2xl border border-white/5 bg-white/5 p-5">
                <View className="mr-5 h-12 w-12 items-center justify-center rounded-xl bg-cyan-400">
                  <LockKeyhole size={24} color="#0b0e23" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-black text-white tracking-tight">Identity Node</Text>
                  <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Verification</Text>
                </View>
              </View>

              <InputField
                label="Identity Channel (Email)"
                icon={Mail}
                placeholder="node@network.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <InputField
                label="Security Key (Password)"
                icon={LockKeyhole}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View className="mt-8">
                <PrimaryButton label="Establish Link" loading={loading} onPress={handleLogin} />
              </View>

              <View className="mt-10 flex-row items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6">
                <Sparkles size={20} color={Colors.primary} />
                <Text className="ml-4 flex-1 text-xs font-bold leading-5 text-slate-400">
                  Network Tip: Use the default demo node for immediate exploratory access.
                </Text>
              </View>
            </SurfaceCard>
          </View>

          <View className="flex-row items-center justify-center">
            <Text className="text-base font-medium text-slate-500">New Participant? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-base font-black text-cyan-400">Register Identity</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

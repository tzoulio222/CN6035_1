import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LockKeyhole, Mail, Sparkles, Ticket, User } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import apiClient from '../../src/api/client';
import { PrimaryButton, ScreenShell, SurfaceCard, InputField, Colors } from '../../src/components/ui';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing details', 'Fill in your name, email, and password to continue.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/api/register', { name, email, password });
      await setSession(res.data);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell variant="dark">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
        >
          <View className="mb-10 items-center">
            <View className="mb-5 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Text className="text-[10px] font-black uppercase tracking-[0.35em] text-rose-200">
                Create account
              </Text>
            </View>
            <View
              className="mb-8 h-24 w-24 items-center justify-center rounded-[32px] border border-rose-300/20 shadow-2xl shadow-rose-500/20"
              style={{ backgroundColor: Colors.secondary }}
            >
              <Ticket size={48} color="#fff1f2" />
            </View>
            <Text className="text-5xl font-black tracking-tighter text-white">Join the Stage</Text>
            <Text className="mt-4 max-w-[300px] text-center text-base font-medium leading-6 text-slate-300">
              Become part of the world's most exclusive cinematic club.
            </Text>
          </View>

          <SurfaceCard glass className="mb-8">
            <View className="mb-10 flex-row items-center rounded-[32px] border border-white/10 bg-white/5 p-5">
              <View className="mr-5 h-14 w-14 items-center justify-center rounded-2xl bg-rose-400 shadow-lg shadow-rose-500/20">
                <Sparkles size={24} color="#fff1f2" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-black text-white">New Profile</Text>
                <Text className="text-sm font-medium text-slate-300">Unlock premium screenings.</Text>
              </View>
            </View>

            <InputField
              label="Full Name"
              icon={User}
              placeholder="Alex Smith"
              value={name}
              onChangeText={setName}
            />

            <InputField
              label="Email"
              icon={Mail}
              placeholder="alex@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <InputField
              label="Password"
              icon={LockKeyhole}
              placeholder="Choose a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View className="mt-6">
              <PrimaryButton
                label="Create Profile"
                loading={loading}
                onPress={handleSignup}
                color={Colors.secondary}
              />
            </View>
          </SurfaceCard>

          <View className="flex-row items-center justify-center">
            <Text className="text-lg font-medium text-slate-400">Already a member? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-lg font-black text-rose-200">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

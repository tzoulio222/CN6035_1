import React from 'react';
import { Pressable, Text, View, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Colors = {
  primary: '#22d3ee', // Electric Cyan
  primaryDark: '#0891b2', 
  secondary: '#8b5cf6', // Aurora Violet
  accent: '#f472b6', // Pink 400
  success: '#2dd4bf', // Teal 400
  bgBase: '#0b0e23', // Midnight Indigo
  bgDeep: '#060814',
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  textMuted: '#94a3b8',
};

export function ScreenShell({ children, padded = true, variant = 'dark', contentClassName = '' }) {
  const isLight = variant === 'light';

  return (
    <View className={`flex-1 ${isLight ? 'bg-slate-50' : 'bg-[#0b0e23]'}`}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} />

      {/* Ατμοσφαιρικό φόντο τύπου aurora */}
      {!isLight && (
        <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
          {/* Κύριες φωτεινές λάμψεις */}
          <View className="absolute -top-[100px] -left-[100px] h-[600px] w-[600px] rounded-full bg-[#22d3ee]/10 blur-[100px]" />
          <View className="absolute top-[20%] -right-[150px] h-[500px] w-[500px] rounded-full bg-[#8b5cf6]/10 blur-[120px]" />
          <View className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-[#f472b6]/5 blur-[80px]" />
          
          {/* Διακριτικές γραμμές βάθους */}
          <View className="absolute top-20 left-0 right-0 h-px bg-white/[0.03]" />
          <View className="absolute bottom-40 left-0 right-0 h-px bg-white/[0.03]" />
        </View>
      )}

      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className={`flex-1 ${padded ? 'px-6' : ''} ${contentClassName}`}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, action, variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <View className="mb-10 px-1">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          {eyebrow ? (
            <View className="mb-4 flex-row items-center">
               <View className="h-4 w-1 bg-cyan-400 mr-3 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
               <Text className={`text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-slate-400' : 'text-cyan-400'}`}>
                {eyebrow}
              </Text>
            </View>
          ) : null}
          <Text className={`text-5xl font-black leading-tight tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
            {title}
          </Text>
        </View>
        {action}
      </View>
      {subtitle ? (
        <Text className={`mt-4 max-w-[540px] text-base font-medium leading-7 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function StatCard({ label, value, icon: Icon, accentColor = Colors.primary, variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <View className={`flex-1 rounded-3xl border p-6 ${
      isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-white/[0.02]'
    }`}>
      <View className="flex-row items-center justify-between mb-6">
        <View className={`h-11 w-11 items-center justify-center rounded-2xl border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          <Icon size={18} color={accentColor} opacity={0.8} />
        </View>
      </View>
      <Text className={`text-3xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>{value}</Text>
      <Text className={`mt-1 text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </Text>
    </View>
  );
}

export function Pill({ label, active = false, onPress, variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }]}
      className={`mr-4 rounded-2xl border px-6 py-4 ${
        active
          ? 'border-cyan-400/50 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
          : isLight ? 'border-slate-200 bg-slate-100' : 'border-white/5 bg-white/5'
      }`}
    >
      <Text className={`text-sm font-black tracking-tight ${active ? 'text-slate-950' : isLight ? 'text-slate-500' : 'text-slate-400'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, disabled = false, loading = false, color = Colors.primary }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: disabled || loading ? '#1e293b' : color,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: disabled || loading ? 0 : 0.3,
          shadowRadius: 15,
          elevation: disabled ? 0 : 10,
        },
      ]}
      className="h-[68px] items-center justify-center rounded-2xl"
    >
      <Text className={`text-base font-black uppercase tracking-[0.2em] ${disabled || loading ? 'text-slate-500' : 'text-slate-950'}`}>
        {loading ? 'Establish Connection...' : label}
      </Text>
    </Pressable>
  );
}

export function InputField({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon: Icon, variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <View className="mb-6">
      {label ? (
        <Text className={`mb-3 ml-2 text-[10px] font-black uppercase tracking-[0.3em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </Text>
      ) : null}
      <View className={`flex-row items-center rounded-2xl border px-5 h-[64px] ${
        isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/[0.01]'
      }`}>
        {Icon ? (
          <View className={`mr-4 h-10 w-10 items-center justify-center rounded-xl ${isLight ? 'bg-white' : 'bg-white/5'}`}>
            <Icon size={18} color={isLight ? '#334155' : Colors.primary} />
          </View>
        ) : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={isLight ? '#94a3b8' : '#334155'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className={`flex-1 text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}
        />
      </View>
    </View>
  );
}

export function SurfaceCard({ children, className = '', noPadding = false, glass = true, variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <View
      className={`overflow-hidden rounded-[40px] border ${
        isLight 
          ? 'border-slate-200 bg-white shadow-sm' 
          : 'border-white/10 bg-white/[0.02] shadow-2xl'
      } ${noPadding ? '' : 'p-8'} ${className}`}
    >
      {children}
    </View>
  );
}

export function EmptyState({ title, description, actionLabel, onAction, icon: Icon, variant = 'dark' }) {
  const isLight = variant === 'light';
  return (
    <View className={`items-center justify-center rounded-[40px] border px-8 py-20 ${
      isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-white/[0.01]'
    }`}>
      <View className={`mb-8 h-24 w-24 items-center justify-center rounded-[32px] border ${
        isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-cyan-400/[0.02]'
      }`}>
        {Icon ? <Icon size={44} color={Colors.primary} /> : <View className="h-12 w-12 rounded-full bg-cyan-400/10" />}
      </View>
      <Text className={`text-center text-3xl font-black tracking-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>{title}</Text>
      <Text className={`mb-12 mt-4 text-center text-base font-medium leading-7 px-4 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
        {description}
      </Text>
      {actionLabel ? (
        <Pressable 
          onPress={onAction} 
          className="rounded-2xl px-12 py-5 shadow-lg shadow-cyan-400/20" 
          style={{ backgroundColor: Colors.primary }}
        >
          <Text className="text-sm font-black uppercase tracking-[0.2em] text-slate-950">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

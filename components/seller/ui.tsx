import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  type RefreshControlProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft } from 'lucide-react-native';

/**
 * Shared pieces for the seller screens.
 *
 * Note on colour: this project's tailwind config remaps `emerald-500`,
 * `green-500` and `orange-500` all to #fa8929, so semantic states are given
 * explicit hex values here rather than relying on those class names.
 */

export const TONE = {
  neutral: { bg: '#f1f5f9', fg: '#64748b' },
  dark: { bg: '#0f172a', fg: '#ffffff' },
  positive: { bg: '#ecfdf5', fg: '#059669' },
  warning: { bg: '#fffbeb', fg: '#d97706' },
  info: { bg: '#eff6ff', fg: '#2563eb' },
  danger: { bg: '#fef2f2', fg: '#dc2626' },
  whatsapp: { bg: '#dcfce7', fg: '#128C7E' },
} as const;

export type ToneName = keyof typeof TONE;

/** Standard screen header with a back button, matching the existing screens. */
export const ScreenHeader = ({
  title,
  subtitle,
  right,
  onBack,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) => {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="bg-white border-b border-gray-100 z-10">
      <View className="px-4 h-16 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack || (() => router.back())}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
          accessibilityLabel="Go back"
        >
          <LucideChevronLeft size={22} color="#0f172a" />
        </TouchableOpacity>

        <View className="flex-1 px-3">
          <Text
            numberOfLines={1}
            className="text-base font-black text-gray-900 uppercase tracking-tight text-center"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mt-0.5"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View className="w-10 h-10 items-center justify-center">{right}</View>
      </View>
    </SafeAreaView>
  );
};

export const Screen = ({
  children,
  refreshControl,
}: {
  children: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}) => (
  <ScrollView
    className="flex-1 bg-surface"
    contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 16 }}
    refreshControl={refreshControl}
  >
    {children}
  </ScrollView>
);

export const StatCard = ({
  label,
  value,
  hint,
  tone = 'light',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'light' | 'dark';
}) => (
  <View
    className={`flex-1 p-4 rounded-2xl border ${
      tone === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    }`}
  >
    <Text
      className={`text-[10px] font-bold uppercase tracking-widest ${
        tone === 'dark' ? 'text-gray-400' : 'text-gray-400'
      }`}
    >
      {label}
    </Text>
    <Text
      numberOfLines={1}
      className={`text-xl font-black mt-1.5 ${
        tone === 'dark' ? 'text-white' : 'text-gray-900'
      }`}
    >
      {value}
    </Text>
    {hint ? (
      <Text
        className={`text-[10px] mt-1 ${tone === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
      >
        {hint}
      </Text>
    ) : null}
  </View>
);

export const Panel = ({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    {(title || action) && (
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </Text>
        {action}
      </View>
    )}
    <View className="p-4">{children}</View>
  </View>
);

export const Pill = ({ label, tone = 'neutral' }: { label: string; tone?: ToneName }) => {
  const colors = TONE[tone];
  return (
    <View className="px-2.5 py-1 rounded-full self-start" style={{ backgroundColor: colors.bg }}>
      <Text
        className="text-[9px] font-bold uppercase tracking-widest"
        style={{ color: colors.fg }}
      >
        {label}
      </Text>
    </View>
  );
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
  <View className="items-center py-10 gap-3">
    {Icon ? (
      <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center">
        <Icon size={22} color="#cbd5e1" />
      </View>
    ) : null}
    <Text className="text-sm font-black text-gray-900 uppercase tracking-tight text-center">
      {title}
    </Text>
    {description ? (
      <Text className="text-xs text-gray-400 text-center leading-relaxed px-6">
        {description}
      </Text>
    ) : null}
    {action}
  </View>
);

export const LoadingState = ({ label = 'Loading' }: { label?: string }) => (
  <View className="flex-1 items-center justify-center py-20 gap-3 bg-surface">
    <ActivityIndicator color="#2563eb" />
    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </Text>
  </View>
);

export const PrimaryButton = ({
  label,
  onPress,
  disabled,
  loading,
  icon: Icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || loading}
    className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl ${
      disabled || loading ? 'bg-gray-200' : 'bg-gray-900'
    }`}
  >
    {loading ? (
      <ActivityIndicator color="#ffffff" size="small" />
    ) : (
      <>
        {Icon ? <Icon size={16} color={disabled ? '#94a3b8' : '#ffffff'} /> : null}
        <Text
          className={`text-xs font-black uppercase tracking-widest ${
            disabled ? 'text-gray-400' : 'text-white'
          }`}
        >
          {label}
        </Text>
      </>
    )}
  </TouchableOpacity>
);

/** Row used by list-style panels. */
export const Row = ({
  title,
  subtitle,
  value,
  valueHint,
  onPress,
  right,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  valueHint?: React.ReactNode;
  onPress?: () => void;
  right?: React.ReactNode;
}) => {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      className="flex-row items-center justify-between gap-3 py-3 border-b border-gray-50"
    >
      <View className="flex-1 min-w-0">
        <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-[11px] text-gray-400 mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-1">
        {value ? <Text className="text-sm font-black text-gray-900">{value}</Text> : null}
        {valueHint}
      </View>
      {right}
    </Wrapper>
  );
};

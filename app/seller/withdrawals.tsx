import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LucideHistory, LucideSmartphone, LucideLandmark } from 'lucide-react-native';
import { apiFetch } from '@/lib/api';
import {
  formatCurrency,
  WITHDRAWAL_METHODS,
  WITHDRAWAL_STATUS,
} from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  Pill,
  EmptyState,
  LoadingState,
  PrimaryButton,
  ToneName,
} from '@/components/seller/ui';

const STATUS_TONES: Record<string, ToneName> = {
  [WITHDRAWAL_STATUS.PENDING]: 'warning',
  [WITHDRAWAL_STATUS.APPROVED]: 'info',
  [WITHDRAWAL_STATUS.PAID]: 'positive',
  [WITHDRAWAL_STATUS.REJECTED]: 'danger',
};

/**
 * Payout requests.
 *
 * Submitting moves the amount out of available and into pending immediately,
 * so the same funds cannot be requested twice. The platform then reviews it.
 */
export default function SellerWithdrawals() {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    amount: '',
    method: WITHDRAWAL_METHODS[0].value,
    accountName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
  });

  const wallet = useQuery({
    queryKey: ['seller', 'wallet'],
    queryFn: () => apiFetch('/api/wallet'),
    retry: false,
  });

  const withdrawals = useQuery({
    queryKey: ['seller', 'withdrawals'],
    queryFn: () => apiFetch('/api/withdrawals'),
    retry: false,
  });

  const method = WITHDRAWAL_METHODS.find((m) => m.value === form.method);
  const isBank = method?.kind === 'bank';
  const currency = wallet.data?.wallet?.currency || 'GHS';
  const minimum = wallet.data?.minWithdrawalAmount ?? 0;

  const submit = async () => {
    setSubmitting(true);
    try {
      const result: any = await apiFetch('/api/withdrawals', {
        method: 'POST',
        body: {
          amount: Number(form.amount),
          method: form.method,
          destination: {
            accountName: form.accountName,
            accountNumber: form.accountNumber,
            bankName: isBank ? form.bankName : null,
            branch: isBank ? form.branch : null,
          },
        },
      });

      Alert.alert(
        'Withdrawal requested',
        `${formatCurrency(result.withdrawal.amount, currency)} is under review.`,
      );
      setForm({ ...form, amount: '' });
      queryClient.invalidateQueries({ queryKey: ['seller', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['seller', 'wallet'] });
    } catch (e: any) {
      Alert.alert('Could not request withdrawal', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (wallet.isLoading) return <LoadingState label="Loading wallet" />;

  const list: any[] = withdrawals.data?.withdrawals || [];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Withdrawals" subtitle="Reviewed by Cartly Hub" />

      <Screen>
        <View className="flex-row gap-3">
          <StatCard
            label="Available"
            value={formatCurrency(wallet.data?.wallet?.availableBalance, currency)}
            tone="dark"
          />
          <StatCard
            label="Pending"
            value={formatCurrency(wallet.data?.wallet?.pendingBalance, currency)}
          />
        </View>

        <Panel title="New withdrawal">
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Amount ({currency}) · min {formatCurrency(minimum, currency)}
              </Text>
              <TextInput
                value={form.amount}
                onChangeText={(amount) => setForm({ ...form, amount })}
                placeholder="0.00"
                placeholderTextColor="#cbd5e1"
                keyboardType="decimal-pad"
                className="px-4 py-4 bg-gray-50 rounded-2xl text-lg font-black text-gray-900"
              />
            </View>

            <View className="gap-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Withdraw to
              </Text>
              <View className="flex-row flex-wrap -m-1">
                {WITHDRAWAL_METHODS.map((entry) => {
                  const active = form.method === entry.value;
                  const Icon = entry.kind === 'bank' ? LucideLandmark : LucideSmartphone;

                  return (
                    <View key={entry.value} className="w-1/2 p-1">
                      <TouchableOpacity
                        onPress={() => setForm({ ...form, method: entry.value })}
                        className={`flex-row items-center gap-2 px-3 py-3 rounded-xl ${
                          active ? 'bg-gray-900' : 'bg-gray-50'
                        }`}
                      >
                        <Icon size={14} color={active ? '#ffffff' : '#64748b'} />
                        <Text
                          numberOfLines={2}
                          className={`flex-1 text-[10px] font-bold uppercase tracking-tight ${
                            active ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          {entry.label}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Account name
              </Text>
              <TextInput
                value={form.accountName}
                onChangeText={(accountName) => setForm({ ...form, accountName })}
                placeholder="Name on the account"
                placeholderTextColor="#cbd5e1"
                className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
              />
            </View>

            <View className="gap-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isBank ? 'Account number' : 'Mobile money number'}
              </Text>
              <TextInput
                value={form.accountNumber}
                onChangeText={(accountNumber) => setForm({ ...form, accountNumber })}
                placeholder={isBank ? '0123456789' : '0241234567'}
                placeholderTextColor="#cbd5e1"
                keyboardType="number-pad"
                className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
              />
            </View>

            {isBank ? (
              <View className="flex-row gap-3">
                <View className="flex-1 gap-2">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Bank
                  </Text>
                  <TextInput
                    value={form.bankName}
                    onChangeText={(bankName) => setForm({ ...form, bankName })}
                    placeholderTextColor="#cbd5e1"
                    className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
                  />
                </View>
                <View className="flex-1 gap-2">
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Branch
                  </Text>
                  <TextInput
                    value={form.branch}
                    onChangeText={(branch) => setForm({ ...form, branch })}
                    placeholderTextColor="#cbd5e1"
                    className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
                  />
                </View>
              </View>
            ) : null}

            <PrimaryButton
              label="Request withdrawal"
              onPress={submit}
              loading={submitting}
              disabled={!form.amount || !form.accountName || !form.accountNumber}
            />
          </View>
        </Panel>

        <Panel title="Your requests">
          {list.length === 0 ? (
            <EmptyState
              icon={LucideHistory}
              title="No withdrawals yet"
              description="Requests appear here with their review status."
            />
          ) : (
            list.map((withdrawal) => (
              <View
                key={withdrawal.id}
                className="flex-row items-start justify-between gap-3 py-3 border-b border-gray-50"
              >
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-bold text-gray-900">
                    {formatCurrency(withdrawal.amount, withdrawal.currency)}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    {withdrawal.methodLabel} · {withdrawal.destination?.accountNumber}
                  </Text>
                  <Text className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(withdrawal.requestedAt).toLocaleDateString()}
                  </Text>
                  {withdrawal.adminNote ? (
                    <Text className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      {withdrawal.adminNote}
                    </Text>
                  ) : null}
                </View>
                <Pill
                  tone={STATUS_TONES[withdrawal.status] || 'neutral'}
                  label={withdrawal.status}
                />
              </View>
            ))
          )}
        </Panel>
      </Screen>
    </KeyboardAvoidingView>
  );
}

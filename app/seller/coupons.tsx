import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LucideTicket, LucidePlus, LucideTrash2, LucideX } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/constants/marketplace';
import { ScreenHeader, Screen, Panel, Pill, EmptyState, LoadingState, PrimaryButton } from '@/components/seller/ui';

const COUPON_TYPES = { PERCENT: 'PERCENT', FIXED: 'FIXED' };

const EMPTY_FORM = { code: '', type: COUPON_TYPES.PERCENT, value: '', minOrderAmount: '', maxUses: '', expiresAt: '' };

type Coupon = {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  minOrderAmount?: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
};

export default function SellerCouponsScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['seller', 'coupons', user?.uid],
    queryFn: async () => (await apiFetch<{ coupons: Coupon[] }>('/api/seller/coupons')).coupons,
    enabled: !!user?.uid,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['seller', 'coupons', user?.uid] });

  const handleCreate = async () => {
    if (!form.code.trim() || !form.value) {
      Alert.alert('Missing fields', 'A code and a discount value are required.');
      return;
    }
    setIsSaving(true);
    try {
      await apiFetch('/api/seller/coupons', {
        method: 'POST',
        body: {
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        },
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      invalidate();
      Alert.alert('Created', `Coupon ${form.code.toUpperCase()} is live.`);
    } catch (error: any) {
      Alert.alert('Could not create coupon', error.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    try {
      await apiFetch(`/api/seller/coupons/${coupon.id}`, { method: 'PATCH', body: { isActive: !coupon.isActive } });
      invalidate();
    } catch (error: any) {
      Alert.alert('Could not update coupon', error.message || 'Something went wrong');
    }
  };

  const handleDelete = (coupon: Coupon) => {
    Alert.alert(`Delete coupon ${coupon.code}?`, "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(`/api/seller/coupons/${coupon.id}`, { method: 'DELETE' });
            invalidate();
          } catch (error: any) {
            Alert.alert('Could not delete coupon', error.message || 'Something went wrong');
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingState label="Loading coupons" />;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Coupons"
        subtitle={`${coupons.length} code${coupons.length === 1 ? '' : 's'}`}
        right={
          <TouchableOpacity onPress={() => setShowForm((v) => !v)}>
            {showForm ? <LucideX size={20} color="#0f172a" /> : <LucidePlus size={20} color="#0f172a" />}
          </TouchableOpacity>
        }
      />
      <Screen>
        <Text className="text-xs text-gray-400 font-medium leading-relaxed -mt-2">
          Discount codes only your store's buyers can use — the cost comes out of your own earnings, not Cartly Hub's
          commission.
        </Text>

        {showForm && (
          <Panel title="Create a coupon">
            <View className="gap-4">
              <FormField label="Code *">
                <TextInput
                  value={form.code}
                  onChangeText={(code) => setForm({ ...form, code: code.toUpperCase() })}
                  placeholder="WELCOME10"
                  autoCapitalize="characters"
                  placeholderTextColor="#94a3b8"
                  className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
                />
              </FormField>

              <FormField label="Discount type *">
                <View className="flex-row gap-2">
                  {(['PERCENT', 'FIXED'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setForm({ ...form, type })}
                      className={`flex-1 py-3 rounded-2xl items-center ${
                        form.type === type ? 'bg-gray-900' : 'bg-gray-50'
                      }`}
                    >
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${form.type === type ? 'text-white' : 'text-gray-500'}`}>
                        {type === 'PERCENT' ? 'Percent off' : 'Fixed (GHS)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </FormField>

              <FormField label={form.type === 'PERCENT' ? 'Percent off *' : 'Amount off (GHS) *'}>
                <TextInput
                  value={form.value}
                  onChangeText={(value) => setForm({ ...form, value })}
                  placeholder={form.type === 'PERCENT' ? '10' : '20'}
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
                />
              </FormField>

              <FormField label="Minimum order (GHS)">
                <TextInput
                  value={form.minOrderAmount}
                  onChangeText={(minOrderAmount) => setForm({ ...form, minOrderAmount })}
                  placeholder="Optional"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
                />
              </FormField>

              <FormField label="Max uses">
                <TextInput
                  value={form.maxUses}
                  onChangeText={(maxUses) => setForm({ ...form, maxUses })}
                  placeholder="Unlimited"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                  className="px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
                />
              </FormField>

              <PrimaryButton label="Create coupon" onPress={handleCreate} loading={isSaving} />
            </View>
          </Panel>
        )}

        <Panel title="Your coupons">
          {coupons.length === 0 ? (
            <EmptyState
              icon={LucideTicket}
              title="No coupons yet"
              description="Create a code and share it with customers — it only discounts orders from your store."
            />
          ) : (
            <View className="gap-3">
              {coupons.map((coupon) => (
                <View key={coupon.id} className="flex-row items-center gap-3 border-b border-gray-50 pb-3">
                  <View className="flex-1 min-w-0">
                    <Text className="text-sm font-black text-gray-900">{coupon.code}</Text>
                    <Text className="text-[11px] text-gray-400 mt-0.5">
                      {coupon.type === 'PERCENT' ? `${coupon.value}% off` : `${formatCurrency(coupon.value)} off`}
                      {coupon.minOrderAmount ? ` · min ${formatCurrency(coupon.minOrderAmount)}` : ''}
                    </Text>
                    <Text className="text-[10px] text-gray-400 mt-0.5">
                      Used {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleToggle(coupon)}>
                    <Pill tone={coupon.isActive ? 'positive' : 'neutral'} label={coupon.isActive ? 'Active' : 'Paused'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(coupon)}
                    className="h-8 w-8 rounded-lg bg-gray-50 items-center justify-center"
                  >
                    <LucideTrash2 size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Panel>
      </Screen>
    </View>
  );
}

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View className="gap-2">
    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</Text>
    {children}
  </View>
);

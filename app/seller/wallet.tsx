import React, { useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LucideReceipt, LucideArrowUpRight } from 'lucide-react-native';
import { apiFetch } from '@/lib/api';
import {
  formatCurrency,
  WALLET_TRANSACTION_LABELS,
} from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  Pill,
  EmptyState,
  LoadingState,
} from '@/components/seller/ui';

/**
 * Vendor wallet.
 *
 * Available is withdrawable now; pending is held against a request the
 * platform is reviewing. Both figures come from the server — the wallet
 * collection is not client-readable except by its owner and is never
 * client-writable.
 */
export default function SellerWallet() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['seller', 'wallet'],
    queryFn: () => apiFetch('/api/wallet'),
    retry: false,
  });

  if (isLoading) return <LoadingState label="Loading wallet" />;

  if (isError) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Wallet" />
        <EmptyState
          icon={LucideReceipt}
          title="Wallet unavailable"
          description={(error as Error)?.message}
        />
      </View>
    );
  }

  const wallet: any = data?.wallet || {};
  const transactions: any[] = data?.transactions || [];
  const currency = wallet.currency || 'GHS';

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Wallet"
        subtitle={`Commission ${data?.commissionPercent ?? 5}%`}
        right={
          <TouchableOpacity onPress={() => router.push('/seller/withdrawals')}>
            <LucideArrowUpRight size={20} color="#0f172a" />
          </TouchableOpacity>
        }
      />

      <Screen
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
          />
        }
      >
        <StatCard
          label="Available balance"
          value={formatCurrency(wallet.availableBalance, currency)}
          hint="Ready to withdraw"
          tone="dark"
        />

        <View className="flex-row gap-3">
          <StatCard
            label="Pending"
            value={formatCurrency(wallet.pendingBalance, currency)}
            hint="Held for a request"
          />
          <StatCard
            label="Total earned"
            value={formatCurrency(wallet.totalEarnings, currency)}
            hint="After commission"
          />
        </View>

        <StatCard
          label="Total withdrawn"
          value={formatCurrency(wallet.totalWithdrawals, currency)}
          hint="Lifetime paid out"
        />

        <TouchableOpacity
          onPress={() => router.push('/seller/withdrawals')}
          className="flex-row items-center justify-center gap-2 bg-gray-900 py-4 rounded-2xl"
        >
          <LucideArrowUpRight size={16} color="#ffffff" />
          <Text className="text-white text-xs font-black uppercase tracking-widest">
            Withdraw funds
          </Text>
        </TouchableOpacity>

        <Panel title="Transaction history">
          {transactions.length === 0 ? (
            <EmptyState
              icon={LucideReceipt}
              title="No transactions yet"
              description="Every paid order and withdrawal appears here with a running balance."
            />
          ) : (
            transactions.map((entry) => {
              const isCredit = entry.direction === 'credit';

              return (
                <View key={entry.id} className="py-3 border-b border-gray-50">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 min-w-0">
                      <Pill
                        tone={isCredit ? 'positive' : 'warning'}
                        label={WALLET_TRANSACTION_LABELS[entry.type] || entry.type}
                      />
                      <Text className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                        {entry.description}
                      </Text>
                      {entry.orderNumber ? (
                        <Text className="text-[10px] text-gray-400 mt-0.5">
                          {entry.orderNumber}
                          {entry.commissionAmount
                            ? ` · commission ${formatCurrency(entry.commissionAmount, currency)}`
                            : ''}
                        </Text>
                      ) : null}
                    </View>

                    <View className="items-end">
                      <Text
                        className="text-sm font-black"
                        style={{ color: isCredit ? '#059669' : '#0f172a' }}
                      >
                        {isCredit ? '+' : '−'}
                        {formatCurrency(entry.amount, currency)}
                      </Text>
                      <Text className="text-[10px] text-gray-400 mt-0.5">
                        bal {formatCurrency(entry.balanceAfter, currency)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Panel>
      </Screen>
    </View>
  );
}

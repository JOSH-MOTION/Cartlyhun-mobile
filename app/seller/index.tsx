import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  LucideShoppingBag,
  LucidePackage,
  LucideBoxes,
  LucideUsers,
  LucideWallet,
  LucideBanknote,
  LucideBell,
  LucideStar,
  LucideBarChart3,
  LucideSettings,
  LucideShieldCheck,
  LucideShieldAlert,
  LucideEye,
  LucideChevronRight,
  LucidePlus,
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { getVendorOrders } from '@/utils/marketplaceData';
import { getSeller } from '@/utils/firebaseData';
import { formatCurrency, PAYMENT_STATUS, SELLING_MODE_OPTIONS } from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  Pill,
  EmptyState,
  LoadingState,
  Row,
} from '@/components/seller/ui';

const SECTIONS = [
  { name: 'Orders', icon: LucideShoppingBag, href: '/seller/orders' },
  { name: 'Products', icon: LucidePackage, href: '/seller/products' },
  { name: 'Inventory', icon: LucideBoxes, href: '/seller/inventory' },
  { name: 'Customers', icon: LucideUsers, href: '/seller/customers' },
  { name: 'Wallet', icon: LucideWallet, href: '/seller/wallet' },
  { name: 'Withdrawals', icon: LucideBanknote, href: '/seller/withdrawals' },
  { name: 'Notifications', icon: LucideBell, href: '/seller/notifications' },
  { name: 'Reviews', icon: LucideStar, href: '/seller/reviews' },
  { name: 'Analytics', icon: LucideBarChart3, href: '/seller/analytics' },
  { name: 'Settings', icon: LucideSettings, href: '/seller/settings' },
];

/** Seller hub: money first, then recent orders, then every other section. */
export default function SellerHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const vendorId = user?.uid;

  const seller = useQuery({
    queryKey: ['seller', 'profile', vendorId],
    queryFn: () => getSeller(vendorId!),
    enabled: !!vendorId,
  });

  const wallet = useQuery({
    queryKey: ['seller', 'wallet'],
    queryFn: () => apiFetch('/api/wallet'),
    enabled: !!vendorId,
    retry: false,
  });

  const orders = useQuery({
    queryKey: ['seller', 'orders', vendorId],
    queryFn: () => getVendorOrders(vendorId),
    enabled: !!vendorId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([seller.refetch(), wallet.refetch(), orders.refetch()]);
    setRefreshing(false);
  }, [seller, wallet, orders]);

  if (seller.isLoading) return <LoadingState label="Loading your store" />;

  const profile: any = seller.data || {};
  const allOrders: any[] = orders.data || [];
  const paidOrders = allOrders.filter((o) => o.paymentStatus === PAYMENT_STATUS.PAID);
  const walletData: any = wallet.data?.wallet;
  const sellingOption = SELLING_MODE_OPTIONS.find((o) => o.value === profile.sellingMode);

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Seller Hub"
        subtitle={profile.storeName || 'Your store'}
        right={
          <TouchableOpacity onPress={() => router.push('/seller/notifications')}>
            <LucideBell size={20} color="#0f172a" />
          </TouchableOpacity>
        }
      />

      <Screen
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Store status */}
        <View className="bg-gray-900 rounded-2xl p-5">
          <View className="flex-row items-center gap-2">
            {profile.isVerified ? (
              <>
                <LucideShieldCheck size={13} color="#6ee7b7" />
                <Text className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Verified merchant
                </Text>
              </>
            ) : (
              <>
                <LucideShieldAlert size={13} color="#fbbf24" />
                <Text className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  Verification pending
                </Text>
              </>
            )}
            <View className="flex-row items-center gap-1 ml-2">
              <LucideEye size={12} color="#9ca3af" />
              <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {profile.storeViews || 0} store views
              </Text>
            </View>
          </View>
          <Text className="text-2xl font-black text-white uppercase tracking-tight mt-2">
            {profile.storeName || 'Vendor account'}
          </Text>
          <Text className="text-[11px] text-gray-400 mt-1">
            Managed by {profile.ownerName || 'Partner'}
          </Text>
        </View>

        {profile.isSuspended ? (
          <View className="bg-red-50 border border-red-100 rounded-2xl p-4">
            <Text className="text-sm font-bold text-red-600">Your store is suspended</Text>
            <Text className="text-[11px] text-red-500 mt-1 leading-relaxed">
              {profile.suspensionReason ||
                'New orders are paused. Contact Cartly Hub support to resolve this.'}
            </Text>
          </View>
        ) : null}

        {/* Money */}
        <View className="flex-row gap-3">
          <StatCard
            label="Wallet"
            value={formatCurrency(walletData?.availableBalance ?? 0)}
            hint="Available"
            tone="dark"
          />
          <StatCard
            label="Pending"
            value={formatCurrency(walletData?.pendingBalance ?? 0)}
            hint="Under review"
          />
        </View>

        <View className="flex-row gap-3">
          <StatCard label="Paid orders" value={paidOrders.length} hint={`${allOrders.length} total`} />
          <StatCard
            label="Earnings"
            value={formatCurrency(walletData?.totalEarnings ?? 0)}
            hint="After commission"
          />
        </View>

        {wallet.isError ? (
          <View className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <Text className="text-[11px] text-amber-800 leading-relaxed">
              Wallet unavailable: {(wallet.error as Error)?.message}
            </Text>
          </View>
        ) : null}

        {/* Recent orders */}
        <Panel
          title="Recent orders"
          action={
            <TouchableOpacity onPress={() => router.push('/seller/orders')}>
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                View all
              </Text>
            </TouchableOpacity>
          }
        >
          {allOrders.length === 0 ? (
            <EmptyState
              icon={LucideShoppingBag}
              title="No orders yet"
              description="Orders appear the moment a customer pays or sends a WhatsApp order."
            />
          ) : (
            allOrders.slice(0, 4).map((order) => (
              <Row
                key={order.id}
                title={order.orderNumber || order.id.slice(0, 8)}
                subtitle={`${order.customerName || 'Guest'} · ${order.createdAt?.toLocaleDateString?.() || ''}`}
                value={formatCurrency(order.totalAmount, order.currency)}
                valueHint={
                  <Pill
                    tone={order.paymentStatus === PAYMENT_STATUS.PAID ? 'positive' : 'warning'}
                    label={order.paymentStatus === PAYMENT_STATUS.PAID ? 'Paid' : 'Unpaid'}
                  />
                }
                onPress={() => router.push(`/seller/orders/${order.id}`)}
              />
            ))
          )}
        </Panel>

        {/* How you sell */}
        <Panel
          title="How you sell"
          action={
            <TouchableOpacity onPress={() => router.push('/seller/settings')}>
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Change
              </Text>
            </TouchableOpacity>
          }
        >
          <Text className="text-sm font-bold text-gray-900">
            {sellingOption?.label || 'Not set'}
          </Text>
          <Text className="text-[11px] text-gray-500 mt-1 leading-relaxed">
            {sellingOption?.summary ||
              'Pick a selling option in Settings so customers know how to buy from you.'}
          </Text>
          <View className="flex-row gap-2 mt-3">
            {profile.onlinePaymentsEnabled ? (
              <Pill
                tone="positive"
                label={`Commission ${wallet.data?.commissionPercent ?? 5}%`}
              />
            ) : null}
            {profile.whatsappNumber ? (
              <Pill tone="whatsapp" label={profile.whatsappNumber} />
            ) : null}
          </View>
        </Panel>

        {/* Sections */}
        <Panel title="All sections">
          <View className="flex-row flex-wrap -m-1">
            {SECTIONS.map((section) => (
              <View key={section.name} className="w-1/2 p-1">
                <TouchableOpacity
                  onPress={() => router.push(section.href as any)}
                  className="bg-gray-50 rounded-xl p-4 gap-2"
                >
                  <section.icon size={18} color="#64748b" />
                  <Text className="text-xs font-bold text-gray-900">{section.name}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Panel>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/sell')}
          className="flex-row items-center justify-between bg-primary rounded-2xl p-5"
        >
          <View className="flex-row items-center gap-3">
            <LucidePlus size={18} color="#ffffff" />
            <View>
              <Text className="text-white font-black uppercase tracking-widest text-xs">
                Add new product
              </Text>
              <Text className="text-white/80 text-[10px] mt-0.5">
                List an item in your inventory
              </Text>
            </View>
          </View>
          <LucideChevronRight size={18} color="#ffffff" />
        </TouchableOpacity>
      </Screen>
    </View>
  );
}

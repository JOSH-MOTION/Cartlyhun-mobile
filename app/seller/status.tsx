import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { LucideClock, LucideImage as LucideImageIcon, LucideTrash2, LucideUpload } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { useUpload } from '@/utils/useUpload';
import { formatCurrency } from '@/constants/marketplace';
import { ScreenHeader, Screen, Panel, EmptyState, LoadingState } from '@/components/seller/ui';

const MAX_ACTIVE = 5;

const timeLeft = (expiresAt: string) => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expiring…';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
};

type Status = {
  id: string;
  image: string;
  caption?: string;
  price?: number;
  expiresAt: string;
};

export default function SellerStatusScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [upload] = useUpload();

  const [pendingImage, setPendingImage] = useState<{ url: string; publicId: string | null } | null>(null);
  const [caption, setCaption] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const { data: statuses = [], isLoading } = useQuery({
    queryKey: ['seller', 'statuses', user?.uid],
    queryFn: async () => (await apiFetch<{ statuses: Status[] }>('/api/seller/status')).statuses,
    enabled: !!user?.uid,
  });

  const activeCount = statuses.filter((s) => new Date(s.expiresAt).getTime() > Date.now()).length;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64) return;

    setIsUploading(true);
    try {
      const asset = result.assets[0];
      const res = await upload({ base64: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` });
      if (res.error) {
        Alert.alert('Upload failed', res.error);
        return;
      }
      setPendingImage({ url: res.url, publicId: res.publicId });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async () => {
    if (!pendingImage) {
      Alert.alert('Add a photo first');
      return;
    }
    setIsPosting(true);
    try {
      await apiFetch('/api/seller/status', {
        method: 'POST',
        body: {
          image: pendingImage.url,
          imagePublicId: pendingImage.publicId,
          caption: caption.trim(),
          price: price ? Number(price) : null,
        },
      });
      setPendingImage(null);
      setCaption('');
      setPrice('');
      queryClient.invalidateQueries({ queryKey: ['seller', 'statuses', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['statuses', 'active'] });
      Alert.alert('Posted', 'Live on the homepage for 24 hours.');
    } catch (error: any) {
      Alert.alert('Failed to post', error.message || 'Something went wrong');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (status: Status) => {
    Alert.alert('Remove this status?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiFetch(`/api/seller/status/${status.id}`, { method: 'DELETE' });
            queryClient.invalidateQueries({ queryKey: ['seller', 'statuses', user?.uid] });
            queryClient.invalidateQueries({ queryKey: ['statuses', 'active'] });
          } catch (error: any) {
            Alert.alert('Failed to remove', error.message || 'Something went wrong');
          }
        },
      },
    ]);
  };

  if (isLoading) return <LoadingState label="Loading statuses" />;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Status" subtitle="24-hour updates" />
      <Screen>
        <Panel title={`Post a status (${activeCount}/${MAX_ACTIVE} active)`}>
          {activeCount >= MAX_ACTIVE ? (
            <Text className="text-xs text-gray-500 font-bold">
              You've hit the {MAX_ACTIVE}-active limit — delete one below or wait for one to expire.
            </Text>
          ) : (
            <View className="gap-4">
              {pendingImage ? (
                <View className="relative w-full h-48">
                  <Image source={{ uri: pendingImage.url }} className="w-full h-full rounded-2xl" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => setPendingImage(null)}
                    className="absolute top-3 right-3 h-8 w-8 bg-black/70 rounded-full items-center justify-center"
                  >
                    <LucideTrash2 size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  disabled={isUploading}
                  className="h-48 rounded-2xl border border-dashed border-gray-200 bg-gray-50 items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <ActivityIndicator color="#2563eb" />
                  ) : (
                    <>
                      <LucideImageIcon size={24} color="#94a3b8" />
                      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add a photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="What's the deal? e.g. 'Just got these in — 3 left'"
                placeholderTextColor="#94a3b8"
                multiline
                className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 h-20"
                textAlignVertical="top"
              />

              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="Price (GHS) — optional"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
              />

              <TouchableOpacity
                onPress={handlePost}
                disabled={isPosting || isUploading || !pendingImage}
                className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl ${
                  isPosting || isUploading || !pendingImage ? 'bg-gray-200' : 'bg-gray-900'
                }`}
              >
                {isPosting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <LucideUpload size={14} color={!pendingImage ? '#94a3b8' : '#ffffff'} />
                    <Text
                      className={`text-xs font-black uppercase tracking-widest ${
                        !pendingImage ? 'text-gray-400' : 'text-white'
                      }`}
                    >
                      Post status
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Panel>

        <Panel title="Your statuses">
          {statuses.length === 0 ? (
            <EmptyState
              icon={LucideClock}
              title="No statuses yet"
              description="Post a photo above — it goes live on the homepage right away."
            />
          ) : (
            <View className="gap-3">
              {statuses.map((status) => {
                const isActive = new Date(status.expiresAt).getTime() > Date.now();
                return (
                  <View key={status.id} className="flex-row items-center gap-3 border-b border-gray-50 pb-3">
                    <View className="w-14 h-16 rounded-xl overflow-hidden bg-gray-100 relative">
                      <Image source={{ uri: status.image }} className="w-full h-full" resizeMode="cover" />
                      {!isActive && (
                        <View className="absolute inset-0 bg-black/50 items-center justify-center">
                          <Text className="text-[7px] font-black uppercase text-white">Expired</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1 min-w-0">
                      {status.caption ? (
                        <Text numberOfLines={1} className="text-xs font-bold text-gray-900">
                          {status.caption}
                        </Text>
                      ) : null}
                      {status.price ? (
                        <Text className="text-[11px] text-gray-400 mt-0.5">{formatCurrency(status.price)}</Text>
                      ) : null}
                      <View className="flex-row items-center gap-1 mt-1">
                        <LucideClock size={10} color="#94a3b8" />
                        <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {isActive ? timeLeft(status.expiresAt) : 'Gone'}
                        </Text>
                      </View>
                    </View>
                    {isActive && (
                      <TouchableOpacity
                        onPress={() => handleDelete(status)}
                        className="h-8 w-8 rounded-lg bg-gray-50 items-center justify-center"
                      >
                        <LucideTrash2 size={14} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </Panel>
      </Screen>
    </View>
  );
}

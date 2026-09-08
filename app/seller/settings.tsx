import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { LucideSave, LucideStore, LucideImage as LucideImageIcon, LucideTrash2 } from 'lucide-react-native';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { getSeller } from '@/utils/firebaseData';
import { apiFetch } from '@/lib/api';
import { useUpload } from '@/utils/useUpload';
import { SELLING_MODES } from '@/constants/marketplace';
import SellingPreferences from '@/components/seller/SellingPreferences';
import {
  ScreenHeader,
  Screen,
  Panel,
  LoadingState,
  PrimaryButton,
} from '@/components/seller/ui';

/**
 * Store settings.
 *
 * The profile fields are a plain Firestore write the vendor is allowed to make
 * on their own `sellers` document. Selling preferences go through the API
 * instead, because the mode/number pairing has to be re-validated server-side
 * and the same rule must hold for web and mobile.
 */
export default function SellerSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [upload] = useUpload();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { data: seller, isLoading, refetch } = useQuery({
    queryKey: ['seller', 'profile', user?.uid],
    queryFn: () => getSeller(user!.uid),
    enabled: !!user?.uid,
  });

  const [form, setForm] = useState({
    storeName: '',
    ownerName: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    region: '',
    storeLogo: '',
    storeBannerImage: '',
  });

  const [preferences, setPreferences] = useState({
    sellingMode: SELLING_MODES.BOTH as string,
    whatsappNumber: '',
  });

  useEffect(() => {
    const profile: any = seller;
    if (!profile) return;

    setForm({
      storeName: profile.storeName || '',
      ownerName: profile.ownerName || '',
      description: profile.description || '',
      contactPhone: profile.contactPhone || '',
      contactEmail: profile.contactEmail || '',
      location: profile.location || '',
      region: profile.region || '',
      storeLogo: profile.storeLogo || '',
      storeBannerImage: profile.storeBannerImage || '',
    });
    setPreferences({
      sellingMode: profile.sellingMode || SELLING_MODES.BOTH,
      whatsappNumber: profile.whatsappNumber || '',
    });
  }, [seller]);

  const saveProfile = async () => {
    if (!form.storeName || !form.ownerName || !form.contactPhone) {
      Alert.alert('Missing fields', 'Store name, owner name and phone are required.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'sellers', user!.uid), {
        ...form,
        updatedAt: Timestamp.now(),
      });
      await refetch();
      Alert.alert('Saved', 'Your store profile has been updated.');
    } catch (e: any) {
      Alert.alert('Could not save', e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const pickBrandImage = async (field: 'storeLogo' | 'storeBannerImage') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64) return;

    const setUploading = field === 'storeLogo' ? setUploadingLogo : setUploadingBanner;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const res = await upload({ base64: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` });
      if (res.error) {
        Alert.alert('Upload failed', res.error);
        return;
      }
      setForm((prev) => ({ ...prev, [field]: res.url }));
    } finally {
      setUploading(false);
    }
  };

  const savePreferences = async () => {
    setSavingPreferences(true);
    try {
      // A stored number is already international; a freshly typed local one
      // still needs its country code.
      const raw = preferences.whatsappNumber.trim();
      const whatsappNumber =
        raw && !raw.startsWith('+') && !raw.startsWith('233') && !raw.startsWith('234')
          ? `+233${raw.replace(/^0+/, '')}`
          : raw;

      await apiFetch('/api/vendor/preferences', {
        method: 'PUT',
        body: { sellingMode: preferences.sellingMode, whatsappNumber },
      });

      await refetch();
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      Alert.alert('Saved', 'Selling preferences updated.');
    } catch (e: any) {
      Alert.alert('Could not save preferences', e.message);
    } finally {
      setSavingPreferences(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading settings" />;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Store Settings" subtitle={form.storeName} />

      <Screen>
        <Panel>
          <SellingPreferences
            value={preferences.sellingMode}
            onChange={(sellingMode) => setPreferences({ ...preferences, sellingMode })}
            whatsappNumber={preferences.whatsappNumber}
            onWhatsappNumberChange={(whatsappNumber) =>
              setPreferences({ ...preferences, whatsappNumber })
            }
            disabled={savingPreferences}
          />
          <View className="h-4" />
          <PrimaryButton
            label="Save preferences"
            icon={LucideSave}
            onPress={savePreferences}
            loading={savingPreferences}
          />
        </Panel>

        <Panel title="Store branding">
          <View className="gap-4">
            <BrandImageField
              label="Store logo"
              value={form.storeLogo}
              uploading={uploadingLogo}
              onPick={() => pickBrandImage('storeLogo')}
              onRemove={() => setForm({ ...form, storeLogo: '' })}
              shape="round"
            />
            <BrandImageField
              label="Store banner"
              value={form.storeBannerImage}
              uploading={uploadingBanner}
              onPick={() => pickBrandImage('storeBannerImage')}
              onRemove={() => setForm({ ...form, storeBannerImage: '' })}
              shape="wide"
            />
            <PrimaryButton
              label="Save branding"
              icon={LucideSave}
              onPress={saveProfile}
              loading={savingProfile}
            />
          </View>
        </Panel>

        <Panel title="Store profile">
          <View className="gap-4">
            <Field
              label="Store name *"
              value={form.storeName}
              onChangeText={(storeName) => setForm({ ...form, storeName })}
            />
            <Field
              label="Owner name *"
              value={form.ownerName}
              onChangeText={(ownerName) => setForm({ ...form, ownerName })}
            />
            <Field
              label="Contact phone *"
              value={form.contactPhone}
              onChangeText={(contactPhone) => setForm({ ...form, contactPhone })}
              keyboardType="phone-pad"
            />
            <Field
              label="Contact email"
              value={form.contactEmail}
              onChangeText={(contactEmail) => setForm({ ...form, contactEmail })}
              keyboardType="email-address"
            />
            <Field
              label="Region"
              value={form.region}
              onChangeText={(region) => setForm({ ...form, region })}
            />
            <Field
              label="Location"
              value={form.location}
              onChangeText={(location) => setForm({ ...form, location })}
            />
            <Field
              label="Description"
              value={form.description}
              onChangeText={(description) => setForm({ ...form, description })}
              multiline
            />

            <PrimaryButton
              label="Save profile"
              icon={LucideStore}
              onPress={saveProfile}
              loading={savingProfile}
            />
          </View>
        </Panel>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const BrandImageField = ({
  label,
  value,
  uploading,
  onPick,
  onRemove,
  shape,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onPick: () => void;
  onRemove: () => void;
  shape: 'round' | 'wide';
}) => (
  <View className="gap-2">
    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</Text>
    {value ? (
      <View className="relative">
        <Image
          source={{ uri: value }}
          className={shape === 'round' ? 'w-24 h-24 rounded-full' : 'w-full h-28 rounded-2xl'}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={onRemove}
          className="absolute top-2 right-2 h-8 w-8 bg-black/70 rounded-full items-center justify-center"
        >
          <LucideTrash2 size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        onPress={onPick}
        disabled={uploading}
        className={`items-center justify-center bg-gray-50 border border-dashed border-gray-200 gap-1.5 ${
          shape === 'round' ? 'w-24 h-24 rounded-full' : 'w-full h-28 rounded-2xl'
        }`}
      >
        {uploading ? (
          <ActivityIndicator color="#2563eb" size="small" />
        ) : (
          <>
            <LucideImageIcon size={18} color="#94a3b8" />
            <Text className="text-[9px] font-black text-gray-400 uppercase">Upload</Text>
          </>
        )}
      </TouchableOpacity>
    )}
  </View>
);

const Field = ({
  label,
  multiline,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: any;
  multiline?: boolean;
}) => (
  <View className="gap-2">
    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </Text>
    <TextInput
      {...props}
      multiline={multiline}
      placeholderTextColor="#cbd5e1"
      className={`px-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900 ${
        multiline ? 'h-24' : ''
      }`}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

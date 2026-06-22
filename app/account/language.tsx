import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LucideChevronLeft,
  LucideCheck,
  LucideGlobe,
} from 'lucide-react-native';

const LANGUAGES = [
  { code: 'en-US', label: 'English', region: 'United States', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English', region: 'United Kingdom', flag: '🇬🇧' },
  { code: 'tw', label: 'Twi', region: 'Ghana', flag: '🇬🇭' },
  { code: 'ga', label: 'Ga', region: 'Ghana', flag: '🇬🇭' },
  { code: 'ee', label: 'Ewe', region: 'Ghana', flag: '🇬🇭' },
  { code: 'ha', label: 'Hausa', region: 'West Africa', flag: '🌍' },
  { code: 'fr-FR', label: 'French', region: 'France', flag: '🇫🇷' },
  { code: 'pt-PT', label: 'Portuguese', region: 'Portugal', flag: '🇵🇹' },
  { code: 'ar', label: 'Arabic', region: 'Middle East', flag: '🌍' },
  { code: 'zh-CN', label: 'Chinese', region: 'Simplified', flag: '🇨🇳' },
];

const STORAGE_KEY = 'app_language';

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('en-US');
  const [saving, setSaving] = useState(false);

  const handleSelect = async (code: string) => {
    setSaving(true);
    setSelected(code);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, code);
      const lang = LANGUAGES.find(l => l.code === code);
      Alert.alert(
        'Language Updated',
        `App language set to ${lang?.label} (${lang?.region}). Some changes may require an app restart.`,
        [{ text: 'Got it', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not save language preference.');
    } finally {
      setSaving(false);
    }
  };

  const grouped: Record<string, typeof LANGUAGES> = {
    'Ghana': LANGUAGES.filter(l => l.region === 'Ghana'),
    'English': LANGUAGES.filter(l => l.label === 'English'),
    'Other Languages': LANGUAGES.filter(l => l.region !== 'Ghana' && l.label !== 'English'),
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white border-b border-gray-50">
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <LucideChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter ml-2">Language</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center bg-primary/5 border border-primary/10 rounded-3xl p-5 mb-8">
          <LucideGlobe size={20} color="#fa8929" />
          <Text className="text-gray-700 font-bold text-[10px] ml-3 flex-1 uppercase leading-5">
            Choose the language you'd like to use in CartlyHub. Ghanaian language support is experimental.
          </Text>
        </View>

        {Object.entries(grouped).map(([group, langs]) => (
          <View key={group} className="mb-8">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-2">{group}</Text>
            <View className="bg-white rounded-[36px] overflow-hidden border border-gray-100 shadow-sm">
              {langs.map((lang, idx) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleSelect(lang.code)}
                  className={`flex-row items-center px-6 py-5 ${idx !== langs.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <Text className="text-2xl mr-4">{lang.flag}</Text>
                  <View className="flex-1">
                    <Text className="font-black text-gray-900 uppercase tracking-tight text-xs">{lang.label}</Text>
                    <Text className="text-gray-400 font-bold text-[10px] uppercase mt-0.5">{lang.region}</Text>
                  </View>
                  {selected === lang.code && (
                    <View className="w-7 h-7 bg-primary rounded-full items-center justify-center">
                      <LucideCheck size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

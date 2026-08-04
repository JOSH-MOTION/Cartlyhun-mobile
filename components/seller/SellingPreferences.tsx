import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import {
  LucideMessageCircle,
  LucideCreditCard,
  LucideSparkles,
  LucideCheck,
  LucideInfo,
} from 'lucide-react-native';
import { SELLING_MODE_OPTIONS, SELLING_MODES } from '@/constants/marketplace';
import { TONE } from './ui';

const ICONS: Record<string, any> = {
  [SELLING_MODES.WHATSAPP]: LucideMessageCircle,
  [SELLING_MODES.ONLINE]: LucideCreditCard,
  [SELLING_MODES.BOTH]: LucideSparkles,
};

/**
 * Selling & Payment Preferences, matching the web picker.
 *
 * The WhatsApp field only appears for the modes that require it. The server
 * re-validates this pairing, so a mismatch here is caught rather than saved.
 */
export default function SellingPreferences({
  value,
  onChange,
  whatsappNumber,
  onWhatsappNumberChange,
  disabled,
}: {
  value: string;
  onChange: (mode: string) => void;
  whatsappNumber: string;
  onWhatsappNumberChange: (value: string) => void;
  disabled?: boolean;
}) {
  const selected = SELLING_MODE_OPTIONS.find((option) => option.value === value);

  return (
    <View className="gap-4">
      <View>
        <Text className="text-sm font-black text-gray-900 uppercase tracking-tight">
          Selling &amp; Payment Preferences
        </Text>
        <Text className="text-[11px] text-gray-400 mt-1">
          How do you want customers to buy from you?
        </Text>
      </View>

      <View className="gap-2">
        {SELLING_MODE_OPTIONS.map((option) => {
          const Icon = ICONS[option.value];
          const active = value === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              className={`p-4 rounded-2xl border-2 ${
                active ? 'bg-gray-900 border-gray-900' : 'bg-gray-50 border-transparent'
              }`}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center ${
                    active ? 'bg-white/10' : 'bg-white'
                  }`}
                >
                  <Icon size={16} color={active ? '#ffffff' : '#0f172a'} />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text
                      className={`text-xs font-black uppercase tracking-tight ${
                        active ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {option.label}
                    </Text>
                    {option.recommended ? (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: active ? 'rgba(255,255,255,0.15)' : TONE.positive.bg }}
                      >
                        <Text
                          className="text-[8px] font-bold uppercase tracking-widest"
                          style={{ color: active ? '#6ee7b7' : TONE.positive.fg }}
                        >
                          Recommended
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text
                    className={`text-[11px] mt-1 leading-relaxed ${
                      active ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {option.summary}
                  </Text>
                </View>

                {active ? <LucideCheck size={16} color="#6ee7b7" /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected?.requiresWhatsapp ? (
        <View className="gap-2">
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            WhatsApp number *
          </Text>
          <TextInput
            editable={!disabled}
            value={whatsappNumber}
            onChangeText={onWhatsappNumberChange}
            placeholder="e.g. 0241234567"
            placeholderTextColor="#cbd5e1"
            keyboardType="phone-pad"
            className="px-4 py-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-900"
          />
          <Text className="text-[10px] text-gray-400">
            Customers reach you here and their orders arrive pre-filled.
          </Text>
        </View>
      ) : null}

      <View
        className="flex-row gap-2.5 p-3.5 rounded-2xl"
        style={{ backgroundColor: selected?.enablesOnline ? TONE.positive.bg : TONE.warning.bg }}
      >
        <LucideInfo
          size={14}
          color={selected?.enablesOnline ? TONE.positive.fg : TONE.warning.fg}
        />
        <Text
          className="flex-1 text-[11px] leading-relaxed"
          style={{ color: selected?.enablesOnline ? '#065f46' : '#92400e' }}
        >
          {selected?.enablesOnline
            ? 'Customers pay Cartly Hub securely. Your share lands in your wallet the moment the payment clears.'
            : 'Shoppers see an Order on WhatsApp button instead of Pay Now. Orders still reach your dashboard, but you collect payment yourself.'}
        </Text>
      </View>
    </View>
  );
}

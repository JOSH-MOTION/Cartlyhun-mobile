import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  LucideChevronLeft, 
  LucideUser, 
  LucideBell, 
  LucideShield, 
  LucideCreditCard, 
  LucideHelpCircle, 
  LucideInfo, 
  LucideLogOut,
  LucideChevronRight,
  LucideGlobe,
  LucideMoon,
  LucideSmartphone,
  LucideFileText,
  LucideShieldCheck
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { clearBiometricSession } from '@/lib/biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [notifications, setNotifications] = React.useState(true);
  const [faceId, setFaceId] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem("biometrics-enabled").then(val => {
      setFaceId(val === "true");
    });
  }, []);

  const handleToggleFaceId = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Biometrics Unavailable",
          "Fingerprint/FaceID hardware is not available, or no biometric profiles are enrolled on this device."
        );
        setFaceId(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm biometric authentication to enable login",
        fallbackLabel: "Use Passcode"
      });

      if (result.success) {
        setFaceId(true);
        await AsyncStorage.setItem("biometrics-enabled", "true");
        Alert.alert("Success", "Biometric Authentication enabled! Email and password will be securely saved when you next sign in manually.");
      } else {
        setFaceId(false);
      }
    } else {
      setFaceId(false);
      await clearBiometricSession();
      Alert.alert("Disabled", "Biometric Authentication has been disabled and cached credentials removed.");
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: () => { clearBiometricSession(); auth.signOut(); } }
      ]
    );
  };

  const handleUnderConstruction = (feature: string) => {
    Alert.alert(
      "Coming Soon",
      `${feature} management is currently being optimized for the Gold edition. Check back soon!`,
      [{ text: "Awesome" }]
    );
  };

  const openURL = (path: string) => {
    const url = `https://cartlyhubgh.com${path}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open link.");
    });
  };

  const SettingItem = ({ icon: Icon, label, value, type = 'link', onPress, color = "#fa8929" }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={type === 'switch'}
      className="flex-row items-center p-5 bg-white mb-3 rounded-3xl border border-gray-50"
    >
      <View className={`p-3.5 rounded-2xl mr-4`} style={{ backgroundColor: `${color}10` }}>
        <Icon size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="font-black text-gray-900 uppercase tracking-tight text-xs">{label}</Text>
        {type === 'value' && <Text className="text-gray-400 font-bold text-[10px] uppercase mt-1">{value}</Text>}
      </View>
      {type === 'link' && <LucideChevronRight size={20} color="#cbd5e1" />}
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: "#f1f5f9", true: "#fa8929" }}
          thumbColor="#ffffff"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white border-b border-gray-50">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <LucideChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter ml-2">Settings</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Account Section */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-4">Account Settings</Text>
        <SettingItem 
          icon={LucideUser} 
          label="Profile Information" 
          onPress={() => user ? router.push('/account/profile') : router.push('/auth/signin')} 
        />
        <SettingItem 
          icon={LucideCreditCard} 
          label="Payment Methods" 
          value="Visa **** 4242" 
          type="value"
          color="#3b82f6"
          onPress={() => user ? router.push('/account/payment-methods') : router.push('/auth/signin')}
        />
        <SettingItem 
          icon={LucideGlobe} 
          label="Language" 
          value="English (US)" 
          type="value"
          color="#10b981"
          onPress={() => router.push('/account/language')}
        />

        {/* Preferences Section */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-8 mb-4 ml-4">Preferences</Text>
        <SettingItem 
          icon={LucideBell} 
          label="Push Notifications" 
          type="switch" 
          value={notifications} 
          onPress={() => setNotifications(!notifications)} 
        />
        <SettingItem 
          icon={LucideShield} 
          label="Biometric Security" 
          type="switch" 
          value={faceId} 
          onPress={handleToggleFaceId} 
          color="#f43f5e"
        />

        {/* Support Section */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-8 mb-4 ml-4">Support & Legal</Text>
        <SettingItem 
          icon={LucideShieldCheck} 
          label="Safety Tips" 
          color="#10b981"
          onPress={() => openURL("/safety-tips")}
        />
        <SettingItem 
          icon={LucideFileText} 
          label="Privacy Policy" 
          color="#64748b"
          onPress={() => openURL("/privacy")}
        />
        <SettingItem 
          icon={LucideInfo} 
          label="Terms of Service" 
          color="#94a3b8"
          onPress={() => openURL("/terms")}
        />
        <SettingItem 
          icon={LucideShield} 
          label="Refund Policy" 
          color="#f43f5e"
          onPress={() => openURL("/refund")}
        />
        <SettingItem 
          icon={LucideUser} 
          label="Seller Policy" 
          color="#fa8929"
          onPress={() => openURL("/seller-policy")}
        />
        <SettingItem 
          icon={LucideHelpCircle} 
          label="Help Center" 
          color="#3b82f6"
          onPress={() => openURL("/help")}
        />
        <SettingItem 
          icon={LucideSmartphone} 
          label="App Version" 
          value="v2.4.0 (Elite Gold)" 
          type="value"
          color="#cbd5e1"
        />

        {/* Danger Zone / Session Management */}
        <TouchableOpacity 
          onPress={() => user ? handleSignOut() : router.push('/auth/signin')}
          className={`mt-12 flex-row items-center justify-center p-6 ${user ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'} rounded-[32px] border`}
        >
          {user ? (
            <>
              <LucideLogOut size={20} color="#ef4444" />
              <Text className="ml-3 font-black text-red-500 uppercase tracking-[2px] text-[10px]">Sign Out of Session</Text>
            </>
          ) : (
            <>
              <LucideUser size={20} color="#3b82f6" />
              <Text className="ml-3 font-black text-blue-500 uppercase tracking-[2px] text-[10px]">Sign In to Account</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text className="text-center text-[10px] text-gray-300 font-bold uppercase mt-12 tracking-[4px]">
          CARTLYHUB PLATINUM
        </Text>
      </ScrollView>
    </View>
  );
}

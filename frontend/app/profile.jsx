import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  Modal,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import {
  QrCode,
  Landmark,
  Bell,
  CircleHelp,
  Share2,
  LogOut,
  ChevronRight,
  Camera,
  Edit3,
  X,
  Check,
  Building2,
  AtSign,
  User,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { useProfile } from '../src/context/ProfileContext';
import { authService, setAuthToken } from '../src/services';

const POPULAR_BANKS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
];

const QUICK_UPI_HANDLES = ['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl'];

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, updatePhoto, updateProfile } = useProfile();

  // Local state initialized dynamically from profile context
  const [gentleReminders, setGentleReminders] = useState(
    profile.gentleReminders !== undefined ? profile.gentleReminders : true
  );

  // Modals for editing
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [customBankName, setCustomBankName] = useState('');
  const [accountDigits, setAccountDigits] = useState('2016');

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [editUpiInput, setEditUpiInput] = useState(profile.upiId || 'prisha@upi');

  const [showNameModal, setShowNameModal] = useState(false);
  const [editName, setEditName] = useState(profile.name || 'Prisha Oberoi');

  // Fetch live profile from MongoDB on mount to ensure fresh data
  useEffect(() => {
    authService.getProfile().then((res) => {
      if (res?.user) {
        updateProfile({
          name: res.user.name,
          email: res.user.email,
          photoUri: res.user.photoUri || null,
          qrCodeUri: res.user.qrCodeUri || null,
          upiId: res.user.upiId || undefined,
          bankAccount: res.user.bankAccount || '',
          gentleReminders: res.user.gentleReminders ?? true,
        });
        if (res.user.gentleReminders !== undefined) {
          setGentleReminders(res.user.gentleReminders);
        }
        if (res.user.upiId) {
          setEditUpiInput(res.user.upiId);
        }
        if (res.user.name) {
          setEditName(res.user.name);
        }
      }
    }).catch(() => {});
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/create-or-join');
    }
  };

  // 1. DYNAMIC PHOTO UPDATE
  const handlePickImage = async () => {
    Alert.alert('Profile Photo', 'Choose an option to update your photo:', [
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant photo library access.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            const newUri = result.assets[0].uri;
            updatePhoto(newUri);
            authService.updateProfile({ photoUri: newUri, email: profile.email }).catch(() => {});
          }
        },
      },
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera access.');
            return;
          }
          try {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const newUri = result.assets[0].uri;
              updatePhoto(newUri);
              authService.updateProfile({ photoUri: newUri, email: profile.email }).catch(() => {});
            }
          } catch (e) {
            Alert.alert('Camera', 'Camera is not available on this simulator.');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // 2. DYNAMIC NAME & HANDLE UPDATE
  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const updatedName = editName.trim();
    updateProfile({ name: updatedName });
    setShowNameModal(false);

    try {
      await authService.updateProfile({ name: updatedName, email: profile.email });
      Alert.alert('Updated! ✨', 'Your name and handle have been updated in the database.');
    } catch (e) {
      console.warn('Name updated locally:', e);
    }
  };

  // 3. DYNAMIC UPI ID UPDATE & COPY
  const handleCopyUpi = async () => {
    const currentUpi = profile.upiId || 'prisha@upi';
    await Clipboard.setStringAsync(currentUpi);
    Alert.alert('Copied! 📋', `UPI ID "${currentUpi}" copied to clipboard.`);
  };

  const handleOpenEditUpi = () => {
    setEditUpiInput(profile.upiId || `${profile.name.split(' ')[0].toLowerCase()}@upi`);
    setShowUpiModal(true);
  };

  const handleSelectUpiSuffix = (suffix) => {
    const currentPrefix = editUpiInput.includes('@')
      ? editUpiInput.split('@')[0]
      : editUpiInput.trim() || 'user';
    setEditUpiInput(`${currentPrefix}${suffix}`);
  };

  const handleSaveUpi = async () => {
    if (!editUpiInput.trim() || !editUpiInput.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g., yourname@okhdfcbank)');
      return;
    }
    const newUpi = editUpiInput.trim();
    updateProfile({ upiId: newUpi });
    setShowUpiModal(false);

    try {
      await authService.updateProfile({ upiId: newUpi, email: profile.email });
      Alert.alert('UPI ID Saved! 💳', `Your primary UPI ID is now set to "${newUpi}".`);
    } catch (e) {
      console.warn('UPI saved locally:', e);
    }
  };

  // 4. DYNAMIC BANK ACCOUNT SELECTION & EDITING
  const handleOpenBankModal = () => {
    if (profile.bankAccount) {
      const parts = profile.bankAccount.split(' ****');
      if (parts.length === 2) {
        setSelectedBank(parts[0]);
        setAccountDigits(parts[1]);
      }
    }
    setShowBankModal(true);
  };

  const handleSaveBankAccount = async () => {
    const bankName = selectedBank === 'Other' ? customBankName.trim() || 'Bank' : selectedBank;
    const digits = accountDigits.replace(/\D/g, '').slice(-4) || '0000';
    const formattedBank = `${bankName} ****${digits}`;

    updateProfile({ bankAccount: formattedBank });
    setShowBankModal(false);

    try {
      await authService.updateProfile({ bankAccount: formattedBank, email: profile.email });
      Alert.alert('Bank Account Linked! 🏦', `Settlement account updated to "${formattedBank}".`);
    } catch (e) {
      console.warn('Bank saved locally:', e);
    }
  };

  // 5. DYNAMIC QR CODE SCANNER & UPLOAD
  const handleQrCode = () => {
    Alert.alert(
      'Payment QR Code & Scanner',
      profile.qrCodeUri ? 'Your personal QR code is active.' : 'Upload or scan your payment QR code:',
      [
        {
          text: 'Upload from Gallery',
          onPress: async () => {
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!res.canceled && res.assets && res.assets.length > 0) {
              const newQr = res.assets[0].uri;
              updateProfile({ qrCodeUri: newQr });
              authService.updateProfile({ qrCodeUri: newQr, email: profile.email }).catch(() => {});
              Alert.alert('QR Code Saved! 🎉', 'Your payment QR has been updated in database.');
            }
          },
        },
        {
          text: 'Take Photo with Camera',
          onPress: async () => {
            try {
              const res = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              if (!res.canceled && res.assets && res.assets.length > 0) {
                const newQr = res.assets[0].uri;
                updateProfile({ qrCodeUri: newQr });
                authService.updateProfile({ qrCodeUri: newQr, email: profile.email }).catch(() => {});
                Alert.alert('QR Code Saved! 🎉', 'Your payment QR has been updated in database.');
              }
            } catch (e) {
              Alert.alert('Scanner', 'Camera not available on simulator. You can pick an image from gallery.');
            }
          },
        },
        {
          text: 'Auto-Generate Live QR',
          onPress: () => {
            const id = profile.upiId || 'user@upi';
            const autoQr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(
              id
            )}&pn=${encodeURIComponent(profile.name || 'User')}`;
            updateProfile({ qrCodeUri: autoQr });
            authService.updateProfile({ qrCodeUri: autoQr, email: profile.email }).catch(() => {});
            Alert.alert('QR Code Generated! 📱', `Generated live QR for ${id}.`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // 6. DYNAMIC GENTLE REMINDERS TOGGLE
  const handleToggleReminders = async (value) => {
    setGentleReminders(value);
    updateProfile({ gentleReminders: value });
    try {
      await authService.updateProfile({ gentleReminders: value, email: profile.email });
    } catch (e) {
      console.warn('Reminders toggle saved locally:', e);
    }
  };

  // 7. DYNAMIC INVITE FRIENDS VIA OS SHARE
  const handleInviteFriends = async () => {
    try {
      const shareUrl = `https://splitflow.in/invite/${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      await Share.share({
        title: 'Join me on SplitFlow',
        message: `Hey! I'm using SplitFlow to easily track and split expenses with friends. Join me here:\n${shareUrl}`,
      });
    } catch (e) {
      console.warn('Share error:', e);
    }
  };

  const handleHelpCentre = () => {
    Alert.alert(
      'Help Centre',
      'Need help with SplitFlow?\n\n• Expenses: Track and split with group members\n• Settle Up: Pay via UPI or screenshot proof\n• Support: support@splitflow.in'
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          setAuthToken(null);
          router.replace('/login');
        },
      },
    ]);
  };

  const displayBankAccount = profile.bankAccount || 'Tap to link Bank Account';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile Settings</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Avatar & Info */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickImage}
            style={styles.avatarTouchable}
          >
            <Image
              source={
                profile.photoUri
                  ? { uri: profile.photoUri }
                  : require('../assets/images/default_avatar.png')
              }
              style={styles.avatarImage}
              resizeMode="cover"
            />
            {/* Camera Badge to indicate photo upload capability */}
            <View style={styles.cameraBadge}>
              <Camera size={14} color={Colors.white} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* User Name & Handle with Edit Trigger */}
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{profile.name}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setEditName(profile.name);
                setShowNameModal(true);
              }}
              style={styles.editNameBtn}
            >
              <Edit3 size={15} color={Colors.primary} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userHandle}>{profile.handle}</Text>
        </View>

        {/* Payment Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.card}>
            {/* UPI ID Row */}
            <View style={styles.rowItem}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenEditUpi}
                style={styles.rowItemTouchable}
              >
                <View style={styles.iconContainer}>
                  <QrCode size={20} color="#111827" strokeWidth={2} />
                </View>
                <View style={styles.textColumn}>
                  <Text style={styles.itemTitle}>{profile.upiId || 'Add UPI ID'}</Text>
                  <Text style={styles.itemSubtitle}>Primary UPI ID • Tap to edit</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCopyUpi}
                style={styles.copyButton}
              >
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Payment QR Code / Scanner Row */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleQrCode}
              style={styles.rowItem}
            >
              <View style={styles.iconContainer}>
                <Camera size={20} color="#111827" strokeWidth={2} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>Payment QR & Scanner</Text>
                <Text style={styles.itemSubtitle}>
                  {profile.qrCodeUri ? 'Active & Ready for Scanner ✓' : 'Tap to upload or scan QR'}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* DYNAMIC Settlement Bank Account Row */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenBankModal}
              style={styles.rowItem}
            >
              <View style={styles.iconContainer}>
                <Landmark size={20} color="#111827" strokeWidth={2} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>{displayBankAccount}</Text>
                <Text style={styles.itemSubtitle}>Settlement Account • Tap to change</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* DYNAMIC Gentle Reminders Row */}
            <View style={styles.rowItem}>
              <View style={styles.iconContainer}>
                <Bell size={20} color="#111827" strokeWidth={2} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.itemTitle}>Gentle Reminders</Text>
                <Text style={styles.itemSubtitle}>
                  Notify friends after 48 hours
                </Text>
              </View>
              <Switch
                value={gentleReminders}
                onValueChange={handleToggleReminders}
                trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {/* Help Centre */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleHelpCentre}
              style={styles.rowItem}
            >
              <CircleHelp size={22} color="#6B7280" strokeWidth={2} />
              <View style={[styles.textColumn, { marginLeft: 14 }]}>
                <Text style={styles.itemTitle}>Help Centre</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Dynamic Invite Friends */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleInviteFriends}
              style={styles.rowItem}
            >
              <Share2 size={20} color="#6B7280" strokeWidth={2} />
              <View style={[styles.textColumn, { marginLeft: 14 }]}>
                <Text style={styles.itemTitle}>Invite Friends</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Sign Out */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSignOut}
              style={styles.rowItem}
            >
              <LogOut size={20} color="#EF4444" strokeWidth={2.2} />
              <View style={[styles.textColumn, { marginLeft: 14 }]}>
                <Text style={[styles.itemTitle, styles.signOutText]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>SplitFlow v2.4.0</Text>
          <Text style={styles.craftedText}>
            CRAFTED WITH LOVE FOR YOU WALLET
          </Text>
        </View>
      </ScrollView>

      {/* MODAL 1: DYNAMIC BANK ACCOUNT SELECTOR */}
      <Modal
        visible={showBankModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowBankModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#6B7280" strokeWidth={2.4} />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalBadge}>
                <Landmark size={24} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Settlement Bank</Text>
                <Text style={styles.modalSub}>
                  Select your bank to receive settlement transfers
                </Text>
              </View>
            </View>

            <Text style={styles.modalFieldLabel}>Select Bank</Text>
            <ScrollView
              style={{ maxHeight: 180 }}
              showsVerticalScrollIndicator={false}
            >
              {POPULAR_BANKS.map((b) => {
                const isSelected = selectedBank === b;
                return (
                  <TouchableOpacity
                    key={b}
                    activeOpacity={0.7}
                    onPress={() => setSelectedBank(b)}
                    style={[
                      styles.bankOptionRow,
                      isSelected && styles.bankOptionSelected,
                    ]}
                  >
                    <Building2
                      size={18}
                      color={isSelected ? Colors.primary : '#6B7280'}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.bankOptionText,
                        isSelected && styles.bankOptionTextSelected,
                      ]}
                    >
                      {b}
                    </Text>
                    {isSelected && <Check size={18} color={Colors.primary} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.modalFieldLabel, { marginTop: 14 }]}>
              Account Number (Last 4 Digits)
            </Text>
            <View style={styles.modalInputRow}>
              <Text style={styles.modalInputPrefix}>•••• •••• •••• </Text>
              <TextInput
                style={styles.modalInputDigits}
                value={accountDigits}
                onChangeText={(val) => setAccountDigits(val.replace(/\D/g, '').slice(0, 4))}
                keyboardType="numeric"
                maxLength={4}
                placeholder="2016"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveBankAccount}
              style={styles.modalSaveBtn}
            >
              <Text style={styles.modalSaveBtnText}>Save Bank Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: DYNAMIC UPI ID EDITOR */}
      <Modal
        visible={showUpiModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpiModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowUpiModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#6B7280" strokeWidth={2.4} />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalBadge}>
                <AtSign size={24} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Edit Primary UPI ID</Text>
                <Text style={styles.modalSub}>
                  Enter the UPI ID where friends will send payments
                </Text>
              </View>
            </View>

            <Text style={styles.modalFieldLabel}>UPI ID</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={[styles.modalInputDigits, { flex: 1 }]}
                value={editUpiInput}
                onChangeText={setEditUpiInput}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="name@okhdfcbank"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Quick Handles */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.handlesRow}
            >
              {QUICK_UPI_HANDLES.map((suffix) => (
                <TouchableOpacity
                  key={suffix}
                  activeOpacity={0.7}
                  onPress={() => handleSelectUpiSuffix(suffix)}
                  style={styles.handleChip}
                >
                  <Text style={styles.handleChipText}>{suffix}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveUpi}
              style={styles.modalSaveBtn}
            >
              <Text style={styles.modalSaveBtnText}>Save UPI ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: DYNAMIC NAME EDITOR */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowNameModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#6B7280" strokeWidth={2.4} />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalBadge}>
                <User size={24} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Edit Full Name</Text>
                <Text style={styles.modalSub}>
                  Update your display name across all groups
                </Text>
              </View>
            </View>

            <Text style={styles.modalFieldLabel}>Full Name</Text>
            <View style={styles.modalInputRow}>
              <TextInput
                style={[styles.modalInputDigits, { flex: 1 }]}
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="words"
                placeholder="Your Full Name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveName}
              style={styles.modalSaveBtn}
            >
              <Text style={styles.modalSaveBtnText}>Save Name</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerSpacer: {
    width: 65,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#C3AAD2',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  editNameBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHandle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#EFEBF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowItemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDE4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  itemSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  copyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },
  signOutText: {
    color: '#EF4444',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  craftedText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 4,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingRight: 40,
  },
  modalBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSub: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  modalFieldLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  bankOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 10,
  },
  bankOptionSelected: {
    backgroundColor: '#FAF5FD',
  },
  bankOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  bankOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 48,
  },
  modalInputPrefix: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  modalInputDigits: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  handlesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  handleChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  handleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalSaveBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.white,
  },
});

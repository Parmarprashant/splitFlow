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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import {
  User,
  UtensilsCrossed,
  CarFront,
  BedDouble,
  ChevronRight,
  Scan,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { settlementService } from '../src/services';
import { useProfile } from '../src/context/ProfileContext';

export default function SettleUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useProfile();
  const [gentleReminders, setGentleReminders] = useState(
    profile.gentleReminders !== undefined ? profile.gentleReminders : true
  );
  const [arohiSettled, setArohiSettled] = useState(true);
  const [viratSettled, setViratSettled] = useState(true);
  const [proofUri, setProofUri] = useState(null);
  const [recentList, setRecentList] = useState([
    { id: '1', name: 'Arohi', amount: 1270, meta: 'Paid you ₹1270' },
    { id: '2', name: 'Virat', amount: 1550, meta: 'You paid ₹1550' },
  ]);

  const recipientName = params.toUserName || 'Rohan Jain';
  const recipientUpi = params.recipientUpi || `${recipientName.split(' ')[0].toLowerCase()}@upi`;
  const amount = params.amount || '820.00';
  const upiId = profile.upiId || 'prisha@upi';

  useEffect(() => {
    settlementService.getRecentSettlements().then((res) => {
      if (res && res.length > 0) {
        setRecentList(res);
      }
    });
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
    }
  };

  const handleCopyUpi = async () => {
    await Clipboard.setStringAsync(upiId);
    Alert.alert('Copied! 📋', `UPI ID "${upiId}" copied to clipboard.`);
  };

  const handleUploadProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProofUri(result.assets[0].uri);
        Alert.alert('Proof Attached! 📎', 'Screenshot has been attached.');
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await settlementService.settleUp({
        amount,
        toUserName: recipientName,
        recipientUpi,
        proofUri,
      });
    } catch (err) {
      console.warn('Settlement saved locally:', err);
    }

    Alert.alert(
      'Payment Settled! 🎉',
      `₹${amount} paid to ${recipientName} (${recipientUpi}) has been marked as completed.`,
      [
        {
          text: 'Done',
          onPress: () => router.replace('/dashboard'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Logo & Back Button */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/splitflow_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBack}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <Text style={styles.pageTitle}>Settle Up</Text>

        {/* Hero Recipient & Amount Section */}
        <View style={styles.heroSection}>
          {/* Lime Green Avatar */}
          <View style={styles.greenAvatar}>
            <User size={56} color={Colors.white} strokeWidth={2.5} />
          </View>

          <Text style={styles.payingToText}>Paying to : {recipientName}</Text>
          <Text style={styles.upiIdText}>UPI ID : {recipientUpi}</Text>

          {/* Amount Display */}
          <Text style={styles.amountDisplay}>₹{amount}</Text>
          <Text style={styles.paymentPendingBadge}>PAYMENT PENDING</Text>
        </View>

        {/* Card 1: Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Breakdown</Text>

          {/* Row 1: Food UPI ID */}
          <View style={styles.rowItem}>
            <View style={styles.iconContainer}>
              <UtensilsCrossed size={18} color="#111827" strokeWidth={2.2} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.itemTitle}>{upiId}</Text>
              <Text style={styles.itemSubtitle}>Primary UPI ID</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyUpi}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Row 2: Transport Settlement Account */}
          <View style={styles.rowItem}>
            <View style={styles.iconContainer}>
              <CarFront size={18} color="#111827" strokeWidth={2.2} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.itemTitle}>{profile.bankAccount || 'HDFC Bank ****2016'}</Text>
              <Text style={styles.itemSubtitle}>Settlement Account</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>

          <View style={styles.divider} />

          {/* Row 3: Hotel Gentle Reminders */}
          <View style={styles.rowItem}>
            <View style={styles.iconContainer}>
              <BedDouble size={18} color="#111827" strokeWidth={2.2} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.itemTitle}>Gentle Reminders</Text>
              <Text style={styles.itemSubtitle}>
                Notify friends after 48 hours
              </Text>
            </View>
            <Switch
              value={gentleReminders}
              onValueChange={setGentleReminders}
              trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          {/* Action 1: Screenshot/UPI Proof */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleUploadProof}
            style={styles.proofButton}
          >
            <Scan size={18} color="#111827" strokeWidth={2.4} />
            <Text style={styles.proofButtonText}>
              {proofUri ? 'Proof Attached ✓' : 'Screenshot/UPI Proof'}
            </Text>
          </TouchableOpacity>

          {/* Action 2: Mark as Paid */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleMarkAsPaid}
            style={styles.markPaidButton}
          >
            <CheckCircle2 size={18} color="#111827" strokeWidth={2.4} />
            <Text style={styles.markPaidButtonText}>Mark as Paid</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Recently Settled */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recently Settled</Text>

          {/* Row 1: Arohi */}
          <View style={styles.rowItem}>
            <View style={styles.miniGreenAvatar}>
              <User size={22} color={Colors.white} strokeWidth={2.4} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.itemTitle}>{recentList[0]?.name || 'Arohi'}</Text>
              <Text style={styles.itemSubtitle}>{recentList[0]?.meta || 'Paid you ₹1270'}</Text>
            </View>
            <Switch
              value={arohiSettled}
              onValueChange={setArohiSettled}
              trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.divider} />

          {/* Row 2: Virat */}
          <View style={styles.rowItem}>
            <View style={styles.miniGreenAvatar}>
              <User size={22} color={Colors.white} strokeWidth={2.4} />
            </View>
            <View style={styles.textColumn}>
              <Text style={styles.itemTitle}>{recentList[1]?.name || 'Virat'}</Text>
              <Text style={styles.itemSubtitle}>{recentList[1]?.meta || 'You paid ₹1550'}</Text>
            </View>
            <Switch
              value={viratSettled}
              onValueChange={setViratSettled}
              trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
              thumbColor={Colors.white}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 6,
  },
  logoImage: {
    width: 170,
    height: 42,
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
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginVertical: 10,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  greenAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#95E364',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  payingToText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  upiIdText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
  },
  amountDisplay: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
    marginTop: 12,
  },
  paymentPendingBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#EFEBF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
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
    fontSize: 12,
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
  proofButton: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  proofButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  markPaidButton: {
    backgroundColor: Colors.primary,
    height: 46,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  markPaidButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  miniGreenAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#95E364',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});

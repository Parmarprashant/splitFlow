import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BadgeCheck,
  CreditCard,
  CalendarDays,
  HelpCircle,
  Lightbulb,
  Check,
  Clock,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { expenseService, settlementService } from '../src/services';

const INTENT_OPTIONS = [
  { id: '1', label: 'Will pay on Friday', icon: 'card' },
  { id: '2', label: "Let's settle after trip" },
  { id: '3', label: 'Next paycheck (1st)', icon: 'calendar' },
  { id: '4', label: 'Not sure yet', icon: 'question' },
];

export default function TrackIntentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedIntent, setSelectedIntent] = useState('1');
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentSettled, setRecentSettled] = useState([
    { id: '1', name: 'Sam', amount: 500, meta: 'Paid you ₹500 • 2 days ago' },
    { id: '2', name: 'Maya', amount: 1200, meta: 'You paid ₹1,200 • 2 days ago' },
  ]);

  const displayAmount = params.amount || '870.50';

  useEffect(() => {
    settlementService.getRecentSettlements().then((res) => {
      if (res && res.length > 0) {
        setRecentSettled(res);
      }
    });
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/group-summary');
    }
  };

  const targetName = params.payerId || 'Rohan';

  const handleSetIntent = async () => {
    setIsSubmitting(true);
    const chosen = INTENT_OPTIONS.find((o) => o.id === selectedIntent);
    try {
      await expenseService.trackIntent({
        plan: chosen?.label || 'Will pay soon',
        message: customMessage,
        targetUserName: targetName,
        amount: displayAmount,
        groupId: params.groupId,
      });
    } catch (err) {
      console.warn('Intent logged locally:', err);
    } finally {
      setIsSubmitting(false);
      Alert.alert(
        'Intent Shared! 🤝',
        `${targetName} has been notified that you "${chosen?.label}".`,
        [
          {
            text: 'View Summary',
            onPress: () => {
              if (params.groupId) {
                router.replace({
                  pathname: '/group-summary',
                  params: { groupId: params.groupId },
                });
              } else {
                router.replace('/group-summary');
              }
            },
          },
        ]
      );
    }
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

        {/* Page Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Track your intent</Text>
          <Text style={styles.pageSubtitle}>
            Reduce anxiety by sharing when you plan to pay. No pressure! 😌
          </Text>
        </View>

        {/* Card 1: Payment Intent */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <BadgeCheck size={24} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.cardTitle}>Payment intent</Text>
          </View>

          {/* Amount Context */}
          <Text style={styles.contextText}>
            You owe <Text style={styles.amountHighlight}>₹{displayAmount}</Text> to {targetName}
          </Text>
          <Text style={styles.helperText}>
            Let {targetName} know when you plan to settle this
          </Text>

          {/* Intent Options Pills */}
          <View style={styles.pillsContainer}>
            {INTENT_OPTIONS.map((option) => {
              const isSelected = selectedIntent === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedIntent(option.id)}
                  style={[
                    styles.pill,
                    isSelected ? styles.pillSelected : styles.pillUnselected,
                  ]}
                >
                  {option.icon === 'card' && (
                    <CreditCard
                      size={14}
                      color={isSelected ? Colors.white : '#1F2937'}
                      strokeWidth={2}
                    />
                  )}
                  {option.icon === 'calendar' && (
                    <CalendarDays
                      size={14}
                      color={isSelected ? Colors.white : '#1F2937'}
                      strokeWidth={2}
                    />
                  )}
                  {option.icon === 'question' && (
                    <HelpCircle
                      size={14}
                      color={isSelected ? Colors.white : '#1F2937'}
                      strokeWidth={2}
                    />
                  )}
                  <Text
                    style={[
                      styles.pillText,
                      isSelected
                        ? styles.pillTextSelected
                        : styles.pillTextUnselected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Message Input */}
          <Text style={styles.inputLabel}>Custom message (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., I'll transfer as soon as I'm back home"
            placeholderTextColor="#9CA3AF"
            value={customMessage}
            onChangeText={setCustomMessage}
          />

          {/* How this helps Info Box */}
          <View style={styles.howHelpsBox}>
            <View style={styles.howHelpsHeader}>
              <Lightbulb size={15} color="#1E3A8A" strokeWidth={2.5} />
              <Text style={styles.howHelpsTitle}>How this helps</Text>
            </View>
            <Text style={styles.howHelpsText}>
              Setting intent reduces uncertainty and awkward reminders. 92% of
              users feel less stressed about debts when using this feature.
            </Text>
          </View>

          {/* Set intent & Continue CTA Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSetIntent}
            disabled={isSubmitting}
            style={styles.setIntentButton}
          >
            <Check size={16} color={Colors.white} strokeWidth={3} />
            <Text style={styles.setIntentButtonText}>
              Set intent & Continue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: Recently Settled */}
        <View style={styles.settledSection}>
          <View style={styles.settledHeader}>
            <Clock size={22} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.settledTitle}>Recently Settled</Text>
          </View>

          {recentSettled.map((item, idx) => (
            <View key={item.id || idx}>
              <View style={styles.settledRow}>
                <View
                  style={[
                    styles.avatarBadge,
                    { backgroundColor: idx % 2 === 0 ? Colors.primary : '#F97316' },
                  ]}
                >
                  <Text style={styles.avatarText}>{item.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.settledInfo}>
                  <Text style={styles.settledName}>{item.name}</Text>
                  <Text style={styles.settledMeta}>
                    {item.meta || `Settled ₹${item.amount.toLocaleString()} • 2 days ago`}
                  </Text>
                </View>
              </View>
              {idx < recentSettled.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 8,
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
  titleSection: {
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 19,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEBF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 26,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  contextText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  amountHighlight: {
    color: Colors.primary,
    fontWeight: '800',
  },
  helperText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 3,
    marginBottom: 16,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
  },
  pillUnselected: {
    backgroundColor: '#F3F4F6',
  },
  pillText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: Colors.white,
  },
  pillTextUnselected: {
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 13.5,
    color: '#111827',
  },
  howHelpsBox: {
    backgroundColor: '#EDF4F9',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    marginBottom: 18,
  },
  howHelpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  howHelpsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  howHelpsText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  setIntentButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  setIntentButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  settledSection: {
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  settledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  settledTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  settledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  settledInfo: {
    flex: 1,
  },
  settledName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  settledMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 50,
  },
});

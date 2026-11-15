import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Wallet,
  Layers,
  FileText,
  SlidersHorizontal,
  Plane,
  Home,
  Umbrella,
  Plus,
  Share2,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { ProfileAvatar } from '../src/components/common';
import { useProfile } from '../src/context/ProfileContext';
import { settlementService, groupService } from '../src/services';

const INITIAL_BALANCES = [
  {
    id: '1',
    name: 'Rohan K.',
    group: 'Finland Trip Group',
    amount: 2450,
    type: 'owed',
    badgeColor: '#BF78EF',
    initials: 'RK',
  },
  {
    id: '2',
    name: 'Maya P.',
    group: 'Apartment 3B',
    amount: 950,
    type: 'owed',
    badgeColor: '#21A47D',
    initials: 'MP',
  },
  {
    id: '3',
    name: 'Sam P.',
    group: 'Weekend Trip',
    amount: 210,
    type: 'owe',
    badgeColor: '#FF7848',
    initials: 'SP',
  },
  {
    id: '4',
    name: 'Anisha C.',
    group: 'Hotel',
    amount: 710,
    type: 'owe',
    badgeColor: '#3B82F6',
    initials: 'AC',
  },
];

const GROUPS = [
  { id: '1', name: 'Goa Trip', icon: 'plane' },
  { id: '2', name: 'Apartment 3B', icon: 'home' },
  { id: '3', name: 'Weekend Trip', icon: 'umbrella' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [selectedGroupId, setSelectedGroupId] = useState('1');
  const [balances, setBalances] = useState(INITIAL_BALANCES);
  const [groups, setGroups] = useState(GROUPS);

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Prisha';

  useEffect(() => {
    // Fetch live balances and groups on mount
    settlementService.getBalances().then((res) => {
      if (res && res.length > 0) {
        setBalances(res);
      }
    });

    groupService.getGroups().then((res) => {
      if (res && res.length > 0) {
        const dynamicGroups = res.map((g) => ({
          id: g._id,
          name: g.name,
          icon: g.type === 'rent' ? 'home' : g.type === 'other' ? 'umbrella' : 'plane',
        }));
        setGroups(dynamicGroups);
        setSelectedGroupId(dynamicGroups[0].id);
      }
    });
  }, []);

  const handleSettleUp = (item) => {
    router.push({
      pathname: '/settle-up',
      params: {
        toUserName: item?.name || 'Rohan Jain',
        amount: item?.amount ? item.amount.toString() : '820.00',
        recipientUpi: `${item?.name ? item.name.split(' ')[0].toLowerCase() : 'rohan'}@upi`,
      },
    });
  };

  const handleSettleAll = async () => {
    try {
      await settlementService.settleAll();
      setBalances([]);
      Alert.alert('Success', 'All group balances have been marked as settled! 🎉');
    } catch (err) {
      setBalances([]);
      Alert.alert('Settled', 'All balances cleared.');
    }
  };

  const handleViewGroupSummary = () => {
    router.push({
      pathname: '/group-summary',
      params: { groupId: selectedGroupId },
    });
  };

  const handleShareActiveGroup = async () => {
    const active = groups.find((g) => g.id === selectedGroupId) || groups[0];
    if (!active) return;
    try {
      await Share.share({
        title: `Join ${active.name} on SplitFlow`,
        message: `Join my group "${active.name}" on SplitFlow to split shared expenses!\n\nLink: https://splitflow.in/join/${active.name.slice(0, 3).toUpperCase()}`,
      });
    } catch (e) {}
  };

  const handleAddNewGroup = () => {
    router.push('/create-or-join');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row: Greeting & Dynamic Profile Avatar */}
        <View style={styles.headerRow}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTitle}>Hello, {firstName}!</Text>
          </View>
          <ProfileAvatar
            size={38}
            onPress={() => router.push('/profile')}
          />
        </View>

        {/* Subtitle Description */}
        <Text style={styles.subtitle}>
          This section shows your group's ad balances, including available
          funds, total spending, pending charges, and individual contributions
          for transparency.
        </Text>

        {/* Card 1: Your Balances */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Wallet size={22} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.cardTitle}>Your Balances</Text>
          </View>

          {/* Balance Items List */}
          {balances.length === 0 ? (
            <Text style={styles.emptyText}>All balances are settled! 🎉</Text>
          ) : (
            balances.map((item, index) => {
              const isOwed = item.type === 'owed';
              return (
                <View key={item.id}>
                  <View style={styles.balanceRow}>
                    {/* Initials Badge */}
                    <View
                      style={[
                        styles.initialsBadge,
                        { backgroundColor: item.badgeColor },
                      ]}
                    >
                      <Text style={styles.initialsText}>{item.initials}</Text>
                    </View>

                    {/* Member Name & Group */}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{item.name}</Text>
                      <Text style={styles.groupName}>{item.group}</Text>
                    </View>

                    {/* Balance Amount */}
                    <Text
                      style={[
                        styles.amountText,
                        isOwed ? styles.owedText : styles.oweText,
                      ]}
                    >
                      {isOwed
                        ? `You're owed ₹${item.amount}`
                        : `You owe ₹${item.amount}`}
                    </Text>
                  </View>

                  {/* Divider between items */}
                  {index < balances.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })
          )}

          {/* Small Settle Up Pill Button */}
          {balances.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSettleUp(balances[balances.length - 1])}
              style={styles.settleUpPill}
            >
              <SlidersHorizontal
                size={13}
                color={Colors.primary}
                strokeWidth={2.5}
              />
              <Text style={styles.settleUpText}>Settle Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Card 2: Your Groups */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Layers size={22} color={Colors.primary} strokeWidth={2.4} />
            <Text style={styles.cardTitle}>Your Groups</Text>
          </View>

          {/* Group Pill Tags */}
          <View style={styles.groupsPillsRow}>
            {groups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              return (
                <TouchableOpacity
                  key={group.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedGroupId(group.id)}
                  style={[
                    styles.groupPill,
                    isSelected
                      ? styles.groupPillSelected
                      : styles.groupPillUnselected,
                  ]}
                >
                  {group.icon === 'plane' && (
                    <Plane
                      size={15}
                      color={isSelected ? Colors.white : '#1F2937'}
                      strokeWidth={2}
                    />
                  )}
                  {group.icon === 'home' && (
                    <Home
                      size={15}
                      color={isSelected ? Colors.white : '#1F2937'}
                      strokeWidth={2}
                    />
                  )}
                  {group.icon === 'umbrella' && (
                    <Umbrella
                      size={15}
                      color={isSelected ? Colors.white : '#1F2937'}
                      strokeWidth={2}
                    />
                  )}
                  <Text
                    style={[
                      styles.groupPillText,
                      isSelected
                        ? styles.groupPillTextSelected
                        : styles.groupPillTextUnselected,
                    ]}
                  >
                    {group.name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* + New Group Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAddNewGroup}
              style={[styles.groupPill, styles.groupPillUnselected]}
            >
              <Plus size={14} color="#1F2937" strokeWidth={2.5} />
              <Text style={styles.groupPillTextUnselected}>New</Text>
            </TouchableOpacity>
          </View>

          {/* Group Action Buttons: View Group Summary & Share */}
          <View style={styles.groupActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleViewGroupSummary}
              style={styles.summaryButton}
            >
              <FileText size={18} color={Colors.white} strokeWidth={2.2} />
              <Text style={styles.summaryButtonText}>View Group Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShareActiveGroup}
              style={styles.shareGroupBtn}
              accessibilityLabel="Share Group Invite"
            >
              <Share2 size={18} color={Colors.primary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Settle All Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSettleAll}
          style={styles.settleAllButton}
        >
          <Text style={styles.settleAllText}>Settle All</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEBF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  initialsBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  groupName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  owedText: {
    color: '#21A47D', // Positive balance green
  },
  oweText: {
    color: '#FF7848', // Negative balance orange
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 56,
  },
  settleUpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#C3AAD2',
    backgroundColor: '#FFFFFF',
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  settleUpText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  groupsPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  groupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  groupPillSelected: {
    backgroundColor: Colors.primary,
  },
  groupPillUnselected: {
    backgroundColor: '#F3F4F6',
  },
  groupPillText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  groupPillTextSelected: {
    color: Colors.white,
  },
  groupPillTextUnselected: {
    color: '#1F2937',
  },
  groupActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  summaryButton: {
    flex: 1,
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
  shareGroupBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C3AAD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  settleAllButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5EEF9',
    borderWidth: 1.5,
    borderColor: '#C3AAD2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  settleAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    paddingVertical: 16,
  },
});

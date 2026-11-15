import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { PlusCircle, Clock, Share2, Copy, Sparkles } from 'lucide-react-native';
import { Colors } from '../src/constants';
import { groupService } from '../src/services';

export default function GroupSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [summaryData, setSummaryData] = useState({
    groupName: 'Group',
    code: 'GRP101',
    shareUrl: 'https://splitflow.in/join/GRP101',
    totalSpent: 0,
    membersSpend: [{ name: 'You', amount: 0 }],
    highlights: [],
    chips: [
      { label: 'No expenses yet', type: 'green' },
      { label: '1 member', type: 'orange' },
    ],
  });

  const loadSummary = () => {
    groupService.getGroupSummary(params.groupId).then((res) => {
      if (res && res.groupName) {
        setSummaryData(res);
      }
    });
  };

  useEffect(() => {
    loadSummary();
  }, [params.groupId]);

  const inviteLink = summaryData.shareUrl || `https://splitflow.in/join/${summaryData.code}`;

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: `Join ${summaryData.groupName} on SplitFlow`,
        message: `Join my group "${summaryData.groupName}" on SplitFlow to track and split shared expenses!\n\n🔗 Link: ${inviteLink}\n🔑 Group Code: ${summaryData.code}`,
      });
    } catch (err) {
      console.warn('Share error:', err.message);
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(inviteLink);
    Alert.alert('Link Copied! 📋', `Invite link for "${summaryData.groupName}" copied to clipboard:\n${inviteLink}`);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
    }
  };

  const handleAddExpense = () => {
    router.push({
      pathname: '/add-expense',
      params: { groupId: summaryData.groupId || params.groupId },
    });
  };

  const handleActivity = () => {
    router.push({
      pathname: '/activity',
      params: { groupId: summaryData.groupId || params.groupId },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header: SplitFlow Logo & Back Button */}
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

        {/* Group Banner: Avatar Badge & Title */}
        <View style={styles.groupBanner}>
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>
              {summaryData.groupName.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupTitle}>{summaryData.groupName}</Text>
            <Text style={styles.groupMeta}>
              Code: {summaryData.code} • {summaryData.memberCount || summaryData.membersSpend?.length || 1} member{(summaryData.memberCount || summaryData.membersSpend?.length) === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        {/* Share & Invite Card */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeaderRow}>
            <View style={styles.inviteTitleLeft}>
              <Share2 size={18} color={Colors.primary} strokeWidth={2.4} />
              <Text style={styles.inviteCardTitle}>Invite Friends</Text>
            </View>
            <View style={styles.codePill}>
              <Text style={styles.codePillText}>Code: {summaryData.code}</Text>
            </View>
          </View>
          <Text style={styles.inviteDesc}>
            Share this invite link with friends so they can join and split expenses.
          </Text>
          <View style={styles.inviteActionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShareLink}
              style={styles.shareActionButton}
            >
              <Share2 size={16} color={Colors.white} strokeWidth={2.5} />
              <Text style={styles.shareActionText}>Share Invite Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyLink}
              style={styles.copyLinkButton}
            >
              <Copy size={16} color={Colors.primary} strokeWidth={2.2} />
              <Text style={styles.copyLinkText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Group Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeaderTitle}>Group Summary</Text>

          {/* Total Spent Hero */}
          <View style={styles.totalSpentSection}>
            <Text style={styles.totalAmountText}>
              ₹{(summaryData.totalSpent || 0).toLocaleString()}
            </Text>
            <Text style={styles.totalLabelText}>Total spent</Text>
          </View>

          {/* Member Spending Breakdown Row */}
          <View style={styles.memberBreakdownRow}>
            {(summaryData.membersSpend || []).map((member, index) => (
              <View key={index} style={styles.memberSpendCol}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberSpentAmount}>
                  ₹{(member.amount || 0).toLocaleString()} spent
                </Text>
              </View>
            ))}
          </View>

          {/* Highlights / Empty State */}
          {!summaryData.highlights || summaryData.highlights.length === 0 ? (
            <View style={styles.emptyHighlightsCard}>
              <Sparkles size={20} color={Colors.primary} strokeWidth={2.2} />
              <View style={styles.emptyHighlightsTextCol}>
                <Text style={styles.emptyHighlightsTitle}>No expenses recorded yet</Text>
                <Text style={styles.emptyHighlightsDesc}>
                  Share the invite link above, then tap "Add Expense" below to start tracking shared costs!
                </Text>
              </View>
            </View>
          ) : (
            summaryData.highlights.map((h, i) => (
              <View key={i} style={styles.highlightCard}>
                <View style={styles.highlightHeaderRow}>
                  <View style={[styles.miniBadge, { backgroundColor: h.badgeColor || Colors.primary }]}>
                    <Text style={styles.miniBadgeText}>{h.badgeInitials}</Text>
                  </View>
                  <Text style={styles.highlightTitle}>{h.title}</Text>
                </View>
                <Text style={styles.highlightDescription}>{h.description}</Text>
              </View>
            ))
          )}

          {/* Status Chips Row */}
          <View style={styles.chipsRow}>
            <View style={styles.greenChip}>
              <Text style={styles.greenChipText}>
                {summaryData.totalSpent === 0 ? 'No expenses yet' : 'All caught up'}
              </Text>
            </View>
            <View style={styles.orangeChip}>
              <Text style={styles.orangeChipText}>
                {summaryData.memberCount || summaryData.membersSpend?.length || 1} member{(summaryData.memberCount || summaryData.membersSpend?.length) === 1 ? '' : 's'}
              </Text>
            </View>
            <View style={styles.lavenderChip} />
          </View>
        </View>

        {/* Bottom Action Buttons: Add Expense & Activity */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddExpense}
            style={styles.addExpenseButton}
          >
            <PlusCircle size={18} color={Colors.white} strokeWidth={2.4} />
            <Text style={styles.addExpenseText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleActivity}
            style={styles.activityButton}
          >
            <Clock size={18} color={Colors.primary} strokeWidth={2.2} />
            <Text style={styles.activityText}>Activity</Text>
          </TouchableOpacity>
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
    paddingBottom: 24,
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
  groupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 14,
  },
  groupBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBadgeText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  groupMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  inviteCard: {
    backgroundColor: '#FAF5FD',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE0F8',
    marginBottom: 16,
  },
  inviteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inviteTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteCardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  codePill: {
    backgroundColor: '#EDE4F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  inviteDesc: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  inviteActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shareActionButton: {
    flex: 1.2,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shareActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  copyLinkButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#C3AAD2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  copyLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyHighlightsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  emptyHighlightsTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  emptyHighlightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  emptyHighlightsDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 17,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  totalSpentSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  totalAmountText: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.primary,
  },
  totalLabelText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  memberBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 2,
  },
  memberSpendCol: {
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  memberSpentAmount: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 3,
  },
  highlightCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  highlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  highlightDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  greenChip: {
    backgroundColor: '#D1E6D5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  greenChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  orangeChip: {
    backgroundColor: '#E8DCD0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  orangeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9A3412',
  },
  lavenderChip: {
    backgroundColor: '#E4DDF6',
    width: 90,
    height: 24,
    borderRadius: 12,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addExpenseButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addExpenseText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  activityButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C3AAD2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});

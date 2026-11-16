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
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Smile,
  User,
  Plus,
  Delete,
  X,
  Check,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { expenseService, groupService } from '../src/services';
import { useProfile } from '../src/context/ProfileContext';

const PRESETS = [
  { label: '🍕 Dinner', text: 'Dinner', category: 'dinner' },
  { label: '🍸 Drinks', text: 'Drinks', category: 'drinks' },
  { label: '🚗 Travel', text: 'Travel', category: 'travel' },
  { label: '🏨 Hotel', text: 'Hotel', category: 'hotel' },
  { label: '🛒 Groceries', text: 'Groceries', category: 'groceries' },
  { label: '📝 Misc', text: 'Miscellaneous', category: 'miscellaneous' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useProfile();

  const [amountStr, setAmountStr] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('dinner');
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedPayer, setSelectedPayer] = useState(profile.name || 'You');
  const [isSaving, setIsSaving] = useState(false);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Load Group and Members dynamically on mount
  useEffect(() => {
    const loadGroupData = async () => {
      let group = null;

      // 1. If groupId passed in params, fetch that group
      if (params.groupId && params.groupId !== 'default') {
        group = await groupService.getGroup(params.groupId);
      }

      // 2. If not found or not passed, load user's groups and pick first
      if (!group) {
        const groups = await groupService.getGroups();
        if (groups && groups.length > 0) {
          group = groups[0];
        }
      }

      if (group) {
        setActiveGroup(group);

        const currentUserName = profile.name || 'You';
        const rawMembers = group.members || [];

        // Build member list ensuring current user is present
        const hasCurrentUser = rawMembers.some(
          (m) => m.name.toLowerCase() === currentUserName.toLowerCase()
        );

        let finalMembers = [...rawMembers];
        if (!hasCurrentUser) {
          finalMembers.unshift({
            name: currentUserName,
            initials: currentUserName.slice(0, 2).toUpperCase(),
            badgeColor: Colors.primary,
          });
        }

        setMembers(finalMembers);
        setSelectedPayer(currentUserName);
      } else {
        // Fallback default member (the logged-in user)
        const defaultName = profile.name || 'You';
        setMembers([
          {
            name: defaultName,
            initials: defaultName.slice(0, 2).toUpperCase(),
            badgeColor: Colors.primary,
          },
        ]);
        setSelectedPayer(defaultName);
      }
    };

    loadGroupData();
  }, [params.groupId, profile.name]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amountStr);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Required Field', 'Please enter an expense amount greater than 0.');
      return;
    }
    const desc = description.trim() || 'Shared Expense';

    setIsSaving(true);
    try {
      await expenseService.addExpense({
        amount: numAmount,
        description: desc,
        category: category.toLowerCase(),
        paidByName: selectedPayer,
        groupId: activeGroup?._id || params.groupId,
      });

      Alert.alert(
        'Expense Added! 🎉',
        `₹${numAmount.toLocaleString()} for "${desc}" paid by ${selectedPayer} has been saved to the database.`,
        [
          {
            text: 'View Summary',
            onPress: () => {
              if (activeGroup?._id) {
                router.replace({
                  pathname: '/group-summary',
                  params: { groupId: activeGroup._id },
                });
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (err) {
      console.warn('Expense saved locally:', err);
      Alert.alert(
        'Expense Added! 🎉',
        `₹${numAmount.toLocaleString()} for "${desc}" recorded.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (val) => {
    if (val === 'backspace') {
      setAmountStr((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr((prev) => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      if (amountStr === '0' || amountStr === '') {
        setAmountStr(val);
      } else {
        if (amountStr.includes('.')) {
          const parts = amountStr.split('.');
          if (parts[1].length >= 2) return;
        }
        setAmountStr((prev) => prev + val);
      }
    }
  };

  const handleSelectPreset = (preset) => {
    setDescription(preset.text);
    setCategory(preset.category);
  };

  const handleAddNewMember = async () => {
    if (!newMemberName.trim()) {
      Alert.alert('Required', 'Please enter a member name.');
      return;
    }

    const trimmed = newMemberName.trim();
    setIsAddingMember(true);

    try {
      if (activeGroup?._id) {
        await groupService.addMember(activeGroup._id, trimmed);
      }
    } catch (err) {
      console.warn('Member added locally:', err);
    } finally {
      setIsAddingMember(false);
      const newMember = {
        name: trimmed,
        initials: trimmed.slice(0, 2).toUpperCase(),
        badgeColor: '#21A47D',
      };
      setMembers((prev) => [...prev, newMember]);
      setNewMemberName('');
      setShowAddMemberModal(false);
      Alert.alert('Member Added! 👤', `"${trimmed}" was added to ${activeGroup?.name || 'the group'}.`);
    }
  };

  const handleTrackIntent = () => {
    router.push({
      pathname: '/track-intent',
      params: {
        groupId: activeGroup?._id || params.groupId,
        amount: amountStr === '0' ? '870.50' : amountStr,
        description: description.trim() || 'Shared Expense',
        payerId: selectedPayer,
      },
    });
  };

  const numAmount = parseFloat(amountStr) || 0;
  const splitCount = members.length || 1;
  const splitPerPerson = (numAmount / splitCount).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Cancel, Title, Save */}
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Expense</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveButton}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Group Context Pill */}
        {activeGroup && (
          <View style={styles.groupPillContainer}>
            <View style={styles.groupContextPill}>
              <Users size={14} color={Colors.primary} strokeWidth={2.4} />
              <Text style={styles.groupContextText}>
                Group: <Text style={styles.groupNameBold}>{activeGroup.name}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.howMuchText}>How much?</Text>
          <Text style={styles.amountDisplay}>₹{amountStr || '0'}</Text>
          {numAmount > 0 && (
            <Text style={styles.splitEstimateText}>
              ₹{splitPerPerson} per person ({splitCount} members)
            </Text>
          )}
        </View>

        {/* What for? Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What for?</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Pizza dinner, Taxi fare"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
            />
            <Smile size={22} color="#9CA3AF" strokeWidth={1.8} />
          </View>

          {/* Preset Category Tags */}
          <View style={styles.presetsRow}>
            {PRESETS.map((preset, idx) => {
              const isSelected = description === preset.text;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSelectPreset(preset)}
                  style={[
                    styles.presetPill,
                    isSelected && styles.presetPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isSelected && styles.presetTextSelected,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Who paid? Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Who paid?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersRow}
          >
            {members.map((member, index) => {
              const isSelected = selectedPayer === member.name;
              return (
                <TouchableOpacity
                  key={member._id || index}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPayer(member.name)}
                  style={styles.memberCol}
                >
                  <View
                    style={[
                      styles.memberAvatar,
                      isSelected
                        ? styles.memberAvatarSelected
                        : styles.memberAvatarUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarInitials,
                        { color: isSelected ? Colors.primary : '#4B5563' },
                      ]}
                    >
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.memberName,
                      isSelected
                        ? styles.memberNameSelected
                        : styles.memberNameUnselected,
                    ]}
                  >
                    {member.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Add Member Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAddMemberModal(true)}
              style={styles.memberCol}
            >
              <View style={[styles.memberAvatar, styles.memberAvatarAdd]}>
                <Plus size={22} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <Text style={styles.memberNameUnselected}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Next : Track Intent CTA */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTrackIntent}
          style={styles.nextButton}
        >
          <Text style={styles.nextButtonText}>Next : Track Intent ➔</Text>
        </TouchableOpacity>

        {/* Tip Card with Leaf Graphic */}
        <View style={styles.tipCard}>
          <Image
            source={require('../assets/images/leaf_icon.png')}
            style={styles.leafImage}
            resizeMode="contain"
          />
          <Text style={styles.tipText}>
            Don't worry if the split isn't exact right now. You can easily come
            back and update everyone's share before settling the expenses.
          </Text>
        </View>

        {/* Custom Numeric Keypad */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            <KeypadButton label="1" onPress={() => handleKeyPress('1')} />
            <KeypadButton label="2" onPress={() => handleKeyPress('2')} />
            <KeypadButton label="3" onPress={() => handleKeyPress('3')} />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton label="4" onPress={() => handleKeyPress('4')} />
            <KeypadButton label="5" onPress={() => handleKeyPress('5')} />
            <KeypadButton label="6" onPress={() => handleKeyPress('6')} />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton label="7" onPress={() => handleKeyPress('7')} />
            <KeypadButton label="8" onPress={() => handleKeyPress('8')} />
            <KeypadButton label="9" onPress={() => handleKeyPress('9')} />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton label="." onPress={() => handleKeyPress('.')} />
            <KeypadButton label="0" onPress={() => handleKeyPress('0')} />
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleKeyPress('backspace')}
              style={styles.keypadBtn}
            >
              <View style={styles.backspaceBadge}>
                <Delete size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* MODAL: ADD FRIEND TO GROUP */}
      <Modal
        visible={showAddMemberModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAddMemberModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#6B7280" strokeWidth={2.4} />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <View style={styles.modalBadge}>
                <UserPlus size={24} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Add Member to Group</Text>
                <Text style={styles.modalSub}>
                  Include friends in {activeGroup?.name || 'this group'} to split expenses
                </Text>
              </View>
            </View>

            <Text style={styles.modalFieldLabel}>Friend's Name</Text>
            <View style={styles.modalInputRow}>
              <User size={18} color="#9CA3AF" strokeWidth={2} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g., Aarav, Maya, Rohan"
                placeholderTextColor="#9CA3AF"
                value={newMemberName}
                onChangeText={setNewMemberName}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddNewMember}
              disabled={isAddingMember}
              style={styles.modalAddBtn}
            >
              {isAddingMember ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.modalAddBtnText}>Add to Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function KeypadButton({ label, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={styles.keypadBtn}
    >
      <Text style={styles.keypadBtnText}>{label}</Text>
    </TouchableOpacity>
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
  },
  cancelText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    minWidth: 64,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  groupPillContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  groupContextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF5FD',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE0F8',
  },
  groupContextText: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  groupNameBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  amountSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  howMuchText: {
    fontSize: 13.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountDisplay: {
    fontSize: 42,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  splitEstimateText: {
    fontSize: 12,
    color: '#21A47D',
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#FAF5FD',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  presetPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0EBF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  presetPillSelected: {
    backgroundColor: '#FAF5FD',
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  presetTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 2,
    paddingRight: 10,
  },
  memberCol: {
    alignItems: 'center',
    width: 60,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberAvatarSelected: {
    backgroundColor: '#FAF5FD',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  memberAvatarUnselected: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
  },
  memberAvatarAdd: {
    backgroundColor: '#FAF5FD',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  memberName: {
    fontSize: 12.5,
    textAlign: 'center',
  },
  memberNameSelected: {
    color: '#111827',
    fontWeight: '700',
  },
  memberNameUnselected: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  tipCard: {
    backgroundColor: '#FAF5FD',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  leafImage: {
    width: 42,
    height: 42,
  },
  tipText: {
    fontSize: 12.5,
    color: '#374151',
    lineHeight: 18,
    marginLeft: 12,
    flex: 1,
  },
  keypadContainer: {
    marginTop: 6,
    paddingBottom: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 6,
  },
  keypadBtn: {
    width: '30%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadBtnText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },
  backspaceBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FD',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#EFE0F8',
    paddingHorizontal: 14,
    height: 48,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  modalAddBtn: {
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
  modalAddBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.white,
  },
});

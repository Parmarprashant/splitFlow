import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plane,
  Home,
  UserPlus,
  ArrowRight,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { PaginationDots, ProfileAvatar } from '../src/components/common';
import { groupService } from '../src/services';
import { useProfile } from '../src/context/ProfileContext';

const GROUP_TYPES = [
  { id: 'trip', label: 'Trip', icon: 'plane' },
  { id: 'rent', label: 'Rent', icon: 'home' },
  { id: 'party', label: 'Party' },
  { id: 'food', label: 'Food' },
  { id: 'other', label: 'Other' },
];

export default function CreateOrJoinGroupScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [groupName, setGroupName] = useState('');
  const [selectedType, setSelectedType] = useState('trip');
  const [groupCode, setGroupCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Required Field', 'Please enter a group name.');
      return;
    }

    setIsCreating(true);
    try {
      const creatorName = profile.name || 'You';
      const created = await groupService.createGroup(groupName.trim(), selectedType, creatorName);
      setIsCreating(false);
      router.push({
        pathname: '/group-summary',
        params: { groupId: created._id },
      });
    } catch (err) {
      console.warn('Group creation handled locally:', err);
      setIsCreating(false);
      router.push('/dashboard');
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      Alert.alert('Required Field', 'Please enter a group code or link.');
      return;
    }

    setIsJoining(true);
    try {
      const userName = profile.name || 'You';
      const joined = await groupService.joinGroup(groupCode.trim(), userName);
      setIsJoining(false);
      router.push({
        pathname: '/group-summary',
        params: { groupId: joined._id },
      });
    } catch (err) {
      setIsJoining(false);
      Alert.alert('Join Failed', err.message || 'Could not join group with this code.');
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Row: Logo & Profile Avatar */}
          <View style={styles.header}>
            <Image
              source={require('../assets/images/splitflow_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <ProfileAvatar size={38} onPress={handleProfilePress} />
          </View>

          {/* Page Headline & Subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.headline}>Create or join a group</Text>
            <Text style={styles.subtitle}>
              Start tracking expenses for your trip, rent, party, or any shared
              costs.
            </Text>
          </View>

          {/* Card 1: Create New Group */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create New Group</Text>

            {/* Field: Group Name */}
            <Text style={styles.fieldLabel}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Goa Trip, Apartment 3B, Birthday Party"
              placeholderTextColor="#9CA3AF"
              value={groupName}
              onChangeText={setGroupName}
            />

            {/* Field: Group Type */}
            <Text style={styles.fieldLabel}>Group Type</Text>
            <View style={styles.pillsContainer}>
              {GROUP_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedType(type.id)}
                    style={[
                      styles.pill,
                      isSelected ? styles.pillSelected : styles.pillUnselected,
                    ]}
                  >
                    {type.icon === 'plane' && (
                      <Plane
                        size={15}
                        color={isSelected ? Colors.white : '#1F2937'}
                        strokeWidth={2}
                      />
                    )}
                    {type.icon === 'home' && (
                      <Home
                        size={15}
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
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* CTA Button: Create Group */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCreateGroup}
              disabled={isCreating}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Create Group</Text>
              <View style={styles.arrowCircle}>
                <ArrowRight size={13} color={Colors.primary} strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Card 2: Join Existing Group */}
          <View style={styles.card}>
            <View style={styles.joinHeaderRow}>
              <UserPlus size={22} color={Colors.primary} strokeWidth={2.4} />
              <Text style={styles.cardTitle}>Join Existing Group</Text>
            </View>
            <Text style={styles.joinSubtitle}>
              You've been invited to a group? Enter the code or use the invite
              link.
            </Text>

            {/* Field: Group Code or Link */}
            <Text style={styles.fieldLabel}>Group Code or Link</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., XYZ789 or https://splitflow.in/join/XYZ789"
              placeholderTextColor="#9CA3AF"
              value={groupCode}
              onChangeText={setGroupCode}
              autoCapitalize="none"
            />

            {/* Outline Button: Join Group */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleJoinGroup}
              disabled={isJoining}
              style={styles.joinButton}
            >
              <Text style={styles.joinButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Pagination Dots (3rd dot active) */}
          <View style={styles.dotsContainer}>
            <PaginationDots total={3} activeIndex={2} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
    marginBottom: 8,
  },
  logoImage: {
    width: 170,
    height: 42,
  },
  titleContainer: {
    marginBottom: 18,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
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
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: Colors.white,
  },
  pillTextUnselected: {
    color: '#1F2937',
  },
  createButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  joinHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  joinSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  joinButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C3AAD2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  dotsContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});

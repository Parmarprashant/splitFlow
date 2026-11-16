import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Utensils,
  CheckCircle2,
  ClipboardList,
  Plane,
  ArrowLeftRight,
  ShoppingBag,
  RotateCw,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import { activityService, groupService } from '../src/services';

export default function ActivityFeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [groupName, setGroupName] = useState('Group');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (params.groupId) {
      groupService.getGroup(params.groupId).then((g) => {
        if (g?.name) setGroupName(g.name);
      });
    }

    activityService.getActivities(params.groupId).then((res) => {
      if (res && res.length > 0) {
        setItems(res);
      }
    });
  }, [params.groupId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({
        pathname: '/group-summary',
        params: { groupId: params.groupId },
      });
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const res = await activityService.getActivities(params.groupId);
      if (res && res.length > 0) {
        setItems(res);
      }
      Alert.alert('Activity Loaded', 'Showing all live group activities from database.');
    } catch (err) {
      Alert.alert('Activity', 'All historical group activities are loaded.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderIcon = (type, color) => {
    switch (type) {
      case 'food':
        return <Utensils size={18} color={color} strokeWidth={2.2} />;
      case 'settlement':
        return <CheckCircle2 size={18} color={color} strokeWidth={2.2} />;
      case 'sledding':
        return <ClipboardList size={18} color={color} strokeWidth={2.2} />;
      case 'flight':
        return <Plane size={18} color={color} strokeWidth={2.2} />;
      case 'transfer':
        return <ArrowLeftRight size={18} color={color} strokeWidth={2.2} />;
      case 'shopping':
        return <ShoppingBag size={18} color={color} strokeWidth={2.2} />;
      default:
        return <Utensils size={18} color={color} strokeWidth={2.2} />;
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
          <Text style={styles.pageTitle}>Activity Feed</Text>
          <Text style={styles.pageSubtitle}>
            Easily track, manage, and settle all shared expenses in one simple,
            organized place without confusion.
          </Text>
        </View>

        {/* Activity Card */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <MapPin size={18} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.cardTitle}>{groupName} Activity</Text>
          </View>

          {/* Activity List */}
          {items.map((item, index) => {
            const isGreen = item.amountColor === 'green';
            return (
              <View key={item._id || item.id || index}>
                <View style={styles.activityRow}>
                  {/* Icon Badge */}
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: item.badgeBg },
                    ]}
                  >
                    {renderIcon(item.iconType, item.iconColor)}
                  </View>

                  {/* Activity Details */}
                  <View style={styles.detailsCol}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityMeta}>{item.meta}</Text>
                  </View>

                  {/* Amount */}
                  <Text
                    style={[
                      styles.amountText,
                      isGreen ? styles.greenAmount : styles.purpleAmount,
                    ]}
                  >
                    {item.amount}
                  </Text>
                </View>

                {/* Divider between items */}
                {index < items.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* Bottom Button: Load More Activity */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLoadMore}
          disabled={isLoadingMore}
          style={styles.loadMoreButton}
        >
          <RotateCw size={18} color={Colors.primary} strokeWidth={2.2} />
          <Text style={styles.loadMoreText}>Load More Activity</Text>
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
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  activityMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  amountText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  purpleAmount: {
    color: Colors.primary,
  },
  greenAmount: {
    color: '#21A47D',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 54,
  },
  loadMoreButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C3AAD2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});

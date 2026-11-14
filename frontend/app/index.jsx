import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants';
import { Button, PaginationDots } from '../src/components/common';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Hero Container Card */}
        <View style={styles.heroCardContainer}>
          <View style={styles.heroCard}>
            {/* SplitFlow Logo with Handshake */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/images/splitflow_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Inner White Card with Dining Friends Illustration */}
            <View style={styles.illustrationCard}>
              <Image
                source={require('../assets/images/dining_card.png')}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Headline & Description */}
        <View style={styles.textContainer}>
          <Text style={styles.headline}>
            Split expenses without{'\n'}awkward moments
          </Text>
          <Text style={styles.description}>
            Keep track of shared expenses and settle up with your friends in just
            a few taps. No math, no tension.
          </Text>
        </View>

        {/* Pagination Dots (First dot active) */}
        <View style={styles.dotsContainer}>
          <PaginationDots total={3} activeIndex={0} />
        </View>

        {/* Action Button & Login Link */}
        <View style={styles.bottomContainer}>
          <Button
            title="Get Started"
            variant="primary-dark-text"
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />

          <View style={styles.loginLinkRow}>
            <Text style={styles.alreadyAccountText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleLogin}>
              <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  heroCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: '#F7F0FA',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#BF78EF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 220,
    height: 52,
  },
  illustrationCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  illustrationImage: {
    width: '100%',
    height: 200,
  },
  textContainer: {
    paddingHorizontal: 28,
    alignItems: 'center',
    marginTop: 24,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 34,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  dotsContainer: {
    marginTop: 26,
    marginBottom: 16,
  },
  bottomContainer: {
    paddingHorizontal: 24,
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  alreadyAccountText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loginText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, UserPlus } from 'lucide-react-native';
import { Colors } from '../src/constants';
import {
  Button,
  InputField,
  SocialButton,
  PaginationDots,
} from '../src/components/common';
import { authService } from '../src/services';
import { useProfile } from '../src/context/ProfileContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
  };

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register(name.trim(), email.trim(), password);
      if (res?.user) {
        updateProfile({
          name: res.user.name,
          email: res.user.email,
          upiId: res.user.upiId || `${res.user.name.split(' ')[0].toLowerCase()}@upi`,
        });
      }
      setLoading(false);
      Alert.alert(
        'Account Created! 🎉',
        `Welcome to SplitFlow, ${name.trim()}! Your account has been registered in the database.`,
        [{ text: 'Get Started', onPress: () => router.push('/create-or-join') }]
      );
    } catch (err) {
      setLoading(false);
      Alert.alert('Registration Failed', err.message || 'Could not connect to backend server. Please try again.');
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(`${provider} Sign Up`, `Sign up with ${provider}`);
  };

  const handleGoToLogin = () => {
    router.replace('/login');
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
          {/* Header with Back Arrow and Title */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={26} color="#A994CD" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign Up</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Hero Icon Container */}
          <View style={styles.heroIconContainer}>
            <View style={styles.heroIconCard}>
              <UserPlus size={36} color={Colors.primary} strokeWidth={2.2} />
            </View>
          </View>

          {/* Headline & Description */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>
              Join SplitFlow to easily track and split{'\n'}expenses with your friends.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <InputField
              label="Full Name"
              placeholder="Your full name"
              icon="user"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <InputField
              label="Email Address"
              placeholder="name@example.com"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              icon="lock"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <InputField
              label="Confirm Password"
              placeholder="••••••••"
              icon="lock"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Sign Up Button */}
            <Button
              title="Sign Up"
              variant="primary"
              onPress={handleSignUp}
              loading={loading}
              style={styles.signUpButton}
            />
          </View>

          {/* "or continue with" Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Up Buttons */}
          <View style={styles.socialRow}>
            <SocialButton
              type="google"
              onPress={() => handleSocialLogin('Google')}
            />
            <SocialButton
              type="apple"
              onPress={() => handleSocialLogin('Apple')}
            />
          </View>

          {/* Already have an account ? Log In */}
          <View style={styles.loginLinkRow}>
            <Text style={styles.hasAccountText}>
              Already have an account ?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleGoToLogin}>
              <Text style={styles.loginLinkText}>Log In</Text>
            </TouchableOpacity>
          </View>

          {/* Pagination Dots (3rd dot active) */}
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
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRightSpacer: {
    width: 40,
  },
  heroIconContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  heroIconCard: {
    width: 82,
    height: 82,
    borderRadius: 22,
    backgroundColor: '#F5EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: '#8B7E9B',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  formContainer: {
    width: '100%',
  },
  signUpButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 16,
    marginTop: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 13,
    color: '#9CA3AF',
    paddingHorizontal: 12,
    fontWeight: '400',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  hasAccountText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '400',
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  dotsContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});

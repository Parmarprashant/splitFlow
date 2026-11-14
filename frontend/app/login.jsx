import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  ChevronLeft,
  QrCode,
  Camera,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  ArrowRight,
  AtSign,
  ScanLine,
  RefreshCw,
} from 'lucide-react-native';
import { Colors } from '../src/constants';
import {
  Button,
  InputField,
  SocialButton,
  PaginationDots,
} from '../src/components/common';
import { authService } from '../src/services';
import { useProfile } from '../src/context/ProfileContext';

const QUICK_UPI_HANDLES = ['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl'];

export default function LoginScreen() {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // UPI & Scanner Pop-up State
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const [qrUri, setQrUri] = useState(null);
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
      if (res?.user) {
        const defaultUpi =
          res.user.upiId ||
          `${res.user.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`;

        setPendingUser(res.user);
        setUpiInput(defaultUpi);
        setQrUri(res.user.qrCodeUri || null);

        updateProfile({
          name: res.user.name,
          email: res.user.email,
          photoUri: res.user.photoUri || undefined,
          upiId: defaultUpi,
          qrCodeUri: res.user.qrCodeUri || null,
        });

        setLoading(false);
        // Show pop-up for UPI ID and scanner right after login!
        setShowUpiModal(true);
      } else {
        setLoading(false);
        router.push('/create-or-join');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Login Failed', err.message || 'Invalid email or password');
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(`${provider} Login`, `Continue with ${provider}`);
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  // UPI Pop-up Handlers
  const handleSelectHandle = (suffix) => {
    const currentPrefix = upiInput.includes('@')
      ? upiInput.split('@')[0]
      : upiInput.trim() || 'user';
    setUpiInput(`${currentPrefix}${suffix}`);
  };

  const handleOpenCameraScanner = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Please allow camera permission so you can scan or photograph your QR code.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setQrUri(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert(
        'Scanner',
        'Camera is not available on this simulator. You can choose a QR image from your gallery.'
      );
    }
  };

  const handleUploadQrFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setQrUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Gallery pick error:', err);
    }
  };

  const handleAutoGenerateQr = () => {
    const id = upiInput.trim() || 'user@upi';
    const autoQr = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=upi://pay?pa=${encodeURIComponent(
      id
    )}&pn=${encodeURIComponent(pendingUser?.name || 'SplitFlow User')}`;
    setQrUri(autoQr);
    Alert.alert('QR Generated! 📱', `Generated live payment QR for UPI ID: ${id}`);
  };

  const handleSavePaymentDetails = async () => {
    const finalUpi = upiInput.trim() || `${pendingUser?.name?.split(' ')[0]?.toLowerCase() || 'user'}@upi`;

    setIsSavingUpi(true);
    try {
      await authService.updateProfile({
        upiId: finalUpi,
        qrCodeUri: qrUri,
        email: pendingUser?.email,
      });

      updateProfile({
        upiId: finalUpi,
        qrCodeUri: qrUri,
      });
    } catch (err) {
      console.warn('Profile update locally saved:', err);
      updateProfile({
        upiId: finalUpi,
        qrCodeUri: qrUri,
      });
    } finally {
      setIsSavingUpi(false);
      setShowUpiModal(false);
      router.push('/create-or-join');
    }
  };

  const handleSkipModal = () => {
    setShowUpiModal(false);
    router.push('/create-or-join');
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
            <Text style={styles.headerTitle}>Login</Text>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* 3D Wallet Icon Container */}
          <View style={styles.walletContainer}>
            <Image
              source={require('../assets/images/wallet_icon.png')}
              style={styles.walletImage}
              resizeMode="contain"
            />
          </View>

          {/* Headline & Description */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage your daily spending and{'\n'}keep you finances on
              track.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <InputField
              label="Email Address"
              placeholder="name@example.com"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              icon="lock"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            {/* Log In Button */}
            <Button
              title="Log In"
              variant="primary"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </View>

          {/* "or continue with" Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
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

          {/* Don't have an account ? Sign Up */}
          <View style={styles.signUpRow}>
            <Text style={styles.noAccountText}>
              Don't have an account ?{' '}
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={handleSignUp}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Pagination Dots (Middle dot active) */}
          <View style={styles.dotsContainer}>
            <PaginationDots total={3} activeIndex={1} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* POPUP FOR UPI ID AND SCANNER AFTER LOGIN */}
      <Modal
        visible={showUpiModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleSkipModal}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboardAvoid}
          >
            <View style={styles.modalCard}>
              {/* Top Close Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSkipModal}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#6B7280" strokeWidth={2.4} />
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Header Badge & Title */}
                <View style={styles.modalHeaderSection}>
                  <View style={styles.modalIconBadge}>
                    <QrCode size={28} color={Colors.primary} strokeWidth={2.4} />
                  </View>
                  <Text style={styles.modalTitle}>Setup UPI ID & Scanner</Text>
                  <Text style={styles.modalSubtitle}>
                    Add your UPI details and payment QR code so group friends can settle dues with you in 1 tap!
                  </Text>
                </View>

                {/* Section 1: UPI ID Input */}
                <View style={styles.modalFieldSection}>
                  <Text style={styles.modalLabel}>Your Primary UPI ID</Text>
                  <View style={styles.upiInputWrapper}>
                    <View style={styles.atIconContainer}>
                      <AtSign size={18} color={Colors.primary} strokeWidth={2.4} />
                    </View>
                    <TextInput
                      style={styles.upiTextInput}
                      placeholder="e.g., yourname@okhdfcbank"
                      placeholderTextColor="#9CA3AF"
                      value={upiInput}
                      onChangeText={setUpiInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {upiInput.length > 3 && (
                      <Check size={18} color="#21A47D" strokeWidth={2.6} />
                    )}
                  </View>

                  {/* Quick Provider Chips */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.handlesRow}
                  >
                    {QUICK_UPI_HANDLES.map((suffix) => (
                      <TouchableOpacity
                        key={suffix}
                        activeOpacity={0.7}
                        onPress={() => handleSelectHandle(suffix)}
                        style={styles.handleChip}
                      >
                        <Text style={styles.handleChipText}>{suffix}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Section 2: QR Scanner / Upload Viewfinder */}
                <View style={styles.modalFieldSection}>
                  <View style={styles.qrLabelRow}>
                    <Text style={styles.modalLabel}>UPI QR Code / Scanner</Text>
                    {qrUri && (
                      <View style={styles.verifiedBadge}>
                        <Check size={12} color="#166534" strokeWidth={3} />
                        <Text style={styles.verifiedBadgeText}>Configured</Text>
                      </View>
                    )}
                  </View>

                  {qrUri ? (
                    /* Configured QR Preview */
                    <View style={styles.qrPreviewCard}>
                      <Image
                        source={{ uri: qrUri }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                      <View style={styles.qrPreviewInfo}>
                        <Text style={styles.qrPreviewTitle}>Personal QR Ready</Text>
                        <Text style={styles.qrPreviewMeta}>
                          Friends can scan this directly to pay you on SplitFlow.
                        </Text>
                        <View style={styles.qrActionsRow}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleOpenCameraScanner}
                            style={styles.reScanBtn}
                          >
                            <Camera size={14} color={Colors.primary} strokeWidth={2.2} />
                            <Text style={styles.reScanText}>Re-scan</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleUploadQrFromGallery}
                            style={styles.reScanBtn}
                          >
                            <ImageIcon size={14} color={Colors.primary} strokeWidth={2.2} />
                            <Text style={styles.reScanText}>Change</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    /* Viewfinder Scanner Box */
                    <View style={styles.scannerBox}>
                      <View style={styles.viewfinderCornerTL} />
                      <View style={styles.viewfinderCornerTR} />
                      <View style={styles.viewfinderCornerBL} />
                      <View style={styles.viewfinderCornerBR} />

                      <ScanLine size={36} color={Colors.primary} strokeWidth={2} />
                      <Text style={styles.scannerPromptTitle}>
                        Scan or Upload Payment QR
                      </Text>
                      <Text style={styles.scannerPromptSub}>
                        PhonePe • Google Pay • Paytm • BHIM
                      </Text>

                      {/* 2 Main Action Buttons: Camera Scanner & Gallery */}
                      <View style={styles.scannerButtonsRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleOpenCameraScanner}
                          style={styles.scanActionBtn}
                        >
                          <Camera size={16} color={Colors.white} strokeWidth={2.4} />
                          <Text style={styles.scanActionBtnText}>Open Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleUploadQrFromGallery}
                          style={styles.uploadActionBtn}
                        >
                          <ImageIcon size={16} color={Colors.primary} strokeWidth={2.4} />
                          <Text style={styles.uploadActionBtnText}>Upload Photo</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Quick Auto-generate QR Option */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleAutoGenerateQr}
                        style={styles.autoGenBtn}
                      >
                        <Sparkles size={14} color={Colors.primary} strokeWidth={2.2} />
                        <Text style={styles.autoGenText}>
                          Or auto-generate QR for "{upiInput || 'your ID'}"
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Modal CTA Buttons */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSavePaymentDetails}
                  disabled={isSavingUpi}
                  style={styles.saveUpiBtn}
                >
                  {isSavingUpi ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Text style={styles.saveUpiBtnText}>Save & Continue</Text>
                      <ArrowRight size={18} color={Colors.white} strokeWidth={2.6} />
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleSkipModal}
                  style={styles.skipBtn}
                >
                  <Text style={styles.skipBtnText}>Skip for now</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    paddingBottom: 20,
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
  walletContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  walletImage: {
    width: 95,
    height: 85,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
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
  loginButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26,
    marginTop: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 22,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noAccountText: {
    fontSize: 14,
    color: '#8B7E9B',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  dotsContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  // Modal Backdrop & Card
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoid: {
    width: '100%',
    maxHeight: '92%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalScrollContent: {
    paddingTop: 8,
    paddingBottom: 10,
  },
  modalHeaderSection: {
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  modalIconBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FAF5FD',
    borderWidth: 1.5,
    borderColor: '#EFE0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  modalFieldSection: {
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  upiInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FD',
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: '#EFE0F8',
    paddingHorizontal: 14,
    height: 50,
  },
  atIconContainer: {
    marginRight: 8,
  },
  upiTextInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  handlesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
  qrLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  // Scanner Viewfinder Card
  scannerBox: {
    backgroundColor: '#FBF9FE',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EFE0F8',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: Colors.primary,
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: Colors.primary,
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: Colors.primary,
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: Colors.primary,
  },
  scannerPromptTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  scannerPromptSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 14,
  },
  scannerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  scanActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  scanActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  uploadActionBtn: {
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
  uploadActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  autoGenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
    paddingVertical: 4,
  },
  autoGenText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // QR Preview
  qrPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FD',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE0F8',
    gap: 14,
  },
  qrImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrPreviewInfo: {
    flex: 1,
  },
  qrPreviewTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  qrPreviewMeta: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  qrActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  reScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  reScanText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Modal Actions
  saveUpiBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveUpiBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Colors.white,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  skipBtnText: {
    fontSize: 13.5,
    color: '#6B7280',
    fontWeight: '600',
  },
});

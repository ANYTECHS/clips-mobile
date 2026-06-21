import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, brandTeal } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const previewProgress = useRef(new Animated.Value(0)).current;

  const trimmedEmail = email.trim();
  const isEmailValid = useMemo(() => EMAIL_PATTERN.test(trimmedEmail), [trimmedEmail]);
  const showEmailError = touched && email.length > 0 && !isEmailValid;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(previewProgress, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(previewProgress, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [previewProgress]);

  const previewScale = previewProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });
  const playheadTranslate = previewProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 96],
  });

  function handlePlaceholderAuth(provider: 'Google' | 'Apple') {
    setStatusMessage(`${provider} sign-up will be connected when auth is ready.`);
  }

  function handleSubmit() {
    setTouched(true);
    if (!isEmailValid) return;

    setStatusMessage('Email accepted. Connect this form to the API to finish sign-up.');
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero} accessible accessibilityRole="summary">
              <View style={[styles.previewCard, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewDot, { backgroundColor: brandTeal }]} />
                  <ThemedText type="smallBold">AI Clip Preview</ThemedText>
                </View>
                <View style={styles.previewFrames}>
                  <Animated.View
                    style={[
                      styles.previewFrame,
                      styles.previewFramePrimary,
                      { transform: [{ scale: previewScale }] },
                    ]}
                  />
                  <View style={[styles.previewFrame, styles.previewFrameSecondary]} />
                  <View style={[styles.previewFrame, styles.previewFrameTertiary]} />
                </View>
                <View style={styles.previewFooter}>
                  <Animated.View
                    style={[
                      styles.previewBar,
                      {
                        backgroundColor: brandTeal,
                        transform: [{ translateX: playheadTranslate }],
                      },
                    ]}
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    12 viral clips ready
                  </ThemedText>
                </View>
              </View>

              <ThemedText type="title" style={styles.headline}>
                Create viral clips in minutes
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subhead}>
                Upload long-form content and let ClipCash find, package, and publish the best
                short clips for every platform.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <Pressable
                style={({ pressed }) => [
                  styles.socialButton,
                  { borderColor: theme.backgroundSelected, opacity: pressed ? 0.72 : 1 },
                ]}
                onPress={() => handlePlaceholderAuth('Google')}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
              >
                <ThemedText type="smallBold">Continue with Google</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.socialButton,
                  { borderColor: theme.backgroundSelected, opacity: pressed ? 0.72 : 1 },
                ]}
                onPress={() => handlePlaceholderAuth('Apple')}
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
              >
                <ThemedText type="smallBold">Continue with Apple</ThemedText>
              </Pressable>

              <View style={styles.dividerRow} accessible={false}>
                <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
                <ThemedText type="small" themeColor="textSecondary">
                  or
                </ThemedText>
                <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
              </View>

              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: showEmailError ? '#FF6B6B' : theme.backgroundSelected,
                    color: theme.text,
                    backgroundColor: theme.backgroundElement,
                  },
                ]}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setStatusMessage(null);
                }}
                onBlur={() => setTouched(true)}
                placeholder="Email address"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel="Email address"
                accessibilityHint="Enter a valid email address to enable sign up"
              />

              {showEmailError ? (
                <ThemedText style={styles.errorText}>Enter a valid email address.</ThemedText>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: brandTeal,
                    opacity: !isEmailValid ? 0.45 : pressed ? 0.72 : 1,
                  },
                ]}
                disabled={!isEmailValid}
                onPress={handleSubmit}
                accessibilityRole="button"
                accessibilityLabel="Get Started Free"
                accessibilityState={{ disabled: !isEmailValid }}
              >
                <ThemedText type="smallBold" style={styles.primaryButtonText}>
                  Get Started Free
                </ThemedText>
              </Pressable>

              {statusMessage ? (
                <ThemedText themeColor="textSecondary" style={styles.statusText}>
                  {statusMessage}
                </ThemedText>
              ) : null}

              <View style={styles.loginRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Already have an account?
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/sign-in')}
                  accessibilityRole="link"
                  accessibilityLabel="Log in"
                >
                  <ThemedText type="smallBold" style={styles.loginLink}>
                    Log in
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
              PROTECTED BY RECAPTCHA & PRIVACY POLICY
            </ThemedText>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  hero: {
    gap: Spacing.three,
  },
  previewCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previewFrames: {
    minHeight: 142,
    justifyContent: 'center',
  },
  previewFrame: {
    position: 'absolute',
    width: '74%',
    height: 92,
    borderRadius: Spacing.three,
  },
  previewFramePrimary: {
    right: Spacing.two,
    backgroundColor: '#172B2A',
    borderWidth: 1,
    borderColor: brandTeal,
  },
  previewFrameSecondary: {
    left: Spacing.four,
    top: Spacing.two,
    backgroundColor: '#303238',
    transform: [{ rotate: '-6deg' }],
  },
  previewFrameTertiary: {
    left: 0,
    bottom: Spacing.two,
    backgroundColor: '#101214',
    transform: [{ rotate: '5deg' }],
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  previewBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  headline: {
    fontSize: 42,
    lineHeight: 46,
  },
  subhead: {
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: Spacing.three,
  },
  socialButton: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: -Spacing.two,
  },
  primaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000',
  },
  statusText: {
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  loginLink: {
    color: brandTeal,
  },
  footer: {
    textAlign: 'center',
    letterSpacing: 0,
  },
});

import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { api } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';

export default function SignInScreen() {
  const theme = useTheme();
  const { promptAsync, disabled: googleDisabled } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMagicLink() {
    if (!email.trim()) return;
    setSending(true);
    try {
      await api.post('/auth/magic-link', { email: email.trim() });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Could not send magic link. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ThemedText type="title" style={styles.title}>
          ClipCash
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.sub}>
          Sign in to continue
        </ThemedText>

        {/* Google */}
        <Pressable
          style={[styles.googleBtn, { borderColor: theme.backgroundElement }]}
          disabled={googleDisabled}
          onPress={() => promptAsync()}>
          <ThemedText type="default">Continue with Google</ThemedText>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: theme.backgroundElement }]} />
          <ThemedText type="small" themeColor="textSecondary">or</ThemedText>
          <View style={[styles.line, { backgroundColor: theme.backgroundElement }]} />
        </View>

        {/* Magic link */}
        {sent ? (
          <ThemedText type="default" style={styles.sentMsg}>
            ✉️  Check your email — a magic link is on its way.
          </ThemedText>
        ) : (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.backgroundElement, color: theme.text },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="send"
              onSubmitEditing={sendMagicLink}
            />
            <Pressable
              style={[styles.magicBtn, (!email.trim() || sending) && styles.disabled]}
              disabled={!email.trim() || sending}
              onPress={sendMagicLink}>
              {sending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <ThemedText style={styles.magicBtnText}>Send Magic Link</ThemedText>
              )}
            </Pressable>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  title: { textAlign: 'center' },
  sub: { textAlign: 'center', marginTop: -Spacing.two },
  googleBtn: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  line: { flex: 1, height: 1 },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  magicBtn: {
    backgroundColor: '#00C9B1',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  magicBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  sentMsg: { textAlign: 'center', lineHeight: 24 },
});

import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing, brandTeal } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Manage your creator profile and account settings.
          </ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.avatar}>
            <ThemedText type="subtitle" style={styles.avatarText}>
              CC
            </ThemedText>
          </View>
          <View style={styles.profileCopy}>
            <ThemedText type="subtitle">ClipCash Creator</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Profile details will appear here once account APIs are connected.
            </ThemedText>
          </View>
        </ThemedView>

        <Pressable style={styles.actionButton}>
          <ThemedText type="smallBold" style={styles.actionButtonText}>
            Edit Profile
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#000',
  },
  profileCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  actionButton: {
    marginTop: 'auto',
    borderRadius: Spacing.three,
    backgroundColor: brandTeal,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#000',
  },
});

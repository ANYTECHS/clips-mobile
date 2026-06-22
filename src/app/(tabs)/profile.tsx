import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing, brandTeal } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/stores/auth-store";
import { useClipsStore } from "@/stores/clips-store";

// ── Derived stats ─────────────────────────────────────────────────────────────

const CONNECTED_PLATFORMS = 3; // TODO: wire from a platforms store
const TOTAL_EARNINGS = 342.0; // TODO: wire from earnings store / API

// ── Settings rows ─────────────────────────────────────────────────────────────

interface SettingItem {
  label: string;
  onPress: () => void;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, photoUrl }: { name?: string; photoUrl?: string }) {
  const theme = useTheme();
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (photoUrl) {
    // expo-image would be ideal here but we keep deps minimal
    return null;
  }

  return (
    <View style={[styles.avatarCircle, { backgroundColor: brandTeal }]}>
      <ThemedText style={[styles.avatarInitials, { color: "#000" }]}>
        {initials}
      </ThemedText>
    </View>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string | number; label: string }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}
    >
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText
        type="small"
        themeColor="textSecondary"
        style={styles.statLabel}
      >
        {label}
      </ThemedText>
    </View>
  );
}

// ── Setting row ───────────────────────────────────────────────────────────────

function SettingRow({ label, onPress }: SettingItem) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        {
          backgroundColor: pressed
            ? theme.backgroundSelected
            : theme.backgroundElement,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.settingChevron}>
        ›
      </ThemedText>
    </Pressable>
  );
}

// ── Sign-out confirmation dialog ─────────────────────────────────────────────

function SignOutDialog({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View
          style={[styles.dialog, { backgroundColor: theme.backgroundElement }]}
        >
          <ThemedText style={styles.dialogTitle}>Sign out?</ThemedText>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.dialogBody}
          >
            You'll need to sign back in to access your account.
          </ThemedText>
          <View style={styles.dialogActions}>
            <Pressable
              onPress={onCancel}
              style={[
                styles.dialogBtn,
                { backgroundColor: theme.backgroundSelected },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel sign out"
            >
              <ThemedText type="smallBold">Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.dialogBtn, styles.dialogBtnDestructive]}
              accessibilityRole="button"
              accessibilityLabel="Confirm sign out"
            >
              <ThemedText type="smallBold" style={styles.destructiveText}>
                Sign Out
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuthStore();
  const clipCount = Object.keys(useClipsStore((s) => s.selections)).length;
  const [showSignOut, setShowSignOut] = useState(false);

  async function handleSignOut() {
    setShowSignOut(false);
    await signOut();
    // Root layout's isAuthenticated guard redirects to /sign-in automatically
  }

  const settings: SettingItem[] = [
    { label: "Edit Profile", onPress: () => router.push("/edit-profile") },
    {
      label: "Notification Preferences",
      onPress: () => Alert.alert("Coming soon"),
    },
    { label: "Connect Accounts", onPress: () => Alert.alert("Coming soon") },
    { label: "Subscription Plan", onPress: () => Alert.alert("Coming soon") },
    { label: "Help & Support", onPress: () => Alert.alert("Coming soon") },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Avatar name={user?.name} />
            <ThemedText style={styles.displayName}>
              {user?.name ?? "Anonymous"}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.email ?? ""}
            </ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard value={clipCount} label="Clips" />
            <StatCard value={CONNECTED_PLATFORMS} label="Platforms" />
            <StatCard value={`$${TOTAL_EARNINGS.toFixed(0)}`} label="Earned" />
          </View>

          {/* Settings */}
          <View
            style={[
              styles.settingsGroup,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            {settings.map((item, i) => (
              <View key={item.label}>
                <SettingRow label={item.label} onPress={item.onPress} />
                {i < settings.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: theme.backgroundSelected },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Sign out */}
          <Pressable
            onPress={() => setShowSignOut(true)}
            style={styles.signOutBtn}
            accessibilityRole="button"
            accessibilityLabel="Sign out of your account"
          >
            <ThemedText type="smallBold" style={styles.signOutText}>
              Sign Out
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <SignOutDialog
        visible={showSignOut}
        onCancel={() => setShowSignOut(false)}
        onConfirm={handleSignOut}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },

  // Header
  header: { alignItems: "center", gap: Spacing.two },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 28, fontWeight: "700" },
  displayName: { fontSize: 22, fontWeight: "700" },

  // Stats
  statsRow: { flexDirection: "row", gap: Spacing.two },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: Spacing.three,
    alignItems: "center",
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { textAlign: "center" },

  // Settings
  settingsGroup: { borderRadius: 14, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  settingLabel: { fontSize: 16 },
  settingChevron: { fontSize: 20 },
  divider: { height: 1, marginHorizontal: Spacing.three },

  // Sign out
  signOutBtn: {
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e53e3e",
  },
  signOutText: { color: "#e53e3e" },

  // Dialog
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  dialog: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 18,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  dialogTitle: { fontSize: 18, fontWeight: "700" },
  dialogBody: { lineHeight: 20 },
  dialogActions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: Spacing.two + 2,
    borderRadius: 10,
    alignItems: "center",
  },
  dialogBtnDestructive: { backgroundColor: "#e53e3e" },
  destructiveText: { color: "#fff" },
});

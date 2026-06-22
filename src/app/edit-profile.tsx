import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing, brandTeal } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/stores/auth-store";

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // TODO: call PATCH /profile via api client
    // Optimistically update auth store once endpoint is available
    setSaving(false);
    router.back();
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      borderColor: theme.backgroundSelected,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Nav bar */}
          <View style={styles.nav}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ThemedText style={styles.navBack}>‹ Back</ThemedText>
            </Pressable>
            <ThemedText style={styles.navTitle}>Edit Profile</ThemedText>
            <View style={styles.navSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.label}
              >
                Display Name
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Display name input"
              />
            </View>

            <View style={styles.field}>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.label}
              >
                Email
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                accessibilityLabel="Email input"
              />
            </View>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, { opacity: saving ? 0.6 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              <ThemedText type="smallBold" style={styles.saveBtnText}>
                {saving ? "Saving…" : "Save Changes"}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },

  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  navBack: { fontSize: 17, color: brandTeal, minWidth: 60 },
  navTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" },
  navSpacer: { minWidth: 60 },

  form: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: { gap: Spacing.one },
  label: { marginLeft: 2 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: brandTeal,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: "center",
    marginTop: Spacing.two,
  },
  saveBtnText: { color: "#000" },
});

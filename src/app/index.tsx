import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing, brandTeal } from '@/constants/theme';

const RECENT_PROJECTS = [
  { title: 'Podcast highlights', editedAt: 'Edited 12 min ago', clips: 18 },
  { title: 'Gaming stream recap', editedAt: 'Edited yesterday', clips: 42 },
];

async function fetchDashboard() {
  // TODO: replace with real API call once the dashboard endpoint is wired.
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brandTeal}
            colors={[brandTeal]}
          />
        }>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.heroSection}>
            <View style={styles.heroCopy}>
              <ThemedText type="title" style={styles.title}>
                Welcome back, Creator!
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                Turn long videos into short clips, review the best moments, and publish faster.
              </ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quick Upload"
              onPress={() => router.push('/(tabs)/upload')}
              style={({ pressed }) => [styles.quickUploadButton, pressed && styles.pressed]}>
              <ThemedText type="smallBold" style={styles.quickUploadText}>
                Quick Upload
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.earningsCard}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Total Earnings
              </ThemedText>
              <ThemedText type="subtitle" style={styles.earningsAmount}>
                $12,480
              </ThemedText>
            </View>
            <View style={styles.changePill}>
              <ThemedText type="smallBold" style={styles.changeText}>
                +18.4%
              </ThemedText>
            </View>
          </ThemedView>

          <ThemedView style={styles.projectsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Recent Projects
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                2 active
              </ThemedText>
            </View>

            {RECENT_PROJECTS.map((project) => (
              <ThemedView type="backgroundElement" style={styles.projectCard} key={project.title}>
                <View style={styles.projectCopy}>
                  <ThemedText type="smallBold">{project.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {project.editedAt}
                  </ThemedText>
                </View>
                <View style={styles.clipBadge}>
                  <ThemedText type="smallBold" style={styles.clipBadgeText}>
                    {project.clips} clips
                  </ThemedText>
                </View>
              </ThemedView>
            ))}
          </ThemedView>

          {Platform.OS === 'web' && <WebBadge />}
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  heroSection: {
    gap: Spacing.four,
    paddingTop: Spacing.three,
  },
  heroCopy: {
    gap: Spacing.two,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  quickUploadButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    backgroundColor: brandTeal,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    opacity: 0.82,
  },
  quickUploadText: {
    color: '#000',
  },
  earningsCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  earningsAmount: {
    marginTop: Spacing.one,
  },
  changePill: {
    borderRadius: 999,
    backgroundColor: 'rgba(0, 229, 160, 0.16)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  changeText: {
    color: brandTeal,
  },
  projectsSection: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  projectCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  projectCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  clipBadge: {
    borderRadius: 999,
    backgroundColor: '#111111',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  clipBadgeText: {
    color: '#fff',
  },
});

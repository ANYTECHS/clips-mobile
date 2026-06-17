import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useJobProgress, type JobProgress } from '@/hooks/use-job-progress';
import { useTheme } from '@/hooks/use-theme';

// ─── Replace with your real API base URL and poll function ────────────────────
const WS_URL = process.env.EXPO_PUBLIC_API_WS_URL ?? 'ws://localhost:3000';

async function fetchJobProgress(jobId: string): Promise<JobProgress> {
  const res = await fetch(`${WS_URL.replace(/^ws/, 'http')}/jobs/${jobId}/progress`);
  if (!res.ok) throw new Error('poll failed');
  return res.json() as Promise<JobProgress>;
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ProcessingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { progress, status, estimatedSeconds, connectionState } = useJobProgress(
    jobId ?? null,
    WS_URL,
    fetchJobProgress,
  );
  const theme = useTheme();

  const isReconnecting = connectionState === 'reconnecting';
  const isPolling = connectionState === 'polling';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        {/* Reconnecting / polling banner */}
        {(isReconnecting || isPolling) && (
          <View style={[styles.banner, { backgroundColor: isPolling ? '#78350F' : '#1e3a5f' }]}>
            <ThemedText type="small" style={styles.bannerText}>
              {status}
            </ThemedText>
          </View>
        )}

        <ThemedView style={styles.card} type="backgroundElement">
          <ThemedText type="subtitle" style={styles.heading}>
            Processing your video
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.statusLabel}>
            {isReconnecting || isPolling ? '…' : status}
          </ThemedText>

          {/* Progress bar */}
          <View style={[styles.trackOuter, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.trackFill,
                { width: `${progress}%`, backgroundColor: '#0d9488' /* teal-600 */ },
              ]}
            />
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.progressLabel}>
            {progress}%
            {estimatedSeconds != null && estimatedSeconds > 0
              ? `  ·  ~${Math.ceil(estimatedSeconds / 60)} min remaining`
              : null}
          </ThemedText>
        </ThemedView>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: Spacing.one,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
  },
  card: {
    width: '100%',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  heading: { textAlign: 'center' },
  statusLabel: { textAlign: 'center' },
  trackOuter: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: { textAlign: 'center' },
});

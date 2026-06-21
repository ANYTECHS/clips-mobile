import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomTabInset, Spacing, brandTeal } from '@/constants/theme';
import { useClipsStore } from '@/stores/clips-store';

function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyIcon}>🎬</ThemedText>
      <ThemedText type="subtitle" style={styles.emptyHeading}>
        No clips yet
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.emptySubtitle}>
        Upload a video and AI will generate short viral clips for you.
      </ThemedText>
      <Pressable style={styles.ctaButton} onPress={() => router.push('/(tabs)/upload')}>
        <ThemedText type="smallBold" style={styles.ctaText}>
          Upload Your First Video
        </ThemedText>
      </Pressable>
    </View>
  );
}

function ClipSkeletonList() {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 4 }).map((_, index) => (
        <ThemedView
          key={index}
          type="backgroundElement"
          style={styles.skeletonCard}
        >
          <Skeleton
            height={112}
            borderRadius={Spacing.three}
            style={styles.skeletonThumbnail}
          />
          <View style={styles.skeletonCopy}>
            <Skeleton width="72%" height={18} />
            <Skeleton width="46%" height={14} />
          </View>
        </ThemedView>
      ))}
    </View>
  );
}

export default function MyClipsScreen() {
  const clips = Object.keys(useClipsStore((s) => s.selections));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 650);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="subtitle" style={styles.heading}>
          My Clips
        </ThemedText>
        {isLoading ? (
          <ClipSkeletonList />
        ) : clips.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={clips}
            keyExtractor={(id) => id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ThemedText style={styles.clipItem}>{item}</ThemedText>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingBottom: BottomTabInset },
  heading: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  emptyIcon: { fontSize: 64 },
  emptyHeading: { textAlign: 'center' },
  emptySubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  ctaButton: {
    backgroundColor: brandTeal,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  ctaText: { color: '#000' },
  list: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  clipItem: { paddingVertical: Spacing.two },
  skeletonList: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  skeletonCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  skeletonThumbnail: {
    alignSelf: 'stretch',
  },
  skeletonCopy: {
    gap: Spacing.two,
  },
});

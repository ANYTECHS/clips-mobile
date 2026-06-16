import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Clip, ClipGridItem } from '@/components/clip-grid-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

const NUM_COLUMNS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = Math.floor(SCREEN_WIDTH / NUM_COLUMNS);

// Sample clips — replace URIs with real content
const CLIPS: Clip[] = [
  {
    id: '1',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailColor: '#1a1a2e',
  },
  {
    id: '2',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailColor: '#16213e',
  },
  {
    id: '3',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailColor: '#0f3460',
  },
  {
    id: '4',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailColor: '#533483',
  },
  {
    id: '5',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailColor: '#2b2d42',
  },
  {
    id: '6',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailColor: '#3d5a80',
  },
  {
    id: '7',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailColor: '#293241',
  },
  {
    id: '8',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    thumbnailColor: '#1b4332',
  },
  {
    id: '9',
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailColor: '#40916c',
  },
];

export default function CurationScreen() {
  const insets = useSafeAreaInsets();
  // null means nothing is playing
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  // Track which clip IDs are currently visible on screen
  const visibleIdsRef = useRef<Set<string>>(new Set());

  const handlePress = useCallback((id: string) => {
    setActiveClipId((prev) => (prev === id ? null : id));
  }, []);

  // Called by FlatList whenever viewable items change
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const newVisible = new Set(viewableItems.map((v) => v.item.id as string));
      visibleIdsRef.current = newVisible;

      // If the active clip has scrolled off screen, pause it
      setActiveClipId((prev) => {
        if (prev !== null && !newVisible.has(prev)) {
          return null;
        }
        return prev;
      });
    },
    [],
  );

  // viewabilityConfig must be stable (not recreated on render)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: Clip }) => (
      <ClipGridItem
        clip={item}
        isActive={activeClipId === item.id}
        onPress={handlePress}
        size={CELL_SIZE}
      />
    ),
    [activeClipId, handlePress],
  );

  const keyExtractor = useCallback((item: Clip) => item.id, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        Curation
      </ThemedText>

      <FlatList
        data={CLIPS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // Performance tuning for smooth 60fps on mid-range Android
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={5}
        initialNumToRender={9}
        contentContainerStyle={{
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
});

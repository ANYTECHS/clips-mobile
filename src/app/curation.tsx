import { useState, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type Clip = {
  id: string;
  duration: string;
  score: number;
  /** seconds since epoch – used for "Recent" sort */
  createdAt: number;
};

type Tab = 'all' | 'viral' | 'recent';

// ─── Mock data ────────────────────────────────────────────────────────────────

const CLIPS: Clip[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  duration: `0:${String(15 + (i % 4) * 10).padStart(2, '0')}`,
  score: 98 - i * 3,
  createdAt: Date.now() - i * 60_000,
}));

// ─── Sub-components ──────────────────────────────────────────────────────────

function ClipCard({
  clip,
  selected,
  isTop,
  onPress,
}: {
  clip: Clip;
  selected: boolean;
  isTop: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement },
        selected && { borderColor: '#00D4AA', borderWidth: 2 },
      ]}
    >
      {/* Thumbnail placeholder */}
      <View style={[styles.thumbnail, { backgroundColor: theme.backgroundSelected }]}>
        {isTop && (
          <View style={styles.viralBadge}>
            <Text style={styles.viralBadgeText}>VIRAL POTENTIAL</Text>
          </View>
        )}
        {selected && (
          <View style={styles.checkOverlay}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.cardMeta}>
        <ThemedText type="small">{clip.duration}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Score: {clip.score}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const theme = useTheme();
  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Clips' },
    { key: 'viral', label: 'High Virality' },
    { key: 'recent', label: 'Recent' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabBar}
    >
      {tabs.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => onChange(t.key)}
          style={[
            styles.tab,
            { borderColor: theme.backgroundElement },
            active === t.key && { borderColor: '#00D4AA', backgroundColor: '#00D4AA22' },
          ]}
        >
          <ThemedText
            type="smallBold"
            style={active === t.key ? { color: '#00D4AA' } : undefined}
          >
            {t.label}
          </ThemedText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function CurationScreen() {
  const theme = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<Tab>('all');

  const filtered = useMemo(() => {
    if (tab === 'viral') return [...CLIPS].sort((a, b) => b.score - a.score).slice(0, 6);
    if (tab === 'recent') return [...CLIPS].sort((a, b) => b.createdAt - a.createdAt);
    return CLIPS;
  }, [tab]);

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...filtered.map((c) => c.id)]));
    }
  }

  const topId = filtered[0]?.id;
  const count = selected.size;

  return (
    <ThemedView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle">My Clips</ThemedText>
          <View style={styles.headerRight}>
            {count > 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                {count} selected
              </ThemedText>
            )}
            <Pressable onPress={toggleSelectAll} style={styles.selectAllBtn}>
              <ThemedText type="smallBold" style={{ color: '#00D4AA' }}>
                {allSelected ? 'Deselect All' : 'Select All'}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Tabs */}
        <TabBar active={tab} onChange={setTab} />

        {/* Grid */}
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <ClipCard
              clip={item}
              selected={selected.has(item.id)}
              isTop={item.id === topId}
              onPress={() => toggleSelect(item.id)}
            />
          )}
        />

        {/* Bottom action bar */}
        <View style={[styles.bottomBar, { borderTopColor: theme.backgroundElement }]}>
          <Pressable
            disabled={count === 0}
            style={[styles.postBtn, count === 0 && styles.postBtnDisabled]}
          >
            <Text style={styles.postBtnText}>
              {count > 0 ? `Post Selected Clips (${count})` : 'Post Selected Clips'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  selectAllBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },

  tabBar: { paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.two },
  tab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.five,
    borderWidth: 1,
  },

  grid: { paddingHorizontal: Spacing.two, paddingBottom: Spacing.six },
  row: { gap: Spacing.two, marginBottom: Spacing.two },

  card: { flex: 1, borderRadius: Spacing.two, overflow: 'hidden' },
  thumbnail: { aspectRatio: 9 / 16, width: '100%', justifyContent: 'flex-end' },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.two,
  },

  viralBadge: {
    margin: Spacing.one,
    alignSelf: 'flex-start',
    backgroundColor: '#FF4D6D',
    paddingHorizontal: Spacing.one,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viralBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  checkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00D4AA44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 28, fontWeight: '700' },

  bottomBar: {
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  postBtn: {
    backgroundColor: '#00D4AA',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
    alignItems: 'center',
  },
  postBtnDisabled: { backgroundColor: '#00D4AA55' },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

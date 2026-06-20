import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    BottomTabInset,
    Colors,
    MaxContentWidth,
    Spacing,
} from "@/constants/theme";
import { useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface PlatformEarnings {
  platform: "TikTok" | "YouTube" | "Reels" | "Twitch";
  amount: number;
  percentage: number;
}

interface PayoutRecord {
  id: string;
  method: "Bank Transfer" | "PayPal" | "BTC";
  date: string;
  status: "Pending" | "Completed";
  amount: number;
}

// Mock data
const platformEarnings: PlatformEarnings[] = [
  { platform: "TikTok", amount: 5420, percentage: 42 },
  { platform: "YouTube", amount: 3200, percentage: 25 },
  { platform: "Reels", amount: 2800, percentage: 22 },
  { platform: "Twitch", amount: 1420, percentage: 11 },
];

const payoutHistory: PayoutRecord[] = [
  {
    id: "1",
    method: "Bank Transfer",
    date: "Dec 15, 2024",
    status: "Completed",
    amount: 5000,
  },
  {
    id: "2",
    method: "PayPal",
    date: "Dec 8, 2024",
    status: "Completed",
    amount: 3500,
  },
  {
    id: "3",
    method: "BTC",
    date: "Dec 1, 2024",
    status: "Pending",
    amount: 2000,
  },
  {
    id: "4",
    method: "Bank Transfer",
    date: "Nov 24, 2024",
    status: "Completed",
    amount: 4200,
  },
];

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Utility function to get bar chart color
const getBarColor = (
  scheme: "light" | "dark" | "unspecified",
  isHighest: boolean,
): string => {
  if (isHighest) return "#14B8A6"; // teal
  return scheme === "dark" ? "#404046" : "#E0E1E6";
};

// Total Earnings Card Component
const TotalEarningsCard = ({
  scheme,
}: {
  scheme: "light" | "dark" | "unspecified";
}) => {
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const totalEarnings = 12840.5;
  const percentageChange = 12.5;

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.earningsCard, { borderColor: colors.backgroundSelected }]}
    >
      <View style={styles.earningsCardContent}>
        <ThemedText type="small">Total Earnings</ThemedText>
        <View style={styles.earningsAmount}>
          <ThemedText style={[styles.largeAmount, { color: colors.text }]}>
            {formatCurrency(totalEarnings)}
          </ThemedText>
          <View style={[styles.badgeContainer, { backgroundColor: "#D1FAE5" }]}>
            <ThemedText style={[styles.badgeText, { color: "#047857" }]}>
              +{percentageChange.toFixed(1)}%
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ThemedText type="small" style={{ marginBottom: Spacing.two }}>
          Progress to Monthly Goal
        </ThemedText>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.backgroundSelected },
          ]}
        >
          <View style={[styles.progressFill, { width: "65%" }]} />
        </View>
        <ThemedText
          type="small"
          style={{ marginTop: Spacing.one, color: colors.textSecondary }}
        >
          65% of $20,000
        </ThemedText>
      </View>
    </ThemedView>
  );
};

// Platform Bar Chart Component
const PlatformBarChart = ({
  scheme,
}: {
  scheme: "light" | "dark" | "unspecified";
}) => {
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const maxAmount = Math.max(...platformEarnings.map((p) => p.amount));
  const highestPlatform = platformEarnings.find(
    (p) => p.amount === maxAmount,
  )?.platform;

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.chartCard, { borderColor: colors.backgroundSelected }]}
    >
      <ThemedText style={{ marginBottom: Spacing.three }}>
        Earnings by Platform
      </ThemedText>

      <View style={styles.barChartContainer}>
        {platformEarnings.map(({ platform, amount, percentage }) => {
          const isHighest = platform === highestPlatform;
          const barHeight = (amount / maxAmount) * 150;
          const barColor = getBarColor(scheme, isHighest);

          return (
            <View key={platform} style={styles.barItem}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <ThemedText
                type="small"
                style={[styles.barLabel, { color: colors.textSecondary }]}
              >
                {platform}
              </ThemedText>
              <ThemedText type="small" style={{ marginTop: Spacing.one }}>
                {formatCurrency(amount)}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </ThemedView>
  );
};

// Payout History Item Component
const PayoutHistoryItem = ({
  item,
  scheme,
}: {
  item: PayoutRecord;
  scheme: "light" | "dark" | "unspecified";
}) => {
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const statusColor = item.status === "Completed" ? "#10B981" : "#F59E0B";

  return (
    <View
      style={[styles.payoutItem, { borderColor: colors.backgroundSelected }]}
    >
      <View style={styles.payoutItemLeft}>
        <ThemedText style={{ fontWeight: "600" }}>{item.method}</ThemedText>
        <ThemedText
          type="small"
          style={{ color: colors.textSecondary, marginTop: Spacing.one }}
        >
          {item.date}
        </ThemedText>
      </View>

      <View style={styles.payoutItemRight}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText
            type="small"
            style={[styles.statusText, { color: statusColor }]}
          >
            {item.status}
          </ThemedText>
        </View>
        <ThemedText style={{ fontWeight: "600", marginTop: Spacing.two }}>
          {formatCurrency(item.amount)}
        </ThemedText>
      </View>
    </View>
  );
};

// Main Earnings Screen Component
export default function EarningsScreen() {
  const [filterOpen, setFilterOpen] = useState(false);
  const scheme = useColorScheme() as "light" | "dark" | "unspecified";
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title">Earnings</ThemedText>
          </View>

          {/* Total Earnings Card */}
          <TotalEarningsCard scheme={scheme} />

          {/* Platform Bar Chart */}
          <PlatformBarChart scheme={scheme} />

          {/* Payout History Section */}
          <View style={styles.payoutSection}>
            <View style={styles.payoutHeader}>
              <ThemedText style={{ fontWeight: "600", fontSize: 16 }}>
                Last 30 Days
              </ThemedText>
              <Pressable
                style={[
                  styles.filterToggle,
                  { backgroundColor: colors.backgroundSelected },
                ]}
                onPress={() => setFilterOpen(!filterOpen)}
              >
                <ThemedText type="small">Filter</ThemedText>
              </Pressable>
            </View>

            {/* Payout History List */}
            <FlatList
              data={payoutHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PayoutHistoryItem item={item} scheme={scheme} />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: colors.backgroundSelected },
                  ]}
                />
              )}
            />

            {/* View All Button */}
            <Pressable
              style={[styles.viewAllButton, { borderColor: colors.text }]}
            >
              <ThemedText style={{ color: colors.text, fontWeight: "600" }}>
                View All Payouts
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    alignItems: "center",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  header: {
    width: "100%",
    marginBottom: Spacing.four,
    marginTop: Spacing.three,
  },
  earningsCard: {
    width: "100%",
    padding: Spacing.four,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
  },
  earningsCardContent: {
    marginBottom: Spacing.four,
  },
  earningsAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  largeAmount: {
    fontSize: 32,
    fontWeight: "700",
  },
  badgeContainer: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  badgeText: {
    fontWeight: "600",
    fontSize: 12,
  },
  progressContainer: {
    marginTop: Spacing.three,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#14B8A6",
  },
  chartCard: {
    width: "100%",
    padding: Spacing.four,
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 200,
    gap: Spacing.two,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barWrapper: {
    width: "100%",
    height: "80%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: "70%",
    borderRadius: Spacing.one,
  },
  barLabel: {
    marginTop: Spacing.two,
    textAlign: "center",
  },
  payoutSection: {
    width: "100%",
    marginTop: Spacing.two,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  filterToggle: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  payoutItemLeft: {
    flex: 1,
  },
  payoutItemRight: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: "600",
  },
  separator: {
    height: 1,
  },
  viewAllButton: {
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Spacing.two,
  },
});

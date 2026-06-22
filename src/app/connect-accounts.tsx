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
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface Integration {
  id: string;
  platform: string;
  icon: string;
  subtitle: string;
  isConnected: boolean;
  category: "social" | "web3";
}

// Mock data with emoji icons as placeholders
const integrations: Integration[] = [
  {
    id: "twitter",
    platform: "X / Twitter",
    icon: "𝕏",
    subtitle: "@username",
    isConnected: false,
    category: "social",
  },
  {
    id: "discord",
    platform: "Discord",
    icon: "⚙️",
    subtitle: "Not linked",
    isConnected: false,
    category: "social",
  },
  {
    id: "instagram",
    platform: "Instagram",
    icon: "📷",
    subtitle: "Not linked",
    isConnected: false,
    category: "social",
  },
  {
    id: "metamask",
    platform: "MetaMask",
    icon: "🦊",
    subtitle: "Not linked",
    isConnected: false,
    category: "web3",
  },
  {
    id: "phantom",
    platform: "Phantom",
    icon: "👻",
    subtitle: "Not linked",
    isConnected: false,
    category: "web3",
  },
  {
    id: "walletconnect",
    platform: "WalletConnect",
    icon: "🔗",
    subtitle: "Not linked",
    isConnected: false,
    category: "web3",
  },
];

// Integration Card Component
const IntegrationCard = ({
  item,
  onConnect,
  onDisconnect,
  scheme,
}: {
  item: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  scheme: "light" | "dark" | "unspecified";
}) => {
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = () => {
    if (item.isConnected) {
      setShowMenu(!showMenu);
    }
  };

  const handleDisconnectPress = () => {
    setShowMenu(false);
    Alert.alert(
      "Disconnect",
      `Are you sure you want to disconnect ${item.platform}?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Disconnect",
          onPress: () => onDisconnect(item.id),
          style: "destructive",
        },
      ],
    );
  };

  return (
    <Pressable onLongPress={handleLongPress}>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.integrationCard,
          { borderColor: colors.backgroundSelected },
        ]}
      >
        {/* Card Content */}
        <View style={styles.cardContentWrapper}>
          <View style={styles.cardHeader}>
            {/* Icon and Text */}
            <View style={styles.iconSection}>
              <ThemedText style={styles.icon}>{item.icon}</ThemedText>
              <View style={styles.textSection}>
                <ThemedText style={{ fontWeight: "600" }}>
                  {item.platform}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.subtitle, { color: colors.textSecondary }]}
                >
                  {item.subtitle}
                </ThemedText>
              </View>
            </View>

            {/* Connected Indicator */}
            {item.isConnected && (
              <View style={styles.connectedIndicator}>
                <View style={styles.greenDot} />
              </View>
            )}
          </View>

          {/* Action Button */}
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: item.isConnected
                  ? "#14B8A6"
                  : colors.backgroundSelected,
              },
            ]}
            onPress={() => {
              if (!item.isConnected) {
                onConnect(item.id);
              }
            }}
          >
            <ThemedText
              style={[
                styles.actionButtonText,
                {
                  color: item.isConnected ? "#fff" : colors.text,
                  fontWeight: "600",
                },
              ]}
            >
              {item.isConnected ? "Connected" : "Connect"}
            </ThemedText>
          </Pressable>
        </View>

        {/* Disconnect Menu */}
        {item.isConnected && showMenu && (
          <Pressable
            style={[
              styles.disconnectOption,
              { borderTopColor: colors.backgroundSelected },
            ]}
            onPress={handleDisconnectPress}
          >
            <ThemedText style={{ color: "#EF4444", fontWeight: "600" }}>
              Disconnect
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </Pressable>
  );
};

// Main Connect Accounts Screen Component
export default function ConnectAccountsScreen() {
  const scheme = useColorScheme() as "light" | "dark" | "unspecified";
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [accountState, setAccountState] = useState<Record<string, boolean>>({});

  const handleConnect = (id: string) => {
    const platform =
      integrations.find((i) => i.id === id)?.platform || "this service";
    // Show toast-like alert for placeholder OAuth handler
    Alert.alert("Connecting...", `Starting OAuth flow for ${platform}`, [
      {
        text: "OK",
        onPress: () => {
          setAccountState((prev) => ({ ...prev, [id]: true }));
        },
      },
    ]);
  };

  const handleDisconnect = (id: string) => {
    setAccountState((prev) => ({ ...prev, [id]: false }));
  };

  // Update integration objects with current state
  const updatedIntegrations = integrations.map((item) => ({
    ...item,
    isConnected: accountState[item.id] ?? false,
  }));

  const socialIntegrations = updatedIntegrations.filter(
    (i) => i.category === "social",
  );
  const web3Integrations = updatedIntegrations.filter(
    (i) => i.category === "web3",
  );

  const renderIntegrationCard = ({ item }: { item: Integration }) => (
    <IntegrationCard
      item={item}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      scheme={scheme}
    />
  );

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
            <ThemedText type="title">Connect Accounts</ThemedText>
            <ThemedText
              type="small"
              style={[
                styles.subtitle,
                { color: colors.textSecondary, marginTop: Spacing.two },
              ]}
            >
              Link your social and Web3 accounts to get started
            </ThemedText>
          </View>

          {/* Social & Web3 Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionHeader}>Social & Web3</ThemedText>

            {/* Social Integrations - 2 Column Grid */}
            <View style={styles.gridContainer}>
              <FlatList
                data={socialIntegrations}
                keyExtractor={(item) => item.id}
                renderItem={renderIntegrationCard}
                numColumns={2}
                columnWrapperStyle={styles.row}
                scrollEnabled={false}
              />
            </View>

            {/* Web3 Integrations - 2 Column Grid */}
            <View style={styles.gridContainer}>
              <FlatList
                data={web3Integrations}
                keyExtractor={(item) => item.id}
                renderItem={renderIntegrationCard}
                numColumns={2}
                columnWrapperStyle={styles.row}
                scrollEnabled={false}
              />
            </View>
          </View>

          {/* Info Section */}
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <ThemedText type="small" style={{ lineHeight: 20 }}>
              🔐 Your accounts are securely connected and encrypted. You can
              disconnect any time.
            </ThemedText>
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
  section: {
    width: "100%",
    marginBottom: Spacing.five,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.three,
  },
  subtitle: {
    lineHeight: 20,
  },
  gridContainer: {
    width: "100%",
    marginBottom: Spacing.three,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  integrationCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    overflow: "hidden",
    marginHorizontal: Spacing.one,
  },
  cardContentWrapper: {
    padding: Spacing.three,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.three,
  },
  iconSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.two,
  },
  icon: {
    fontSize: 32,
  },
  textSection: {
    flex: 1,
  },
  connectedIndicator: {
    marginLeft: Spacing.two,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  actionButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
  },
  disconnectOption: {
    borderTopWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
  },
  infoBox: {
    width: "100%",
    padding: Spacing.three,
    borderRadius: Spacing.two,
    marginBottom: Spacing.four,
  },
});

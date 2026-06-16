import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';

type PickedFile = { name: string; size?: number };

function formatBytes(bytes?: number) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme ?? 'light'];

  const [file, setFile] = useState<PickedFile | null>(null);
  const [url, setUrl] = useState('');

  const isValidUrl = url.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|tiktok\.com)\/.+/i);
  const canUpload = !!file || !!isValidUrl;

  async function pickVideo() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Camera roll access is needed to pick a video. Please enable it in Settings.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop() ?? 'video';
      setFile({ name, size: asset.fileSize ?? undefined });
      setUrl('');
    }
  }

  function handleUpload() {
    router.push({ pathname: '/processing', params: { url: file ? '' : url } });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.heading}>
          Upload Video
        </ThemedText>

        {/* Pick from library */}
        <Pressable
          style={[styles.pickButton, { borderColor: colors.backgroundElement }]}
          onPress={pickVideo}>
          <ThemedText type="default" style={styles.pickButtonText}>
            📂  Pick from Library
          </ThemedText>
        </Pressable>

        {/* File info */}
        {file && (
          <View style={[styles.fileInfo, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {file.name}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatBytes(file.size)}
            </ThemedText>
          </View>
        )}

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.line, { backgroundColor: colors.backgroundElement }]} />
          <ThemedText type="small" themeColor="textSecondary" style={styles.orText}>
            or
          </ThemedText>
          <View style={[styles.line, { backgroundColor: colors.backgroundElement }]} />
        </View>

        {/* URL input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.backgroundElement,
              color: colors.text,
              borderColor: isValidUrl ? '#00C9B1' : colors.backgroundElement,
            },
          ]}
          placeholder="Paste YouTube or TikTok URL"
          placeholderTextColor={colors.textSecondary}
          value={url}
          onChangeText={(t) => {
            setUrl(t);
            if (t) setFile(null);
          }}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* Upload button */}
        <Pressable
          style={[styles.uploadButton, !canUpload && styles.uploadButtonDisabled]}
          disabled={!canUpload}
          onPress={handleUpload}>
          <ThemedText style={styles.uploadButtonText}>⚡  Quick Upload</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
    justifyContent: 'center',
  },
  heading: { textAlign: 'center', marginBottom: Spacing.two },
  pickButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  pickButtonText: { fontSize: 16 },
  fileInfo: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  line: { flex: 1, height: 1 },
  orText: { flexShrink: 0 },
  input: {
    borderRadius: Spacing.two,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  uploadButton: {
    backgroundColor: '#00C9B1',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  uploadButtonDisabled: { opacity: 0.35 },
  uploadButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});

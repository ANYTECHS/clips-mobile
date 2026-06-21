import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors, brandTeal } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: brandTeal }, default: { color: colors.textSecondary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
          selectedColor={brandTeal}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(tabs)/upload">
        <NativeTabs.Trigger.Label>Upload</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/upload.png')}
          renderingMode="template"
          selectedColor={brandTeal}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(tabs)/my-clips">
        <NativeTabs.Trigger.Label>My Clips</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/my-clips.png')}
          renderingMode="template"
          selectedColor={brandTeal}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(tabs)/profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/profile.png')}
          renderingMode="template"
          selectedColor={brandTeal}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

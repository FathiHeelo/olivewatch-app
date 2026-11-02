import { I18nManager, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { colors } from '../theme';

// Layouts are written explicitly right-to-left (row-reverse), so the platform
// must not flip them a second time.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

export default function RootLayout() {
  const [loaded] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.ground }} />;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }} />
    </>
  );
}

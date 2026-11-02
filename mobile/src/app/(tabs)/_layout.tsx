import React from 'react';
import { View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName, PressScale, Row, Txt } from '../../components/ui';
import { colors } from '../../theme';

// Same five tabs as the Stitch design. «Scan» is the raised gold button in the middle.
const tabs: { name: string; label: string; ar: string; icon: IconName }[] = [
  { name: 'index', label: 'Home', ar: 'الرئيسية', icon: 'home' },
  { name: 'groves', label: 'Groves', ar: 'البساتين', icon: 'pine-tree' },
  { name: 'scan', label: 'Scan', ar: 'فحص', icon: 'line-scan' },
  { name: 'climate', label: 'Climate', ar: 'المناخ', icon: 'satellite-variant' },
  { name: 'profile', label: 'Profile', ar: 'الملف', icon: 'account-outline' },
];

type BarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function TabBar({ state }: BarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index].name;
  return (
    <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: insets.bottom, overflow: 'visible' }}>
      <Row style={{ height: 72, paddingHorizontal: 6, justifyContent: 'space-around', overflow: 'visible' }}>
        {tabs.map((t) => {
          const active = t.name === activeName;
          const center = t.name === 'scan';
          const go = () => {
            if (!active) router.navigate(t.name === 'index' ? '/' : (`/${t.name}` as '/scan'));
          };
          if (center && !active) {
            return (
              <PressScale key={t.name} onPress={go} accessibilityLabel={t.ar} style={{ alignItems: 'center', width: 76 }}>
                <View
                  style={{
                    marginTop: -34,
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.gold,
                    borderWidth: 5,
                    borderColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="sprout" size={28} color={colors.tertiary} />
                </View>
                <Txt size={12} face="label" color={colors.text} style={{ textAlign: 'center', lineHeight: 16 }}>
                  {t.label}
                </Txt>
              </PressScale>
            );
          }
          return (
            <PressScale
              key={t.name}
              onPress={go}
              accessibilityLabel={t.ar}
              style={{
                width: 72,
                minHeight: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.primaryContainer : 'transparent',
              }}
            >
              <Icon name={t.icon} size={24} color={active ? colors.onPrimaryContainer : colors.nav} />
              <Txt size={12} face="label" color={active ? colors.onPrimaryContainer : colors.nav} style={{ textAlign: 'center', lineHeight: 16 }}>
                {t.label}
              </Txt>
            </PressScale>
          );
        })}
      </Row>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.ar }} />
      ))}
    </Tabs>
  );
}

import React from 'react';
import { View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressScale, Row, Txt } from '../../components/ui';
import { colors, radius } from '../../theme';

type Icon = keyof typeof MaterialCommunityIcons.glyphMap;
const tabs: { name: string; label: string; icon: Icon }[] = [
  { name: 'index', label: 'الرئيسية', icon: 'home-variant' },
  { name: 'scan', label: 'فحص الورقة', icon: 'sprout' },
  { name: 'climate', label: 'المناخ', icon: 'weather-sunny' },
  { name: 'oil', label: 'الزيت', icon: 'water' },
];

type BarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function TabBar({ state }: BarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index].name;
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom,
      }}
    >
      {/* row-reverse puts «الرئيسية» on the right, as in the design */}
      <Row style={{ height: 64, paddingHorizontal: 4, justifyContent: 'space-around' }}>
        {tabs.map((t) => {
          const active = t.name === activeName;
          return (
            <PressScale
              key={t.name}
              accessibilityLabel={t.label}
              onPress={() => {
                if (!active) router.navigate(t.name === 'index' ? '/' : (`/${t.name}` as '/scan'));
              }}
              style={{
                minHeight: 48,
                minWidth: 76,
                paddingHorizontal: 10,
                borderRadius: radius.chip,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.navActiveFill : 'transparent',
                borderWidth: 1,
                borderColor: active ? colors.accentTrack : 'transparent',
              }}
            >
              <MaterialCommunityIcons name={t.icon} size={22} color={active ? colors.accent : colors.nav} />
              <Txt
                size={12}
                weight={active ? 'semibold' : 'regular'}
                color={active ? colors.accentInk : colors.nav}
                style={{ textAlign: 'center', lineHeight: 18 }}
              >
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
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}

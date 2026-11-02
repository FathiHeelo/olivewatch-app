import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Line, Polyline, Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

// ---------- Text (always RTL, tabular numerals) ----------
type Weight = keyof typeof fonts;
export function Txt({
  size = 15,
  weight = 'regular',
  color = colors.text,
  style,
  ...rest
}: TextProps & { size?: number; weight?: Weight; color?: string }) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fonts[weight],
          fontSize: size,
          color,
          textAlign: 'right',
          writingDirection: 'rtl',
          fontVariant: ['tabular-nums'],
          lineHeight: Math.round(size * 1.5),
        },
        style as TextStyle,
      ]}
    />
  );
}

// Arabic layout is explicit (row-reverse) so it behaves the same on web and native.
export function Row({ style, ...rest }: React.ComponentProps<typeof View>) {
  return <View {...rest} style={[{ flexDirection: 'row-reverse', alignItems: 'center' }, style]} />;
}

// ---------- Press feedback: scale to 0.97, 120ms, ease-out ----------
export function PressScale({
  children,
  style,
  outerStyle,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  outerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.timing(s, { toValue: v, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  return (
    <Pressable
      style={outerStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
    >
      <Animated.View style={[style, { transform: [{ scale: s }], opacity: disabled ? 0.5 : 1 }]}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------- Chips ----------
type Tone = 'neutral' | 'accent' | 'warning' | 'negative' | 'accentStrong';
const chipTone: Record<Tone, { bg: string; border: string; ink: string }> = {
  neutral: { bg: colors.raised, border: colors.border, ink: colors.muted },
  accent: { bg: colors.accentSoft, border: colors.accentTrack, ink: colors.accentInk },
  accentStrong: { bg: colors.accentTrack, border: colors.accentTrack, ink: colors.accentInk },
  warning: { bg: colors.warningSoft, border: colors.warningBorder, ink: colors.warningInk },
  negative: { bg: colors.negativeSoft, border: colors.negativeBorder, ink: colors.negative },
};
export function Chip({ label, tone = 'neutral', size = 12 }: { label: string; tone?: Tone; size?: number }) {
  const t = chipTone[tone];
  return (
    <View
      style={{
        backgroundColor: t.bg,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: radius.chip,
        paddingHorizontal: 9,
        paddingVertical: 3,
      }}
    >
      <Txt size={size} weight="medium" color={t.ink} style={{ lineHeight: size + 6 }}>
        {label}
      </Txt>
    </View>
  );
}

// ---------- Card ----------
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.card,
          padding: 16,
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Buttons ----------
export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityLabel={label} style={styles.primary}>
      <Row style={{ gap: 8, justifyContent: 'center' }}>
        {icon ? <MaterialCommunityIcons name={icon} size={18} color={colors.white} /> : null}
        <Txt size={16} weight="bold" color={colors.white}>
          {label}
        </Txt>
      </Row>
    </PressScale>
  );
}

export function OutlineButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityLabel={label} style={styles.outline}>
      <Row style={{ gap: 8, justifyContent: 'center' }}>
        {icon ? <MaterialCommunityIcons name={icon} size={18} color={colors.accentInk} /> : null}
        <Txt size={15} weight="semibold" color={colors.accentInk}>
          {label}
        </Txt>
      </Row>
    </PressScale>
  );
}

// ---------- Progress bar (animates to value, ease-out) ----------
export function ProgressBar({ value }: { value: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: value, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value, a]);
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.accentTrack, overflow: 'hidden', flexDirection: 'row-reverse' }}>
      <Animated.View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.accent,
          width: a.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

// ---------- Screen shell: 56px header + scroll body, fades in ----------
export function ScreenShell({
  title,
  subtitle,
  badge = 'بيانات تجريبية',
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [fade]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <View style={styles.header}>
        <Row style={{ gap: 8 }}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.accent} />
          <View>
            <Txt size={18} weight="semibold" style={{ lineHeight: 24 }}>
              {title}
            </Txt>
            {subtitle ? (
              <Txt size={12} weight="medium" color={colors.nav} style={{ lineHeight: 16 }}>
                {subtitle}
              </Txt>
            ) : null}
          </View>
        </Row>
        <Chip label={badge} />
      </View>
      <Animated.View style={{ flex: 1, opacity: fade }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 16 }}>{children}</ScrollView>
      </Animated.View>
    </View>
  );
}

// ---------- Line chart: single series, 5 faint gridlines, today marker ----------
export function LineChart({ values, todayLabel }: { values: number[]; todayLabel: string }) {
  const [w, setW] = useState(0);
  const H = 140;
  const padL = 30; // room for y labels (on the left, numbers stay LTR)
  const padR = 12;
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const plotW = Math.max(0, w - padL - padR);
  const y = (v: number) => 8 + (1 - v / 100) * (H - 16);
  const x = (i: number) => padL + (i / (values.length - 1)) * plotW;
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const last = values.length - 1;
  return (
    <View onLayout={onLayout} style={{ height: H }}>
      {w > 0 ? (
        <>
          <Svg width={w} height={H}>
            {[0, 25, 50, 75, 100].map((g) => (
              <Line key={g} x1={padL} x2={w - padR} y1={y(g)} y2={y(g)} stroke={colors.border} strokeWidth={1} />
            ))}
            <Line x1={x(last)} x2={x(last)} y1={8} y2={H - 8} stroke={colors.accent} strokeWidth={1} />
            <Polyline points={pts} fill="none" stroke={colors.accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <Circle cx={x(last)} cy={y(values[last])} r={4} fill={colors.accent} />
          </Svg>
          {[0, 25, 50, 75, 100].map((g) => (
            <Text
              key={g}
              style={{
                position: 'absolute',
                left: 0,
                top: y(g) - 8,
                width: padL - 6,
                textAlign: 'right',
                fontFamily: fonts.regular,
                fontSize: 11,
                color: colors.muted,
              }}
            >
              {g}
            </Text>
          ))}
          <View
            style={{
              position: 'absolute',
              left: Math.max(padL, x(last) - 92),
              top: 4,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radius.chip,
              paddingHorizontal: 6,
              paddingVertical: 1,
            }}
          >
            <Txt size={11} weight="bold" style={{ lineHeight: 16 }}>
              {todayLabel}
            </Txt>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.ground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  primary: {
    height: 48,
    borderRadius: radius.chip,
    backgroundColor: colors.accent,
    justifyContent: 'center',
  },
  outline: {
    minHeight: 48,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});

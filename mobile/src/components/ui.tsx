import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLang } from '../i18n';
import { colors, fonts, radius } from '../theme';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// ---------- Text: left-to-right like the Stitch design; `ar` for Arabic-only blocks; `face` for the Latin faces ----------
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type Face = 'arabic' | 'latin' | 'jakarta' | 'jakartaExtra' | 'label' | 'labelBold';
const faceFont = (face: Face, weight: Weight) =>
  face === 'latin' ? fonts.latin : face === 'jakarta' ? fonts.latinBold : face === 'jakartaExtra' ? fonts.latinExtra : face === 'label' ? fonts.label : face === 'labelBold' ? fonts.labelBold : fonts[weight];

// Readability floor: text is never below 14px, in every face. Only pill chips and the tab-bar labels opt down to 12px
// with `min={12}`. When the floor raises a size, a fixed lineHeight is scaled with it.
export function Txt({
  size = 14,
  weight = 'regular',
  face = 'arabic',
  color = colors.text,
  ar: _ar = false,
  min,
  style,
  children,
  ...rest
}: TextProps & { size?: number; weight?: Weight; face?: Face; color?: string; ar?: boolean; min?: number }) {
  const { rtl, trNode } = useLang();
  const content = trNode(children);
  if (content === '') return null;
  const px = Math.max(size, min ?? 14);
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const lineHeight = flat?.lineHeight !== undefined ? Math.round((flat.lineHeight * px) / size) : Math.round(px * 1.5);
  // The Latin faces have no Arabic glyphs: in Arabic mode every face maps to IBM Plex Sans Arabic.
  const bold = face === 'jakarta' || face === 'jakartaExtra' || face === 'labelBold';
  const font = rtl ? (bold || weight === 'bold' ? fonts.bold : face === 'arabic' ? fonts[weight] : fonts.medium) : faceFont(face, weight);
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: font,
          fontSize: px,
          color,
          textAlign: rtl ? 'right' : 'left',
          writingDirection: rtl ? 'rtl' : 'ltr',
          fontVariant: ['tabular-nums'],
        },
        style as TextStyle,
        { lineHeight },
      ]}
    >
      {content}
    </Text>
  );
}

// The Stitch design is laid out left-to-right with bilingual (Arabic + English) strings.
export function Row({ style, ...rest }: React.ComponentProps<typeof View>) {
  const { rowDir } = useLang();
  return <View {...rest} style={[{ flexDirection: rowDir, alignItems: 'center' }, style]} />;
}

export function Icon({ name, size = 20, color = colors.text, style }: { name: IconName; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
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
  const to = (v: number) => Animated.timing(s, { toValue: v, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
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

// ---------- Card, pill, eyebrow ----------
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.card, padding: 16, gap: 12 }, style]}>
      {children}
    </View>
  );
}

export function Pill({ label, bg = colors.secondaryContainer, ink = colors.primary, face = 'arabic', size = 11 }: { label: string; bg?: string; ink?: string; face?: Face; size?: number }) {
  const { tr } = useLang();
  if (tr(label) === '') return null;
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.chip, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Txt size={size} min={12} weight="bold" face={face} color={ink} style={{ lineHeight: size + 7, textAlign: 'center' }}>
        {label}
      </Txt>
    </View>
  );
}

// Section title: Arabic in Arabic mode, English in English mode, with an optional note at the far end.
export function Eyebrow({ ar, en, note }: { ar: string; en: string; note?: string }) {
  const { pick } = useLang();
  return (
    <Row style={{ justifyContent: 'space-between', paddingHorizontal: 2 }}>
      <Txt size={15} weight="bold" color={colors.primary}>
        {pick(ar, en)}
      </Txt>
      {note ? (
        <Txt size={11} weight="medium" color={colors.secondary}>
          {note}
        </Txt>
      ) : null}
    </Row>
  );
}

export function Bar({ value, color = colors.primaryContainer, track = colors.border }: { value: number; color?: string; track?: string }) {
  const { rowDir } = useLang();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: value, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [value, a]);
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: track, overflow: 'hidden', flexDirection: rowDir }}>
      <Animated.View style={{ height: 8, borderRadius: 4, backgroundColor: color, width: a.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

// ---------- Buttons ----------
export function Button({ label, icon, onPress, tone = 'primary', disabled }: { label: string; icon?: IconName; onPress?: () => void; tone?: 'primary' | 'light' | 'gold'; disabled?: boolean }) {
  const bg = tone === 'primary' ? colors.primaryContainer : tone === 'gold' ? colors.gold : colors.raised;
  const ink = tone === 'primary' ? colors.white : colors.primary;
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityLabel={label} style={{ minHeight: 52, borderRadius: radius.control, backgroundColor: bg, justifyContent: 'center', paddingHorizontal: 16 }}>
      <Row style={{ gap: 8, justifyContent: 'center' }}>
        {icon ? <Icon name={icon} size={20} color={ink} /> : null}
        <Txt size={14} weight="bold" color={ink}>
          {label}
        </Txt>
      </Row>
    </PressScale>
  );
}

// ---------- Headers ----------
export function BrandMark({ size = 22 }: { size?: number }) {
  return <Icon name="sprout" size={size} color={colors.primary} />;
}

export function BrandHeader({ right }: { right?: React.ReactNode }) {
  return (
    <Row style={{ height: 64, paddingHorizontal: 16, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Row style={{ gap: 8 }}>
        <BrandMark size={26} />
        <View>
          <Txt size={20} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 24 }}>
            OliveWatch AI
          </Txt>
        </View>
      </Row>
      {right}
    </Row>
  );
}

export function PageHeader({ title, subtitle, onBack, actions }: { title: string; subtitle?: string; onBack?: () => void; actions?: React.ReactNode }) {
  const { backIcon } = useLang();
  return (
    <Row style={{ minHeight: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Row style={{ gap: 8, flexShrink: 1 }}>
        {onBack ? (
          <PressScale onPress={onBack} accessibilityLabel="رجوع" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={backIcon} size={24} color={colors.primary} />
          </PressScale>
        ) : null}
        <View style={{ flexShrink: 1, paddingVertical: 6 }}>
          <Txt size={17} face="jakarta" color={colors.primary} style={{ lineHeight: 22 }}>
            {title}
          </Txt>
          {subtitle ? (
            <Txt size={12} color={colors.muted} style={{ lineHeight: 17 }}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
      </Row>
      <Row style={{ gap: 14 }}>{actions}</Row>
    </Row>
  );
}

// ---------- Scrolling screen body that fades in over 200ms ----------
export function Body({ children, pad = 16 }: { children: React.ReactNode; pad?: number }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [fade]);
  return (
    <Animated.View style={{ flex: 1, opacity: fade }}>
      <ScrollView contentContainerStyle={{ padding: pad, paddingBottom: 32, gap: 16 }}>{children}</ScrollView>
    </Animated.View>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: colors.ground }}>{children}</View>;
}

// ---------- Slider: tap or drag on the track; the thumb follows (works on web and native) ----------
export function Slider({ value, min, max, step = 1, onChange }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  const { rtl } = useLang();
  const [w, setW] = useState(0);
  const pct = (value - min) / (max - min);
  const set = (e: GestureResponderEvent) => {
    if (!w) return;
    const x = Math.min(1, Math.max(0, e.nativeEvent.locationX / w));
    const t = rtl ? 1 - x : x;
    const raw = min + t * (max - min);
    onChange(Math.round(raw / step) * step);
  };
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={set}
      onResponderMove={set}
      style={{ height: 48, justifyContent: 'center' }}
    >
      <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.border }} />
      <View style={{ position: 'absolute', [rtl ? 'right' : 'left']: pct * (w - 22), top: 13, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primaryContainer, borderWidth: 3, borderColor: colors.white }} />
    </View>
  );
}

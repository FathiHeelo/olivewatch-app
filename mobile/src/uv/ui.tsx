// Building blocks of the UV screening screens: OliveWatch colours (theme `uv` tokens) and Cairo / Tajawal type.
// Layout follows the Zaytoun Vision screens: capture cards, pipeline checklist, verdict, evidence, report.
import React from 'react';
import { View } from 'react-native';
import { Icon, IconName, PressScale, Row, Txt } from '../components/ui';
import { useLang } from '../i18n';
import { radius, uv, uvFonts } from '../theme';
import type { ConfidenceLevel, UvDecision } from './zaytoun';
import { uvText } from './zaytoun-i18n';

export function useUvText() {
  const { lang } = useLang();
  return uvText(lang);
}

export function H({ children, size = 20, color = uv.text }: { children: React.ReactNode; size?: number; color?: string }) {
  return (
    <Txt size={size} color={color} style={{ fontFamily: uvFonts.heading, lineHeight: Math.round(size * 1.45) }}>
      {children}
    </Txt>
  );
}

export function P({ children, size = 15, color = uv.muted, bold }: { children: React.ReactNode; size?: number; color?: string; bold?: boolean }) {
  return (
    <Txt size={size} color={color} style={{ fontFamily: bold ? uvFonts.bodyBold : uvFonts.body, lineHeight: Math.round(size * 1.6) }}>
      {children}
    </Txt>
  );
}

export function Card({ children, tint, borderColor }: { children: React.ReactNode; tint?: string; borderColor?: string }) {
  return <View style={{ backgroundColor: tint ?? uv.card, borderRadius: radius.card, borderWidth: 1, borderColor: borderColor ?? uv.border, padding: 16, gap: 10 }}>{children}</View>;
}

export function UvButton({ label, icon, onPress, tone = 'primary', disabled }: { label: string; icon?: IconName; onPress?: () => void; tone?: 'primary' | 'highlight' | 'outline'; disabled?: boolean }) {
  const bg = tone === 'primary' ? uv.primary : tone === 'highlight' ? uv.highlight : uv.card;
  const ink = tone === 'primary' ? uv.onPrimary : tone === 'highlight' ? uv.onHighlight : uv.primary;
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityLabel={label} outerStyle={{ flexGrow: 1 }} style={{ minHeight: 52, borderRadius: radius.control, backgroundColor: bg, borderWidth: tone === 'outline' ? 1.5 : 0, borderColor: uv.primary, justifyContent: 'center', paddingHorizontal: 16 }}>
      <Row style={{ gap: 8, justifyContent: 'center' }}>
        {icon ? <Icon name={icon} size={20} color={ink} /> : null}
        <Txt size={15} color={ink} style={{ fontFamily: uvFonts.bodyBold, textAlign: 'center' }}>
          {label}
        </Txt>
      </Row>
    </PressScale>
  );
}

/** The fixed notice at the bottom of every result. */
export function Notice() {
  const t = useUvText();
  return (
    <Row style={{ gap: 10, alignItems: 'flex-start', backgroundColor: uv.flaggedTint, borderRadius: radius.card, padding: 14 }}>
      <Icon name="information-outline" size={20} color={uv.flaggedInk} />
      <View style={{ flex: 1 }}>
        <P color={uv.text} bold>
          {t.notice}
        </P>
      </View>
    </Row>
  );
}

export const decisionTone = (d: UvDecision | null) =>
  d === null ? { tint: uv.retakeTint, ink: uv.retakeInk, bar: uv.track } : d === 'within_reference' ? { tint: uv.positiveTint, ink: uv.positiveInk, bar: uv.positive } : { tint: uv.flaggedTint, ink: uv.flaggedInk, bar: uv.flagged };

/** Status chip: tint plus text, never colour alone. */
export function DecisionChip({ decision }: { decision: UvDecision | null }) {
  const t = useUvText();
  const tone = decisionTone(decision);
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: tone.tint, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 4 }}>
      <Txt size={14} color={tone.ink} style={{ fontFamily: uvFonts.bodyBold }}>
        {decision ? t.decisions[decision].title : t.retakeTitle}
      </Txt>
    </View>
  );
}

/** Low / medium / high as three steps plus the word. */
export function LevelMeter({ level }: { level: ConfidenceLevel }) {
  const t = useUvText();
  const n = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
  return (
    <Row style={{ justifyContent: 'space-between', gap: 12 }}>
      <P color={uv.text} bold>
        {t.levelLabel}
      </P>
      <Row style={{ gap: 8 }}>
        <Row style={{ gap: 4 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ width: 18, height: 8, borderRadius: 4, backgroundColor: i <= n ? uv.primary : uv.track }} />
          ))}
        </Row>
        <P color={uv.text} bold>
          {t.levels[level]}
        </P>
      </Row>
    </Row>
  );
}

/** One emission channel: name, plain-language state, and its share of the liquid's emission. */
export function EvidenceRow({ label, state, share, color }: { label: string; state: string; share: number | null; color: string }) {
  const { rowDir } = useLang();
  return (
    <View style={{ gap: 6 }}>
      <Row style={{ justifyContent: 'space-between', gap: 8 }}>
        <P color={uv.text} bold>
          {label}
        </P>
        <P color={uv.text}>{state}</P>
      </Row>
      {share !== null ? (
        <View style={{ height: 10, borderRadius: 5, backgroundColor: uv.track, overflow: 'hidden', flexDirection: rowDir }}>
          <View style={{ width: `${Math.round(Math.max(0, Math.min(1, share)) * 100)}%`, backgroundColor: color, borderRadius: 5 }} />
        </View>
      ) : null}
    </View>
  );
}

export function BulletList({ items }: { items: readonly string[] }) {
  return (
    <View style={{ gap: 6 }}>
      {items.map((s) => (
        <Row key={s} style={{ gap: 8, alignItems: 'flex-start' }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: uv.primary, marginTop: 9 }} />
          <View style={{ flex: 1 }}>
            <P>{s}</P>
          </View>
        </Row>
      ))}
    </View>
  );
}

import { useState } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Chip, PressScale, ProgressBar, Row, ScreenShell, Txt } from '../../components/ui';
import { OIL_CONFIDENCE_FLOOR, OilClass, oilSamples } from '../../data/ml';
import { colors, radius } from '../../theme';

const classText: Record<OilClass, { label: string; tone: 'accent' | 'warning' | 'negative' }> = {
  reference: { label: 'ضمن المرجع', tone: 'accent' },
  anomalous: { label: 'قراءة شاذة', tone: 'warning' },
  adulteration_indicator: { label: 'مؤشر تلاعب محتمل', tone: 'negative' },
};

export default function Oil() {
  const [id, setId] = useState('c');
  const sample = oilSamples.find((s) => s.id === id)!;
  const r = sample.result;
  // Below the confidence floor the app never names a class: it asks for a lab.
  const needsLab = r.kind === 'lab' || r.confidence < OIL_CONFIDENCE_FLOOR;

  return (
    <ScreenShell title="فحص الزيت" icon="water">
      <View style={{ gap: 8 }}>
        <Txt size={14} weight="medium" color={colors.nav}>اختر عينة تجريبية</Txt>
        <Row style={{ gap: 8 }}>
          {oilSamples.map((s) => {
            const active = s.id === id;
            return (
              <PressScale
                key={s.id}
                accessibilityLabel={s.name}
                onPress={() => setId(s.id)}
                outerStyle={{ flex: 1 }}
                style={{
                  minHeight: 48,
                  borderRadius: radius.control,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : colors.border,
                }}
              >
                <Txt size={15} weight={active ? 'semibold' : 'regular'} color={active ? colors.accentInk : colors.text} style={{ textAlign: 'center' }}>
                  {s.name}
                </Txt>
              </PressScale>
            );
          })}
        </Row>
      </View>

      <Card>
        <Row style={{ justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 11 }}>
          <Row style={{ gap: 6 }}>
            <Txt size={15} weight="semibold">نتيجة الفحص الأولي</Txt>
            <MaterialCommunityIcons name="flask-outline" size={16} color={colors.accentInk} />
          </Row>
          <Chip label={r.source} />
        </Row>

        <View style={{ gap: 2 }}>
          <Txt size={12} weight="medium" color={colors.muted}>التصنيف</Txt>
          {needsLab ? (
            <Txt size={20} weight="bold" color={colors.warningInk}>يحتاج تحقق مخبري</Txt>
          ) : (
            <Row style={{ gap: 10 }}>
              <Txt size={20} weight="bold">{classText[(r as { label: OilClass }).label].label}</Txt>
              <Chip label="فحص أولي" tone={classText[(r as { label: OilClass }).label].tone} />
            </Row>
          )}
        </View>

        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt size={12} weight="medium" color={colors.muted}>نسبة الثقة</Txt>
            <Row style={{ gap: 2, alignItems: 'baseline' }}>
              <Txt size={24} weight="semibold" style={{ lineHeight: 30 }}>{Math.round(r.confidence * 100)}</Txt>
              <Txt size={12} weight="medium">%</Txt>
            </Row>
          </Row>
          <ProgressBar value={r.confidence * 100} />
          {needsLab ? (
            <Txt size={12} color={colors.muted}>
              {`أقل من حد الثقة (${Math.round(OIL_CONFIDENCE_FLOOR * 100)}%): لا نسمّي تصنيفاً.`}
            </Txt>
          ) : null}
        </View>

        <View style={{ backgroundColor: '#ECF0DE', borderColor: colors.border, borderWidth: 1, borderRadius: radius.chip, padding: 13 }}>
          <Row style={{ gap: 8, alignItems: 'flex-start' }}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.nav} style={{ marginTop: 2 }} />
            <Txt size={12} weight="medium" color="#44483B" style={{ flex: 1, lineHeight: 19 }}>
              هذا فحص أولي وليس شهادة جودة. للتأكد توجّه إلى مختبر معتمد.
            </Txt>
          </Row>
        </View>
      </Card>

      <View style={{ backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: 4, padding: 13 }}>
        <Txt size={13} color={colors.muted} style={{ lineHeight: 20 }}>
          نتائج الزيت هنا محاكاة: لا توجد صور زيت حقيقية بعد. النموذج الحقيقي يحتاج عينات مرجعية من مختبر.
        </Txt>
      </View>
    </ScreenShell>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, Chip, LineChart, Row, ScreenShell, Txt } from '../../components/ui';
import { simulatedSeries, stressBand } from '../../data/climate';
import { Climate, getRepository } from '../../data/repository';
import { colors } from '../../theme';

const monthsLevant = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];

function dayLabel(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getDate()} ${monthsLevant[d.getMonth()]}`;
}

export default function ClimateScreen() {
  const [c, setC] = useState<Climate | null>(null);
  useEffect(() => {
    getRepository().getClimate().then(setC);
  }, []);
  const series = useMemo(() => (c ? simulatedSeries(c.csi) : []), [c]);
  if (!c) return <ScreenShell title="المناخ والإجهاد البيئي" icon="weather-sunny"><View /></ScreenShell>;

  const band = stressBand(c.csi);
  const bandTone = band.band === 'low' ? 'accent' : band.band === 'medium' ? 'warning' : 'negative';

  const metrics = [
    { label: 'الحرارة', value: `${c.dT} درجة`, note: 'فوق المعدل', noteColor: colors.warningInk, chip: 'تنبيه نمو', tone: 'warning' as const },
    { label: 'الهطول التراكمي', value: `−${Math.abs(c.dP)} ملم`, note: 'عجز موسمي', noteColor: colors.negative, chip: 'شح مائي', tone: 'negative' as const },
    { label: 'أيام الجفاف المتتالية', value: `${c.dryDays} يوم`, note: 'بدون أمطار مؤثرة', noteColor: colors.nav, chip: 'تحت المراقبة', tone: 'accent' as const },
  ];

  return (
    <ScreenShell
      title="المناخ والإجهاد البيئي"
      subtitle={`نابلس \u2066(32.22° N, 35.26° E)\u2069`}
      badge={c.source}
      icon="weather-sunny"
    >
      <Card style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt size={18} weight="semibold" style={{ lineHeight: 24 }}>
            مؤشر الإجهاد المناخي (30 يوماً)
          </Txt>
          <Chip label={c.source} />
        </Row>
        <Row style={{ justifyContent: 'space-between', paddingTop: 4 }}>
          <Row style={{ gap: 6, alignItems: 'baseline' }}>
            <Txt size={24} weight="semibold" style={{ lineHeight: 30 }}>{c.csi.toFixed(1)}</Txt>
            <Txt size={14} weight="medium" color={colors.nav}>/ 100</Txt>
          </Row>
          <Chip label={band.label} tone={bandTone} />
        </Row>
        <View style={{ paddingTop: 8 }}>
          <LineChart values={series} todayLabel={`اليوم: ${c.csi.toFixed(1)}`} />
          <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 7, paddingHorizontal: 4 }}>
            <Txt size={12} weight="bold">اليوم</Txt>
            <Txt size={12} weight="medium" color={colors.muted}>{dayLabel(10)}</Txt>
            <Txt size={12} weight="medium" color={colors.muted}>{dayLabel(20)}</Txt>
            <Txt size={12} weight="medium" color={colors.muted}>{dayLabel(29)}</Txt>
          </Row>
        </View>
      </Card>

      <View style={{ gap: 8 }}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 2 }}>
          <Txt size={14} weight="medium" color={colors.nav}>المحددات الحيوية المباشرة</Txt>
          <Txt size={12} weight="medium" color={colors.nav}>قيم تجريبية</Txt>
        </Row>
        {metrics.map((m) => (
          <Card key={m.label} style={{ padding: 13, gap: 0 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Txt size={14} weight="medium">{m.label}</Txt>
                <Row style={{ gap: 10 }}>
                  <Txt size={24} weight="semibold" style={{ lineHeight: 30 }}>{m.value}</Txt>
                  <Txt size={12} weight="medium" color={m.noteColor}>{m.note}</Txt>
                </Row>
              </View>
              <View style={{ gap: 6, alignItems: 'flex-start' }}>
                <Chip label={c.source} />
                <Chip label={m.chip} tone={m.tone} />
              </View>
            </Row>
          </Card>
        ))}
      </View>

      <View style={{ backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: 4, padding: 13, gap: 6 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt size={14} weight="semibold">{`المصدر: ${c.provider}`}</Txt>
          <Txt size={12} weight="medium" color={colors.nav}>شبكة أرضية / أقمار صناعية</Txt>
        </Row>
        <Txt size={13} color={colors.muted} style={{ lineHeight: 20 }}>
          {`الحسابات تعتمد المقارنة بمتوسط السنوات ${c.baseline} لمنطقة جبال نابلس. القيم المعروضة هنا محاكاة للديمو إلى أن يُربط الاتصال الفعلي بـ ${c.provider}.`}
        </Txt>
      </View>
    </ScreenShell>
  );
}

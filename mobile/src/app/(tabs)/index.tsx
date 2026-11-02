import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Chip, PrimaryButton, ProgressBar, Row, ScreenShell, Txt } from '../../components/ui';
import { stressBand } from '../../data/climate';
import { getRepository, HomeData } from '../../data/repository';
import { colors } from '../../theme';

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  useEffect(() => {
    getRepository().getHome().then(setData);
  }, []);

  if (!data) return <ScreenShell title="أوليف ووتش" icon="sprout"><View /></ScreenShell>;
  const { farm, plots, climate } = data;
  const band = stressBand(climate.csi);
  const bandTone = band.band === 'low' ? 'accent' : band.band === 'medium' ? 'warning' : 'negative';

  return (
    <ScreenShell title="أوليف ووتش" icon="sprout">
      <View style={{ gap: 4 }}>
        <Txt size={24} weight="bold" style={{ lineHeight: 32 }}>
          {farm.name}
        </Txt>
        <Txt size={14} weight="medium" color={colors.muted}>
          {`المساحة: ${farm.areaDunum} دونم • ${farm.trees} شجرة ${farm.varieties}`}
        </Txt>
      </View>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt size={16}>مؤشر الإجهاد المناخي</Txt>
          <Chip label={climate.source} tone="accent" />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 6, alignItems: 'baseline' }}>
            <Txt size={28} weight="bold" style={{ lineHeight: 34 }}>
              {climate.csi.toFixed(1)}
            </Txt>
            <Txt size={16} color={colors.muted}>
              / 100
            </Txt>
          </Row>
          <Chip label={band.label} tone={bandTone} size={13} />
        </Row>
        <ProgressBar value={climate.csi} />
        <Row style={{ justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
          <Txt size={13} color={colors.muted}>{`مقارنة بمتوسط ${climate.baseline}`}</Txt>
          <Txt size={12} color={colors.muted}>{`ارتفاع ${climate.dT} درجة مئوية`}</Txt>
        </Row>
      </Card>

      <View style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt size={16}>{`حالة القطع الزراعية (${plots.length})`}</Txt>
          <Txt size={12} weight="medium" color={colors.muted}>
            تحديث ميداني
          </Txt>
        </Row>
        {plots.map((p) => {
          const bad = p.status === 'needs_check';
          return (
            <Card key={p.id} style={{ padding: 13, gap: 10 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row style={{ gap: 8 }}>
                  <Txt size={16}>{p.name}</Txt>
                  <Txt size={13} color={colors.muted}>{`• ${p.trees} شجرة`}</Txt>
                </Row>
                <Chip label={bad ? 'يحتاج فحص' : 'سليم'} tone={bad ? 'negative' : 'accent'} size={13} />
              </Row>
              <Row
                style={{
                  justifyContent: 'space-between',
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: 9,
                }}
              >
                <Txt size={12} color={bad ? colors.negative : colors.muted}>{`آخر فحص: ${p.lastCheck}`}</Txt>
                <Chip label={p.source} />
              </Row>
            </Card>
          );
        })}
      </View>

      <View style={{ paddingTop: 8 }}>
        <PrimaryButton label="افحص ورقة" icon="sprout" onPress={() => router.navigate('/scan')} />
      </View>
    </ScreenShell>
  );
}

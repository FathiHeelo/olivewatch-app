// Past UV screenings from the Realtime Database (uvScans/{userId}), newest first.
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, PressScale, Row, Screen } from '../components/ui';
import { useLang } from '../i18n';
import { uv } from '../theme';
import { StoredScan, subscribeUvScans } from '../uv/scans';
import { Card, DecisionChip, H, Notice, P, UvButton, useUvText } from '../uv/ui';

export default function UvHistory() {
  const t = useUvText();
  const { backIcon, lang } = useLang();
  const router = useRouter();
  const [scans, setScans] = useState<StoredScan[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => subscribeUvScans(setScans, () => setFailed(true)), []);

  const when = (at: number) => new Date(at).toLocaleString(lang === 'ar' ? 'ar' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Screen>
      <Row style={{ minHeight: 64, paddingHorizontal: 12, gap: 6, backgroundColor: uv.card, borderBottomWidth: 1, borderBottomColor: uv.border }}>
        <PressScale onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))} accessibilityLabel="رجوع" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={backIcon} size={24} color={uv.primary} />
        </PressScale>
        <View style={{ flex: 1 }}>
          <H size={18}>{t.historyTitle}</H>
        </View>
      </Row>
      <ScrollView style={{ backgroundColor: uv.bg }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        <UvButton label={t.startScan} icon="flashlight" onPress={() => router.push('/uv')} />
        {failed ? <P color={uv.text}>{t.errors.network}</P> : null}
        {scans === null && !failed ? <ActivityIndicator color={uv.primary} /> : null}
        {scans?.length === 0 ? <P>{t.historyEmpty}</P> : null}
        {scans?.map((s) => (
          <Card key={s.id}>
            <Row style={{ justifyContent: 'space-between', gap: 8 }}>
              <P size={14}>{when(s.at)}</P>
              {s.sampleId ? <P size={14} color={uv.text} bold>{`⁦${s.sampleId}⁩`}</P> : null}
            </Row>
            <DecisionChip decision={s.valid ? (s.decision ?? null) : null} />
            {s.valid && s.confidenceLevel ? (
              <P color={uv.text}>
                {t.levelLabel}: {t.levels[s.confidenceLevel]}
              </P>
            ) : null}
          </Card>
        ))}
        <Notice />
      </ScrollView>
    </Screen>
  );
}

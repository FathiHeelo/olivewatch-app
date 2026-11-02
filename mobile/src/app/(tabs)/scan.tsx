import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { pct, pickPhoto, sourceLabel } from '../../components/ai';
import { Card, Icon, IconName, Pill, PressScale, Row, Screen, Txt } from '../../components/ui';
import { LastScan, getLastScan, subscribeLastScan } from '../../data/scanStore';
import { useLang } from '../../i18n';
import { colors, radius } from '../../theme';

const leafPhoto = require('../../../assets/photos/leaf-scan.jpg');

// The three classes the AI screening can return (not a free choice of disease).
const targets: { label: string; dot: string; icon?: IconName }[] = [
  { label: 'Peacock Spot (عين الطاووس)', dot: colors.error },
  { label: 'Mite damage (Aculus olearius)', dot: colors.tertiaryContainer },
  { label: 'Healthy (سليم)', dot: colors.secondary, icon: 'check-circle-outline' },
];

export default function Scan() {
  const { rowDir, backIcon, nextIcon, pick, lang } = useLang();
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [last, setLast] = useState<LastScan | null>(getLastScan());
  useEffect(() => subscribeLastScan(() => setLast(getLastScan())), []);

  async function take(fromGallery: boolean) {
    const uri = await pickPhoto(fromGallery);
    if (!uri) return;
    setPhoto(uri);
    router.push({ pathname: '/diagnosis', params: { uri } });
  }

  const lastTitle = !last
    ? ''
    : last.result.kind === 'rejected'
      ? pick('صورة غير واضحة، أُعيد التصوير', 'Unclear image, retake')
      : last.result.label === 'healthy'
        ? pick('ورقة سليمة', 'Healthy leaf')
        : last.result.label === 'peacock_spot'
          ? pick('عين الطاووس', 'Peacock Spot')
          : pick('ضرر الحلم', 'Mite damage');

  return (
    <Screen>
      {/* Header */}
      <Row style={{ height: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Row style={{ gap: 6 }}>
          <PressScale onPress={() => router.navigate('/')} accessibilityLabel="رجوع" style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={backIcon} size={24} color={colors.primary} />
          </PressScale>
          <View>
            <Row style={{ gap: 6 }}>
              <Icon name="sprout" size={20} color={colors.primary} />
              <Txt size={19} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 24 }}>
                OliveWatch AI
              </Txt>
            </Row>
            <Txt size={14} color={colors.muted} style={{ lineHeight: 18 }}>
              فاحص أوراق الزيتون | Leaf Scanner
            </Txt>
          </View>
        </Row>
        <Row style={{ gap: 18 }}>
          <Icon name="flashlight" size={22} color={colors.primary} />
          <Icon name="information-outline" size={22} color={colors.primary} />
        </Row>
      </Row>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Viewfinder: the phone's own camera opens when you press the big button (there is no live preview here). */}
        <View style={{ height: 372, backgroundColor: colors.primary, overflow: 'hidden' }}>
          <Image source={photo ? { uri: photo } : leafPhoto} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" />
          <View style={{ margin: 16, backgroundColor: 'rgba(31,56,29,0.9)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(162,192,155,0.4)' }}>
            <Row style={{ gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondaryContainer }} />
              <View style={{ flex: 1 }}>
                <Txt size={14} face="labelBold" color={colors.white}>
                  {photo ? pick('تم اختيار الصورة', 'Photo selected') : pick('جاهز للفحص', 'Ready to scan')}
                </Txt>
                <Txt size={12} face="label" color={colors.secondaryContainer}>
                  {pick('فحص أولي بنموذج Gemini لورقة واحدة', 'Preliminary Gemini screening of one leaf')}
                </Txt>
              </View>
            </Row>
          </View>
          {(['top', 'bottom'] as const).flatMap((v) =>
            (['left', 'right'] as const).map((h) => (
              <View
                key={v + h}
                style={{
                  position: 'absolute',
                  [v]: v === 'top' ? 100 : 62,
                  [h]: 32,
                  width: 28,
                  height: 28,
                  borderColor: colors.secondaryContainer,
                  [`border${v === 'top' ? 'Top' : 'Bottom'}Width`]: 3,
                  [`border${h === 'left' ? 'Left' : 'Right'}Width`]: 3,
                }}
              />
            )),
          )}
          <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: 'rgba(245,251,240,0.95)', borderRadius: radius.chip, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Row style={{ gap: 8 }}>
              <Icon name="ruler" size={16} color={colors.primary} />
              <Txt size={14} weight="medium" color={colors.primary} style={{ flex: 1 }}>
                Keep leaf 15cm under daylight | وجّه الكاميرا لسطح الورقة تحت ضوء طبيعي
              </Txt>
            </Row>
          </View>
        </View>

        {/* What the screening can return */}
        <View style={{ backgroundColor: colors.surface, paddingTop: 14, paddingBottom: 14, gap: 10 }}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <Row style={{ gap: 8 }}>
              <Icon name="filter-variant" size={18} color={colors.primary} />
              <Txt size={14} face="labelBold" color={colors.primary}>
                {pick('الفئات الممكنة', 'Possible results')}
              </Txt>
            </Row>
            <Txt size={12} face="labelBold" color={colors.secondary}>
              {pick('فحص أولي', 'Preliminary')}
            </Txt>
          </Row>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {targets.map((t) => (
              <Row key={t.label} style={{ gap: 8, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.chip, paddingHorizontal: 14, height: 40 }}>
                {t.icon ? <Icon name={t.icon} size={16} color={colors.secondary} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.dot }} />}
                <Txt size={13} face="labelBold" color={colors.primary}>
                  {t.label}
                </Txt>
              </Row>
            ))}
          </ScrollView>
        </View>

        {/* Capture controls */}
        <Row style={{ backgroundColor: colors.low, paddingHorizontal: 24, paddingVertical: 18, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <PressScale onPress={() => take(true)} accessibilityLabel="Upload Gallery" style={{ alignItems: 'center', gap: 4, width: 104, minHeight: 96 }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image-multiple-outline" size={26} color={colors.primary} />
            </View>
            <Txt size={13} face="label" color={colors.primary} style={{ textAlign: 'center' }}>
              Upload Gallery
            </Txt>
          </PressScale>
          <PressScale onPress={() => take(false)} accessibilityLabel={pick('التقط صورة', 'Take a photo')} style={{ width: 108, height: 108, borderRadius: 54, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B4BBA6', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="leaf" size={34} color={colors.gold} />
              </View>
            </View>
          </PressScale>
          <View style={{ width: 104 }} />
        </Row>

        <View style={{ paddingHorizontal: 16, gap: 12, backgroundColor: colors.low }}>
          {last ? (
            <PressScale onPress={() => router.push({ pathname: '/diagnosis', params: { last: '1' } })} accessibilityLabel="Recent Diagnostic" style={{ backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 72 }}>
              <Row style={{ gap: 12 }}>
                <Image source={{ uri: last.uri }} style={{ width: 48, height: 48, borderRadius: 14 }} contentFit="cover" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
                    <Txt size={14} face="labelBold" color={colors.primary}>
                      Recent Diagnostic
                    </Txt>
                    <Pill label={sourceLabel(last.result.source, lang)} bg={colors.secondaryContainer} face="labelBold" size={12} />
                  </Row>
                  <Txt size={14} color={colors.muted}>
                    {lastTitle}
                    {last.result.kind === 'ok' ? ` • ${pct(last.result.confidence)}` : ''}
                  </Txt>
                </View>
                <Icon name={nextIcon} size={22} color={colors.faint} />
              </Row>
            </PressScale>
          ) : null}
          <Card style={{ backgroundColor: colors.raised, flexDirection: rowDir, gap: 12, alignItems: 'flex-start' }}>
            <Icon name="alert-outline" size={22} color={colors.tertiaryContainer} />
            <Txt size={14} face="latin" color={colors.muted} style={{ flex: 1, lineHeight: 21 }}>
              <Txt size={14} face="jakarta" color={colors.primary}>
                Field Advisory:{' '}
              </Txt>
              AI preliminary scan for agricultural guidance. Consult local cooperative agronomist before heavy fungicide or pesticide application.
            </Txt>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

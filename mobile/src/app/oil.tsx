import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Switch, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SourceBadge, pct, pickPhoto } from '../components/ai';
import { Bar, Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../components/ui';
import { OilClass, OilResult, oilSamples, predictOil } from '../data/ml';
import { useLang } from '../i18n';
import { colors, radius } from '../theme';

// Static lab-value cards from the design. They are shown only for the demo samples, never for a live photo.
const cards: { icon: IconName; iconColor: string; ar: string; value: string; unit?: string; valueColor: string; sub: string; chip: string; chipBg: string; chipInk: string }[] = [
  { icon: 'grass', iconColor: colors.secondary, ar: 'نسبة الكلوروفيل', value: '4.8', valueColor: colors.primary, sub: 'مؤشر الكاروتين النموذجي', chip: 'مرتفعات جبلية بكر', chipBg: colors.raised, chipInk: colors.muted },
  { icon: 'shield-outline', iconColor: '#0E9F6E', ar: 'مخاطر الخلط والشوائب', value: '< 1.2%', valueColor: '#047857', sub: 'انحراف غير مرصود', chip: 'نقاء فائق (خالٍ من الزيوت المكررة)', chipBg: '#E3F3EA', chipInk: '#047857' },
  { icon: 'flask-outline', iconColor: colors.tertiaryContainer, ar: 'حموضة تقديرية (FFA)', value: '~0.35%', valueColor: colors.primary, sub: 'حمض الأوليك المقدر', chip: 'معيار البكر الممتاز (<0.8%)', chipBg: '#E6F0D2', chipInk: colors.primary },
  { icon: 'leaf', iconColor: colors.primary, ar: 'رقم البيروكسيد (PV)', value: '<8', unit: 'meq O₂', valueColor: colors.primary, sub: 'طازج / عصر موسمي', chip: 'أكسدة متدنية جداً', chipBg: colors.raised, chipInk: colors.muted },
];

const ltr = (s: string) => `⁦${s}⁩`;

type Live = { phase: 'idle' } | { phase: 'loading'; uri: string } | { phase: 'done'; uri: string; result: OilResult; ms: number };

export default function Oil() {
  const { backIcon, rowDir, pick, lang } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<'live' | 'demo'>('live');
  const [compare, setCompare] = useState(false);
  const [live, setLive] = useState<Live>({ phase: 'idle' });
  const [sample, setSample] = useState(oilSamples[0].id);
  const langRef = useRef(lang);
  langRef.current = lang;
  const alive = useRef(true);
  useEffect(() => () => {
    alive.current = false;
  }, []);

  async function capture(fromGallery: boolean) {
    const uri = await pickPhoto(fromGallery);
    if (!uri) return;
    setLive({ phase: 'loading', uri });
    const t0 = Date.now();
    const result = await predictOil(uri, langRef.current);
    if (alive.current) setLive({ phase: 'done', uri, result, ms: Date.now() - t0 });
  }

  const web = Platform.OS === 'web';
  const demo = mode === 'demo';
  const shown: OilResult | null = demo ? (oilSamples.find((s) => s.id === sample)?.result ?? null) : live.phase === 'done' ? live.result : null;
  const photoUri = !demo && live.phase !== 'idle' ? live.uri : null;

  const className: Record<OilClass, { title: string; sub: string; icon: IconName; tone: string }> = {
    reference: { title: pick('نمط مرجعي', 'Reference pattern'), sub: pick('الفلورة قريبة من النمط المرجعي للزيت البكر', 'Fluorescence is close to the virgin-oil reference pattern'), icon: 'check-circle-outline', tone: colors.secondary },
    anomalous: { title: pick('نمط شاذ', 'Anomalous pattern'), sub: pick('الفلورة تختلف عن النمط المرجعي', 'Fluorescence differs from the reference pattern'), icon: 'alert-outline', tone: colors.tertiaryContainer },
    adulteration_indicator: { title: pick('مؤشر خلط محتمل', 'Possible adulteration indicator'), sub: pick('نمط الفلورة يوحي بوجود خلط محتمل', 'The fluorescence pattern hints at possible adulteration'), icon: 'alert-circle-outline', tone: colors.error },
  };

  return (
    <Screen>
      <Row style={{ minHeight: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface }}>
        <PressScale onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={backIcon} size={24} color={colors.primary} />
        </PressScale>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Txt size={16} face="jakarta" color={colors.primary} style={{ textAlign: 'center', lineHeight: 21 }}>UV Oil Analyzer</Txt>
          <Txt size={13} color={colors.muted} style={{ textAlign: 'center', lineHeight: 17 }}>فاحص الفلورة والأصالة 365nm</Txt>
        </View>
        <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="tune-variant" size={24} color={colors.primary} />
        </View>
      </Row>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Live photo vs the app's demo samples */}
        <View style={{ padding: 16, paddingBottom: 0, backgroundColor: colors.low }}>
          <Row style={{ gap: 8, backgroundColor: colors.raised, borderRadius: radius.control, padding: 4 }}>
            {(['live', 'demo'] as const).map((m) => (
              <PressScale key={m} onPress={() => setMode(m)} accessibilityLabel={m === 'live' ? 'Live scan' : 'Demo samples'} outerStyle={{ flex: 1 }} style={{ minHeight: 48, borderRadius: radius.control - 2, backgroundColor: mode === m ? colors.primaryContainer : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                <Txt size={14} weight="bold" color={mode === m ? colors.white : colors.primary} style={{ textAlign: 'center' }}>
                  {m === 'live' ? pick('فحص مباشر', 'Live scan') : pick('عيّنات تجريبية', 'Demo samples')}
                </Txt>
              </PressScale>
            ))}
          </Row>
        </View>

        {demo ? (
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.low }}>
            <Row style={{ gap: 6, backgroundColor: colors.raised, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Icon name="check-decagram" size={16} color={colors.primary} />
              <Txt size={14} weight="bold" color={colors.primary}>حصاد فوري</Txt>
            </Row>
            <Row style={{ gap: 6 }}>
              <Txt size={12} face="label" color={colors.muted}>LOT ID:</Txt>
              <Txt size={13} face="labelBold" color={colors.primary}>{ltr('#PAL-NAB-2024-098')}</Txt>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} />
            </Row>
          </Row>
        ) : null}

        <View style={{ padding: 16, gap: 16 }}>
          {/* Press (design example, demo samples only) / how-to (live) */}
          {demo ? (
            <Card style={{ gap: 12 }}>
              <Row style={{ gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="factory" size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={17} weight="bold" color={colors.primary} ar>معصرة الأصالة الحديثة</Txt>
                  <Txt size={12} face="label" color={colors.muted}>Al-Asalah Modern Press, Nablus Terraces</Txt>
                </View>
              </Row>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
                    <Icon name="clock-outline" size={14} color={colors.muted} />
                    <Txt size={14} color={colors.muted}>زمن العصر:</Txt>
                  </Row>
                  <Txt size={14} weight="bold" color={colors.primary} ar>خلال 14 ساعة من القطف</Txt>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
                    <Icon name="white-balance-sunny" size={14} color={colors.muted} />
                    <Txt size={14} color={colors.muted}>طريقة الفحص:</Txt>
                  </Row>
                  <Txt size={14} weight="bold" color={colors.primary} ar>طيف UV 365nm الذكي</Txt>
                </View>
              </Row>
            </Card>
          ) : (
            <Card style={{ gap: 8 }}>
              <Row style={{ gap: 10, alignItems: 'flex-start' }}>
                <Icon name="flashlight" size={24} color={colors.primary} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Txt size={15} weight="bold" color={colors.primary}>{pick('كيف تصوّر العيّنة', 'How to photograph the sample')}</Txt>
                  <Txt size={14} color={colors.muted} style={{ lineHeight: 21 }}>
                    {pick(
                      'ضع كأس الزيت في غرفة معتمة، وسلّط عليه مصباح UV بطول موجي 365nm، ثم صوّر الكأس من الأعلى.',
                      'Put the oil glass in a dark room, shine a 365nm UV torch on it, then photograph the glass from above.',
                    )}
                  </Txt>
                </View>
              </Row>
            </Card>
          )}

          {/* UV chamber */}
          <View style={{ backgroundColor: '#1E1B33', borderRadius: radius.card, padding: 12, gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ backgroundColor: '#0C0B14', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt size={12} face="label" color={colors.onPrimaryContainer}>λ=365nm</Txt>
              </View>
              <Row style={{ gap: 8 }}>
                <Txt size={12} face="labelBold" color={colors.gold}>UV 365nm</Txt>
                <Icon name="microscope" size={20} color={colors.gold} />
              </Row>
            </Row>
            <View style={{ height: 250, backgroundColor: '#07070C', borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 28 }}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <>
                  {demo ? (
                    <View style={{ position: 'absolute', top: 10, left: 10, gap: 6 }}>
                      <View style={{ borderWidth: 1, borderColor: '#6B5430', backgroundColor: '#17120A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Txt size={12} face="label" color={colors.gold}>675nm: EMISSION PEAK</Txt>
                      </View>
                      <View style={{ borderWidth: 1, borderColor: '#14513C', backgroundColor: '#0A1712', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Txt size={12} face="label" color="#34D399">NO SYNTHETIC CHLOROPHYLL</Txt>
                      </View>
                    </View>
                  ) : null}
                  <View style={{ width: 66, height: 150, borderWidth: 2, borderColor: '#6B6B73', borderTopWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, justifyContent: 'flex-end', padding: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View style={{ height: 118, backgroundColor: '#E8890C', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
                      <View style={{ width: 54, height: 3, backgroundColor: '#F6B24B', marginTop: 0 }} />
                    </View>
                  </View>
                  <View style={{ width: 120, height: 10, backgroundColor: '#3B3B42', borderRadius: 5, marginTop: 2 }} />
                </>
              )}
              {live.phase === 'loading' && !demo ? (
                <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(7,7,12,0.65)', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ActivityIndicator size="large" color={colors.gold} />
                  <Txt size={14} color={colors.white} style={{ textAlign: 'center' }}>{pick('جارٍ فحص العيّنة…', 'Analysing the sample…')}</Txt>
                </View>
              ) : null}
            </View>

            {demo ? (
              <>
                <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                  {oilSamples.map((s) => (
                    <PressScale key={s.id} onPress={() => setSample(s.id)} accessibilityLabel={s.name} style={{ minHeight: 48, minWidth: 96, paddingHorizontal: 16, borderRadius: radius.chip, backgroundColor: sample === s.id ? colors.gold : '#2B2A3A', alignItems: 'center', justifyContent: 'center' }}>
                      <Txt size={14} weight="bold" color={sample === s.id ? colors.primary : colors.white} style={{ textAlign: 'center' }}>{s.name}</Txt>
                    </PressScale>
                  ))}
                </Row>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ minHeight: 48, minWidth: 56, justifyContent: 'center' }}>
                    <Switch value={compare} onValueChange={setCompare} trackColor={{ true: colors.primaryContainer, false: colors.primaryContainer }} thumbColor={colors.white} />
                  </View>
                  <View>
                    <Txt size={14} weight="bold" color={colors.white} ar>مقارنة البصمة الطيفية</Txt>
                    <Txt size={12} face="label" color="#A8A6C0" ar>Sample vs Authentic Souri Baseline</Txt>
                  </View>
                </Row>
              </>
            ) : (
              <Row style={{ gap: 10 }}>
                <PressScale onPress={() => capture(false)} disabled={live.phase === 'loading'} accessibilityLabel={web ? 'Choose a photo' : 'Take a UV photo'} outerStyle={{ flex: 1.4 }} style={{ minHeight: 52, borderRadius: radius.control, backgroundColor: colors.gold, justifyContent: 'center', paddingHorizontal: 12 }}>
                  <Row style={{ gap: 8, justifyContent: 'center' }}>
                    <Icon name={web ? 'file-image-outline' : 'camera-outline'} size={22} color={colors.primary} />
                    <Txt size={14} weight="bold" color={colors.primary} style={{ textAlign: 'center' }}>
                      {web ? pick('اختر صورة', 'Choose a photo') : pick('صوّر العيّنة', 'Photograph sample')}
                    </Txt>
                  </Row>
                </PressScale>
                {!web ? (
                  <PressScale onPress={() => capture(true)} disabled={live.phase === 'loading'} accessibilityLabel="Upload Gallery" outerStyle={{ flex: 1 }} style={{ minHeight: 52, borderRadius: radius.control, backgroundColor: '#2B2A3A', justifyContent: 'center', paddingHorizontal: 12 }}>
                    <Row style={{ gap: 8, justifyContent: 'center' }}>
                      <Icon name="image-multiple-outline" size={22} color={colors.white} />
                      <Txt size={14} weight="bold" color={colors.white} style={{ textAlign: 'center' }}>{pick('من المعرض', 'Gallery')}</Txt>
                    </Row>
                  </PressScale>
                ) : null}
              </Row>
            )}
          </View>

          {/* AI results */}
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt size={19} weight="bold" color={colors.primary} style={{ flex: 1 }}>{pick('نتائج الفحص الطيفي بالذكاء الاصطناعي', 'AI spectral screening result')}</Txt>
          </Row>

          {!demo && live.phase === 'idle' ? (
            <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Icon name="flask-outline" size={36} color={colors.faint} />
              <Txt size={14} color={colors.muted} style={{ textAlign: 'center' }}>
                {pick('صوّر عيّنة الزيت تحت ضوء UV لتظهر النتيجة هنا.', 'Photograph an oil sample under UV light and the result appears here.')}
              </Txt>
            </Card>
          ) : null}

          {shown ? (
            <Card style={{ gap: 10 }}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: shown.kind === 'lab' ? colors.tertiaryContainer : colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={shown.kind === 'lab' ? 'test-tube' : 'fingerprint'} size={28} color={colors.white} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size={19} weight="bold" color={colors.primary} style={{ lineHeight: 26 }}>
                    {shown.kind === 'lab' ? pick('يحتاج تحقق مخبري', 'Needs laboratory verification') : className[shown.label].title}
                  </Txt>
                  <Txt size={14} color={colors.muted}>
                    {shown.kind === 'lab' ? pick('لا نسمّي فئة عندما تكون الثقة أقل من ٦٠٪.', 'No class is named when confidence is below 60%.') : className[shown.label].sub}
                  </Txt>
                </View>
                <Txt size={32} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 40 }}>{pct(shown.confidence)}</Txt>
              </Row>
              <Bar value={shown.confidence * 100} color={shown.kind === 'lab' ? colors.tertiaryContainer : colors.primaryContainer} />
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <SourceBadge source={shown.source} why={shown.why} demo={demo} />
                {!demo && live.phase === 'done' ? (
                  <Txt size={12} face="labelBold" color={colors.primary}>
                    {pick('زمن الاستجابة', 'Latency')}: {ltr(`${(live.ms / 1000).toFixed(2)}s`)}
                  </Txt>
                ) : null}
              </Row>
              <Txt size={13} color={colors.muted}>
                {pick('فحص أولي من الصورة فقط، وليس نتيجة مخبرية.', 'A preliminary screening from the photo alone, not a laboratory result.')}
              </Txt>
              {!demo && shown.source === 'محاكاة' ? (
                <PressScale onPress={() => capture(false)} accessibilityLabel="Try again" style={{ minHeight: 48, borderRadius: radius.control, backgroundColor: colors.raised, justifyContent: 'center', alignItems: 'center' }}>
                  <Txt size={14} weight="bold" color={colors.primary} style={{ textAlign: 'center' }}>{pick('حاول مرة أخرى', 'Try again')}</Txt>
                </PressScale>
              ) : null}
            </Card>
          ) : null}

          {demo ? (
            <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 12 }}>
              {cards.map((c) => (
                <Card key={c.ar} style={{ width: '48%', flexGrow: 1, padding: 14, gap: 6 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Icon name={c.icon} size={20} color={c.iconColor} />
                    <Txt size={14} color={colors.muted} ar style={{ flex: 1 }}>{c.ar}</Txt>
                  </Row>
                  <Row style={{ gap: 4, alignItems: 'baseline', justifyContent: 'flex-end' }}>
                    {c.unit ? <Txt size={12} face="label" color={colors.muted}>{c.unit}</Txt> : null}
                    <Txt size={26} face="jakartaExtra" color={c.valueColor} style={{ lineHeight: 32 }}>{c.value}</Txt>
                  </Row>
                  <Txt size={14} color={colors.muted} ar>{c.sub}</Txt>
                  <View style={{ backgroundColor: c.chipBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }}>
                    <Txt size={14} weight="bold" color={c.chipInk} ar style={{ lineHeight: 20 }}>{c.chip}</Txt>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}

          <View style={{ backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.card, padding: 14, gap: 6 }}>
            <Row style={{ gap: 10, alignItems: 'flex-start' }}>
              <Icon name="alert-outline" size={26} color={colors.tertiaryContainer} />
              <View style={{ flex: 1, gap: 6 }}>
                <Txt size={14} weight="bold" color={colors.text} ar>تنبيه قانوني وفني معتمد</Txt>
                <Txt size={14} color={colors.muted} ar style={{ lineHeight: 21 }}>
                  هذا الفحص بالفلورة هو مؤشر أولي مساند للمزارع والمعصرة، ولا يغني عن شهادة الفحص المخبري المعتمدة من وزارة الزراعة أو مجلس الزيت والزيتون الفلسطيني.
                </Txt>
              </View>
            </Row>
          </View>

          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFF3DD', borderWidth: 1, borderColor: '#F3DDA8', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="qrcode" size={26} color={colors.primary} />
              </View>
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Txt size={15} weight="bold" color={colors.primary} ar>ختم التوثيق الجغرافي الرقمي</Txt>
                <Txt size={12} face="label" color={colors.muted} ar>Palestinian Terroir Geo-Tag: Nablus</Txt>
              </View>
              <Icon name="shield-check-outline" size={24} color={colors.faint} />
            </Row>
          </Card>

          <PressScale onPress={() => router.push('/passport')} accessibilityLabel="إصدار رمز التتبع والشهادة" style={{ minHeight: 56, borderRadius: radius.control, backgroundColor: colors.primaryContainer, justifyContent: 'center' }}>
            <Row style={{ gap: 10, justifyContent: 'center' }}>
              <Icon name="qrcode" size={22} color={colors.white} />
              <Txt size={15} weight="bold" color={colors.white}>إصدار رمز التتبع والشهادة</Txt>
            </Row>
          </PressScale>
          <PressScale accessibilityLabel="حفظ في سجلات المعصرة" style={{ minHeight: 52, borderRadius: radius.control, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primaryContainer, justifyContent: 'center' }}>
            <Row style={{ gap: 10, justifyContent: 'center' }}>
              <Icon name="archive-outline" size={22} color={colors.primaryContainer} />
              <Txt size={15} weight="bold" color={colors.primaryContainer}>حفظ في سجلات المعصرة</Txt>
            </Row>
          </PressScale>
          <Txt size={12} face="label" color={colors.faint} style={{ textAlign: 'center' }}>OliveWatch AI Spectral Engine • Nablus Mill Node #4</Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

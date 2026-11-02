import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SourceBadge, pct } from '../components/ai';
import { Bar, Button, Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../components/ui';
import { LeafLabel, LeafResult, predictLeaf } from '../data/ml';
import { getLastScan, setLastScan } from '../data/scanStore';
import { useLang } from '../i18n';
import { colors, radius } from '../theme';

const spots = require('../../assets/photos/leaf-spots.jpg');

// Keeps ids, times and numbers as one left-to-right run inside Arabic text.
const ltr = (s: string) => `⁦${s}⁩`;

// The lower sections are the app's design copy for Peacock Spot. They are shown only when the AI result is peacock_spot.
const symptoms: { icon: IconName; tint: string; ink: string; title: string; text: string }[] = [
  { icon: 'target', tint: colors.raised, ink: colors.primary, title: 'Dark concentric lesions on upper leaf surface', text: 'Diameter measured at 3-5mm with velvet-like fungal sporulation.' },
  { icon: 'contrast-circle', tint: '#FFF3DD', ink: colors.tertiary, title: 'Chlorotic yellow halo perimeter', text: 'Toxin excretion inducing chlorophyll degradation around necrotic cores.' },
  { icon: 'leaf-circle-outline', tint: '#FBDAD4', ink: colors.error, title: 'Accelerated defoliation risk', text: 'Leaf drop projected within 14-21 days if canopy humidity persists > 85%.' },
];

const actions = [
  { n: 1, t: 'Canopy Aeration', en: 'Prune dense inner canopies to increase airflow and sunlight penetration.', ar: 'تقليم الأفرع المتشابكة في قلب الشجرة لتقليل الرطوبة وتسهيل دخول ضوء الشمس.' },
  { n: 2, t: 'Preventive Spray', en: 'Apply preventive copper hydroxide or organic bordeaux mixture (تركيبة بوردو) within 48h before rains.', dose: true },
  { n: 3, t: 'Sanitation', en: 'Collect and compost fallen infected leaves away from root basins.', ar: 'جمع الأوراق المتساقطة وحرقها أو تخميرها بعيداً عن حوض الشجرة لمنع انتقال الأبواغ.' },
];

type State = { phase: 'loading' } | { phase: 'done'; result: LeafResult; ms: number; at: number };

export default function Diagnosis() {
  const { rtl, backIcon, pick, lang } = useLang();
  const router = useRouter();
  const { uri: uriParam, last } = useLocalSearchParams<{ uri?: string; last?: string }>();
  const stored = last ? getLastScan() : null;
  const uri = uriParam ?? stored?.uri;
  const [run, setRun] = useState(0);
  const [state, setState] = useState<State>(() => (stored ? { phase: 'done', result: stored.result, ms: stored.ms, at: stored.at } : { phase: 'loading' }));
  const langRef = useRef(lang);
  langRef.current = lang;

  // One request per photo (or per "analyse again"); switching the language does not send the photo again.
  useEffect(() => {
    if (!uriParam) return;
    let off = false;
    setState({ phase: 'loading' });
    const t0 = Date.now();
    predictLeaf(uriParam, langRef.current).then((result) => {
      if (off) return;
      const at = Date.now();
      const ms = at - t0;
      setState({ phase: 'done', result, ms, at });
      setLastScan({ at, uri: uriParam, result, ms });
    });
    return () => {
      off = true;
    };
  }, [uriParam, run]);

  // A report number made from the scan time (a local reference, not a database id).
  const reportId = useMemo(() => (state.phase === 'done' ? `OW-${state.at.toString(36).slice(-5).toUpperCase()}` : '…'), [state]);
  const when = state.phase === 'done' ? new Date(state.at).toLocaleString(lang === 'ar' ? 'ar' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

  const retake = () => router.navigate('/scan');
  const result = state.phase === 'done' ? state.result : null;
  const ok = result && result.kind === 'ok' ? result : null;

  const meta: Record<LeafLabel, { chip: string; chipBg: string; chipInk: string; icon: IconName; title: string; sub: string; latin: string; note: string }> = {
    peacock_spot: {
      chip: pick('مرض فطري', 'FUNGAL PATHOGEN'),
      chipBg: '#FFF3DD',
      chipInk: colors.tertiaryContainer,
      icon: 'alert-outline',
      title: pick('مرض عين الطاووس', 'Olive Peacock Spot Disease'),
      sub: pick('عين الطاووس', 'Peacock Spot'),
      latin: 'Spilocaea oleaginea',
      note: '',
    },
    aculus_olearius: {
      chip: pick('ضرر آفة', 'PEST DAMAGE'),
      chipBg: '#FFF3DD',
      chipInk: colors.tertiaryContainer,
      icon: 'bug-outline',
      title: pick('ضرر حلم الزيتون', 'Olive Mite Damage'),
      sub: pick('حلم الزيتون', 'Olive bud mite'),
      latin: 'Aculus olearius',
      note: pick(
        'يُنصح بعرض الشجرة على مهندس زراعي قبل أي رش، فالعلاج يعتمد على شدة الإصابة.',
        'Ask an agronomist to look at the tree before any spraying; the treatment depends on how heavy the infestation is.',
      ),
    },
    healthy: {
      chip: pick('سليمة', 'HEALTHY'),
      chipBg: colors.secondaryContainer,
      chipInk: colors.primary,
      icon: 'check-circle-outline',
      title: pick('ورقة زيتون سليمة', 'Healthy Olive Leaf'),
      sub: pick('لا علامات إصابة ظاهرة في هذه الصورة', 'No visible signs of disease in this photo'),
      latin: 'Olea europaea',
      note: pick('واصل المراقبة الدورية، وصوّر ورقة أخرى من شجرة مختلفة للتأكد.', 'Keep monitoring regularly, and scan a leaf from another tree to be sure.'),
    },
  };

  const header = (
    <Row style={{ minHeight: 72, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Row style={{ gap: 6, flex: 1 }}>
        <PressScale onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name={backIcon} size={24} color={colors.primary} />
        </PressScale>
        <View style={{ flex: 1 }}>
          <Txt size={12} face="labelBold" color={colors.secondary} style={{ lineHeight: 15 }}>
            {pick('فحص ميداني', 'FIELD SCAN')}
          </Txt>
          <Txt size={17} face="jakarta" color={colors.primary} style={{ lineHeight: 22 }}>
            {pick('تقرير التشخيص', 'Diagnostic Report')} {ltr(`#${reportId}`)}
          </Txt>
        </View>
      </Row>
    </Row>
  );

  // No photo yet: this screen has nothing to show.
  if (!uri) {
    return (
      <Screen>
        {header}
        <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Icon name="leaf" size={44} color={colors.faint} />
            <Txt size={17} face="jakarta" color={colors.primary} style={{ textAlign: 'center' }}>
              {pick('لا يوجد فحص بعد', 'No scan yet')}
            </Txt>
            <Txt size={14} color={colors.muted} style={{ textAlign: 'center' }}>
              {pick('صوّر ورقة زيتون أو اخترها من المعرض ليظهر تشخيصها هنا.', 'Take a photo of an olive leaf, or choose one from the gallery, and its diagnosis appears here.')}
            </Txt>
          </View>
          <Button label={pick('فحص ورقة', 'Scan a leaf')} icon="camera-outline" onPress={retake} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {header}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        {/* Photo */}
        <Card style={{ gap: 10, padding: 12 }}>
          <Row style={{ justifyContent: 'space-between', gap: 8 }}>
            <Row style={{ gap: 8, backgroundColor: colors.raised, borderRadius: radius.chip, paddingHorizontal: 12, minHeight: 36 }}>
              <Icon name="camera-outline" size={16} color={colors.primary} />
              <Txt size={12} face="labelBold" color={colors.primary}>
                {pick('صورتك', 'Your photo')}
              </Txt>
            </Row>
            {when ? (
              <Txt size={14} face="label" color={colors.muted}>
                {when}
              </Txt>
            ) : null}
          </Row>
          <View style={{ height: 224, borderRadius: radius.control + 4, overflow: 'hidden', backgroundColor: colors.raised }}>
            <Image source={uri ? { uri } : spots} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            {result ? <SourceBadge source={result.source} why={result.why} /> : <View />}
            {state.phase === 'done' ? (
              <Txt size={12} face="labelBold" color={colors.primary}>
                {pick('زمن الاستجابة', 'Latency')}: {ltr(`${(state.ms / 1000).toFixed(2)}s`)}
              </Txt>
            ) : null}
          </Row>
        </Card>

        {/* Loading */}
        {state.phase === 'loading' ? (
          <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
            <ActivityIndicator size="large" color={colors.primaryContainer} />
            <Txt size={16} face="jakarta" color={colors.primary} style={{ textAlign: 'center' }}>
              {pick('جارٍ فحص الورقة…', 'Analysing the leaf…')}
            </Txt>
            <Txt size={14} color={colors.muted} style={{ textAlign: 'center' }}>
              {pick('قد يستغرق ذلك بضع ثوانٍ.', 'This can take a few seconds.')}
            </Txt>
          </Card>
        ) : null}

        {/* Rejected: the photo was not clear enough to give an answer */}
        {result && result.kind === 'rejected' ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, [rtl ? 'borderRightWidth' : 'borderLeftWidth']: 5, [rtl ? 'borderRightColor' : 'borderLeftColor']: colors.error, padding: 16, gap: 10 }}>
            <Row style={{ gap: 10 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#FBDAD4', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="image-off-outline" size={24} color={colors.error} />
              </View>
              <Txt size={20} face="jakartaExtra" color={colors.primary} style={{ flex: 1, lineHeight: 26 }}>
                {pick('الصورة غير واضحة، أعد التصوير', 'Unclear image, retake')}
              </Txt>
            </Row>
            <Txt size={14} color={colors.muted}>
              {result.reason === 'blur'
                ? pick('الصورة مهتزّة أو خارج التركيز. ثبّت الهاتف على بعد ١٥ سم تقريباً من الورقة تحت ضوء النهار ثم أعد التصوير.', 'The photo is blurry or out of focus. Hold the phone steady about 15 cm from the leaf in daylight and retake it.')
                : pick('لم نتمكن من تمييز الورقة بثقة كافية. اجعل ورقة واحدة تملأ الإطار على خلفية بسيطة ثم أعد التصوير.', 'We could not identify the leaf with enough confidence. Fill the frame with one leaf on a plain background and retake it.')}
            </Txt>
            <Txt size={13} color={colors.muted}>
              {pick('لا نعرض أي تشخيص عندما تكون الثقة أقل من ٧٠٪.', 'No diagnosis is shown when confidence is below 70%.')}
            </Txt>
          </View>
        ) : null}

        {/* Result */}
        {ok ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.card, [rtl ? 'borderRightWidth' : 'borderLeftWidth']: 5, [rtl ? 'borderRightColor' : 'borderLeftColor']: ok.label === 'healthy' ? colors.secondary : colors.tertiaryContainer, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border }}>
            <Row style={{ gap: 8, alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: meta[ok.label].chipBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Txt size={12} face="labelBold" color={meta[ok.label].chipInk}>
                    {meta[ok.label].chip}
                  </Txt>
                </View>
                <View style={{ alignSelf: 'flex-start', backgroundColor: colors.raised, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Txt size={12} face="labelBold" color={colors.primary}>
                    {pick('جودة الصورة', 'Image quality')}: {ok.quality === 'good' ? pick('جيدة', 'Good') : pick('مقبولة', 'Acceptable')}
                  </Txt>
                </View>
              </View>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={meta[ok.label].icon} size={24} color={meta[ok.label].chipInk === colors.primary ? colors.secondary : colors.tertiaryContainer} />
              </View>
            </Row>
            <Txt size={26} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 33 }}>
              {meta[ok.label].title}
            </Txt>
            <Txt size={14} color={colors.muted}>
              {meta[ok.label].sub} – <Txt size={14} color={colors.muted} style={{ fontStyle: 'italic' }}>{meta[ok.label].latin}</Txt>
            </Txt>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: 6 }}>
                <Icon name="check-decagram" size={18} color={colors.secondary} />
                <Txt size={14} face="labelBold" color={colors.primary}>
                  {pick('ثقة النموذج', 'Model Confidence')}
                </Txt>
              </Row>
              <Txt size={18} face="jakartaExtra" color={colors.primary}>
                {pct(ok.confidence)}
              </Txt>
            </Row>
            <Bar value={ok.confidence * 100} color={colors.secondary} />
            <Txt size={13} color={colors.muted}>
              {pick('فحص أولي من الصورة فقط، وليس تشخيصاً نهائياً.', 'A preliminary screening from the photo alone, not a final diagnosis.')}
            </Txt>
            {meta[ok.label].note ? (
              <Txt size={14} color={colors.text}>
                {meta[ok.label].note}
              </Txt>
            ) : null}
          </View>
        ) : null}

        {/* Peacock Spot design copy: symptoms, spray window, treatment plan */}
        {ok && ok.label === 'peacock_spot' ? (
          <>
            <View style={{ backgroundColor: colors.raised, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10 }}>
              <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
                <Icon name="text-search" size={22} color={colors.primary} />
                <Txt size={19} face="jakartaExtra" color={colors.primary}>Detected Symptoms</Txt>
              </Row>
              {symptoms.map((s) => (
                <Row key={s.title} style={{ gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 12, alignItems: 'flex-start' }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: s.tint, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={s.icon} size={20} color={s.ink} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Txt size={14} face="jakarta" color={colors.text} style={{ lineHeight: 20 }}>{s.title}</Txt>
                    <Txt size={14} face="label" color={colors.muted} style={{ lineHeight: 20 }}>{s.text}</Txt>
                  </View>
                </Row>
              ))}
            </View>

            <View style={{ backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.secondaryContainer, padding: 14, gap: 10 }}>
              <Row style={{ gap: 10 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E6F0D2', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="weather-windy" size={22} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={12} face="labelBold" color={colors.secondary}>{pick('توجيه الرش', 'SPRAY GUIDANCE')}</Txt>
                  <Txt size={17} face="labelBold" color={colors.primary} style={{ lineHeight: 22 }}>{pick('وقت رش المبيد الفطري', 'Fungicide Spray Window')}</Txt>
                </View>
              </Row>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <Row style={{ gap: 12, backgroundColor: colors.low, borderRadius: 14, padding: 12 }}>
                <Icon name="white-balance-sunny" size={26} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Txt size={14} face="jakarta" color={colors.primary}>{pick('في الصباح الباكر، والهواء هادئ', 'Early morning, in calm air')}</Txt>
                  <Txt size={14} face="label" color={colors.muted}>{pick('تجنّب الرياح القوية، وارشّ قبل المطر المتوقع. راجع توقعات الطقس المحلية.', 'Avoid strong wind and spray before expected rain. Check the local forecast.')}</Txt>
                </View>
              </Row>
            </View>

            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Txt size={20} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 26 }}>Agronomic Treatment Plan</Txt>
                <Txt size={14} color={colors.muted} ar>خطة العلاج الزراعي المعتمدة</Txt>
              </View>
              <View style={{ backgroundColor: colors.raised, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt size={12} face="labelBold" color={colors.muted}>{pick('٣ إجراءات', '3 Actions')}</Txt>
              </View>
            </Row>
            <Card style={{ gap: 14 }}>
              {actions.map((a) => (
                <Row key={a.n} style={{ gap: 12, alignItems: 'flex-start' }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                    <Txt size={14} face="jakarta" color={colors.white} style={{ lineHeight: 18 }}>{a.n}</Txt>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt size={15} face="jakarta" color={colors.primary}>{a.t}</Txt>
                    <Txt size={14} face="latin" color={colors.muted} style={{ lineHeight: 20 }}>{a.en}</Txt>
                    {a.ar ? <Txt size={14} color={colors.muted} ar style={{ lineHeight: 20 }}>{a.ar}</Txt> : null}
                    {a.dose ? (
                      <Row style={{ gap: 6, alignSelf: 'flex-start', backgroundColor: colors.raised, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                        <Icon name="flask-outline" size={14} color={colors.primary} />
                        <Txt size={14} face="labelBold" color={colors.primary}>{pick('راجع المرشد الزراعي', 'Consult an agronomist')}</Txt>
                      </Row>
                    ) : null}
                  </View>
                </Row>
              ))}
            </Card>
          </>
        ) : null}

        {/* Disclaimer (every finished result) */}
        {result ? (
          <Row style={{ gap: 10, backgroundColor: '#FFF3DD', borderRadius: radius.card, padding: 14, alignItems: 'flex-start' }}>
            <Icon name="information-outline" size={20} color={colors.tertiaryContainer} />
            <View style={{ flex: 1, gap: 3 }}>
              <Txt size={14} face="jakarta" color={colors.tertiary}>{pick('تنبيه', 'Agronomic Protocol Notice')}</Txt>
              <Txt size={14} color={colors.tertiary} style={{ lineHeight: 21 }}>
                {pick(
                  'نتائج الذكاء الاصطناعي هي تشخيص أولي إرشادي وليست بديلاً عن الفحص المخبري أو فحص المهندس الزراعي المختص.',
                  'AI results are a preliminary guide and do not replace laboratory testing or an agronomist’s inspection.',
                )}
              </Txt>
            </View>
          </Row>
        ) : null}

        {/* Actions */}
        {result && result.kind === 'rejected' ? <Button label={pick('أعد التصوير', 'Retake photo')} icon="camera-retake-outline" onPress={retake} /> : null}
        {ok ? (
          <>
            {ok.label === 'peacock_spot' ? (
              <PressScale accessibilityLabel="Add to Farm Treatment Log" style={{ minHeight: 54, borderRadius: radius.control, backgroundColor: colors.primaryContainer, justifyContent: 'center' }}>
                <Row style={{ gap: 8, justifyContent: 'center' }}>
                  <Icon name="playlist-check" size={22} color={colors.white} />
                  <Txt size={14} weight="bold" color={colors.white}>Add to Farm Treatment Log | إضافة لسجل المعالجة</Txt>
                </Row>
              </PressScale>
            ) : null}
            <Button label={pick('فحص ورقة أخرى', 'Scan another leaf')} icon="camera-outline" tone={ok.label === 'peacock_spot' ? 'light' : 'primary'} onPress={retake} />
          </>
        ) : null}
        {/* The answer came from the offline mock (gateway down or limit reached): let the user try the gateway again */}
        {result && result.source === 'محاكاة' && uriParam ? <Button label={pick('حاول مرة أخرى', 'Try again')} icon="refresh" tone="light" onPress={() => setRun((n) => n + 1)} /> : null}
      </ScrollView>
    </Screen>
  );
}

import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Bar, Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../components/ui';
import { useLang } from '../i18n';
import { colors, radius } from '../theme';

const spots = require('../../assets/photos/leaf-spots.jpg');

const symptoms: { icon: IconName; tint: string; ink: string; title: string; text: string }[] = [
  { icon: 'target', tint: colors.raised, ink: colors.primary, title: 'Dark concentric lesions on upper leaf surface', text: 'Diameter measured at 3-5mm with velvet-like fungal sporulation.' },
  { icon: 'contrast-circle', tint: '#FFF3DD', ink: colors.tertiary, title: 'Chlorotic yellow halo perimeter', text: 'Toxin excretion inducing chlorophyll degradation around necrotic cores.' },
  { icon: 'leaf-circle-outline', tint: '#FBDAD4', ink: colors.error, title: 'Accelerated defoliation risk', text: 'Leaf drop projected within 14-21 days if canopy humidity persists > 85%.' },
];

const actions = [
  { n: 1, t: 'Canopy Aeration', en: 'Prune dense inner canopies to increase airflow and sunlight penetration.', ar: 'تقليم الأفرع المتشابكة في قلب الشجرة لتقليل الرطوبة وتسهيل دخول ضوء الشمس.' },
  { n: 2, t: 'Preventive Spray', en: 'Apply preventive copper hydroxide or organic bordeaux mixture (تركيبة بوردو) within 48h before rains.', dose: 'Dosage: 250g per 100L water' },
  { n: 3, t: 'Sanitation', en: 'Collect and compost fallen infected leaves away from root basins.', ar: 'جمع الأوراق المتساقطة وحرقها أو تخميرها بعيداً عن حوض الشجرة لمنع انتقال الأبواغ.' },
];

export default function Diagnosis() {
  const { rtl, rowDir, backIcon } = useLang();
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>();

  return (
    <Screen>
      <Row style={{ minHeight: 72, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Row style={{ gap: 10, flex: 1 }}>
          <PressScale onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 36, height: 40, justifyContent: 'center' }}>
            <Icon name={backIcon} size={24} color={colors.primary} />
          </PressScale>
          <View style={{ flex: 1 }}>
            <Txt size={11} face="labelBold" color={colors.secondary} style={{ lineHeight: 14 }}>FIELD SCAN</Txt>
            <Txt size={17} face="jakarta" color={colors.primary} style={{ lineHeight: 22 }}>Diagnostic Report #OW-9284</Txt>
          </View>
        </Row>
        <Row style={{ gap: 16 }}>
          <Icon name="share-variant-outline" size={22} color={colors.primary} />
          <Icon name="file-pdf-box" size={26} color={colors.primary} />
        </Row>
      </Row>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        {/* Photo */}
        <Card style={{ gap: 10, padding: 12 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <Row style={{ flex: 1, gap: 8, backgroundColor: colors.raised, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Icon name="map-marker" size={16} color={colors.primary} />
              <Txt size={12} face="labelBold" color={colors.primary} style={{ flex: 1 }}>Tree #142, North Terrace, Jenin Grove</Txt>
            </Row>
            <Txt size={11} face="label" color={colors.faint}>Oct 24, 08:42</Txt>
          </Row>
          <View style={{ height: 224, borderRadius: radius.control + 4, overflow: 'hidden', backgroundColor: colors.raised }}>
            <Image source={uri ? { uri } : spots} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            <Row style={{ position: 'absolute', left: 8, right: 8, bottom: 8, gap: 8 }}>
              <Row style={{ flex: 1, gap: 6, backgroundColor: 'rgba(23,29,23,0.8)', borderRadius: 10, padding: 8 }}>
                <Icon name="image-filter-center-focus" size={16} color={colors.secondaryContainer} />
                <Txt size={11} face="labelBold" color={colors.secondaryContainer} style={{ flex: 1 }}>Multi-Spectral Vision</Txt>
              </Row>
              <Row style={{ flex: 1.3, gap: 6, backgroundColor: 'rgba(245,251,240,0.95)', borderRadius: 10, padding: 8 }}>
                <Icon name="eye-outline" size={16} color={colors.primary} />
                <Txt size={11} face="labelBold" color={colors.primary} style={{ flex: 1 }}>Show AI Attention Map</Txt>
              </Row>
            </Row>
          </View>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 6 }}>
              <Icon name="blur" size={14} color={colors.muted} />
              <Txt size={11} face="label" color={colors.muted}>Sensor: 48MP Macro Multi-Angle</Txt>
            </Row>
            <Txt size={11} face="labelBold" color={colors.primary}>Latency: 1.14s</Txt>
          </Row>
        </Card>

        {/* Result */}
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.card, [rtl ? 'borderRightWidth' : 'borderLeftWidth']: 5, [rtl ? 'borderRightColor' : 'borderLeftColor']: colors.tertiaryContainer, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border }}>
          <Row style={{ gap: 8, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#FFF3DD', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt size={11} face="labelBold" color={colors.tertiaryContainer}>FUNGAL PATHOGEN</Txt>
              </View>
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#FFF3DD', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt size={11} face="labelBold" color={colors.tertiaryContainer}>Moderate (درجة متوسطة - Early Stage)</Txt>
              </View>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="alert-outline" size={24} color={colors.tertiaryContainer} />
            </View>
          </Row>
          <Txt size={26} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 33 }}>Olive Peacock Spot Disease</Txt>
          <Txt size={14} color={colors.muted}>عين الطاووس – <Txt size={14} color={colors.muted} style={{ fontStyle: 'italic' }}>Spilocaea oleaginea</Txt></Txt>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 6 }}>
              <Icon name="check-decagram" size={18} color={colors.secondary} />
              <Txt size={13} face="labelBold" color={colors.primary}>Model Confidence</Txt>
            </Row>
            <Txt size={18} face="jakartaExtra" color={colors.primary}>94.6%</Txt>
          </Row>
          <Bar value={94.6} color={colors.secondary} />
          <Txt size={11} face="label" color={colors.muted}>Verified across 42,000+ Levantine olive foliar pathology datasets.</Txt>
        </View>

        {/* Symptoms */}
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
                <Txt size={12} face="label" color={colors.muted} style={{ lineHeight: 17 }}>{s.text}</Txt>
              </View>
            </Row>
          ))}
        </View>

        {/* Microclimate forecast */}
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.secondaryContainer, padding: 14, gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 10, flex: 1 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E6F0D2', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="weather-windy" size={22} color={colors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={11} face="labelBold" color={colors.secondary}>MICROCLIMATE FORECAST</Txt>
                <Txt size={17} face="labelBold" color={colors.primary} style={{ lineHeight: 22 }}>Fungicide Spray Window</Txt>
              </View>
            </Row>
            <View style={{ backgroundColor: colors.secondaryContainer, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 3 }}>
              <Txt size={12} face="labelBold" color={colors.primary}>Optimal</Txt>
            </View>
          </Row>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row style={{ gap: 12, backgroundColor: colors.low, borderRadius: 14, padding: 12 }}>
            <Icon name="white-balance-sunny" size={26} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Txt size={14} face="jakarta" color={colors.primary}>Thursday 07:00 AM – 11:30 AM</Txt>
              <Txt size={12} face="label" color={colors.muted}>Wind speed &lt; 8 km/h • 0% rain probability • RH 58%</Txt>
            </View>
          </Row>
        </View>

        {/* Treatment plan */}
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Txt size={20} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 26 }}>Agronomic Treatment Plan</Txt>
            <Txt size={13} color={colors.muted} ar>خطة العلاج الزراعي المعتمدة</Txt>
          </View>
          <View style={{ backgroundColor: colors.raised, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Txt size={11} face="labelBold" color={colors.muted}>3 Actions</Txt>
          </View>
        </Row>
        <Card style={{ gap: 14 }}>
          {actions.map((a) => (
            <Row key={a.n} style={{ gap: 12, alignItems: 'flex-start' }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Txt size={13} face="jakarta" color={colors.white} style={{ lineHeight: 18 }}>{a.n}</Txt>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Txt size={15} face="jakarta" color={colors.primary}>{a.t}</Txt>
                <Txt size={13} face="latin" color={colors.muted} style={{ lineHeight: 19 }}>{a.en}</Txt>
                {a.ar ? <Txt size={12} color={colors.muted} ar style={{ lineHeight: 18 }}>{a.ar}</Txt> : null}
                {a.dose ? (
                  <Row style={{ gap: 6, alignSelf: 'flex-start', backgroundColor: colors.raised, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Icon name="flask-outline" size={14} color={colors.primary} />
                    <Txt size={11} face="labelBold" color={colors.primary}>{a.dose}</Txt>
                  </Row>
                ) : null}
              </View>
            </Row>
          ))}
        </Card>

        <Row style={{ gap: 10, backgroundColor: '#FFF3DD', borderRadius: radius.card, padding: 14, alignItems: 'flex-start' }}>
          <Icon name="information-outline" size={20} color={colors.tertiaryContainer} />
          <View style={{ flex: 1, gap: 3 }}>
            <Txt size={13} face="jakarta" color={colors.tertiary}>Agronomic Protocol Notice</Txt>
            <Txt size={12} color={colors.tertiary} ar style={{ lineHeight: 19 }}>
              ⚠️ تنبيه: نتائج الذكاء الاصطناعي هي تشخيص أولي إرشادي وليست بديلاً عن الفحص المخبري أو فحص المهندس الزراعي المختص.
            </Txt>
          </View>
        </Row>

        <PressScale accessibilityLabel="Add to Farm Treatment Log" style={{ minHeight: 54, borderRadius: radius.control, backgroundColor: colors.primaryContainer, justifyContent: 'center' }}>
          <Row style={{ gap: 8, justifyContent: 'center' }}>
            <Icon name="playlist-check" size={22} color={colors.white} />
            <Txt size={14} weight="bold" color={colors.white}>Add to Farm Treatment Log | إضافة لسجل المعالجة</Txt>
          </Row>
        </PressScale>
        <PressScale accessibilityLabel="Consult AI Agronomist" style={{ minHeight: 54, borderRadius: radius.control, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primaryContainer, justifyContent: 'center' }}>
          <Row style={{ gap: 8, justifyContent: 'center' }}>
            <Icon name="robot-outline" size={22} color={colors.primaryContainer} />
            <Txt size={14} weight="bold" color={colors.primaryContainer}>Consult AI Agronomist (المرشد الذكي)</Txt>
          </Row>
        </PressScale>
      </ScrollView>
    </Screen>
  );
}

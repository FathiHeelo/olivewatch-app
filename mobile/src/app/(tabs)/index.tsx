import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bar, Body, BrandHeader, Card, Eyebrow, Icon, IconName, Pill, PressScale, Row, Screen, Txt } from '../../components/ui';
import { getRepository, HomeData } from '../../data/repository';
import { useLang } from '../../i18n';
import { colors, radius, uv, uvFonts } from '../../theme';
import { uvText } from '../../uv/zaytoun-i18n';

type Metric = { ar: string; icon: IconName; value: string; unit?: string; chip?: string; sub: string; foot: string; bar: number; barColor: string; tone: string };
const metrics: Metric[] = [
  { ar: 'NDVI مؤشر الغطاء', icon: 'satellite-variant', value: '0.78', sub: '+4% pass', foot: 'Healthy canopy vigor', bar: 78, barColor: colors.secondary, tone: colors.primaryContainer },
  { ar: 'رطوبة التربة الجذرية', icon: 'water-outline', value: '28%', chip: 'Optimal', sub: '', foot: 'Root zone in balance', bar: 60, barColor: colors.primary, tone: colors.primary },
  { ar: 'ذباب الزيتون (Fly Risk)', icon: 'bug', value: 'Low', sub: '1.2 traps/week', foot: 'Below economic threshold', bar: 22, barColor: '#A9D168', tone: colors.secondary },
  { ar: 'جاهزية العصر (Press)', icon: 'calendar-month', value: '18', unit: 'Days', chip: 'Cold Press Ready', sub: '', foot: 'Maturity index at 3.4', bar: 80, barColor: colors.gold, tone: colors.tertiary },
];

export default function Home() {
  const { rtl, rowDir, pick, toggle, forwardIcon, nextIcon, lang } = useLang();
  const uvT = uvText(lang);
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  useEffect(() => getRepository().subscribeHome(setData), []);
  const farm = data?.farm;

  return (
    <Screen>
      <BrandHeader
        right={
          <Row style={{ gap: 10 }}>
            <PressScale onPress={toggle} accessibilityLabel="عربي / EN" style={{ flexDirection: rowDir, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.raised, borderRadius: radius.chip, paddingHorizontal: 14, height: 48 }}>
              <Icon name="web" size={16} color={colors.primary} />
              <Txt size={12} weight="bold" color={colors.primary}>
                عربي / EN
              </Txt>
            </PressScale>
            <View>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bell-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.gold, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                <Txt size={10} face="labelBold" color={colors.tertiary} style={{ lineHeight: 14 }}>
                  2
                </Txt>
              </View>
            </View>
          </Row>
        }
      />
      <Body>
        {/* UV screening, one tap from Home (two from any tab) */}
        <PressScale onPress={() => router.push('/uv')} accessibilityLabel={uvT.startScan} style={{ backgroundColor: uv.primary, borderRadius: radius.card, padding: 16, minHeight: 72 }}>
          <Row style={{ gap: 14 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: uv.highlight, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="flashlight" size={26} color={uv.onHighlight} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={17} color={uv.onPrimary} style={{ fontFamily: uvFonts.heading, lineHeight: 26 }}>
                {uvT.startScan}
              </Txt>
              <Txt size={14} color={uv.onPrimary} style={{ fontFamily: uvFonts.body }}>
                {uvT.startScanHint}
              </Txt>
            </View>
            <Icon name={forwardIcon} size={22} color={uv.onPrimary} />
          </Row>
        </PressScale>

        {/* Greeting */}
        <Card style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 6, flexShrink: 1 }}>
            <Txt size={15} weight="bold" color={colors.primary}>
              مرحباً، أبو خالد | Welcome, Abu Khaled
            </Txt>
            <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
              <Icon name="map-marker" size={16} color={colors.secondary} />
              <Txt size={13} color={colors.muted}>
                {pick(farm?.location ?? 'بيتا، نابلس', farm?.locationEn ?? 'Beita, Nablus')}
              </Txt>
            </Row>
          </View>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="tractor" size={26} color={colors.primaryContainer} />
          </View>
        </Card>

        {/* Heritage pledge */}
        <Row style={{ backgroundColor: colors.primaryContainer, borderRadius: radius.card, padding: 16, gap: 14 }}>
          <View style={{ width: 46, height: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.onPrimaryContainer, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="leaf" size={24} color={colors.gold} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt size={11} face="labelBold" color={colors.gold}>
              شعار الموسم • HERITAGE PLEDGE
            </Txt>
            <Txt size={15} face="jakarta" color={colors.white} style={{ lineHeight: 22 }}>
              "Every Tree Matters. Every Harvest Counts. Every Drop Has Value."
            </Txt>
          </View>
        </Row>

        {/* Grove */}
        <Card style={{ gap: 14 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} />
                <Txt size={19} weight="bold" color={colors.primary} ar>
                  {pick(farm?.name ?? 'بيارة الكرم العتيق', farm?.nameEn ?? 'Al-Karm Al-Ateeq Grove')}
                </Txt>
              </Row>
              <Txt size={13} color={colors.muted}>
                {pick(`${farm?.areaDunum ?? 42} دونم`, `${farm?.nameEn ?? 'Al-Karm Al-Ateeq Grove'} • ${farm?.areaDunum ?? 42} Dunums`)}
              </Txt>
              <View style={{ alignSelf: 'flex-start', flexDirection: rowDir, alignItems: 'center', gap: 6, backgroundColor: colors.raised, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Icon name="pine-tree" size={14} color={colors.muted} />
                <Txt size={12} weight="medium" color={colors.primaryContainer}>
                  {pick(`${farm?.trees ?? 620} شجرة ${farm?.varieties ?? 'زيتون صوري معمر'}`, `${farm?.trees ?? 620} Souri Olive Trees`)}
                </Txt>
              </View>
            </View>
            <View style={{ borderWidth: 1, borderColor: colors.secondaryContainer, backgroundColor: colors.low, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' }}>
              <Txt size={30} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 36 }}>
                {`${farm?.health ?? 94}%`}
              </Txt>
              <Txt size={10} face="labelBold" color={colors.secondary} style={{ lineHeight: 14 }}>
                ممتاز • GOOD
              </Txt>
            </View>
          </Row>
          <Row style={{ backgroundColor: colors.low, borderRadius: 14, paddingVertical: 12 }}>
            {[
              { icon: 'white-balance-sunny' as IconName, v: '24°C', l: 'Nablus Sunny', c: colors.gold },
              { icon: 'water-percent' as IconName, v: '62%', l: 'Humidity', c: colors.primaryContainer },
              { icon: 'weather-pouring' as IconName, v: '0 mm', l: 'Rain Today', c: colors.muted },
            ].map((w, i) => (
              <Row key={w.l} style={{ flex: 1, gap: 8, justifyContent: 'center', [rtl ? 'borderRightWidth' : 'borderLeftWidth']: i ? 1 : 0, [rtl ? 'borderRightColor' : 'borderLeftColor']: colors.outline }}>
                <Icon name={w.icon} size={24} color={w.c} />
                <View>
                  <Txt size={14} face="jakarta" color={colors.primary} style={{ lineHeight: 18 }}>
                    {w.v}
                  </Txt>
                  <Txt size={11} color={colors.muted} style={{ lineHeight: 15 }}>
                    {w.l}
                  </Txt>
                </View>
              </Row>
            ))}
          </Row>
        </Card>

        {/* AI threat alert */}
        <View style={{ backgroundColor: colors.errorSoft, borderColor: '#F0C8C0', borderWidth: 1, borderRadius: radius.card, padding: 16, gap: 12 }}>
          <Row style={{ gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="alert-outline" size={24} color={colors.white} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt size={12} face="labelBold" color={colors.error}>
                  تنبيه ذكي • AI THREAT ALERT
                </Txt>
                <Pill label="عاجل" bg={colors.errorContainer} ink={colors.error} />
              </Row>
              <Txt size={15} face="latin" color={colors.text} style={{ lineHeight: 22 }}>
                Olive Peacock Spot (عين الطاووس) risk elevated in North Plot due to morning dew. Spray preventive bio-copper before Friday.
              </Txt>
            </View>
          </Row>
          <PressScale onPress={() => router.push('/diagnosis')} accessibilityLabel="عرض التوصية" style={{ backgroundColor: colors.primaryContainer, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Row style={{ gap: 8 }}>
              <Txt size={14} weight="bold" color={colors.white}>
                عرض التوصية | View Advisory
              </Txt>
              <Icon name={forwardIcon} size={18} color={colors.white} />
            </Row>
          </PressScale>
        </View>

        {/* Field metrics */}
        <Eyebrow ar="مؤشرات الحقل الميدانية" en="Field Metrics" note="تحديث حي • Live" />
        <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 12 }}>
          {metrics.map((m) => (
            <Card key={m.ar} style={{ width: '48%', flexGrow: 1, padding: 14, gap: 8 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Txt size={11} color={colors.muted} style={{ flex: 1 }}>
                  {m.ar}
                </Txt>
                <Icon name={m.icon} size={20} color={m.tone} />
              </Row>
              <Row style={{ gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Txt size={28} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 34 }}>
                  {m.value}
                </Txt>
                {m.unit ? <Txt size={12} face="jakarta" color={colors.primary}>{m.unit}</Txt> : null}
                {m.chip ? <Pill label={m.chip} bg={m.chip === 'Optimal' ? colors.secondaryContainer : '#FBE3C4'} ink={m.chip === 'Optimal' ? colors.primary : colors.tertiary} face="labelBold" /> : null}
              </Row>
              {m.sub ? (
                <Txt size={11} face="label" color={colors.secondary}>
                  {m.sub}
                </Txt>
              ) : null}
              <Bar value={m.bar} color={m.barColor} />
              <Txt size={11} face="label" color={colors.muted}>
                {m.foot}
              </Txt>
            </Card>
          ))}
        </View>

        {/* Quick field tools */}
        <Eyebrow ar="إجراءات سريعة" en="Quick Field Tools" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
          {([
            { label: 'Scan Leaf AI', icon: 'camera' as IconName, to: '/scan', gold: true },
            { label: 'UV Oil Scan', icon: 'flask-outline' as IconName, to: '/uv' },
            { label: 'Satellite NDVI', icon: 'satellite-variant' as IconName, to: '/climate' },
            { label: 'Ask AI Murshid', icon: 'head-cog-outline' as IconName, to: '/advisor' },
            { label: 'Trace Batch QR', icon: 'qrcode-scan' as IconName, to: '/passport' },
          ]).map((t) => (
            <PressScale
              key={t.label}
              onPress={() => router.push(t.to as '/scan')}
              accessibilityLabel={t.label}
              style={{ height: 52, paddingHorizontal: 18, borderRadius: radius.control, backgroundColor: t.gold ? colors.gold : colors.surface, borderWidth: 1, borderColor: t.gold ? colors.gold : colors.outline, justifyContent: 'center' }}
            >
              <Row style={{ gap: 10 }}>
                <Icon name={t.icon} size={22} color={colors.primary} />
                <Txt size={13} face="labelBold" color={colors.primary}>
                  {t.label}
                </Txt>
              </Row>
            </PressScale>
          ))}
        </ScrollView>

        {/* Recent scans */}
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 6 }}>
            <Txt size={15} weight="bold" color={colors.primary}>تشخيصات AI الأخيرة</Txt>
            <Txt size={12} face="labelBold" color={colors.primary}>• RECENT SCANS</Txt>
          </Row>
          <Txt size={11} face="labelBold" color={colors.secondary}>السجل كامل • View All</Txt>
        </Row>
        {[
          { icon: 'virus' as IconName, tint: '#FBDAD4', ink: colors.error, title: 'Plot B - Tree #142', chip: 'Treated', name: 'Olive Leaf Scab (عين الطاووس)', note: 'Detected at 96% AI confidence' },
          { icon: 'check-circle-outline' as IconName, tint: colors.secondaryContainer, ink: colors.primaryContainer, title: 'Plot A - Tree #89', chip: 'Healthy', name: 'Healthy Souri Foliage (أوراق سليمة)', note: '99% confidence • Prime Condition' },
        ].map((s) => (
          <PressScale key={s.title} onPress={() => router.push('/diagnosis')} accessibilityLabel={s.title} style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.card, padding: 14 }}>
            <Row style={{ gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: s.tint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={24} color={s.ink} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
                  <Txt size={14} face="jakarta" color={colors.primary}>{s.title}</Txt>
                  <Pill label={s.chip} bg={s.chip === 'Treated' ? colors.secondaryContainer : colors.raised} ink={colors.primary} face="labelBold" />
                </Row>
                <Txt size={14} face="latin" color={colors.text}>{s.name}</Txt>
                <Txt size={12} face="label" color={colors.secondary}>{s.note}</Txt>
              </View>
              <Icon name={nextIcon} size={22} color={colors.faint} />
            </Row>
          </PressScale>
        ))}

        {/* Verified lot */}
        <PressScale onPress={() => router.push('/passport')} accessibilityLabel="Cooperative Lot" style={{ backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: radius.card, padding: 14 }}>
          <Row style={{ gap: 12 }}>
            <Icon name="check-decagram" size={26} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Txt size={14} face="jakarta" color={colors.primary}>Palestinian Olive Oil Council Verified</Txt>
              <Txt size={12} face="label" color={colors.muted}>Cooperative Lot #PAL-NAB-2024-098</Txt>
            </View>
            <Icon name="qrcode" size={30} color={colors.primaryContainer} />
          </Row>
        </PressScale>
        {/* room so the floating buttons never cover the last card */}
        <View style={{ height: 184 }} />
      </Body>

      {/* Floating UV scan button, stacked above the advisor circle */}
      <PressScale
        onPress={() => router.push('/uv')}
        accessibilityLabel={uvT.startScan}
        outerStyle={{ position: 'absolute', bottom: 124, [rtl ? 'left' : 'right']: 28 }}
        style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: uv.highlight, borderWidth: 3, borderColor: uv.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
      >
        <Icon name="flashlight" size={24} color={uv.onHighlight} />
        <Txt size={14} color={uv.onHighlight} style={{ fontFamily: uvFonts.bodyBold, lineHeight: 16, textAlign: 'center' }}>
          UV
        </Txt>
      </PressScale>

      {/* Floating "Ask the AI advisor" circle: stays on screen while the page scrolls */}
      <PressScale
        onPress={() => router.push('/advisor')}
        accessibilityLabel={pick('اسأل المرشد الذكي', 'Ask the AI advisor')}
        outerStyle={{ position: 'absolute', bottom: 16, [rtl ? 'left' : 'right']: 16 }}
        style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primaryContainer, borderWidth: 3, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
      >
        <Icon name="head-cog-outline" size={26} color={colors.gold} />
        <Txt size={14} weight="bold" color={colors.white} style={{ textAlign: 'center', lineHeight: 16 }}>
          {pick('اسأل المرشد الذكي', 'Ask AI Advisor')}
        </Txt>
      </PressScale>
    </Screen>
  );
}

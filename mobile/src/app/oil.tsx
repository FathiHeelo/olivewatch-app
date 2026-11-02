import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bar, Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../components/ui';
import { useLang } from '../i18n';
import { colors, radius } from '../theme';

const cards: { icon: IconName; iconColor: string; ar: string; value: string; unit?: string; valueColor: string; sub: string; chip: string; chipBg: string; chipInk: string }[] = [
  { icon: 'grass', iconColor: colors.secondary, ar: 'نسبة الكلوروفيل', value: '4.8', valueColor: colors.primary, sub: 'مؤشر الكاروتين النموذجي', chip: 'مرتفعات جبلية بكر', chipBg: colors.raised, chipInk: colors.muted },
  { icon: 'shield-outline', iconColor: '#0E9F6E', ar: 'مخاطر الخلط والشوائب', value: '< 1.2%', valueColor: '#047857', sub: 'انحراف غير مرصود', chip: 'نقاء فائق (خالٍ من الزيوت المكررة)', chipBg: '#E3F3EA', chipInk: '#047857' },
  { icon: 'flask-outline', iconColor: colors.tertiaryContainer, ar: 'حموضة تقديرية (FFA)', value: '~0.35%', valueColor: colors.primary, sub: 'حمض الأوليك المقدر', chip: 'معيار البكر الممتاز (<0.8%)', chipBg: '#E6F0D2', chipInk: colors.primary },
  { icon: 'leaf', iconColor: colors.primary, ar: 'رقم البيروكسيد (PV)', value: '<8', unit: 'meq O₂', valueColor: colors.primary, sub: 'طازج / عصر موسمي', chip: 'أكسدة متدنية جداً', chipBg: colors.raised, chipInk: colors.muted },
];

export default function Oil() {
  const { rowDir } = useLang();
  const router = useRouter();
  const [compare, setCompare] = useState(false);

  return (
    <Screen>
      <Row style={{ minHeight: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface }}>
        <Icon name="tune-variant" size={24} color={colors.primary} />
        <View style={{ alignItems: 'center' }}>
          <Txt size={16} face="jakarta" color={colors.primary} style={{ textAlign: 'center', lineHeight: 21 }}>UV Oil Analyzer</Txt>
          <Txt size={12} color={colors.muted} style={{ textAlign: 'center', lineHeight: 16 }}>فاحص الفلورة والأصالة 365nm</Txt>
        </View>
        <PressScale onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 36, height: 40, alignItems: 'flex-end', justifyContent: 'center' }}>
          <Icon name="arrow-right" size={24} color={colors.primary} />
        </PressScale>
      </Row>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.low }}>
          <Row style={{ gap: 6, backgroundColor: colors.raised, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Icon name="check-decagram" size={16} color={colors.primary} />
            <Txt size={12} weight="bold" color={colors.primary}>حصاد فوري</Txt>
          </Row>
          <Row style={{ gap: 6 }}>
            <Txt size={12} face="label" color={colors.muted}>LOT ID:</Txt>
            <Txt size={13} face="labelBold" color={colors.primary}>#PAL-NAB-2024-098</Txt>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} />
          </Row>
        </Row>

        <View style={{ padding: 16, gap: 16 }}>
          {/* Press */}
          <Card style={{ gap: 12 }}>
            <Row style={{ gap: 12, alignItems: 'flex-start' }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.raised, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="factory" size={26} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={17} weight="bold" color={colors.primary} ar>معصرة الأصالة الحديثة</Txt>
                <Txt size={12} face="label" color={colors.muted}>Al-Asalah Modern Press, Nablus Terraces</Txt>
              </View>
              <View style={{ backgroundColor: colors.secondaryContainer, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Txt size={11} weight="bold" color={colors.primary} style={{ textAlign: 'center' }} ar>صوري عتيق</Txt>
              </View>
            </Row>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
                  <Icon name="clock-outline" size={14} color={colors.muted} />
                  <Txt size={11} color={colors.muted}>زمن العصر:</Txt>
                </Row>
                <Txt size={13} weight="bold" color={colors.primary} ar>خلال 14 ساعة من القطف</Txt>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
                  <Icon name="white-balance-sunny" size={14} color={colors.muted} />
                  <Txt size={11} color={colors.muted}>طريقة الفحص:</Txt>
                </Row>
                <Txt size={13} weight="bold" color={colors.primary} ar>طيف UV 365nm الذكي</Txt>
              </View>
            </Row>
          </Card>

          {/* UV chamber */}
          <View style={{ backgroundColor: '#1E1B33', borderRadius: radius.card, padding: 12, gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ backgroundColor: '#0C0B14', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt size={12} face="label" color={colors.onPrimaryContainer}>λ=365.2nm ±1.8</Txt>
              </View>
              <Row style={{ gap: 8 }}>
                <Txt size={12} face="labelBold" color={colors.gold}>CHAMBER: ACTIVE 365nm</Txt>
                <Icon name="microscope" size={20} color={colors.gold} />
              </Row>
            </Row>
            <View style={{ height: 250, backgroundColor: '#07070C', borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 28 }}>
              <View style={{ position: 'absolute', top: 10, left: 10, gap: 6 }}>
                <View style={{ borderWidth: 1, borderColor: '#6B5430', backgroundColor: '#17120A', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Txt size={11} face="label" color={colors.gold}>675nm: EMISSION PEAK</Txt>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#14513C', backgroundColor: '#0A1712', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Txt size={11} face="label" color="#34D399">NO SYNTHETIC CHLOROPHYLL</Txt>
                </View>
              </View>
              <View style={{ width: 66, height: 150, borderWidth: 2, borderColor: '#6B6B73', borderTopWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, justifyContent: 'flex-end', padding: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <View style={{ height: 118, backgroundColor: '#E8890C', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, alignItems: 'center', justifyContent: 'flex-start' }}>
                  <View style={{ width: 54, height: 3, backgroundColor: '#F6B24B', marginTop: 0 }} />
                  <Txt size={9} face="label" color="#FDE0AE" style={{ lineHeight: 12 }}>10mL</Txt>
                </View>
              </View>
              <View style={{ width: 120, height: 10, backgroundColor: '#3B3B42', borderRadius: 5, marginTop: 2 }} />
              <Row style={{ position: 'absolute', right: 10, bottom: 10, gap: 8, backgroundColor: '#0C0B14', borderWidth: 1, borderColor: '#2B2A3A', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' }} />
                <Txt size={11} face="label" color={colors.white}>PHENOLIC: OPTIMAL</Txt>
              </Row>
            </View>
            <Row style={{ justifyContent: 'space-between' }}>
              <Switch value={compare} onValueChange={setCompare} trackColor={{ true: colors.primaryContainer, false: colors.primaryContainer }} thumbColor={colors.white} />
              <View>
                <Txt size={12} weight="bold" color={colors.white} ar>مقارنة البصمة الطيفية</Txt>
                <Txt size={11} face="label" color="#A8A6C0" ar>Sample vs Authentic Souri Baseline</Txt>
              </View>
            </Row>
          </View>

          {/* AI results */}
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: colors.raised, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Txt size={11} color={colors.muted} ar>نموذج V4.2</Txt>
            </View>
            <Txt size={19} weight="bold" color={colors.primary} ar>نتائج الفحص الطيفي بالذكاء الاصطناعي</Txt>
          </Row>
          <Card style={{ gap: 10 }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="fingerprint" size={28} color={colors.white} />
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end', paddingHorizontal: 10 }}>
                <Txt size={13} weight="bold" color={colors.primary} ar>مطابقة البصمة الأصلية</Txt>
                <Txt size={12} face="label" color={colors.muted}>Authenticity Pattern Match</Txt>
              </View>
              <Txt size={40} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 48 }}>96.8%</Txt>
            </Row>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt size={11} face="label" color={colors.muted}>High Confidence</Txt>
              <Row style={{ gap: 6 }}>
                <Txt size={12} weight="bold" color={colors.secondary} ar>تطابق استثنائي مع مواصفة الزيت الصوري</Txt>
                <Icon name="check-circle-outline" size={16} color={colors.secondary} />
              </Row>
            </Row>
            <Bar value={96.8} color={colors.primaryContainer} />
          </Card>

          <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 12 }}>
            {cards.map((c) => (
              <Card key={c.ar} style={{ width: '48%', flexGrow: 1, padding: 14, gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Icon name={c.icon} size={20} color={c.iconColor} />
                  <Txt size={12} color={colors.muted} ar style={{ flex: 1 }}>{c.ar}</Txt>
                </Row>
                <Row style={{ gap: 4, alignItems: 'baseline', justifyContent: 'flex-end' }}>
                  {c.unit ? <Txt size={11} face="label" color={colors.muted}>{c.unit}</Txt> : null}
                  <Txt size={26} face="jakartaExtra" color={c.valueColor} style={{ lineHeight: 32 }}>{c.value}</Txt>
                </Row>
                <Txt size={11} color={colors.muted} ar>{c.sub}</Txt>
                <View style={{ backgroundColor: c.chipBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }}>
                  <Txt size={11} weight="bold" color={c.chipInk} ar style={{ lineHeight: 16 }}>{c.chip}</Txt>
                </View>
              </Card>
            ))}
          </View>

          <View style={{ backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.card, padding: 14, gap: 6 }}>
            <Row style={{ gap: 10, alignItems: 'flex-start' }}>
              <Icon name="alert-outline" size={26} color={colors.tertiaryContainer} />
              <View style={{ flex: 1, gap: 6 }}>
                <Txt size={13} weight="bold" color={colors.text} ar>تنبيه قانوني وفني معتمد</Txt>
                <Txt size={12} color={colors.muted} ar style={{ lineHeight: 20 }}>
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
          <Txt size={11} face="label" color={colors.faint} style={{ textAlign: 'center' }}>OliveWatch AI Spectral Engine • Nablus Mill Node #4</Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

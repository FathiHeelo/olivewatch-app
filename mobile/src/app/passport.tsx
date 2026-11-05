import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Bar, Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../components/ui';
import { useLang } from '../i18n';
import { colors, radius } from '../theme';

const bottle = require('../../assets/photos/bottle.jpg');
const LOT = 'PAL-NAB-2024-098';

const steps = [
  { t: 'Harvested by Hand', d: 'Oct 18, 2024', text: 'Beita Ancient Terraced Groves (Plot #4B). Hand-picked into aerated crates to prevent fruit bruising.' },
  { t: 'Cold Pressed Extraction', d: 'Oct 19, 2024', text: 'Al-Asalah Mill within 14h of harvest. Continuous 2-phase centrifugation strictly monitored below 26.4°C.' },
  { t: 'UV Spectral & Acidity Tested', d: 'Oct 21, 2024', text: 'Dual-spectrometry validation: 0.34% Oleic acidity, K232: 1.62, K270: 0.14. Certified ultra-low oxidation.' },
  { t: 'Nitrogen Sealed & Serialized', d: 'Oct 23, 2024', text: 'Sealed under inert nitrogen headspace in UV-protective dark amber glass. Cryptographic QR assigned.' },
];

const notes: { icon: IconName; label: string }[] = [
  { icon: 'sprout', label: 'Fruity Green Olive' },
  { icon: 'grass', label: 'Fresh Cut Grass' },
  { icon: 'fire', label: 'Balanced Peppery Finish' },
];

export default function Passport() {
  const { rowDir, backIcon, pick } = useLang();
  const router = useRouter();
  return (
    <Screen>
      <Row style={{ minHeight: 68, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Row style={{ gap: 10, flex: 1 }}>
          <PressScale onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={backIcon} size={24} color={colors.primary} />
          </PressScale>
          <View>
            <Txt size={17} face="jakarta" color={colors.primary} style={{ lineHeight: 22 }}>Batch Passport</Txt>
            <Txt size={12} color={colors.muted} style={{ lineHeight: 16 }}>وثيقة تتبع الزيت الرقمية</Txt>
          </View>
        </Row>
        <Row style={{ gap: 14 }}>
          <Icon name="share-variant-outline" size={22} color={colors.primary} />
          <Row style={{ gap: 6, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border, borderRadius: radius.chip, paddingHorizontal: 12, height: 36 }}>
            <Icon name="file-pdf-box" size={18} color={colors.primary} />
            <Txt size={12} face="labelBold" color={colors.primary}>PDF</Txt>
          </Row>
        </Row>
      </Row>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}>
        {/* Seal */}
        <Row style={{ gap: 14, backgroundColor: '#E3F0E3', borderWidth: 1, borderColor: '#B5D7BE', borderRadius: radius.card, padding: 14 }}>
          <View style={{ width: 54, height: 54, borderRadius: 14, backgroundColor: '#12853E', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check-decagram" size={30} color={colors.white} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size={11} face="labelBold" color="#12853E">OFFICIAL SEAL <Txt size={11} face="label" color={colors.muted}>• Palestinian Olive Oil Council</Txt></Txt>
            <Txt size={15} face="jakarta" color={colors.primary} style={{ lineHeight: 20 }}>Palestinian Extra Virgin Certified</Txt>
            <Txt size={11} face="label" color={colors.muted}>{pick(`#${LOT} • حصاد تشرين الأول 2024`, `#${LOT} • Harvest Oct 2024`)}</Txt>
          </View>
        </Row>

        {/* Product */}
        <Card style={{ gap: 12 }}>
          <Row style={{ gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 112, height: 144, borderRadius: radius.control + 4, overflow: 'hidden', backgroundColor: colors.raised }}>
              <Image source={bottle} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(53,79,50,0.9)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, flexDirection: rowDir, gap: 4, alignItems: 'center' }}>
                <Icon name="leaf" size={10} color={colors.white} />
                <Txt size={10} face="label" color={colors.white} style={{ lineHeight: 14 }}>Souri 100%</Txt>
              </View>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#FFF3DD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Txt size={11} face="labelBold" color={colors.tertiaryContainer}>Monovarietal Heritage</Txt>
              </View>
              <Txt size={19} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 25 }}>Souri Extra Virgin Olive Oil</Txt>
              <Txt size={12} color={colors.muted} ar>زيت زيتون صوري بلدي بكر ممتاز</Txt>
            </View>
          </Row>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
            <Icon name="terrain" size={18} color={colors.gold} />
            <Txt size={13} color={colors.muted}>مزارع أبو خالد • Beita, Nablus</Txt>
          </Row>
          <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
            <Icon name="robot-industrial" size={18} color={colors.gold} />
            <Txt size={13} color={colors.muted}>معصرة الأصالة • Cold Press (&lt;27°C)</Txt>
          </Row>
          <Row style={{ gap: 8 }}>
            {[['Volume', '500 ml Glass'], ['Harvest Method', 'Manual Pick'], ['Plot Altitude', '680m Terroir']].map(([k, v]) => (
              <View key={k} style={{ flex: 1, backgroundColor: colors.low, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center', gap: 2 }}>
                <Txt size={10} face="label" color={colors.muted} style={{ textAlign: 'center', lineHeight: 14 }}>{k}</Txt>
                <Txt size={12} face="labelBold" color={colors.primary} style={{ textAlign: 'center', lineHeight: 16 }}>{v}</Txt>
              </View>
            ))}
          </Row>
        </Card>

        {/* Proof of origin / QR */}
        <View style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.outline, borderRadius: radius.card, padding: 16, gap: 12, alignItems: 'center' }}>
          <Row style={{ justifyContent: 'space-between', alignSelf: 'stretch' }}>
            <Row style={{ gap: 8 }}>
              <Icon name="lock-outline" size={18} color={colors.primary} />
              <Txt size={13} face="labelBold" color={colors.primary}>Decentralized Proof of Origin</Txt>
            </Row>
            <Txt size={11} face="label" color={colors.faint}>Ledger #4492A</Txt>
          </Row>
          <View style={{ height: 1, backgroundColor: colors.border, alignSelf: 'stretch' }} />
          <View style={{ borderWidth: 2.5, borderColor: colors.primaryContainer, borderRadius: 20, padding: 12, backgroundColor: colors.surface }}>
            <QRCode value={`olivewatch:${LOT}`} size={176} color={colors.primary} backgroundColor={colors.surface} />
          </View>
          <Txt size={13} face="latin" color={colors.muted} style={{ textAlign: 'center', lineHeight: 20 }}>
            Scan to see this batch’s record and tree origin. The code does not prove that the oil is authentic.
          </Txt>
          <Row style={{ alignSelf: 'stretch', gap: 8, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44 }}>
            <Icon name="link" size={18} color={colors.muted} />
            <Txt size={12} face="label" color={colors.text} numberOfLines={1} style={{ flex: 1 }}>{`olivewatch.ps/verify/${LOT}`}</Txt>
            <Icon name="content-copy" size={18} color={colors.muted} />
          </Row>
        </View>

        {/* Lab + sensory */}
        <Row style={{ justifyContent: 'space-between' }}>
          <Txt size={19} face="jakartaExtra" color={colors.primary} style={{ flex: 1, lineHeight: 25 }}>Lab Analysis & Sensory</Txt>
          <View style={{ backgroundColor: '#E3F3EA', borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Txt size={11} face="labelBold" color="#047857">Grade A+ Extra Virgin</Txt>
          </View>
        </Row>
        <Row style={{ gap: 12, alignItems: 'flex-start' }}>
          <Card style={{ flex: 1, padding: 14, gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt size={11} face="label" color={colors.muted}>FREE ACIDITY</Txt>
              <Icon name="flask-outline" size={20} color={colors.primary} />
            </Row>
            <Row style={{ gap: 4, alignItems: 'baseline' }}>
              <Txt size={26} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 32 }}>0.34%</Txt>
              <Txt size={11} face="label" color={colors.muted}>oleic</Txt>
            </Row>
            <Bar value={30} color={colors.primary} />
            <Txt size={11} face="label" color={colors.muted}>EVOO Standard: &lt;0.8% Max</Txt>
          </Card>
          <Card style={{ flex: 1, padding: 14, gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Txt size={11} face="label" color={colors.muted}>POLYPHENOLS</Txt>
              <Icon name="pulse" size={20} color={colors.gold} />
            </Row>
            <Row style={{ gap: 4, alignItems: 'baseline' }}>
              <Txt size={26} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 32 }}>412</Txt>
              <Txt size={11} face="label" color={colors.muted}>mg/kg</Txt>
            </Row>
            <Bar value={72} color="#D6A84B" />
            <Txt size={11} face="label" color={colors.muted}>High Antioxidant Bioactivity</Txt>
          </Card>
        </Row>
        <Card style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Txt size={11} face="labelBold" color={colors.muted}>CERTIFIED ORGANOLEPTIC NOTES</Txt>
            <Row style={{ gap: 2 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Icon key={i} name="star-outline" size={16} color="#D6A84B" />
              ))}
            </Row>
          </Row>
          <Row style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {notes.map((n) => (
              <Row key={n.label} style={{ gap: 6, backgroundColor: colors.raised, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Icon name={n.icon} size={16} color={colors.primary} />
                <Txt size={12} face="labelBold" color={colors.primary}>{n.label}</Txt>
              </Row>
            ))}
          </Row>
        </Card>

        {/* Trace */}
        <Card style={{ gap: 14 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Txt size={20} face="jakartaExtra" color={colors.primary} style={{ flex: 1, lineHeight: 26 }}>Tree-to-Bottle Trace</Txt>
            <Txt size={11} face="label" color={colors.muted} style={{ width: 80 }}>4 Verified Checkpoints</Txt>
          </Row>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          {steps.map((s, i) => (
            <Row key={s.t} style={{ gap: 12, alignItems: 'flex-start' }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primaryContainer }} />
                {i < steps.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 56, backgroundColor: colors.border }} /> : null}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Txt size={14} face="jakarta" color={colors.primary}>{s.t}</Txt>
                  <Txt size={11} face="label" color={colors.muted}>{s.d}</Txt>
                </Row>
                <Txt size={12} face="latin" color={colors.muted} style={{ lineHeight: 18 }}>{s.text}</Txt>
              </View>
            </Row>
          ))}
        </Card>

        <PressScale accessibilityLabel="Download Batch Label & QR Stickers" style={{ minHeight: 54, borderRadius: radius.control, backgroundColor: colors.primaryContainer, justifyContent: 'center' }}>
          <Row style={{ gap: 8, justifyContent: 'center' }}>
            <Icon name="printer" size={20} color={colors.white} />
            <Txt size={14} face="labelBold" color={colors.white}>Download Batch Label & QR Stickers</Txt>
          </Row>
        </PressScale>
        <PressScale accessibilityLabel="Share Verification Link" style={{ minHeight: 54, borderRadius: radius.control, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primaryContainer, justifyContent: 'center' }}>
          <Row style={{ gap: 8, justifyContent: 'center' }}>
            <Icon name="share-variant-outline" size={20} color={colors.primaryContainer} />
            <Txt size={14} face="labelBold" color={colors.primaryContainer}>Share Verification Link</Txt>
          </Row>
        </PressScale>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Txt size={11} face="label" color={colors.faint} style={{ textAlign: 'center' }}>OliveWatch AI Autonomous Field Protocol • West Bank Registry</Txt>
          <Txt size={11} face="label" color={colors.faint} style={{ textAlign: 'center' }}>Hash: 8f4a-9b12-44df-9921-e01c</Txt>
        </View>
      </ScrollView>
    </Screen>
  );
}

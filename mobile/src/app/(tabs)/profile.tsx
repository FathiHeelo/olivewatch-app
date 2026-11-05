import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, BrandHeader, Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../../components/ui';
import { useLang } from '../../i18n';
import { colors } from '../../theme';

const rows: { icon: IconName; en: string; ar: string; to?: string }[] = [
  { icon: 'pine-tree', en: 'My Groves', ar: 'بياراتي', to: '/groves' },
  { icon: 'qrcode-scan', en: 'Batch Passport', ar: 'وثيقة تتبع الزيت', to: '/passport' },
  { icon: 'history', en: 'UV scan history', ar: 'سجل فحوص UV', to: '/uv-history' },
  { icon: 'bell-outline', en: 'Notifications', ar: 'التنبيهات' },
  { icon: 'web', en: 'Language', ar: 'اللغة: عربي / EN' },
];

export default function Profile() {
  const { rowDir, nextIcon, toggle } = useLang();
  const router = useRouter();
  return (
    <Screen>
      <BrandHeader right={<Icon name="bell-outline" size={24} color={colors.primary} />} />
      <Body>
        <Card style={{ flexDirection: rowDir, alignItems: 'center', gap: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="tractor" size={32} color={colors.primaryContainer} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size={18} weight="bold" color={colors.primary}>أبو خالد | Abu Khaled</Txt>
            <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
              <Icon name="map-marker" size={16} color={colors.secondary} />
              <Txt size={13} color={colors.muted}>بيتا، نابلس • Beita, Nablus</Txt>
            </Row>
          </View>
        </Card>

        <Card style={{ gap: 0, padding: 0 }}>
          {rows.map((r, i) => (
            <PressScale key={r.en} onPress={r.to ? () => router.push(r.to as '/oil') : r.en === 'Language' ? toggle : undefined} accessibilityLabel={r.en} style={{ paddingHorizontal: 16, minHeight: 56, justifyContent: 'center', borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
              <Row style={{ gap: 12 }}>
                <Icon name={r.icon} size={22} color={colors.primaryContainer} />
                <View style={{ flex: 1 }}>
                  <Txt size={14} face="jakarta" color={colors.primary} style={{ lineHeight: 19 }}>{r.en}</Txt>
                </View>
                <Icon name={nextIcon} size={22} color={colors.faint} />
              </Row>
            </PressScale>
          ))}
        </Card>

        <Card style={{ backgroundColor: colors.low }}>
          <Row style={{ gap: 10, alignItems: 'flex-start' }}>
            <Icon name="shield-check-outline" size={22} color={colors.primaryContainer} />
            <Txt size={13} color={colors.muted} style={{ flex: 1, lineHeight: 20 }}>
              Your farm data belongs to you. | بيانات مزرعتك ملكك أنت.
            </Txt>
          </Row>
        </Card>
      </Body>
    </Screen>
  );
}

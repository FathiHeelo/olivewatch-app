import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Body, BrandHeader, Card, Eyebrow, Icon, Pill, PressScale, Row, Screen, Txt } from '../../components/ui';
import { getRepository, HomeData } from '../../data/repository';
import { useLang } from '../../i18n';
import { colors, radius } from '../../theme';

export default function Groves() {
  const { rowDir, pick, nextIcon } = useLang();
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  useEffect(() => getRepository().subscribeHome(setData), []);
  const farm = data?.farm;

  return (
    <Screen>
      <BrandHeader right={<Icon name="bell-outline" size={24} color={colors.primary} />} />
      <Body>
        <View style={{ gap: 4 }}>
          <Txt size={25} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 32 }}>
            My Groves
          </Txt>
          <Txt size={13} color={colors.muted} ar>
            بياراتي وقطع الأرض
          </Txt>
        </View>

        {farm ? (
          <Card style={{ gap: 10 }}>
            <Row style={{ gap: 10, justifyContent: 'flex-start' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.secondary }} />
              <Txt size={19} weight="bold" color={colors.primary} ar>
                {pick(farm.name, farm.nameEn ?? farm.name)}
              </Txt>
            </Row>
            <Txt size={13} color={colors.muted}>{pick(`${farm.areaDunum} دونم • ${farm.trees} شجرة`, `${farm.nameEn ?? ''} • ${farm.areaDunum} Dunums • ${farm.trees} Trees`)}</Txt>
            <Row style={{ gap: 6, justifyContent: 'flex-start' }}>
              <Icon name="map-marker" size={16} color={colors.secondary} />
              <Txt size={13} color={colors.muted}>{pick(farm.location ?? '', farm.locationEn ?? '')}</Txt>
            </Row>
          </Card>
        ) : null}

        <Eyebrow ar="قطع الأرض" en="Plots" />
        {(data?.plots ?? []).map((p) => {
          const bad = p.status === 'needs_check';
          return (
            <PressScale key={p.id} onPress={() => router.navigate('/scan')} accessibilityLabel={p.name} style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.card, padding: 14 }}>
              <Row style={{ gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: bad ? '#FBDAD4' : colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={bad ? 'alert-outline' : 'pine-tree'} size={24} color={bad ? colors.error : colors.primaryContainer} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
                    <Txt size={14} face="jakarta" color={colors.primary}>{pick(p.name, p.nameEn ?? p.id)}</Txt>
                    <Pill label={bad ? 'Needs Check' : 'Healthy'} bg={bad ? colors.errorContainer : colors.secondaryContainer} ink={bad ? colors.error : colors.primary} face="labelBold" />
                  </Row>
                  <Txt size={14} color={colors.text}>{pick(`${p.trees} شجرة`, `${p.trees} trees`)}</Txt>
                  <Txt size={12} color={colors.muted}>{pick(`آخر فحص: ${p.lastCheck}`, `Last check: ${p.lastCheckDays} day${p.lastCheckDays === 1 ? '' : 's'} ago`)}</Txt>
                </View>
                <Icon name={nextIcon} size={22} color={colors.faint} />
              </Row>
            </PressScale>
          );
        })}
      </Body>
    </Screen>
  );
}

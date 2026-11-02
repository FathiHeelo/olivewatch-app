import { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Card, Icon, IconName, PressScale, Row, Screen, Txt } from '../../components/ui';
import { useLang } from '../../i18n';
import { colors, radius } from '../../theme';

const leafPhoto = require('../../../assets/photos/leaf-scan.jpg');

const targets: { label: string; dot: string; icon?: IconName }[] = [
  { label: 'Peacock Spot (عين الطاووس)', dot: colors.error },
  { label: 'Olive Knot (سل الزيتون)', dot: colors.tertiaryContainer },
  { label: 'Verticillium Wilt (الذبول الفطرى)', dot: colors.tertiaryContainer },
  { label: 'Healthy (سليم)', dot: colors.secondary, icon: 'check-circle-outline' },
];

export default function Scan() {
  const { rowDir, backIcon, nextIcon } = useLang();
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);

  // On a phone this opens the camera; on web there is no camera API, so it opens the file picker.
  async function pick(fromGallery: boolean) {
    let res: ImagePicker.ImagePickerResult;
    if (Platform.OS === 'web' || fromGallery) {
      res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    } else {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    }
    if (res.canceled) return;
    const uri = res.assets[0].uri;
    setPhoto(uri);
    router.push({ pathname: '/diagnosis', params: { uri } });
  }

  return (
    <Screen>
      {/* Header */}
      <Row style={{ height: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Row style={{ gap: 10 }}>
          <PressScale onPress={() => router.navigate('/')} accessibilityLabel="رجوع" style={{ width: 36, height: 40, justifyContent: 'center' }}>
            <Icon name={backIcon} size={24} color={colors.primary} />
          </PressScale>
          <View>
            <Row style={{ gap: 6 }}>
              <Icon name="sprout" size={20} color={colors.primary} />
              <Txt size={19} face="jakartaExtra" color={colors.primary} style={{ lineHeight: 24 }}>
                OliveWatch AI
              </Txt>
            </Row>
            <Txt size={12} color={colors.muted} style={{ lineHeight: 16 }}>
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
        {/* Viewfinder */}
        <View style={{ height: 372, backgroundColor: colors.primary, overflow: 'hidden' }}>
          <Image source={photo ? { uri: photo } : leafPhoto} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" />
          <View style={{ margin: 16, backgroundColor: 'rgba(31,56,29,0.9)', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(162,192,155,0.4)' }}>
            <Row style={{ gap: 10 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.secondaryContainer }} />
              <Icon name="blur" size={18} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Txt size={13} face="labelBold" color={colors.white} style={{ lineHeight: 18 }}>
                  Leaf Detected: <Txt size={13} face="labelBold" color={colors.gold}>Olea europaea</Txt> (Souri)
                </Txt>
                <Txt size={11} face="label" color={colors.secondaryContainer} style={{ lineHeight: 15 }}>
                  98.4% focus alignment • AI Neural Engine v4.2
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
          <View style={{ position: 'absolute', alignSelf: 'center', top: 160, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(208,233,152,0.6)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold }} />
          </View>
          <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: 'rgba(245,251,240,0.95)', borderRadius: radius.chip, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Row style={{ gap: 8 }}>
              <Icon name="ruler" size={16} color={colors.primary} />
              <Txt size={12} weight="medium" color={colors.primary} style={{ flex: 1 }}>
                Keep leaf 15cm under daylight | وجّه الكاميرا لسطح الورقة تحت ضوء طبيعي
              </Txt>
            </Row>
          </View>
        </View>

        {/* Target pathology */}
        <View style={{ backgroundColor: colors.surface, paddingTop: 14, paddingBottom: 14, gap: 10 }}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <Row style={{ gap: 8 }}>
              <Icon name="filter-variant" size={18} color={colors.primary} />
              <Txt size={14} face="labelBold" color={colors.primary}>Target Pathology / تشخيص مسبق</Txt>
            </Row>
            <Txt size={11} face="labelBold" color={colors.secondary}>Active AI Mode</Txt>
          </Row>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {targets.map((t) => (
              <Row key={t.label} style={{ gap: 8, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.chip, paddingHorizontal: 14, height: 38 }}>
                {t.icon ? <Icon name={t.icon} size={16} color={colors.secondary} /> : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.dot }} />}
                <Txt size={12} face="labelBold" color={colors.primary}>{t.label}</Txt>
              </Row>
            ))}
          </ScrollView>
        </View>

        {/* Capture controls */}
        <Row style={{ backgroundColor: colors.low, paddingHorizontal: 24, paddingVertical: 18, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <PressScale onPress={() => pick(true)} accessibilityLabel="Upload Gallery" style={{ alignItems: 'center', gap: 4, width: 96 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="image-multiple-outline" size={26} color={colors.primary} />
            </View>
            <Txt size={12} face="label" color={colors.primary} style={{ textAlign: 'center' }}>Upload Gallery</Txt>
          </PressScale>
          <PressScale onPress={() => pick(false)} accessibilityLabel="التقط صورة" style={{ width: 108, height: 108, borderRadius: 54, borderWidth: 2, borderStyle: 'dashed', borderColor: '#B4BBA6', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="leaf" size={34} color={colors.gold} />
              </View>
            </View>
          </PressScale>
          <View style={{ alignItems: 'center', gap: 4, width: 96 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="map-marker-radius" size={26} color={colors.primary} />
            </View>
            <Txt size={12} face="label" color={colors.primary} style={{ textAlign: 'center' }}>Tree #142</Txt>
          </View>
        </Row>

        <View style={{ paddingHorizontal: 16, gap: 12, backgroundColor: colors.low }}>
          <PressScale onPress={() => router.push('/diagnosis')} accessibilityLabel="Recent Diagnostic" style={{ backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 14 }}>
            <Row style={{ gap: 12 }}>
              <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check-decagram" size={26} color={colors.primaryContainer} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Row style={{ gap: 8, justifyContent: 'flex-start' }}>
                  <Txt size={14} face="labelBold" color={colors.primary}>Recent Diagnostic</Txt>
                  <View style={{ backgroundColor: colors.secondaryContainer, borderRadius: radius.chip, paddingHorizontal: 8, paddingVertical: 1 }}>
                    <Txt size={11} face="labelBold" color={colors.primary} style={{ lineHeight: 16 }}>Plot 4B</Txt>
                  </View>
                </Row>
                <Txt size={13} face="latin" color={colors.muted}>Tree #88 healed • Confidence: <Txt size={13} face="jakarta" color={colors.primary}>97.8%</Txt></Txt>
              </View>
              <Icon name={nextIcon} size={22} color={colors.faint} />
            </Row>
          </PressScale>
          <Card style={{ backgroundColor: colors.raised, flexDirection: rowDir, gap: 12, alignItems: 'flex-start' }}>
            <Icon name="alert-outline" size={22} color={colors.tertiaryContainer} />
            <Txt size={13} face="latin" color={colors.muted} style={{ flex: 1, lineHeight: 20 }}>
              <Txt size={13} face="jakarta" color={colors.primary}>Field Advisory: </Txt>
              AI preliminary scan for agricultural guidance. Consult local cooperative agronomist before heavy fungicide or pesticide application.
            </Txt>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

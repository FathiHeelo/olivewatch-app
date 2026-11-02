import { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Chip, OutlineButton, Row, ScreenShell, Txt } from '../../components/ui';
import { LEAF_CONFIDENCE_FLOOR, LeafLabel, LeafResult, predictLeaf } from '../../data/ml';
import { colors, radius } from '../../theme';

const leafNames: Record<LeafLabel, { ar: string; latin?: string; healthy: boolean }> = {
  healthy: { ar: 'ورقة سليمة', healthy: true },
  peacock_spot: { ar: 'بقع عين الطاووس', latin: 'Spilocaea oleaginea', healthy: false },
  aculus_olearius: { ar: 'إصابة بحلم الأكلوس', latin: 'Aculus olearius', healthy: false },
};

const sample: LeafResult = { kind: 'ok', label: 'peacock_spot', confidence: 0.87, quality: 'acceptable', source: 'محاكاة' };

export default function Scan() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LeafResult>(sample);

  async function capture() {
    // On a phone this opens the camera; on web there is no camera API, so it opens the file picker.
    let res: ImagePicker.ImagePickerResult;
    if (Platform.OS === 'web') {
      res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    } else {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    }
    if (res.canceled) return;
    const uri = res.assets[0].uri;
    setPhoto(uri);
    setBusy(true);
    setResult(await predictLeaf(uri));
    setBusy(false);
  }

  const lowConf = result.kind === 'ok' && result.confidence < LEAF_CONFIDENCE_FLOOR;
  const rejected = result.kind === 'rejected' || lowConf;

  return (
    <ScreenShell title="فحص الورقة" icon="sprout">
      <View style={{ gap: 12 }}>
        <View
          style={{
            height: 220,
            borderRadius: radius.card,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.accent,
            backgroundColor: '#ECF0DE',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {photo ? (
            <Image source={{ uri: photo }} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <MaterialCommunityIcons name="leaf" size={96} color={colors.accent} style={{ opacity: 0.55 }} />
          )}
          {busy ? (
            <View style={{ position: 'absolute', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color={colors.accent} />
              <Txt size={13} weight="medium" style={{ textAlign: 'center' }}>جاري التحليل…</Txt>
            </View>
          ) : null}
          {(['top', 'bottom'] as const).flatMap((v) =>
            (['left', 'right'] as const).map((h) => (
              <View
                key={v + h}
                style={{
                  position: 'absolute',
                  [v]: 8,
                  [h]: 8,
                  width: 14,
                  height: 14,
                  borderColor: colors.accentInk,
                  [`border${v === 'top' ? 'Top' : 'Bottom'}Width`]: 2,
                  [`border${h === 'left' ? 'Left' : 'Right'}Width`]: 2,
                }}
              />
            ))
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radius.chip,
              paddingHorizontal: 13,
              paddingVertical: 7,
            }}
          >
            <Row style={{ gap: 6 }}>
              <Txt size={12} weight="medium" style={{ lineHeight: 16 }}>صوّر الورقة في ضوء النهار</Txt>
              <MaterialCommunityIcons name="white-balance-sunny" size={15} color={colors.text} />
            </Row>
          </View>
        </View>
        <OutlineButton label="التقط صورة جديدة" icon="camera-plus-outline" onPress={capture} disabled={busy} />
      </View>

      {result.kind === 'ok' && !rejected ? (
        <Card>
          <Row style={{ justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 11 }}>
            <Row style={{ gap: 6 }}>
              <Txt size={15} weight="semibold">نتيجة التحليل الأولي</Txt>
              <MaterialCommunityIcons name="flask-outline" size={16} color={colors.accentInk} />
            </Row>
            <Chip label={result.source} />
          </Row>
          <View style={{ gap: 2 }}>
            <Txt size={12} weight="medium" color={colors.muted}>التشخيص المقترح</Txt>
            <Row style={{ gap: 8, alignItems: 'baseline' }}>
              <Txt size={20} weight="bold" color={leafNames[result.label].healthy ? colors.accentInk : colors.negative}>
                {leafNames[result.label].ar}
              </Txt>
              {leafNames[result.label].latin ? (
                <Txt size={12} color={colors.nav} style={{ fontStyle: 'italic', writingDirection: 'ltr' }}>
                  {`(${leafNames[result.label].latin})`}
                </Txt>
              ) : null}
            </Row>
          </View>
          <Row style={{ gap: 8, paddingTop: 4 }}>
            <View style={{ flex: 1, backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: radius.chip, padding: 9, gap: 4 }}>
              <Txt size={12} weight="medium" color={colors.muted}>نسبة الثقة</Txt>
              <Row style={{ gap: 2, alignItems: 'baseline' }}>
                <Txt size={24} weight="semibold" style={{ lineHeight: 30 }}>{Math.round(result.confidence * 100)}</Txt>
                <Txt size={12} weight="medium">%</Txt>
              </Row>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.raised, borderColor: colors.border, borderWidth: 1, borderRadius: radius.chip, padding: 9, gap: 6 }}>
              <Txt size={12} weight="medium" color={colors.muted}>جودة الصورة</Txt>
              <View style={{ alignItems: 'flex-end' }}>
                <Chip label={result.quality === 'good' ? 'جودة جيدة' : 'جودة مقبولة'} tone="accentStrong" />
              </View>
            </View>
          </Row>
          <Disclaimer text="تنبيه: هذا فحص أولي من الصورة وليس تشخيصاً نهائياً. لا نقدّم توصيات علاج. يُرجى مراجعة المرشد الزراعي الميداني." />
        </Card>
      ) : (
        <Card>
          <Row style={{ justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 9 }}>
            <Row style={{ gap: 6 }}>
              <Txt size={14} weight="semibold">تعذّر التحليل</Txt>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color={colors.negative} />
            </Row>
            <Chip label={result.source} />
          </Row>
          <Txt size={13} color={colors.negative}>
            {lowConf ? 'النتيجة غير مؤكدة، أعد التصوير' : 'الصورة غير واضحة، أعد التصوير'}
          </Txt>
          <Txt size={12} weight="medium" color={colors.nav}>
            سطوع غير متوازن أو تشويش في الحركة — الرجاء تثبيت اليد والتصوير في ضوء النهار المباشر بزاوية عمودية على نصل الورقة.
          </Txt>
        </Card>
      )}

      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 9 }}>
          <Row style={{ gap: 6 }}>
            <Txt size={14} weight="semibold">حالة فحص سابقة (مرفوض)</Txt>
            <MaterialCommunityIcons name="history" size={14} color={colors.nav} />
          </Row>
          <Chip label="تجريبية" />
        </Row>
        <View
          style={{
            alignSelf: 'flex-end',
            backgroundColor: colors.raised,
            borderColor: colors.muted,
            borderWidth: 1,
            borderRadius: 2,
            paddingHorizontal: 11,
            paddingVertical: 5,
          }}
        >
          <Row style={{ gap: 4 }}>
            <Txt size={13} color={colors.negative}>الصورة غير واضحة، أعد التصوير</Txt>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.negative} />
          </Row>
        </View>
        <Txt size={12} weight="medium" color={colors.nav}>
          سطوع غير متوازن أو تشويش في الحركة — الرجاء تثبيت اليد والتصوير في ضوء النهار المباشر بزاوية عمودية على نصل الورقة.
        </Txt>
      </Card>
    </ScreenShell>
  );
}

function Disclaimer({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: '#ECF0DE', borderColor: colors.border, borderWidth: 1, borderRadius: radius.chip, padding: 13 }}>
      <Row style={{ gap: 8, alignItems: 'flex-start' }}>
        <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.nav} style={{ marginTop: 2 }} />
        <Txt size={12} weight="medium" color="#44483B" style={{ flex: 1, lineHeight: 19 }}>
          {text}
        </Txt>
      </Row>
    </View>
  );
}

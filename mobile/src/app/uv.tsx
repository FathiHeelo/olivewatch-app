// UV screening (replaces the Gemini-based oil analyzer). Flow taken from Zaytoun Vision: capture or upload, then the
// pipeline checklist while the server works, then the verdict, the evidence and the photo checks, then a new scan.
// The analysis runs on the Zaytoun Vision backend (EXPO_PUBLIC_ZAYTOUN_API_URL); nothing here invents a result.
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { pickPhoto } from '../components/ai';
import { Icon, PressScale, Row, Screen } from '../components/ui';
import { useLang } from '../i18n';
import { radius, uv } from '../theme';
import { saveUvScan } from '../uv/scans';
import { BulletList, Card, DecisionChip, EvidenceRow, H, LevelMeter, Notice, P, UvButton, useUvText } from '../uv/ui';
import { analyzeUv, blobToDataUrl, flagReason, toScanRecord, type UvError, type UvResult } from '../uv/zaytoun';

const API = process.env.EXPO_PUBLIC_ZAYTOUN_API_URL;

type Phase =
  | { k: 'capture' }
  | { k: 'preview'; uri: string }
  | { k: 'loading'; uri: string }
  | { k: 'error'; uri: string; error: UvError }
  | { k: 'done'; uri: string; result: UvResult; saved: boolean | null };

export default function UvScan() {
  const t = useUvText();
  const { backIcon, rtl } = useLang();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ k: 'capture' });
  const [sampleId, setSampleId] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const web = Platform.OS === 'web';

  async function take(fromGallery: boolean) {
    const uri = await pickPhoto(fromGallery);
    if (uri) setPhase({ k: 'preview', uri });
  }

  async function analyze(uri: string) {
    setPhase({ k: 'loading', uri });
    scroller.current?.scrollTo({ y: 0, animated: true });
    let dataUrl: string;
    try {
      dataUrl = await blobToDataUrl(await (await fetch(uri)).blob());
    } catch {
      setPhase({ k: 'error', uri, error: 'bad_image' });
      return;
    }
    const r = await analyzeUv(API, dataUrl, { sampleName: sampleId.trim() || undefined });
    if (!r.ok) {
      setPhase({ k: 'error', uri, error: r.error });
      return;
    }
    setPhase({ k: 'done', uri, result: r.data, saved: null });
    const id = await saveUvScan(toScanRecord(r.data, 'mobile', { sampleId }));
    setPhase((p) => (p.k === 'done' && p.uri === uri ? { ...p, saved: id !== null } : p));
  }

  const reset = () => setPhase({ k: 'capture' });
  const photo = phase.k === 'capture' ? null : phase.uri;

  return (
    <Screen>
      <Row style={{ minHeight: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: uv.card, borderBottomWidth: 1, borderBottomColor: uv.border }}>
        <Row style={{ gap: 6, flex: 1 }}>
          <PressScale onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))} accessibilityLabel="رجوع" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={backIcon} size={24} color={uv.primary} />
          </PressScale>
          <View style={{ flex: 1 }}>
            <H size={18}>{t.title}</H>
          </View>
        </Row>
        <PressScale onPress={() => router.push('/uv-history')} accessibilityLabel={t.historyTitle} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="history" size={24} color={uv.primary} />
        </PressScale>
      </Row>

      <ScrollView ref={scroller} style={{ backgroundColor: uv.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <P>{t.subtitle}</P>

        {/* ---------- capture (Zaytoun "Analyze Sample") ---------- */}
        {phase.k === 'capture' || phase.k === 'preview' ? (
          <>
            <Card tint={uv.flaggedTint} borderColor={uv.flaggedTint}>
              <Row style={{ gap: 8 }}>
                <Icon name="alert-outline" size={20} color={uv.flaggedInk} />
                <H size={16} color={uv.flaggedInk}>
                  {t.safetyTitle}
                </H>
              </Row>
              <BulletList items={t.safety} />
            </Card>

            <Card>
              <Row style={{ justifyContent: 'space-between', gap: 8 }}>
                <P color={uv.text} bold>
                  {t.modeLabel}
                </P>
                <View style={{ backgroundColor: uv.primary, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <P color={uv.onPrimary} bold>
                    {t.modeUv}
                  </P>
                </View>
              </Row>
              <P>{t.modeNote}</P>
              <View style={{ gap: 6 }}>
                <P color={uv.text} bold>
                  {t.sampleIdLabel}
                </P>
                <TextInput
                  value={sampleId}
                  onChangeText={setSampleId}
                  placeholder="S-2024-001"
                  placeholderTextColor={uv.muted}
                  autoCapitalize="characters"
                  accessibilityLabel={t.sampleIdLabel}
                  style={{ minHeight: 48, borderRadius: radius.control, borderWidth: 1, borderColor: uv.border, backgroundColor: uv.bg, paddingHorizontal: 14, fontSize: 15, color: uv.text, textAlign: rtl ? 'right' : 'left' }}
                />
                <P size={14}>{t.sampleIdHint}</P>
              </View>
            </Card>

            <View style={{ height: 230, borderRadius: radius.card, overflow: 'hidden', backgroundColor: uv.darkChamber, alignItems: 'center', justifyContent: 'center' }}>
              {photo ? (
                <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
              ) : (
                <View style={{ alignItems: 'center', gap: 8, padding: 20 }}>
                  <Icon name="flashlight" size={36} color={uv.highlight} />
                  <P color={uv.onDark}>{t.guide[1]}</P>
                </View>
              )}
            </View>

            {phase.k === 'preview' ? (
              <Row style={{ gap: 10 }}>
                <UvButton label={t.analyze} icon="microscope" onPress={() => analyze(phase.uri)} />
                <UvButton label={t.cancel} tone="outline" onPress={reset} />
              </Row>
            ) : (
              <Row style={{ gap: 10 }}>
                {!web ? <UvButton label={t.takePhoto} icon="camera-outline" tone="highlight" onPress={() => take(false)} /> : null}
                <UvButton label={t.choosePhoto} icon="image-outline" tone={web ? 'highlight' : 'outline'} onPress={() => take(true)} />
              </Row>
            )}

            <Card>
              <PressScale onPress={() => setGuideOpen((o) => !o)} accessibilityLabel={t.guideTitle} style={{ minHeight: 48, justifyContent: 'center' }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <H size={16} color={uv.primary}>
                    {t.guideTitle}
                  </H>
                  <Icon name={guideOpen ? 'chevron-up' : 'chevron-down'} size={22} color={uv.primary} />
                </Row>
              </PressScale>
              {guideOpen ? (
                <>
                  <BulletList items={t.guide} />
                  <P color={uv.text}>{t.redNote}</P>
                </>
              ) : null}
            </Card>
          </>
        ) : null}

        {/* ---------- pipeline checklist while waiting ---------- */}
        {phase.k === 'loading' ? (
          <Card>
            <H size={17} color={uv.primary}>
              {t.pipelineTitle}
            </H>
            {[
              { label: t.stepPhoto, state: 'done' },
              { label: t.stepServer, state: 'active' },
              { label: t.stepResult, state: 'pending' },
            ].map((s) => (
              <Row key={s.label} style={{ gap: 10, minHeight: 32 }}>
                {s.state === 'active' ? <ActivityIndicator color={uv.primary} /> : <Icon name={s.state === 'done' ? 'check-circle-outline' : 'circle-outline'} size={20} color={s.state === 'done' ? uv.primary : uv.muted} />}
                <View style={{ flex: 1 }}>
                  <P color={s.state === 'pending' ? uv.muted : uv.text} bold={s.state === 'active'}>
                    {s.label}
                  </P>
                </View>
              </Row>
            ))}
            <P>{t.analyzing}</P>
          </Card>
        ) : null}

        {/* ---------- server unreachable / error: say so, show nothing else ---------- */}
        {phase.k === 'error' ? (
          <>
            <Card tint={uv.retakeTint}>
              <H size={18}>{t.errorTitle}</H>
              <P color={uv.text}>{t.errors[phase.error]}</P>
            </Card>
            <Row style={{ gap: 10 }}>
              <UvButton label={t.tryAgain} icon="refresh" onPress={() => analyze(phase.uri)} />
              <UvButton label={t.newScan} tone="outline" onPress={reset} />
            </Row>
          </>
        ) : null}

        {/* ---------- result (Zaytoun "Analysis Results") ---------- */}
        {phase.k === 'done' ? <Result result={phase.result} saved={phase.saved} uri={phase.uri} onNew={reset} /> : null}

        {phase.k !== 'capture' && phase.k !== 'preview' ? <Notice /> : null}
      </ScrollView>
    </Screen>
  );
}

function Result({ result, saved, uri, onNew }: { result: UvResult; saved: boolean | null; uri: string; onNew: () => void }) {
  const t = useUvText();
  const ind = result.indicators;
  const reasons = ind ? [...new Set(ind.flags.map(flagReason).filter((x): x is NonNullable<typeof x> => x !== null))] : [];

  return (
    <View style={{ gap: 14 }}>
      <View style={{ height: 160, borderRadius: radius.card, overflow: 'hidden', backgroundColor: uv.darkChamber }}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
      </View>

      {result.valid ? (
        <Card>
          <P bold>{t.resultTitle}</P>
          <DecisionChip decision={result.decision} />
          <H size={22}>{t.decisions[result.decision].title}</H>
          <P color={uv.text}>{t.decisions[result.decision].body}</P>
          <View style={{ height: 1, backgroundColor: uv.border }} />
          <LevelMeter level={result.confidence_level} />
        </Card>
      ) : (
        <Card tint={uv.retakeTint}>
          <H size={22}>{t.retakeTitle}</H>
          <P color={uv.text}>{t.retakeBody}</P>
          <BulletList items={result.retake.map((r) => t.retake[r])} />
        </Card>
      )}

      {result.valid && ind ? (
        <Card>
          <H size={17} color={uv.primary}>
            {t.evidenceTitle}
          </H>
          <EvidenceRow label={t.redLabel} state={t.indicator[ind.red]} share={ind.fractions?.red ?? null} color={uv.channelRed} />
          <EvidenceRow label={t.greenLabel} state={t.indicator[ind.greenBaseline]} share={ind.fractions?.green ?? null} color={uv.channelGreen} />
          <EvidenceRow label={t.blueLabel} state={t.indicator[ind.blue]} share={ind.fractions?.blue ?? null} color={uv.channelBlue} />
          {ind.redBlueRatio !== null && ind.greenBlueRatio !== null ? (
            <Row style={{ justifyContent: 'space-between', gap: 8 }}>
              <P>{t.ratiosLabel}</P>
              <P color={uv.text} bold>{`⁦R/B ${ind.redBlueRatio.toFixed(2)} · G/B ${ind.greenBlueRatio.toFixed(2)}⁩`}</P>
            </Row>
          ) : null}
          <View style={{ height: 1, backgroundColor: uv.border }} />
          <P color={uv.text} bold>
            {t.flagsLabel}
          </P>
          {reasons.length ? <BulletList items={reasons.map((r) => t.retake[r])} /> : <P>{t.noFlags}</P>}
          <P color={uv.text}>{t.redNote}</P>
        </Card>
      ) : null}

      {saved !== null ? <P size={14}>{saved ? t.saved : t.saveFailed}</P> : null}
      <UvButton label={result.valid ? t.newScan : t.retakePhoto} icon={result.valid ? 'plus' : 'camera-retake-outline'} onPress={onNew} />
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SourceBadge } from '../components/ai';
import { Icon, PressScale, Row, Screen, Txt } from '../components/ui';
import { AdvisorMessage, aiAdvisor } from '../data/aiClient';
import { MlSource, Why } from '../data/ml';
import { getRepository, HomeData } from '../data/repository';
import { useLang } from '../i18n';
import { colors, radius } from '../theme';

type Msg = AdvisorMessage & { source?: MlSource; why?: Why };

export default function Advisor() {
  const { backIcon, pick, lang, rtl } = useLang();
  const router = useRouter();
  const [home, setHome] = useState<HomeData | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => getRepository().subscribeHome(setHome), []);

  const suggestions = [
    pick('متى أرشّ ضد عين الطاووس؟', 'When should I spray against peacock spot?'),
    pick('كيف أقرأ مؤشر الإجهاد المناخي؟', 'How do I read the climate stress index?'),
    pick('متى أقطف للعصر على البارد؟', 'When should I harvest for cold press?'),
  ];

  async function send(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setText('');
    const history: Msg[] = [...msgs, { role: 'user', text: question }];
    setMsgs(history);
    setBusy(true);
    // The context is app data, not typed by the user. The CSI is labelled so it is never read as a percentage.
    const context = home
      ? {
          farm: { name: home.farm.nameEn ?? home.farm.name, areaDunum: home.farm.areaDunum, trees: home.farm.trees },
          activeAlert: 'Peacock Spot risk in the North Plot (morning dew)',
          climateStressIndex: { value: home.climate.csi, scale: '0-100 index (not a percentage)' },
        }
      : undefined;
    const r = await aiAdvisor(history.map(({ role, text: t }) => ({ role, text: t })), lang, context);
    if (r.ok) {
      setMsgs([...history, { role: 'assistant', text: r.data.reply, source: 'gemini' }]);
    } else {
      // Gateway unreachable or limit reached: say so plainly. This is not an answer from the model.
      const why: Why = { error: r.error, limit: r.limit, retryAfter: r.retryAfter };
      setMsgs([
        ...history,
        {
          role: 'assistant',
          text: pick('لا أستطيع الرد الآن، وهذه رسالة محاكاة وليست إجابة من النموذج. راجع المرشد الزراعي.', 'I cannot answer right now. This is a simulated message, not an answer from the model. Consult an agronomist.'),
          source: 'محاكاة',
          why,
        },
      ]);
    }
    setBusy(false);
  }

  return (
    <Screen>
      <Row style={{ minHeight: 64, paddingHorizontal: 12, justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Row style={{ gap: 6, flex: 1 }}>
          <PressScale onPress={() => router.back()} accessibilityLabel="رجوع" style={{ width: 48, height: 48, justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={backIcon} size={24} color={colors.primary} />
          </PressScale>
          <View style={{ flex: 1 }}>
            <Txt size={17} face="jakarta" color={colors.primary} style={{ lineHeight: 22 }}>
              {pick('المرشد الزراعي الذكي', 'AI Agronomist')}
            </Txt>
            <Txt size={14} color={colors.muted} style={{ lineHeight: 18 }}>
              {pick('إرشاد أولي، وليس بديلاً عن المهندس الزراعي', 'Preliminary guidance, not a substitute for an agronomist')}
            </Txt>
          </View>
        </Row>
      </Row>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroller} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })} contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {msgs.length === 0 ? (
            <View style={{ gap: 12 }}>
              <View style={{ alignItems: 'center', gap: 8, paddingVertical: 12 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.secondaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="head-cog-outline" size={32} color={colors.primary} />
                </View>
                <Txt size={15} color={colors.muted} style={{ textAlign: 'center' }}>
                  {pick('اسألني عن مرضٍ أو ريٍّ أو قطاف أو مناخ بيّارتك.', 'Ask me about disease, irrigation, harvest or your grove’s climate.')}
                </Txt>
              </View>
              {suggestions.map((s) => (
                <PressScale key={s} onPress={() => send(s)} accessibilityLabel={s} style={{ minHeight: 48, borderRadius: radius.control, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.surface, justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
                  <Txt size={14} weight="medium" color={colors.primary}>
                    {s}
                  </Txt>
                </PressScale>
              ))}
            </View>
          ) : null}

          {msgs.map((m, i) => {
            const mine = m.role === 'user';
            return (
              <View key={i} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%', gap: 6 }}>
                <View style={{ backgroundColor: mine ? colors.primaryContainer : colors.surface, borderWidth: mine ? 0 : 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Txt size={15} color={mine ? colors.white : colors.text} style={{ lineHeight: 23 }}>
                    {m.text}
                  </Txt>
                </View>
                {m.source ? <SourceBadge source={m.source} why={m.why} /> : null}
              </View>
            );
          })}

          {busy ? (
            <Row style={{ gap: 8, alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }}>
              <ActivityIndicator color={colors.primaryContainer} />
              <Txt size={14} color={colors.muted}>
                {pick('المرشد يكتب…', 'The advisor is typing…')}
              </Txt>
            </Row>
          ) : null}
        </ScrollView>

        <Row style={{ gap: 8, padding: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
          <TextInput
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => send(text)}
            returnKeyType="send"
            placeholder={pick('اكتب سؤالك…', 'Type your question…')}
            placeholderTextColor={colors.faint}
            multiline
            style={{ flex: 1, minHeight: 48, maxHeight: 120, borderRadius: radius.control, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.low, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}
          />
          <PressScale onPress={() => send(text)} disabled={busy || !text.trim()} accessibilityLabel={pick('إرسال', 'Send')} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={22} color={colors.white} />
          </PressScale>
        </Row>
      </KeyboardAvoidingView>
    </Screen>
  );
}

// Shared pieces of the AI screens (leaf scan, oil analyzer): taking a photo, the source chip, and the reason why a
// simulated result is shown. Everything here is language-aware through useLang().
import { Platform, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MlSource, Why } from '../data/ml';
import { useLang } from '../i18n';
import { colors } from '../theme';
import { Pill, Txt } from './ui';

/** Same pattern on every screen: the camera on a phone, the file picker on the web (there is no camera API). */
export async function pickPhoto(fromGallery: boolean): Promise<string | null> {
  let res: ImagePicker.ImagePickerResult;
  if (Platform.OS === 'web' || fromGallery) {
    res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
  } else {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  }
  return res.canceled ? null : res.assets[0].uri;
}

/** A percentage kept as one left-to-right run, so Arabic text does not flip "95%" into "%95". */
export const pct = (v: number) => `⁦${Math.round(v * 100)}%⁩`;

/** Chip text. A Gemini answer is "preliminary", never "real"; a mock is "simulated". */
export function sourceLabel(source: MlSource, lang: 'ar' | 'en'): string {
  if (source === 'gemini') return lang === 'ar' ? 'Gemini · فحص أولي' : 'Gemini · Preliminary';
  if (source === 'محاكاة') return lang === 'ar' ? 'محاكاة' : 'Simulated';
  if (source === 'تجريبية') return lang === 'ar' ? 'تجريبية' : 'Sample';
  return lang === 'ar' ? 'حقيقية' : 'Real';
}

/** One line saying why the gateway was not used (only when a mock answered). */
export function whyText(why: Why | undefined, lang: 'ar' | 'en'): string | undefined {
  if (!why) return undefined;
  const s = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  if (why.limit) return s(`بلغنا حدّ الاستخدام المجاني لـ Gemini${why.retryAfter ? `. أعد المحاولة بعد ${why.retryAfter} ثانية` : '. أعد المحاولة بعد قليل'}.`, `The free Gemini limit was reached${why.retryAfter ? `. Try again in ${why.retryAfter} s` : '. Try again shortly'}.`);
  if (why.error === 'not_configured') return s('بوابة الذكاء الاصطناعي غير مضبوطة (EXPO_PUBLIC_AI_URL).', 'The AI gateway is not set up (EXPO_PUBLIC_AI_URL).');
  if (why.error === 'image_unreadable') return s('تعذّرت قراءة الصورة.', 'The photo could not be read.');
  return s('تعذّر الوصول إلى بوابة الذكاء الاصطناعي.', 'The AI gateway could not be reached.');
}

/** Source chip, plus the reason line when the result is simulated. */
export function SourceBadge({ source, why, demo }: { source: MlSource; why?: Why; demo?: boolean }) {
  const { lang, pick } = useLang();
  const simulated = source === 'محاكاة';
  const reason = demo ? pick('عيّنة تجريبية من التطبيق وليست صورتك.', 'A demo sample from the app, not your photo.') : whyText(why, lang);
  return (
    <View style={{ gap: 6, alignItems: lang === 'ar' ? 'flex-end' : 'flex-start' }}>
      <Pill label={sourceLabel(source, lang)} bg={simulated ? colors.raised : colors.secondaryContainer} ink={colors.primary} face="labelBold" size={12} />
      {simulated && reason ? (
        <Txt size={13} color={colors.muted}>
          {reason}
        </Txt>
      ) : null}
    </View>
  );
}

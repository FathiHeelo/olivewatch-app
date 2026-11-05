// GENERATED from shared/zaytoun-i18n.ts by `node shared/sync-glossary.mjs`. Do not edit this copy.
// Every string of the UV screening screens (mobile and mill dashboard), Arabic and English.
// Wording rules: "preliminary screening", "suspicion flagged", "laboratory verification recommended". Never an
// accuracy figure, never "pure", "authentic", "adulteration-free", "fit for consumption" or "antioxidant content".
import type { ConfidenceLevel, RetakeReason, UvDecision, UvError } from './zaytoun';

const en = {
  title: 'UV Scan',
  subtitle: 'Preliminary UV fluorescence screening of olive oil',
  notice: 'Preliminary screening aid. Not an accredited laboratory test and not proof of oil authenticity.',
  credit: 'Built on the Zaytoun Vision project',
  creditUrl: 'https://github.com/Mutasem-mk4/zaytoun-vision',

  safetyTitle: 'Before you capture',
  safety: [
    'Never point UV light or a laser at anyone’s eyes.',
    'A phone’s white flash is not the same as controlled UV/LED excitation (405 nm or 372 nm). This analyzer only reads photos taken under UV light in a dark room.',
  ],
  modeLabel: 'Mode',
  modeUv: 'UV, dark room',
  modeNote: 'The analyzer is built for dark-room UV photos only.',

  guideTitle: 'How to capture a usable photo',
  guide: [
    'Use samples of known origin and one uniform, transparent container.',
    'Dark room and a dark background; nothing but the UV light on the sample.',
    'Keep the sample volume, distance, camera angle and exposure the same every time.',
    'Fix the white balance if your camera allows it.',
    'Avoid direct reflections on the glass and over-bright (saturated) spots.',
    'Fill most of the frame with the liquid, not the bottle edges.',
    'Several photos of the same bottle are not independent samples.',
  ],
  redNote: 'A red glow alone does not prove anything: chlorophyll also fluoresces in other oils.',

  takePhoto: 'Take photo',
  choosePhoto: 'Choose photo',
  analyze: 'Analyze',
  analyzing: 'Analyzing the photo…',
  retakePhoto: 'Retake photo',
  newScan: 'New scan',
  tryAgain: 'Try again',
  cancel: 'Cancel',
  pipelineTitle: 'UV screening steps',
  stepPhoto: 'Photo ready',
  stepServer: 'Quality gate and UV analysis on the server',
  stepResult: 'Preliminary result',
  startScan: 'Start UV scan',
  startScanHint: 'Preliminary screening of an oil sample under UV light',
  errorTitle: 'No result',
  sampleIdLabel: 'Sample ID (optional)',
  sampleIdHint: 'Links this scan to a sample or batch in Traceability',
  batchLabel: 'Batch (optional)',
  noBatch: 'No batch',

  resultTitle: 'Preliminary screening result',
  retakeTitle: 'Retake the photo',
  retakeBody: 'The photo did not give a usable UV signal, so no result is shown.',
  levelLabel: 'Screening confidence level',
  evidenceTitle: 'Evidence from the photo',
  redLabel: 'Red emission (chlorophyll)',
  greenLabel: 'Green baseline',
  blueLabel: 'Blue emission',
  ratiosLabel: 'Red/Blue and Green/Blue ratios',
  flagsLabel: 'Photo checks',
  noFlags: 'No photo problems found',

  historyTitle: 'Scan history',
  historyEmpty: 'No UV scans yet.',
  saved: 'Saved to history',
  saveFailed: 'The result is shown but could not be saved to history.',
  colDate: 'Date',
  colSample: 'Sample ID',
  colBatch: 'Batch',
  colDecision: 'Preliminary decision',
  colLevel: 'Level',
  search: 'Search sample or batch',
  filterAll: 'All decisions',
  filterRetake: 'Retake needed',
  print: 'Print / export report',
  reportTitle: 'UV screening report',
  traceLabel: 'Preliminary screening',
  openFull: 'Open',
};

type Text = { [K in keyof typeof en]: (typeof en)[K] extends readonly string[] ? readonly string[] : string };

const ar: Text = {
  title: 'فحص UV (يو في)',
  subtitle: 'فحص أولي لفلورة زيت الزيتون تحت الأشعة فوق البنفسجية',
  notice: 'أداة فحص أولي مساعدة. ليست فحصاً مخبرياً معتمداً ولا دليلاً على أصالة الزيت.',
  credit: 'مبني على مشروع Zaytoun Vision (زيتون فيجن)',
  creditUrl: 'https://github.com/Mutasem-mk4/zaytoun-vision',

  safetyTitle: 'قبل التصوير',
  safety: [
    'لا توجّه ضوء UV (يو في) أو الليزر نحو عيون أي أحد.',
    'فلاش الهاتف الأبيض لا يعادل إثارة UV (يو في) أو LED مضبوطة (405 أو 372 نانومتر). هذا المحلل يقرأ فقط صوراً ملتقطة تحت ضوء UV (يو في) في غرفة معتمة.',
  ],
  modeLabel: 'النمط',
  modeUv: 'UV (يو في) في غرفة معتمة',
  modeNote: 'المحلل مبني لصور UV (يو في) في غرفة معتمة فقط.',

  guideTitle: 'كيف تلتقط صورة صالحة',
  guide: [
    'استخدم عيّنات معروفة المصدر ووعاءً شفافاً موحّداً.',
    'غرفة معتمة وخلفية داكنة، ولا ضوء على العيّنة سوى ضوء UV (يو في).',
    'ثبّت كمية العيّنة والمسافة وزاوية الكاميرا والتعريض في كل مرة.',
    'ثبّت توازن الأبيض إن كانت كاميرتك تسمح بذلك.',
    'تجنّب الانعكاس المباشر على الزجاج والبقع شديدة السطوع.',
    'اجعل السائل يملأ معظم الإطار، لا حواف الزجاجة.',
    'الصور المتكررة لنفس الزجاجة ليست عيّنات مستقلة.',
  ],
  redNote: 'التوهّج الأحمر وحده لا يثبت شيئاً: الكلوروفيل يتفلور في زيوت أخرى أيضاً.',

  takePhoto: 'التقط صورة',
  choosePhoto: 'اختر صورة',
  analyze: 'حلّل',
  analyzing: 'جارٍ تحليل الصورة…',
  retakePhoto: 'أعد التصوير',
  newScan: 'فحص جديد',
  tryAgain: 'حاول مرة أخرى',
  cancel: 'إلغاء',
  pipelineTitle: 'خطوات فحص UV (يو في)',
  stepPhoto: 'الصورة جاهزة',
  stepServer: 'فحص جودة الصورة وتحليل UV (يو في) على الخادم',
  stepResult: 'النتيجة الأولية',
  startScan: 'ابدأ فحص UV (يو في)',
  startScanHint: 'فحص أولي لعيّنة زيت تحت ضوء الأشعة فوق البنفسجية',
  errorTitle: 'لا توجد نتيجة',
  sampleIdLabel: 'رقم العيّنة (اختياري)',
  sampleIdHint: 'يربط هذا الفحص بعيّنة أو دفعة في سجل التتبع',
  batchLabel: 'الدفعة (اختياري)',
  noBatch: 'بدون دفعة',

  resultTitle: 'نتيجة الفحص الأولي',
  retakeTitle: 'أعد التصوير',
  retakeBody: 'الصورة لم تعطِ إشارة UV (يو في) صالحة، لذلك لا نعرض أي نتيجة.',
  levelLabel: 'مستوى الثقة في الفحص',
  evidenceTitle: 'الأدلة من الصورة',
  redLabel: 'الانبعاث الأحمر (الكلوروفيل)',
  greenLabel: 'الخط الأساسي الأخضر',
  blueLabel: 'الانبعاث الأزرق',
  ratiosLabel: 'نسبتا الأحمر/الأزرق والأخضر/الأزرق',
  flagsLabel: 'فحوص الصورة',
  noFlags: 'لم نجد مشاكل في الصورة',

  historyTitle: 'سجل الفحوص',
  historyEmpty: 'لا توجد فحوص UV (يو في) بعد.',
  saved: 'حُفظ في السجل',
  saveFailed: 'النتيجة معروضة لكن تعذّر حفظها في السجل.',
  colDate: 'التاريخ',
  colSample: 'رقم العيّنة',
  colBatch: 'الدفعة',
  colDecision: 'القرار الأولي',
  colLevel: 'المستوى',
  search: 'ابحث برقم العيّنة أو الدفعة',
  filterAll: 'كل القرارات',
  filterRetake: 'تحتاج إعادة تصوير',
  print: 'طباعة / تصدير التقرير',
  reportTitle: 'تقرير الفحص بالأشعة فوق البنفسجية',
  traceLabel: 'فحص أولي',
  openFull: 'فتح',
};

const decisions: Record<'ar' | 'en', Record<UvDecision, { title: string; body: string }>> = {
  en: {
    within_reference: { title: 'Within the reference pattern', body: 'The red, green and blue emission in the photo is close to the reference pattern of fresh olive oil. This is a preliminary screening only.' },
    aging_flagged: { title: 'Signs of aging flagged', body: 'Olive-oil-like emission with signs of aging or oxidation. Laboratory verification recommended.' },
    oxidation_flagged: { title: 'Strong oxidation pattern flagged', body: 'Red emission is mostly gone while the green baseline remains: a heavily oxidized pattern. Laboratory verification recommended.' },
    suspicion_flagged: { title: 'Suspicion flagged', body: 'Weak red, dominant blue and no green baseline: the pattern is closer to refined or seed oil. Laboratory verification recommended.' },
  },
  ar: {
    within_reference: { title: 'ضمن النمط المرجعي', body: 'الانبعاث الأحمر والأخضر والأزرق في الصورة قريب من النمط المرجعي لزيت الزيتون الطازج. هذا فحص أولي فقط.' },
    aging_flagged: { title: 'رُصدت علامات تقادم', body: 'انبعاث يشبه زيت الزيتون مع علامات تقادم أو أكسدة. يُنصح بالتحقق المخبري.' },
    oxidation_flagged: { title: 'رُصد نمط أكسدة قوي', body: 'الانبعاث الأحمر شبه غائب بينما يبقى الخط الأساسي الأخضر: نمط أكسدة شديد. يُنصح بالتحقق المخبري.' },
    suspicion_flagged: { title: 'رُصد اشتباه', body: 'أحمر ضعيف وأزرق طاغٍ ولا خط أساسي أخضر: النمط أقرب إلى زيت مكرّر أو زيت بذور. يُنصح بالتحقق المخبري.' },
  },
};

const levels: Record<'ar' | 'en', Record<ConfidenceLevel, string>> = {
  en: { low: 'Low', medium: 'Medium', high: 'High' },
  ar: { low: 'منخفض', medium: 'متوسط', high: 'مرتفع' },
};

const retake: Record<'ar' | 'en', Record<RetakeReason, string>> = {
  en: {
    not_dark_room: 'The background is bright: this does not look like a dark-room UV photo. Turn off the lights and use a black background.',
    glare: 'Light is reflecting off the glass edges. Move the UV light to the side and frame the liquid centre.',
    surface_hotspot: 'The red glow sits on the liquid surface, not inside it. Frame the centre of the liquid, below the surface.',
    no_liquid: 'Not enough liquid signal was found. Fill more of the frame with the oil under UV.',
    saturated: 'Parts of the photo are over-bright. Move the UV light farther away or lower the exposure.',
    too_small: 'The photo is too small. Use the camera’s full resolution.',
    unclear: 'Retake in a dark room with the liquid centred and no visible reflections.',
  },
  ar: {
    not_dark_room: 'الخلفية مضيئة: الصورة لا تبدو صورة UV (يو في) في غرفة معتمة. أطفئ الأضواء واستخدم خلفية سوداء.',
    glare: 'هناك انعكاس على حواف الزجاج. حرّك ضوء UV (يو في) إلى الجانب وركّز على وسط السائل.',
    surface_hotspot: 'التوهّج الأحمر على سطح السائل لا داخله. ركّز على وسط السائل تحت السطح.',
    no_liquid: 'لم نجد إشارة كافية من السائل. اجعل الزيت يملأ مساحة أكبر من الإطار تحت ضوء UV (يو في).',
    saturated: 'أجزاء من الصورة شديدة السطوع. أبعد ضوء UV (يو في) أو خفّض التعريض.',
    too_small: 'الصورة صغيرة جداً. استخدم الدقة الكاملة للكاميرا.',
    unclear: 'أعد التصوير في غرفة معتمة والسائل في الوسط وبلا انعكاسات ظاهرة.',
  },
};

const indicatorText: Record<'ar' | 'en', { detected: string; weak: string; present: string; absent: string; dominant: string; not_dominant: string }> = {
  en: { detected: 'Detected', weak: 'Weak', present: 'Present', absent: 'Absent', dominant: 'Dominant', not_dominant: 'Not dominant' },
  ar: { detected: 'مرصود', weak: 'ضعيف', present: 'موجود', absent: 'غائب', dominant: 'طاغٍ', not_dominant: 'غير طاغٍ' },
};

const errors: Record<'ar' | 'en', Record<UvError, string>> = {
  en: {
    not_configured: 'The UV analysis server is not set up (ZAYTOUN_API_URL). No result can be shown.',
    timeout: 'The UV analysis server took too long to answer. Try again.',
    network: 'The UV analysis server cannot be reached. Check the connection and try again. No result is shown.',
    bad_image: 'The server could not read this image. Use a JPG or PNG photo.',
    server: 'The UV analysis server returned an error. Try again later.',
    bad_response: 'The server answered with something that is not a UV analysis. No result is shown.',
  },
  ar: {
    not_configured: 'خادم تحليل UV (يو في) غير مضبوط (ZAYTOUN_API_URL). لا يمكن عرض نتيجة.',
    timeout: 'تأخّر خادم تحليل UV (يو في) في الرد. حاول مرة أخرى.',
    network: 'تعذّر الوصول إلى خادم تحليل UV (يو في). تحقّق من الاتصال وحاول مرة أخرى. لا نعرض أي نتيجة.',
    bad_image: 'تعذّر على الخادم قراءة الصورة. استخدم صورة JPG أو PNG.',
    server: 'أعاد خادم تحليل UV (يو في) خطأ. حاول لاحقاً.',
    bad_response: 'ردّ الخادم بشيء ليس تحليل UV (يو في). لا نعرض أي نتيجة.',
  },
};

export function uvText(lang: 'ar' | 'en') {
  return { ...(lang === 'ar' ? ar : en), decisions: decisions[lang], levels: levels[lang], retake: retake[lang], indicator: indicatorText[lang], errors: errors[lang] };
}
export type UvText = ReturnType<typeof uvText>;

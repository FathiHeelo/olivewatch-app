// Design tokens taken from the Stitch project "OliveWatch AI Mobile App" (Terra Terroir Agritech).
export const colors = {
  ground: '#F5FBF0', // background / surface
  surface: '#FFFFFF', // surface-container-lowest
  raised: '#EAF0E5', // surface-container
  low: '#F0F5EA', // surface-container-low
  border: '#DEE4DA', // surface-variant
  outline: '#C3C8BE', // outline-variant
  text: '#171D17', // on-surface
  muted: '#434841', // on-surface-variant
  faint: '#737970', // outline
  primary: '#1F381D',
  primaryContainer: '#354F32',
  onPrimaryContainer: '#A2C09B',
  secondary: '#516524',
  secondaryContainer: '#D0E998',
  gold: '#F0BF64', // tertiary-fixed-dim: the scan button and accents
  goldSoft: '#FFF3DD',
  tertiary: '#442F00',
  tertiaryContainer: '#604400',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  errorSoft: '#FBEAE4',
  white: '#FFFFFF',
  nav: '#434841',
};

export const fonts = {
  regular: 'IBMPlexSansArabic_400Regular',
  medium: 'IBMPlexSansArabic_500Medium',
  semibold: 'IBMPlexSansArabic_600SemiBold',
  bold: 'IBMPlexSansArabic_700Bold',
  // Latin-only text (titles, numbers, eyebrows) uses the two Stitch faces.
  latinBold: 'PlusJakartaSans_700Bold',
  latinExtra: 'PlusJakartaSans_800ExtraBold',
  latin: 'PlusJakartaSans_500Medium',
  label: 'SpaceGrotesk_500Medium',
  labelBold: 'SpaceGrotesk_700Bold',
};

// OliveWatch brand palette. The UV screening screens use only these, through the `uv` tokens below.
export const palette = {
  deepOlive: '#354F32', // primary, dark backgrounds
  olive: '#758B45', // positive indicators (bars, icons, borders; 3.4:1 on off-white, so never body text)
  gold: '#D6A84F', // highlights
  earth: '#796044', // flagged states (5.4:1 on off-white)
  offWhite: '#F7F7F0', // light backgrounds
  charcoal: '#252B24', // text and dark elements
};

// Semantic tokens for the UV screens. Status is never shown by colour alone: every tint goes with a text label.
export const uv = {
  bg: palette.offWhite,
  card: '#FFFFFF',
  text: palette.charcoal,
  muted: '#4E554B', // 7:1 on off-white
  border: '#DCDDD0',
  primary: palette.deepOlive,
  onPrimary: '#FFFFFF',
  highlight: palette.gold,
  onHighlight: palette.charcoal,
  positive: palette.olive,
  positiveTint: '#E8EDDB',
  positiveInk: palette.deepOlive,
  flagged: palette.earth,
  flaggedTint: '#F4ECDC',
  flaggedInk: palette.earth,
  retakeTint: '#ECEDE6',
  retakeInk: palette.charcoal,
  darkChamber: palette.charcoal,
  onDark: '#F7F7F0',
  track: '#E2E4D8',
  // Evidence bars for the three emission channels (always shown next to their names)
  channelRed: '#9E4A3A',
  channelGreen: palette.olive,
  channelBlue: '#4F6B8A',
};

export const uvFonts = {
  heading: 'Cairo_700Bold',
  headingSemi: 'Cairo_600SemiBold',
  body: 'Tajawal_400Regular',
  bodyMedium: 'Tajawal_500Medium',
  bodyBold: 'Tajawal_700Bold',
};

export const radius = { card: 20, control: 12, chip: 999, tile: 16 };
export const space = { gutter: 16, gap: 16 };

// Design System Tokens for CogniCare NER
// Extracted from UI design screenshots — do not deviate from these values.

export const Colors = {
  // ─── Backgrounds ─────────────────────────────────────────────────────────
  bgCream: '#FAF7F0',
  bgCard: '#FFFFFF',
  bgCardWarm: '#FDF9F2',

  // ─── Domain Colors (each game domain has its own identity color) ──────────
  domainMemory: '#2A6B7C',      // Teal — Yaad Rakho
  domainAttention: '#7A3020',   // Brown-red — Nazar Tez
  domainPatterns: '#4A5C1A',    // Olive green — Milan
  domainRecall: '#6B3FA0',      // Purple — Mera Din
  domainEmotional: '#1A5276',   // Deep blue — future

  // ─── Accent / Status ──────────────────────────────────────────────────────
  gold: '#C4922A',
  goldLight: '#F5E6C8',
  alertRed: '#C0392B',
  alertRedLight: '#FADBD8',
  alertYellow: '#E6A817',
  alertYellowLight: '#FEF9E7',
  successTeal: '#2A9D8F',
  successTealLight: '#D5F5F0',

  // ─── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  textLink: '#2A6B9C',
  textOnDark: '#FFFFFF',
  textHindi: '#5B4A3A',  // Warm brown for Hindi subtitles

  // ─── Borders ──────────────────────────────────────────────────────────────
  borderLight: '#E8E0D4',
  borderMedium: '#C8BCA8',
  borderGold: '#C4922A',

  // ─── Caregiver Mode ───────────────────────────────────────────────────────
  caregiverNavy: '#1A2340',
  caregiverNavyLight: '#1E2D4A',

  // ─── Chat / Companion ─────────────────────────────────────────────────────
  chatGreen: '#2A5C3A',
  chatGreenLight: '#EAF5ED',

  // ─── Interactive States ───────────────────────────────────────────────────
  tileSelected: '#FFF3DC',
  tileCorrect: '#D5F5F0',
  tileWrong: '#FADBD8',
  tileDefault: '#FFFFFF',
  disabled: '#C8C8C8',

  // ─── Tab Bar ──────────────────────────────────────────────────────────────
  tabBarBg: '#1A1A0F',
  tabBarActive: '#C4922A',
  tabBarInactive: '#8A8A7A',
};

export const Typography = {
  // Font family (loaded via expo-font / useFonts)
  fontFamily: {
    regular: 'Nunito_400Regular',
    semiBold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    extraBold: 'Nunito_800ExtraBold',
  },

  // Size scale (sp-equivalent) — 18sp baseline per PRD §5(h)
  size: {
    xs: 13,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.45,
    relaxed: 1.6,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
  circle: 9999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStrong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Minimum tap target — 48×48dp per PRD §5(h)
export const MIN_TAP_TARGET = 48;

// Domain metadata — single source of truth for all game domain colors/labels
export const Domains = {
  memory: {
    key: 'memory',
    label: 'Memory',
    hindiLabel: 'याद रखो',
    color: Colors.domainMemory,
    icon: '🧠',
  },
  attention: {
    key: 'attention',
    label: 'Attention',
    hindiLabel: 'नज़र तेज़',
    color: Colors.domainAttention,
    icon: '👁️',
  },
  patterns: {
    key: 'patterns',
    label: 'Patterns',
    hindiLabel: 'मिलान',
    color: Colors.domainPatterns,
    icon: '🔍',
  },
  recall: {
    key: 'recall',
    label: 'Daily Recall',
    hindiLabel: 'मेरा दिन',
    color: Colors.domainRecall,
    icon: '🌅',
  },
} as const;

export type DomainKey = keyof typeof Domains;

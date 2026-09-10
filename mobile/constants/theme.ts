// Design System Tokens for CogniCare NER
// Updated to Neubrutalism flat design

export const Colors = {
  // ─── Backgrounds ─────────────────────────────────────────────────────────
  bgCream: '#FAF3E0', // Cream background from Figma
  bgCard: '#F3E8D5',  // Tile background
  bgCardWarm: '#F3E8D5',

  // ─── Domain Colors (each game domain has its own identity color) ──────────
  domainMemory: '#3B627A',      // Blue
  domainMemoryShadow: '#1C1E1B',
  
  domainAttention: '#586C32',   // Olive Green
  domainAttentionShadow: '#1C1E1B',
  
  domainPatterns: '#893528',    // Rust Brown/Red
  domainPatternsShadow: '#1C1E1B',
  
  domainLanguage: '#B02A24',    // Crimson Red
  domainLanguageShadow: '#1C1E1B',

  domainComputation: '#C4822A', // Gold
  domainComputationShadow: '#1C1E1B',
  
  domainRecall: '#8C4031',      // Rust Red
  domainRecallShadow: '#1C1E1B',

  domainMemories: '#586C32',    // Olive Green
  domainHelp: '#AA3024',        // Crimson Red

  // ─── Accent / Status ──────────────────────────────────────────────────────
  gold: '#C4822A',
  goldLight: '#FDF0E0',
  alertRed: '#8B3A2A',
  alertRedLight: '#F5E8E5',
  alertYellow: '#E6A817',
  alertYellowLight: '#FEF9E7',
  successTeal: '#2D5A3D',
  successTealLight: '#E8F0EB',

  // ─── Text ─────────────────────────────────────────────────────────────────
  textPrimary: '#1C1008',       // Darkest brown/black
  textSecondary: '#4A3828',
  textMuted: '#6B4C35',
  textLink: '#3B6B8A',
  textOnDark: '#FFFFFF',
  textHindi: '#9B8070',  

  // ─── Borders ──────────────────────────────────────────────────────────────
  borderLight: '#1C1E1B',
  borderMedium: '#1C1E1B',
  borderGold: '#A67C52',

  // ─── Caregiver Mode (Material Design Redesign) ────────────────────────────
  caregiverPrimary: '#1E88E5',   // Blue
  caregiverSecondary: '#F5F5F5', // Light Gray
  caregiverAccent: '#FF5252',    // Red
  caregiverText: '#333333',
  caregiverTextMuted: '#757575',
  caregiverBg: '#FFFFFF',
  caregiverBorder: '#E0E0E0',
  caregiverCardBg: '#FFFFFF',
  caregiverNavy: '#1E3D52',
  caregiverNavyLight: '#3B6B8A',

  // ─── Chat / Companion ─────────────────────────────────────────────────────
  chatGreen: '#2D5A3D',
  chatGreenLight: '#E8F0EB',

  // ─── Interactive States ───────────────────────────────────────────────────
  tileSelected: '#FDF0E0',
  tileCorrect: '#E8F0EB',
  tileWrong: '#F5E8E5',
  tileDefault: '#FFFFFF',
  disabled: '#C8AB8A',

  // ─── Tab Bar ──────────────────────────────────────────────────────────────
  tabBarBg: '#23170E',
  tabBarActive: '#324B3B', // Dark green for active tab
  tabBarInactive: '#A0AAB2',
};

export const Typography = {
  // Font family (loaded via expo-font / useFonts)
  fontFamily: {
    regular: 'IBMPlexSans_400Regular',
    semiBold: 'IBMPlexSans_600SemiBold',
    bold: 'AtkinsonHyperlegible_700Bold',
    display: 'AtkinsonHyperlegible_700Bold',
  },

  // Size scale
  size: {
    xs: 15, // Bumped minimum sizes for accessibility
    sm: 17,
    md: 19,
    lg: 22,
    xl: 26,
    xxl: 28,
    xxxl: 32,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
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

// Neubrutalism typically has small or zero border radii
export const Radius = {
  sm: 0,
  md: 0,
  lg: 4,
  xl: 8,
  pill: 100,
  circle: 9999,
};

export const Shadow = {
  card: {
    shadowColor: '#1C1E1B',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4, // Android fallback
  },
  cardStrong: {
    shadowColor: '#1A3322', // Dark green shadow for Up Next
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  caregiverCard: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
};

// Minimum tap target
export const MIN_TAP_TARGET = 48;

// Domain metadata
export const Domains = {
  memory: {
    key: 'memory',
    i18nKey: 'domain_memory',
    color: Colors.domainMemory,
    shadow: Colors.domainMemoryShadow,
    icon: '🧠',
  },
  attention: {
    key: 'attention',
    i18nKey: 'domain_attention',
    color: Colors.domainAttention,
    shadow: Colors.domainAttentionShadow,
    icon: '👁️',
  },
  patterns: {
    key: 'patterns',
    i18nKey: 'domain_patterns',
    color: Colors.domainPatterns,
    shadow: Colors.domainPatternsShadow,
    icon: '🔍',
  },
  recall: {
    key: 'recall',
    i18nKey: 'domain_recall',
    color: Colors.domainRecall,
    shadow: Colors.domainRecallShadow,
    icon: '🌅',
  },
} as const;

export type DomainKey = keyof typeof Domains;

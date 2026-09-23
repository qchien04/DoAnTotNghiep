import { create } from 'zustand';
import {
  THEME_PRESETS,
  DEFAULT_THEME_ID,
  type ThemeConfig,
  type ThemePresetId,
  type ThemeColors,
} from '@/shared/constants/themes';

interface ThemeState {
  currentThemeId: ThemePresetId;
  currentTheme: ThemeConfig;
  setTheme: (themeId: ThemePresetId) => void;
  availableThemes: ThemeConfig[];
}

const STORAGE_KEY = 'stayconnect_theme_id';

const applyCssVariables = (colors: ThemeColors) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  // Brand Primary (Semantic)
  root.style.setProperty('--stay-primary', colors.primary);
  root.style.setProperty('--stay-primary-hover', colors.primaryHover);
  root.style.setProperty('--stay-primary-subtle', colors.primarySubtle);

  // Secondary & Verified (Semantic)
  root.style.setProperty('--stay-secondary', colors.secondary);
  root.style.setProperty('--stay-secondary-hover', colors.secondaryHover);
  root.style.setProperty('--stay-secondary-subtle', colors.secondarySubtle);

  // Lifestyle Match (Semantic)
  root.style.setProperty('--stay-match', colors.match);
  root.style.setProperty('--stay-match-dark', colors.matchDark);
  root.style.setProperty('--stay-match-subtle', colors.matchSubtle);

  // Landlord Promo
  root.style.setProperty('--stay-landlord-bg', colors.landlordBg);

  // Typography (Semantic)
  root.style.setProperty('--stay-text', colors.text);
  root.style.setProperty('--stay-text-secondary', colors.textSecondary);
  root.style.setProperty('--stay-text-muted', colors.textMuted);

  // Borders (Semantic)
  root.style.setProperty('--stay-border', colors.border);
  root.style.setProperty('--stay-border-subtle', colors.borderSubtle);

  // Surfaces & Backgrounds (Semantic)
  root.style.setProperty('--stay-bg-app', colors.bgApp);
  root.style.setProperty('--stay-bg', colors.bgApp);
  root.style.setProperty('--stay-card-bg', colors.cardBg);

  if (colors.isDark) {
    root.classList.add('dark');
    document.body?.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.body?.classList.remove('dark');
  }
};

const getInitialThemeId = (): ThemePresetId => {
  if (typeof window === 'undefined') return DEFAULT_THEME_ID;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved in THEME_PRESETS) {
    return saved as ThemePresetId;
  }
  return DEFAULT_THEME_ID;
};

const initialId = getInitialThemeId();
const initialConfig = THEME_PRESETS[initialId];
applyCssVariables(initialConfig.colors);

export const useThemeStore = create<ThemeState>((set) => ({
  currentThemeId: initialId,
  currentTheme: initialConfig,
  availableThemes: Object.values(THEME_PRESETS),
  setTheme: (themeId: ThemePresetId) => {
    const config = THEME_PRESETS[themeId] || THEME_PRESETS[DEFAULT_THEME_ID];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, themeId);
    }
    applyCssVariables(config.colors);
    set({
      currentThemeId: themeId,
      currentTheme: config,
    });
  },
}));

export default useThemeStore;

export interface ThemeColors {
  // Brand Primary
  primary: string;
  primaryHover: string;
  primarySubtle: string; // Nền dịu / container của Primary

  // Secondary & Verified
  secondary: string;
  secondaryHover: string;
  secondarySubtle: string; // Nền dịu / container của Secondary

  // Lifestyle Match
  match: string;
  matchDark: string;
  matchSubtle: string; // Nền dịu / container của Match

  // Landlord Section Tint
  landlordBg: string;

  // Typography
  text: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  border: string;
  borderSubtle: string; // Đường viền phụ/nhẹ

  // Surfaces & Backgrounds
  bgApp: string; // Nền toàn trang web (Application Canvas)
  cardBg: string; // Nền của thẻ Card, Header, Modal

  // Mode flag
  isDark?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  colors: ThemeColors;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  // 1. Figma Poster Palette (Mặc định)
  stayconnect: {
    id: 'stayconnect',
    name: 'StayConnect Classic (Figma)',
    description: 'Xanh dương hoàng gia & xanh lá xác thực chuẩn Figma Poster',
    preview: {
      primary: '#2563EB',
      secondary: '#16A34A',
      accent: '#10B981',
    },
    colors: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      primarySubtle: '#EFF6FF',
      secondary: '#16A34A',
      secondaryHover: '#15803D',
      secondarySubtle: '#F0FDF4',
      match: '#10B981',
      matchDark: '#059669',
      matchSubtle: '#ECFDF5',
      landlordBg: '#E6F4EA',
      text: '#1E293B',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      bgApp: '#F8FAFC',
      cardBg: '#FFFFFF',
      isDark: false,
    },
  },

  // 2. Đại dương hiện đại (Cyan & Navy)
  'ocean-breeze': {
    id: 'ocean-breeze',
    name: 'Ocean Breeze (Đại Dương Xanh)',
    description: 'Phong cách tươi mát, trẻ trung chuẩn dịch vụ booking quốc tế',
    preview: {
      primary: '#0284C7',
      secondary: '#0D9488',
      accent: '#06B6D4',
    },
    colors: {
      primary: '#0284C7',
      primaryHover: '#0369A1',
      primarySubtle: '#F0F9FF',
      secondary: '#0D9488',
      secondaryHover: '#0F766E',
      secondarySubtle: '#F0FDFA',
      match: '#06B6D4',
      matchDark: '#0891B2',
      matchSubtle: '#ECFEFF',
      landlordBg: '#E0F2FE',
      text: '#0F172A',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      bgApp: '#F8FAFC',
      cardBg: '#FFFFFF',
      isDark: false,
    },
  },

  // 3. Sống xanh sinh thái (Emerald Nature)
  'emerald-nature': {
    id: 'emerald-nature',
    name: 'Eco Green (Chốn Sống Xanh)',
    description: 'Thân thiện, gần gũi thiên nhiên, thanh bình và an cư',
    preview: {
      primary: '#059669',
      secondary: '#16A34A',
      accent: '#34D399',
    },
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primarySubtle: '#ECFDF5',
      secondary: '#16A34A',
      secondaryHover: '#15803D',
      secondarySubtle: '#F0FDF4',
      match: '#10B981',
      matchDark: '#047857',
      matchSubtle: '#D1FAE5',
      landlordBg: '#DCFCE7',
      text: '#1C1917',
      textSecondary: '#57534E',
      textMuted: '#A8A29E',
      border: '#E7E5E4',
      borderSubtle: '#F5F5F4',
      bgApp: '#FAFAF9',
      cardBg: '#FFFFFF',
      isDark: false,
    },
  },

  // 4. Hoàng hôn ấm áp (Cozy Sunset)
  'sunset-warmth': {
    id: 'sunset-warmth',
    name: 'Cozy Sunset (Ấm Áp Sum Vầy)',
    description: 'Màu cam hổ phách ấm cúng như không gian gia đình thân quen',
    preview: {
      primary: '#EA580C',
      secondary: '#D97706',
      accent: '#F59E0B',
    },
    colors: {
      primary: '#EA580C',
      primaryHover: '#C2410C',
      primarySubtle: '#FFF7ED',
      secondary: '#D97706',
      secondaryHover: '#B45309',
      secondarySubtle: '#FFFBEB',
      match: '#F59E0B',
      matchDark: '#D97706',
      matchSubtle: '#FEF3C7',
      landlordBg: '#FEF3C7',
      text: '#292524',
      textSecondary: '#78716C',
      textMuted: '#A8A29E',
      border: '#E7E5E4',
      borderSubtle: '#F5F5F4',
      bgApp: '#FFFDFB',
      cardBg: '#FFFFFF',
      isDark: false,
    },
  },

  // 5. Sang trọng độc bản (Royal Purple)
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple (Gen Z Cá Tính)',
    description: 'Sắc tím hiện đại, thời thượng dành cho căn hộ studio cao cấp',
    preview: {
      primary: '#7C3AED',
      secondary: '#2563EB',
      accent: '#8B5CF6',
    },
    colors: {
      primary: '#7C3AED',
      primaryHover: '#6D28D9',
      primarySubtle: '#F5F3FF',
      secondary: '#2563EB',
      secondaryHover: '#1D4ED8',
      secondarySubtle: '#EFF6FF',
      match: '#8B5CF6',
      matchDark: '#7C3AED',
      matchSubtle: '#EDE9FE',
      landlordBg: '#EDE9FE',
      text: '#1E1B4B',
      textSecondary: '#64748B',
      textMuted: '#94A3B8',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      bgApp: '#FAF5FF',
      cardBg: '#FFFFFF',
      isDark: false,
    },
  },

  // 6. Chế độ tối huyền bí (Midnight Dark)
  'midnight-dark': {
    id: 'midnight-dark',
    name: 'Midnight Dark (Chế Độ Tối)',
    description: 'Giao diện tối chuyên nghiệp, êm dịu cho mắt khi dùng ban đêm',
    preview: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#60A5FA',
    },
    colors: {
      primary: '#3B82F6',
      primaryHover: '#60A5FA',
      primarySubtle: '#1E3A8A', // Nền dịu của primary trên nền tối (tương phản sắc nét với cardBg #1E293B)
      secondary: '#10B981',
      secondaryHover: '#34D399',
      secondarySubtle: '#064E3B', // Nền dịu của secondary trên nền tối
      match: '#34D399',
      matchDark: '#10B981',
      matchSubtle: '#064E3B', // Nền dịu của match trên nền tối
      landlordBg: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      border: '#334155',
      borderSubtle: '#1E293B', // Viền phụ tối
      bgApp: '#0F172A', // Nền toàn trang web tối sâu
      cardBg: '#1E293B', // Nền thẻ tối
      isDark: true,
    },
  },
};

export type ThemePresetId = keyof typeof THEME_PRESETS;
export const DEFAULT_THEME_ID: ThemePresetId = 'stayconnect';

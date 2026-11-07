import React from 'react';
import { ConfigProvider, App, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { useThemeStore } from '@/stores/useThemeStore';

interface AntdProviderProps {
  children: React.ReactNode;
}

export const AntdProvider: React.FC<AntdProviderProps> = ({ children }) => {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const colors = currentTheme.colors;

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: colors.isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          // Dynamic Theme Colors
          colorPrimary: colors.primary,
          colorSuccess: colors.secondary,
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: colors.primary,

          // Typography & Layout (Slightly larger, crisp enterprise feel)
          fontSize: 14.5,
          controlHeight: 40,
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,

          // Text, Surfaces & Border Colors
          colorText: colors.isDark ? '#F8FAFC' : '#242428',
          colorTextSecondary: colors.textSecondary,
          colorBorder: colors.isDark ? '#334155' : '#DADADA',
          colorBgBase: colors.bgApp,
          colorBgLayout: colors.bgApp,
          colorBgContainer: colors.cardBg,
          colorBgElevated: colors.cardBg,
        },
        components: {
          Button: {
            colorPrimary: colors.primary,
            colorPrimaryHover: colors.primaryHover,
            controlHeight: 40,
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14.5,
          },
          Input: {
            controlHeight: 40,
            borderRadius: 8,
            colorBorder: colors.isDark ? '#334155' : '#D7D7DB',
            fontSize: 14.5,
          },
          Select: {
            controlHeight: 40,
            borderRadius: 8,
            colorBorder: colors.isDark ? '#334155' : '#D7D7DB',
            fontSize: 14.5,
          },
          Tabs: {
            colorPrimary: colors.primary,
            titleFontSize: 14.5,
            horizontalItemPadding: '10px 16px',
          },
          Modal: {
            borderRadiusLG: 14,
            titleFontSize: 16,
            contentBg: colors.cardBg,
            headerBg: colors.cardBg,
          },
          Table: {
            headerBg: colors.isDark ? '#1E293B' : '#F7F7F8',
            headerColor: colors.isDark ? '#F8FAFC' : '#242428',
            borderColor: colors.isDark ? '#334155' : '#DADADA',
            rowHoverBg: colors.isDark ? 'rgba(51, 65, 85, 0.4)' : '#F8FAFC',
            headerSplitColor: 'transparent',
            cellPaddingBlock: 12,
            cellPaddingInline: 16,
            fontSize: 14,
          },
          Card: {
            borderRadiusLG: 12,
            colorBgContainer: colors.cardBg,
            colorBorderSecondary: colors.border,
          },
          Alert: {
            borderRadiusLG: 8,
          },
          Layout: {
            bodyBg: colors.bgApp,
            headerBg: colors.cardBg,
            siderBg: colors.cardBg,
            triggerBg: colors.cardBg,
            triggerColor: colors.text,
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: colors.primarySubtle,
            itemSelectedColor: colors.primary,
            itemHoverBg: colors.bgApp,
            itemHoverColor: colors.primary,
            itemColor: colors.text,
            popupBg: colors.cardBg,
            subMenuItemBg: 'transparent',
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
};

export default AntdProvider;

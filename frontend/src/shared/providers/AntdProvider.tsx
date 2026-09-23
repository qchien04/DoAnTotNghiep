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
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          // Dynamic Theme Colors
          colorPrimary: colors.primary,
          colorSuccess: colors.secondary,
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: colors.primary,

          // Typography & Layout
          fontSize: 14,
          borderRadius: 10,
          borderRadiusLG: 14,
          borderRadiusSM: 6,

          // Text, Surfaces & Border Colors
          colorText: colors.text,
          colorTextSecondary: colors.textSecondary,
          colorBorder: colors.border,
          colorBgBase: colors.bgApp,
          colorBgLayout: colors.bgApp,
          colorBgContainer: colors.cardBg,
          colorBgElevated: colors.cardBg,
        },
        components: {
          Button: {
            colorPrimary: colors.primary,
            colorPrimaryHover: colors.primaryHover,
            controlHeight: 38,
            borderRadius: 10,
            fontWeight: 500,
          },
          Tabs: {
            colorPrimary: colors.primary,
            titleFontSize: 14,
            horizontalItemPadding: '10px 16px',
          },
          Modal: {
            borderRadiusLG: 16,
            titleFontSize: 16,
            contentBg: colors.cardBg,
            headerBg: colors.cardBg,
          },
          Table: {
            headerBg: colors.bgApp,
            headerColor: colors.textSecondary,
            borderColor: colors.border,
            rowHoverBg: colors.borderSubtle,
          },
          Card: {
            borderRadiusLG: 16,
            colorBgContainer: colors.cardBg,
            colorBorderSecondary: colors.border,
          },
          Alert: {
            borderRadiusLG: 12,
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

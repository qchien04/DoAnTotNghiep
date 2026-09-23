import React from 'react';
import { Dropdown, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { useThemeStore } from '@/stores/useThemeStore';
import type { ThemePresetId } from '@/shared/constants/themes';
import { Palette, Check, Sparkles } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  compact = false,
}) => {
  const { currentThemeId, currentTheme, availableThemes, setTheme } = useThemeStore();

  const menuItems: MenuProps['items'] = [
    {
      key: 'header',
      type: 'group',
      label: (
        <div className="px-2 py-1">
          <div className="text-xs font-bold text-stay-text flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stay-primary" />
            <span>Chọn Bảng Màu Giao Diện</span>
          </div>
          <p className="text-[11px] text-stay-text-secondary m-0 mt-0.5">
            1-Click đổi combo màu toàn hệ thống
          </p>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    ...availableThemes.map((theme) => {
      const isSelected = theme.id === currentThemeId;
      return {
        key: theme.id,
        onClick: () => setTheme(theme.id as ThemePresetId),
        label: (
          <div
            className={`flex items-center justify-between gap-3 px-2 py-2 rounded-lg transition-all ${isSelected ? 'bg-stay-primary-subtle font-medium' : 'hover:bg-stay-bg-app'
              }`}
          >
            <div className="flex items-center gap-2.5">
              {/* Theme Color Dots Preview */}
              <div className="flex items-center -space-x-1.5 shrink-0">
                <span
                  className="w-4 h-4 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: theme.preview.primary }}
                />
                <span
                  className="w-4 h-4 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: theme.preview.secondary }}
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: theme.preview.accent }}
                />
              </div>

              <div>
                <div className="text-xs font-bold text-stay-text flex items-center gap-1.5">
                  <span>{theme.name}</span>
                  {theme.colors.isDark && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-100 font-semibold">
                      Dark
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stay-text-secondary max-w-[200px] truncate">
                  {theme.description}
                </div>
              </div>
            </div>

            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-stay-primary flex items-center justify-center text-white shrink-0 shadow-xs">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>
        ),
      };
    }),
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
      popupRender={(menu) => (
        <div className="bg-stay-card-bg rounded-2xl shadow-xl border border-stay-border p-1.5 min-w-[280px]">
          {menu}
        </div>
      )}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stay-border bg-stay-card-bg hover:bg-stay-bg-app hover:border-stay-primary transition-all text-xs font-semibold text-stay-text cursor-pointer shadow-xs ${className}`}
        title="Đổi chủ đề màu sắc StayConnect"
      >
        <div className="flex items-center -space-x-1 shrink-0">
          <span
            className="w-3 h-3 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: currentTheme.preview.primary }}
          />
          <span
            className="w-3 h-3 rounded-full border border-white shadow-2xs"
            style={{ backgroundColor: currentTheme.preview.secondary }}
          />
        </div>

        <Palette className="w-3.5 h-3.5 text-stay-primary" />

        {!compact && (
          <span className="hidden sm:inline-block max-w-[130px] truncate text-stay-text">
            {currentTheme.name.split(' (')[0]}
          </span>
        )}

        <Badge
          status="processing"
          color={currentTheme.preview.primary}
          className="shrink-0"
        />
      </button>
    </Dropdown>
  );
};

export default ThemeSwitcher;

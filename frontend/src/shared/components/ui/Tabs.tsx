import React, { useState, createContext, useContext } from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps as AntTabsProps } from 'antd';

export type TabsVariant = 'line' | 'card' | 'pills' | 'bordered';

// Context for Compound Tab Components (<TabList>, <TabTrigger>, <TabContent>)
interface TabContextType {
  activeKey: string;
  setActiveKey: (key: string) => void;
  variant: TabsVariant;
}

const TabContext = createContext<TabContextType | null>(null);

export interface TabsProps extends Omit<AntTabsProps, 'type'> {
  variant?: TabsVariant;
  defaultValue?: string; // developer friendly alias for defaultActiveKey
  value?: string; // developer friendly alias for activeKey
  onValueChange?: (key: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> & {
  List: typeof TabList;
  Trigger: typeof TabTrigger;
  Content: typeof TabContent;
  TabPane: typeof AntTabs.TabPane;
} = ({
  variant = 'line',
  defaultValue,
  defaultActiveKey,
  value,
  activeKey,
  onChange,
  onValueChange,
  className = '',
  items,
  children,
  ...props
}) => {
  const initialKey = activeKey || value || defaultActiveKey || defaultValue || '1';
  const [internalActiveKey, setInternalActiveKey] = useState<string>(String(initialKey));

  const currentActiveKey = activeKey !== undefined ? String(activeKey) : value !== undefined ? String(value) : internalActiveKey;

  const handleKeyChange = (key: string) => {
    setInternalActiveKey(key);
    onChange?.(key);
    onValueChange?.(key);
  };

  const getAntdType = (): AntTabsProps['type'] => {
    switch (variant) {
      case 'card':
        return 'card';
      case 'bordered':
        return 'editable-card';
      case 'pills':
      case 'line':
      default:
        return 'line';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'pills':
        return 'custom-antd-tabs-pills [&_.ant-tabs-nav]:bg-stay-bg-app [&_.ant-tabs-nav]:p-1.5 [&_.ant-tabs-nav]:rounded-xl [&_.ant-tabs-nav]:border [&_.ant-tabs-nav]:border-stay-border [&_.ant-tabs-tab-active]:bg-stay-card-bg [&_.ant-tabs-tab-active]:shadow-xs [&_.ant-tabs-tab]:rounded-lg [&_.ant-tabs-tab]:px-4 [&_.ant-tabs-tab]:py-1.5 [&_.ant-tabs-ink-bar]:hidden';
      case 'bordered':
        return 'border border-stay-border p-3 rounded-2xl bg-stay-card-bg shadow-2xs';
      default:
        return '';
    }
  };

  // If items are provided or no compound children, render standard Ant Design Tabs
  if (items && items.length > 0) {
    return (
      <AntTabs
        activeKey={currentActiveKey}
        onChange={handleKeyChange}
        items={items}
        type={getAntdType()}
        className={`${getVariantClasses()} ${className}`}
        {...props}
      />
    );
  }

  // Compound Components mode
  return (
    <TabContext.Provider value={{ activeKey: currentActiveKey, setActiveKey: handleKeyChange, variant }}>
      <div className={`space-y-4 ${getVariantClasses()} ${className}`}>
        {children}
      </div>
    </TabContext.Provider>
  );
};

// --- Compound Subcomponents ---
export const TabList: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const ctx = useContext(TabContext);
  const isPills = ctx?.variant === 'pills';

  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 ${
        isPills
          ? 'bg-stay-bg-app p-1.5 rounded-xl border border-stay-border'
          : 'border-b border-stay-border'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const TabTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className = '' }) => {
  const ctx = useContext(TabContext);
  if (!ctx) return null;

  const isActive = ctx.activeKey === value;
  const isPills = ctx.variant === 'pills';

  const triggerClasses = isPills
    ? isActive
      ? 'bg-stay-card-bg text-stay-primary font-semibold shadow-xs'
      : 'text-stay-text-secondary hover:text-stay-text font-medium hover:bg-stay-card-bg/60'
    : isActive
    ? 'border-b-2 border-stay-primary text-stay-primary font-semibold -mb-[1px]'
    : 'text-stay-text-secondary hover:text-stay-text font-medium';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.setActiveKey(value)}
      className={`px-4 py-2 text-xs sm:text-sm rounded-lg transition-all cursor-pointer select-none ${triggerClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export const TabContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className = '' }) => {
  const ctx = useContext(TabContext);
  if (!ctx || ctx.activeKey !== value) return null;

  return (
    <div role="tabpanel" className={`pt-4 animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

// Re-export Antd TabPane
export const TabPane = AntTabs.TabPane;

// Attach subcomponents to Tabs
Tabs.List = TabList;
Tabs.Trigger = TabTrigger;
Tabs.Content = TabContent;
Tabs.TabPane = TabPane;

// Aliases
export const AppTabs = Tabs;
export type AppTabsProps = TabsProps;

export default Tabs;

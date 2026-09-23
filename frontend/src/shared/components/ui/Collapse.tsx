import React from 'react';
import { Collapse as AntCollapse } from 'antd';
import type { CollapseProps as AntCollapseProps } from 'antd';
import { ChevronRight } from 'lucide-react';

export interface CollapseItem {
  key: string | number;
  label: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CollapseProps extends Omit<AntCollapseProps, 'items'> {
  items: CollapseItem[];
  variant?: 'default' | 'card' | 'ghost' | 'bordered';
  className?: string;
}

export const Collapse: React.FC<CollapseProps> = ({
  items,
  variant = 'card',
  accordion = false,
  className = '',
  ...props
}) => {
  const antdItems = items.map((item) => ({
    key: String(item.key),
    label: (
      <div className="flex items-center gap-2.5 font-semibold text-stay-text text-xs sm:text-sm">
        {item.icon && <span className="text-stay-primary shrink-0">{item.icon}</span>}
        <span>{item.label}</span>
      </div>
    ),
    children: (
      <div className="text-xs sm:text-sm text-stay-text-secondary leading-relaxed pt-1">
        {item.children}
      </div>
    ),
    extra: item.extra,
    disabled: item.disabled,
  }));

  const variantClasses = {
    default: 'bg-transparent border-stay-border',
    card: 'bg-transparent space-y-3 [&_.ant-collapse-item]:!rounded-2xl [&_.ant-collapse-item]:!border [&_.ant-collapse-item]:!border-stay-border [&_.ant-collapse-item]:!bg-stay-card-bg [&_.ant-collapse-item]:!shadow-2xs [&_.ant-collapse-item]:!overflow-hidden',
    bordered: 'bg-stay-card-bg border border-stay-border rounded-2xl overflow-hidden shadow-xs divide-y divide-stay-border',
    ghost: 'bg-transparent border-0 [&_.ant-collapse-item]:!border-b [&_.ant-collapse-item]:!border-stay-border',
  };

  return (
    <AntCollapse
      items={antdItems}
      accordion={accordion}
      bordered={variant === 'bordered'}
      expandIcon={({ isActive }) => (
        <ChevronRight
          className={`w-4 h-4 text-stay-primary transition-transform duration-200 ${
            isActive ? 'rotate-90' : ''
          }`}
        />
      )}
      className={`custom-stay-collapse ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

// Aliases
export const Accordion = Collapse;
export type AccordionProps = CollapseProps;

export default Collapse;

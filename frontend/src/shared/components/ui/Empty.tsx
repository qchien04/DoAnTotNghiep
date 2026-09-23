import React from 'react';
import { Empty as AntEmpty } from 'antd';
import type { EmptyProps as AntEmptyProps } from 'antd';

export interface EmptyProps extends AntEmptyProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Empty: React.FC<EmptyProps> & {
  PRESENTED_IMAGE_DEFAULT: typeof AntEmpty.PRESENTED_IMAGE_DEFAULT;
  PRESENTED_IMAGE_SIMPLE: typeof AntEmpty.PRESENTED_IMAGE_SIMPLE;
} = ({
  title,
  description,
  action,
  children,
  className = '',
  image = AntEmpty.PRESENTED_IMAGE_SIMPLE,
  ...props
}) => {
  const displayDescription = description || title || 'Không tìm thấy dữ liệu phù hợp';

  return (
    <div className={`py-12 flex flex-col items-center justify-center text-center ${className}`}>
      <AntEmpty
        image={image}
        description={<span className="text-xs sm:text-sm text-slate-500 font-medium">{displayDescription}</span>}
        {...props}
      >
        {(action || children) && <div className="mt-4">{action || children}</div>}
      </AntEmpty>
    </div>
  );
};

Empty.PRESENTED_IMAGE_DEFAULT = AntEmpty.PRESENTED_IMAGE_DEFAULT;
Empty.PRESENTED_IMAGE_SIMPLE = AntEmpty.PRESENTED_IMAGE_SIMPLE;

// Aliases
export const AppEmpty = Empty;

export default Empty;

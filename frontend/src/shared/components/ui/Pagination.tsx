import React from 'react';
import { Pagination as AntPagination } from 'antd';
import type { PaginationProps as AntPaginationProps } from 'antd';

export interface PaginationProps extends AntPaginationProps {
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  showSizeChanger = true,
  showTotal = (total) => `Tổng cộng: ${total} kết quả`,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center justify-end py-4 ${className}`}>
      <AntPagination
        showSizeChanger={showSizeChanger}
        showTotal={showTotal}
        className="custom-antd-pagination font-medium text-xs sm:text-sm"
        {...props}
      />
    </div>
  );
};

// Aliases
export const AppPagination = Pagination;

export default Pagination;

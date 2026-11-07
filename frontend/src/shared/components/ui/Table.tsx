import { Table as AntTable } from 'antd';
import type { TableProps as AntTableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export type { ColumnsType };

export interface TableProps<T> extends Omit<AntTableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  dataSource: T[];
  loading?: boolean;
  total?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  emptyText?: string;
  className?: string;
  bordered?: boolean;
  striped?: boolean;
  fillHeight?: boolean;
}

export function Table<T extends object>({
  columns,
  dataSource,
  loading = false,
  total,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  emptyText = 'Chưa có dữ liệu',
  className = '',
  bordered = false,
  striped = false,
  fillHeight = true,
  rowClassName,
  pagination,
  scroll,
  ...props
}: TableProps<T>) {
  // Merge default pagination with size changer
  let paginationConfig: any = false;
  if (pagination !== false) {
    const userPagination = typeof pagination === 'object' ? pagination : {};
    paginationConfig = {
      defaultPageSize: pageSize || 10,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (totalCount: number, range: [number, number]) => (
        <span className="text-[13px] text-stay-text-secondary">
          Hiển thị {range[0]} - {range[1]} trên <strong className="text-stay-text font-semibold">{totalCount}</strong> bản ghi
        </span>
      ),
      locale: { items_per_page: '/ trang' },
      ...(total !== undefined
        ? {
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: onPageChange,
          }
        : {}),
      ...userPagination,
    };
  }

  // Setup scroll config: horizontal scroll is enabled by default ('max-content')
  // Do not set vertical 'y' by default unless consumer explicitly provided scroll.y,
  // ensuring Ant Design uses a single unified <table> where headers and rows are 100% aligned
  const scrollConfig = {
    x: scroll?.x ?? 'max-content',
    ...(scroll?.y ? { y: scroll.y } : {}),
  };

  return (
    <div
      className={`w-full flex-1 flex flex-col min-h-0 overflow-hidden rounded-[8px] border border-[#D7D7DB] dark:border-slate-700 bg-stay-card-bg shadow-none ${
        fillHeight ? 'stay-table-fill-height' : ''
      } ${className}`}
    >
      <AntTable<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        bordered={bordered}
        rowKey={(record: any) => record.id || record.key || JSON.stringify(record)}
        scroll={scrollConfig}
        pagination={paginationConfig}
        rowClassName={(record, index) => {
          let customClass = '';
          if (striped && index % 2 === 1) customClass = 'bg-stay-bg-app';
          if (typeof rowClassName === 'function') {
            return `${customClass} ${rowClassName(record, index, 0)}`.trim();
          }
          return `${customClass} ${rowClassName || ''}`.trim();
        }}
        locale={{
          emptyText: (
            <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400 text-[14px] w-full">
              {emptyText}
            </div>
          ),
        }}
        {...props}
      />
    </div>
  );
}

Table.Column = AntTable.Column;
Table.ColumnGroup = AntTable.ColumnGroup;
Table.Summary = AntTable.Summary;

export default Table;


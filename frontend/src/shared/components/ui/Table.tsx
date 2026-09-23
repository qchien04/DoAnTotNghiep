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
  rowClassName,
  ...props
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-stay-border bg-stay-card-bg shadow-xs ${className}`}>
      <AntTable<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        bordered={bordered}
        rowKey={(record: any) => record.id || record.key || JSON.stringify(record)}
        rowClassName={(record, index) => {
          let customClass = '';
          if (striped && index % 2 === 1) customClass = 'bg-stay-bg-app';
          if (typeof rowClassName === 'function') {
            return `${customClass} ${rowClassName(record, index, 0)}`.trim();
          }
          return `${customClass} ${rowClassName || ''}`.trim();
        }}
        pagination={
          total !== undefined
            ? {
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (totalCount) => `Tổng cộng: ${totalCount} bản ghi`,
                onChange: onPageChange,
                className: 'px-4 py-3',
              }
            : false
        }
        locale={{
          emptyText: <div className="py-10 text-slate-400 text-xs">{emptyText}</div>,
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

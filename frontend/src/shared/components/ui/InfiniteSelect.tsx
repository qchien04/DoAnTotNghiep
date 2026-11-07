import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spin } from 'antd';
import { Select, type SelectProps } from './Select';
import type { PageResponse } from '@/shared/types/api';

export interface InfiniteSelectProps<TItem = any, ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'onSearch' | 'onPopupScroll'> {
  /**
   * Truyền trực tiếp custom hook có sẵn của hệ thống:
   * useBuildings, useRooms, useContracts, useTenants...
   */
  useQueryHook: (params?: any) => {
    pageInfo?: PageResponse<TItem>;
    isLoading?: boolean;
    [key: string]: any;
  };

  /**
   * Các tham số lọc bổ sung truyền vào hook (như status: 'ACTIVE', buildingId: 1...)
   */
  params?: Record<string, any>;

  /**
   * Chuyển đổi một phần tử TItem thành Option của Select { label, value, disabled? }
   */
  mapOption: (item: TItem) => {
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
    [key: string]: any;
  };

  /**
   * Số lượng bản ghi mỗi trang (mặc định: 10 theo chuẩn hệ thống)
   */
  pageSize?: number;

  /**
   * Option hiển thị ban đầu nếu value đã có sẵn nhưng chưa tải tới trang chứa nó
   */
  initialOption?: { label: React.ReactNode; value: string | number };

  /**
   * Danh sách option hiển thị ban đầu (hữu ích cho mode multiple / tags)
   */
  initialOptions?: Array<{ label: React.ReactNode; value: string | number }>;

  /**
   * Thời gian debounce khi gõ tìm kiếm (ms, mặc định: 300)
   */
  debounceMs?: number;

  /**
   * Hiển thị thông báo khi đã cuộn hết danh sách (mặc định: false)
   */
  showEndMessage?: boolean;
}

/**
 * Component Select dùng chung hỗ trợ phân trang 10 bản ghi/lần và cuộn tải thêm
 * Tích hợp trực tiếp với các custom hook TanStack Query có sẵn: useBuildings, useRooms, useContracts, useTenants...
 */
export function InfiniteSelect<TItem = any, ValueType = any>({
  useQueryHook,
  params,
  mapOption,
  pageSize = 10,
  initialOption,
  initialOptions,
  debounceMs = 300,
  showEndMessage = false,
  showSearch = true,
  dropdownRender,
  notFoundContent,
  ...restProps
}: InfiniteSelectProps<TItem, ValueType>) {
  const [page, setPage] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [accumulatedItems, setAccumulatedItems] = useState<TItem[]>([]);

  // 1. Debounce từ khóa tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchInput);
      setPage(0); // Reset về trang 0 khi từ khóa thay đổi
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchInput, debounceMs]);

  // 2. Tạo queryParams hợp nhất truyền vào custom hook
  const queryParams = useMemo(() => {
    return {
      page,
      size: pageSize,
      keyword: debouncedKeyword.trim() ? debouncedKeyword.trim() : undefined,
      ...params,
    };
  }, [page, pageSize, debouncedKeyword, params]);

  // 3. GỌI TRỰC TIẾP HOOK CÓ SẴN (useBuildings, useRooms, useContracts...) DỰA TRÊN TANSTACK QUERY
  const { pageInfo, isLoading } = useQueryHook(queryParams);

  // Khi params bộ lọc bên ngoài thay đổi, reset về trang 0
  const paramsKey = useMemo(() => JSON.stringify(params || {}), [params]);
  useEffect(() => {
    setPage(0);
    setAccumulatedItems([]);
  }, [paramsKey]);

  // 4. Tích lũy danh sách bản ghi khi chuyển trang
  useEffect(() => {
    if (pageInfo?.items) {
      if (page === 0) {
        setAccumulatedItems(pageInfo.items);
      } else {
        setAccumulatedItems((prev) => {
          const map = new Map<string | number, TItem>();
          prev.forEach((item: any) => {
            const id = item?.id ?? JSON.stringify(item);
            map.set(id, item);
          });
          pageInfo.items.forEach((item: any) => {
            const id = item?.id ?? JSON.stringify(item);
            map.set(id, item);
          });
          return Array.from(map.values());
        });
      }
    }
  }, [pageInfo?.items, page]);

  // 5. Kiểm tra còn trang tiếp theo không
  const hasMore = useMemo(() => {
    if (!pageInfo) return true;
    if (pageInfo.last) return false;
    if (pageInfo.totalPages && page + 1 >= pageInfo.totalPages) return false;
    return (pageInfo.items?.length ?? 0) > 0;
  }, [pageInfo, page]);

  const isFetchingNextPage = Boolean(isLoading && page > 0);
  const isInitialLoading = Boolean(isLoading && page === 0 && accumulatedItems.length === 0);

  // 6. Xử lý cuộn tới đáy dropdown -> nạp tiếp 10 bản ghi của trang tiếp theo
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, offsetHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + offsetHeight) < 25) {
      if (hasMore && !isLoading) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const handleSearch = (val: string) => {
    setSearchInput(val);
  };

  const handleClear = () => {
    setSearchInput('');
    setPage(0);
  };

  // 7. Cache các option đã được chọn để không bao giờ mất nhãn khi search từ khóa khác hoặc chuyển trang (cực kỳ quan trọng cho cả single & multiple)
  const selectedOptionsCacheRef = useRef<Map<string | number, any>>(new Map());

  useEffect(() => {
    const currentVal = restProps.value;
    if (currentVal == null) return;

    const valuesSet = new Set<string>(
      Array.isArray(currentVal) ? currentVal.map(String) : [String(currentVal)]
    );

    accumulatedItems.forEach((item) => {
      const opt = mapOption(item);
      if (opt && opt.value != null && valuesSet.has(String(opt.value))) {
        selectedOptionsCacheRef.current.set(String(opt.value), opt);
      }
    });
  }, [accumulatedItems, restProps.value, mapOption]);

  // 8. Tạo danh sách options từ các items tích lũy + hỗ trợ initialOptions + giữ nhãn các item đã chọn
  const options = useMemo(() => {
    const map = new Map<string | number, any>();

    // Nạp initialOptions / initialOption trước để tránh mất nhãn khi chưa cuộn tới trang chứa nó
    if (initialOption && initialOption.value != null) {
      map.set(String(initialOption.value), initialOption);
    }
    if (initialOptions && initialOptions.length > 0) {
      initialOptions.forEach((opt) => {
        if (opt && opt.value != null) {
          map.set(String(opt.value), opt);
        }
      });
    }

    // Nạp các option đã được chọn từ cache
    const currentVal = restProps.value;
    if (currentVal != null) {
      const valuesSet = new Set<string>(
        Array.isArray(currentVal) ? currentVal.map(String) : [String(currentVal)]
      );
      selectedOptionsCacheRef.current.forEach((opt, key) => {
        if (valuesSet.has(String(key))) {
          map.set(String(key), opt);
        }
      });
    }

    // Nạp các items tích lũy từ hook
    accumulatedItems.forEach((item) => {
      const opt = mapOption(item);
      if (opt && opt.value != null) {
        map.set(String(opt.value), opt);
      }
    });

    return Array.from(map.values());
  }, [accumulatedItems, mapOption, initialOption, initialOptions, restProps.value]);

  // 8. Tùy biến hiển thị chân dropdown khi đang tải thêm 10 bản ghi
  const customDropdownRender = (menu: React.ReactElement) => {
    return (
      <>
        {dropdownRender ? dropdownRender(menu) : menu}
        {isFetchingNextPage && (
          <div className="py-2 px-3 text-center text-xs text-stay-text-muted flex items-center justify-center gap-2 border-t border-stay-border-subtle bg-stay-card-bg/50">
            <Spin size="small" />
            <span>Đang tải thêm 10 bản ghi...</span>
          </div>
        )}
        {showEndMessage && !hasMore && accumulatedItems.length > 0 && !isLoading && (
          <div className="py-1.5 px-3 text-center text-[11px] text-stay-text-muted/60 border-t border-stay-border-subtle bg-stay-bg-app">
            Đã hiển thị tất cả bản ghi
          </div>
        )}
      </>
    );
  };

  return (
    <Select
      showSearch={showSearch}
      filterOption={false} // Tìm kiếm server-side có debounce
      onSearch={showSearch ? handleSearch : undefined}
      onClear={handleClear}
      onPopupScroll={handlePopupScroll}
      dropdownRender={customDropdownRender}
      loading={isInitialLoading}
      notFoundContent={
        isInitialLoading ? (
          <div className="py-4 text-center">
            <Spin size="small" />
            <div className="text-xs text-stay-text-muted mt-2">Đang tải dữ liệu...</div>
          </div>
        ) : (
          notFoundContent
        )
      }
      options={options}
      {...restProps}
    />
  );
}

export default InfiniteSelect;

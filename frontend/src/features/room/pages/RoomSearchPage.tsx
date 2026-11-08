import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Pagination, Empty, Spin } from 'antd';
import {
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';
import { Room } from '@/shared/types/landlord';
import { publicRoomService, PublicRoomSearchRequest } from '../services/publicRoomService';
import { RoomCard, RoomFilterSidebar, RoomFilterValues, RoomBigMap, DrawZoneModal } from '../components';
import { circleZonesToGeoZones, PublicRoomItem } from '../types/roomSearch';

export type { PublicRoomItem };

// Dữ liệu mẫu dự phòng khi database chưa có phòng công khai
const FALLBACK_ROOMS: Room[] = [
  {
    id: 1,
    name: 'Phòng studio ban công full tiện nghi',
    buildingName: 'Toà nhà StayConnect Cầu Giấy',
    floor: 3,
    area: 28,
    listedPrice: 4200000,
    standardDeposit: 4200000,
    maxCapacity: 2,
    status: 'AVAILABLE',
    provinceId: 1,
    wardId: 101,
    addressDetail: 'Số 18 Ngõ 68 Trần Thái Tông',
    coverImageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Điều hòa', 'Wifi', 'Nóng lạnh', 'Ban công thoáng', 'Khóa vân tay'],
    latitude: 21.0315,
    longitude: 105.7875,
    landlordName: 'Nguyễn Văn Thành',
    landlordPhone: '0988.123.456',
    landlordVerified: true,
  },
  {
    id: 2,
    name: 'Căn hộ mini 1N1K riêng biệt Duy Tân',
    buildingName: 'Chung cư mini Duy Tân',
    floor: 4,
    area: 35,
    listedPrice: 4800000,
    standardDeposit: 4800000,
    maxCapacity: 2,
    status: 'AVAILABLE',
    provinceId: 1,
    wardId: 101,
    addressDetail: 'Ngõ 72 Phố Duy Tân',
    coverImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Điều hòa', 'Bếp riêng', 'Thang máy', 'Tủ lạnh', 'Máy giặt chung'],
    latitude: 21.0332,
    longitude: 105.7831,
    landlordName: 'Trần Thị Mai',
    landlordPhone: '0912.345.678',
    landlordVerified: true,
  },
  {
    id: 3,
    name: 'Phòng khép kín ban công gần ĐH Ngoại Thương',
    buildingName: 'Nhà trọ sinh viên Chùa Láng',
    floor: 2,
    area: 26,
    listedPrice: 3800000,
    standardDeposit: 3800000,
    maxCapacity: 2,
    status: 'AVAILABLE',
    provinceId: 1,
    wardId: 106,
    addressDetail: 'Ngõ 91 Chùa Láng',
    coverImageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Ban công', 'Không chung chủ'],
    latitude: 21.0224,
    longitude: 105.8032,
    landlordName: 'Vũ Quốc Huy',
    landlordPhone: '0903.456.789',
  },
  {
    id: 4,
    name: 'Căn hộ mini 2 phòng ngủ Mỹ Đình',
    buildingName: 'Toà nhà Green Home Đình Thôn',
    floor: 5,
    area: 45,
    listedPrice: 5500000,
    standardDeposit: 5500000,
    maxCapacity: 4,
    status: 'AVAILABLE',
    provinceId: 1,
    wardId: 111,
    addressDetail: 'Đường Đình Thôn',
    coverImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    amenities: ['2 Điều hòa', 'Tủ bếp', 'Chỗ để xe máy', 'Bảo vệ 24/7'],
    latitude: 21.0182,
    longitude: 105.7761,
    landlordName: 'Phạm Thị Thoa',
    landlordPhone: '0989.112.233',
  },
  {
    id: 5,
    name: 'Phòng trọ sinh viên sạch sẽ tại Bách Khoa',
    buildingName: 'Khu trọ Tạ Quang Bửu',
    floor: 3,
    area: 22,
    listedPrice: 2800000,
    standardDeposit: 2800000,
    maxCapacity: 2,
    status: 'AVAILABLE',
    provinceId: 1,
    wardId: 104,
    addressDetail: 'Số 45 Tạ Quang Bửu',
    coverImageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Khép kín'],
    latitude: 21.0051,
    longitude: 105.8459,
    landlordName: 'Lê Hoàng Nam',
    landlordPhone: '0977.888.999',
  },
  {
    id: 6,
    name: 'Phòng cao cấp full nội thất Triều Khúc',
    buildingName: 'Toà nhà Triều Khúc Smart Home',
    floor: 4,
    area: 25,
    listedPrice: 3500000,
    standardDeposit: 3500000,
    maxCapacity: 2,
    status: 'AVAILABLE',
    provinceId: 1,
    wardId: 108,
    addressDetail: 'Ngõ 88 Triều Khúc',
    coverImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    amenities: ['Điều hòa', 'Máy giặt', 'Nóng lạnh', 'Tủ quần áo lớn', 'Cửa sổ thoáng'],
    latitude: 20.9875,
    longitude: 105.7998,
    landlordName: 'Đỗ Minh Tuấn',
    landlordPhone: '0966.333.444',
  },
];

const DEFAULT_FILTER_VALUES: RoomFilterValues = {
  keyword: '',
  district: 'ALL',
  minPrice: 0,
  maxPrice: 15000000,
  minArea: 15,
  maxArea: 80,
  zones: [],
};

const SORT_OPTIONS = [
  { value: 'id_desc', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'area_desc', label: 'Diện tích lớn nhất' },
];

export const RoomSearchPage: React.FC = () => {
  const navigate = useNavigate();

  // Chế độ xem: grid thẻ phòng hoặc bản đồ lớn
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Bộ lọc tìm kiếm
  const [filterValues, setFilterValues] = useState<RoomFilterValues>(DEFAULT_FILTER_VALUES);

  // Sắp xếp
  const [sortKey, setSortKey] = useState<string>('id_desc');

  // Phân trang
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(12);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Dữ liệu danh sách phòng
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal khoanh vùng không gian bản đồ
  const [isDrawModalOpen, setIsDrawModalOpen] = useState<boolean>(false);

  // Gọi API tìm kiếm phòng từ Backend
  const fetchRooms = useCallback(async () => {
    setIsLoading(true);

    let sortBy = 'id';
    let sortDirection: 'asc' | 'desc' = 'desc';

    if (sortKey === 'price_asc') {
      sortBy = 'listedPrice';
      sortDirection = 'asc';
    } else if (sortKey === 'price_desc') {
      sortBy = 'listedPrice';
      sortDirection = 'desc';
    } else if (sortKey === 'area_desc') {
      sortBy = 'area';
      sortDirection = 'desc';
    }

    const isMapMode = viewMode === 'map';

    const req: PublicRoomSearchRequest = {
      keyword: filterValues.keyword.trim() || undefined,
      district: filterValues.district !== 'ALL' ? filterValues.district : undefined,
      provinceId: filterValues.provinceId,
      wardId: filterValues.wardId,
      minPrice: filterValues.minPrice > 0 ? filterValues.minPrice : undefined,
      maxPrice: filterValues.maxPrice < 15000000 ? filterValues.maxPrice : undefined,
      minArea: filterValues.minArea > 15 ? filterValues.minArea : undefined,
      maxArea: filterValues.maxArea < 80 ? filterValues.maxArea : undefined,
      amenitiesMask: filterValues.amenitiesMask && filterValues.amenitiesMask > 0 ? filterValues.amenitiesMask : undefined,
      zones:
        filterValues.zones.length > 0
          ? circleZonesToGeoZones(filterValues.zones)
          : undefined,
      page: isMapMode ? 0 : page,
      size: isMapMode ? 1000 : size, // Ở chế độ bản đồ: Lấy tất cả phòng không phân trang
      sortBy,
      sortDirection,
    };

    try {
      const res = await publicRoomService.searchRooms(req);
      if (res?.data) {
        const pageData = res.data;
        const fetchedItems = pageData.items || [];
        setTotalElements(pageData.totalElements || 0);

        if (fetchedItems.length > 0) {
          setRooms(fetchedItems);
        } else if (
          !filterValues.keyword &&
          filterValues.district === 'ALL' &&
          filterValues.zones.length === 0 &&
          (!filterValues.amenitiesMask || filterValues.amenitiesMask === 0) &&
          filterValues.minPrice === 0 &&
          filterValues.maxPrice >= 15000000
        ) {
          // Hiển thị fallback rooms demo khi database chưa có dữ liệu
          setRooms(FALLBACK_ROOMS);
          setTotalElements(FALLBACK_ROOMS.length);
        } else {
          setRooms([]);
        }
      }
    } catch {
      // Khi lỗi kết nối hoặc môi trường offline: hiển thị fallback rooms
      setRooms(FALLBACK_ROOMS);
      setTotalElements(FALLBACK_ROOMS.length);
    } finally {
      setIsLoading(false);
    }
  }, [filterValues, page, size, sortKey, viewMode]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleFilterChange = (updates: Partial<RoomFilterValues>) => {
    setFilterValues((prev) => ({ ...prev, ...updates }));
    setPage(0); // Reset về trang 1 khi đổi bộ lọc
  };

  const handleResetFilters = () => {
    setFilterValues(DEFAULT_FILTER_VALUES);
    setPage(0);
  };

  const handleApplyZones = (newZones: typeof filterValues.zones) => {
    setFilterValues((prev) => ({ ...prev, zones: newZones }));
    setPage(0);
    setIsDrawModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-stay-bg py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">


        {/* Thanh tiêu đề trang & Công cụ chuyển đổi View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stay-border">
          <div>

            <p className="text-xs text-stay-text-secondary m-0 mt-1">
              Tìm thấy <strong className="text-stay-primary">{totalElements}</strong> phòng trọ phù hợp với tiêu chí của bạn
              {viewMode === 'map' && (
                <span className="ml-2 font-semibold text-stay-match">
                  • Hiển thị toàn bộ trên bản đồ
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bộ chọn sắp xếp */}
            <Select
              value={sortKey}
              onChange={(val) => {
                setSortKey(val);
                setPage(0);
              }}
              options={SORT_OPTIONS}
              className="w-44 h-10"
            />

            {/* Chuyển đổi View: Grid Card 🔲 vs Big Map 🗺️ */}
            <div className="bg-stay-card-bg border border-stay-border rounded-xl p-1 flex items-center shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === 'grid'
                  ? 'bg-stay-primary text-white shadow-xs'
                  : 'text-stay-text-secondary hover:text-stay-text'
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Danh sách</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${viewMode === 'map'
                  ? 'bg-stay-primary text-white shadow-xs'
                  : 'text-stay-text-secondary hover:text-stay-text'
                  }`}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden md:inline">Bản đồ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bố cục 2 Cột: Cột trái (Sidebar Bộ lọc) + Cột phải (Kết quả / Bản đồ) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cột trái: Sidebar bộ lọc */}
          <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 lg:sticky lg:top-20 z-10">
            <RoomFilterSidebar
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onOpenDrawModal={() => setIsDrawModalOpen(true)}
            />
          </div>

          {/* Cột phải: Danh sách Cards hoặc Big Map */}
          <div className="flex-1 w-full min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-stay-card-bg border border-stay-border rounded-2xl">
                <Spin size="large" />
                <p className="text-xs text-stay-text-secondary mt-3 m-0">Đang tìm kiếm phòng trọ phù hợp...</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* View 1: Danh sách Cards lưới */
              <div className="space-y-6">
                {rooms.length === 0 ? (
                  <div className="bg-stay-card-bg border border-stay-border rounded-2xl py-16 px-4 text-center">
                    <Empty
                      description={
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-stay-text m-0">
                            Không tìm thấy phòng trọ phù hợp
                          </p>
                          <p className="text-xs text-stay-text-secondary m-0">
                            Hãy thử nới lỏng mức giá, khoảng cách hoặc bỏ các tiện ích lọc bớt.
                          </p>
                        </div>
                      }
                    />
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 px-4 py-2 bg-stay-primary text-white text-xs font-semibold rounded-xl hover:bg-stay-primary-hover transition cursor-pointer shadow-sm"
                    >
                      Đặt lại bộ lọc
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {rooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          onViewDetail={(id) => navigate(`/rooms/${id}`)}
                        />
                      ))}
                    </div>

                    {/* Phân trang chuẩn Ant Design */}
                    {totalElements > size && (
                      <div className="flex justify-center pt-4">
                        <Pagination
                          current={page + 1}
                          pageSize={size}
                          total={totalElements}
                          showSizeChanger
                          pageSizeOptions={['9', '12', '18', '24']}
                          showTotal={(total) => `Tổng ${total} phòng trọ`}
                          onChange={(p, s) => {
                            setPage(p - 1);
                            setSize(s);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* View 2: Big Map View toàn màn hình */
              <div className="space-y-4">
                <RoomBigMap
                  rooms={rooms}
                  zones={filterValues.zones}
                  onRoomClick={(r) => navigate(`/rooms/${r.id}`)}
                  height="calc(100vh - 200px)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Khoanh Vùng Bán Kính Trên Bản Đồ */}
      <DrawZoneModal
        open={isDrawModalOpen}
        initialZones={filterValues.zones}
        onCancel={() => setIsDrawModalOpen(false)}
        onApply={handleApplyZones}
      />
    </div>
  );
};

export default RoomSearchPage;

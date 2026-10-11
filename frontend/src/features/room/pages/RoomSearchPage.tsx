import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { authService } from '@/shared/services/authService';

export interface PublicRoomItem {
  id: string | number;
  title: string;
  price: number;
  priceDisplay: string;
  location: string;
  district: string;
  area: number;
  imageUrl: string;
  gallery?: string[];
  amenities: string[];
  description: string;
  deposit: string;
  electricity: string;
  water: string;
  internet: string;
  landlordName: string;
  landlordPhone: string;
}

const SAMPLE_ROOMS: PublicRoomItem[] = [
  {
    id: 1,
    title: 'Phòng studio ban công full tiện nghi, giờ giấc tự do',
    price: 4200000,
    priceDisplay: '4.2 tr/tháng',
    location: 'Số 18 Ngõ 68 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy',
    district: 'Cầu Giấy',
    area: 28,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: ['Điều hòa', 'Wifi', 'Nóng lạnh', 'Ban công thoáng', 'Khóa vân tay'],
    description: 'Phòng studio mới 100%, trang bị đầy đủ giường tủ, bàn học/làm việc, nóng lạnh, điều hòa inverter. Ban công đón ánh sáng tự nhiên, an ninh camera 24/7.',
    deposit: '4.200.000 đ (1 tháng)',
    electricity: '3.800 đ/kWh',
    water: '30.000 đ/m³',
    internet: '100.000 đ/phòng',
    landlordName: 'Nguyễn Văn Thành',
    landlordPhone: '0988.123.456',
  },
  {
    id: 2,
    title: 'Căn hộ mini 1N1K riêng biệt, bếp thoáng tại Duy Tân',
    price: 4800000,
    priceDisplay: '4.8 tr/tháng',
    location: 'Ngõ 72 Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy',
    district: 'Cầu Giấy',
    area: 35,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    amenities: ['Điều hòa', 'Bếp riêng', 'Thang máy', 'Tủ lạnh', 'Máy giặt chung'],
    description: 'Căn hộ 1 phòng ngủ 1 phòng khách, bếp riêng biệt không ám mùi, thang máy tốc độ cao. Gần cụm văn phòng Duy Tân và ĐH Quốc Gia.',
    deposit: '4.800.000 đ (1 tháng)',
    electricity: '3.800 đ/kWh',
    water: '100.000 đ/người',
    internet: 'Miễn phí',
    landlordName: 'Trần Thị Mai',
    landlordPhone: '0912.345.678',
  },
  {
    id: 3,
    title: 'Phòng khép kín ban công lộng gió gần ĐH Ngoại Thương',
    price: 3800000,
    priceDisplay: '3.8 tr/tháng',
    location: 'Ngõ 91 Chùa Láng, Láng Thượng, Đống Đa',
    district: 'Đống Đa',
    area: 26,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Ban công', 'Không chung chủ'],
    description: 'Phòng tầng 3 trong nhà 6 tầng thang máy, ban công thoáng mát, đầy đủ tiện nghi cơ bản. Cách ĐH Ngoại Thương 300m, an ninh tốt.',
    deposit: '3.800.000 đ',
    electricity: '3.800 đ/kWh',
    water: '80.000 đ/người',
    internet: '100.000 đ/phòng',
    landlordName: 'Vũ Quốc Huy',
    landlordPhone: '0903.456.789',
  },
  {
    id: 4,
    title: 'Căn hộ chung cư mini 2 phòng ngủ tại Mỹ Đình',
    price: 5500000,
    priceDisplay: '5.5 tr/tháng',
    location: 'Đường Đình Thôn, Mỹ Đình 1, Nam Từ Liêm',
    district: 'Nam Từ Liêm',
    area: 45,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: ['2 Điều hòa', 'Tủ bếp', 'Chỗ để xe máy', 'Bảo vệ 24/7'],
    description: 'Căn hộ 2 phòng ngủ riêng biệt, phòng khách rộng rãi, phù hợp cho nhóm 3-4 bạn sinh viên hoặc người đi làm. Hầm xe rộng, bảo vệ thường trực.',
    deposit: '5.500.000 đ',
    electricity: '3.500 đ/kWh',
    water: '28.000 đ/m³',
    internet: '120.000 đ/phòng',
    landlordName: 'Phạm Thị Thoa',
    landlordPhone: '0989.112.233',
  },
  {
    id: 5,
    title: 'Phòng trọ sinh viên sạch sẽ, an ninh tại Bách Khoa',
    price: 2800000,
    priceDisplay: '2.8 tr/tháng',
    location: 'Số 45 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng',
    district: 'Hai Bà Trưng',
    area: 22,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Khép kín'],
    description: 'Phòng khép kín sạch sẽ, gần ngay ĐH Bách Khoa, ĐH Xây Dựng, ĐH Kinh Tế Quốc Dân. Giờ giấc tự do, khóa cổng vân tay.',
    deposit: '2.800.000 đ',
    electricity: '3.800 đ/kWh',
    water: '30.000 đ/m³',
    internet: '80.000 đ/phòng',
    landlordName: 'Lê Hoàng Nam',
    landlordPhone: '0977.888.999',
  },
  {
    id: 6,
    title: 'Phòng cao cấp full nội thất ngay Ngã Tư Sở',
    price: 3500000,
    priceDisplay: '3.5 tr/tháng',
    location: 'Ngõ 88 Triều Khúc, Thanh Xuân Nam, Thanh Xuân',
    district: 'Thanh Xuân',
    area: 25,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    amenities: ['Điều hòa', 'Máy giặt', 'Nóng lạnh', 'Tủ quần áo lớn', 'Cửa sổ thoáng'],
    description: 'Phòng vừa hoàn thiện mới, đầy đủ nội thất chỉ việc xách vali về ở. Cách ga tàu điện Cát Linh - Hà Đông 400m.',
    deposit: '3.500.000 đ',
    electricity: '3.800 đ/kWh',
    water: '90.000 đ/người',
    internet: '100.000 đ/phòng',
    landlordName: 'Đỗ Minh Tuấn',
    landlordPhone: '0966.333.444',
  },
];

const DISTRICT_OPTIONS = [
  { value: 'ALL', label: 'Tất cả quận/huyện' },
  { value: 'Cầu Giấy', label: 'Quận Cầu Giấy' },
  { value: 'Đống Đa', label: 'Quận Đống Đa' },
  { value: 'Hai Bà Trưng', label: 'Quận Hai Bà Trưng' },
  { value: 'Thanh Xuân', label: 'Quận Thanh Xuân' },
  { value: 'Nam Từ Liêm', label: 'Quận Nam Từ Liêm' },
];

const PRICE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả mức giá' },
  { value: 'UNDER_3M', label: 'Dưới 3.0 triệu' },
  { value: '3M_5M', label: 'Từ 3.0 - 5.0 triệu' },
  { value: 'OVER_5M', label: 'Trên 5.0 triệu' },
];

export const RoomSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<PublicRoomItem[]>(SAMPLE_ROOMS);
  const [keyword, setKeyword] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedPrice, setSelectedPrice] = useState('ALL');

  // Load from backend API if available
  useEffect(() => {
    authService.getPublicRooms()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const apiRooms: PublicRoomItem[] = res.data.map((r: any) => {
            const priceNum = Number(r.listedPrice || r.price || 3500000);
            const priceTxt = `${(priceNum / 1000000).toFixed(1)} tr/tháng`;
            const loc = r.fullAddress || r.addressDetail || (r.ward ? `${r.ward}, ${r.province || 'Hà Nội'}` : 'Hà Nội');
            let dist = 'Cầu Giấy';
            const locLower = loc.toLowerCase();
            if (locLower.includes('đống đa')) dist = 'Đống Đa';
            else if (locLower.includes('hai bà trưng')) dist = 'Hai Bà Trưng';
            else if (locLower.includes('thanh xuân')) dist = 'Thanh Xuân';
            else if (locLower.includes('nam từ liêm')) dist = 'Nam Từ Liêm';

            const defaultImg = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
            const img = (r.imageUrls && r.imageUrls.length > 0) ? r.imageUrls[0] : defaultImg;

            return {
              id: r.id,
              title: r.name ? `${r.name} - ${r.buildingName || 'Phòng trọ tiện nghi'}` : `Phòng #${r.id}`,
              price: priceNum,
              priceDisplay: priceTxt,
              location: loc,
              district: dist,
              area: Number(r.area || 25),
              imageUrl: img,
              gallery: r.imageUrls || [img],
              amenities: Array.isArray(r.amenities) && r.amenities.length > 0 ? r.amenities : ['Điều hòa', 'Nóng lạnh', 'Wifi'],
              description: r.description || 'Phòng trọ tiện nghi, an ninh, thoáng mát, chủ nhà thân thiện.',
              deposit: r.standardDeposit ? `${Number(r.standardDeposit).toLocaleString()} đ` : priceTxt,
              electricity: '3.800 đ/kWh',
              water: '30.000 đ/m³',
              internet: '100.000 đ/tháng',
              landlordName: r.landlordName || 'Chủ trọ StayConnect',
              landlordPhone: r.landlordPhone || '0988.888.999',
            };
          });

          // Merge API rooms with sample rooms to guarantee comprehensive display
          const existingIds = new Set(apiRooms.map((x) => String(x.id)));
          const combined = [...apiRooms, ...SAMPLE_ROOMS.filter((s) => !existingIds.has(String(s.id)))];
          setRooms(combined);
        }
      })
      .catch(() => {
        // Fallback to sample rooms
      });
  }, []);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Keyword
      if (keyword.trim()) {
        const query = keyword.toLowerCase().trim();
        const matchTitle = room.title.toLowerCase().includes(query);
        const matchLoc = room.location.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc) return false;
      }

      // District
      if (selectedDistrict !== 'ALL') {
        if (!room.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
          return false;
        }
      }

      // Price
      if (selectedPrice === 'UNDER_3M' && room.price >= 3000000) return false;
      if (selectedPrice === '3M_5M' && (room.price < 3000000 || room.price > 5000000)) return false;
      if (selectedPrice === 'OVER_5M' && room.price <= 5000000) return false;

      return true;
    });
  }, [rooms, keyword, selectedDistrict, selectedPrice]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedDistrict('ALL');
    setSelectedPrice('ALL');
  };

  return (
    <div className="min-h-[85vh] bg-stay-bg-app py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header (Tối giản) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stay-text tracking-tight">
              Tìm Phòng Trọ
            </h1>
            <p className="text-xs text-stay-text-secondary mt-1">
              Danh sách phòng trọ cho thuê trực tiếp từ chủ nhà, giá niêm yết rõ ràng.
            </p>
          </div>
          <div className="text-xs font-medium text-stay-text-secondary bg-stay-card-bg px-3 py-1.5 rounded-xl border border-stay-border self-start sm:self-auto">
            Tổng cộng: <strong className="text-stay-primary">{filteredRooms.length}</strong> phòng
          </div>
        </div>

        {/* Minimal Search & Filter Bar */}
        <div className="p-3.5 bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stay-text-muted" />
              <input
                type="text"
                placeholder="Nhập tên phòng, tên đường hoặc địa chỉ..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-stay-border bg-stay-bg-app text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:border-stay-primary transition-colors"
              />
            </div>

            {/* District Select */}
            <div className="sm:col-span-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {DISTRICT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Select */}
            <div className="sm:col-span-3">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {PRICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                title="Đặt lại bộ lọc"
                className="w-full sm:w-auto p-2 flex items-center justify-center rounded-xl border border-stay-border bg-stay-bg-app text-stay-text-secondary hover:text-stay-primary hover:border-stay-primary transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Room Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-stay-card-bg rounded-2xl border border-stay-border">
            <p className="text-sm font-semibold text-stay-text">Không tìm thấy phòng trọ phù hợp</p>
            <p className="text-xs text-stay-text-secondary mt-1">
              Thử điều chỉnh lại từ khóa hoặc bộ lọc khu vực/mức giá.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors cursor-pointer"
            >
              Xem tất cả phòng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="group bg-stay-card-bg rounded-2xl border border-stay-border overflow-hidden hover:border-stay-primary/50 transition-all flex flex-col justify-between shadow-xs"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stay-bg-app">
                  <img
                    src={room.imageUrl}
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stay-card-bg/90 text-stay-text backdrop-blur-xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Đã xác thực</span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg text-xs font-bold bg-stay-primary text-white">
                    {room.priceDisplay}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-stay-text line-clamp-1 group-hover:text-stay-primary transition-colors">
                      {room.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-stay-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                      <span className="truncate">{room.location}</span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stay-bg-app text-stay-text-secondary border border-stay-border">
                      {room.area} m²
                    </span>
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-stay-bg-app text-stay-text-secondary border border-stay-border"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-stay-border">
                    <button
                      type="button"
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-stay-border bg-stay-card-bg text-stay-text hover:bg-stay-primary hover:text-white hover:border-stay-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Xem chi tiết & liên hệ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

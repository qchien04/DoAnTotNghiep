import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Check,
  Copy,
  Zap,
  Droplets,
  Home,
  Layers,
} from 'lucide-react';
import { message } from 'antd';
import { authService } from '@/shared/services/authService';
import { PublicRoomItem } from './RoomSearchPage';

const SAMPLE_ROOMS_DETAIL: Record<string, PublicRoomItem> = {
  '1': {
    id: 1,
    title: 'Phòng studio ban công full tiện nghi, giờ giấc tự do',
    price: 4200000,
    priceDisplay: '4.2 tr/tháng',
    location: 'Số 18 Ngõ 68 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    area: 28,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Điều hòa Inverter',
      'Bình nóng lạnh',
      'Wifi tốc độ cao',
      'Ban công đón sáng',
      'Khóa vân tay 24/7',
      'Giường nệm cao cấp',
      'Tủ quần áo lớn',
      'Bàn làm việc/học tập',
    ],
    description:
      'Phòng studio mới hoàn thiện 100%, trang bị đầy đủ nội thất cao cấp: giường, đệm, tủ quần áo, bàn làm việc, điều hòa inverter tiết kiệm điện và bình nóng lạnh. Ban công rộng đón ánh sáng tự nhiên và gió trời thoáng mát. Tòa nhà có khóa vân tay ra vào tự do không chung chủ, hệ thống camera an ninh và PCCC đạt chuẩn.',
    deposit: '4.200.000 đ (1 tháng)',
    electricity: '3.800 đ/kWh',
    water: '30.000 đ/m³',
    internet: '100.000 đ/phòng/tháng',
    landlordName: 'Nguyễn Văn Thành',
    landlordPhone: '0988.123.456',
  },
  '2': {
    id: 2,
    title: 'Căn hộ mini 1N1K riêng biệt, bếp thoáng tại Duy Tân',
    price: 4800000,
    priceDisplay: '4.8 tr/tháng',
    location: 'Ngõ 72 Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    district: 'Cầu Giấy',
    area: 35,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      '1 Phòng ngủ riêng',
      '1 Phòng khách & bếp',
      'Thang máy tốc độ cao',
      'Tủ lạnh 2 cánh',
      'Máy giặt dùng chung tầng thượng',
      'Điều hòa 2 chiều',
    ],
    description:
      'Căn hộ mini thiết kế 1 phòng ngủ và 1 phòng khách riêng biệt. Khu vực bếp nấu ăn riêng có cửa sổ thông thoáng không sợ ám mùi. Tòa nhà 7 tầng có thang máy di chuyển tiện lợi, vị trí đắc địa ngay cụm văn phòng Duy Tân, gần ĐH Quốc Gia và ĐH Sư Phạm Hà Nội.',
    deposit: '4.800.000 đ (1 tháng)',
    electricity: '3.800 đ/kWh',
    water: '100.000 đ/người/tháng',
    internet: 'Miễn phí',
    landlordName: 'Trần Thị Mai',
    landlordPhone: '0912.345.678',
  },
  '3': {
    id: 3,
    title: 'Phòng khép kín ban công lộng gió gần ĐH Ngoại Thương',
    price: 3800000,
    priceDisplay: '3.8 tr/tháng',
    location: 'Ngõ 91 Chùa Láng, Láng Thượng, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    area: 26,
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Điều hòa',
      'Nóng lạnh',
      'Wifi cáp quang',
      'Ban công thoáng',
      'Không chung chủ',
      'Chỗ để xe tầng 1 miễn phí',
    ],
    description:
      'Phòng tầng 3 trong nhà 6 tầng có thang máy, ban công hướng Đông Nam thoáng mát. Đầy đủ tiện nghi cơ bản, vệ sinh khép kín sạch sẽ. Cách ĐH Ngoại Thương và ĐH Ngoại Giao chỉ 300m, gần hồ Chùa Láng khu vực nhiều tiện ích ăn uống cho sinh viên.',
    deposit: '3.800.000 đ',
    electricity: '3.800 đ/kWh',
    water: '80.000 đ/người/tháng',
    internet: '100.000 đ/phòng/tháng',
    landlordName: 'Vũ Quốc Huy',
    landlordPhone: '0903.456.789',
  },
  '4': {
    id: 4,
    title: 'Căn hộ chung cư mini 2 phòng ngủ tại Mỹ Đình',
    price: 5500000,
    priceDisplay: '5.5 tr/tháng',
    location: 'Đường Đình Thôn, Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    district: 'Nam Từ Liêm',
    area: 45,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      '2 Phòng ngủ riêng biệt',
      '2 Điều hòa',
      'Tủ bếp trên dưới',
      'Chỗ để xe máy rộng',
      'Bảo vệ 24/7',
      'Thang máy',
    ],
    description:
      'Căn hộ 2 phòng ngủ riêng biệt, phòng khách chung rộng rãi, phù hợp cho nhóm 3-4 bạn sinh viên hoặc người đi làm ở ghép. Tòa nhà có hầm để xe máy rộng rãi, bảo vệ thường trực 24/24 an ninh tuyệt đối.',
    deposit: '5.500.000 đ',
    electricity: '3.500 đ/kWh',
    water: '28.000 đ/m³',
    internet: '120.000 đ/phòng/tháng',
    landlordName: 'Phạm Thị Thoa',
    landlordPhone: '0989.112.233',
  },
  '5': {
    id: 5,
    title: 'Phòng trọ sinh viên sạch sẽ, an ninh tại Bách Khoa',
    price: 2800000,
    priceDisplay: '2.8 tr/tháng',
    location: 'Số 45 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội',
    district: 'Hai Bà Trưng',
    area: 22,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Điều hòa',
      'Nóng lạnh',
      'Wifi',
      'Khép kín',
      'Gác xép để đồ',
      'Giờ giấc tự do',
    ],
    description:
      'Phòng trọ khép kín sạch sẽ, cách ĐH Bách Khoa 200m, ĐH Xây Dựng và ĐH Kinh Tế Quốc Dân 500m. Khu dân trí cao, an ninh trật tự đảm bảo, có cổng khóa vân tay.',
    deposit: '2.800.000 đ',
    electricity: '3.800 đ/kWh',
    water: '30.000 đ/m³',
    internet: '80.000 đ/phòng/tháng',
    landlordName: 'Lê Hoàng Nam',
    landlordPhone: '0977.888.999',
  },
  '6': {
    id: 6,
    title: 'Phòng cao cấp full nội thất ngay Ngã Tư Sở',
    price: 3500000,
    priceDisplay: '3.5 tr/tháng',
    location: 'Ngõ 88 Triều Khúc, Thanh Xuân Nam, Thanh Xuân, Hà Nội',
    district: 'Thanh Xuân',
    area: 25,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Điều hòa',
      'Máy giặt',
      'Nóng lạnh',
      'Tủ quần áo lớn',
      'Cửa sổ thoáng',
      'Kệ bếp nấu ăn',
    ],
    description:
      'Phòng vừa hoàn thiện mới, đầy đủ nội thất chỉ việc dọn về ở. Cách ga tàu điện Cát Linh - Hà Đông 400m, thuận tiện đi lại tuyến Nguyễn Trãi - Ngã Tư Sở.',
    deposit: '3.500.000 đ',
    electricity: '3.800 đ/kWh',
    water: '90.000 đ/người/tháng',
    internet: '100.000 đ/phòng/tháng',
    landlordName: 'Đỗ Minh Tuấn',
    landlordPhone: '0966.333.444',
  },
};

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<PublicRoomItem | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check sample first
    if (SAMPLE_ROOMS_DETAIL[id]) {
      setRoom(SAMPLE_ROOMS_DETAIL[id]);
      setActiveImage(SAMPLE_ROOMS_DETAIL[id].imageUrl);
      return;
    }

    // Check backend API rooms
    authService
      .getPublicRooms()
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          const found = res.data.find((r: any) => String(r.id) === String(id));
          if (found) {
            const priceNum = Number(found.listedPrice || found.price || 3500000);
            const priceTxt = `${(priceNum / 1000000).toFixed(1)} tr/tháng`;
            const loc =
              found.fullAddress ||
              found.addressDetail ||
              (found.ward ? `${found.ward}, ${found.province || 'Hà Nội'}` : 'Hà Nội');
            const defaultImg =
              'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80';
            const img =
              found.imageUrls && found.imageUrls.length > 0 ? found.imageUrls[0] : defaultImg;

            const mapped: PublicRoomItem = {
              id: found.id,
              title: found.name
                ? `${found.name} - ${found.buildingName || 'Phòng trọ tiện nghi'}`
                : `Phòng #${found.id}`,
              price: priceNum,
              priceDisplay: priceTxt,
              location: loc,
              district: found.ward || 'Hà Nội',
              area: Number(found.area || 25),
              imageUrl: img,
              gallery: found.imageUrls || [img],
              amenities:
                Array.isArray(found.amenities) && found.amenities.length > 0
                  ? found.amenities
                  : ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Khép kín'],
              description:
                found.description ||
                'Phòng trọ tiện nghi, sạch sẽ, an ninh đảm bảo, giờ giấc tự do không chung chủ.',
              deposit: found.standardDeposit
                ? `${Number(found.standardDeposit).toLocaleString()} đ`
                : priceTxt,
              electricity: '3.800 đ/kWh',
              water: '30.000 đ/m³',
              internet: '100.000 đ/phòng/tháng',
              landlordName: found.landlordName || 'Chủ trọ StayConnect',
              landlordPhone: found.landlordPhone || '0988.888.999',
            };
            setRoom(mapped);
            setActiveImage(mapped.imageUrl);
            return;
          }
        }

        // Fallback to item 1 if not matched
        setRoom(SAMPLE_ROOMS_DETAIL['1']);
        setActiveImage(SAMPLE_ROOMS_DETAIL['1'].imageUrl);
      })
      .catch(() => {
        setRoom(SAMPLE_ROOMS_DETAIL['1']);
        setActiveImage(SAMPLE_ROOMS_DETAIL['1'].imageUrl);
      });
  }, [id]);

  const handleCopyPhone = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.landlordPhone.replace(/\D/g, ''));
    setCopied(true);
    message.success('Đã sao chép số điện thoại chủ nhà!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stay-bg-app">
        <p className="text-sm text-stay-text-secondary">Đang tải thông tin phòng trọ...</p>
      </div>
    );
  }

  const galleryImages = room.gallery && room.gallery.length > 0 ? room.gallery : [room.imageUrl];

  return (
    <div className="min-h-[85vh] bg-stay-bg-app py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/rooms')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stay-text-secondary hover:text-stay-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách phòng</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stay-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
                Phòng trọ cho thuê
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Chính chủ đã xác thực</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stay-text tracking-tight">
              {room.title}
            </h1>
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-stay-text-secondary">
              <MapPin className="w-4 h-4 text-stay-primary shrink-0" />
              <span>{room.location}</span>
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-stay-text-secondary block">Giá thuê niêm yết:</span>
            <span className="text-2xl font-bold text-stay-primary">{room.priceDisplay}</span>
          </div>
        </div>

        {/* Main Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Gallery + Specs + Amenities + Description */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-stay-card-bg border border-stay-border shadow-xs">
                <img
                  src={activeImage || room.imageUrl}
                  alt={room.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImage === img
                          ? 'border-stay-primary shadow-xs'
                          : 'border-stay-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs text-xs">
              <div className="space-y-1">
                <span className="text-stay-text-secondary flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-stay-primary" />
                  <span>Diện tích</span>
                </span>
                <p className="font-bold text-stay-text text-sm">{room.area} m²</p>
              </div>

              <div className="space-y-1">
                <span className="text-stay-text-secondary flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-stay-primary" />
                  <span>Tiền đặt cọc</span>
                </span>
                <p className="font-bold text-stay-text text-sm">{room.deposit}</p>
              </div>

              <div className="space-y-1">
                <span className="text-stay-text-secondary flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tiền điện</span>
                </span>
                <p className="font-bold text-stay-text text-sm">{room.electricity}</p>
              </div>

              <div className="space-y-1">
                <span className="text-stay-text-secondary flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tiền nước</span>
                </span>
                <p className="font-bold text-stay-text text-sm">{room.water}</p>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-stay-text uppercase tracking-wider">
                Mô tả chi tiết phòng trọ
              </h2>
              <p className="text-xs sm:text-sm text-stay-text leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="p-5 bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-stay-text uppercase tracking-wider">
                Tiện nghi & dịch vụ có sẵn
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {room.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-stay-bg-app border border-stay-border text-xs text-stay-text font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Landlord Card & Action */}
          <div className="lg:col-span-4 space-y-5">
            {/* Contact Landlord Card */}
            <div className="p-5 bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs space-y-4 sticky top-20">
              <h3 className="text-sm font-bold text-stay-text">Liên hệ chủ nhà</h3>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-stay-bg-app border border-stay-border">
                <div className="w-10 h-10 rounded-xl bg-stay-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-stay-text truncate">{room.landlordName}</p>
                  <span className="text-[11px] text-emerald-600 font-medium">Chủ trọ StayConnect</span>
                </div>
              </div>

              {/* Phone Action */}
              <div className="space-y-2">
                <a
                  href={`tel:${room.landlordPhone.replace(/\D/g, '')}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Gọi ngay: {room.landlordPhone}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border border-stay-border bg-stay-card-bg text-stay-text hover:bg-stay-bg-app transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Đã sao chép' : 'Sao chép số điện thoại'}</span>
                </button>
              </div>

              {/* Cost Summary Box */}
              <div className="pt-3 border-t border-stay-border space-y-2 text-xs">
                <span className="font-bold text-stay-text block">Chi phí hàng tháng:</span>
                <div className="flex justify-between text-stay-text-secondary">
                  <span>Tiền phòng:</span>
                  <span className="font-semibold text-stay-text">{room.priceDisplay}</span>
                </div>
                <div className="flex justify-between text-stay-text-secondary">
                  <span>Tiền cọc:</span>
                  <span className="font-semibold text-stay-text">{room.deposit}</span>
                </div>
                <div className="flex justify-between text-stay-text-secondary">
                  <span>Internet:</span>
                  <span className="font-semibold text-stay-text">{room.internet}</span>
                </div>
                <div className="flex justify-between text-stay-text-secondary">
                  <span>Điện / Nước:</span>
                  <span className="font-semibold text-stay-text">Theo đồng hồ thực tế</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

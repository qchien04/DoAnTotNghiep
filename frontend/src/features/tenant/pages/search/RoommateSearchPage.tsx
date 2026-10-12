import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  PlusCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  CigaretteOff,
  UserCheck,
} from 'lucide-react';
import { useRoommatePosts } from '@/shared/hooks';
import { RoommatePost } from '@/shared/types/tenant';

const SAMPLE_POSTS: RoommatePost[] = [
  {
    id: '1',
    code: 'BG01',
    title: 'Tìm 1 bạn nam ở ghép phòng 32m2 khép kín Triều Khúc, full đồ',
    authorId: '3',
    authorName: 'Nguyễn Văn Chiến',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Số 15 ngõ 68 Triều Khúc, Thanh Xuân Nam',
    district: 'Thanh Xuân',
    city: 'Hà Nội',
    sharePrice: 1900000,
    totalRoomPrice: 3800000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Phòng rộng rãi sạch sẽ, có gác xép, điều hòa, máy giặt, tủ lạnh riêng. Tiêu chuẩn ở gọn gàng văn minh, giữ yên tĩnh sau 23h.',
    lifestyle: {
      genderPreference: 'MALE',
      sleepTime: 'AROUND_23H_24H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'DAILY',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 96,
    status: 'OPEN',
    createdAt: '2026-10-08T08:00:00Z',
    updatedAt: '2026-10-08T08:00:00Z',
    roomInfo: {
      address: 'Số 15 ngõ 68 Triều Khúc, Thanh Xuân',
      amenities: ['Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Gác xép', 'Máy giặt'],
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '2',
    code: 'BG02',
    title: 'Tìm bạn nữ ở ghép CCMN Cầu Giấy gần ĐH Quốc Gia, ban công thoáng mát',
    authorId: '4',
    authorName: 'Lê Thị Mai',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Ngõ 175 Xuân Thủy, Dịch Vọng Hậu',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    sharePrice: 2200000,
    totalRoomPrice: 4400000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Chung cư mini mới xây, thang máy quẹt thẻ, bảo vệ 24/7. Tìm 1 bạn nữ ngoan ngoãn chia sẻ tiền phòng, giữ vệ sinh chung.',
    lifestyle: {
      genderPreference: 'FEMALE',
      sleepTime: 'BEFORE_23H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'SOMETIMES',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'NEVER',
    },
    matchPercentage: 92,
    status: 'OPEN',
    createdAt: '2026-10-07T14:30:00Z',
    updatedAt: '2026-10-07T14:30:00Z',
    roomInfo: {
      address: 'Ngõ 175 Xuân Thủy, Cầu Giấy',
      amenities: ['Thang máy', 'Điều hòa', 'Nóng lạnh', 'Ban công', 'Khóa vân tay'],
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '3',
    code: 'BG03',
    title: 'Nhóm 2 bạn nam tìm thêm 1 bạn cùng thuê nhà nguyên căn Hai Bà Trưng',
    authorId: '3',
    authorName: 'Nguyễn Văn Chiến',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    postType: 'SEARCHING_ROOM',
    areaName: 'Khu vực Đại Cồ Việt - Tạ Quang Bửu',
    district: 'Hai Bà Trưng',
    city: 'Hà Nội',
    sharePrice: 1600000,
    totalRoomPrice: 4800000,
    neededRoommates: 1,
    currentRoommates: 2,
    description: 'Đang tìm nhà nguyên căn 3 phòng ngủ quanh khu vực ĐH Bách Khoa - Xây Dựng để chia tiền cho rẻ, giờ giấc tự do.',
    lifestyle: {
      genderPreference: 'MALE',
      sleepTime: 'AROUND_23H_24H',
      smoking: false,
      petFriendly: true,
      cookingFrequency: 'DAILY',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'EXTROVERT',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 88,
    status: 'OPEN',
    createdAt: '2026-10-06T10:15:00Z',
    updatedAt: '2026-10-06T10:15:00Z',
    roomInfo: {
      address: 'Khu vực Tạ Quang Bửu, Hai Bà Trưng',
      amenities: ['Điều hòa', 'Tự do giờ giấc'],
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '4',
    code: 'BG04',
    title: 'Phòng 2 bạn nữ còn dư 1 slot gần ĐH Ngoại Thương & Ngoại Giao',
    authorId: '5',
    authorName: 'Trần Thu Thảo',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Ngõ 91 Chùa Láng, Láng Thượng',
    district: 'Đống Đa',
    city: 'Hà Nội',
    sharePrice: 1700000,
    totalRoomPrice: 5100000,
    neededRoommates: 1,
    currentRoommates: 2,
    description: 'Phòng rộng 35m2 có gác lửng, ban công lộng gió, nấu ăn riêng thoải mái. Ưu tiên bạn nữ ngoan ngoãn, giữ vệ sinh chung.',
    lifestyle: {
      genderPreference: 'FEMALE',
      sleepTime: 'BEFORE_23H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'DAILY',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 91,
    status: 'OPEN',
    createdAt: '2026-10-05T09:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
    roomInfo: {
      address: 'Ngõ 91 Chùa Láng, Đống Đa',
      amenities: ['Điều hòa', 'Bếp riêng', 'Gác lửng', 'Máy giặt'],
      images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '5',
    code: 'BG05',
    title: 'Tìm bạn cùng thuê chung cư mini khu vực Mỹ Đình',
    authorId: '6',
    authorName: 'Hoàng Minh Tuấn',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    postType: 'SEARCHING_ROOM',
    areaName: 'Khu đô thị Mỹ Đình 1, Nam Từ Liêm',
    district: 'Nam Từ Liêm',
    city: 'Hà Nội',
    sharePrice: 2000000,
    totalRoomPrice: 4000000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Mình dự định tìm phòng 2 phòng ngủ khu vực Mỹ Đình/Đình Thôn, ngân sách tầm 2tr/người. Tìm bạn tính tình vui vẻ, hòa đồng.',
    lifestyle: {
      genderPreference: 'ANY',
      sleepTime: 'AROUND_23H_24H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'SOMETIMES',
      cleanlinessLevel: 'MODERATE',
      personality: 'EXTROVERT',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 89,
    status: 'OPEN',
    createdAt: '2026-10-04T16:20:00Z',
    updatedAt: '2026-10-04T16:20:00Z',
    roomInfo: {
      address: 'Mỹ Đình 1, Nam Từ Liêm',
      amenities: ['Điều hòa', 'Thang máy'],
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '6',
    code: 'BG06',
    title: 'Studio khép kín Duy Tân cần tìm 1 bạn nam ở cùng chia tiền',
    authorId: '7',
    authorName: 'Đặng Tuấn Anh',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Ngõ 72 Phố Duy Tân, Cầu Giấy',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    sharePrice: 2400000,
    totalRoomPrice: 4800000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Studio cao cấp đầy đủ tiện nghi, thang máy, bảo vệ 24/7. Thích hợp bạn đi làm khu văn phòng Duy Tân.',
    lifestyle: {
      genderPreference: 'MALE',
      sleepTime: 'AROUND_23H_24H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'RARELY',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 94,
    status: 'OPEN',
    createdAt: '2026-10-03T11:00:00Z',
    updatedAt: '2026-10-03T11:00:00Z',
    roomInfo: {
      address: 'Duy Tân, Cầu Giấy',
      amenities: ['Điều hòa', 'Thang máy', 'Tủ lạnh', 'Khóa vân tay'],
      images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    },
  },
];

const DISTRICT_OPTIONS = [
  { value: 'ALL', label: 'Tất cả quận/huyện' },
  { value: 'Cầu Giấy', label: 'Quận Cầu Giấy' },
  { value: 'Đống Đa', label: 'Quận Đống Đa' },
  { value: 'Hai Bà Trưng', label: 'Quận Hai Bà Trưng' },
  { value: 'Thanh Xuân', label: 'Quận Thanh Xuân' },
  { value: 'Nam Từ Liêm', label: 'Quận Nam Từ Liêm' },
  { value: 'Ba Đình', label: 'Quận Ba Đình' },
];

const PRICE_OPTIONS = [
  { value: 'ALL', label: 'Mọi mức giá' },
  { value: 'UNDER_1M8', label: 'Dưới 1.8 triệu' },
  { value: '1M8_2M5', label: 'Từ 1.8 - 2.5 triệu' },
  { value: 'OVER_2M5', label: 'Trên 2.5 triệu' },
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả bài đăng' },
  { value: 'HAS_ROOM', label: 'Đã có phòng sẵn' },
  { value: 'SEARCHING_ROOM', label: 'Tìm bạn cùng thuê' },
];

const GENDER_OPTIONS = [
  { value: 'ALL', label: 'Giới tính: Mọi đối tượng' },
  { value: 'MALE', label: 'Ưu tiên Nam' },
  { value: 'FEMALE', label: 'Ưu tiên Nữ' },
];

export const RoommateSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedPrice, setSelectedPrice] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  // Lấy dữ liệu bài đăng từ backend
  const { posts: apiPosts } = useRoommatePosts();

  // Kết hợp bài đăng thực tế và danh sách bài mẫu
  const allPosts = useMemo(() => {
    if (apiPosts && apiPosts.length > 0) {
      const apiIds = new Set(apiPosts.map((p) => String(p.id)));
      return [...apiPosts, ...SAMPLE_POSTS.filter((s) => !apiIds.has(String(s.id)))];
    }
    return SAMPLE_POSTS;
  }, [apiPosts]);

  // Bộ lọc
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      // Từ khóa
      if (keyword.trim()) {
        const query = keyword.toLowerCase().trim();
        const matchTitle = (post.title || '').toLowerCase().includes(query);
        const matchArea = (post.areaName || '').toLowerCase().includes(query);
        const matchAuthor = (post.authorName || '').toLowerCase().includes(query);
        const matchDesc = (post.description || '').toLowerCase().includes(query);
        if (!matchTitle && !matchArea && !matchAuthor && !matchDesc) return false;
      }

      // Quận huyện
      if (selectedDistrict !== 'ALL') {
        const postDist = (post.district || '').toLowerCase();
        const postArea = (post.areaName || '').toLowerCase();
        const target = selectedDistrict.toLowerCase();
        if (!postDist.includes(target) && !postArea.includes(target)) return false;
      }

      // Giá share
      if (selectedPrice === 'UNDER_1M8' && post.sharePrice >= 1800000) return false;
      if (selectedPrice === '1M8_2M5' && (post.sharePrice < 1800000 || post.sharePrice > 2500000)) return false;
      if (selectedPrice === 'OVER_2M5' && post.sharePrice <= 2500000) return false;

      // Loại bài đăng
      if (selectedType !== 'ALL' && post.postType !== selectedType) return false;

      // Giới tính
      if (selectedGender !== 'ALL') {
        const pref = post.lifestyle?.genderPreference;
        if (pref && pref !== 'ANY' && pref !== selectedGender) return false;
      }

      return true;
    });
  }, [allPosts, keyword, selectedDistrict, selectedPrice, selectedType, selectedGender]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedDistrict('ALL');
    setSelectedPrice('ALL');
    setSelectedType('ALL');
    setSelectedGender('ALL');
  };

  return (
    <div className="min-h-[85vh] bg-stay-bg py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Tiêu đề trang tối giản */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-stay-border-subtle">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stay-text tracking-tight">
              Tìm Bạn Ở Ghép & Nhóm Thuê Phòng
            </h1>
            <p className="text-xs text-stay-text-secondary mt-1">
              Khám phá bạn cùng phòng và các bài đăng ghép trọ phù hợp với ngân sách và lối sống của bạn.
            </p>
          </div>

          <Link
            to="/tenant/create-post"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors shrink-0 self-start sm:self-auto shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đăng bài tìm bạn</span>
          </Link>
        </div>

        {/* Thanh lọc tinh gọn */}
        <div className="p-3.5 bg-stay-card-bg rounded-xl border border-stay-border shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
            {/* Ô tìm kiếm */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stay-text-muted" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề, địa chỉ, tên người đăng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stay-border bg-stay-bg-app text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:border-stay-primary transition-colors"
              />
            </div>

            {/* Quận / Huyện */}
            <div className="lg:col-span-2">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {DISTRICT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mức giá */}
            <div className="lg:col-span-2">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {PRICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Loại tin */}
            <div className="lg:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm rounded-lg border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Giới tính */}
            <div className="lg:col-span-1">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-2 py-2 text-xs sm:text-sm rounded-lg border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nút đặt lại */}
            <div className="lg:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                title="Đặt lại bộ lọc"
                className="w-full py-2 px-2.5 flex items-center justify-center gap-1 rounded-lg border border-stay-border bg-stay-bg-app text-stay-text-secondary hover:text-stay-primary hover:border-stay-primary transition-colors cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="lg:hidden">Đặt lại</span>
              </button>
            </div>
          </div>
        </div>

        {/* Số lượng kết quả */}
        <div className="flex items-center justify-between text-xs text-stay-text-secondary px-1">
          <span>
            Hiển thị <strong className="text-stay-primary font-semibold">{filteredPosts.length}</strong> bài đăng phù hợp
          </span>
        </div>

        {/* Danh sách thẻ bài đăng */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-stay-card-bg rounded-xl border border-stay-border">
            <p className="text-sm font-semibold text-stay-text">Không tìm thấy bài đăng nào phù hợp</p>
            <p className="text-xs text-stay-text-secondary mt-1">
              Vui lòng thử điều chỉnh lại điều kiện lọc hoặc từ khóa tìm kiếm.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors cursor-pointer"
            >
              Xem tất cả bài đăng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const coverImg =
                post.roomInfo?.images?.[0] ||
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80';
              const isHasRoom = post.postType === 'HAS_ROOM';
              const genderText =
                post.lifestyle?.genderPreference === 'MALE'
                  ? 'Nam'
                  : post.lifestyle?.genderPreference === 'FEMALE'
                  ? 'Nữ'
                  : 'Nam / Nữ';

              return (
                <div
                  key={post.id}
                  className="group bg-stay-card-bg rounded-xl border border-stay-border hover:border-stay-primary/60 transition-all flex flex-col justify-between overflow-hidden shadow-2xs"
                >
                  <div>
                    {/* Ảnh đại diện phòng / bài đăng */}
                    <div className="relative aspect-16/9 w-full overflow-hidden bg-stay-bg-app border-b border-stay-border">
                      <img
                        src={coverImg}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80';
                        }}
                      />

                      {/* Huy hiệu loại tin */}
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-xs ${
                            isHasRoom
                              ? 'bg-stay-primary text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isHasRoom ? 'Đã có phòng' : 'Tìm bạn cùng thuê'}
                        </span>
                      </div>

                      {/* Huy hiệu số slot còn trống */}
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/65 text-white text-[11px] font-medium backdrop-blur-xs">
                        Cần tìm {post.neededRoommates} bạn
                      </div>
                    </div>

                    {/* Nội dung bài viết */}
                    <div className="p-4 space-y-3">
                      {/* Tác giả & Ngày đăng */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={
                              post.authorAvatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                            }
                            alt={post.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-stay-border shrink-0"
                          />
                          <span className="font-semibold text-stay-text text-xs truncate">
                            {post.authorName}
                          </span>
                        </div>
                        <span className="text-[11px] text-stay-text-muted shrink-0">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Mới đăng'}
                        </span>
                      </div>

                      {/* Tiêu đề bài đăng */}
                      <Link
                        to={`/roommates/${post.id}`}
                        className="text-sm font-bold text-stay-text group-hover:text-stay-primary transition-colors line-clamp-2 block leading-snug"
                      >
                        {post.title}
                      </Link>

                      {/* Địa chỉ khu vực */}
                      <div className="flex items-center gap-1.5 text-xs text-stay-text-secondary">
                        <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                        <span className="truncate">{post.areaName || post.district || 'Hà Nội'}</span>
                      </div>

                      {/* Tiêu chí nhanh dạng pill */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stay-bg-app border border-stay-border text-stay-text-secondary">
                          <UserCheck className="w-3 h-3 text-stay-primary" />
                          <span>{genderText}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stay-bg-app border border-stay-border text-stay-text-secondary">
                          <CigaretteOff className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Không hút thuốc</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stay-bg-app border border-stay-border text-stay-text-secondary">
                          <Clock className="w-3 h-3 text-stay-text-muted" />
                          <span>{post.lifestyle?.sleepTime === 'BEFORE_23H' ? 'Ngủ sớm' : 'Giờ linh hoạt'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phần chân Card: Giá, tương thích và Nút xem */}
                  <div className="p-4 pt-3 border-t border-stay-border bg-stay-card-bg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stay-text-muted block uppercase tracking-wider">
                          Giá chia sẻ
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-stay-primary">
                            {post.sharePrice.toLocaleString()} đ
                          </span>
                          <span className="text-[11px] text-stay-text-secondary">/người/tháng</span>
                        </div>
                      </div>

                      {post.matchPercentage !== undefined && (
                        <div className="px-2 py-1 rounded-md bg-stay-primary-subtle border border-stay-primary/20 text-stay-primary flex items-center gap-1 text-[11px] font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>{post.matchPercentage}% Hợp</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/roommates/${post.id}`)}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold border border-stay-border bg-stay-bg-app text-stay-text hover:bg-stay-primary hover:text-white hover:border-stay-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

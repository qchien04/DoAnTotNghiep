import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Users,
  PlusCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useRoommatePosts } from '@/shared/hooks';
import { RoommatePost } from '@/shared/types/tenant';

const SAMPLE_POSTS: RoommatePost[] = [
  {
    id: '1',
    code: 'BG01',
    title: 'Tìm 1 bạn nam ở ghép phòng khép kín đủ đồ, ban công thoáng',
    authorId: 'u1',
    authorName: 'Hoàng Minh Anh',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Ngõ 80 Cầu Giấy, Dịch Vọng Hậu',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    sharePrice: 1900000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Phòng đầy đủ điều hòa, nóng lạnh, máy giặt chung. Tìm bạn nam sinh viên hoặc mới đi làm, sạch sẽ, không hút thuốc.',
    lifestyle: {
      genderPreference: 'MALE',
      sleepTime: 'AROUND_23H_24H',
      smoking: false,
      petFriendly: true,
      cookingFrequency: 'SOMETIMES',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 96,
    status: 'OPEN',
    createdAt: '2026-10-08T08:00:00Z',
    updatedAt: '2026-10-08T08:00:00Z',
    roomInfo: {
      address: 'Số 12 Ngõ 80 Cầu Giấy',
      amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Ban công'],
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '2',
    code: 'BG02',
    title: 'Tìm bạn sinh viên cùng thuê căn hộ mini 2 phòng ngủ Mỹ Đình',
    authorId: 'u2',
    authorName: 'Trần Đức Thắng',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    postType: 'SEARCHING_ROOM',
    areaName: 'Khu đô thị Mỹ Đình 1, Nam Từ Liêm',
    district: 'Nam Từ Liêm',
    city: 'Hà Nội',
    sharePrice: 2200000,
    neededRoommates: 2,
    currentRoommates: 1,
    description: 'Mình dự định tìm căn hộ mini 2 phòng ngủ khu vực Mỹ Đình/Đình Thôn, ngân sách 2 - 2.5tr/người. Cần tìm thêm 2 bạn tính tình vui vẻ, hòa đồng.',
    lifestyle: {
      genderPreference: 'ANY',
      sleepTime: 'BEFORE_23H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'DAILY',
      cleanlinessLevel: 'MODERATE',
      personality: 'EXTROVERT',
      guestsAllowed: 'ANYTIME',
    },
    matchPercentage: 92,
    status: 'OPEN',
    createdAt: '2026-10-07T14:30:00Z',
    updatedAt: '2026-10-07T14:30:00Z',
  },
  {
    id: '3',
    code: 'BG03',
    title: 'Phòng 2 bạn nữ còn dư 1 slot gần ĐH Ngoại Thương & Ngoại Giao',
    authorId: 'u3',
    authorName: 'Lê Thảo My',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Ngõ 91 Chùa Láng, Láng Thượng',
    district: 'Đống Đa',
    city: 'Hà Nội',
    sharePrice: 1600000,
    neededRoommates: 1,
    currentRoommates: 2,
    description: 'Phòng rộng 35m2 có gác lửng, ban công lộng gió, nấu ăn riêng thoải mái. Ưu tiên bạn nữ ngoan ngoãn, giữ vệ sinh chung.',
    lifestyle: {
      genderPreference: 'FEMALE',
      sleepTime: 'AROUND_23H_24H',
      smoking: false,
      petFriendly: true,
      cookingFrequency: 'DAILY',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 89,
    status: 'OPEN',
    createdAt: '2026-10-06T10:15:00Z',
    updatedAt: '2026-10-06T10:15:00Z',
    roomInfo: {
      address: 'Ngõ 91 Chùa Láng, Đống Đa',
      amenities: ['Điều hòa', 'Bếp riêng', 'Gác lửng', 'Máy giặt'],
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '4',
    code: 'BG04',
    title: 'Tìm 1 bạn nam ở ghép nhà nguyên căn Bách Khoa, giờ giấc tự do',
    authorId: 'u4',
    authorName: 'Nguyễn Tiến Đạt',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Số 45 Tạ Quang Bửu, Bách Khoa',
    district: 'Hai Bà Trưng',
    city: 'Hà Nội',
    sharePrice: 1500000,
    neededRoommates: 1,
    currentRoommates: 2,
    description: 'Nhà 3 tầng thoáng mát, tầng 1 để xe, tầng 2 ngủ, tầng 3 phơi đồ. Đã có tủ lạnh, máy giặt, điều hòa. Tìm bạn nam học ĐHBK hoặc ĐH gần đó.',
    lifestyle: {
      genderPreference: 'MALE',
      sleepTime: 'AFTER_24H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'SOMETIMES',
      cleanlinessLevel: 'MODERATE',
      personality: 'INTROVERT',
      guestsAllowed: 'WEEKENDS_ONLY',
    },
    matchPercentage: 85,
    status: 'OPEN',
    createdAt: '2026-10-05T09:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z',
    roomInfo: {
      address: 'Tạ Quang Bửu, Hai Bà Trưng',
      amenities: ['Điều hòa', 'Nóng lạnh', 'Wifi', 'Máy giặt'],
      images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    },
  },
  {
    id: '5',
    code: 'BG05',
    title: 'Tìm bạn cùng thuê chung cư mini khu vực Thanh Xuân',
    authorId: 'u5',
    authorName: 'Phạm Thị Quỳnh',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    postType: 'SEARCHING_ROOM',
    areaName: 'Ngõ 88 Triều Khúc, Thanh Xuân',
    district: 'Thanh Xuân',
    city: 'Hà Nội',
    sharePrice: 1800000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Mình đang tìm bạn nữ ở ghép để thuê phòng khu Triều Khúc hoặc Nguyễn Trãi. Giờ giấc sinh hoạt điều độ, thích yên tĩnh.',
    lifestyle: {
      genderPreference: 'FEMALE',
      sleepTime: 'BEFORE_23H',
      smoking: false,
      petFriendly: false,
      cookingFrequency: 'SOMETIMES',
      cleanlinessLevel: 'VERY_CLEAN',
      personality: 'INTROVERT',
      guestsAllowed: 'NEVER',
    },
    matchPercentage: 91,
    status: 'OPEN',
    createdAt: '2026-10-04T16:20:00Z',
    updatedAt: '2026-10-04T16:20:00Z',
  },
  {
    id: '6',
    code: 'BG06',
    title: 'Phòng studio khép kín Duy Tân cần tìm 1 bạn nam ở cùng',
    authorId: 'u6',
    authorName: 'Đặng Tuấn Anh',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    postType: 'HAS_ROOM',
    areaName: 'Ngõ 72 Phố Duy Tân, Cầu Giấy',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    sharePrice: 2400000,
    neededRoommates: 1,
    currentRoommates: 1,
    description: 'Phòng studio cao cấp đầy đủ tiện nghi, thang máy, bảo vệ 24/7. Thích hợp bạn đi làm khu văn phòng Duy Tân.',
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
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'],
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
];

const PRICE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả giá share' },
  { value: 'UNDER_2M', label: 'Dưới 2.0 triệu' },
  { value: '2M_3M', label: 'Từ 2.0 - 3.0 triệu' },
  { value: 'OVER_3M', label: 'Trên 3.0 triệu' },
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả loại bài đăng' },
  { value: 'HAS_ROOM', label: 'Đã có phòng trọ' },
  { value: 'SEARCHING_ROOM', label: 'Đang tìm phòng' },
];

export const RoommateSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedPrice, setSelectedPrice] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Fetch real posts from backend
  const { posts: apiPosts } = useRoommatePosts();

  // Combine backend posts with sample posts
  const allPosts = useMemo(() => {
    if (apiPosts && apiPosts.length > 0) {
      const apiIds = new Set(apiPosts.map((p) => p.id));
      return [...apiPosts, ...SAMPLE_POSTS.filter((s) => !apiIds.has(s.id))];
    }
    return SAMPLE_POSTS;
  }, [apiPosts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      // Keyword
      if (keyword.trim()) {
        const query = keyword.toLowerCase().trim();
        const matchTitle = post.title.toLowerCase().includes(query);
        const matchArea = (post.areaName || '').toLowerCase().includes(query);
        const matchAuthor = (post.authorName || '').toLowerCase().includes(query);
        if (!matchTitle && !matchArea && !matchAuthor) return false;
      }

      // District
      if (selectedDistrict !== 'ALL') {
        const postDist = (post.district || '').toLowerCase();
        if (!postDist.includes(selectedDistrict.toLowerCase())) return false;
      }

      // Price
      if (selectedPrice === 'UNDER_2M' && post.sharePrice >= 2000000) return false;
      if (selectedPrice === '2M_3M' && (post.sharePrice < 2000000 || post.sharePrice > 3000000)) return false;
      if (selectedPrice === 'OVER_3M' && post.sharePrice <= 3000000) return false;

      // Post Type
      if (selectedType !== 'ALL' && post.postType !== selectedType) return false;

      return true;
    });
  }, [allPosts, keyword, selectedDistrict, selectedPrice, selectedType]);

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedDistrict('ALL');
    setSelectedPrice('ALL');
    setSelectedType('ALL');
  };

  return (
    <div className="min-h-[85vh] bg-stay-bg-app py-6 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header (Tối giản) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stay-text tracking-tight">
              Bài Đăng Ở Ghép
            </h1>
            <p className="text-xs text-stay-text-secondary mt-1">
              Tìm kiếm bạn cùng phòng và các bài đăng ghép trọ phù hợp với ngân sách và lối sống.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              to="/tenant/create-post"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>Đăng tin tìm bạn</span>
            </Link>
          </div>
        </div>

        {/* Minimal Filter Bar */}
        <div className="p-3.5 bg-stay-card-bg rounded-2xl border border-stay-border shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stay-text-muted" />
              <input
                type="text"
                placeholder="Nhập tiêu đề hoặc địa điểm cần tìm..."
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
            <div className="sm:col-span-2">
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

            {/* Type Select */}
            <div className="sm:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stay-border bg-stay-bg-app text-stay-text focus:outline-none focus:border-stay-primary transition-colors cursor-pointer"
              >
                {TYPE_OPTIONS.map((opt) => (
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

        {/* Posts Count */}
        <div className="flex items-center justify-between text-xs text-stay-text-secondary px-1">
          <span>
            Tìm thấy <strong className="text-stay-primary font-bold">{filteredPosts.length}</strong> bài đăng phù hợp
          </span>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-stay-card-bg rounded-2xl border border-stay-border">
            <p className="text-sm font-semibold text-stay-text">Không tìm thấy bài đăng phù hợp</p>
            <p className="text-xs text-stay-text-secondary mt-1">
              Thử tìm kiếm với từ khóa khác hoặc bấm đặt lại bộ lọc.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors cursor-pointer"
            >
              Xem tất cả bài đăng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="group bg-stay-card-bg rounded-2xl border border-stay-border hover:border-stay-primary/50 transition-all flex flex-col justify-between overflow-hidden shadow-xs"
              >
                {/* Card Top: Author & Tag */}
                <div className="p-4 border-b border-stay-border space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-stay-bg-app shrink-0 border border-stay-border">
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-stay-primary">
                            {(post.authorName || 'U').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stay-text truncate">
                          {post.authorName}
                        </p>
                        <p className="text-[10px] text-stay-text-secondary">
                          {post.code || 'Tin đăng'}
                        </p>
                      </div>
                    </div>

                    {/* Post Type Tag */}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                        post.postType === 'HAS_ROOM'
                          ? 'bg-stay-primary-subtle text-stay-primary border border-stay-primary/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}
                    >
                      {post.postType === 'HAS_ROOM' ? 'Đã có phòng' : 'Chưa có phòng'}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    to={`/roommates/${post.id}`}
                    className="text-sm font-bold text-stay-text group-hover:text-stay-primary transition-colors line-clamp-2 block"
                  >
                    {post.title}
                  </Link>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-xs text-stay-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                    <span className="truncate">{post.areaName || post.district}</span>
                  </div>
                </div>

                {/* Card Bottom: Price, Roommates, Match & Action */}
                <div className="p-4 space-y-3 bg-stay-card-bg">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-stay-text-secondary block">Giá share:</span>
                      <span className="font-bold text-stay-primary text-sm">
                        {post.sharePrice.toLocaleString()} đ/tháng
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-stay-text-secondary block">Cần tìm:</span>
                      <span className="font-semibold text-stay-text flex items-center gap-1 justify-end">
                        <Users className="w-3.5 h-3.5 text-stay-text-secondary" />
                        <span>{post.neededRoommates} người</span>
                      </span>
                    </div>
                  </div>

                  {/* Lifestyle Match Badge */}
                  {post.matchPercentage !== undefined && (
                    <div className="p-2 rounded-xl bg-stay-bg-app border border-stay-border flex items-center justify-between">
                      <span className="text-[11px] text-stay-text-secondary flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-stay-primary" />
                        <span>Độ hòa hợp:</span>
                      </span>
                      <span className="text-xs font-bold text-stay-primary">
                        {post.matchPercentage}%
                      </span>
                    </div>
                  )}

                  {/* Action Link */}
                  <button
                    type="button"
                    onClick={() => navigate(`/roommates/${post.id}`)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-stay-border bg-stay-bg-app text-stay-text hover:bg-stay-primary hover:text-white hover:border-stay-primary transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Xem chi tiết bài đăng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoommatePosts } from '@/shared/hooks';
import {
  Search,
  MapPin,
  Sparkles,
  Users,
  PlusCircle,
  FileText,
  Map as MapIcon,
  LayoutGrid,
} from 'lucide-react';
import {
  Input,
  Select,
  Button,
  Slider,
  Tag,
  Skeleton,
  Badge,
  HabitChip,
  LeafletMap,
  type MapMarker,
} from '@/shared/components';
import { PostSearchParams } from '@/shared/types/tenant';

const HABIT_FILTER_OPTIONS = [
  { id: 'non_smoker', label: 'Không hút thuốc', emoji: '🚭' },
  { id: 'night_owl', label: 'Ngủ sau 0h', emoji: '🌙' },
  { id: 'early_bird', label: 'Dậy sớm trước 7h', emoji: '☀️' },
  { id: 'cooking', label: 'Thích nấu ăn', emoji: '🍳' },
  { id: 'pet_friendly', label: 'Nuôi thú cưng', emoji: '🐶' },
  { id: 'clean', label: 'Ngăn nắp sạch sẽ', emoji: '🧹' },
  { id: 'quiet', label: 'Thích yên tĩnh', emoji: '🎧' },
];

const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  'cầu giấy': [21.0366, 105.7828],
  'đống đa': [21.0183, 105.8236],
  'hai bà trưng': [21.0084, 105.8504],
  'ba đình': [21.0341, 105.8242],
  'thanh xuân': [20.9984, 105.8083],
  'nam từ liêm': [21.0135, 105.7644],
  'bắc từ liêm': [21.0601, 105.7561],
  'hoàng mai': [20.9754, 105.8504],
  'tây hồ': [21.0664, 105.8202],
  'hà đông': [20.9723, 105.7725],
};

const getCoordinatesForArea = (areaName: string, id: number | string): [number, number] => {
  const lower = (areaName || '').toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (lower.includes(key)) {
      const numId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, '') || '0', 10);
      const latOffset = ((numId % 7) - 3) * 0.0035;
      const lngOffset = (((numId * 3) % 7) - 3) * 0.0035;
      return [coords[0] + latOffset, coords[1] + lngOffset];
    }
  }
  const numId = typeof id === 'number' ? id : 1;
  return [21.0285 + ((numId % 5) - 2) * 0.005, 105.8048 + (((numId * 2) % 5) - 2) * 0.005];
};

export const RoommateSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [postType, setPostType] = useState<'ALL' | 'HAS_ROOM' | 'SEARCHING_ROOM'>('ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([500000, 6000000]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [sortBy, setSortBy] = useState<'match' | 'newest' | 'price_asc' | 'price_desc'>('match');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const searchParams: PostSearchParams = {
    keyword,
    district,
    postType: activeTab === 'HAS_ROOM' ? 'HAS_ROOM' : activeTab === 'SEARCHING_ROOM' ? 'SEARCHING_ROOM' : postType,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  };

  const { posts, isLoading } = useRoommatePosts(searchParams);

  const toggleHabit = (label: string) => {
    setSelectedHabits((prev) =>
      prev.includes(label) ? prev.filter((h) => h !== label) : [...prev, label]
    );
  };

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    if (activeTab === 'MATCH_HIGH') {
      result = result.filter((p) => (p.matchPercentage || 0) >= 90);
    } else if (activeTab === 'HAS_ROOM') {
      result = result.filter((p) => p.postType === 'HAS_ROOM');
    } else if (activeTab === 'SEARCHING_ROOM') {
      result = result.filter((p) => p.postType === 'SEARCHING_ROOM');
    }

    if (sortBy === 'match') {
      result.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.sharePrice - b.sharePrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.sharePrice - a.sharePrice);
    }

    return result;
  }, [posts, activeTab, sortBy]);

  const mapMarkers = useMemo<MapMarker[]>(() => {
    return filteredAndSortedPosts.map((post) => {
      let position: [number, number];
      if (post.mapLocation?.latitude && post.mapLocation?.longitude) {
        position = [post.mapLocation.latitude, post.mapLocation.longitude];
      } else {
        position = getCoordinatesForArea(post.areaName || post.district, post.id);
      }

      return {
        id: post.id,
        position,
        title: post.title,
        price: `${(post.sharePrice / 1000000).toFixed(1)} tr/ng`,
        address: post.areaName,
        imageUrl: post.roomInfo?.images?.[0] || post.authorAvatar,
        type: 'roommate',
        matchPercentage: post.matchPercentage,
        link: `/roommates/${post.id}`,
      };
    });
  }, [filteredAndSortedPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-stay-primary/10 via-stay-card-bg to-emerald-500/10 border border-stay-border shadow-xs">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="font-semibold">
              Cộng đồng ở ghép văn minh
            </Badge>
            <span className="text-xs text-stay-text-secondary font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-stay-primary" />
              Độ tương thích thói quen sống
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
            Tìm Bạn Ở Ghép Cùng Gu & Nhóm Thuê Phòng
          </h1>

          <p className="text-xs sm:text-sm text-stay-text-secondary leading-relaxed">
            Kết nối những người bạn cùng phòng có nhịp sinh học tương đồng (giờ giấc ngủ, không hút thuốc, nấu ăn, thú cưng) để san sẻ chi phí tiền phòng và xây dựng môi trường sống hòa thuận.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/roommates/my-posts">
            <Button
              variant="outline"
              icon={<FileText className="w-4 h-4" />}
              className="font-semibold h-11 px-4 rounded-xl"
            >
              Tin đăng của tôi
            </Button>
          </Link>

          <Link to="/roommates/create">
            <Button
              variant="primary"
              icon={<PlusCircle className="w-4 h-4" />}
              className="font-semibold shadow-md shadow-stay-primary/20 h-11 px-5 rounded-xl"
            >
              Đăng tin tìm bạn
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Advanced Multi-dimension Filter Card */}
      <div className="p-6 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs space-y-5">
        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Tìm theo trường ĐH, tuyến đường, khu vực..."
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            className="rounded-xl h-11"
          />

          <Select
            placeholder="Chọn Quận / Huyện"
            value={district}
            onChange={(val) => setDistrict(val)}
            allowClear
            className="w-full h-11"
            options={[
              { label: 'Tất cả quận huyện', value: undefined },
              { label: 'Cầu Giấy', value: 'Cầu Giấy' },
              { label: 'Hai Bà Trưng', value: 'Hai Bà Trưng' },
              { label: 'Đống Đa', value: 'Đống Đa' },
              { label: 'Thanh Xuân', value: 'Thanh Xuân' },
              { label: 'Nam Từ Liêm', value: 'Nam Từ Liêm' },
              { label: 'Bắc Từ Liêm', value: 'Bắc Từ Liêm' },
              { label: 'Hà Đông', value: 'Hà Đông' },
            ]}
          />

          <Select
            value={postType}
            onChange={(val) => setPostType(val)}
            className="w-full h-11"
            options={[
              { label: 'Tất cả loại tin', value: 'ALL' },
              { label: 'Đã có sẵn phòng trọ', value: 'HAS_ROOM' },
              { label: 'Tìm bạn cùng tìm phòng', value: 'SEARCHING_ROOM' },
            ]}
          />

          {/* Budget Slider */}
          <div className="px-2 pt-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Ngân sách share / người:</span>
              <span className="font-bold text-stay-primary">
                {(priceRange[0] / 1000000).toFixed(1)} - {(priceRange[1] / 1000000).toFixed(1)} Tr
              </span>
            </div>
            <Slider
              range
              min={500000}
              max={6000000}
              step={100000}
              value={priceRange}
              onChange={(val) => setPriceRange(val as [number, number])}
            />
          </div>
        </div>

        {/* Habits Filter Row */}
        <div className="pt-4 border-t border-stay-border/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stay-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stay-primary" />
              Lọc theo thói quen sinh hoạt:
            </span>
            {selectedHabits.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedHabits([])}
                className="text-xs text-stay-primary hover:underline cursor-pointer"
              >
                Xóa bộ lọc thói quen ({selectedHabits.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {HABIT_FILTER_OPTIONS.map((opt) => (
              <HabitChip
                key={opt.id}
                label={opt.label}
                emoji={opt.emoji}
                selected={selectedHabits.includes(opt.label)}
                onClick={() => toggleHabit(opt.label)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Sorting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stay-border pb-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'ALL', label: 'Tất cả tin đăng' },
            { key: 'MATCH_HIGH', label: 'Tương thích cao (>90%)' },
            { key: 'HAS_ROOM', label: 'Đã có phòng' },
            { key: 'SEARCHING_ROOM', label: 'Tìm bạn cùng thuê' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-stay-primary text-white shadow-xs'
                  : 'text-stay-text hover:bg-stay-bg-app'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode & Sort By */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-stay-card-bg border border-stay-border rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-stay-primary text-white shadow-xs'
                  : 'text-stay-text-secondary hover:text-stay-text'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Danh sách
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-stay-primary text-white shadow-xs'
                  : 'text-stay-text-secondary hover:text-stay-text'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Bản đồ
            </button>
          </div>

          {/* Sort By Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stay-text-secondary">Sắp xếp:</span>
            <Select
              value={sortBy}
              onChange={(val) => setSortBy(val as any)}
              className="w-48 text-xs"
              options={[
                { label: 'Độ tương thích cao nhất', value: 'match' },
                { label: 'Mới đăng gần đây', value: 'newest' },
                { label: 'Giá share thấp đến cao', value: 'price_asc' },
                { label: 'Giá share cao đến thấp', value: 'price_desc' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Map View Section (when Map view is active) */}
      {viewMode === 'map' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-stay-card-bg rounded-2xl border border-stay-border">
            <span className="text-xs text-stay-text-secondary flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-stay-primary" />
              Bản đồ tìm bạn ở ghép: <strong>{mapMarkers.length}</strong> bài đăng tại Hà Nội
            </span>
            <span className="text-[11px] text-slate-400">
              Nhấp vào ghim để xem chi tiết bài đăng và phòng trọ
            </span>
          </div>
          <LeafletMap
            markers={mapMarkers}
            height="500px"
            onMarkerClick={(marker) => navigate(`/roommates/${marker.id}`)}
          />
        </div>
      )}

      {/* 4. Search Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-stay-card-bg border border-stay-border">
              <Skeleton active paragraph={{ rows: 5 }} />
            </div>
          ))}
        </div>
      ) : filteredAndSortedPosts.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl bg-stay-card-bg border border-stay-border space-y-4">
          <Users className="w-14 h-14 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stay-text">Không tìm thấy bài đăng phù hợp</h3>
            <p className="text-xs text-stay-text-secondary max-w-sm mx-auto">
              Không có bài đăng nào khớp với các tiêu chí lọc hiện tại. Bạn hãy thử mở rộng khoảng giá hoặc điều chỉnh lại thói quen sinh hoạt.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setKeyword('');
              setDistrict(undefined);
              setPostType('ALL');
              setPriceRange([500000, 6000000]);
              setSelectedHabits([]);
              setActiveTab('ALL');
            }}
          >
            Đặt lại tất cả bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPosts.map((post) => (
            <div
              key={post.id}
              className="group rounded-3xl bg-stay-card-bg border border-stay-border hover:border-stay-primary/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Media Preview */}
              {post.roomInfo?.images && post.roomInfo.images.length > 0 ? (
                <div className="h-48 w-full overflow-hidden relative bg-slate-100">
                  <img
                    src={post.roomInfo.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Tag color="green" className="font-semibold px-2.5 py-1 rounded-lg border-none shadow-xs">
                      Đã có phòng
                    </Tag>
                  </div>
                  {post.matchPercentage && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {post.matchPercentage}% Khớp
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 w-full bg-gradient-to-br from-stay-primary/15 via-stay-card-bg to-emerald-500/10 p-4 flex flex-col justify-between border-b border-stay-border/50">
                  <Tag color="blue" className="font-semibold w-fit px-2.5 py-1 rounded-lg border-none shadow-2xs">
                    Tìm bạn cùng tìm phòng
                  </Tag>
                  {post.matchPercentage && (
                    <span className="text-xs font-bold text-stay-primary flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-stay-match" />
                      Độ tương thích thói quen: {post.matchPercentage}%
                    </span>
                  )}
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Author Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={post.authorName}
                        className="w-7 h-7 rounded-full object-cover border border-stay-border"
                      />
                      <span className="text-xs font-semibold text-stay-text">{post.authorName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Mã: {post.code}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/roommates/${post.id}`}>
                    <h2 className="text-base font-bold text-stay-text group-hover:text-stay-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Location */}
                  <p className="text-xs text-stay-text-secondary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
                    <span className="line-clamp-1">{post.areaName}</span>
                  </p>

                  {/* Description */}
                  <p className="text-xs text-stay-text-secondary line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="space-y-3.5 pt-3 border-t border-stay-border/60">
                  {/* Habit chips */}
                  <div className="flex flex-wrap gap-1.5">
                    <HabitChip label="Không hút thuốc" size="sm" emoji="🚭" />
                    <HabitChip label="Ngủ sau 0h" size="sm" emoji="🌙" />
                    <HabitChip label="Sạch sẽ" size="sm" emoji="🧹" />
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ngân sách share:</span>
                      <span className="text-lg font-extrabold text-stay-primary">
                        {post.sharePrice.toLocaleString()} đ
                        <span className="text-xs font-normal text-slate-400">/người</span>
                      </span>
                    </div>

                    <Link to={`/roommates/${post.id}`}>
                      <Button variant="primary" size="sm" className="font-semibold rounded-xl">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoommateSearchPage;

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRoommatePosts } from '@/shared/hooks';
import {
  PlusCircle,
  FileText,
  Map as MapIcon,
  LayoutGrid,
  Table as TableIcon,
  Users,
} from 'lucide-react';
import { Button, Select, Skeleton, type MapMarker } from '@/shared/components';
import { PostSearchParams } from '@/shared/types/tenant';
import { SearchFilter } from './components/SearchFilter';
import { PostTable } from './components/PostTable';
import { PostGrid } from './components/PostGrid';
import { PostMap } from './components/PostMap';

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
  // Mode tab: 'ROOMMATE' vs 'WHOLE_ROOM'
  const [searchMode, setSearchMode] = useState<'ROOMMATE' | 'WHOLE_ROOM'>('ROOMMATE');

  // Basic Filter state
  const [keyword, setKeyword] = useState('');
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [postType, setPostType] = useState<'ALL' | 'HAS_ROOM' | 'SEARCHING_ROOM'>('ALL');
  const [priceRange, setPriceRange] = useState<[number, number]>([1000000, 3500000]);

  // Lifestyle filter criteria (UC11)
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [noSmokingFilter, setNoSmokingFilter] = useState<boolean | null>(null);
  const [sleepTimeFilter, setSleepTimeFilter] = useState<'ALL' | 'BEFORE_24H' | 'AFTER_24H'>('ALL');
  const [noPetFilter, setNoPetFilter] = useState<boolean | null>(null);
  const [cookingFilter, setCookingFilter] = useState<boolean | null>(null);

  // View mode: 'table' | 'grid' | 'map'
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'map'>('table');
  const [sortBy, setSortBy] = useState<'match' | 'newest' | 'price_asc' | 'price_desc'>('match');
  const [priceError, setPriceError] = useState<string | null>(null);

  const searchParams: PostSearchParams = {
    keyword,
    district,
    postType: postType === 'ALL' ? undefined : postType,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  };

  const { posts, isLoading } = useRoommatePosts(searchParams);

  // Filter posts with lifestyle
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    if (searchMode === 'WHOLE_ROOM') {
      result = result.filter((p) => p.postType === 'HAS_ROOM');
    }

    if (genderFilter !== 'ALL') {
      result = result.filter(
        (p) => p.lifestyle.genderPreference === 'ANY' || p.lifestyle.genderPreference === genderFilter
      );
    }

    if (noSmokingFilter !== null) {
      result = result.filter((p) => (noSmokingFilter ? !p.lifestyle.smoking : true));
    }

    if (sleepTimeFilter === 'BEFORE_24H') {
      result = result.filter((p) => p.lifestyle.sleepTime === 'BEFORE_23H' || p.lifestyle.sleepTime === 'AROUND_23H_24H');
    } else if (sleepTimeFilter === 'AFTER_24H') {
      result = result.filter((p) => p.lifestyle.sleepTime === 'AFTER_24H');
    }

    if (noPetFilter !== null) {
      result = result.filter((p) => (noPetFilter ? !p.lifestyle.petFriendly : true));
    }

    if (cookingFilter !== null) {
      result = result.filter((p) => (cookingFilter ? p.lifestyle.cookingFrequency !== 'RARELY' : true));
    }

    // Sort
    if (sortBy === 'match') {
      result.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.sharePrice - b.sharePrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.sharePrice - a.sharePrice);
    }

    return result;
  }, [
    posts,
    searchMode,
    genderFilter,
    noSmokingFilter,
    sleepTimeFilter,
    noPetFilter,
    cookingFilter,
    sortBy,
  ]);

  const handleApplyFilter = () => {
    if (priceRange[0] > priceRange[1]) {
      setPriceError('Khoảng giá không hợp lệ: Giá tối thiểu không được lớn hơn giá tối đa.');
      return;
    }
    setPriceError(null);
  };

  const handleResetFilter = () => {
    setKeyword('');
    setDistrict(undefined);
    setPostType('ALL');
    setPriceRange([1000000, 3500000]);
    setGenderFilter('ALL');
    setNoSmokingFilter(null);
    setSleepTimeFilter('ALL');
    setNoPetFilter(null);
    setCookingFilter(null);
    setPriceError(null);
  };

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
        price: `${(post.sharePrice / 1000000).toFixed(1)} tr/người`,
        address: post.areaName,
        imageUrl: post.roomInfo?.images?.[0] || post.authorAvatar,
        type: 'roommate',
        matchPercentage: post.matchPercentage,
        link: `/roommates/${post.id}`,
      };
    });
  }, [filteredAndSortedPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stay-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stay-text">
            Tìm Kiếm Phòng & Ở Ghép
          </h1>
          <p className="text-xs text-stay-text-secondary mt-0.5">
            Tìm kiếm phòng trọ và kết nối bạn ở ghép phù hợp theo vị trí, ngân sách và thói quen sinh hoạt.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/roommates/my-posts">
            <Button
              variant="outline"
              size="md"
              icon={<FileText className="w-4 h-4" />}
            >
              Tin đăng của tôi
            </Button>
          </Link>

          <Link to="/roommates/create">
            <Button
              variant="primary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Đăng tin tìm bạn
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Filter Box */}
      <SearchFilter
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        keyword={keyword}
        onKeywordChange={setKeyword}
        district={district}
        onDistrictChange={setDistrict}
        postType={postType}
        onPostTypeChange={setPostType}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        genderFilter={genderFilter}
        onGenderFilterChange={setGenderFilter}
        noSmokingFilter={noSmokingFilter}
        onNoSmokingFilterChange={setNoSmokingFilter}
        sleepTimeFilter={sleepTimeFilter}
        onSleepTimeFilterChange={setSleepTimeFilter}
        noPetFilter={noPetFilter}
        onNoPetFilterChange={setNoPetFilter}
        cookingFilter={cookingFilter}
        onCookingFilterChange={setCookingFilter}
        totalResults={filteredAndSortedPosts.length}
        priceError={priceError}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      {/* 3. View Switcher & Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-stay-card-bg border border-stay-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'table'
                ? 'bg-stay-primary text-white'
                : 'text-stay-text-secondary hover:text-stay-text'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Bảng tóm tắt
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'grid'
                ? 'bg-stay-primary text-white'
                : 'text-stay-text-secondary hover:text-stay-text'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Dạng lưới
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'map'
                ? 'bg-stay-primary text-white'
                : 'text-stay-text-secondary hover:text-stay-text'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Bản đồ số
          </button>
        </div>

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

      {/* 4. Main Results Presentation */}
      {isLoading ? (
        <div className="p-6 bg-stay-card-bg border border-stay-border rounded-xl">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : filteredAndSortedPosts.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-xl bg-stay-card-bg border border-stay-border space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-stay-text">Không tìm thấy bài đăng nào khớp bộ lọc</h3>
          <p className="text-xs text-stay-text-secondary max-w-md mx-auto">
            Không có bài đăng nào khớp 100% với các tiêu chí tìm kiếm gắt gao. Bạn có thể mở rộng khoảng giá hoặc điều chỉnh lại các tiêu chí lối sống.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilter}>
            Đặt lại tất cả bộ lọc
          </Button>
        </div>
      ) : (
        <>
          {viewMode === 'table' && <PostTable posts={filteredAndSortedPosts} />}
          {viewMode === 'grid' && <PostGrid posts={filteredAndSortedPosts} />}
          {viewMode === 'map' && <PostMap markers={mapMarkers} />}
        </>
      )}
    </div>
  );
};

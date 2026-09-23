import React, { useState } from 'react';
import {
  Button,
  Badge,
  Table,
  Tabs,
  Spinner,
  Skeleton,
  SkeletonCard,
  SkeletonText,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  MultiSelect,
  DatePicker,
  RangePicker,
  Tag,
  Switch,
  Checkbox,
  Empty,
  Upload,
  Breadcrumb,
  Pagination,
  Menu,
  Sidebar,
  Slider,
  Carousel,
  Collapse,
  Form,
  FormItem,
  FormGroup,
  FormRow,
  FormActions,
  SearchBar,
  type SearchSuggestionItem,
  StayConnectSearchBar,
  type SearchFilters,
} from '@/shared/components';
import {
  Sparkles,
  Plus,
  Send,
  Trash2,
  Filter,
  CheckCircle2,
  Home,
  Palette,
  Check,
  Settings,
  Users,
  FileText,
  MessageSquare,
  HelpCircle,
  Sliders,
  LayoutGrid,
  Layers,
  ShieldCheck,
  MapPin,
  Wifi,
  Wind,
  Refrigerator,
  Flame,
  Shirt,
  Compass,
  CheckSquare,
  Search,
} from 'lucide-react';
import { message } from 'antd';
import { useThemeStore } from '@/stores/useThemeStore';
import type { ThemePresetId } from '@/shared/constants/themes';

export const ComponentShowcase: React.FC = () => {
  const { currentThemeId, currentTheme, availableThemes, setTheme } = useThemeStore();
  const [spinLoading, setSpinLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // States for new interactive components
  const [selectedHabits, setSelectedHabits] = useState<(string | number)[]>(['gym', 'non_smoker']);
  const [selectedAmenities, setSelectedAmenities] = useState<(string | number)[]>(['wifi', 'ac', 'fridge']);
  const [priceRange, setPriceRange] = useState<[number, number]>([2000000, 6000000]);
  const [matchTolerance, setMatchTolerance] = useState<number>(85);
  const [menuSelectedKey, setMenuSelectedKey] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [formInstance] = Form.useForm();
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Search Bar States
  const [searchDemoQuery, setSearchDemoQuery] = useState<string>('');
  const [searchDemoLoading, setSearchDemoLoading] = useState<boolean>(false);
  const [selectedSearchTags, setSelectedSearchTags] = useState<string[]>(['near_uni']);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Phòng trọ Cầu Giấy dưới 4 triệu',
    'Tìm bạn nữ ở ghép Bách Khoa',
    'Studio full nội thất Đống Đa',
  ]);

  const searchSuggestions: SearchSuggestionItem[] = [
    { id: 1, label: 'Căn hộ Studio Ban Công Kính', sublabel: 'Cầu Giấy, Hà Nội • 4.5tr/tháng', category: 'Phòng trọ', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 2, label: 'Tìm bạn nam ở ghép ngành IT', sublabel: 'Gần ĐH Bách Khoa • 2tr/tháng', category: 'Ở ghép', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 3, label: 'Phòng trọ gần ĐH Quốc Gia Hà Nội', sublabel: 'Xuân Thủy, Dịch Vọng Hậu', category: 'Khu vực', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 4, label: 'Chung cư mini chính chủ có thang máy', sublabel: 'Mỹ Đình • Giờ giấc tự do', category: 'Chính chủ', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const searchFilterTags = [
    { label: 'Gần trường ĐH', value: 'near_uni', count: 42 },
    { label: 'Có ban công', value: 'balcony', count: 18 },
    { label: 'Không chung chủ', value: 'private', count: 35 },
    { label: 'Nuôi thú cưng', value: 'pet', count: 12 },
    { label: 'Giá dưới 3 triệu', value: 'under_3m', count: 28 },
  ];

  const handleSearchExecute = (val: string) => {
    if (!val.trim()) return;
    setSearchDemoLoading(true);
    setTimeout(() => {
      setSearchDemoLoading(false);
      message.success(`Đã tìm kiếm: "${val}"`);
      if (!recentSearches.includes(val)) {
        setRecentSearches((prev) => [val, ...prev.slice(0, 4)]);
      }
    }, 600);
  };

  // Sample MultiSelect Options
  const habitOptions = [
    { value: 'early_bird', label: 'Dậy sớm (6h sáng)', emoji: '🌅', badge: 'Sinh hoạt' },
    { value: 'night_owl', label: 'Cú đêm (sau 0h)', emoji: '🌙', badge: 'Sinh hoạt' },
    { value: 'gym', label: 'Thích tập Gym / Thể thao', emoji: '💪', badge: 'Sở thích' },
    { value: 'non_smoker', label: 'Không hút thuốc lá', emoji: '🚭', badge: 'Bắt buộc' },
    { value: 'cook_daily', label: 'Nấu ăn tại phòng mỗi ngày', emoji: '🍳', badge: 'Ăn uống' },
    { value: 'quiet', label: 'Thích không gian yên tĩnh', emoji: '🤫', badge: 'Tính cách' },
    { value: 'pet_friendly', label: 'Yêu quý chó mèo', emoji: '🐱', badge: 'Thú cưng' },
  ];

  const amenityOptions = [
    { value: 'wifi', label: 'Internet / Wifi tốc độ cao', icon: <Wifi className="w-3.5 h-3.5" /> },
    { value: 'ac', label: 'Điều hòa nhiệt độ', icon: <Wind className="w-3.5 h-3.5" /> },
    { value: 'water_heater', label: 'Bình nóng lạnh', icon: <Flame className="w-3.5 h-3.5" /> },
    { value: 'fridge', label: 'Tủ lạnh riêng', icon: <Refrigerator className="w-3.5 h-3.5" /> },
    { value: 'washing_machine', label: 'Máy giặt chung / riêng', icon: <Shirt className="w-3.5 h-3.5" /> },
    { value: 'balcony', label: 'Ban công thoáng mát', icon: <Compass className="w-3.5 h-3.5" /> },
  ];

  // Sample Carousel Slide Data
  const carouselSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      tag: 'Phòng Mới Đăng • Đã Xác Minh',
      title: 'Căn hộ Studio Ban Công Kính – Cầu Giấy',
      description: 'Đầy đủ nội thất cao cấp, bếp từ, máy giặt riêng, cách ĐH Quốc Gia 500m. Giá thuê 4.500.000 đ/tháng.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      tag: 'Ghép Đôi 96% Match',
      title: 'Tìm 1 Bạn Nữ Ở Ghép Chung Cư Mini – Hai Bà Trưng',
      description: 'Phòng 2 người rộng 35m2, sinh viên/nhân viên văn phòng thân thiện, thích yên tĩnh sạch sẽ.',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      tag: 'Chính Chủ Miễn Trung Gian',
      title: 'Căn hộ 1 Khách 1 Ngủ Riêng Biệt – Mỹ Đình',
      description: 'Khóa vân tay an ninh 24/7, giờ giấc tự do, có thang máy và hầm để xe rộng rãi.',
    },
  ];

  // Sample Accordion FAQ Data
  const faqItems = [
    {
      key: '1',
      icon: <HelpCircle className="w-4 h-4" />,
      label: '1. Quy trình thuật toán ghép đôi (Lifestyle Matching) hoạt động ra sao?',
      children: (
        <p>
          Hệ thống phân tích mức độ hòa hợp dựa trên 5 chiều không gian: Giờ giấc sinh hoạt (Dậy sớm/Cú đêm), Vệ sinh phòng, Tần suất nấu ăn, Tiêu chuẩn hút thuốc và Bạn bè ghé thăm. Thuật toán tính toán điểm số từ 0% - 100% để gợi ý bạn cùng phòng lý tưởng nhất.
        </p>
      ),
      extra: <Tag status="match">Độ chính xác 94%</Tag>,
    },
    {
      key: '2',
      icon: <ShieldCheck className="w-4 h-4" />,
      label: '2. Làm thế nào để StayConnect xác thực phòng trọ chính chủ và an toàn?',
      children: (
        <p>
          Mọi tin đăng có huy hiệu <strong className="text-stay-secondary">Xác Thực (Verified)</strong> đều đã được đội ngũ StayConnect kiểm duyệt hồ sơ pháp lý căn hộ, CCCD chủ nhà và hình ảnh chụp thực tế tại chỗ. Người thuê được cam kết hoàn 100% cọc nếu phòng thực tế sai lệch.
        </p>
      ),
      extra: <Tag status="verified">Bảo chứng 100%</Tag>,
    },
    {
      key: '3',
      icon: <FileText className="w-4 h-4" />,
      label: '3. Hợp đồng thuê phòng điện tử và quản lý chỉ số điện nước trên ứng dụng?',
      children: (
        <p>
          StayConnect tích hợp tính năng ký số hợp đồng thuê nhà trực tuyến chuẩn pháp lý, kèm hệ thống theo dõi hóa đơn điện nước, thanh toán trực tiếp qua cổng thanh toán liên kết ngân hàng mà không cần tiền mặt.
        </p>
      ),
    },
  ];

  // Sample Table Data
  const tableColumns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (id: number) => <span className="font-mono text-stay-text-muted">#{id}</span>,
    },
    {
      title: 'Tên đối tượng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row: any) => (
        <div>
          <div className="font-semibold text-stay-text">{name}</div>
          <div className="text-[11px] text-stay-text-muted">{row.subtext}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        if (type === 'Phòng trọ') return <Tag status="available">{type}</Tag>;
        if (type === 'Ở ghép') return <Tag status="match">{type}</Tag>;
        return <Tag status="verified">{type}</Tag>;
      },
    },
    {
      title: 'Giá niêm yết',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => <span className="font-bold text-stay-primary">{price}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isVerified = status === 'Đã duyệt';
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isVerified ? 'text-stay-secondary' : 'text-amber-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-stay-secondary' : 'bg-amber-500'}`} />
            {status}
          </span>
        );
      },
    },
  ];

  const tableData = [
    { key: '1', id: 101, name: 'Căn hộ Studio Cầu Giấy', subtext: 'Số 12 ngõ 165 Cầu Giấy, Hà Nội', type: 'Phòng trọ', price: '4.200.000 đ', status: 'Đã duyệt' },
    { key: '2', id: 102, name: 'Tìm bạn nữ ở ghép Bách Khoa', subtext: 'Đại La, Hai Bà Trưng, Hà Nội', type: 'Ở ghép', price: '1.800.000 đ', status: 'Đã duyệt' },
    { key: '3', id: 103, name: 'Chung cư mini Nam Từ Liêm', subtext: 'Đình Thôn, Mỹ Đình, Hà Nội', type: 'Phòng trọ', price: '3.500.000 đ', status: 'Đã duyệt' },
    { key: '4', id: 104, name: 'Phòng khép kín ban công Đống Đa', subtext: 'Chùa Láng, Đống Đa, Hà Nội', type: 'Phòng trọ', price: '2.900.000 đ', status: 'Chờ duyệt' },
    { key: '5', id: 105, name: 'Bạn nam ghép phòng IT/Công nghệ', subtext: 'Trần Đại Nghĩa, Hà Nội', type: 'Ở ghép', price: '2.000.000 đ', status: 'Đã duyệt' },
  ];

  // Form Submit Handler
  const handleFormSubmit = (_values: any) => {
    setFormSubmitting(true);
    setTimeout(() => {
      setFormSubmitting(false);
      message.success('Đã gửi thông tin đăng ký thành công! Hệ thống đang quét ghép đôi tự động.');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Breadcrumb Navigation Demo */}
      <Breadcrumb
        items={[
          { title: <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Trang chủ</span> },
          { title: 'Quản trị hệ thống' },
          { title: 'Thư viện UI Components (Ant Design & StayConnect)' },
        ]}
      />

      {/* Header Banner */}
      <div className="bg-stay-card-bg rounded-3xl p-8 border border-stay-border shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stay-primary-subtle text-stay-primary text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Bộ Shared UI Components StayConnect
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stay-text tracking-tight">
              Hệ Thống Thành Phần Giao Diện Chung
            </h1>
            <p className="text-sm text-stay-text-secondary mt-1 max-w-2xl">
              Đồng nhất 100% trong 1 file canonical duy nhất cho từng component, tích hợp Ant Design 6 và hệ thống đổi Theme động 1-Click bằng CSS Variables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="verified">Chuẩn Ant Design 6</Badge>
            <Badge variant="match">1-Click Multi-Theme</Badge>
          </div>
        </div>
      </div>

      {/* 0. Bảng Combo Màu Theme (1-Click Switch Theme System) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-stay-primary" />
              <span>0. Đổi Combo Màu Giao Diện (1-Click Theme Switcher)</span>
            </CardTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stay-primary-subtle text-stay-primary">
              Đang dùng: {currentTheme.name}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-stay-text-secondary mb-4">
            Nhấp chuột vào bất kỳ combo màu nào dưới đây để đổi toàn bộ giao diện (Nút bấm, Tabs, Bảng, Thanh tìm kiếm, Thẻ card, Ant Design tokens) ngay lập tức:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {availableThemes.map((theme) => {
              const isSelected = theme.id === currentThemeId;
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id as ThemePresetId);
                    message.success(`Đã chuyển sang bảng màu: ${theme.name}`);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${isSelected
                    ? 'border-stay-primary bg-stay-primary-subtle/40 shadow-sm ring-2 ring-stay-primary/30'
                    : 'border-stay-border bg-stay-card-bg hover:border-stay-primary/50 hover:shadow-xs'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Swatch color dots */}
                    <div className="flex items-center -space-x-1.5 mb-2">
                      <span
                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: theme.preview.primary }}
                        title="Primary Color"
                      />
                      <span
                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: theme.preview.secondary }}
                        title="Secondary Color"
                      />
                      <span
                        className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: theme.preview.accent }}
                        title="Accent Color"
                      />
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stay-primary bg-stay-bg-app px-2 py-0.5 rounded-full shadow-2xs border border-stay-border">
                        <Check className="w-3 h-3 stroke-[3]" /> Đang chọn
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-stay-text-muted group-hover:text-stay-primary transition-colors">
                        1-Click Chọn
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-stay-text leading-tight mt-1 flex items-center gap-1.5">
                    <span>{theme.name}</span>
                    {theme.colors.isDark && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-100 font-semibold">
                        Dark
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-stay-text-secondary mt-1 leading-normal line-clamp-2">
                    {theme.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-stay-text-muted">
                    <span className="px-1.5 py-0.5 rounded bg-stay-bg-app border border-stay-border-subtle">{theme.preview.primary}</span>
                    <span className="px-1.5 py-0.5 rounded bg-stay-bg-app border border-stay-border-subtle">{theme.preview.secondary}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 1. Buttons & Badges */}
      <Card>
        <CardHeader>
          <CardTitle>1. Nút Bấm (Buttons) & Huy Hiệu (Badges)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-stay-text-secondary mb-3">Các biến thể Button chuẩn (Primary, Secondary, Outline, Ghost, Danger):</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                Primary Button
              </Button>
              <Button variant="secondary" icon={<CheckCircle2 className="w-4 h-4" />}>
                Xác Thực (Verified)
              </Button>
              <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
                Lọc Nâng Cao
              </Button>
              <Button variant="ghost">Nút Trong Suốt</Button>
              <Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
                Xóa
              </Button>
              <Button isLoading variant="primary">
                Đang xử lý
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-stay-border-subtle">
            <p className="text-xs text-stay-text-secondary mb-3">Huy hiệu trạng thái (Badges) chuẩn StayConnect Poster:</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="verified">Đã Xác Minh Chủ Nhà</Badge>
              <Badge variant="match">94% Tương Thích Gu Sống</Badge>
              <Badge variant="primary">Gợi Ý Nổi Bật</Badge>
              <Badge variant="secondary">Phòng Còn Trống</Badge>
              <Badge variant="outline">Sinh Viên IT</Badge>
              <Badge variant="neutral">Cầu Giấy, Hà Nội</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Thanh Tìm Kiếm Đa Năng & Thanh Tìm Kiếm Hero (SearchBar & StayConnectSearchBar) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-stay-primary" />
              <span>2. Thanh Tìm Kiếm Đa Năng (SearchBar) & Thanh Tìm Kiếm Hero</span>
            </CardTitle>
            <Badge variant="primary">SearchBar Component Mới</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* A. Universal SearchBar Component */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stay-text uppercase tracking-wider">
                A. Thanh tìm kiếm thông minh (SearchBar - Autocomplete, Shortcut Ctrl+K, Gợi ý & Lịch sử):
              </span>
              <span className="text-xs text-stay-text-secondary hidden sm:inline">
                Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-stay-bg-app border border-stay-border text-[10px] font-mono">Ctrl + K</kbd> để tìm kiếm nhanh
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
              <SearchBar
                value={searchDemoQuery}
                onChange={setSearchDemoQuery}
                onSearch={handleSearchExecute}
                onClear={() => setSearchDemoQuery('')}
                isLoading={searchDemoLoading}
                placeholder="Tìm phòng trọ, khu vực, trường ĐH, bạn ở ghép (thử gõ 'Cầu Giấy' hoặc 'Studio')..."
                size="lg"
                shortcut="Ctrl + K"
                showButton
                buttonText="Tìm Kiếm"
                suggestions={searchSuggestions}
                recentSearches={recentSearches}
                onSelectRecentSearch={(term) => handleSearchExecute(term)}
                onClearRecentSearches={() => setRecentSearches([])}
                tags={searchFilterTags}
                selectedTags={selectedSearchTags}
                onTagToggle={(tagVal) => {
                  setSelectedSearchTags((prev) =>
                    prev.includes(tagVal) ? prev.filter((t) => t !== tagVal) : [...prev, tagVal]
                  );
                }}
              />
            </div>

            {/* Size & Variant Styles Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stay-text">Variant: Pill (Bo tròn mềm mại)</span>
                <SearchBar
                  size="md"
                  variant="pill"
                  placeholder="Tìm kiếm phong cách Pill..."
                  showButton
                  buttonVariant="outline"
                  buttonText="Tìm"
                  onSearch={handleSearchExecute}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stay-text">Variant: Filled (Nền xám nhạt)</span>
                <SearchBar
                  size="md"
                  variant="filled"
                  placeholder="Tìm kiếm phong cách Filled..."
                  onSearch={handleSearchExecute}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-stay-text">Size: Small (Nhỏ gọn cho Header/Sidebar)</span>
                <SearchBar
                  size="sm"
                  placeholder="Tìm nhanh trong bảng..."
                  allowClear
                  onSearch={handleSearchExecute}
                />
              </div>
            </div>
          </div>

          {/* B. Domain Hero SearchBar */}
          <div className="pt-6 border-t border-stay-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stay-text uppercase tracking-wider">
                B. Thanh tìm kiếm trung tâm Hero StayConnect (StayConnectSearchBar):
              </span>
              <Badge variant="verified">Chuẩn Figma Design</Badge>
            </div>
            <p className="text-xs text-stay-text-secondary">
              Tích hợp Tabs chuyển đổi loại tìm kiếm (Phòng trọ / Ở ghép), chọn khu vực, ngân sách, giới tính và bộ lọc thói quen sinh hoạt (Habits):
            </p>

            <StayConnectSearchBar
              onSearch={(filters: SearchFilters) => {
                message.success(
                  `Đang lọc [${filters.tab === 'rooms' ? 'Phòng trọ' : 'Ở ghép'}] tại: ${filters.location || 'Tất cả'} • Ngân sách: ${filters.budget || 'Tự do'}`
                );
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. MultiSelect & Tag Selection (MỚI THEO YÊU CẦU) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-stay-primary" />
              <span>3. Lựa Chọn Nhiều Mục (Multi-Select & Tag Filter)</span>
            </CardTitle>
            <Badge variant="match">MultiSelect Component Mới</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-stay-text-secondary">
            Component <code>MultiSelect</code> cho phép chọn nhiều giá trị với chip tag động, tìm kiếm trực quan, nút xóa nhanh (Clearable) và đồng bộ màu theme 100%:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <MultiSelect
                label="Thói quen sinh hoạt mong muốn (Ghép đôi)"
                placeholder="Chọn một hoặc nhiều thói quen..."
                options={habitOptions}
                value={selectedHabits}
                onChange={setSelectedHabits}
                helperText="Chọn các thói quen bạn muốn bạn cùng phòng có để tối ưu tỷ lệ tương thích"
              />
              <div className="text-xs text-stay-text-secondary pt-1">
                Đã chọn: <span className="font-semibold text-stay-primary">{selectedHabits.length} thói quen</span>
              </div>
            </div>

            <div className="space-y-3">
              <MultiSelect
                label="Tiện ích phòng trọ bắt buộc"
                placeholder="Chọn tiện ích phòng..."
                options={amenityOptions}
                value={selectedAmenities}
                onChange={setSelectedAmenities}
                helperText="Chỉ hiển thị các phòng có đủ tất cả các tiện ích đã chọn"
              />
              <div className="text-xs text-stay-text-secondary pt-1">
                Đã chọn: <span className="font-semibold text-stay-primary">{selectedAmenities.length} tiện ích</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Slider & Carousel Slide (MỚI THEO YÊU CẦU) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-stay-primary" />
              <span>4. Thanh Trượt (Slider Range) & Trình Chiếu Ảnh (Carousel Slide)</span>
            </CardTitle>
            <Badge variant="verified">Slider & Carousel Mới</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sliders Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border-subtle space-y-4">
              <Slider
                range
                min={1000000}
                max={15000000}
                step={500000}
                value={priceRange}
                onChange={(val) => setPriceRange(val as [number, number])}
                label="Khoảng giá thuê mong muốn (Slider Range)"
                valueDisplay={`${(priceRange[0] / 1000000).toFixed(1)}tr - ${(priceRange[1] / 1000000).toFixed(1)}tr đ/tháng`}
                prefix={<span className="font-mono text-stay-text-muted">1tr</span>}
                suffix={<span className="font-mono text-stay-text-muted">15tr</span>}
                helperText="Kéo hai đầu mút để lọc khoảng giá phù hợp với ngân sách của bạn"
              />
            </div>

            <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border-subtle space-y-4">
              <Slider
                min={50}
                max={100}
                step={1}
                value={matchTolerance}
                onChange={(val) => setMatchTolerance(val as number)}
                label="Mức độ tương thích ghép đôi tối thiểu"
                valueDisplay={`${matchTolerance}% Match`}
                prefix={<span className="font-mono text-stay-text-muted">50%</span>}
                suffix={<span className="font-mono text-stay-text-muted">100%</span>}
                helperText="Chỉ ghép nối với những hồ sơ bạn cùng phòng có điểm tương thích vượt ngưỡng này"
              />
            </div>
          </div>

          {/* Carousel Slide Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stay-text uppercase tracking-wider">
                Trình chiếu ảnh phòng thực tế (Carousel Slide):
              </span>
              <span className="text-xs text-stay-text-secondary">Tự động chuyển slide • Có nút điều hướng</span>
            </div>
            <Carousel slides={carouselSlides} aspectRatio="banner" className="max-w-4xl mx-auto" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Form Controls & Validation (MỚI THEO YÊU CẦU) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-stay-primary" />
              <span>5. Biểu Mẫu Toàn Diện (Form, FormItem & Validation)</span>
            </CardTitle>
            <Badge variant="primary">Form Controls Chuẩn</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-stay-text-secondary mb-5">
            Component <code>Form</code> chuẩn tích hợp layout responsive, xác thực dữ liệu (Validation Rules), thông báo lỗi và gắn kết trực tiếp với Ant Design tokens:
          </p>

          <Form
            form={formInstance}
            layout="vertical"
            onFinish={handleFormSubmit}
            initialValues={{
              fullName: 'Trần Quang Chiến',
              email: 'quangchien@stayconnect.vn',
              role: 'student',
              targetDistrict: 'cau_giay',
              habits: ['gym', 'non_smoker'],
              budgetMin: 2000000,
              budgetMax: 5000000,
              allowPets: false,
              nonSmokingRequired: true,
            }}
            className="space-y-6"
          >
            <FormGroup
              title="1. Thông Tin Người Tìm Phòng / Người Đăng Tin"
              description="Họ tên và thông tin liên hệ xác thực để gửi thông báo kết nối"
              icon={<Users className="w-4 h-4" />}
            >
              <FormRow cols={2}>
                <FormItem
                  label="Họ và tên đầy đủ"
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn!' }]}
                >
                  <Input placeholder="Ví dụ: Nguyễn Văn A" />
                </FormItem>

                <FormItem
                  label="Địa chỉ Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { type: 'email', message: 'Email không đúng định dạng!' },
                  ]}
                >
                  <Input placeholder="name@example.com" />
                </FormItem>
              </FormRow>

              <FormRow cols={2}>
                <FormItem label="Số điện thoại liên hệ" name="phone">
                  <Input placeholder="0987 654 321" />
                </FormItem>

                <FormItem label="Khu vực quận/huyện ưu tiên" name="targetDistrict">
                  <Select
                    options={[
                      { value: 'cau_giay', label: 'Quận Cầu Giấy (Gần ĐH Quốc Gia)' },
                      { value: 'dong_da', label: 'Quận Đống Đa (Gần ĐH Ngoại Thương)' },
                      { value: 'hai_ba_trung', label: 'Quận Hai Bà Trưng (Gần Bách Khoa)' },
                      { value: 'nam_tu_liem', label: 'Quận Nam Từ Liêm (Mỹ Đình)' },
                    ]}
                  />
                </FormItem>
              </FormRow>
            </FormGroup>

            <FormGroup
              title="2. Tiêu Chí Ở Ghép & Thói Quen Sinh Hoạt"
              description="Cấu hình bộ lọc ghép đôi thông minh để thuật toán ghép nối bạn cùng gu"
              icon={<Compass className="w-4 h-4" />}
            >
              <FormItem label="Thói quen sinh hoạt cá nhân" name="habits">
                <MultiSelect options={habitOptions} placeholder="Chọn thói quen sống của bạn..." />
              </FormItem>

              <FormRow cols={2}>
                <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stay-text block">Cho phép nuôi thú cưng</span>
                    <span className="text-[11px] text-stay-text-secondary">Chó/mèo/thú cảnh trong phòng</span>
                  </div>
                  <Switch defaultChecked={false} />
                </div>

                <div className="p-3.5 rounded-xl bg-stay-bg-app border border-stay-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stay-text block">Yêu cầu tuyệt đối không hút thuốc</span>
                    <span className="text-[11px] text-stay-text-secondary">Bảo đảm không gian trong lành</span>
                  </div>
                  <Checkbox defaultChecked={true} label="Bắt buộc" />
                </div>
              </FormRow>
            </FormGroup>

            <FormActions align="right">
              <Button variant="outline" htmlType="button" onClick={() => formInstance.resetFields()}>
                Làm mới biểu mẫu
              </Button>
              <Button variant="primary" htmlType="submit" isLoading={formSubmitting} icon={<Send className="w-4 h-4" />}>
                Lưu và Bắt Đầu Ghép Đôi
              </Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>

      {/* 6. Collapse & Expand Accordion (MỚI THEO YÊU CẦU) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-stay-primary" />
              <span>6. Mở Rộng / Thu Gọn (Collapse & Accordion Expand)</span>
            </CardTitle>
            <Badge variant="secondary">Accordion Mới</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-stay-text-secondary mb-2">
            Component <code>Collapse</code> / <code>Accordion</code> mở rộng nội dung mượt mà, hỗ trợ icon tùy biến, thẻ huy hiệu đính kèm và chế độ card riêng biệt:
          </p>

          <Collapse items={faqItems} variant="card" defaultActiveKey={['1']} />
        </CardContent>
      </Card>

      {/* 7. Menu & Sidebar (MỚI THEO YÊU CẦU) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-stay-primary" />
              <span>7. Thực Đơn Điều Hướng (Menu) & Thanh Bên Tương Tác (Sidebar)</span>
            </CardTitle>
            <Badge variant="primary">Menu & Sidebar Mới</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-stay-text-secondary">
            Thanh bên (Sidebar) thu gọn / mở rộng mượt mà, hỗ trợ menu lồng nhau, trạng thái Active highlight và slot Header/Footer linh hoạt:
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Interactive Sidebar Demo */}
            <div className="lg:col-span-1 rounded-2xl border border-stay-border overflow-hidden bg-stay-card-bg shadow-sm">
              <Sidebar
                collapsed={sidebarCollapsed}
                onCollapse={setSidebarCollapsed}
                header={
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-stay-primary flex items-center justify-center text-white font-bold shadow-xs">
                      SC
                    </span>
                    {!sidebarCollapsed && (
                      <div>
                        <span className="font-bold text-xs text-stay-text block">StayConnect OS</span>
                        <span className="text-[10px] text-stay-secondary font-medium">Phiên bản 2.0</span>
                      </div>
                    )}
                  </div>
                }
                menuItems={[
                  { key: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Bảng tổng quan' },
                  { key: 'rooms', icon: <Compass className="w-4 h-4" />, label: 'Quản lý phòng trọ' },
                  { key: 'lifestyle', icon: <Users className="w-4 h-4" />, label: 'Ghép đôi bạn ở ghép' },
                  { key: 'contracts', icon: <FileText className="w-4 h-4" />, label: 'Hợp đồng điện tử' },
                  { key: 'messages', icon: <MessageSquare className="w-4 h-4" />, label: 'Tin nhắn trực tuyến' },
                  { key: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Cài đặt hệ thống' },
                ]}
                selectedKey={menuSelectedKey}
                onMenuClick={({ key }) => {
                  setMenuSelectedKey(key);
                  message.info(`Đã chọn mục menu: ${key}`);
                }}
                footer={
                  !sidebarCollapsed && (
                    <div className="p-2 bg-stay-bg-app rounded-xl border border-stay-border-subtle flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-stay-primary-subtle text-stay-primary font-bold flex items-center justify-center text-xs">
                        QC
                      </span>
                      <div className="text-left overflow-hidden">
                        <span className="text-xs font-semibold text-stay-text block truncate">Trần Quang Chiến</span>
                        <span className="text-[10px] text-stay-secondary font-medium">Administrator</span>
                      </div>
                    </div>
                  )
                }
              />
            </div>

            {/* Menu Variants Demo */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-stay-bg-app border border-stay-border-subtle space-y-3">
                <span className="text-xs font-bold text-stay-text block uppercase tracking-wider">
                  Menu ngang (Horizontal Mode) & Menu dạng thẻ (Card/Pills Variant):
                </span>
                <Menu
                  mode="horizontal"
                  variant="card"
                  selectedKeys={[menuSelectedKey]}
                  onClick={({ key }) => setMenuSelectedKey(key)}
                  items={[
                    { key: 'dashboard', icon: <Home className="w-4 h-4" />, label: 'Tổng quan' },
                    { key: 'rooms', icon: <Compass className="w-4 h-4" />, label: 'Phòng trọ' },
                    { key: 'lifestyle', icon: <Users className="w-4 h-4" />, label: 'Ở ghép' },
                    { key: 'contracts', icon: <FileText className="w-4 h-4" />, label: 'Hợp đồng' },
                  ]}
                />
              </div>

              <div className="p-4 rounded-2xl bg-stay-card-bg border border-stay-border space-y-2">
                <span className="text-xs font-semibold text-stay-text block">
                  Trạng thái mục đang chọn:
                </span>
                <p className="text-xs text-stay-text-secondary">
                  Key đang chọn: <span className="font-mono font-bold text-stay-primary px-2 py-0.5 rounded bg-stay-primary-subtle border border-stay-border-subtle">{menuSelectedKey}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Input Controls, DatePicker & Select */}
      <Card>
        <CardHeader>
          <CardTitle>8. Ô Nhập Liệu (Input), Lựa Chọn (Select) & Chọn Ngày (DatePicker)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <Input label="Họ và tên người dùng" placeholder="Nhập họ và tên..." />
            <Input label="Địa chỉ Email" placeholder="name@domain.com" helperText="Email dùng để nhận thông báo phòng" />
            <Input label="Trường có lỗi (Validation Error)" defaultValue="Dữ liệu không hợp lệ" error="Độ dài mật khẩu phải từ 8 ký tự trở lên" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-4 border-t border-stay-border-subtle">
            <Select
              label="Chọn khu vực trường Đại học"
              options={[
                { value: 'dhqg', label: 'Đại Học Quốc Gia Hà Nội' },
                { value: 'bk', label: 'Đại Học Bách Khoa Hà Nội' },
                { value: 'neu', label: 'Đại Học Kinh Tế Quốc Dân' },
                { value: 'ftu', label: 'Đại Học Ngoại Thương' },
              ]}
            />
            <DatePicker label="Ngày bắt đầu vào ở" />
            <RangePicker label="Khoảng thời gian hợp đồng" />
          </div>
        </CardContent>
      </Card>

      {/* 9. Tabs Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>9. Điều Hướng Tab (Tabs Variants)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs text-stay-text-secondary mb-2">Variant: Pills (Viên thuốc hiện đại):</p>
            <Tabs
              variant="pills"
              items={[
                { key: 'all', label: 'Tất cả phòng (142)' },
                { key: 'verified', label: 'Chính chủ xác thực (89)' },
                { key: 'match', label: 'Độ tương thích cao >90% (24)' },
                { key: 'studio', label: 'Căn hộ Studio (35)' },
              ]}
            />
          </div>

          <div className="pt-4 border-t border-stay-border-subtle">
            <p className="text-xs text-stay-text-secondary mb-2">Variant: Line / Bordered chuẩn:</p>
            <Tabs
              variant="line"
              items={[
                { key: 'info', label: 'Thông tin phòng trọ' },
                { key: 'lifestyle', label: 'Thói quen bạn ở ghép' },
                { key: 'reviews', label: 'Đánh giá & Nhận xét (18)' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* 10. Data Table & Pagination */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>10. Bảng Dữ Liệu (Data Table) & Phân Trang (Pagination)</CardTitle>
            <span className="text-xs text-stay-text-secondary font-semibold">5 bản ghi hiển thị</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table
            columns={tableColumns}
            dataSource={tableData}
            striped
            pagination={false}
          />
          <div className="pt-2 border-t border-stay-border-subtle flex items-center justify-between">
            <span className="text-xs text-stay-text-secondary">Demo component Pagination độc lập cho Grid thẻ:</span>
            <Pagination current={currentPage} total={50} pageSize={10} onChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>

      {/* 11. Upload & Empty State */}
      <Card>
        <CardHeader>
          <CardTitle>11. Tải Lên Tệp (Upload / Dragger) & Trạng Thái Rỗng (Empty)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider mb-2">
                Tải lên ảnh phòng trọ hoặc CCCD (Upload.Dragger):
              </p>
              <Upload.Dragger
                title="Kéo thả ảnh phòng trọ vào đây"
                hint="Hỗ trợ tải lên tối đa 10 ảnh định dạng JPG/PNG (dưới 5MB/ảnh)"
                beforeUpload={() => {
                  message.success('Đã tải ảnh lên thành công!');
                  return false;
                }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider mb-2">
                Minh họa trạng thái rỗng (Empty):
              </p>
              <div className="bg-stay-bg-app rounded-2xl border border-dashed border-stay-border p-4">
                <Empty
                  description="Chưa có tin nhắn nào từ bạn ở ghép"
                  action={<Button variant="outline" size="sm">Bắt đầu tìm kiếm ngay</Button>}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12. Spinners & Skeleton Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>12. Vòng Xoay (Spin / Spinner) & Khung Xương (Skeleton)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-xs text-stay-text-secondary mb-2">StayConnect Spinners:</p>
              <div className="flex items-center gap-4">
                <Spinner size="sm" label="Đang tải dữ liệu..." />
                <Spinner size="md" label="Đang tải dữ liệu..." />
                <Spinner size="lg" color="secondary" label="Đang tải dữ liệu..." />
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSpinLoading(!spinLoading);
                message.info(spinLoading ? 'Đã tắt loading' : 'Bật trạng thái loading');
              }}
            >
              Chuyển đổi trạng thái Skeleton
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-4 border-t border-stay-border-subtle">
            <div>
              <p className="text-xs font-semibold text-stay-text-secondary mb-2">Skeleton Text:</p>
              <SkeletonText lines={4} />
            </div>
            <div>
              <p className="text-xs font-semibold text-stay-text-secondary mb-2">Skeleton Avatar:</p>
              <Skeleton type="avatar" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stay-text-secondary mb-2">Skeleton Card:</p>
              <SkeletonCard />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentShowcase;

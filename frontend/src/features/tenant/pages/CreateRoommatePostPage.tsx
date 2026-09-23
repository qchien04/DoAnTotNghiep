import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoommatePosts } from '@/shared/hooks';
import {
  Card,
  Button,
  Input,
  Select,
  Form,
  HabitChip,
  Slider,
  Upload,
} from '@/shared/components';
import {
  Sparkles,
  Home,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import { message } from 'antd';
import { CreatePostWithRoomDto, CreatePostWithoutRoomDto, RoommatePostType, LifestyleSurvey } from '@/shared/types/tenant';

export const CreateRoommatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const { createPostWithRoom, isCreatingWithRoom, createPostWithoutRoom, isCreatingWithoutRoom } = useRoommatePosts();
  const [form] = Form.useForm();
  const [postType, setPostType] = useState<RoommatePostType>('HAS_ROOM');

  // Selected habits state
  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    'Không hút thuốc',
    'Ngủ sau 24h',
    'Sạch sẽ, ngăn nắp',
  ]);

  const habitOptions = [
    { label: 'Không hút thuốc', emoji: '🚭' },
    { label: 'Ngủ sau 24h', emoji: '🌙' },
    { label: 'Dậy sớm trước 7h', emoji: '☀️' },
    { label: 'Nuôi thú cưng', emoji: '🐾' },
    { label: 'Nấu ăn thường xuyên', emoji: '🍳' },
    { label: 'Thích yên tĩnh', emoji: '🎧' },
    { label: 'Sạch sẽ, ngăn nắp', emoji: '✨' },
    { label: 'Thỉnh thoảng dẫn bạn về', emoji: '👥' },
  ];

  const toggleHabit = (habit: string) => {
    if (selectedHabits.includes(habit)) {
      setSelectedHabits(selectedHabits.filter((h) => h !== habit));
    } else {
      setSelectedHabits([...selectedHabits, habit]);
    }
  };

  const defaultLifestyle: LifestyleSurvey = {
    genderPreference: 'ANY',
    sleepTime: 'AFTER_24H',
    smoking: !selectedHabits.includes('Không hút thuốc'),
    petFriendly: selectedHabits.includes('Nuôi thú cưng'),
    cookingFrequency: selectedHabits.includes('Nấu ăn thường xuyên') ? 'DAILY' : 'SOMETIMES',
    cleanlinessLevel: 'VERY_CLEAN',
    personality: 'BALANCED',
    guestsAllowed: 'WEEKENDS_ONLY',
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (postType === 'HAS_ROOM') {
        const payload: CreatePostWithRoomDto = {
          title: values.title,
          isExistingLinkedRoom: false,
          roomAddress: values.areaName,
          district: values.district,
          city: 'Hà Nội',
          totalRoomPrice: Number(values.sharePrice) * Number(values.targetMembers || 2),
          sharePrice: Number(values.sharePrice),
          neededRoommates: Number(values.targetMembers || 2) - 1,
          amenities: ['Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Ban công'],
          images: [
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          ],
          lifestyle: defaultLifestyle,
          description: values.description,
        };
        await createPostWithRoom(payload);
      } else {
        const payload: CreatePostWithoutRoomDto = {
          title: values.title,
          centerAddress: values.areaName,
          latitude: 21.0285,
          longitude: 105.789,
          radiusKm: Number(values.searchRadiusKm || 3),
          budgetMax: Number(values.sharePrice),
          neededRoommates: Number(values.targetMembers || 2),
          lifestyle: defaultLifestyle,
          description: values.description,
        };
        await createPostWithoutRoom(payload);
      }

      message.success('Đăng bài tìm bạn ở ghép thành công! Đã kích hoạt thuật toán gợi ý tương thích.');
      navigate('/roommates');
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Back Navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stay-text-secondary hover:text-stay-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
          Đăng Tin Tìm Bạn Ở Ghép & Nhóm Thuê Phòng
        </h1>
        <p className="text-sm text-stay-text-secondary mt-1">
          Chọn hình thức đăng tin phù hợp: Đã có sẵn phòng cần tìm người share hoặc chưa có phòng muốn tìm nhóm cùng thuê.
        </p>
      </div>

      {/* Form Container */}
      <Card>
        <div className="p-6 sm:p-8 space-y-6">
          {/* Post Type Selector (UC 32 vs UC 33) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stay-text-secondary block">
              Loại hình đăng bài
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPostType('HAS_ROOM')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  postType === 'HAS_ROOM'
                    ? 'border-stay-primary bg-stay-primary/5 shadow-xs'
                    : 'border-stay-border hover:border-slate-300 bg-stay-card-bg'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${postType === 'HAS_ROOM' ? 'bg-stay-primary text-white' : 'bg-stay-bg-app text-slate-500'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stay-text">Tôi đã có sẵn phòng trọ</h4>
                  <p className="text-xs text-stay-text-secondary mt-1">
                    Cần tìm thêm người ở ghép để chia tiền phòng, điện nước và chi phí sinh hoạt.
                  </p>
                </div>
              </div>

              <div
                onClick={() => setPostType('SEARCHING_ROOM')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  postType === 'SEARCHING_ROOM'
                    ? 'border-stay-primary bg-stay-primary/5 shadow-xs'
                    : 'border-stay-border hover:border-slate-300 bg-stay-card-bg'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${postType === 'SEARCHING_ROOM' ? 'bg-stay-primary text-white' : 'bg-stay-bg-app text-slate-500'}`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stay-text">Tôi chưa có phòng trọ</h4>
                  <p className="text-xs text-stay-text-secondary mt-1">
                    Tìm bạn cùng chung chí hướng và ngân sách để lập nhóm đi thuê chung theo bán kính bản đồ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Form form={form} layout="vertical" className="space-y-4">
            {/* Post Title */}
            <Form.Item
              name="title"
              label="Tiêu đề bài đăng"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết!' }]}
              initialValue={
                postType === 'HAS_ROOM'
                  ? 'Tìm 1 bạn nữ ở ghép phòng trọ full đồ Cầu Giấy gần ĐH Quốc Gia'
                  : 'Tìm nhóm 2-3 bạn lập team thuê chung căn hộ 2PN Đống Đa'
              }
            >
              <Input placeholder="Ví dụ: Tìm bạn nam ở ghép phòng khép kín Hoàng Quốc Việt..." />
            </Form.Item>

            {/* Area & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="district"
                label="Quận / Huyện"
                rules={[{ required: true, message: 'Vui lòng chọn quận huyện!' }]}
                initialValue="Cầu Giấy"
              >
                <Select
                  options={[
                    { label: 'Cầu Giấy', value: 'Cầu Giấy' },
                    { label: 'Hai Bà Trưng', value: 'Hai Bà Trưng' },
                    { label: 'Đống Đa', value: 'Đống Đa' },
                    { label: 'Thanh Xuân', value: 'Thanh Xuân' },
                    { label: 'Nam Từ Liêm', value: 'Nam Từ Liêm' },
                    { label: 'Bắc Từ Liêm', value: 'Bắc Từ Liêm' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="areaName"
                label="Địa chỉ chi tiết / Khu vực"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                initialValue="Số 12 ngõ 45 Trần Thái Tông, Cầu Giấy"
              >
                <Input placeholder="Số nhà, tên ngõ, tuyến đường..." />
              </Form.Item>
            </div>

            {/* Pricing & Members */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="sharePrice"
                label="Ngân sách dự kiến / người / tháng"
                rules={[{ required: true, message: 'Vui lòng nhập giá share!' }]}
                initialValue={1800000}
              >
                <Input type="number" step={100000} prefix="₫" />
              </Form.Item>

              <Form.Item
                name="targetMembers"
                label="Số lượng thành viên mong muốn"
                rules={[{ required: true, message: 'Vui lòng chọn số lượng!' }]}
                initialValue={2}
              >
                <Select
                  options={[
                    { label: '2 người', value: 2 },
                    { label: '3 người', value: 3 },
                    { label: '4 người', value: 4 },
                  ]}
                />
              </Form.Item>
            </div>

            {/* HAS_ROOM conditional fields */}
            {postType === 'HAS_ROOM' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stay-bg-app border border-stay-border">
                <Form.Item name="area" label="Diện tích phòng" initialValue={28}>
                  <Input type="number" suffix="m²" />
                </Form.Item>

                <Form.Item name="deposit" label="Tiền đặt cọc" initialValue={1800000}>
                  <Input type="number" step={100000} prefix="₫" />
                </Form.Item>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stay-text mb-2 block">
                    Hình ảnh phòng trọ
                  </label>
                  <Upload.Dragger
                    title="Kéo thả ảnh phòng vào đây"
                    hint="Tối đa 5 ảnh, định dạng JPG/PNG"
                    beforeUpload={() => {
                      message.success('Đã chọn ảnh phòng!');
                      return false;
                    }}
                  />
                </div>
              </div>
            )}

            {/* SEARCHING_ROOM conditional radius slider */}
            {postType === 'SEARCHING_ROOM' && (
              <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-2">
                <div className="flex justify-between text-xs font-semibold text-stay-text">
                  <span>Bán kính tìm phòng từ vị trí mong muốn:</span>
                  <span className="text-stay-primary font-bold">Bán kính 3 km</span>
                </div>
                <Slider min={1} max={10} defaultValue={3} tooltip={{ formatter: (val) => `${val} km` }} />
                <p className="text-[11px] text-slate-500">
                  Hệ thống sẽ gợi ý các phòng trọ và bạn cùng phòng trong bán kính đã chọn.
                </p>
              </div>
            )}

            {/* Description */}
            <Form.Item
              name="description"
              label="Mô tả chi tiết phòng & yêu cầu bạn ở ghép"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
              initialValue="Phòng trọ rộng rãi, có ban công thoáng mát, đầy đủ điều hòa, nóng lạnh, máy giặt chung. Tiền điện nước tính theo giá nhà nước. Tìm bạn ở cùng có ý thức giữ gìn vệ sinh chung, tôn trọng không gian riêng tư."
            >
              <Input.TextArea rows={4} placeholder="Mô tả phòng, tiện ích, chi phí dịch vụ và tính cách bạn cùng phòng mong muốn..." />
            </Form.Item>

            {/* Lifestyle & Habits Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stay-text-secondary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-stay-primary" />
                  Tiêu chí thói quen & lối sống ưu tiên
                </label>
                <span className="text-xs text-stay-primary font-semibold">
                  Đã chọn {selectedHabits.length} tiêu chí
                </span>
              </div>
              <p className="text-xs text-stay-text-secondary">
                Hệ thống sẽ dựa vào các tiêu chí này để tính điểm tương thích (%) với những người có nhu cầu ở ghép.
              </p>
              <div className="flex flex-wrap gap-2">
                {habitOptions.map((opt) => (
                  <HabitChip
                    key={opt.label}
                    label={opt.label}
                    emoji={opt.emoji}
                    selected={selectedHabits.includes(opt.label)}
                    onClick={() => toggleHabit(opt.label)}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-stay-border flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="lg"
                loading={isCreatingWithRoom || isCreatingWithoutRoom}
                onClick={handleSubmit}
                className="shadow-md shadow-stay-primary/20 font-semibold"
              >
                Đăng Bài Ngay
              </Button>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

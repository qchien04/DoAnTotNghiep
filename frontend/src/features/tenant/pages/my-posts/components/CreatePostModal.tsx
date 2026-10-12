import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Segmented } from 'antd';
import { useRoommatePosts } from '@/shared/hooks';
import { Home, Search, Users } from 'lucide-react';

interface CreatePostModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const DISTRICT_OPTIONS = [
  { value: 'Cầu Giấy', label: 'Quận Cầu Giấy' },
  { value: 'Đống Đa', label: 'Quận Đống Đa' },
  { value: 'Hai Bà Trưng', label: 'Quận Hai Bà Trưng' },
  { value: 'Thanh Xuân', label: 'Quận Thanh Xuân' },
  { value: 'Nam Từ Liêm', label: 'Quận Nam Từ Liêm' },
  { value: 'Ba Đình', label: 'Quận Ba Đình' },
  { value: 'Bắc Từ Liêm', label: 'Quận Bắc Từ Liêm' },
  { value: 'Tây Hồ', label: 'Quận Tây Hồ' },
  { value: 'Hà Đông', label: 'Quận Hà Đông' },
  { value: 'Hoàng Mai', label: 'Quận Hoàng Mai' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [postType, setPostType] = useState<'HAS_ROOM' | 'SEARCHING_ROOM'>('HAS_ROOM');
  const [submitting, setSubmitting] = useState(false);
  const { createPostWithRoom, createPostWithoutRoom } = useRoommatePosts();

  const handlePostTypeChange = (val: 'HAS_ROOM' | 'SEARCHING_ROOM') => {
    setPostType(val);
    if (val === 'HAS_ROOM') {
      form.setFieldsValue({
        title: 'Tìm 1 bạn ở ghép phòng khép kín sạch sẽ, đủ đồ',
        neededRoommates: 1,
        sharePrice: 2000000,
        totalRoomPrice: 4000000,
      });
    } else {
      form.setFieldsValue({
        title: 'Tìm bạn cùng thuê phòng / nhà nguyên căn chia tiền',
        neededRoommates: 1,
        sharePrice: 2000000,
      });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        title: values.title,
        description: values.description,
        roomAddress: values.roomAddress,
        district: values.district,
        city: 'Hà Nội',
        sharePrice: values.sharePrice,
        totalRoomPrice: values.totalRoomPrice,
        neededRoommates: values.neededRoommates || 1,
        genderPreference: values.genderPreference || 'ANY',
        sleepTime: values.sleepTime || 'BEFORE_24H',
        isNoSmoking: values.smoking === 'NO',
        isPetFriendly: values.pet === 'YES',
        cookingFrequency: values.cooking || 'DAILY',
        cleanlinessLevel: 'VERY_CLEAN',
        guestAllowed: 'WEEKENDS_ONLY',
      };

      if (postType === 'HAS_ROOM') {
        await createPostWithRoom(payload as any);
      } else {
        await createPostWithoutRoom(payload as any);
      }

      message.success('Đăng bài tìm bạn ở ghép thành công!');
      form.resetFields();
      onSuccess();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Có lỗi xảy ra khi tạo bài đăng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-stay-text pb-2 border-b border-stay-border">
          <Users className="w-4 h-4 text-stay-primary" />
          <span>Đăng tin tìm bạn ở ghép</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText="Xác nhận đăng bài"
      cancelText="Hủy bỏ"
      width={680}
      centered
      destroyOnClose
    >
      <div className="pt-3 space-y-4">
        {/* Phân loại loại bài đăng */}
        <div>
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block mb-1.5">
            Loại hình bài đăng
          </label>
          <Segmented
            value={postType}
            onChange={(val) => handlePostTypeChange(val as any)}
            block
            size="large"
            className="p-1 bg-stay-bg-app border border-stay-border"
            options={[
              {
                value: 'HAS_ROOM',
                label: (
                  <div className="flex items-center justify-center gap-2 py-1 font-semibold text-xs sm:text-sm">
                    <Home className="w-4 h-4 text-stay-primary" />
                    <span>Đã có phòng sẵn (Tìm người vào ở cùng)</span>
                  </div>
                ),
              },
              {
                value: 'SEARCHING_ROOM',
                label: (
                  <div className="flex items-center justify-center gap-2 py-1 font-semibold text-xs sm:text-sm">
                    <Search className="w-4 h-4 text-emerald-600" />
                    <span>Chưa có phòng (Tìm bạn cùng lập nhóm thuê)</span>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: 'Tìm 1 bạn ở ghép phòng khép kín sạch sẽ, đủ đồ',
            district: 'Cầu Giấy',
            roomAddress: 'Ngõ 80 Cầu Giấy, Dịch Vọng Hậu',
            sharePrice: 2000000,
            totalRoomPrice: 4000000,
            neededRoommates: 1,
            genderPreference: 'ANY',
            sleepTime: 'BEFORE_24H',
            smoking: 'NO',
            pet: 'NO',
            cooking: 'DAILY',
            description: 'Phòng sạch sẽ, thoáng mát, đầy đủ tiện nghi điều hòa, nóng lạnh. Tìm bạn sinh viên hoặc người đi làm sinh hoạt điều độ, giữ vệ sinh chung.',
          }}
          className="space-y-3"
        >
          {/* Tiêu đề */}
          <Form.Item
            label={<span className="font-semibold text-xs text-stay-text">Tiêu đề bài đăng</span>}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài đăng!' }]}
            className="mb-3"
          >
            <Input
              placeholder="VD: Tìm 1 bạn nam ở ghép phòng 30m2 khép kín Triều Khúc..."
              className="h-10 text-xs"
            />
          </Form.Item>

          {/* Địa chỉ & Quận Huyện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label={
                <span className="font-semibold text-xs text-stay-text">
                  {postType === 'HAS_ROOM' ? 'Địa chỉ phòng trọ' : 'Khu vực muốn tìm trọ'}
                </span>
              }
              name="roomAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ / khu vực!' }]}
              className="mb-3"
            >
              <Input
                placeholder="VD: Ngõ 175 Xuân Thủy, Dịch Vọng Hậu"
                className="h-10 text-xs"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-xs text-stay-text">Quận / Huyện</span>}
              name="district"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
              className="mb-3"
            >
              <Select
                options={DISTRICT_OPTIONS}
                className="h-10 text-xs"
                placeholder="Chọn quận/huyện"
              />
            </Form.Item>
          </div>

          {/* Chi phí & Số lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-semibold text-xs text-stay-text">Giá share mỗi người</span>}
              name="sharePrice"
              rules={[{ required: true, message: 'Vui lòng nhập giá share!' }]}
              className="mb-3"
            >
              <InputNumber
                className="w-full h-10 text-xs"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="đ"
                min={500000}
                step={100000}
              />
            </Form.Item>

            {postType === 'HAS_ROOM' ? (
              <Form.Item
                label={<span className="font-semibold text-xs text-stay-text">Tổng tiền phòng gốc</span>}
                name="totalRoomPrice"
                rules={[{ required: true, message: 'Vui lòng nhập tổng tiền phòng!' }]}
                className="mb-3"
              >
                <InputNumber
                  className="w-full h-10 text-xs"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  addonAfter="đ"
                  min={500000}
                  step={100000}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label={<span className="font-semibold text-xs text-stay-text">Ngân sách tối đa</span>}
                name="totalRoomPrice"
                className="mb-3"
              >
                <InputNumber
                  className="w-full h-10 text-xs"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  addonAfter="đ"
                  min={500000}
                  step={100000}
                />
              </Form.Item>
            )}

            <Form.Item
              label={<span className="font-semibold text-xs text-stay-text">Số bạn cần tìm</span>}
              name="neededRoommates"
              rules={[{ required: true, message: 'Vui lòng chọn số lượng!' }]}
              className="mb-3"
            >
              <InputNumber
                className="w-full h-10 text-xs"
                min={1}
                max={5}
                addonAfter="người"
              />
            </Form.Item>
          </div>

          {/* Tiêu chí lối sống cơ bản */}
          <div className="p-3.5 bg-stay-bg-app border border-stay-border rounded-xl space-y-2">
            <span className="text-xs font-semibold text-stay-text block">
              Tiêu chuẩn lối sống & Thói quen sinh hoạt
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Form.Item
                label={<span className="text-[11px] text-stay-text-secondary">Giới tính mong muốn</span>}
                name="genderPreference"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs"
                  options={[
                    { value: 'ANY', label: 'Linh hoạt Nam/Nữ' },
                    { value: 'MALE', label: 'Ưu tiên Nam' },
                    { value: 'FEMALE', label: 'Ưu tiên Nữ' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[11px] text-stay-text-secondary">Giờ giấc thức - ngủ</span>}
                name="sleepTime"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs"
                  options={[
                    { value: 'BEFORE_23H', label: 'Trước 23:00 (Ngủ sớm)' },
                    { value: 'BEFORE_24H', label: 'Khoảng 23h - 24h' },
                    { value: 'AFTER_24H', label: 'Sau 24:00 (Cú đêm)' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[11px] text-stay-text-secondary">Hút thuốc lá</span>}
                name="smoking"
                className="mb-0"
              >
                <Select
                  className="w-full text-xs"
                  options={[
                    { value: 'NO', label: 'Không khói thuốc' },
                    { value: 'YES', label: 'Có hút thuốc' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <Form.Item
            label={<span className="font-semibold text-xs text-stay-text">Mô tả chi tiết phòng & yêu cầu</span>}
            name="description"
            className="mb-0"
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả đặc điểm phòng, tính cách, giờ giấc làm việc/học tập của bạn..."
              className="text-xs"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

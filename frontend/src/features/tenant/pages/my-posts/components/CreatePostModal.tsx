import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Segmented, Radio } from 'antd';
import { useCreatePostWithRoom, useCreatePostWithoutRoom, useLifestyleQuestions, useUserLifestyleProfile } from '@/shared/hooks';
import { Home, Search, Users, Sliders } from 'lucide-react';
import { LifestyleQuestionnaire } from '@/shared/components';

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
  const [surveyMode, setSurveyMode] = useState<'PROFILE' | 'CUSTOM'>('PROFILE');
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number[]>>({});

  const { questions } = useLifestyleQuestions();
  const { profile } = useUserLifestyleProfile();
  const { createPostWithRoom } = useCreatePostWithRoom();
  const { createPostWithoutRoom } = useCreatePostWithoutRoom();

  useEffect(() => {
    if (profile?.answers && profile.answers.length > 0) {
      const initial: Record<number, number[]> = {};
      profile.answers.forEach((ans: any) => {
        if (ans.optionIds && ans.optionIds.length > 0) {
          initial[ans.questionId] = ans.optionIds;
        } else if (ans.optionId) {
          initial[ans.questionId] = [ans.optionId];
        }
      });
      setSurveyAnswers(initial);
    }
  }, [profile]);

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

      const lifestyleAnswers =
        surveyMode === 'CUSTOM'
          ? Object.entries(surveyAnswers).map(([qId, optIds]) => ({
            questionId: Number(qId),
            optionIds: optIds,
            optionId: optIds[0] || null,
          }))
          : undefined;

      const payload = {
        title: values.title,
        description: values.description,
        postType: postType,
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
        lifestyleAnswers,
      };

      if (postType === 'HAS_ROOM') {
        await createPostWithRoom(payload as any);
      } else {
        await createPostWithoutRoom(payload as any);
      }

      form.resetFields();
      onSuccess();
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
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
      width={780}
      centered
      destroyOnClose
    >
      <div className="pt-3 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Phân loại loại bài đăng */}
        <div>
          <label className="font-semibold text-stay-text-secondary uppercase tracking-wider block mb-1.5 text-xs">
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
                  <div className="flex items-center justify-center gap-2 py-1 font-semibold  sm:text-sm">
                    <Home className="w-4 h-4 text-stay-primary" />
                    <span>Đã có phòng sẵn (Tìm người vào ở cùng)</span>
                  </div>
                ),
              },
              {
                value: 'SEARCHING_ROOM',
                label: (
                  <div className="flex items-center justify-center gap-2 py-1 font-semibold  sm:text-sm">
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
            label={<span className="font-semibold  text-stay-text">Tiêu đề bài đăng</span>}
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài đăng!' }]}
            className="mb-3"
          >
            <Input
              placeholder="VD: Tìm 1 bạn nam ở ghép phòng 30m2 khép kín Triều Khúc..."
              className="h-10 "
            />
          </Form.Item>

          {/* Địa chỉ & Quận Huyện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label={
                <span className="font-semibold  text-stay-text">
                  {postType === 'HAS_ROOM' ? 'Địa chỉ phòng trọ' : 'Khu vực muốn tìm trọ'}
                </span>
              }
              name="roomAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ / khu vực!' }]}
              className="mb-3"
            >
              <Input
                placeholder="VD: Ngõ 175 Xuân Thủy, Dịch Vọng Hậu"
                className="h-10 "
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold  text-stay-text">Quận / Huyện</span>}
              name="district"
              rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
              className="mb-3"
            >
              <Select
                options={DISTRICT_OPTIONS}
                className="h-10 "
                placeholder="Chọn quận/huyện"
              />
            </Form.Item>
          </div>

          {/* Chi phí & Số lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Form.Item
              label={<span className="font-semibold  text-stay-text">Giá share mỗi người</span>}
              name="sharePrice"
              rules={[{ required: true, message: 'Vui lòng nhập giá share!' }]}
              className="mb-3"
            >
              <InputNumber
                className="w-full h-10 "
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                addonAfter="đ"
                min={500000}
                step={100000}
              />
            </Form.Item>

            {postType === 'HAS_ROOM' ? (
              <Form.Item
                label={<span className="font-semibold  text-stay-text">Tổng tiền phòng gốc</span>}
                name="totalRoomPrice"
                rules={[{ required: true, message: 'Vui lòng nhập tổng tiền phòng!' }]}
                className="mb-3"
              >
                <InputNumber
                  className="w-full h-10 "
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  addonAfter="đ"
                  min={500000}
                  step={100000}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label={<span className="font-semibold  text-stay-text">Ngân sách tối đa</span>}
                name="totalRoomPrice"
                className="mb-3"
              >
                <InputNumber
                  className="w-full h-10 "
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                  addonAfter="đ"
                  min={500000}
                  step={100000}
                />
              </Form.Item>
            )}

            <Form.Item
              label={<span className="font-semibold  text-stay-text">Số bạn cần tìm</span>}
              name="neededRoommates"
              rules={[{ required: true, message: 'Vui lòng chọn số lượng!' }]}
              className="mb-3"
            >
              <InputNumber
                className="w-full h-10 "
                min={1}
                max={5}
                addonAfter="người"
              />
            </Form.Item>
          </div>

          {/* Tiêu chí sinh hoạt cơ bản & AI Matching */}
          <div className="space-y-3 pt-3 border-t border-stay-border-subtle">
            <div>
              <span className="font-semibold text-stay-text text-sm block">
                Tiêu chuẩn lọc cứng & Lối sống ghép đôi (AI Matching)
              </span>
              <span className="text-xs text-stay-text-secondary">
                Thuật toán Roomi AI dùng tiêu chuẩn này để tính điểm tương thích với người nộp đơn ứng tuyển.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Form.Item
                label={<span className="text-[11px] text-stay-text-secondary">Giới tính mong muốn</span>}
                name="genderPreference"
                className="mb-0"
              >
                <Select
                  className="w-full"
                  options={[
                    { value: 'ANY', label: 'Linh hoạt Nam/Nữ' },
                    { value: 'MALE_ONLY', label: 'Ưu tiên Nam' },
                    { value: 'FEMALE_ONLY', label: 'Ưu tiên Nữ' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[11px] text-stay-text-secondary">Giờ giấc thức - ngủ</span>}
                name="sleepTime"
                className="mb-0"
              >
                <Select
                  className="w-full"
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
                  className="w-full"
                  options={[
                    { value: 'NO', label: 'Không khói thuốc' },
                    { value: 'YES', label: 'Có hút thuốc' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[11px] text-stay-text-secondary">Nuôi thú cưng</span>}
                name="pet"
                className="mb-0"
              >
                <Select
                  className="w-full"
                  options={[
                    { value: 'NO', label: 'Không nuôi pet' },
                    { value: 'YES', label: 'Thoải mái với pet' },
                  ]}
                />
              </Form.Item>
            </div>

            {/* Chế độ khảo sát 15 chiều */}
            <div className="p-3.5 bg-stay-bg-app rounded-xl border border-stay-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-stay-primary" />
                  <span className="font-semibold text-xs text-stay-text">
                    Khảo sát sinh hoạt 15 chiều Roomi
                  </span>
                </div>
                <Radio.Group
                  value={surveyMode}
                  onChange={(e) => setSurveyMode(e.target.value)}
                  size="small"
                  buttonStyle="solid"
                >
                  <Radio.Button value="PROFILE">Dùng hồ sơ của tôi</Radio.Button>
                  <Radio.Button value="CUSTOM">Tùy chỉnh riêng cho bài này</Radio.Button>
                </Radio.Group>
              </div>

              {surveyMode === 'PROFILE' ? (
                <></>
              ) : (
                <div className="pt-2">
                  <LifestyleQuestionnaire
                    questions={questions}
                    answers={surveyAnswers}
                    onAnswerChange={(qId, optIds) =>
                      setSurveyAnswers((prev) => ({ ...prev, [qId]: optIds }))
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <Form.Item
            label={<span className="font-semibold  text-stay-text">Mô tả chi tiết phòng & yêu cầu</span>}
            name="description"
            className="mb-0"
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả đặc điểm phòng, tính cách, giờ giấc làm việc/học tập của bạn..."
              className=""
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

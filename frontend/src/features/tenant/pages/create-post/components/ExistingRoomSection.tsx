import React, { useEffect } from 'react';
import { Form, Input, Select, Upload } from '@/shared/components';
import { FormInstance, message } from 'antd';
import { Home, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { MyRoomDetails } from '@/shared/types/tenant';
import { LifestyleSurveyTable, LifestyleFormValues } from './LifestyleSurveyTable';

interface ExistingRoomSectionProps {
  roomOption: 'CURRENT_ROOM' | 'NEW_ROOM';
  onRoomOptionChange: (opt: 'CURRENT_ROOM' | 'NEW_ROOM') => void;
  currentRoom?: MyRoomDetails['room'];
  hasLinkedRoom: boolean;
  lifestyleValues: LifestyleFormValues;
  onLifestyleChange: (vals: LifestyleFormValues) => void;
  form: FormInstance;
}

export const ExistingRoomSection: React.FC<ExistingRoomSectionProps> = ({
  roomOption,
  onRoomOptionChange,
  currentRoom,
  hasLinkedRoom,
  lifestyleValues,
  onLifestyleChange,
  form,
}) => {
  // Khi chuyển giữa "Phòng đang ở" và "Phòng mới", cập nhật dữ liệu form tương ứng
  useEffect(() => {
    if (roomOption === 'CURRENT_ROOM' && hasLinkedRoom && currentRoom) {
      const halfPrice = Math.round((currentRoom.monthlyRent || 3800000) / 2);
      form.setFieldsValue({
        title: `Tìm bạn ở ghép phòng ${currentRoom.name} - ${currentRoom.buildingName || 'Tòa nhà'}`,
        roomAddress: currentRoom.address || 'Hà Nội',
        ward: (currentRoom as any).ward || 'Phường Dịch Vọng Hậu',
        totalRoomPrice: currentRoom.monthlyRent || 3800000,
        roomArea: currentRoom.area || 28,
        sharePrice: halfPrice,
        neededRoommates: 1,
        serviceFeeNote: 'Điện nước, wifi và phí vệ sinh chia đều theo đầu người',
        moveInDate: 'Dọn vào ở ngay đầu tháng tới',
        description: `Phòng ${currentRoom.name} khép kín sạch sẽ, diện tích ${currentRoom.area || 28}m2 đầy đủ ${
          currentRoom.amenities?.join(', ') || 'tiện nghi cơ bản'
        }. Tìm bạn ở ghép văn minh, giữ gìn vệ sinh chung.`,
      });
    } else if (roomOption === 'NEW_ROOM') {
      form.setFieldsValue({
        title: '',
        roomAddress: '',
        ward: 'Phường Bách Khoa',
        totalRoomPrice: undefined,
        roomArea: undefined,
        sharePrice: undefined,
        neededRoommates: 1,
        serviceFeeNote: '',
        moveInDate: 'Dọn vào ở ngay',
        description: '',
      });
    }
  }, [roomOption, hasLinkedRoom, currentRoom, form]);

  return (
    <div className="space-y-6">
      {/* 2 Lựa chọn theo yêu cầu: 1. Phòng đang ở, 2. Phòng mới */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
          2. Chọn nguồn phòng để đăng tin tìm bạn ở cùng
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* OPTION 1: Phòng đang ở */}
          <div
            onClick={() => onRoomOptionChange('CURRENT_ROOM')}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
              roomOption === 'CURRENT_ROOM'
                ? 'border-stay-primary bg-stay-primary/5 ring-1 ring-stay-primary/30'
                : 'border-stay-border hover:border-slate-300 bg-stay-card-bg'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stay-text flex items-center gap-1.5">
                <Home className="w-4 h-4 text-stay-primary" />
                Option 1: Phòng tôi đang ở
              </span>
              {roomOption === 'CURRENT_ROOM' && (
                <CheckCircle2 className="w-4 h-4 text-stay-primary" />
              )}
            </div>
            <p className="text-xs text-stay-text-secondary mt-1">
              Tự động lấy thông tin phòng hiện tại trên StayHub (Tên phòng, địa chỉ, giá gốc, diện tích, tiện nghi) để hiện lên bài đăng.
            </p>
          </div>

          {/* OPTION 2: Phòng mới */}
          <div
            onClick={() => onRoomOptionChange('NEW_ROOM')}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
              roomOption === 'NEW_ROOM'
                ? 'border-stay-primary bg-stay-primary/5 ring-1 ring-stay-primary/30'
                : 'border-stay-border hover:border-slate-300 bg-stay-card-bg'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-stay-text flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Option 2: Phòng mới
              </span>
              {roomOption === 'NEW_ROOM' && (
                <CheckCircle2 className="w-4 h-4 text-stay-primary" />
              )}
            </div>
            <p className="text-xs text-stay-text-secondary mt-1">
              Tự nhập toàn bộ thông tin phòng trọ mới (Địa chỉ, giá, diện tích, ảnh...). Không lấy thông tin từ phòng hiện tại.
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo trạng thái phòng đang ở nếu chọn Option 1 */}
      {roomOption === 'CURRENT_ROOM' && (
        <>
          {hasLinkedRoom && currentRoom ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã nạp tự động thông tin từ phòng bạn đang thuê:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-950 pt-1">
                <div>
                  <span className="text-emerald-700/80 block text-[11px]">Tên phòng & Tòa nhà:</span>
                  <strong className="text-emerald-900">{currentRoom.name} - {currentRoom.buildingName}</strong>
                </div>
                <div>
                  <span className="text-emerald-700/80 block text-[11px]">Giá thuê gốc:</span>
                  <strong className="text-emerald-900">{formatCurrency(currentRoom.monthlyRent)}/tháng</strong>
                </div>
                <div>
                  <span className="text-emerald-700/80 block text-[11px]">Diện tích & Tiện nghi:</span>
                  <strong className="text-emerald-900">{currentRoom.area} m² • {currentRoom.amenities?.length || 4} tiện ích</strong>
                </div>
                <div className="sm:col-span-3 text-[11px] text-emerald-700">
                  📍 Địa chỉ: {currentRoom.address}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-900">
                  Tài khoản của bạn hiện chưa liên kết phòng đang ở trên hệ thống!
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Để lấy thông tin tự động, bạn cần được chủ trọ liên kết vào hợp đồng phòng. Nếu bạn muốn đăng tin ngay, vui lòng bấm chọn <strong>"Option 2: Phòng mới"</strong> để tự nhập thông tin phòng.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Fields Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
          3. Thông tin chi tiết bài đăng & Tiền phòng
        </label>

        <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5 space-y-4">
          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết!' }]}
          >
            <Input placeholder="Ví dụ: Tìm 1 bạn nam ở ghép phòng khép kín đủ đồ ngõ 80 Cầu Giấy..." />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Form.Item
                name="roomAddress"
                label="Địa chỉ phòng trọ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input
                  placeholder="Số nhà, ngõ/ngách, tên đường..."
                  disabled={roomOption === 'CURRENT_ROOM' && hasLinkedRoom}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="ward"
              label="Phường / Xã (Cấp hành chính cơ sở)"
              rules={[{ required: true, message: 'Vui lòng nhập Phường / Xã!' }]}
            >
              <Input
                disabled={roomOption === 'CURRENT_ROOM' && hasLinkedRoom}
                placeholder="Ví dụ: Phường Bách Khoa, Phường Dịch Vọng Hậu..."
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Form.Item
              name="totalRoomPrice"
              label="Tổng tiền thuê phòng (gốc)"
              rules={[{ required: true, message: 'Vui lòng nhập tiền phòng gốc!' }]}
            >
              <Input
                type="number"
                suffix="đ/tháng"
                disabled={roomOption === 'CURRENT_ROOM' && hasLinkedRoom}
                placeholder="Ví dụ: 3800000"
              />
            </Form.Item>

            <Form.Item
              name="roomArea"
              label="Diện tích (m²)"
              rules={[{ required: true, message: 'Vui lòng nhập diện tích!' }]}
            >
              <Input
                type="number"
                suffix="m²"
                disabled={roomOption === 'CURRENT_ROOM' && hasLinkedRoom}
                placeholder="Ví dụ: 28"
              />
            </Form.Item>

            <Form.Item
              name="neededRoommates"
              label="Số lượng cần tìm"
              rules={[{ required: true, message: 'Chọn số lượng cần tìm!' }]}
            >
              <Select
                options={[
                  { label: 'Cần tìm 1 người', value: 1 },
                  { label: 'Cần tìm 2 người', value: 2 },
                  { label: 'Cần tìm 3 người', value: 3 },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="sharePrice"
              label="Chi phí mỗi người / tháng"
              rules={[{ required: true, message: 'Nhập giá đóng góp mỗi người!' }]}
            >
              <Input type="number" step={50000} suffix="đ/người" placeholder="Ví dụ: 1900000" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="serviceFeeNote"
              label="Phí dịch vụ sinh hoạt (Điện, Nước, Wifi, Rác)"
            >
              <Input placeholder="Ví dụ: Điện 3.8k/số, Nước 30k/khối, Wifi 100k chia đều..." />
            </Form.Item>

            <Form.Item
              name="moveInDate"
              label="Ngày có thể dọn vào ở"
            >
              <Input placeholder="Ví dụ: Đầu tháng 10/2026, dọn vào ngay..." />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả chi tiết phòng & Yêu cầu bạn cùng phòng"
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả thêm về phòng, nội quy giờ giấc, tính cách bạn cùng phòng mong muốn..."
            />
          </Form.Item>
        </div>
      </div>

      {/* Album ảnh */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
          4. Album hình ảnh thực tế của phòng
        </label>
        <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5">
          <Upload.Dragger
            title="Kéo thả ảnh phòng vào đây hoặc nhấp để tải lên"
            hint="Tải ảnh thực tế góc sinh hoạt, góc nấu nướng của phòng (Tối đa 5 ảnh, định dạng JPG/PNG)"
            beforeUpload={() => {
              message.success('Đã tải ảnh phòng thành công!');
              return false;
            }}
          />
        </div>
      </div>

      {/* Bảng khảo sát lối sống */}
      <LifestyleSurveyTable values={lifestyleValues} onChange={onLifestyleChange} />
    </div>
  );
};

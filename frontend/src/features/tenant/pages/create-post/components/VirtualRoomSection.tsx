import React from 'react';
import { Form, Input, Select, Slider, LeafletMap, type MapMarker } from '@/shared/components';

interface VirtualRoomSectionProps {
  landmarkAddress: string;
  onLandmarkChange: (val: string) => void;
  mapRadius: number;
  onRadiusChange: (val: number) => void;
  mapCenter: [number, number];
}

export const VirtualRoomSection: React.FC<VirtualRoomSectionProps> = ({
  landmarkAddress,
  onLandmarkChange,
  mapRadius,
  onRadiusChange,
  mapCenter,
}) => {
  const markers: MapMarker[] = [
    {
      id: 'center_landmark',
      position: mapCenter,
      title: landmarkAddress,
      price: 'Điểm mốc',
      type: 'roommate',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section 1: Thiết lập vị trí mong muốn trên bản đồ số */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
          2. Thiết lập vị trí mong muốn trên bản đồ số
        </label>
        <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-stay-text block mb-1.5">
                Địa chỉ cơ quan / Trường học làm mốc (*)
              </label>
              <Input
                placeholder="Ví dụ: Trường Đại học Bách Khoa Hà Nội"
                value={landmarkAddress}
                onChange={(e) => onLandmarkChange(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-stay-text font-semibold mb-1">
                <span>Bán kính tìm kiếm quanh vị trí:</span>
                <span className="text-stay-primary font-bold">{mapRadius.toFixed(1)} km</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={0.5}
                value={mapRadius}
                onChange={(val) => onRadiusChange(val as number)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-stay-text-secondary block">
              Bản đồ tương tác hiển thị vùng bán kính {mapRadius}km quanh {landmarkAddress}:
            </span>
            <LeafletMap markers={markers} height="320px" />
          </div>
        </div>
      </div>

      {/* Section 2: Ngân sách & Số lượng bạn cần tìm */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
          3. Thông tin ngân sách & Số lượng
        </label>
        <div className="bg-stay-card-bg border border-stay-border rounded-xl p-5 space-y-4">
          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết!' }]}
            initialValue="Tìm 1-2 bạn sinh viên Bách Khoa / Kinh Tế cùng lập nhóm tìm trọ quanh Hai Bà Trưng"
          >
            <Input placeholder="Ví dụ: Tìm 1-2 bạn sinh viên Bách Khoa / Kinh Tế cùng lập nhóm tìm trọ..." />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              name="sharePrice"
              label="Ngân sách tối đa mỗi người"
              rules={[{ required: true, message: 'Vui lòng nhập ngân sách!' }]}
              initialValue={2000000}
            >
              <Input type="number" step={100000} suffix="VNĐ/tháng" />
            </Form.Item>

            <Form.Item
              name="neededRoommates"
              label="Số lượng bạn cần tìm để lập nhóm"
              rules={[{ required: true, message: 'Vui lòng chọn số lượng!' }]}
              initialValue={2}
            >
              <Select
                options={[
                  { label: 'Cần tìm 1 người', value: 1 },
                  { label: 'Cần tìm 2 người (nhóm 3)', value: 2 },
                  { label: 'Cần tìm 3 người (nhóm 4)', value: 3 },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="moveInDate"
              label="Dự kiến ngày đi xem & dọn vào"
              initialValue="15/10/2026"
            >
              <Input />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Mô tả kế hoạch tìm phòng chung"
            initialValue="Mình là sinh viên năm 2 ĐHBK Hà Nội, muốn tìm thêm 2 bạn cùng gu để cùng đi khảo sát và thuê căn nhà 2 phòng ngủ khoảng 6 triệu tại quận Hai Bà Trưng hoặc Đống Đa."
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </div>
      </div>

      {/* Section 3: Bảng tiêu chuẩn mong muốn cá nhân (UC13) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
          4. Bảng tiêu chuẩn lối sống cá nhân
        </label>
        <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
                <th className="p-3 w-1/3">Tiêu chuẩn mong muốn</th>
                <th className="p-3 w-1/3">Thông tin của bản thân</th>
                <th className="p-3 w-1/3">Yêu cầu đối với bạn cùng tìm phòng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stay-border">
              <tr>
                <td className="p-3 font-semibold text-stay-text">Quê quán / Khu vực</td>
                <td className="p-3">Thanh Hóa (ưu tiên đồng hương)</td>
                <td className="p-3 text-slate-500">Linh hoạt, hòa đồng</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-stay-text">Trường / Ngành nghề</td>
                <td className="p-3">Sinh viên năm 2 ĐHBK HN</td>
                <td className="p-3 text-slate-500">Ưu tiên sinh viên các trường lân cận</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-stay-text">Ngân sách phòng dự kiến</td>
                <td className="p-3">1.800.000 - 2.200.000 VNĐ/người</td>
                <td className="p-3 text-slate-500">Đồng đều tài chính, cam kết lâu dài</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-stay-text">Yêu cầu phòng trọ tương lai</td>
                <td className="p-3">Có điều hòa, an ninh tốt, giờ tự do</td>
                <td className="p-3 text-slate-500">Cùng đi xem phòng và ký chung</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  FileSignature,
  Building2,
  Calendar,
  DollarSign,
  Sparkles,
  Gauge,
  FileText,
} from 'lucide-react';
import { Modal, Form, Input, Select } from '@/shared/components';
import { InputNumber, message } from 'antd';
import { CreateContractDto, Room, Tenant, UtilityService } from '@/shared/types/landlord';

interface CreateContractModalProps {
  open: boolean;
  rooms: Room[];
  tenants: Tenant[];
  services: UtilityService[];
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateContractDto) => Promise<void>;
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  open,
  rooms,
  tenants,
  services,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [selectedRoomServices, setSelectedRoomServices] = useState<UtilityService[]>([]);

  // Lấy các dịch vụ mà phòng trọ đang hỗ trợ
  const getServicesForRoom = (targetRoomId: number | string) => {
    const targetRoom = rooms.find((r) => Number(r.id) === Number(targetRoomId));
    if (!targetRoom) return services;

    // 1. Nếu room có mảng services chi tiết
    if (targetRoom.services && targetRoom.services.length > 0) {
      return targetRoom.services;
    }

    // 2. Nếu room có mảng serviceIds
    if (targetRoom.serviceIds && targetRoom.serviceIds.length > 0) {
      const ids = targetRoom.serviceIds.map(Number);
      const matched = services.filter((s) => ids.includes(Number(s.id)));
      if (matched.length > 0) return matched;
    }

    // 3. Fallback
    return services;
  };

  const handleRoomSelection = (roomId: number | string) => {
    const targetRoom = rooms.find((r) => Number(r.id) === Number(roomId));
    if (!targetRoom) return;

    const roomServices = getServicesForRoom(roomId);
    setSelectedRoomServices(roomServices);

    const rent = targetRoom.price || targetRoom.listedPrice || 3800000;
    const deposit = targetRoom.deposit || targetRoom.standardDeposit || rent;

    const initialMeterReadings: Record<string, number> = {};
    roomServices.forEach((s: any) => {
      if (
        s.billingMethod === 'METER_INDEX' ||
        s.chargingType === 'METER' ||
        s.chargingType === 'METER_INDEX'
      ) {
        const isElec = s.category === 'ELECTRICITY' || s.name?.toLowerCase().includes('điện');
        initialMeterReadings[String(s.id)] = isElec ? 1420 : 85;
      }
    });

    form.setFieldsValue({
      monthlyRent: rent,
      depositAmount: deposit,
      serviceIds: roomServices.map((s) => s.id),
      meterReadings: initialMeterReadings,
    });
  };

  // Watch selected services to conditionally render meter readings
  const watchedServiceIds = Form.useWatch('serviceIds', form) || [];
  const currentAvailableServices = selectedRoomServices.length > 0 ? selectedRoomServices : services;
  const meterServices = currentAvailableServices.filter(
    (s: any) =>
      watchedServiceIds.includes(s.id) &&
      (s.billingMethod === 'METER_INDEX' ||
        s.chargingType === 'METER' ||
        s.chargingType === 'METER_INDEX')
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      const today = new Date().toISOString().split('T')[0];
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      const defaultEndDate = end.toISOString().split('T')[0];

      const firstRoom = rooms[0];
      const initialServices = firstRoom ? getServicesForRoom(firstRoom.id) : services;
      setSelectedRoomServices(initialServices);

      const initialMeterReadings: Record<string, number> = {};
      initialServices.forEach((s: any) => {
        if (
          s.billingMethod === 'METER_INDEX' ||
          s.chargingType === 'METER' ||
          s.chargingType === 'METER_INDEX'
        ) {
          const isElec = s.category === 'ELECTRICITY' || s.name?.toLowerCase().includes('điện');
          initialMeterReadings[String(s.id)] = isElec ? 1420 : 85;
        }
      });

      const initialVals: any = {
        startDate: today,
        durationMonths: 12,
        endDate: defaultEndDate,
        paymentCycleDay: 5,
        monthlyRent: 3800000,
        depositAmount: 3800000,
        meterReadings: initialMeterReadings,
      };

      if (firstRoom) {
        initialVals.roomId = firstRoom.id;
        initialVals.monthlyRent = firstRoom.price || firstRoom.listedPrice || 3800000;
        initialVals.depositAmount = firstRoom.deposit || firstRoom.standardDeposit || 3800000;
        initialVals.serviceIds = initialServices.map((s) => s.id);
      } else {
        initialVals.serviceIds = services.map((s) => s.id);
      }

      if (tenants.length > 0) {
        initialVals.tenantId = tenants[0].id;
      }

      form.setFieldsValue(initialVals);
    }
  }, [open, rooms, tenants, services]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      if (!values.endDate && values.startDate) {
        const start = new Date(values.startDate);
        const months = Number(values.durationMonths || 12);
        start.setMonth(start.getMonth() + months);
        start.setDate(start.getDate() - 1);
        values.endDate = start.toISOString().split('T')[0];
      }

      // Tự động gán chỉ số điện và nước cho backend dựa trên các dịch vụ công tơ đã chọn
      const elecService = meterServices.find(
        (s: any) => s.category === 'ELECTRICITY' || s.name?.toLowerCase().includes('điện')
      );
      if (elecService && values.meterReadings?.[String(elecService.id)] !== undefined) {
        values.initialElectricIndex = Number(values.meterReadings[String(elecService.id)]);
        values.initialElectricityReading = values.initialElectricIndex;
      } else {
        values.initialElectricIndex = 0;
        values.initialElectricityReading = 0;
      }

      const waterService = meterServices.find(
        (s: any) => s.category === 'WATER' || s.name?.toLowerCase().includes('nước')
      );
      if (waterService && values.meterReadings?.[String(waterService.id)] !== undefined) {
        values.initialWaterIndex = Number(values.meterReadings[String(waterService.id)]);
        values.initialWaterReading = values.initialWaterIndex;
      } else {
        values.initialWaterIndex = 0;
        values.initialWaterReading = 0;
      }

      await onSubmit(values as CreateContractDto);
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-stay-primary font-bold text-lg pb-1">
          <FileSignature className="w-5 h-5" />
          <span>Tạo Hợp Đồng Thuê Phòng Mới</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Tạo và Ký hợp đồng"
      cancelText="Hủy"
      width={840}
      className="stay-modal-wide"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-5"
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.roomId) {
            handleRoomSelection(changedValues.roomId);
          }
          if ((changedValues.startDate || changedValues.durationMonths) && allValues.startDate) {
            const start = new Date(allValues.startDate);
            const months = Number(allValues.durationMonths || 12);
            start.setMonth(start.getMonth() + months);
            start.setDate(start.getDate() - 1);
            form.setFieldsValue({ endDate: start.toISOString().split('T')[0] });
          }
        }}
      >
        {/* SECTION 1: PHÒNG & KHÁCH HÀNG */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <Building2 className="w-4 h-4 text-stay-primary" />
            <span>1. Thông tin Phòng trọ & Khách đại diện</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Chọn phòng trống (*)</span>}
              name="roomId"
              rules={[{ required: true, message: 'Vui lòng chọn phòng trống' }]}
              className="mb-0"
            >
              <Select
                placeholder="Chọn phòng..."
                className="w-full h-10"
                onChange={(val) => handleRoomSelection(val)}
                options={rooms.map((r: any) => ({
                  label: `${r.roomCode || r.code} - ${r.name} (${(r.listedPrice || r.price || 0).toLocaleString()} đ)`,
                  value: r.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Khách thuê đại diện (*)</span>}
              name="tenantId"
              rules={[{ required: true, message: 'Vui lòng chọn người thuê đại diện' }]}
              className="mb-0"
            >
              <Select
                placeholder="Chọn khách thuê..."
                className="w-full h-10"
                options={tenants.map((t: any) => ({
                  label: `${t.fullName} (${t.phone})`,
                  value: t.id,
                }))}
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 2: THỜI HẠN & CHU KỲ */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <Calendar className="w-4 h-4 text-stay-primary" />
            <span>2. Thời hạn hợp đồng & Chu kỳ thanh toán</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Ngày bắt đầu (*)</span>}
              name="startDate"
              rules={[{ required: true, message: 'Nhập ngày bắt đầu' }]}
              className="mb-0"
            >
              <Input type="date" className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Thời hạn (tháng)</span>}
              name="durationMonths"
              initialValue={12}
              className="mb-0"
            >
              <InputNumber min={1} className="w-full h-10 pt-1" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Ngày kết thúc</span>}
              name="endDate"
              className="mb-0"
            >
              <Input type="date" className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Ngày thu tiền hàng tháng</span>}
              name="paymentCycleDay"
              initialValue={5}
              className="mb-0"
            >
              <InputNumber min={1} max={31} className="w-full h-10 pt-1" />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 3: TÀI CHÍNH & TIỀN CỌC */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <DollarSign className="w-4 h-4 text-stay-primary" />
            <span>3. Giá thuê & Tiền cọc cam kết</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Tiền thuê thỏa thuận (VNĐ/tháng) (*)</span>}
              name="monthlyRent"
              initialValue={3800000}
              rules={[{ required: true, message: 'Nhập tiền thuê' }]}
              className="mb-0"
            >
              <InputNumber
                step={100000}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-10 pt-1 font-bold text-stay-secondary"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Tiền đặt cọc giữ phòng (VNĐ) (*)</span>}
              name="depositAmount"
              initialValue={3800000}
              rules={[{ required: true, message: 'Nhập tiền đặt cọc' }]}
              className="mb-0"
            >
              <InputNumber
                step={100000}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-10 pt-1 font-bold text-stay-text"
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 4: DỊCH VỤ & CÔNG TƠ ĐỒNG HỒ */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
              <Sparkles className="w-4 h-4 text-stay-primary" />
              <span>4. Dịch vụ tiện ích & Chỉ số bàn giao ban đầu</span>
            </div>
            {selectedRoomServices.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stay-primary/10 text-stay-primary font-semibold">
                Phòng hỗ trợ {selectedRoomServices.length} dịch vụ
              </span>
            )}
          </div>

          <Form.Item
            label={<span className="text-stay-text font-medium text-xs">Dịch vụ áp dụng trong hợp đồng (*)</span>}
            name="serviceIds"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 dịch vụ áp dụng' }]}
            className="mb-2"
          >
            <Select
              mode="multiple"
              placeholder="Chọn các dịch vụ áp dụng..."
              className="w-full min-h-[40px]"
              options={(selectedRoomServices.length > 0 ? selectedRoomServices : services).map((s: any) => ({
                label: `${s.serviceName || s.name} (${(s.unitPrice || s.price || 0).toLocaleString()} đ/${s.unit})`,
                value: s.id,
              }))}
            />
          </Form.Item>

          {/* Dịch vụ có sẵn của phòng */}
          {selectedRoomServices.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedRoomServices.map((s: any) => (
                <span
                  key={s.id}
                  className="text-xs px-3 py-1.5 rounded-xl bg-stay-card-bg text-stay-text border border-stay-border font-medium flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-stay-primary"></span>
                  {s.serviceName || s.name}:{' '}
                  <strong className="text-stay-primary">
                    {(s.unitPrice || s.price || 0).toLocaleString()} đ/{s.unit}
                  </strong>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stay-text-secondary italic">
              Phòng này chưa cấu hình danh sách dịch vụ riêng, đang hiển thị dịch vụ chung toàn hệ thống.
            </p>
          )}

          {/* Khối nhập chỉ số công tơ ban đầu */}
          {meterServices.length > 0 && (
            <div className="p-4 rounded-xl bg-stay-card-bg border border-stay-primary/30 space-y-3 mt-3">
              <div className="flex items-center gap-2 text-stay-text font-semibold text-xs">
                <Gauge className="w-4 h-4 text-stay-primary" />
                <span>Chỉ số công tơ ban đầu (dịch vụ tính theo đồng hồ/chỉ số tiêu thụ):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meterServices.map((srv: any) => (
                  <Form.Item
                    key={srv.id}
                    label={
                      <span className="text-stay-text font-medium text-xs">
                        Chỉ số ban đầu: <strong>{srv.serviceName || srv.name}</strong> ({srv.unit})
                      </span>
                    }
                    name={['meterReadings', String(srv.id)]}
                    rules={[
                      {
                        required: true,
                        message: `Nhập chỉ số ban đầu của ${srv.serviceName || srv.name} (*)`,
                      },
                    ]}
                    className="mb-0"
                  >
                    <InputNumber
                      min={0}
                      className="w-full h-10 pt-1 font-mono font-bold"
                      placeholder="Ví dụ: 0, 10, 1420..."
                    />
                  </Form.Item>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: ĐIỀU KHOẢN */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-3">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <FileText className="w-4 h-4 text-stay-primary" />
            <span>5. Điều khoản & Thỏa thuận chung</span>
          </div>

          <Form.Item name="termsAndConditions" className="mb-0">
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Đóng tiền phòng đúng hạn từ ngày 1-5 hàng tháng, không nuôi thú cưng gây ồn, giữ gìn vệ sinh chung..."
              className="rounded-xl p-3"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from '@/shared/components';
import { InputNumber } from 'antd';
import { CreateContractDto } from '@/shared/types/landlord';
import { useRooms, useTenants, useRoomDetail, useServices } from '@/shared/hooks';
import {
  resolveServiceUnit,
  formatServicePriceWithUnit,
  getBillingMethodInfo,
} from '@/shared/utils/serviceUtils';

interface CreateContractModalProps {
  open: boolean;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateContractDto) => Promise<void>;
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  open,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const { services } = useServices();

  const watchedRoomId = Form.useWatch('roomId', form);
  const { room: detailedRoom } = useRoomDetail(watchedRoomId);

  const watchedServiceIds = Form.useWatch('serviceIds', form) || [];
  const watchedTenantIds = Form.useWatch('tenantIds', form) || [];

  // Danh sách dịch vụ khả dụng: ưu tiên dịch vụ của phòng đã cấu hình, nếu không có thì lấy toàn bộ dịch vụ của chủ trọ
  const availableServices =
    detailedRoom?.services && detailedRoom.services.length > 0
      ? detailedRoom.services
      : services;

  // Các dịch vụ tính theo công tơ (METER_INDEX) trong các dịch vụ đã chọn
  const meterServices = availableServices.filter(
    (s: any) => watchedServiceIds.includes(s.id) && s.billingMethod === 'METER_INDEX'
  );

  // Tự động tính ngày kết thúc hợp đồng
  const calculateEndDate = (startDateStr: string, months: number): string => {
    const start = new Date(startDateStr);
    start.setMonth(start.getMonth() + months);
    start.setDate(start.getDate() - 1);
    return start.toISOString().split('T')[0];
  };

  // Tự động cập nhật dịch vụ và giá thuê khi chọn phòng
  useEffect(() => {
    if (detailedRoom) {
      const rent = Number(detailedRoom.listedPrice || 0);
      const deposit = Number(detailedRoom.standardDeposit || rent);
      const roomServices =
        detailedRoom.services && detailedRoom.services.length > 0
          ? detailedRoom.services
          : services;

      const initialMeterReadings: Record<string, number> = {};
      roomServices.forEach((s: any) => {
        if (s.billingMethod === 'METER_INDEX') {
          initialMeterReadings[String(s.id)] = 0;
        }
      });

      form.setFieldsValue({
        rentPrice: rent,
        depositAmount: deposit,
        serviceIds: roomServices.map((s: any) => s.id),
        meterReadings: initialMeterReadings,
      });
    }
  }, [detailedRoom, services, form]);

  // Reset form khi modal mở
  useEffect(() => {
    if (open) {
      form.resetFields();
      const today = new Date().toISOString().split('T')[0];
      form.setFieldsValue({
        startDate: today,
        durationMonths: 12,
        endDate: calculateEndDate(today, 12),
        paymentCycleDay: 5,
        rentPrice: 0,
        depositAmount: 0,
      });
    }
  }, [open, form]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      if (!values.endDate && values.startDate) {
        values.endDate = calculateEndDate(
          values.startDate,
          Number(values.durationMonths || 12)
        );
      }

      // Đóng gói danh sách dịch vụ áp dụng kèm chỉ số ban đầu (initialIndex) cho các dịch vụ công tơ
      const selectedServiceIds: (number | string)[] = values.serviceIds || [];
      const serviceItems = selectedServiceIds.map((sId) => ({
        serviceId: Number(sId),
        initialIndex:
          values.meterReadings?.[String(sId)] !== undefined
            ? Number(values.meterReadings[String(sId)])
            : 0,
      }));

      // Đảm bảo khách đại diện luôn có tên trong danh sách khách ở phòng
      const selectedTenants: (number | string)[] = values.tenantIds || [];
      if (
        values.representativeTenantId &&
        !selectedTenants.includes(values.representativeTenantId)
      ) {
        selectedTenants.push(values.representativeTenantId);
      }

      const payload: CreateContractDto = {
        roomId: values.roomId,
        representativeTenantId: values.representativeTenantId,
        tenantIds: selectedTenants,
        startDate: values.startDate,
        endDate: values.endDate,
        durationMonths: Number(values.durationMonths || 12),
        paymentCycleDay: Number(values.paymentCycleDay || 5),
        rentPrice: Number(values.rentPrice || 0),
        depositAmount: Number(values.depositAmount || 0),
        termsAndConditions: values.termsAndConditions,
        services: serviceItems,
      };

      await onSubmit(payload);
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  return (
    <Modal
      title="Tạo hợp đồng thuê phòng"
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Tạo và ký hợp đồng"
      cancelText="Hủy"
      width={920}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-5"
        onValuesChange={(changedValues, allValues) => {
          if (changedValues.representativeTenantId) {
            const currentTenantIds = form.getFieldValue('tenantIds') || [];
            if (!currentTenantIds.includes(changedValues.representativeTenantId)) {
              form.setFieldsValue({
                tenantIds: [...currentTenantIds, changedValues.representativeTenantId],
              });
            }
          }
          if (
            (changedValues.startDate || changedValues.durationMonths) &&
            allValues.startDate
          ) {
            form.setFieldsValue({
              endDate: calculateEndDate(
                allValues.startDate,
                Number(allValues.durationMonths || 12)
              ),
            });
          }
        }}
      >
        {/* SECTION 1: PHÒNG & KHÁCH HÀNG */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium">Chọn phòng trống</span>}
              name="roomId"
              rules={[{ required: true, message: 'Vui lòng chọn phòng trống' }]}
              className="mb-0"
            >
              <Select.Infinite
                useQueryHook={useRooms}
                params={{ status: 'AVAILABLE' }}
                placeholder="Chọn phòng còn trống..."
                className="w-full h-11"
                mapOption={(r: any) => ({
                  label: `${r.name}${r.buildingName ? ` (${r.buildingName})` : ''} - ${(r.listedPrice || 0).toLocaleString()} đ`,
                  value: r.id,
                })}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Khách đại diện hợp đồng</span>}
              name="representativeTenantId"
              rules={[{ required: true, message: 'Vui lòng chọn người thuê đại diện' }]}
              className="mb-0"
            >
              <Select.Infinite
                useQueryHook={useTenants}
                placeholder="Chọn khách đại diện..."
                className="w-full h-11"
                mapOption={(t: any) => ({
                  label: `${t.fullName} (${t.phone || '—'}) - CCCD: ${t.idCardNumber || '—'}`,
                  value: t.id,
                })}
              />
            </Form.Item>

            <Form.Item
              label={
                <div className="flex items-center justify-between w-full">
                  <span className="text-stay-text font-medium">Khách thuê ở trong phòng</span>
                  {detailedRoom?.maxCapacity && (
                    <span
                      className={`text-xs ${
                        watchedTenantIds.length > detailedRoom.maxCapacity
                          ? 'text-red-500 font-semibold'
                          : 'text-stay-text-secondary'
                      } font-normal`}
                    >
                      Sức chứa phòng: {detailedRoom.maxCapacity} người (Đã chọn:{' '}
                      {watchedTenantIds.length})
                    </span>
                  )}
                </div>
              }
              name="tenantIds"
              className="mb-0 md:col-span-2"
              tooltip="Chọn tất cả khách thuê sẽ sinh sống trong phòng (bao gồm khách đại diện và các thành viên)"
            >
              <Select.Infinite
                mode="multiple"
                useQueryHook={useTenants}
                placeholder="Chọn danh sách khách thuê ở trong phòng..."
                className="w-full min-h-[44px]"
                mapOption={(t: any) => ({
                  label: `${t.fullName} (${t.phone || '—'}) - CCCD: ${t.idCardNumber || '—'}`,
                  value: t.id,
                })}
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 2: THỜI HẠN & CHU KỲ */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
            <Form.Item
              label={<span className="text-stay-text font-medium">Ngày bắt đầu</span>}
              name="startDate"
              rules={[{ required: true, message: 'Nhập ngày bắt đầu' }]}
              className="mb-0"
            >
              <Input type="date" className="w-full h-11" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Thời hạn thuê</span>}
              name="durationMonths"
              rules={[{ required: true, message: 'Nhập số tháng thuê' }]}
              className="mb-0"
            >
              <InputNumber
                min={1}
                addonAfter="tháng"
                className="w-full h-11 font-medium"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Ngày kết thúc</span>}
              name="endDate"
              rules={[{ required: true, message: 'Nhập ngày kết thúc' }]}
              className="mb-0"
            >
              <Input type="date" className="w-full h-11" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium">Kỳ thu cước phí</span>}
              name="paymentCycleDay"
              rules={[{ required: true, message: 'Nhập ngày thu tiền' }]}
              className="mb-0"
            >
              <InputNumber
                min={1}
                max={31}
                prefix="Ngày"
                addonAfter="hàng tháng"
                className="w-full h-11 font-medium"
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 3: TÀI CHÍNH & TIỀN CỌC */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={
                <span className="text-stay-text font-medium">
                  Tiền thuê phòng thỏa thuận
                </span>
              }
              name="rentPrice"
              rules={[{ required: true, message: 'Nhập tiền thuê' }]}
              className="mb-0"
            >
              <InputNumber
                step={100000}
                addonAfter="VNĐ/tháng"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-11 font-medium"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-stay-text font-medium">
                  Tiền đặt cọc giữ phòng
                </span>
              }
              name="depositAmount"
              rules={[{ required: true, message: 'Nhập tiền đặt cọc' }]}
              className="mb-0"
            >
              <InputNumber
                step={100000}
                addonAfter="VNĐ"
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-11 font-medium"
              />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 4: DỊCH VỤ & CÔNG TƠ ĐỒNG HỒ */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <div className="space-y-3">
            <Form.Item
              label={
                <span className="text-stay-text font-medium">
                  Dịch vụ áp dụng trong hợp đồng
                </span>
              }
              name="serviceIds"
              rules={[
                { required: true, message: 'Vui lòng chọn ít nhất 1 dịch vụ áp dụng' },
              ]}
              className="mb-2"
            >
              <Select
                mode="multiple"
                placeholder="Chọn các dịch vụ áp dụng..."
                className="w-full min-h-[40px]"
                options={availableServices.map((s: any) => {
                  const info = getBillingMethodInfo(
                    s.billingMethod,
                    s.chargingType,
                    s.serviceName || s.name,
                    s.category
                  );
                  const priceFormatted = formatServicePriceWithUnit(s);
                  return {
                    label: `${s.serviceName || s.name} - ${priceFormatted} [Cách tính: ${info.shortLabel}]`,
                    value: s.id,
                  };
                })}
              />
            </Form.Item>

            {/* Khối nhập chỉ số công tơ ban đầu */}
            {meterServices.length > 0 && (
              <div className="p-3.5 rounded-lg border border-stay-border space-y-3 mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {meterServices.map((srv: any) => {
                    const sUnit = resolveServiceUnit(srv);
                    const sName = srv.serviceName || srv.name || 'Dịch vụ';
                    return (
                      <Form.Item
                        key={srv.id}
                        label={
                          <span className="text-stay-text font-medium">
                            Chỉ số ban đầu: <strong>{sName}</strong>
                          </span>
                        }
                        name={['meterReadings', String(srv.id)]}
                        rules={[
                          {
                            required: true,
                            message: `Nhập chỉ số ban đầu của ${sName} (${sUnit})`,
                          },
                        ]}
                        className="mb-0"
                      >
                        <InputNumber
                          min={0}
                          className="w-full h-10 font-mono font-medium"
                          placeholder={`Nhập chỉ số ban đầu (${sUnit})...`}
                        />
                      </Form.Item>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: ĐIỀU KHOẢN */}
        <div className="space-y-3 pt-4 border-t border-stay-border-subtle">
          <Form.Item
            name="termsAndConditions"
            label="Điều khoản & thỏa thuận chung"
            className="mb-0"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Đóng tiền phòng đúng hạn từ ngày 1-5 hàng tháng, không nuôi thú cưng gây ồn, giữ gìn vệ sinh chung..."
              className="rounded-lg p-3"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

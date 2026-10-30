import React, { useEffect, useState } from 'react';
import { Modal, Form } from '@/shared/components';
import { InputNumber, Tooltip } from 'antd';
import { HelpCircle, FileText } from 'lucide-react';
import { RentalContract, TerminateContractDto } from '@/shared/types/landlord';

interface TerminateContractModalProps {
  open: boolean;
  contract: RentalContract | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (contractId: string | number, dto: TerminateContractDto) => Promise<void>;
}

export const TerminateContractModal: React.FC<TerminateContractModalProps> = ({
  open,
  contract,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [calculatedRefund, setCalculatedRefund] = useState<number | null>(null);

  // Chỉ lấy các dịch vụ áp dụng công tơ (METER_INDEX) trong hợp đồng
  const meterServices = (contract?.services || []).filter(
    (s) => s.billingMethod === 'METER_INDEX'
  );

  const calculateRefund = (
    ctr: RentalContract,
    readings: Record<string, number>,
    damages: number
  ) => {
    let totalUtilityCost = 0;
    (ctr.services || []).forEach((s) => {
      if (s.billingMethod === 'METER_INDEX') {
        const sKey = String(s.id);
        const finalVal = Number(readings?.[sKey] ?? s.lastIndex ?? 0);
        const initVal = Number(s.lastIndex ?? 0);
        const consumed = Math.max(0, finalVal - initVal);
        const price = Number(s.appliedUnitPrice || 0);
        totalUtilityCost += consumed * price;
      }
    });

    const refund = (ctr.depositAmount || 0) - totalUtilityCost - damages;
    setCalculatedRefund(refund);
  };

  useEffect(() => {
    if (open && contract) {
      form.resetFields();
      const initialMeterReadings: Record<string, number> = {};
      (contract.services || []).forEach((s) => {
        if (s.billingMethod === 'METER_INDEX') {
          initialMeterReadings[String(s.id)] = s.lastIndex ?? 0;
        }
      });

      form.setFieldsValue({
        meterReadings: initialMeterReadings,
        repairDoorFee: 0,
        cardFee: 0,
      });

      calculateRefund(contract, initialMeterReadings, 0);
    }
  }, [open, contract]);

  const handleValuesChange = (_: any, allValues: any) => {
    if (!contract) return;
    const damage =
      Number(allValues.repairDoorFee || 0) + Number(allValues.cardFee || 0);
    calculateRefund(contract, allValues.meterReadings || {}, damage);
  };

  const handleFinish = async () => {
    if (!contract) return;
    try {
      const values = await form.validateFields();
      const damageTotal = (values.repairDoorFee || 0) + (values.cardFee || 0);

      const readingsPayload = meterServices.map((s) => {
        const sKey = String(s.id);
        const finalVal = Number(values.meterReadings?.[sKey] ?? s.lastIndex ?? 0);
        return {
          contractServiceId: Number(s.id),
          finalIndex: finalVal,
        };
      });

      await onSubmit(contract.id, {
        meterReadings: readingsPayload,
        damageCost: damageTotal,
        damageNote: 'Sửa chữa hỏng hóc & Mất thẻ từ/chìa khóa',
      });
    } catch {
      // Handled in mutation hook
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" />
          <span>Thanh lý hợp đồng #{contract?.id}</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Xác nhận thanh lý"
      cancelText="Hủy"
      width={780}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-4"
        onValuesChange={handleValuesChange}
      >
        {/* Tóm tắt hợp đồng */}
        <div className="bg-stay-bg-app/40 border border-stay-border rounded-xl p-4 text-[14px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-8">
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Hợp đồng:</span>
              <span className="text-stay-text font-semibold text-[14px]">{`HĐ #${contract?.id}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Tiền cọc ban đầu:</span>
              <span className="text-stay-text font-semibold text-[14px]">{(contract?.depositAmount ?? 0).toLocaleString()} VNĐ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Phòng thuê:</span>
              <span className="text-stay-text font-medium text-[14px]">{contract?.roomName || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stay-text-secondary text-[13px] w-32 shrink-0">Khách đại diện:</span>
              <span className="text-stay-text font-medium text-[14px]">{contract?.representativeTenantName || '—'}</span>
            </div>
          </div>
        </div>

        {/* Khối chỉ số công tơ chốt */}
        <div className="space-y-3 pt-3.5 border-t border-stay-border-subtle">
          <span className="text-[13px] font-semibold text-stay-text-secondary block">
            1. Chỉ số tiêu thụ các dịch vụ tính theo công tơ (METER_INDEX)
          </span>
          {meterServices.length === 0 ? (
            <p className="text-stay-text-secondary italic text-sm">
              Hợp đồng này không có dịch vụ nào tính theo công tơ (chỉ có dịch vụ cố định / theo đầu người).
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {meterServices.map((service) => {
                const sKey = String(service.id);
                const title = service.serviceName || 'Dịch vụ';
                return (
                  <Form.Item
                    key={sKey}
                    label={
                      <span className="text-stay-text font-medium">
                        {title} (Đầu kỳ: {service.lastIndex ?? 0} {service.unit || ''})
                      </span>
                    }
                    name={['meterReadings', sKey]}
                    className="mb-0"
                    rules={[
                      {
                        required: true,
                        message: `Nhập chỉ số chốt cho ${title}`,
                      },
                    ]}
                  >
                    <InputNumber
                      min={service.lastIndex ?? 0}
                      className="w-full h-10 font-mono font-medium"
                    />
                  </Form.Item>
                );
              })}
            </div>
          )}
        </div>

        {/* Khối khấu trừ hư hại */}
        <div className="space-y-3 pt-3.5 border-t border-stay-border-subtle">
          <span className="text-[13px] font-semibold text-stay-text-secondary block">
            2. Khấu trừ hư hại / bồi hoàn tài sản
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-[14px]">Chi phí sửa chữa hỏng hóc (VNĐ)</span>}
              name="repairDoorFee"
              className="mb-0"
            >
              <InputNumber
                min={0}
                step={50000}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-10 font-medium"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-[14px]">Phí mất thẻ từ / chìa khóa (VNĐ)</span>}
              name="cardFee"
              className="mb-0"
            >
              <InputNumber
                min={0}
                step={50000}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-10 font-medium"
              />
            </Form.Item>
          </div>
        </div>

        {/* Card kết quả hoàn trả cọc */}
        {calculatedRefund !== null && (
          <div className="pt-3.5 border-t border-stay-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stay-text text-[14px]">
                Số tiền hoàn trả khách thuê:
              </span>
              <Tooltip title="Số tiền hoàn trả = Tiền cọc gốc - Chi phí dịch vụ công tơ ngày bàn giao cuối - Tổng khấu trừ hư hại tài sản">
                <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
              </Tooltip>
            </div>
            <span className="text-[16px] font-bold text-stay-text">
              {calculatedRefund.toLocaleString()} VNĐ
            </span>
          </div>
        )}
      </Form>
    </Modal>
  );
};

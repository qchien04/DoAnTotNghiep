import React, { useEffect, useState } from 'react';
import { Modal, Form } from '@/shared/components';
import { InputNumber, message, Tooltip } from 'antd';
import { HelpCircle } from 'lucide-react';
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
    } catch (err: any) {
      if (err?.message) {
        message.error(err.message);
      }
    }
  };

  return (
    <Modal
      title="Thanh lý hợp đồng"
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
        {/* Banner tóm tắt hợp đồng */}
        <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border flex items-center justify-between">
          <div>
            <span className="text-xs text-stay-text-secondary uppercase font-semibold">Hợp đồng:</span>
            <p className="font-bold text-stay-text text-base">
              {`HĐ #${contract?.id}`}
            </p>
            <span className="text-xs text-stay-text-secondary">
              Phòng: <strong className="text-stay-text">{contract?.roomName}</strong> | Khách: <strong className="text-stay-text">{contract?.representativeTenantName}</strong>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-stay-text-secondary uppercase font-semibold">Tiền cọc ban đầu:</span>
            <p className="font-bold text-stay-primary text-base">
              {(contract?.depositAmount ?? 0).toLocaleString()} VNĐ
            </p>
          </div>
        </div>

        {/* Khối chỉ số công tơ chốt */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Chỉ số tiêu thụ các dịch vụ tính theo công tơ (METER_INDEX)
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            {meterServices.length === 0 ? (
              <p className="text-stay-text-secondary text-xs italic">
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
                        <span className="text-stay-text font-medium text-xs">
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
        </div>

        {/* Khối khấu trừ hư hại */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            2. Khấu trừ hư hại / bồi hoàn tài sản
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Chi phí sửa chữa hỏng hóc (VNĐ)</span>}
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
                label={<span className="text-stay-text font-medium text-xs">Phí mất thẻ từ / chìa khóa (VNĐ)</span>}
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
        </div>

        {/* Card kết quả hoàn trả cọc */}
        {calculatedRefund !== null && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                  Số tiền hoàn trả khách thuê:
                </span>
                <Tooltip title="Số tiền hoàn trả = Tiền cọc gốc - Chi phí dịch vụ công tơ ngày bàn giao cuối - Tổng khấu trừ hư hại tài sản">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 hover:opacity-80 cursor-pointer inline" />
                </Tooltip>
              </div>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {calculatedRefund.toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

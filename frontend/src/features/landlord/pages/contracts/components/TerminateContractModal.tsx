import React, { useEffect, useState } from 'react';
import { Modal, Form } from '@/shared/components';
import { InputNumber, message } from 'antd';
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

  const calculateRefund = (
    ctr: RentalContract,
    finalElec: number,
    finalWater: number,
    damages: number
  ) => {
    const initElec = ctr.initialElectricIndex ?? ctr.initialElectricityReading ?? 0;
    const initWater = ctr.initialWaterIndex ?? ctr.initialWaterReading ?? 0;
    const elecDiff = Math.max(0, finalElec - initElec);
    const waterDiff = Math.max(0, finalWater - initWater);
    const utilityCost = elecDiff * 3800 + waterDiff * 30000;
    const refund = ctr.depositAmount - utilityCost - damages;
    setCalculatedRefund(refund);
  };

  useEffect(() => {
    if (open && contract) {
      form.resetFields();
      const initElec = contract.initialElectricIndex ?? contract.initialElectricityReading ?? 0;
      const initWater = contract.initialWaterIndex ?? contract.initialWaterReading ?? 0;
      const defaultFinalElec = initElec + 25;
      const defaultFinalWater = initWater + 2;
      const defaultDamage = 300000;

      form.setFieldsValue({
        finalElectricityReading: defaultFinalElec,
        finalWaterReading: defaultFinalWater,
        repairDoorFee: 200000,
        cardFee: 100000,
      });

      calculateRefund(contract, defaultFinalElec, defaultFinalWater, defaultDamage);
    }
  }, [open, contract]);

  const handleValuesChange = (_: any, allValues: any) => {
    if (!contract) return;
    const elec = Number(allValues.finalElectricityReading || 0);
    const water = Number(allValues.finalWaterReading || 0);
    const damage =
      Number(allValues.repairDoorFee || 0) + Number(allValues.cardFee || 0);
    calculateRefund(contract, elec, water, damage);
  };

  const handleFinish = async () => {
    if (!contract) return;
    try {
      const values = await form.validateFields();
      await onSubmit(contract.id, {
        finalElectricityReading: values.finalElectricityReading,
        finalWaterReading: values.finalWaterReading,
        damageDeductions: [
          { description: 'Sửa chữa hỏng hóc', amount: values.repairDoorFee || 0 },
          { description: 'Mất thẻ từ/chìa khóa', amount: values.cardFee || 0 },
        ],
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
      width={680}
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
            <span className="text-xs text-stay-text-secondary uppercase font-semibold">Mã hợp đồng:</span>
            <p className="font-bold text-stay-text text-base">
              {contract?.contractCode || contract?.contractNumber || `HD #${contract?.id}`}
            </p>
            <span className="text-xs text-stay-text-secondary">
              Phòng: <strong className="text-stay-text">{contract?.roomCode || contract?.roomName}</strong> | Khách: <strong className="text-stay-text">{contract?.representativeTenantName || contract?.tenantName}</strong>
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
            1. Chỉ số tiêu thụ điện nước chốt ngày bàn giao
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-stay-text font-medium text-xs">
                    Chỉ số điện chốt cuối (kWh) (Đầu kỳ: {contract?.initialElectricIndex ?? contract?.initialElectricityReading ?? 0})
                  </span>
                }
                name="finalElectricityReading"
                className="mb-0"
                rules={[{ required: true, message: 'Nhập chỉ số điện chốt cuối' }]}
              >
                <InputNumber min={0} className="w-full h-10 font-mono font-medium" />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-stay-text font-medium text-xs">
                    Chỉ số nước chốt cuối (m³) (Đầu kỳ: {contract?.initialWaterIndex ?? contract?.initialWaterReading ?? 0})
                  </span>
                }
                name="finalWaterReading"
                className="mb-0"
                rules={[{ required: true, message: 'Nhập chỉ số nước chốt cuối' }]}
              >
                <InputNumber min={0} className="w-full h-10 font-mono font-medium" />
              </Form.Item>
            </div>
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
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">
                Số tiền hoàn trả khách thuê:
              </span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {calculatedRefund.toLocaleString()} VNĐ
              </span>
            </div>
            <p className="text-xs text-stay-text-secondary mt-1.5">
              * Số tiền hoàn trả = Tiền cọc gốc - Chi phí điện nước ngày bàn giao cuối - Tổng khấu trừ hư hại tài sản.
            </p>
          </div>
        )}
      </Form>
    </Modal>
  );
};

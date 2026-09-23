import React, { useEffect, useState, useMemo } from 'react';
import {
  Receipt,
  FileText,
  Layers,
  Plus,
  Zap,
  Droplets,
  Sparkles,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Modal, Form, Input, Select, Button, Tag } from '@/shared/components';
import { InputNumber, Alert, message } from 'antd';
import { CreateBillDto, Room, RentalContract, ContractServiceItem } from '@/shared/types/landlord';
import { DynamicServiceItem } from '../types';

interface CreateBillModalProps {
  open: boolean;
  rooms: Room[];
  contracts: RentalContract[];
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (dto: CreateBillDto) => Promise<void>;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({
  open,
  rooms,
  contracts,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [selectedRoomId, setSelectedRoomId] = useState<number | string | null>(null);
  const [activeContract, setActiveContract] = useState<RentalContract | null>(null);
  const [dynamicServices, setDynamicServices] = useState<DynamicServiceItem[]>([]);
  const [roomRentPrice, setRoomRentPrice] = useState<number>(3800000);
  const [otherFee, setOtherFee] = useState<number>(0);

  // Lọc danh sách phòng: Ưu tiên các phòng đang có hợp đồng hoặc trạng thái RENTED
  const availableRoomsForBill = useMemo(() => {
    return rooms.map((r: any) => {
      const contract =
        contracts.find(
          (c: any) => Number(c.roomId) === Number(r.id) && c.status === 'ACTIVE'
        ) || contracts.find((c: any) => Number(c.roomId) === Number(r.id));

      const tenantName = contract?.representativeTenantName || contract?.tenantName || 'Chưa ký HĐ';
      const isRented = r.status === 'RENTED' || !!contract;
      return {
        ...r,
        contract,
        tenantName,
        isRented,
      };
    });
  }, [rooms, contracts]);

  const setupServicesForRoom = (targetRoomId: number | string) => {
    const targetRoom = rooms.find((r: any) => Number(r.id) === Number(targetRoomId));
    const targetContract =
      contracts.find(
        (c: any) => Number(c.roomId) === Number(targetRoomId) && c.status === 'ACTIVE'
      ) || contracts.find((c: any) => Number(c.roomId) === Number(targetRoomId));

    setActiveContract(targetContract || null);

    const rent = Number(
      targetContract?.rentPrice ??
        targetContract?.monthlyRent ??
        targetRoom?.listedPrice ??
        targetRoom?.price ??
        3800000
    );
    setRoomRentPrice(rent);

    const initialElec = Number(
      targetContract?.initialElectricIndex ?? targetContract?.initialElectricityReading ?? 0
    );
    const initialWater = Number(
      targetContract?.initialWaterIndex ?? targetContract?.initialWaterReading ?? 0
    );

    const contractServices: ContractServiceItem[] = targetContract?.services || [];
    let items: DynamicServiceItem[] = [];

    if (contractServices.length > 0) {
      items = contractServices.map((cs, idx) => {
        const method = cs.billingMethod || 'FIXED_PER_ROOM';
        const price = Number(cs.appliedUnitPrice || 0);
        let prevIdx = cs.lastIndex !== undefined && cs.lastIndex !== null ? Number(cs.lastIndex) : 0;
        let curIdx = prevIdx;
        let qty = 1;

        if (method === 'METER_INDEX') {
          const nameLower = (cs.serviceName || '').toLowerCase();
          if (nameLower.includes('điện')) {
            prevIdx = prevIdx > 0 ? prevIdx : (initialElec || 1420);
            curIdx = prevIdx + 115;
          } else if (nameLower.includes('nước')) {
            prevIdx = prevIdx > 0 ? prevIdx : (initialWater || 85);
            curIdx = prevIdx + 8;
          } else {
            curIdx = prevIdx + 10;
          }
          qty = Math.max(0, curIdx - prevIdx);
        } else if (method === 'FIXED_PER_PERSON') {
          qty = Number(targetRoom?.currentOccupancy || 2);
        } else {
          qty = 1;
        }

        const amt = qty * price;

        return {
          key: `service-${cs.id || idx}-${Date.now()}`,
          contractServiceId: cs.id,
          serviceName: cs.serviceName,
          billingMethod: method,
          unit: cs.unit || (method === 'METER_INDEX' ? 'số' : 'tháng'),
          unitPrice: price,
          previousIndex: method === 'METER_INDEX' ? prevIdx : undefined,
          currentIndex: method === 'METER_INDEX' ? curIdx : undefined,
          quantity: qty,
          amount: amt,
          note: cs.unit,
        };
      });
    } else {
      const defaultElecPrev = initialElec || 1420;
      const defaultWaterPrev = initialWater || 85;
      items = [
        {
          key: `default-elec-${Date.now()}`,
          serviceName: 'Điện sinh hoạt',
          billingMethod: 'METER_INDEX',
          unit: 'kWh',
          unitPrice: 3800,
          previousIndex: defaultElecPrev,
          currentIndex: defaultElecPrev + 115,
          quantity: 115,
          amount: 115 * 3800,
          note: 'Theo công tơ',
        },
        {
          key: `default-water-${Date.now()}`,
          serviceName: 'Nước sinh hoạt',
          billingMethod: 'METER_INDEX',
          unit: 'm³',
          unitPrice: 30000,
          previousIndex: defaultWaterPrev,
          currentIndex: defaultWaterPrev + 8,
          quantity: 8,
          amount: 8 * 30000,
          note: 'Theo đồng hồ nước',
        },
        {
          key: `default-wifi-${Date.now()}`,
          serviceName: 'Internet Wifi tốc độ cao',
          billingMethod: 'FIXED_PER_ROOM',
          unit: 'phòng/tháng',
          unitPrice: 100000,
          quantity: 1,
          amount: 100000,
          note: 'Cố định',
        },
        {
          key: `default-cleaning-${Date.now()}`,
          serviceName: 'Vệ sinh hành lang & Rác',
          billingMethod: 'FIXED_PER_ROOM',
          unit: 'phòng/tháng',
          unitPrice: 100000,
          quantity: 1,
          amount: 100000,
          note: 'Cố định',
        },
      ];
    }

    setDynamicServices(items);
  };

  useEffect(() => {
    if (open) {
      form.resetFields();
      const today = new Date();
      const defaultPeriod = `${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      const due = new Date();
      due.setDate(due.getDate() + 10);
      const defaultDueDate = due.toISOString().split('T')[0];

      const rentedRoom = availableRoomsForBill.find((r: any) => r.isRented) || availableRoomsForBill[0];
      const initialRoomId = rentedRoom?.id || null;

      setSelectedRoomId(initialRoomId);
      setOtherFee(0);

      form.setFieldsValue({
        roomId: initialRoomId,
        billingPeriod: defaultPeriod,
        dueDate: defaultDueDate,
        otherAmount: 0,
        otherNote: '',
      });

      if (initialRoomId) {
        setupServicesForRoom(initialRoomId);
      }
    }
  }, [open, rooms, contracts]);

  const handleRoomSelectChange = (roomId: number | string) => {
    setSelectedRoomId(roomId);
    setupServicesForRoom(roomId);
  };

  const handleServiceChange = (
    key: string,
    field: 'currentIndex' | 'quantity' | 'unitPrice' | 'serviceName',
    value: any
  ) => {
    setDynamicServices((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const updated = { ...item, [field]: value };

        if (item.billingMethod === 'METER_INDEX') {
          const cur = field === 'currentIndex' ? Number(value || 0) : Number(item.currentIndex || 0);
          const prevIdx = Number(item.previousIndex || 0);
          const qty = Math.max(0, cur - prevIdx);
          updated.quantity = qty;
          updated.amount = qty * Number(updated.unitPrice || 0);
        } else {
          const qty = field === 'quantity' ? Number(value || 0) : Number(item.quantity || 1);
          const price = field === 'unitPrice' ? Number(value || 0) : Number(item.unitPrice || 0);
          updated.quantity = qty;
          updated.amount = qty * price;
        }

        return updated;
      })
    );
  };

  const handleAddCustomService = () => {
    const newService: DynamicServiceItem = {
      key: `custom-${Date.now()}`,
      serviceName: 'Phí dịch vụ phát sinh',
      billingMethod: 'FIXED_PER_ROOM',
      unit: 'lần',
      unitPrice: 50000,
      quantity: 1,
      amount: 50000,
      note: 'Phát sinh trong kỳ',
    };
    setDynamicServices((prev) => [...prev, newService]);
  };

  const handleRemoveService = (key: string) => {
    setDynamicServices((prev) => prev.filter((s) => s.key !== key));
  };

  const servicesTotal = useMemo(() => {
    return dynamicServices.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }, [dynamicServices]);

  const grandTotal = useMemo(() => {
    return roomRentPrice + servicesTotal + otherFee;
  }, [roomRentPrice, servicesTotal, otherFee]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRoomId) {
        message.warning('Vui lòng chọn phòng trọ để lập hóa đơn!');
        return;
      }

      const targetContract =
        activeContract ||
        contracts.find(
          (c: any) => Number(c.roomId) === Number(selectedRoomId) && c.status === 'ACTIVE'
        ) ||
        contracts.find((c: any) => Number(c.roomId) === Number(selectedRoomId));

      const electricItem = dynamicServices.find(
        (s) => s.serviceName.toLowerCase().includes('điện') && s.billingMethod === 'METER_INDEX'
      );
      const waterItem = dynamicServices.find(
        (s) => s.serviceName.toLowerCase().includes('nước') && s.billingMethod === 'METER_INDEX'
      );

      const payload: CreateBillDto = {
        contractId: targetContract ? targetContract.id : undefined,
        roomId: selectedRoomId,
        billingPeriod: values.billingPeriod,
        dueDate: values.dueDate,
        currentElectricIndex: electricItem?.currentIndex,
        currentWaterIndex: waterItem?.currentIndex,
        otherAmount: Number(values.otherAmount || 0),
        otherNote: values.otherNote || '',
        items: dynamicServices.map((item) => ({
          contractServiceId: item.contractServiceId,
          itemName: item.serviceName,
          billingMethod: item.billingMethod,
          previousIndex: item.previousIndex,
          currentIndex: item.currentIndex,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          note:
            item.billingMethod === 'METER_INDEX'
              ? `${item.quantity} ${item.unit} (Từ số ${item.previousIndex} đến ${item.currentIndex})`
              : `${item.quantity} ${item.unit}`,
        })),
      };

      await onSubmit(payload);
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
          <Receipt className="w-5 h-5" />
          <span>Tính Tiền Phòng & Phát Hành Hóa Đơn Cước Tháng</span>
        </div>
      }
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Phát hành hóa đơn"
      cancelText="Đóng"
      width={880}
      className="stay-modal-wide"
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-5"
        onValuesChange={(changed) => {
          if (changed.roomId) {
            handleRoomSelectChange(changed.roomId);
          }
          if (changed.otherAmount !== undefined) {
            setOtherFee(Number(changed.otherAmount || 0));
          }
        }}
      >
        {/* SECTION 1: PHÒNG & THỜI HẠN */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <Calendar className="w-4 h-4 text-stay-primary" />
            <span>1. Thông tin Phòng & Chu kỳ thu cước</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Chọn phòng trọ (*)</span>}
              name="roomId"
              rules={[{ required: true, message: 'Vui lòng chọn phòng (*)' }]}
              className="mb-0"
            >
              <Select
                showSearch
                className="w-full h-10"
                filterOption={(input, option) =>
                  String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableRoomsForBill.map((r: any) => ({
                  label: `${r.roomCode || r.code || r.name} - ${r.tenantName} (${(r.listedPrice || r.price || 0).toLocaleString()} đ)`,
                  value: r.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Kỳ cước hóa đơn (*)</span>}
              name="billingPeriod"
              rules={[{ required: true, message: 'Nhập kỳ cước (MM/YYYY) (*)' }]}
              className="mb-0"
            >
              <Input placeholder="10/2026..." className="h-10" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Hạn nộp tiền (*)</span>}
              name="dueDate"
              rules={[{ required: true, message: 'Chọn hạn nộp (*)' }]}
              className="mb-0"
            >
              <Input type="date" className="h-10" />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 2: HỢP ĐỒNG & TIỀN PHÒNG */}
        <div className="p-4 rounded-2xl bg-stay-primary/5 border border-stay-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-stay-primary/10 text-stay-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-stay-text-secondary font-medium">Hợp đồng thuê hiệu lực:</p>
              <p className="text-sm font-bold text-stay-text">
                {activeContract
                  ? activeContract.contractCode || activeContract.contractNumber || `HĐ #${activeContract.id}`
                  : 'Chưa gắn hợp đồng - Dùng giá phòng mặc định'}
                {activeContract?.representativeTenantName && ` (Khách: ${activeContract.representativeTenantName})`}
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-stay-text-secondary block">Tiền phòng cố định:</span>
            <span className="text-lg font-black text-stay-primary">
              {roomRentPrice.toLocaleString()} đ
            </span>
          </div>
        </div>

        {/* SECTION 3: DANH SÁCH DỊCH VỤ ĐỘNG */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
              <Layers className="w-4 h-4 text-stay-primary" />
              <span>2. Các khoản mục dịch vụ theo hợp đồng ({dynamicServices.length} mục)</span>
            </div>
            <Button
              size="small"
              type="dashed"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddCustomService}
              className="text-xs text-stay-primary border-stay-primary/50 rounded-lg"
            >
              Thêm khoản mục khác
            </Button>
          </div>

          {dynamicServices.length === 0 ? (
            <Alert
              message="Phòng này chưa cấu hình dịch vụ trong hợp đồng. Bạn có thể bấm 'Thêm khoản mục khác' để nhập chi phí."
              type="info"
              showIcon
              className="rounded-xl"
            />
          ) : (
            <div className="space-y-2.5 pt-1">
              {dynamicServices.map((svc) => (
                <div
                  key={svc.key}
                  className="p-3.5 rounded-xl border border-stay-border bg-stay-card-bg hover:border-stay-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Tên dịch vụ & Badge hình thức */}
                    <div className="flex items-center gap-2.5 min-w-[210px]">
                      {svc.serviceName.toLowerCase().includes('điện') ? (
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                          <Zap className="w-4 h-4" />
                        </div>
                      ) : svc.serviceName.toLowerCase().includes('nước') ? (
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <Droplets className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-stay-primary/10 text-stay-primary">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-stay-text leading-tight">{svc.serviceName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Tag className="text-[10px] leading-tight px-1.5 py-0 m-0 bg-stay-primary-subtle text-stay-primary border-stay-primary/30 font-medium rounded">
                            {svc.billingMethod === 'METER_INDEX'
                              ? 'Công tơ'
                              : svc.billingMethod === 'FIXED_PER_PERSON'
                              ? 'Theo người'
                              : 'Cố định'}
                          </Tag>
                          <span className="text-[11px] text-stay-text-secondary font-medium">
                            {svc.unitPrice.toLocaleString()} đ/{svc.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vùng nhập liệu động */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {svc.billingMethod === 'METER_INDEX' ? (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-stay-text-secondary text-xs">Số cũ:</span>
                            <span className="font-bold bg-stay-bg-app text-stay-text px-2.5 py-1 rounded-lg border border-stay-border">
                              {svc.previousIndex ?? 0}
                            </span>
                          </div>
                          <span className="text-stay-text-secondary">&rarr;</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-stay-text-secondary text-xs">Số mới (*):</span>
                            <InputNumber
                              min={svc.previousIndex ?? 0}
                              value={svc.currentIndex}
                              onChange={(val) => handleServiceChange(svc.key, 'currentIndex', val)}
                              className="w-28 h-9 pt-0.5 font-bold"
                            />
                          </div>
                          <span className="text-stay-primary font-semibold text-xs pl-1">
                            (= {svc.quantity} {svc.unit})
                          </span>
                        </div>
                      ) : svc.billingMethod === 'FIXED_PER_PERSON' ? (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-stay-text-secondary text-xs">Số người:</span>
                          <InputNumber
                            min={1}
                            value={svc.quantity}
                            onChange={(val) => handleServiceChange(svc.key, 'quantity', val)}
                            className="w-24 h-9 pt-0.5 font-bold"
                          />
                          <span className="text-stay-text-secondary text-xs">người</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-stay-text-secondary text-xs">Số lượng:</span>
                          <InputNumber
                            min={1}
                            value={svc.quantity}
                            onChange={(val) => handleServiceChange(svc.key, 'quantity', val)}
                            className="w-24 h-9 pt-0.5 font-bold"
                          />
                          <span className="text-stay-text-secondary text-xs">{svc.unit}</span>
                        </div>
                      )}

                      {/* Thành tiền dịch vụ & Nút xóa */}
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-stay-text min-w-[95px] text-right">
                          {svc.amount.toLocaleString()} đ
                        </span>
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleRemoveService(svc.key)}
                          title="Xóa mục này"
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: PHỤ THU PHÁT SINH */}
        <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-4">
          <div className="flex items-center gap-2 font-bold text-stay-text text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Chi phí phụ thu phát sinh trong kỳ (nếu có)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Số tiền phụ thu (VNĐ)</span>}
              name="otherAmount"
              className="mb-0"
            >
              <InputNumber
                min={0}
                step={10000}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                className="w-full h-10 pt-1"
                placeholder="0 đ..."
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text font-medium text-xs">Lý do phụ thu phát sinh</span>}
              name="otherNote"
              className="mb-0"
            >
              <Input placeholder="Ví dụ: Vệ sinh điều hòa, phí làm thẻ xe bổ sung..." className="h-10" />
            </Form.Item>
          </div>
        </div>

        {/* SECTION 5: BẢNG CHIẾT TÍNH CHI PHÍ MINH BẠCH */}
        <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-primary/30 space-y-3">
          <p className="font-bold text-stay-text text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-stay-primary" />
            <span>Bảng chiết tính chi phí minh bạch kỳ này:</span>
          </p>

          <div className="space-y-1.5 text-xs text-stay-text">
            <div className="flex justify-between py-1 border-b border-stay-border/50">
              <span className="text-stay-text-secondary">1. Tiền thuê phòng cố định:</span>
              <span className="font-bold text-stay-text">{roomRentPrice.toLocaleString()} đ</span>
            </div>

            {dynamicServices.map((svc) => (
              <div key={svc.key} className="flex justify-between py-1 border-b border-stay-border/50">
                <span className="text-stay-text-secondary">
                  • {svc.serviceName} ({svc.quantity} {svc.unit} x {svc.unitPrice.toLocaleString()}đ):
                </span>
                <span className="font-semibold text-stay-text">{svc.amount.toLocaleString()} đ</span>
              </div>
            ))}

            {otherFee > 0 && (
              <div className="flex justify-between py-1 border-b border-stay-border/50 text-amber-500 font-semibold">
                <span>+ Phụ thu phát sinh:</span>
                <span>{otherFee.toLocaleString()} đ</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stay-border flex justify-between items-center">
            <span className="font-bold text-stay-text text-sm">TỔNG CỘNG HÓA ĐƠN THU TIỀN:</span>
            <span className="text-2xl font-black text-stay-primary">
              {grandTotal.toLocaleString()} VNĐ
            </span>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

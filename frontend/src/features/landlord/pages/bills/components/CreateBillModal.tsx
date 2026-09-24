import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { Modal, Form, Input, Select, Button, Tag } from '@/shared/components';
import { InputNumber, Alert, message } from 'antd';
import { CreateBillDto, Room, RentalContract, ContractServiceItem } from '@/shared/types/landlord';
import { DynamicServiceItem, BillAdjustmentItem } from '../types';

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
  const [adjustments, setAdjustments] = useState<BillAdjustmentItem[]>([]);

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
      setAdjustments([]);

      form.setFieldsValue({
        roomId: initialRoomId,
        billingPeriod: defaultPeriod,
        dueDate: defaultDueDate,
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

  const handleRemoveService = (key: string) => {
    setDynamicServices((prev) => prev.filter((s) => s.key !== key));
  };

  // Quản lý danh sách các khoản Phụ thu & Giảm trừ linh hoạt
  const handleAddAdjustment = (type: 'SURCHARGE' | 'DISCOUNT') => {
    const newItem: BillAdjustmentItem = {
      id: `adj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      reason: '',
      quantity: 1,
      unitCost: 0,
      unit: 'lần',
    };
    setAdjustments((prev) => [...prev, newItem]);
  };

  const handleRemoveAdjustment = (id: string) => {
    setAdjustments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdjustmentChange = (
    id: string,
    field: keyof BillAdjustmentItem,
    value: any
  ) => {
    setAdjustments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const servicesTotal = useMemo(() => {
    return dynamicServices.reduce((acc, cur) => acc + (cur.amount || 0), 0);
  }, [dynamicServices]);

  const totalSurcharge = useMemo(() => {
    return adjustments
      .filter((a) => a.type === 'SURCHARGE')
      .reduce((acc, cur) => acc + Number(cur.quantity || 0) * Number(cur.unitCost || 0), 0);
  }, [adjustments]);

  const totalDiscount = useMemo(() => {
    return adjustments
      .filter((a) => a.type === 'DISCOUNT')
      .reduce((acc, cur) => acc + Number(cur.quantity || 0) * Number(cur.unitCost || 0), 0);
  }, [adjustments]);

  const grandTotal = useMemo(() => {
    return Math.max(0, roomRentPrice + servicesTotal + totalSurcharge - totalDiscount);
  }, [roomRentPrice, servicesTotal, totalSurcharge, totalDiscount]);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRoomId) {
        message.warning('Vui lòng chọn phòng trọ để lập hóa đơn!');
        return;
      }

      // Kiểm tra tính hợp lệ của các khoản phụ thu / giảm trừ
      for (let i = 0; i < adjustments.length; i++) {
        const adj = adjustments[i];
        const isSurch = adj.type === 'SURCHARGE';
        const label = isSurch ? 'phụ thu' : 'giảm tiền';
        if (!adj.reason || !adj.reason.trim()) {
          message.warning(`Vui lòng nhập nguyên nhân cho khoản ${label} thứ ${i + 1}!`);
          return;
        }
        if (!adj.unitCost || adj.unitCost <= 0) {
          message.warning(`Vui lòng nhập đơn giá lớn hơn 0 cho khoản ${label}: "${adj.reason}"!`);
          return;
        }
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

      // Đóng gói các dòng phụ thu / giảm trừ thành các invoice item minh bạch
      const adjustmentInvoiceItems = adjustments.map((adj) => {
        const isSurcharge = adj.type === 'SURCHARGE';
        const prefix = isSurcharge ? '[Phụ thu]' : '[Giảm trừ]';
        const reason = adj.reason.trim() || (isSurcharge ? 'Phụ thu phát sinh' : 'Giảm trừ chi phí');
        const qty = Number(adj.quantity || 1);
        const cost = Number(adj.unitCost || 0);
        const amount = isSurcharge ? qty * cost : -(qty * cost);
        const unitPrice = isSurcharge ? cost : -cost;
        const unit = adj.unit?.trim() || 'lần';

        return {
          contractServiceId: undefined,
          itemName: `${prefix} ${reason}`,
          billingMethod: 'FIXED_PER_UNIT',
          quantity: qty,
          unitPrice: unitPrice,
          amount: amount,
          note: `${qty} ${unit} x ${cost.toLocaleString()} đ${adj.reason ? ` - ${adj.reason}` : ''}`,
        };
      });

      const adjustmentSummaryNote = adjustments
        .map(
          (a) =>
            `${a.type === 'SURCHARGE' ? '+' : '-'}${a.reason.trim() || 'Khoản phát sinh'}: ${(
              Number(a.quantity || 1) * Number(a.unitCost || 0)
            ).toLocaleString()} đ`
        )
        .join('; ');

      const payload: CreateBillDto = {
        contractId: targetContract ? targetContract.id : undefined,
        roomId: selectedRoomId,
        billingPeriod: values.billingPeriod,
        dueDate: values.dueDate,
        currentElectricIndex: electricItem?.currentIndex,
        currentWaterIndex: waterItem?.currentIndex,
        otherAmount: 0,
        otherNote: adjustmentSummaryNote || undefined,
        items: [
          ...dynamicServices.map((item) => ({
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
          ...adjustmentInvoiceItems,
        ],
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
      title="Lập hóa đơn thu tiền"
      open={open}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Phát hành hóa đơn"
      cancelText="Đóng"
      width={920}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-4"
        onValuesChange={(changed) => {
          if (changed.roomId) {
            handleRoomSelectChange(changed.roomId);
          }
        }}
      >
        {/* SECTION 1: PHÒNG & THỜI HẠN */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            1. Thông tin phòng & chu kỳ thu cước
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Chọn phòng trọ (*)</span>}
                name="roomId"
                rules={[{ required: true, message: 'Vui lòng chọn phòng (*)' }]}
                className="mb-0"
              >
                <Select
                  showSearch
                  className="w-full h-9"
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
                <Input placeholder="10/2026..." className="h-9 text-xs" />
              </Form.Item>

              <Form.Item
                label={<span className="text-stay-text font-medium text-xs">Hạn nộp tiền (*)</span>}
                name="dueDate"
                rules={[{ required: true, message: 'Chọn hạn nộp (*)' }]}
                className="mb-0"
              >
                <Input type="date" className="h-9 text-xs" />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* THÔNG TIN HỢP ĐỒNG & GIÁ THUÊ PHÒNG */}
        <div className="p-3 rounded-lg bg-stay-card-bg border border-stay-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-stay-text-secondary text-[11px]">Hợp đồng thuê phòng:</p>
            <p className="font-semibold text-stay-text text-xs">
              {activeContract
                ? activeContract.contractCode || activeContract.contractNumber || `HĐ #${activeContract.id}`
                : 'Chưa gắn hợp đồng - Dùng giá phòng mặc định'}
              {activeContract?.representativeTenantName && ` (Khách: ${activeContract.representativeTenantName})`}
            </p>
          </div>
          <div className="sm:text-right">
            <span className="text-stay-text-secondary text-[11px] block">Tiền thuê phòng:</span>
            <span className="text-sm font-semibold text-stay-text">
              {roomRentPrice.toLocaleString()} đ/tháng
            </span>
          </div>
        </div>

        {/* SECTION 2: BẢNG DỊCH VỤ THEO HỢP ĐỒNG */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            2. Các khoản mục dịch vụ theo hợp đồng ({dynamicServices.length})
          </h3>

          {dynamicServices.length === 0 ? (
            <Alert
              message="Phòng này chưa cấu hình dịch vụ trong hợp đồng. Nếu có chi phí phát sinh, bạn có thể thêm ở mục Phụ thu bên dưới."
              type="info"
              showIcon
              className="rounded-xl text-xs"
            />
          ) : (
            <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 pl-3">Dịch vụ</th>
                    <th className="p-2.5 text-right w-28">Đơn giá</th>
                    <th className="p-2.5 text-center w-24">Chỉ số cũ</th>
                    <th className="p-2.5 text-center w-36">Chỉ số mới / SL</th>
                    <th className="p-2.5 text-center w-24">Sử dụng</th>
                    <th className="p-2.5 text-right w-32">Thành tiền</th>
                    <th className="p-2.5 text-center w-10 pr-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border text-stay-text">
                  {dynamicServices.map((svc) => (
                    <tr key={svc.key} className="hover:bg-stay-bg-app/40 transition-colors">
                      {/* Tên dịch vụ & Cách tính */}
                      <td className="p-2.5 pl-3">
                        <p className="font-semibold text-stay-text">{svc.serviceName}</p>
                        <p className="text-[11px] text-stay-text-secondary">
                          {svc.billingMethod === 'METER_INDEX'
                            ? 'Theo công tơ'
                            : svc.billingMethod === 'FIXED_PER_PERSON'
                            ? 'Theo người'
                            : 'Cố định'}
                        </p>
                      </td>

                      {/* Đơn giá */}
                      <td className="p-2.5 text-right whitespace-nowrap text-stay-text-secondary">
                        {svc.unitPrice.toLocaleString()} đ/{svc.unit}
                      </td>

                      {/* Chỉ số cũ */}
                      <td className="p-2.5 text-center whitespace-nowrap">
                        {svc.billingMethod === 'METER_INDEX' ? (
                          <span className="px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border font-semibold text-stay-text text-xs">
                            {svc.previousIndex ?? 0}
                          </span>
                        ) : (
                          <span className="text-stay-text-muted">-</span>
                        )}
                      </td>

                      {/* Chỉ số mới hoặc số lượng nhập */}
                      <td className="p-2.5 text-center">
                        {svc.billingMethod === 'METER_INDEX' ? (
                          <InputNumber
                            min={svc.previousIndex ?? 0}
                            value={svc.currentIndex}
                            onChange={(val) => handleServiceChange(svc.key, 'currentIndex', val)}
                            className="w-full h-8 text-xs font-bold text-center"
                            placeholder="Số mới"
                          />
                        ) : svc.billingMethod === 'FIXED_PER_PERSON' ? (
                          <InputNumber
                            min={1}
                            value={svc.quantity}
                            onChange={(val) => handleServiceChange(svc.key, 'quantity', val)}
                            className="w-full h-8 text-xs font-bold text-center"
                            addonAfter="người"
                          />
                        ) : (
                          <InputNumber
                            min={1}
                            value={svc.quantity}
                            onChange={(val) => handleServiceChange(svc.key, 'quantity', val)}
                            className="w-full h-8 text-xs font-bold text-center"
                            addonAfter={svc.unit}
                          />
                        )}
                      </td>

                      {/* Sản lượng sử dụng */}
                      <td className="p-2.5 text-center whitespace-nowrap font-medium text-stay-text">
                        {svc.quantity} {svc.unit}
                      </td>

                      {/* Thành tiền */}
                      <td className="p-2.5 text-right whitespace-nowrap font-bold text-stay-text">
                        {svc.amount.toLocaleString()} đ
                      </td>

                      {/* Xóa dòng nếu cần */}
                      <td className="p-2.5 text-center pr-3">
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                          onClick={() => handleRemoveService(svc.key)}
                          title="Bỏ dịch vụ này khỏi hóa đơn"
                          className="rounded-lg hover:bg-rose-500/10"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 3: BẢNG PHỤ THU & GIẢM TRỪ */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stay-text">
              3. Phụ thu phát sinh & giảm trừ cước phí ({adjustments.length})
            </h3>

            {/* 2 nút thao tác chuẩn, trung tính */}
            <div className="flex items-center gap-2">
              <Button
                size="small"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => handleAddAdjustment('SURCHARGE')}
                className="text-xs font-medium rounded-lg"
              >
                Thêm phụ thu (+)
              </Button>
              <Button
                size="small"
                icon={<Minus className="w-3.5 h-3.5" />}
                onClick={() => handleAddAdjustment('DISCOUNT')}
                className="text-xs font-medium rounded-lg"
              >
                Thêm giảm tiền (-)
              </Button>
            </div>
          </div>

          {adjustments.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-stay-border bg-stay-card-bg text-center text-xs text-stay-text-secondary">
              Chưa có phụ thu hoặc giảm trừ nào trong kỳ cước này. Bấm <strong>Thêm phụ thu (+)</strong> nếu có chi phí phát sinh hoặc <strong>Thêm giảm tiền (-)</strong> nếu có khuyến mãi/bù trừ.
            </div>
          ) : (
            <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 pl-3 w-28 text-center">Loại</th>
                    <th className="p-2.5">Nguyên nhân / Nội dung</th>
                    <th className="p-2.5 text-center w-20">SL</th>
                    <th className="p-2.5 text-center w-24">Đơn vị</th>
                    <th className="p-2.5 text-right w-36">Đơn giá (VNĐ)</th>
                    <th className="p-2.5 text-right w-32">Thành tiền</th>
                    <th className="p-2.5 text-center w-10 pr-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border text-stay-text">
                  {adjustments.map((adj) => {
                    const isSurcharge = adj.type === 'SURCHARGE';
                    const rowTotal = Number(adj.quantity || 1) * Number(adj.unitCost || 0);

                    return (
                      <tr key={adj.id} className="hover:bg-stay-bg-app/40 transition-colors">
                        {/* Loại: Phụ thu hay Giảm trừ */}
                        <td className="p-2.5 pl-3 text-center">
                          <Tag className="m-0 font-medium text-xs border-stay-border bg-stay-bg-app text-stay-text">
                            {isSurcharge ? '+ Phụ thu' : '- Giảm tiền'}
                          </Tag>
                        </td>

                        {/* Nguyên nhân */}
                        <td className="p-2.5">
                          <Input
                            placeholder={
                              isSurcharge
                                ? 'Nguyên nhân phụ thu (vd: Thẻ xe, sửa khóa...)'
                                : 'Lý do giảm tiền (vd: Giảm giá lễ, bù tiền điện...)'
                            }
                            value={adj.reason}
                            onChange={(e) => handleAdjustmentChange(adj.id, 'reason', e.target.value)}
                            className="w-full h-8 text-xs"
                          />
                        </td>

                        {/* Số lượng */}
                        <td className="p-2.5 text-center">
                          <InputNumber
                            min={1}
                            value={adj.quantity}
                            onChange={(val) => handleAdjustmentChange(adj.id, 'quantity', val || 1)}
                            className="w-full h-8 text-xs font-bold text-center"
                          />
                        </td>

                        {/* Đơn vị */}
                        <td className="p-2.5 text-center">
                          <Input
                            placeholder="lần"
                            value={adj.unit}
                            onChange={(e) => handleAdjustmentChange(adj.id, 'unit', e.target.value)}
                            className="w-full h-8 text-xs text-center"
                          />
                        </td>

                        {/* Đơn giá */}
                        <td className="p-2.5 text-right">
                          <InputNumber
                            min={0}
                            step={10000}
                            value={adj.unitCost}
                            onChange={(val) => handleAdjustmentChange(adj.id, 'unitCost', val || 0)}
                            formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(val) => (val ? Number(val.replace(/,/g, '')) : 0) as any}
                            placeholder="0"
                            className="w-full h-8 text-xs font-bold text-right"
                          />
                        </td>

                        {/* Thành tiền */}
                        <td className="p-2.5 text-right whitespace-nowrap font-bold text-stay-text">
                          {isSurcharge ? '+' : '-'} {rowTotal.toLocaleString()} đ
                        </td>

                        {/* Xóa */}
                        <td className="p-2.5 text-center pr-3">
                          <Button
                            size="small"
                            type="text"
                            danger
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => handleRemoveAdjustment(adj.id)}
                            title="Xóa dòng này"
                            className="rounded-lg hover:bg-rose-500/10"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 4: BẢNG CHIẾT TÍNH CHI PHÍ */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stay-text">
            4. Bảng chiết tính chi phí kỳ này
          </h3>
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border space-y-2.5 text-xs">
            <div className="space-y-1 text-stay-text divide-y divide-stay-border/60">
              <div className="flex justify-between py-1">
                <span className="text-stay-text-secondary">1. Tiền thuê phòng:</span>
                <span className="font-semibold text-stay-text">{roomRentPrice.toLocaleString()} đ</span>
              </div>

              {dynamicServices.map((svc) => (
                <div key={svc.key} className="flex justify-between py-1 pt-1.5">
                  <span className="text-stay-text-secondary">
                    • {svc.serviceName} ({svc.quantity} {svc.unit} x {svc.unitPrice.toLocaleString()} đ):
                  </span>
                  <span className="font-semibold text-stay-text">{svc.amount.toLocaleString()} đ</span>
                </div>
              ))}

              {/* Các khoản phụ thu */}
              {adjustments
                .filter((a) => a.type === 'SURCHARGE')
                .map((adj) => (
                  <div key={adj.id} className="flex justify-between py-1 pt-1.5 font-medium">
                    <span className="text-stay-text-secondary">
                      + [Phụ thu] {adj.reason || 'Khoản phát sinh'} ({adj.quantity} {adj.unit || 'lần'} x {Number(adj.unitCost || 0).toLocaleString()} đ):
                    </span>
                    <span className="font-bold text-stay-text">
                      + {(Number(adj.quantity || 1) * Number(adj.unitCost || 0)).toLocaleString()} đ
                    </span>
                  </div>
                ))}

              {/* Các khoản giảm trừ */}
              {adjustments
                .filter((a) => a.type === 'DISCOUNT')
                .map((adj) => (
                  <div key={adj.id} className="flex justify-between py-1 pt-1.5 font-medium">
                    <span className="text-stay-text-secondary">
                      - [Giảm trừ] {adj.reason || 'Khoản giảm chi phí'} ({adj.quantity} {adj.unit || 'lần'} x {Number(adj.unitCost || 0).toLocaleString()} đ):
                    </span>
                    <span className="font-bold text-stay-text">
                      - {(Number(adj.quantity || 1) * Number(adj.unitCost || 0)).toLocaleString()} đ
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2.5 border-t border-stay-border flex justify-between items-center">
              <span className="font-bold text-stay-text text-sm">TỔNG TIỀN HÓA ĐƠN:</span>
              <span className="text-xl font-bold text-stay-primary">
                {grandTotal.toLocaleString()} VNĐ
              </span>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};



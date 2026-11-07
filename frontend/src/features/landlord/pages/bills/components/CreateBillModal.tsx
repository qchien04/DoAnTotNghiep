import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { Modal, Form, Input, Select, Button, Tag } from '@/shared/components';
import { InputNumber, message, Tooltip, Spin } from 'antd';
import { useContracts, useContractDetail } from '@/shared/hooks';
import {
  CreateInvoiceRequest,
  InvoiceAdjustmentRequest,
  ContractServiceItem,
} from '@/shared/types/landlord';
import { DynamicServiceItem, BillAdjustmentItem } from '../types';

interface CreateBillModalProps {
  open: boolean;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (dto: CreateInvoiceRequest) => Promise<void>;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({
  open,
  confirmLoading,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [selectedContractId, setSelectedContractId] = useState<number | string | null>(null);
  const [dynamicServices, setDynamicServices] = useState<DynamicServiceItem[]>([]);
  const [roomRentPrice, setRoomRentPrice] = useState<number>(0);
  const [adjustments, setAdjustments] = useState<BillAdjustmentItem[]>([]);

  // Dùng trực tiếp hook TanStack Query useContractDetail - quản lý cache chuẩn mực
  const { contract: selectedContract, isLoading: isContractLoading } = useContractDetail(selectedContractId);

  // Đồng bộ giá phòng và danh mục dịch vụ theo hợp đồng lấy từ TanStack Query
  useEffect(() => {
    if (selectedContract) {
      const rent = Number(selectedContract.rentPrice || 0);
      setRoomRentPrice(rent);

      const contractServices: ContractServiceItem[] = selectedContract.services || [];
      const items: DynamicServiceItem[] = contractServices.map((cs, idx) => {
        const method = cs.billingMethod || 'FIXED_PER_ROOM';
        const price = Number(cs.appliedUnitPrice || 0);
        const prevIdx =
          cs.lastIndex !== undefined && cs.lastIndex !== null ? Number(cs.lastIndex) : 0;
        const curIdx = prevIdx;
        let qty = 1;

        if (method === 'METER_INDEX') {
          qty = 0;
        } else if (method === 'FIXED_PER_PERSON') {
          const tenantCount = selectedContract.tenants?.length || 0;
          qty = tenantCount > 0 ? tenantCount : 1;
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

      setDynamicServices(items);
    } else {
      setRoomRentPrice(0);
      setDynamicServices([]);
    }
  }, [selectedContract]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      const today = new Date();
      const defaultPeriod = `${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      const due = new Date();
      due.setDate(due.getDate() + 10);
      const defaultDueDate = due.toISOString().split('T')[0];

      setSelectedContractId(null);
      setAdjustments([]);

      form.setFieldsValue({
        billingPeriod: defaultPeriod,
        dueDate: defaultDueDate,
      });
    }
  }, [open]);

  const handleContractSelectChange = (contractId: number | string) => {
    setSelectedContractId(contractId);
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

  const handleFinish = async (isDraft: boolean = false) => {
    try {
      const values = await form.validateFields();
      if (!selectedContractId || !selectedContract) {
        message.warning('Vui lòng chọn hợp đồng thuê để lập hóa đơn!');
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

      // Đóng gói các dòng phụ thu / giảm trừ thành đối tượng InvoiceAdjustmentRequest chuẩn
      const adjustmentDtos: InvoiceAdjustmentRequest[] = adjustments.map((adj) => {
        const isSurcharge = adj.type === 'SURCHARGE';
        const reason = adj.reason.trim() || (isSurcharge ? 'Phụ thu phát sinh' : 'Giảm trừ chi phí');
        const qty = Number(adj.quantity || 1);
        const cost = Math.abs(Number(adj.unitCost || 0));
        const amount = qty * cost;
        const unit = adj.unit?.trim() || 'lần';

        return {
          type: adj.type,
          reason: reason,
          quantity: qty,
          unitPrice: cost,
          amount: amount,
          unit: unit,
          note: `${qty} ${unit} x ${cost.toLocaleString()} đ`,
        };
      });

      const payload: CreateInvoiceRequest = {
        contractId: Number(selectedContract.id),
        billingPeriod: values.billingPeriod,
        dueDate: values.dueDate,
        isDraft: isDraft,
        // Dịch vụ tiện ích theo hợp đồng: Server chỉ đọc Chỉ số mới (currentIndex) / SL (quantity)
        items: dynamicServices.map((item) => ({
          contractServiceId: Number(item.contractServiceId),
          currentIndex:
            item.billingMethod === 'METER_INDEX' && item.currentIndex !== undefined
              ? Number(item.currentIndex)
              : undefined,
          quantity:
            item.billingMethod !== 'METER_INDEX' && item.quantity !== undefined
              ? Number(item.quantity)
              : undefined,
        })),
        // Khoản phụ thu & giảm trừ phát sinh riêng biệt
        adjustments: adjustmentDtos,
      };

      await onSubmit(payload);
    } catch (err: any) {
      if (err && !err.isAxiosError && !err.errorFields && err.message) {
        message.warning(err.message);
      }
    }
  };

  return (
    <Modal
      title="Lập hóa đơn thu tiền"
      open={open}
      onCancel={onCancel}
      width={960}
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-stay-text-secondary flex items-center gap-1.5">
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel} disabled={confirmLoading}>
              Đóng
            </Button>
            <Tooltip title="Lưu nháp để chỉnh sửa sau, khách thuê chưa nhận được thông báo cước">
              <Button
                className="border-amber-500 text-amber-600 hover:text-amber-500 hover:border-amber-400 "
                loading={confirmLoading}
                onClick={() => handleFinish(true)}
              >
                Lưu bản nháp
              </Button>
            </Tooltip>
            <Button
              type="primary"
              loading={confirmLoading}
              onClick={() => handleFinish(false)}
              className="bg-stay-primary hover:bg-stay-primary-hover "
            >
              Lập hóa đơn
            </Button>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-4 space-y-4"
        onValuesChange={(changed) => {
          if (changed.contractId) {
            handleContractSelectChange(changed.contractId);
          }
        }}
      >
        {/* SECTION 1: HỢP ĐỒNG & THỜI HẠN */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Form.Item
              label={<span className="text-stay-text ">Hợp đồng thuê phòng</span>}
              name="contractId"
              rules={[{ required: true, message: 'Vui lòng chọn hợp đồng thuê' }]}
              className="mb-0"
            >
              <Select.Infinite
                useQueryHook={useContracts}
                params={{ status: 'ACTIVE' }}
                pageSize={10}
                showSearch
                placeholder="Chọn hợp đồng thuê..."
                className="w-full h-9"
                mapOption={(c: any) => ({
                  label: `HĐ #${c.id} - ${c.roomName || 'Phòng ' + c.roomId}${c.buildingName ? ` (${c.buildingName})` : ''} • ${c.representativeTenantName || 'Khách thuê'} • ${(c.rentPrice || 0).toLocaleString()} đ`,
                  value: c.id,
                })}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text ">Kỳ cước hóa đơn</span>}
              name="billingPeriod"
              rules={[{ required: true, message: 'Nhập kỳ cước (MM/YYYY)' }]}
              className="mb-0"
            >
              <Input placeholder="10/2026..." className="h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="text-stay-text ">Hạn nộp tiền</span>}
              name="dueDate"
              rules={[{ required: true, message: 'Chọn hạn nộp' }]}
              className="mb-0"
            >
              <Input type="date" className="h-9" />
            </Form.Item>
          </div>
        </div>

        {/* THÔNG TIN HỢP ĐỒNG & KHÁCH THUÊ */}
        {isContractLoading ? (
          <div className="p-3.5 rounded-xl bg-stay-card-bg border border-stay-border flex items-center justify-center gap-2 text-[13px] text-stay-text-secondary">
            <Spin size="small" />
            <span>Đang tải chi tiết hợp đồng...</span>
          </div>
        ) : selectedContract ? (
          <div className="p-3.5 rounded-xl bg-stay-card-bg border border-stay-border grid grid-cols-1 sm:grid-cols-4 gap-3 text-[14px]">
            <div>
              <span className="text-stay-text-secondary text-[13px] block mb-0.5">Phòng & Khu trọ:</span>
              <span className="font-semibold text-stay-text text-[14px]">
                {selectedContract.roomName || `Phòng ${selectedContract.roomId}`}
              </span>
              {selectedContract.buildingName && (
                <span className="font-normal text-stay-text-secondary text-[12px] block">
                  {selectedContract.buildingName}
                </span>
              )}
            </div>
            <div>
              <span className="text-stay-text-secondary text-[13px] block mb-0.5">Khách đại diện:</span>
              <span className="font-semibold text-stay-text text-[14px] block truncate">
                {selectedContract.representativeTenantName || '—'}
              </span>
              {selectedContract.representativeTenantPhone && (
                <span className="text-stay-text-secondary text-[12px] block mt-0.5">
                  {selectedContract.representativeTenantPhone}
                </span>
              )}
            </div>
            <div>
              <span className="text-stay-text-secondary text-[13px] block mb-0.5">Thời hạn hợp đồng:</span>
              <span className="text-stay-text text-[14px] block">
                {selectedContract.startDate} → {selectedContract.endDate}
              </span>
            </div>
            <div>
              <span className="text-stay-text-secondary text-[13px] block mb-0.5">Tiền thuê phòng:</span>
              <span className="text-[15px] font-bold text-stay-text">
                {roomRentPrice.toLocaleString()} đ/tháng
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-stay-border bg-stay-bg-app text-center text-[13px] text-stay-text-secondary">
            Vui lòng chọn hợp đồng để nạp thông tin phòng và bảng dịch vụ.
          </div>
        )}

        {/* SECTION 2: BẢNG DỊCH VỤ THEO HỢP ĐỒNG */}
        <div className="space-y-2 pt-4 border-t border-stay-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-stay-text-secondary block">
              Dịch vụ hợp đồng ({dynamicServices.length})
            </span>
            <Tooltip title="Chỉ số điện/nước và phí dịch vụ cố định được tải từ hợp đồng thuê phòng">
              <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
            </Tooltip>
          </div>

          {dynamicServices.length === 0 ? (
            <div className="p-3.5 rounded-xl border border-dashed border-stay-border bg-stay-card-bg text-center text-stay-text-secondary text-[13px]">
              Hợp đồng này không đăng ký dịch vụ tiện ích bổ sung.
            </div>
          ) : (
            <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-[13px] font-semibold">
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
                          <span className="px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border font-semibold text-stay-text">
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
                            className="w-full h-8 font-bold text-center"
                            placeholder="Số mới"
                          />
                        ) : svc.billingMethod === 'FIXED_PER_PERSON' ? (
                          <InputNumber
                            min={1}
                            value={svc.quantity}
                            onChange={(val) => handleServiceChange(svc.key, 'quantity', val)}
                            className="w-full h-8 font-bold text-center"
                          />
                        ) : (
                          <InputNumber
                            min={1}
                            value={svc.quantity}
                            onChange={(val) => handleServiceChange(svc.key, 'quantity', val)}
                            className="w-full h-8 font-bold text-center"
                          />
                        )}
                      </td>

                      {/* Sản lượng sử dụng */}
                      <td className="p-2.5 text-center whitespace-nowrap  text-stay-text">
                        {svc.quantity}
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
        <div className="space-y-2 pt-4 border-t border-stay-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-stay-text">
                Phụ thu & giảm trừ ({adjustments.length})
              </h3>
              <Tooltip title="Thêm khoản phát sinh ngoài hợp đồng như tiền thẻ xe, làm chìa khóa hoặc chiết khấu">
                <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer inline" />
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                type="outline"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => handleAddAdjustment('SURCHARGE')}
                className=" rounded-lg"
              >
                Phụ thu
              </Button>
              <Button
                size="small"
                type="outline"
                icon={<Minus className="w-3.5 h-3.5" />}
                onClick={() => handleAddAdjustment('DISCOUNT')}
                className=" rounded-lg"
              >
                Giảm trừ
              </Button>
            </div>
          </div>

          {adjustments.length === 0 ? (
            <div className="p-3.5 rounded-xl border border-dashed border-stay-border bg-stay-card-bg text-center text-stay-text-secondary text-xs">
              Chưa có phụ thu hoặc giảm trừ nào.
            </div>
          ) : (
            <div className="rounded-xl border border-stay-border overflow-hidden bg-stay-card-bg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-[13px] font-semibold">
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
                          <Tag
                            className={`m-0 font-medium ${
                              isSurcharge
                                ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                : 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                            }`}
                          >
                            {isSurcharge ? 'Phụ thu' : 'Giảm trừ'}
                          </Tag>
                        </td>

                        {/* Nguyên nhân */}
                        <td className="p-2.5">
                          <Input
                            placeholder={
                              isSurcharge
                                ? 'Nguyên nhân phụ thu (vd: Thẻ xe, sửa khóa...)'
                                : 'Lý do giảm trừ (vd: Giảm giá lễ, bù tiền điện...)'
                            }
                            value={adj.reason}
                            onChange={(e) => handleAdjustmentChange(adj.id, 'reason', e.target.value)}
                            className="w-full h-8"
                          />
                        </td>

                        {/* Số lượng */}
                        <td className="p-2.5 text-center">
                          <InputNumber
                            min={1}
                            value={adj.quantity}
                            onChange={(val) => handleAdjustmentChange(adj.id, 'quantity', val || 1)}
                            className="w-full h-8 font-bold text-center"
                          />
                        </td>

                        {/* Đơn vị */}
                        <td className="p-2.5 text-center">
                          <Input
                            placeholder="lần"
                            value={adj.unit}
                            onChange={(e) => handleAdjustmentChange(adj.id, 'unit', e.target.value)}
                            className="w-full h-8 text-center"
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
                            className="w-full h-8 font-bold text-right"
                          />
                        </td>

                        {/* Thành tiền */}
                        <td
                          className={`p-2.5 text-right whitespace-nowrap font-bold ${
                            isSurcharge ? 'text-stay-text' : 'text-rose-600'
                          }`}
                        >
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

        {/* SECTION 4: TỔNG KẾT CHI PHÍ */}
        <div className="p-3.5 rounded-xl bg-stay-card-bg border border-stay-border space-y-2 text-[14px]">
          <div className="flex justify-between items-center text-stay-text-secondary">
            <span>Tiền thuê phòng:</span>
            <span className="font-semibold text-stay-text">{roomRentPrice.toLocaleString()} đ</span>
          </div>
          {servicesTotal > 0 && (
            <div className="flex justify-between items-center text-stay-text-secondary">
              <span>Tiền dịch vụ ({dynamicServices.length} khoản):</span>
              <span className="font-semibold text-stay-text">{servicesTotal.toLocaleString()} đ</span>
            </div>
          )}
          {totalSurcharge > 0 && (
            <div className="flex justify-between items-center text-stay-text-secondary">
              <span>Phụ thu phát sinh:</span>
              <span className="font-semibold text-stay-text">+{totalSurcharge.toLocaleString()} đ</span>
            </div>
          )}
          {totalDiscount > 0 && (
            <div className="flex justify-between items-center text-stay-text-secondary">
              <span>Giảm trừ:</span>
              <span className="font-semibold text-stay-text">-{totalDiscount.toLocaleString()} đ</span>
            </div>
          )}
          <div className="pt-2.5 border-t border-stay-border flex justify-between items-center">
            <span className="font-bold text-stay-text text-[14px]">TỔNG TIỀN HÓA ĐƠN:</span>
            <span className="text-[16px] font-bold text-stay-text">
              {grandTotal.toLocaleString()} VNĐ
            </span>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

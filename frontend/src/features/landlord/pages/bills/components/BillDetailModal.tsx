import React from 'react';
import {
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Modal, Button, Tag } from '@/shared/components';
import { Bill, BillStatus } from '@/shared/types/landlord';

interface BillDetailModalProps {
  open: boolean;
  bill: Bill | null;
  onCancel: () => void;
  onOpenPayment: (bill: Bill) => void;
  onPublish?: (bill: Bill) => void;
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  open,
  bill,
  onCancel,
  onOpenPayment,
  onPublish,
}) => {
  const renderStatus = (st: BillStatus) => {
    switch (st) {
      case 'DRAFT':
        return (
          <Tag color="warning" icon={<Clock className="w-3 h-3 inline mr-1" />}>
            Bản nháp (Chưa phát hành)
          </Tag>
        );
      case 'PAID':
        return (
          <Tag color="green" icon={<CheckCircle className="w-3 h-3 inline mr-1" />}>
            Đã thanh toán
          </Tag>
        );
      case 'PENDING':
      case 'UNPAID':
        return (
          <Tag color="orange" icon={<Clock className="w-3 h-3 inline mr-1" />}>
            Chờ thanh toán
          </Tag>
        );
      case 'OVERDUE':
        return (
          <Tag color="error" icon={<AlertCircle className="w-3 h-3 inline mr-1" />}>
            Quá hạn
          </Tag>
        );
      case 'CANCELLED':
        return (
          <Tag color="default" icon={<XCircle className="w-3 h-3 inline mr-1" />}>
            Đã hủy
          </Tag>
        );
      default:
        return <Tag>{st}</Tag>;
    }
  };

  return (
    <Modal
      title={bill ? `Chi tiết hóa đơn: Kỳ ${bill.billingPeriod} (${bill.roomName || ''})` : 'Chi tiết hóa đơn'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel} className="rounded-lg">
          Đóng
        </Button>,
        bill && bill.status === 'DRAFT' && (
          <Button
            key="publish"
            type="primary"
            onClick={() => {
              onCancel();
              onPublish && onPublish(bill);
            }}
            className="bg-amber-600 hover:bg-amber-700 font-semibold rounded-lg text-white"
          >
            🚀 Ban hành hóa đơn cho khách thuê
          </Button>
        ),
        bill &&
          (bill.status === 'PENDING' || bill.status === 'UNPAID' || bill.status === 'OVERDUE') && (
            <Button
              key="pay"
              type="primary"
              onClick={() => {
                onCancel();
                onOpenPayment(bill);
              }}
              className="bg-stay-primary hover:bg-stay-primary-hover font-semibold rounded-lg"
            >
              Xác nhận thu tiền
            </Button>
          ),
      ]}
      width={780}
    >
      {bill && (
        <div className="mt-4 space-y-4 text-xs">
          {bill.status === 'DRAFT' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <span>⚠️ Hóa đơn này hiện đang được lưu ở dạng <strong>Bản nháp</strong>. Khách thuê chưa nhận được thông báo và chưa thấy hóa đơn này trong tài khoản.</span>
            </div>
          )}
          {/* Header info card */}
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-stay-text-secondary text-xs">Hóa đơn số:</p>
              <p className="font-bold text-base text-stay-primary">
                #{bill.id} - Kỳ {bill.billingPeriod}
              </p>
              <p className="text-stay-text-secondary text-xs mt-2">Phòng / Tòa nhà:</p>
              <p className="font-semibold text-stay-text text-sm">
                {bill.roomName}{' '}
                {bill.buildingName && <span className="text-stay-text-secondary">({bill.buildingName})</span>}
              </p>
            </div>
            <div>
              <p className="text-stay-text-secondary text-xs">Khách thuê đại diện:</p>
              <p className="font-semibold text-stay-text text-sm">
                {bill.representativeTenantName || '---'}
                {bill.representativeTenantPhone && ` - ${bill.representativeTenantPhone}`}
              </p>
              <p className="text-stay-text-secondary text-xs mt-2">Kỳ cước & Hạn nộp:</p>
              <p className="font-semibold text-stay-text text-sm">
                {bill.billingPeriod} | Hạn: {bill.dueDate || '---'}
              </p>
            </div>
          </div>

          {/* Bảng kê chi tiết khoản mục items */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-stay-text">Bảng kê chi tiết các khoản mục chi phí:</h3>
            <div className="rounded-xl border border-stay-border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stay-bg-app text-stay-text-secondary border-b border-stay-border text-xs">
                  <tr>
                    <th className="p-3">Khoản mục</th>
                    <th className="p-3 text-center">Số lượng / Ghi chú</th>
                    <th className="p-3 text-right">Đơn giá</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stay-border text-xs">
                  {/* Tiền phòng */}
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Tiền thuê phòng</td>
                    <td className="p-3 text-center text-stay-text-secondary">1 tháng</td>
                    <td className="p-3 text-right text-stay-text-secondary">
                      {(bill.roomPrice || 0).toLocaleString()} đ
                    </td>
                    <td className="p-3 text-right font-bold text-stay-text">
                      {(bill.roomPrice || 0).toLocaleString()} đ
                    </td>
                  </tr>

                  {/* Danh sách items */}
                  {bill.items && bill.items.length > 0 ? (
                    bill.items.map((it, idx) => {
                      const name = it.itemName || '';
                      const isDiscount = it.itemType === 'DISCOUNT' || name.toLowerCase().includes('giảm trừ') || (it.amount || 0) < 0;
                      const isSurcharge = it.itemType === 'SURCHARGE' || name.toLowerCase().includes('phụ thu');
                      const displayQty = it.note || (
                        it.previousIndex !== undefined && it.currentIndex !== undefined
                          ? `${it.quantity ?? (it.currentIndex - it.previousIndex)} (Số cũ: ${it.previousIndex} ➔ Số mới: ${it.currentIndex})`
                          : `${it.quantity || 1}`
                      );
                      return (
                        <tr key={idx} className="hover:bg-stay-bg-app/40 transition-colors">
                          <td className="p-3 font-medium text-stay-text">
                            {name}
                            {isDiscount && (
                              <Tag color="error" className="ml-1.5 text-[10px] py-0 px-1">
                                Giảm trừ
                              </Tag>
                            )}
                            {isSurcharge && (
                              <Tag color="warning" className="ml-1.5 text-[10px] py-0 px-1">
                                Phụ thu
                              </Tag>
                            )}
                          </td>
                          <td className="p-3 text-center text-stay-text-secondary">
                            {displayQty}
                          </td>
                          <td className="p-3 text-right text-stay-text-secondary">
                            {Math.abs(it.unitPrice || 0).toLocaleString()} đ
                          </td>
                          <td className={`p-3 text-right font-bold ${isDiscount ? 'text-red-500' : 'text-stay-text'}`}>
                            {isDiscount ? '-' : ''}{Math.abs(it.amount || 0).toLocaleString()} đ
                          </td>
                        </tr>
                      );
                    })
                  ) : null}

                  {/* Phụ thu nếu có */}
                  {bill.otherAmount && bill.otherAmount > 0 && (
                    <tr className="hover:bg-stay-bg-app/40 transition-colors">
                      <td className="p-3 font-medium text-stay-text">Chi phí phát sinh khác</td>
                      <td className="p-3 text-center text-stay-text-secondary">Phụ thu</td>
                      <td className="p-3 text-right text-stay-text-secondary">
                        {bill.otherAmount.toLocaleString()} đ
                      </td>
                      <td className="p-3 text-right font-bold text-stay-text">
                        {bill.otherAmount.toLocaleString()} đ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tổng cộng & VietQR */}
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-stay-text-secondary font-medium">Trạng thái:</span>
                {renderStatus(bill.status)}
              </div>
              <p className="text-stay-text-secondary mt-1.5">
                Đã thanh toán:{' '}
                <strong className="font-bold text-stay-text">
                  {(bill.paidAmount || 0).toLocaleString()} đ
                </strong>
                {' | '}Còn lại:{' '}
                <strong className="font-bold text-stay-text">
                  {(bill.remainingAmount || bill.totalAmount || 0).toLocaleString()} đ
                </strong>
              </p>
              <div className="mt-2 text-sm font-bold text-stay-text">
                Tổng tiền hóa đơn:{' '}
                <span className="text-stay-primary text-xl font-black">
                  {bill.totalAmount.toLocaleString()} VNĐ
                </span>
              </div>
            </div>

            {/* VietQR minh họa */}
            <div className="flex items-center gap-3 bg-stay-card-bg p-3 rounded-xl border border-stay-border shadow-xs">
              <QrCode className="w-12 h-12 text-stay-primary" />
              <div className="text-[11px] text-stay-text-secondary">
                <p className="font-bold text-stay-text text-xs">Quét VietQR nộp tiền</p>
                <p>Chuyển khoản trực tiếp</p>
                <p className="font-medium text-stay-text-secondary mt-0.5">Tự động gạch nợ</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

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
}

export const BillDetailModal: React.FC<BillDetailModalProps> = ({
  open,
  bill,
  onCancel,
  onOpenPayment,
}) => {
  const renderStatus = (st: BillStatus) => {
    switch (st) {
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
      title={`Chi tiết hóa đơn ${bill?.invoiceCode || bill?.billNumber || ''}`}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel} className="rounded-lg">
          Đóng
        </Button>,
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
          {/* Header info card */}
          <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-stay-text-secondary text-xs">Mã hóa đơn:</p>
              <p className="font-bold text-base text-stay-primary">
                {bill.invoiceCode || bill.billNumber}
              </p>
              <p className="text-stay-text-secondary text-xs mt-2">Phòng / Tòa nhà:</p>
              <p className="font-semibold text-stay-text text-sm">
                {bill.roomCode || bill.roomName}{' '}
                {bill.buildingName && <span className="text-stay-text-secondary">({bill.buildingName})</span>}
              </p>
            </div>
            <div>
              <p className="text-stay-text-secondary text-xs">Khách thuê đại diện:</p>
              <p className="font-semibold text-stay-text text-sm">
                {bill.representativeTenantName || bill.tenantName || '---'}
                {bill.representativeTenantPhone && ` - ${bill.representativeTenantPhone}`}
              </p>
              <p className="text-stay-text-secondary text-xs mt-2">Kỳ cước & Hạn nộp:</p>
              <p className="font-semibold text-stay-text text-sm">
                {bill.billingPeriod || bill.billingMonth} | Hạn: {bill.dueDate || '---'}
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
                      {(bill.roomPrice || bill.roomRent || 0).toLocaleString()} đ
                    </td>
                    <td className="p-3 text-right font-bold text-stay-text">
                      {(bill.roomPrice || bill.roomRent || 0).toLocaleString()} đ
                    </td>
                  </tr>

                  {/* Danh sách items */}
                  {bill.items && bill.items.length > 0 ? (
                    bill.items.map((it, idx) => {
                      const name = it.itemName || it.name || '';
                      return (
                        <tr key={idx} className="hover:bg-stay-bg-app/40 transition-colors">
                          <td className="p-3 font-medium text-stay-text">
                            {name}
                          </td>
                          <td className="p-3 text-center text-stay-text-secondary">
                            {it.note || `${it.quantity || 1} ${it.unit || ''}`}
                          </td>
                          <td className="p-3 text-right text-stay-text-secondary">
                            {(it.unitPrice || 0).toLocaleString()} đ
                          </td>
                          <td className="p-3 text-right font-bold text-stay-text">
                            {(it.amount || it.totalPrice || 0).toLocaleString()} đ
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      {bill.currentElectricIndex !== undefined && (
                        <tr className="hover:bg-stay-bg-app/40 transition-colors">
                          <td className="p-3 text-stay-text">Tiền điện sinh hoạt</td>
                          <td className="p-3 text-center text-stay-text-secondary">
                            {bill.electricConsumed || 0} kWh (Từ số {bill.previousElectricIndex || 0} đến {bill.currentElectricIndex})
                          </td>
                          <td className="p-3 text-right text-stay-text-secondary">3.800 đ</td>
                          <td className="p-3 text-right font-bold text-stay-text">
                            {((bill.electricConsumed || 0) * 3800).toLocaleString()} đ
                          </td>
                        </tr>
                      )}
                      {bill.currentWaterIndex !== undefined && (
                        <tr className="hover:bg-stay-bg-app/40 transition-colors">
                          <td className="p-3 text-stay-text">Tiền nước sinh hoạt</td>
                          <td className="p-3 text-center text-stay-text-secondary">
                            {bill.waterConsumed || 0} m³ (Từ số {bill.previousWaterIndex || 0} đến {bill.currentWaterIndex})
                          </td>
                          <td className="p-3 text-right text-stay-text-secondary">30.000 đ</td>
                          <td className="p-3 text-right font-bold text-stay-text">
                            {((bill.waterConsumed || 0) * 30000).toLocaleString()} đ
                          </td>
                        </tr>
                      )}
                    </>
                  )}

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
                <p>MB Bank: 0905111222</p>
                <p className="font-medium text-stay-text-secondary mt-0.5">Tự động gạch nợ</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

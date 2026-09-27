import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from '@/shared/components';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Bill } from '@/shared/types/landlord';
import { VietQRPaymentData } from '@/shared/types/tenant';

interface VietQRPaymentModalProps {
  open: boolean;
  onCancel: () => void;
  activeBill: Bill | null;
  vietQRData?: VietQRPaymentData;
  onConfirmPaid: () => void;
  isConfirming?: boolean;
}

export const VietQRPaymentModal: React.FC<VietQRPaymentModalProps> = ({
  open,
  onCancel,
  activeBill,
  vietQRData,
  onConfirmPaid,
  isConfirming,
}) => {
  const navigate = useNavigate();

  if (!activeBill) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      title={
        <span className="text-base font-bold text-stay-text">
          Chi Tiết Hóa Đơn & Thanh Toán VietQR {activeBill.billingPeriod ? `(Kỳ ${activeBill.billingPeriod})` : ''}
        </span>
      }
    >
      <div className="space-y-5 pt-3 text-xs">
        {/* Chiết tính từng mục chi phí */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider block">
            Bảng chiết tính các khoản cước tiền phòng
          </label>
          <div className="border border-stay-border rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stay-bg-app border-b border-stay-border text-stay-text font-bold">
                  <th className="p-3 w-1/3">Khoản thu dịch vụ</th>
                  <th className="p-3 w-1/3">Chỉ số & Đơn giá</th>
                  <th className="p-3 w-1/3 text-right">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stay-border">
                {activeBill.items && activeBill.items.length > 0 ? (
                  activeBill.items.map((it: any, idx: number) => {
                    const name = it.itemName || it.serviceName || 'Dịch vụ';
                    const isDiscount = it.itemType === 'DISCOUNT' || name.toLowerCase().includes('giảm trừ') || (it.amount || 0) < 0;
                    const amt = Math.abs(it.amount || it.totalAmount || 0);
                    const displayUnit = it.note || (
                      it.previousIndex !== undefined && it.currentIndex !== undefined
                        ? `${it.quantity ?? (it.currentIndex - it.previousIndex)} (Số cũ: ${it.previousIndex} ➔ Số mới: ${it.currentIndex})`
                        : `${(it.quantity || 1)} × ${(it.unitPrice || 0).toLocaleString()} đ`
                    );
                    return (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-stay-text">
                          {name}
                          {isDiscount && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">
                              Giảm trừ
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500">{displayUnit}</td>
                        <td className={`p-3 text-right font-bold ${isDiscount ? 'text-red-500' : 'text-stay-text'}`}>
                          {isDiscount ? '-' : ''}{amt.toLocaleString()} đ
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="p-3 font-semibold text-stay-text">Tiền thuê phòng & dịch vụ</td>
                    <td className="p-3 text-slate-500">Trọn gói theo kỳ cước</td>
                    <td className="p-3 text-right font-bold text-stay-text">
                      {activeBill.totalAmount.toLocaleString()} đ
                    </td>
                  </tr>
                )}
                <tr className="bg-stay-bg-app font-bold text-sm">
                  <td className="p-3 text-stay-text" colSpan={2}>Tổng số tiền thanh toán:</td>
                  <td className="p-3 text-right text-stay-primary">
                    {activeBill.totalAmount.toLocaleString()} VNĐ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* VietQR Section */}
        <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0 p-2 bg-white rounded-xl border border-stay-border shadow-xs">
            {vietQRData?.qrCodeUrl ? (
              <img
                src={vietQRData.qrCodeUrl}
                alt="VietQR Mã Thanh Toán"
                className="w-40 h-40 object-contain"
              />
            ) : (
              <div className="w-40 h-40 flex flex-col items-center justify-center bg-slate-50 text-slate-400 text-center p-2 rounded-lg border border-dashed border-stay-border">
                <span className="text-xs">Chưa có mã QR</span>
                <span className="text-[10px] text-slate-400 mt-1">Chủ trọ chưa cấu hình STK</span>
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1 w-full text-xs">
            <span className="font-bold text-stay-text text-sm block">
              Thông tin chuyển khoản ngân hàng:
            </span>

            <div className="space-y-1 text-slate-600">
              <p>Ngân hàng: <strong>{vietQRData?.bankName || '---'}</strong></p>
              <p>Số tài khoản: <strong className="text-stay-primary font-mono text-sm">{vietQRData?.accountNumber || '---'}</strong></p>
              <p>Chủ tài khoản: <strong>{vietQRData?.accountHolder || '---'}</strong></p>
              <p>Số tiền: <strong className="text-stay-primary">{activeBill.totalAmount.toLocaleString()} đ</strong></p>
              <p>Nội dung CK: <strong className="text-stay-text bg-white px-2 py-0.5 rounded border border-stay-border font-mono">{vietQRData?.transferContent || `HD${activeBill.id} thanh toan`}</strong></p>
            </div>

            <p className="text-[11px] text-slate-400">
              * Quét mã QR bằng ứng dụng ngân hàng để tự động điền số tiền và nội dung chuyển khoản.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stay-border">
          <button
            type="button"
            onClick={() => {
              onCancel();
              navigate('/tenant/complaints');
            }}
            className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Chỉ số điện nước không đúng? Gửi khiếu nại
          </button>

          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="md" onClick={onCancel}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<CheckCircle className="w-4 h-4" />}
              loading={isConfirming}
              onClick={onConfirmPaid}
            >
              Tôi đã chuyển khoản
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

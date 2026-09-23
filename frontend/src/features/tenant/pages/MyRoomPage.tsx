import React, { useState } from 'react';
import { useMyRoom, useMyBills, useVietQRPayment } from '@/shared/hooks';
import {
  Card,
  Button,
  Table,
  Tag,
  Modal,
  Alert,
  Skeleton,
} from '@/shared/components';
import {
  Home,
  DollarSign,
  QrCode,
  CheckCircle,
  Users,
  Zap,
  Droplets,
  Phone,
} from 'lucide-react';
import { message } from 'antd';
import { Bill } from '@/shared/types/landlord';

export const MyRoomPage: React.FC = () => {
  const { roomDetails, isLoading: isRoomLoading, acceptRoomLink } = useMyRoom();
  const { bills, isLoading: isBillsLoading, confirmTransferred, isConfirming } = useMyBills();

  // VietQR Modal State (UC 44)
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState<Bill | null>(null);
  const { qrData: vietQRData } = useVietQRPayment(activeBill ? String(activeBill.id) : undefined);

  const handleOpenVietQR = (bill: Bill) => {
    setActiveBill(bill);
    setQrModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!activeBill) return;
    try {
      await confirmTransferred(String(activeBill.id));
      message.success('Hệ thống đã ghi nhận thông báo chuyển khoản! Đang xác nhận gạch nợ tự động.');
      setQrModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi cập nhật thanh toán');
    }
  };

  const handleAcceptInvite = async (tenantId: string) => {
    try {
      await acceptRoomLink(tenantId);
      message.success('Đã chấp nhận liên kết vào phòng trọ thành công!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi liên kết phòng');
    }
  };

  if (isRoomLoading || isBillsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const billColumns = [
    {
      title: 'Kỳ cước',
      dataIndex: 'billingMonth',
      key: 'billingMonth',
      render: (val: string) => <span className="font-bold text-stay-text">{val}</span>,
    },
    {
      title: 'Mã HĐ',
      dataIndex: 'billNumber',
      key: 'billNumber',
      render: (val: string) => <span className="text-xs font-semibold text-stay-primary">{val}</span>,
    },
    {
      title: 'Tiền phòng',
      dataIndex: 'roomRent',
      key: 'roomRent',
      render: (val: number) => <span>{val?.toLocaleString()} đ</span>,
    },
    {
      title: 'Điện / Nước tiêu thụ',
      key: 'utility',
      render: (_: any, r: Bill) => (
        <div className="text-xs space-y-0.5">
          <p className="flex items-center gap-1 text-amber-600">
            <Zap className="w-3 h-3" /> Điện: {r.electricityUsage} kWh
          </p>
          <p className="flex items-center gap-1 text-blue-600">
            <Droplets className="w-3 h-3" /> Nước: {r.waterUsage} m³
          </p>
        </div>
      ),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => (
        <span className="font-extrabold text-stay-primary">{val?.toLocaleString()} VNĐ</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'PAID') return <Tag status="available">Đã thanh toán</Tag>;
        if (st === 'OVERDUE') return <Tag status="rented">Quá hạn</Tag>;
        return <Tag status="pending">Chờ thanh toán</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: Bill) => (
        r.status !== 'PAID' ? (
          <Button
            variant="primary"
            size="sm"
            icon={<QrCode className="w-3.5 h-3.5" />}
            onClick={() => handleOpenVietQR(r)}
            className="shadow-xs"
          >
            Quét VietQR
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-stay-secondary" /> Đã xong
          </span>
        )
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {!roomDetails?.hasLinkedRoom && (
        <Alert
          type="info"
          message={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-sm">
                  Bạn có lời mời liên kết vào phòng P102 - Tòa nhà Ánh Dương từ chủ nhà!
                </p>
                <p className="text-xs text-stay-text-secondary mt-0.5">
                  Xác nhận liên kết để xem thông tin phòng, hợp đồng điện tử và nhận hóa đơn thanh toán VietQR.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="primary" size="sm" onClick={() => handleAcceptInvite('TN01')}>
                  Chấp nhận liên kết
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* Room Details Header (UC 42) */}
      {roomDetails?.room ? (
        <Card className="overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Tag status="available">Đang thuê hoạt động</Tag>
                  <span className="text-xs text-stay-text-secondary font-medium">HĐ: {roomDetails.contract?.contractNumber}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
                  {roomDetails.room.name} - {roomDetails.room.buildingName}
                </h1>
                <p className="text-xs text-stay-text-secondary mt-1">
                  {roomDetails.room.address}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border text-right shrink-0">
                <span className="text-xs text-stay-text-secondary block font-medium">Tiền phòng hàng tháng:</span>
                <span className="text-2xl font-extrabold text-stay-primary">
                  {roomDetails.room.monthlyRent.toLocaleString()} đ
                </span>
              </div>
            </div>

            {/* Room Specs & Landlord Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stay-border">
              <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-1">
                <span className="text-xs font-bold text-stay-text-secondary uppercase tracking-wider block">
                  Chủ nhà cho thuê
                </span>
                <p className="text-sm font-bold text-stay-text">{roomDetails.room.landlord.name}</p>
                <p className="text-xs text-stay-text-secondary flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-stay-primary" /> {roomDetails.room.landlord.phone}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-1">
                <span className="text-xs font-bold text-stay-text-secondary uppercase tracking-wider block">
                  Thời hạn hợp đồng
                </span>
                <p className="text-sm font-bold text-stay-text">
                  {roomDetails.contract?.startDate} - {roomDetails.contract?.endDate}
                </p>
                <p className="text-xs text-slate-500">Chu kỳ đóng: Ngày 05 hàng tháng</p>
              </div>

              <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-1">
                <span className="text-xs font-bold text-stay-text-secondary uppercase tracking-wider block">
                  Chỉ số ban đầu bàn giao
                </span>
                <p className="text-xs text-stay-text">
                  Điện: <strong className="text-amber-600">{roomDetails.contract?.initialElectricity} kWh</strong> | Nước: <strong className="text-blue-600">{roomDetails.contract?.initialWater} m³</strong>
                </p>
                <p className="text-xs text-slate-500">Tiền cọc: {roomDetails.contract?.depositAmount?.toLocaleString()} đ</p>
              </div>
            </div>

            {/* Roommates in Room */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stay-text flex items-center gap-2">
                <Users className="w-4 h-4 text-stay-primary" />
                Bạn cùng phòng ({roomDetails.room.roommates.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {roomDetails.room.roommates.map((rm, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stay-bg-app border border-stay-border flex items-center gap-3">
                    <img
                      src={rm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={rm.name}
                      className="w-9 h-9 rounded-full object-cover border border-stay-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stay-text">{rm.name}</span>
                        {rm.role === 'Đại diện hợp đồng' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stay-primary/10 text-stay-primary font-semibold">
                            Đại diện
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{rm.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="py-12 text-center space-y-3">
          <Home className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-stay-text">Bạn chưa liên kết phòng trọ nào</h3>
          <p className="text-xs text-stay-text-secondary max-w-md mx-auto">
            Khi thuê phòng hoặc ký hợp đồng với Chủ trọ trên sàn StayConnect, bạn sẽ nhận được mã phòng để xem hóa đơn và thanh toán online.
          </p>
        </Card>
      )}

      {/* Bill History & VietQR (UC 43 & UC 44) */}
      <Card>
        <div className="p-6 border-b border-stay-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stay-text flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-stay-primary" />
              Lịch Sử Hóa Đơn & Thanh Toán Tiền Trọ
            </h3>
            <p className="text-xs text-stay-text-secondary mt-0.5">
              Xem chi tiết hóa đơn điện nước hàng tháng và quét mã VietQR tự động khớp giao dịch.
            </p>
          </div>
        </div>

        <div className="p-6">
          <Table
            dataSource={bills}
            columns={billColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            className="overflow-x-auto"
          />
        </div>
      </Card>

      {/* VietQR Payment Modal (UC 44) */}
      <Modal
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        footer={null}
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <QrCode className="w-5 h-5 text-stay-primary" />
            <span>Thanh Toán Hóa Đơn Qua VietQR Tự Động</span>
          </div>
        }
      >
        {vietQRData ? (
          <div className="text-center space-y-4 py-3">
            <div className="p-4 rounded-2xl bg-stay-bg-app border border-stay-border inline-block">
              <img
                src={vietQRData.qrCodeUrl}
                alt="VietQR Code"
                className="w-64 h-64 mx-auto rounded-xl shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-stay-text-secondary">Số tiền cần thanh toán:</span>
              <p className="text-3xl font-extrabold text-stay-primary">
                {vietQRData.amount.toLocaleString()} VNĐ
              </p>
            </div>

            <div className="text-left p-4 rounded-2xl bg-stay-bg-app border border-stay-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-stay-text">{vietQRData.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <span className="font-mono font-bold text-stay-primary">{vietQRData.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold text-stay-text">{vietQRData.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nội dung chuyển khoản:</span>
                <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {vietQRData.transferContent}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động gạch nợ sau 30 giây.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setQrModalOpen(false)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                loading={isConfirming}
                onClick={handleConfirmPaid}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Tôi đã chuyển khoản xong
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        )}
      </Modal>
    </div>
  );
};

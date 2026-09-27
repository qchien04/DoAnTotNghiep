import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMyRoom, useMyBills, useVietQRPayment } from '@/shared/hooks';
import { Skeleton, Button } from '@/shared/components';
import { message } from 'antd';
import { Home, Compass, History, Wrench, Receipt, PlusCircle, ArrowRight } from 'lucide-react';
import { Bill } from '@/shared/types/landlord';
import { RoomInviteBanner } from './components/RoomInviteBanner';
import { RoomInvitationModal } from './components/RoomInvitationModal';
import { ContractInfoCard } from './components/ContractInfoCard';
import { RoommatesList } from './components/RoommatesList';
import { MyBillTable } from './components/MyBillTable';
import { VietQRPaymentModal } from './components/VietQRPaymentModal';
import { ContractHistoryList } from './components/ContractHistoryList';

export const MyRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    roomDetails,
    isLoading: isRoomLoading,
    contracts,
    isContractsLoading,
    acceptRoomLink,
    rejectRoomLink,
  } = useMyRoom();
  const { bills, isLoading: isBillsLoading, confirmTransferred, isConfirming } = useMyBills();

  // Tab State: 'current' (Phòng hiện tại) vs 'history' (Lịch sử hợp đồng)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Invite Modal State (UC16)
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [hasLinked, setHasLinked] = useState(false);

  // VietQR Modal State (UC17)
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

  const handleAcceptInvite = async () => {
    const inviteId = roomDetails?.invitation?.id;
    if (!inviteId) return;
    try {
      await acceptRoomLink(inviteId);
      message.success(`Đã chấp nhận liên kết phòng ${roomDetails?.invitation?.roomName || 'P102'} thành công!`);
      setHasLinked(true);
      setInviteModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi liên kết phòng');
    }
  };

  const handleRejectInvite = async (reason: string) => {
    const inviteId = roomDetails?.invitation?.id;
    if (!inviteId) return;
    try {
      await rejectRoomLink({ invitationId: inviteId, reason });
      message.info(`Đã từ chối lời mời liên kết phòng: ${reason}`);
      setInviteModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi từ chối liên kết phòng');
    }
  };

  if (isRoomLoading || isBillsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const showLinked = hasLinked || Boolean(roomDetails?.hasLinkedRoom);
  const hasPendingInvitation = Boolean(!showLinked && roomDetails?.hasPendingInvitation && roomDetails?.invitation);

  return (
    <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stay-border">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stay-text flex items-center gap-2">
              <Home className="w-6 h-6 text-stay-primary" />
              Quản Lý Phòng & Hợp Đồng Thuê
            </h1>
            <p className="text-xs text-stay-text-secondary mt-0.5">
              Theo dõi thông tin phòng đang ở, tiện nghi, danh sách bạn cùng phòng và lịch sử các hợp đồng thuê trước đó.
            </p>
          </div>

          {/* Quick Actions if linked */}
          {showLinked && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link to="/roommates/create">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<PlusCircle className="w-4 h-4" />}
                  className="text-xs"
                >
                  Tìm người ở ghép
                </Button>
              </Link>
              <Link to="/tenant/complaints">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Wrench className="w-4 h-4 text-amber-500" />}
                  className="text-xs"
                >
                  Báo hỏng sự cố
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* UC16: Lời mời liên kết từ chủ trọ */}
        {hasPendingInvitation && (
          <RoomInviteBanner
            invitation={roomDetails?.invitation}
            onOpenInviteModal={() => setInviteModalOpen(true)}
          />
        )}

        {/* Tab switch: Phòng hiện tại vs Lịch sử hợp đồng */}
        <div className="flex items-center gap-4 border-b border-stay-border">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`pb-3 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'current'
                ? 'text-stay-primary border-b-2 border-stay-primary font-bold'
                : 'text-stay-text-secondary hover:text-stay-text'
            }`}
          >
            <Home className="w-4 h-4" />
            Phòng & Hợp đồng hiện tại
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'text-stay-primary border-b-2 border-stay-primary font-bold'
                : 'text-stay-text-secondary hover:text-stay-text'
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử hợp đồng ({contracts.length})
          </button>
        </div>

        {/* TAB 1: Phòng & Hợp đồng hiện tại */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {!showLinked && !hasPendingInvitation && (
              <div className="bg-stay-card-bg border border-stay-border rounded-2xl p-10 text-center space-y-4 shadow-2xs max-w-2xl mx-auto my-6">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Home className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-stay-text">Bạn chưa liên kết phòng trọ nào</h2>
                  <p className="text-xs text-stay-text-secondary leading-relaxed max-w-md mx-auto">
                    Tài khoản của bạn hiện chưa được liên kết với phòng trọ nào trên hệ thống StayHub và chưa có lời mời liên kết nào.
                    Nếu bạn đã chuyển vào ở thực tế, hãy cung cấp số điện thoại của bạn cho chủ nhà để được thêm vào hợp đồng.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Compass className="w-4 h-4" />}
                    onClick={() => navigate('/roommates')}
                  >
                    Tìm kiếm bạn ở ghép
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    icon={<History className="w-4 h-4" />}
                    onClick={() => setActiveTab('history')}
                  >
                    Xem lịch sử hợp đồng ({contracts.length})
                  </Button>
                </div>
              </div>
            )}

            {showLinked && roomDetails && (
              <>
                <ContractInfoCard roomDetails={roomDetails} />
                <RoommatesList roommates={roomDetails.room?.roommates} />

                {/* Hóa đơn tiền phòng gần đây */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stay-text uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-stay-primary" />
                        Hóa đơn tiền phòng gần đây
                      </h3>
                      <p className="text-xs text-stay-text-secondary">
                        Thanh toán tiền phòng, điện nước và các chi phí dịch vụ định kỳ hàng tháng qua VietQR
                      </p>
                    </div>
                    <Link
                      to="/tenant/bills"
                      className="text-xs font-semibold text-stay-primary hover:underline flex items-center gap-1"
                    >
                      Xem tất cả hóa đơn <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <MyBillTable bills={bills.slice(0, 3)} onOpenVietQR={handleOpenVietQR} />
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: Lịch sử hợp đồng thuê */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-sm font-bold text-stay-text">
                  Danh sách hợp đồng thuê qua các thời kỳ
                </h3>
                <p className="text-xs text-stay-text-secondary">
                  Lưu trữ toàn bộ thông tin các phòng bạn đã và đang thuê, số tiền cọc, chỉ số và thỏa thuận dịch vụ.
                </p>
              </div>
            </div>

            <ContractHistoryList contracts={contracts} isLoading={isContractsLoading} />
          </div>
        )}

        {/* Modals */}
        <RoomInvitationModal
          open={inviteModalOpen}
          invitation={roomDetails?.invitation}
          onCancel={() => setInviteModalOpen(false)}
          onAccept={handleAcceptInvite}
          onReject={handleRejectInvite}
        />

        <VietQRPaymentModal
          open={qrModalOpen}
          onCancel={() => setQrModalOpen(false)}
          activeBill={activeBill}
          vietQRData={vietQRData}
          onConfirmPaid={handleConfirmPaid}
          isConfirming={isConfirming}
        />
      </div>
  );
};

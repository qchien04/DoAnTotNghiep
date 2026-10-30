import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMyRoom,
  useMyContracts,
  useAcceptRoomLink,
  useRejectRoomLink,
  useMyBills,
  useConfirmPaymentTransferred,
  useVietQRPayment,
} from '@/shared/hooks';
import { Skeleton, Button } from '@/shared/components';
import { Home, Compass, History } from 'lucide-react';
import { InvoiceResponse } from '@/shared/types/landlord';
import { RoomInviteBanner } from './components/RoomInviteBanner';
import { RoomInvitationModal } from './components/RoomInvitationModal';
import { ContractInfoCard } from './components/ContractInfoCard';
import { RoommatesList } from './components/RoommatesList';
import { MyBillTable } from './components/MyBillTable';
import { VietQRPaymentModal } from './components/VietQRPaymentModal';
import { ContractHistoryList } from './components/ContractHistoryList';

export const MyRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomDetails, isLoading: isRoomLoading } = useMyRoom();
  const { pageInfo: contractsPageInfo, isLoading: isContractsLoading } = useMyContracts();
  const { acceptRoomLink } = useAcceptRoomLink();
  const { rejectRoomLink } = useRejectRoomLink();
  const { pageInfo: billsPageInfo, isLoading: isBillsLoading } = useMyBills();
  const { confirmTransferred, isConfirming } = useConfirmPaymentTransferred();

  // Tab State: 'current' (Phòng hiện tại) vs 'history' (Lịch sử hợp đồng)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Invite Modal State (UC16)
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [hasLinked, setHasLinked] = useState(false);

  // VietQR Modal State (UC17)
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeBill, setActiveBill] = useState<InvoiceResponse | null>(null);
  const { qrData: vietQRData } = useVietQRPayment(activeBill ? String(activeBill.id) : undefined);

  const handleOpenVietQR = (bill: InvoiceResponse) => {
    setActiveBill(bill);
    setQrModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!activeBill) return;
    try {
      await confirmTransferred(String(activeBill.id));
      setQrModalOpen(false);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleAcceptInvite = async () => {
    const inviteId = roomDetails?.invitation?.id;
    if (!inviteId) return;
    try {
      await acceptRoomLink(inviteId);
      setHasLinked(true);
      setInviteModalOpen(false);
    } catch {
      // Handled in mutation hook
    }
  };

  const handleRejectInvite = async (reason: string) => {
    const inviteId = roomDetails?.invitation?.id;
    if (!inviteId) return;
    try {
      await rejectRoomLink({ invitationId: inviteId, reason });
      setInviteModalOpen(false);
    } catch {
      // Handled in mutation hook
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
          className={`pb-3  font-semibold cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'current'
            ? 'text-stay-primary border-b-2 border-stay-primary font-bold'
            : 'text-stay-text-secondary hover:text-stay-text'
            }`}
        >
          Phòng & Hợp đồng hiện tại
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3  font-semibold cursor-pointer transition-colors flex items-center gap-2 ${activeTab === 'history'
            ? 'text-stay-primary border-b-2 border-stay-primary font-bold'
            : 'text-stay-text-secondary hover:text-stay-text'
            }`}
        >
          Lịch sử hợp đồng
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
                <p className=" text-stay-text-secondary leading-relaxed max-w-md mx-auto">
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
                  Xem lịch sử hợp đồng ({contractsPageInfo?.totalElements ?? 0})
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
                <MyBillTable
                  pageInfo={billsPageInfo}
                  isLoading={isBillsLoading}
                  onOpenVietQR={handleOpenVietQR}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Lịch sử hợp đồng thuê */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <ContractHistoryList pageInfo={contractsPageInfo} isLoading={isContractsLoading} />
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

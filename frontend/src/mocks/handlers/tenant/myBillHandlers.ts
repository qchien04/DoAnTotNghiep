import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse } from '../../utils/response';
import { VietQRPaymentData } from '@/shared/types/tenant';

export const myBillHandlers: Record<string, MockRouteHandler> = {
  // UC 43: Xem lịch sử hóa đơn tiền phòng
  'GET /api/tenant/my-bills': () => {
    const bills = mockStorage.getCollection('bills');
    // Lọc các hóa đơn phòng P102
    const myBills = bills.filter((b) => b.roomName === 'P102' || String(b.roomId) === 'room_2' || String(b.roomId) === '2');
    return successResponse(myBills);
  },

  // UC 44: Lấy thông tin VietQR thanh toán tiền phòng
  'GET /api/tenant/my-bills/:id/qr-payment': ({ params }) => {
    const bill = mockStorage.findById('bills', params.id);
    if (!bill) {
      return errorResponse('Không tìm thấy hóa đơn cần thanh toán', '404');
    }

    const bankCode = 'MB';
    const accountNumber = '0912345678999';
    const bNumber = bill.billNumber || bill.invoiceCode || 'HD';
    const transferContent = `${bNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
    const qrCodeUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${bill.remainingAmount || bill.totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=NGUYEN%20VAN%20THANH`;

    const data: VietQRPaymentData = {
      billNumber: bNumber,
      amount: bill.remainingAmount || bill.totalAmount,
      accountNumber,
      accountHolder: 'NGUYỄN VĂN THÀNH',
      bankName: 'Ngân hàng TMCP Quân Đội (MB Bank)',
      bankCode,
      qrCodeUrl,
      transferContent,
    };

    return successResponse(data);
  },

  // Khách xác nhận đã chuyển khoản
  'POST /api/tenant/my-bills/:id/pay-completed': ({ params }) => {
    const bill = mockStorage.findById('bills', params.id);
    if (!bill) {
      return errorResponse('Không tìm thấy hóa đơn', '404');
    }

    const updated = mockStorage.updateItem('bills', bill.id, {
      paymentNote: 'Khách đã quét VietQR chuyển khoản, chờ chủ trọ xác nhận',
    });

    return successResponse(
      updated,
      'Đã gửi thông báo nhắc chủ nhà kiểm tra tài khoản ngân hàng và xác nhận gạch nợ!'
    );
  },
};

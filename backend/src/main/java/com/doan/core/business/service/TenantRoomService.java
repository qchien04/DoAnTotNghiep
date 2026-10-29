package com.doan.core.business.service;

import com.doan.core.business.dto.tenant.TenantContractHistoryResponse;
import com.doan.core.business.dto.tenant.TenantInvoiceResponse;
import com.doan.core.business.dto.tenant.TenantRoomResponse;
import com.doan.core.business.dto.tenant.VietQRPaymentResponse;
import com.doan.core.business.enums.ContractStatus;
import com.doan.core.business.enums.InvoiceStatus;
import com.doan.core.common.data.PageResponse;

public interface TenantRoomService {

    // UC 16: Lấy thông tin phòng trọ đang ở và hợp đồng
    TenantRoomResponse getMyRoomDetails(Long userId);

    // UC 16: Tiếp nhận & Chấp nhận liên kết phòng trọ từ chủ trọ
    void acceptRoomLink(Long userId, Long invitationId);

    // UC 16: Từ chối lời mời liên kết phòng
    void rejectRoomLink(Long userId, Long invitationId, String reason);

    // UC 17: Xem danh sách các hóa đơn tiền phòng hàng tháng
    PageResponse<TenantInvoiceResponse> getMyInvoices(Long userId, String keyword, InvoiceStatus status, String billingPeriod,
            int page, int size, String sortBy, String sortDirection);

    // UC 17: Lấy dữ liệu VietQR thanh toán tự động
    VietQRPaymentResponse getVietQRInfo(Long userId, Long invoiceId);

    // UC 17: Người thuê xác nhận đã chuyển khoản
    void confirmTransferred(Long userId, Long invoiceId);

    // Quản lý hợp đồng: Xem danh sách hợp đồng hiện tại và lịch sử hợp đồng trước
    // đó
    PageResponse<TenantContractHistoryResponse> getMyContracts(Long userId, String keyword, ContractStatus status,
            int page, int size, String sortBy, String sortDirection);
}

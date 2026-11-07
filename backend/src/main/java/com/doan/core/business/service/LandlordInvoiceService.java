package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.invoice.*;
import com.doan.core.business.enums.InvoiceStatus;
import com.doan.core.common.data.PageResponse;

public interface LandlordInvoiceService {

    PageResponse<InvoiceResponse> getInvoices(Long landlordId, Long buildingId, String billingPeriod,
            InvoiceStatus status, String keyword, int page, int size, String sortBy, String sortDirection);

    InvoiceResponse getInvoiceById(Long landlordId, Long invoiceId);

    InvoiceResponse createInvoice(Long landlordId, CreateInvoiceRequest request);

    InvoiceResponse updateInvoice(Long landlordId, Long invoiceId, InvoiceUpdateRequest request);

    InvoiceResponse cancelInvoice(Long landlordId, Long invoiceId, InvoiceCancelRequest request);

    InvoiceResponse confirmPayment(Long landlordId, Long invoiceId, InvoicePaymentRequest request);

    InvoiceResponse publishInvoice(Long landlordId, Long invoiceId);
}

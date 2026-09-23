package com.doan.core.business.service;

import com.doan.core.business.dto.landlord.invoice.*;

import java.util.List;

public interface LandlordInvoiceService {

    List<InvoiceResponse> getInvoices(Long landlordId, Long buildingId, String billingPeriod, String status);

    InvoiceResponse getInvoiceById(Long landlordId, Long invoiceId);

    InvoiceResponse createInvoice(Long landlordId, MeterReadingInvoiceRequest request);

    InvoiceResponse updateInvoice(Long landlordId, Long invoiceId, InvoiceUpdateRequest request);

    InvoiceResponse cancelInvoice(Long landlordId, Long invoiceId, InvoiceCancelRequest request);

    InvoiceResponse confirmPayment(Long landlordId, Long invoiceId, InvoicePaymentRequest request);
}

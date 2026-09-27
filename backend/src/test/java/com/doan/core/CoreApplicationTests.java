package com.doan.core;

import com.doan.core.business.dto.landlord.building.BuildingRequest;
import com.doan.core.business.dto.landlord.building.BuildingResponse;
import com.doan.core.business.dto.landlord.contract.CheckoutCalculationResponse;
import com.doan.core.business.dto.landlord.contract.ContractCreateRequest;
import com.doan.core.business.dto.landlord.contract.ContractResponse;
import com.doan.core.business.dto.landlord.contract.ContractTerminateRequest;
import com.doan.core.business.dto.landlord.dashboard.LandlordDashboardResponse;
import com.doan.core.business.dto.landlord.invoice.InvoicePaymentRequest;
import com.doan.core.business.dto.landlord.invoice.InvoiceResponse;
import com.doan.core.business.dto.landlord.invoice.MeterReadingInvoiceRequest;
import com.doan.core.business.dto.landlord.room.RoomRequest;
import com.doan.core.business.dto.landlord.room.RoomResponse;
import com.doan.core.business.dto.landlord.tenant.TenantRequest;
import com.doan.core.business.dto.landlord.tenant.TenantResponse;
import com.doan.core.business.dto.request.LoginRequest;
import com.doan.core.business.dto.request.RefreshTokenRequest;
import com.doan.core.business.dto.response.AuthResponse;
import com.doan.core.business.entity.User;
import com.doan.core.business.repository.UserRepository;
import com.doan.core.business.service.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@SpringBootTest
public class CoreApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LandlordBuildingService buildingService;

    @Autowired
    private LandlordRoomService roomService;

    @Autowired
    private LandlordTenantService tenantService;

    @Autowired
    private LandlordContractService contractService;

    @Autowired
    private LandlordInvoiceService invoiceService;

    @Autowired
    private LandlordDashboardService dashboardService;

    @Test
    @DisplayName("Kiểm tra xác thực JWT và Refresh Token hoàn chỉnh")
    void testAuthAndRefreshTokenFlow() {
        // 1. Đăng nhập với tài khoản landlord mẫu
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("landlord");
        loginRequest.setPassword("123456");

        AuthResponse authResponse = authService.login(loginRequest);

        Assertions.assertNotNull(authResponse.getAccessToken(), "Access Token không được null");
        Assertions.assertNotNull(authResponse.getRefreshToken(), "Refresh Token không được null");
        Assertions.assertEquals("Bearer", authResponse.getTokenType());
        Assertions.assertEquals("landlord", authResponse.getUser().getUsername());

        // 2. Cấp mới Access Token thông qua Refresh Token
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(authResponse.getRefreshToken());
        AuthResponse refreshed = authService.refreshToken(refreshReq);

        Assertions.assertNotNull(refreshed.getAccessToken(), "New Access Token không được null");
        Assertions.assertNotNull(refreshed.getRefreshToken(), "Rotated Refresh Token không được null");

        // 3. Đăng xuất thu hồi Refresh Token
        authService.logout(refreshed.getRefreshToken());

        // Thử refresh lại token đã bị thu hồi -> phải ném ngoại lệ
        Assertions.assertThrows(Exception.class, () -> {
            authService.refreshToken(new RefreshTokenRequest(refreshed.getRefreshToken()));
        });
    }

    @Test
    @Transactional
    @DisplayName("Kiểm tra chuỗi nghiệp vụ toàn diện của Chủ trọ (UC 01 đến UC 29)")
    void testFullLandlordLifecycle() {
        User landlord = userRepository.findByUsername("landlord").orElseThrow();
        Long landlordId = landlord.getId();

        // 1. UC 02: Thêm mới tòa nhà
        BuildingRequest bRequest = new BuildingRequest();
        bRequest.setName("Tòa nhà Ánh Dương Test");
        bRequest.setProvince("Hà Nội");
        bRequest.setWard("Dịch Vọng Hậu");
        bRequest.setAddressDetail("Số 12 Ngõ 80 Cầu Giấy");
        bRequest.setNumFloors(5);

        BuildingResponse bResponse = buildingService.createBuilding(landlordId, bRequest);
        Assertions.assertNotNull(bResponse.getId());

        // 2. UC 06: Thêm mới phòng trọ (trạng thái AVAILABLE)
        RoomRequest rRequest = new RoomRequest();
        rRequest.setBuildingId(bResponse.getId());
        rRequest.setName("Phòng 101");
        rRequest.setFloor(1);
        rRequest.setArea(BigDecimal.valueOf(25.0));
        rRequest.setListedPrice(3500000L);
        rRequest.setStandardDeposit(3500000L);
        rRequest.setMaxCapacity(2);
        rRequest.setAmenities(List.of("Điều hòa", "Nóng lạnh"));

        RoomResponse rResponse = roomService.createRoom(landlordId, rRequest);
        Assertions.assertEquals("AVAILABLE", rResponse.getStatus());
        Assertions.assertTrue(rResponse.getAmenities().contains("Điều hòa"));

        // 3. UC 14: Thêm khách thuê vào phòng
        TenantRequest tRequest = new TenantRequest();
        tRequest.setRoomId(rResponse.getId());
        tRequest.setFullName("Lê Minh Quân");
        tRequest.setPhone("0933445566");
        tRequest.setIdCardNumber("001209999999");
        tRequest.setGender("Nam");
        tRequest.setDateOfBirth(LocalDate.of(2000, 1, 1));
        tRequest.setHometown("Hải Phòng");

        TenantResponse tResponse = tenantService.addTenant(landlordId, tRequest);
        Assertions.assertNotNull(tResponse.getId());

        // 4. UC 19: Tạo hợp đồng thuê phòng -> phòng chuyển sang OCCUPIED
        ContractCreateRequest cRequest = new ContractCreateRequest();
        cRequest.setRoomId(rResponse.getId());
        cRequest.setRepresentativeTenantId(tResponse.getId());
        cRequest.setStartDate(LocalDate.of(2026, 1, 1));
        cRequest.setEndDate(LocalDate.of(2026, 12, 31));
        cRequest.setRentPrice(3500000L);
        cRequest.setDepositAmount(3500000L);

        ContractCreateRequest.ContractServiceItemRequest elecItem = new ContractCreateRequest.ContractServiceItemRequest();
        elecItem.setServiceName("Tiền điện");
        elecItem.setUnit("kWh");
        elecItem.setAppliedUnitPrice(3800L);
        elecItem.setBillingMethod("METER_INDEX");
        elecItem.setInitialIndex(100);

        ContractCreateRequest.ContractServiceItemRequest waterItem = new ContractCreateRequest.ContractServiceItemRequest();
        waterItem.setServiceName("Tiền nước");
        waterItem.setUnit("m3");
        waterItem.setAppliedUnitPrice(30000L);
        waterItem.setBillingMethod("METER_INDEX");
        waterItem.setInitialIndex(20);

        cRequest.setServices(java.util.List.of(elecItem, waterItem));

        ContractResponse cResponse = contractService.createContract(landlordId, cRequest);
        Assertions.assertEquals("ACTIVE", cResponse.getStatus());

        RoomResponse roomAfterContract = roomService.getRoomById(landlordId, rResponse.getId());
        Assertions.assertEquals("OCCUPIED", roomAfterContract.getStatus());

        // 5. UC 23: Ghi chỉ số điện nước và phát hành hóa đơn
        MeterReadingInvoiceRequest invRequest = new MeterReadingInvoiceRequest();
        invRequest.setContractId(cResponse.getId());
        invRequest.setBillingPeriod("01/2026");
        invRequest.setDueDate(LocalDate.of(2026, 2, 5));

        MeterReadingInvoiceRequest.InvoiceItemRequest elecInvItem = MeterReadingInvoiceRequest.InvoiceItemRequest.builder()
                .itemName("Tiền điện sinh hoạt")
                .previousIndex(100)
                .currentIndex(150)
                .quantity(BigDecimal.valueOf(50))
                .unitPrice(3800L)
                .amount(190000L)
                .note("50 kWh (Từ số 100 đến 150)")
                .build();

        MeterReadingInvoiceRequest.InvoiceItemRequest waterInvItem = MeterReadingInvoiceRequest.InvoiceItemRequest.builder()
                .itemName("Tiền nước sinh hoạt")
                .previousIndex(20)
                .currentIndex(25)
                .quantity(BigDecimal.valueOf(5))
                .unitPrice(30000L)
                .amount(150000L)
                .note("5 m3 (Từ số 20 đến 25)")
                .build();

        invRequest.setItems(java.util.List.of(elecInvItem, waterInvItem));

        InvoiceResponse invResponse = invoiceService.createInvoice(landlordId, invRequest);
        Assertions.assertEquals("UNPAID", invResponse.getStatus());
        // 3500000 + 50*3800 (190000) + 5*30000 (150000) = 3840000
        Assertions.assertEquals(3840000L, invResponse.getTotalAmount());

        // 6. UC 26: Xác nhận thanh toán gạch nợ hóa đơn
        InvoicePaymentRequest payRequest = new InvoicePaymentRequest();
        payRequest.setPaymentAmount(3840000L);
        payRequest.setPaymentMethod("BANK_TRANSFER");

        InvoiceResponse paidInv = invoiceService.confirmPayment(landlordId, invResponse.getId(), payRequest);
        Assertions.assertEquals("PAID", paidInv.getStatus());

        // 7. UC 29: Xem Dashboard thống kê
        LandlordDashboardResponse dashboard = dashboardService.getDashboardStats(landlordId, "01/2026");
        Assertions.assertNotNull(dashboard);
        Assertions.assertEquals(3840000L, dashboard.getMonthlyRevenue());

        // 8. UC 21: Nghiệm thu trả phòng & thanh lý hợp đồng -> hoàn cọc, phòng về AVAILABLE
        ContractTerminateRequest termRequest = new ContractTerminateRequest();
        termRequest.setFinalElectricIndex(170); // tiêu thụ thêm 20 số
        termRequest.setFinalWaterIndex(27);     // tiêu thụ thêm 2 khối
        termRequest.setDamageCost(200000L);

        CheckoutCalculationResponse checkout = contractService.terminateContract(landlordId, cResponse.getId(), termRequest);
        Assertions.assertNotNull(checkout.getNetRefundAmount());

        RoomResponse roomAfterTerm = roomService.getRoomById(landlordId, rResponse.getId());
        Assertions.assertEquals("AVAILABLE", roomAfterTerm.getStatus());
    }

    @Test
    @Transactional
    @DisplayName("Kiểm tra toàn bộ truy vấn tìm kiếm và lọc với tham số null và từ khóa trên PostgreSQL")
    void testSearchAndFilterWithNullsAndKeywords() {
        User landlord = userRepository.findByUsername("landlord").orElseThrow();
        Long landlordId = landlord.getId();

        // 1. Kiểm tra getBuildings khi keyword = null (không bị lỗi lower(bytea))
        List<BuildingResponse> allBuildings = buildingService.getBuildings(landlordId, null);
        Assertions.assertNotNull(allBuildings);
        Assertions.assertFalse(allBuildings.isEmpty(), "Danh sách tòa nhà không được rỗng");

        // 2. Kiểm tra getBuildings khi có keyword
        List<BuildingResponse> searchedBuildings = buildingService.getBuildings(landlordId, "ánh dương");
        Assertions.assertNotNull(searchedBuildings);

        // 3. Kiểm tra searchTenants khi keyword = null, buildingId = null, roomId = null
        List<TenantResponse> allTenants = tenantService.searchTenants(landlordId, null, null, null);
        Assertions.assertNotNull(allTenants);

        // 4. Kiểm tra searchTenants khi có keyword
        List<TenantResponse> searchedTenants = tenantService.searchTenants(landlordId, null, null, "Quân");
        Assertions.assertNotNull(searchedTenants);

        // 5. Kiểm tra getRooms với các filter null
        List<RoomResponse> allRooms = roomService.getRooms(landlordId, null, null, null);
        Assertions.assertNotNull(allRooms);

        // 6. Kiểm tra getContracts với các filter null
        List<ContractResponse> allContracts = contractService.getContracts(landlordId, null, null);
        Assertions.assertNotNull(allContracts);

        // 7. Kiểm tra getInvoices với các filter null
        List<InvoiceResponse> allInvoices = invoiceService.getInvoices(landlordId, null, null, null);
        Assertions.assertNotNull(allInvoices);
    }
}

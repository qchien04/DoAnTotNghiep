package com.doan.core.business.controller.landlord;

import com.doan.core.business.dto.landlord.contract.*;
import com.doan.core.business.service.LandlordContractService;
import com.doan.core.common.data.ResponseData;
import com.doan.core.common.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/landlord/contracts")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
@Tag(name = "6. Chủ trọ - Quản lý Hợp đồng (UC 18 - 21)", description = "Xem danh sách hợp đồng, tạo mới, gia hạn điều khoản, nghiệm thu trả phòng thanh lý cọc")
public class LandlordContractController {

    private final LandlordContractService contractService;

    @GetMapping
    @Operation(summary = "UC 18: Xem danh sách hợp đồng thuê phòng", description = "Lấy danh sách hợp đồng, lọc theo tòa nhà hoặc trạng thái (ACTIVE, EXPIRING_SOON, TERMINATED)")
    public ResponseEntity<ResponseData<List<ContractResponse>>> getContracts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long buildingId,
            @RequestParam(required = false) String status) {
        List<ContractResponse> contracts = contractService.getContracts(principal.getId(), buildingId, status);
        return ResponseEntity.ok(ResponseData.success(contracts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết hợp đồng", description = "Lấy thông tin chi tiết hợp đồng thuê phòng theo ID")
    public ResponseEntity<ResponseData<ContractResponse>> getContractById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ContractResponse contract = contractService.getContractById(principal.getId(), id);
        return ResponseEntity.ok(ResponseData.success(contract));
    }

    @PostMapping
    @Operation(summary = "UC 19: Tạo hợp đồng thuê phòng mới", description = "Tạo hợp đồng thuê phòng mới, tự động cập nhật phòng sang 'Đang thuê' và gán khách đại diện")
    public ResponseEntity<ResponseData<ContractResponse>> createContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ContractCreateRequest request) {
        ContractResponse created = contractService.createContract(principal.getId(), request);
        return ResponseEntity.ok(ResponseData.success("Tạo hợp đồng thành công!", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "UC 20: Cập nhật điều khoản hoặc gia hạn hợp đồng", description = "Cập nhật thời hạn kết thúc hoặc điều chỉnh giá thuê thỏa thuận")
    public ResponseEntity<ResponseData<ContractResponse>> updateContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ContractUpdateRequest request) {
        ContractResponse updated = contractService.updateContract(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Cập nhật hợp đồng thành công!", updated));
    }

    @PostMapping("/{id}/terminate")
    @Operation(summary = "UC 21: Thanh lý hợp đồng và xử lý trả phòng", description = "Nghiệm thu điện nước ngày trả phòng, kiểm kê đền bù hư hỏng, hoàn cọc và chuyển phòng về Còn trống")
    public ResponseEntity<ResponseData<CheckoutCalculationResponse>> terminateContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ContractTerminateRequest request) {
        CheckoutCalculationResponse calculation = contractService.terminateContract(principal.getId(), id, request);
        return ResponseEntity.ok(ResponseData.success("Thanh lý hợp đồng và nghiệm thu trả phòng thành công!", calculation));
    }
}

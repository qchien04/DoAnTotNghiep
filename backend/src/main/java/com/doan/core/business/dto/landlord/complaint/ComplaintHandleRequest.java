package com.doan.core.business.dto.landlord.complaint;

import com.doan.core.business.enums.ComplaintStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Yêu cầu tiếp nhận và cập nhật tiến độ xử lý sự cố / khiếu nại")
public class ComplaintHandleRequest {

    @NotNull(message = "Trạng thái xử lý không được để trống")
    @Schema(description = "Trạng thái mới (PROCESSING: Đang xử lý, RESOLVED: Đã giải quyết, REJECTED: Từ chối)", example = "PROCESSING")
    private ComplaintStatus status;

    @Schema(description = "Nội dung phản hồi hoặc tiến độ xử lý", example = "Chủ nhà đã hẹn thợ 14h00 chiều nay đến kiểm tra")
    private String resolutionNote;
}

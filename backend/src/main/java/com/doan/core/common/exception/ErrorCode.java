package com.doan.core.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Định nghĩa bảng mã lỗi hệ thống và Http Status tương ứng
 */
@Getter
public enum ErrorCode {

    SUCCESS("00", "Thao tác thành công", HttpStatus.OK),
    BAD_REQUEST("400", "Dữ liệu yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("401", "Chưa xác thực hoặc token không hợp lệ", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("403", "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    NOT_FOUND("404", "Không tìm thấy tài nguyên yêu cầu", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED("405", "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),
    CONFLICT("409", "Dữ liệu đã tồn tại hoặc xảy ra xung đột", HttpStatus.CONFLICT),
    INTERNAL_SERVER_ERROR("500", "Lỗi máy chủ nội bộ, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),

    // Lỗi Nghiệp Vụ - Auth & User
    USERNAME_ALREADY_EXISTS("AUTH_001", "Tên đăng nhập đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    EMAIL_ALREADY_EXISTS("AUTH_002", "Email này đã được sử dụng", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("AUTH_003", "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("AUTH_004", "Không tìm thấy thông tin người dùng", HttpStatus.NOT_FOUND),
    USER_DISABLED("AUTH_005", "Tài khoản của bạn đã bị khóa", HttpStatus.FORBIDDEN),
    TOKEN_EXPIRED("AUTH_006", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("AUTH_007", "Token xác thực không hợp lệ hoặc đã bị chỉnh sửa", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED("AUTH_008", "Refresh token đã hết hạn, vui lòng đăng nhập lại", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_NOT_FOUND("AUTH_009", "Refresh token không tồn tại hoặc đã bị thu hồi", HttpStatus.UNAUTHORIZED),

    // Lỗi Nghiệp Vụ - Tòa nhà (Building)
    BUILDING_NOT_FOUND("BLD_001", "Không tìm thấy thông tin tòa nhà", HttpStatus.NOT_FOUND),
    BUILDING_CODE_EXISTS("BLD_002", "Mã tòa nhà đã tồn tại", HttpStatus.CONFLICT),
    BUILDING_HAS_ACTIVE_ROOMS("BLD_003", "Không thể xóa tòa nhà đang có phòng hoặc khách thuê", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Phòng trọ (Room)
    ROOM_NOT_FOUND("ROOM_001", "Không tìm thấy thông tin phòng trọ", HttpStatus.NOT_FOUND),
    ROOM_CODE_EXISTS("ROOM_002", "Mã phòng đã tồn tại trong tòa nhà này", HttpStatus.CONFLICT),
    ROOM_NOT_AVAILABLE("ROOM_003", "Phòng này hiện không ở trạng thái còn trống", HttpStatus.BAD_REQUEST),
    ROOM_HAS_ACTIVE_CONTRACT("ROOM_004", "Phòng hiện đang có hợp đồng hiệu lực, không thể thao tác", HttpStatus.BAD_REQUEST),
    ROOM_HAS_HISTORY("ROOM_005", "Phòng đã có lịch sử thuê hoặc hóa đơn, không thể xóa vĩnh viễn", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Dịch vụ tiện ích (Service)
    SERVICE_NOT_FOUND("SRV_001", "Không tìm thấy dịch vụ tiện ích", HttpStatus.NOT_FOUND),
    SERVICE_ALREADY_EXISTS("SRV_002", "Tên dịch vụ tiện ích này đã tồn tại", HttpStatus.CONFLICT),
    SERVICE_IN_USE("SRV_003", "Dịch vụ đang được áp dụng trong các hợp đồng hiệu lực, không thể xóa", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Khách thuê (Tenant)
    TENANT_NOT_FOUND("TNT_001", "Không tìm thấy hồ sơ khách thuê", HttpStatus.NOT_FOUND),
    TENANT_ID_CARD_EXISTS("TNT_002", "Số CCCD này đang được ghi nhận ở phòng khác", HttpStatus.CONFLICT),
    TENANT_IS_REPRESENTATIVE("TNT_003", "Khách thuê là người đại diện hợp đồng, không thể xóa trực tiếp", HttpStatus.BAD_REQUEST),
    TENANT_ALREADY_LINKED("TNT_004", "Khách thuê đã được liên kết với tài khoản hệ thống", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Hợp đồng (Contract)
    CONTRACT_NOT_FOUND("CTR_001", "Không tìm thấy hợp đồng thuê phòng", HttpStatus.NOT_FOUND),
    CONTRACT_CODE_EXISTS("CTR_002", "Mã hợp đồng đã tồn tại trong hệ thống", HttpStatus.CONFLICT),
    CONTRACT_ALREADY_TERMINATED("CTR_003", "Hợp đồng đã thanh lý, không thể chỉnh sửa", HttpStatus.BAD_REQUEST),
    INVALID_CONTRACT_DATES("CTR_004", "Ngày kết thúc phải sau ngày bắt đầu hợp đồng", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Hóa đơn & Chỉ số điện nước (Invoice)
    INVOICE_NOT_FOUND("INV_001", "Không tìm thấy hóa đơn tiền phòng", HttpStatus.NOT_FOUND),
    INVOICE_ALREADY_PAID("INV_002", "Hóa đơn đã thanh toán, không thể chỉnh sửa trực tiếp", HttpStatus.BAD_REQUEST),
    INVOICE_ALREADY_EXISTS("INV_003", "Hóa đơn cho kỳ cước này đã được lập", HttpStatus.CONFLICT),
    INVALID_METER_READING("INV_004", "Chỉ số mới không được nhỏ hơn chỉ số cũ", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Khiếu nại (Complaint)
    COMPLAINT_NOT_FOUND("CMP_001", "Không tìm thấy thông tin khiếu nại báo hỏng", HttpStatus.NOT_FOUND);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

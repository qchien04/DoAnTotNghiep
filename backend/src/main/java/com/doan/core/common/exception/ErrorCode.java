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
    TOO_MANY_REQUESTS("429", "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau ít phút",
            HttpStatus.TOO_MANY_REQUESTS),

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
    TOKEN_REUSE_DETECTED("AUTH_010",
            "Phát hiện hành vi sử dụng lại token đã thu hồi. Toàn bộ phiên đăng nhập đã bị vô hiệu hóa vì lý do an toàn",
            HttpStatus.UNAUTHORIZED),
    INVALID_OLD_PASSWORD("AUTH_011", "Mật khẩu cũ không chính xác", HttpStatus.BAD_REQUEST),
    PASSWORD_CONFIRM_NOT_MATCH("AUTH_012", "Mật khẩu xác nhận không khớp với mật khẩu mới", HttpStatus.BAD_REQUEST),
    OTP_REQUIRED("AUTH_013", "Vui lòng nhập mã xác thực OTP gửi qua email", HttpStatus.BAD_REQUEST),
    INVALID_OTP("AUTH_014", "Mã xác thực OTP không chính xác", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED("AUTH_015", "Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng yêu cầu mã mới",
            HttpStatus.BAD_REQUEST),
    OTP_RATE_LIMITED("AUTH_016", "Vui lòng chờ ít nhất 60 giây trước khi yêu cầu gửi lại mã OTP",
            HttpStatus.TOO_MANY_REQUESTS),
    OTP_MAX_ATTEMPTS("AUTH_017", "Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới", HttpStatus.BAD_REQUEST),
    ACCOUNT_TEMPORARILY_LOCKED("AUTH_018", "Tài khoản đã bị khóa", HttpStatus.BAD_REQUEST),
    // Lỗi Nghiệp Vụ - Tòa nhà (Building)
    BUILDING_NOT_FOUND("BLD_001", "Không tìm thấy thông tin tòa nhà", HttpStatus.NOT_FOUND),
    BUILDING_CODE_EXISTS("BLD_002", "Tên tòa nhà đã tồn tại", HttpStatus.CONFLICT),
    BUILDING_HAS_ACTIVE_ROOMS("BLD_003", "Không thể xóa tòa nhà đang có phòng hoặc khách thuê", HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Phòng trọ (Room)
    ROOM_NOT_FOUND("ROOM_001", "Không tìm thấy thông tin phòng trọ", HttpStatus.NOT_FOUND),
    ROOM_CODE_EXISTS("ROOM_002", "Tên phòng đã tồn tại trong tòa nhà này", HttpStatus.CONFLICT),
    ROOM_NOT_AVAILABLE("ROOM_003", "Phòng này hiện không ở trạng thái còn trống", HttpStatus.BAD_REQUEST),
    ROOM_HAS_ACTIVE_CONTRACT("ROOM_004", "Phòng hiện đang có hợp đồng hiệu lực, không thể thao tác",
            HttpStatus.BAD_REQUEST),
    ROOM_HAS_HISTORY("ROOM_005", "Phòng đã có lịch sử thuê hoặc hóa đơn, không thể xóa vĩnh viễn",
            HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Dịch vụ tiện ích (Service)
    SERVICE_NOT_FOUND("SRV_001", "Không tìm thấy dịch vụ tiện ích", HttpStatus.NOT_FOUND),
    SERVICE_ALREADY_EXISTS("SRV_002", "Tên dịch vụ tiện ích này đã tồn tại", HttpStatus.CONFLICT),
    SERVICE_IN_USE("SRV_003", "Dịch vụ đang được áp dụng trong các hợp đồng hiệu lực, không thể xóa",
            HttpStatus.BAD_REQUEST),

    // Lỗi Nghiệp Vụ - Khách thuê (Tenant)
    TENANT_NOT_FOUND("TNT_001", "Không tìm thấy hồ sơ khách thuê", HttpStatus.NOT_FOUND),
    TENANT_ID_CARD_EXISTS("TNT_002", "Số CCCD này đang được ghi nhận ở phòng khác", HttpStatus.CONFLICT),
    TENANT_IS_REPRESENTATIVE("TNT_003", "Khách thuê là người đại diện hợp đồng, không thể xóa trực tiếp",
            HttpStatus.BAD_REQUEST),
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
    COMPLAINT_NOT_FOUND("CMP_001", "Không tìm thấy thông tin khiếu nại báo hỏng", HttpStatus.NOT_FOUND),

    // Lỗi Nghiệp Vụ - File & Secure Storage
    FILE_NOT_FOUND("FILE_001", "Không tìm thấy tệp tin yêu cầu", HttpStatus.NOT_FOUND),
    FILE_STORAGE_ERROR("FILE_002", "Lỗi trong quá trình lưu trữ tệp tin an toàn", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE_TYPE("FILE_003", "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận định dạng ảnh JPG, JPEG, PNG, WEBP", HttpStatus.BAD_REQUEST),
    FILE_SIZE_EXCEEDED("FILE_004", "Kích thước tệp vượt quá giới hạn cho phép (tối đa 15MB)", HttpStatus.BAD_REQUEST),
    FILE_EMPTY("FILE_005", "Tệp tải lên không được để trống", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE("FILE_006", "Kích thước tệp vượt quá giới hạn cho phép (tối đa 15MB)", HttpStatus.BAD_REQUEST),
    FILE_TYPE_INVALID("FILE_007", "Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WEBP, GIF)", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED("FILE_008", "Không thể lưu tệp lên hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR),

    // Lỗi Nghiệp Vụ - KYC & CCCD
    KYC_DOCUMENT_NOT_FOUND("KYC_001", "Không tìm thấy tài liệu xác thực danh tính", HttpStatus.NOT_FOUND),
    KYC_ACCESS_DENIED("KYC_002", "Bạn không có quyền truy cập vào tài liệu xác thực này", HttpStatus.FORBIDDEN),
    KYC_BUNDLE_INCOMPLETE("KYC_003", "Vui lòng tải lên đầy đủ ảnh mặt trước, mặt sau CCCD và ảnh selfie", HttpStatus.BAD_REQUEST),
    ID_CARD_ALREADY_EXISTS("KYC_004", "Số Căn cước công dân (CCCD) này đã được liên kết với một tài khoản khác trong hệ thống", HttpStatus.CONFLICT),
    KYC_REQUIRED("KYC_005", "Tài khoản cần hoàn tất xác thực danh tính điện tử (eKYC) trước khi đăng tin tìm người ở ghép để đảm bảo an toàn cho cộng đồng.", HttpStatus.FORBIDDEN),

    // Lỗi Nghiệp Vụ - Xác minh Chủ trọ (Landlord Verification)
    LANDLORD_NOT_VERIFIED("LANDLORD_001", "Chủ trọ chưa được xác minh tài liệu nhà/đất hoặc hợp đồng ủy quyền. Vui lòng hoàn tất xác minh trước khi đăng tin phòng.", HttpStatus.FORBIDDEN),
    LANDLORD_VERIFICATION_NOT_FOUND("LANDLORD_002", "Không tìm thấy hồ sơ xác minh chủ trọ", HttpStatus.NOT_FOUND),
    LANDLORD_VERIFICATION_PENDING_EXISTS("LANDLORD_003", "Bạn đã có một hồ sơ xác minh đang chờ quản trị viên xét duyệt. Vui lòng kiên nhẫn chờ phản hồi.", HttpStatus.CONFLICT),

    // Lỗi Nghiệp Vụ - Đánh giá rủi ro & Bản quyền hình ảnh phòng trọ (Room Moderation & Copyright)
    ROOM_MIN_IMAGES_REQUIRED("ROOM_006", "Cần tải lên tối thiểu 3 ảnh thực tế của phòng trọ", HttpStatus.BAD_REQUEST),
    ROOM_STOLEN_IMAGES_DETECTED("ROOM_007", "Phát hiện hình ảnh trùng khớp với tin đăng của chủ trọ khác. Tin đăng đã bị khóa vĩnh viễn do vi phạm bản quyền hình ảnh.", HttpStatus.FORBIDDEN),
    ROOM_CONTENT_RISK_REJECTED("ROOM_008", "Nội dung bài đăng chứa thông tin rủi ro cao (SĐT, liên kết ngoài hoặc tài khoản thanh toán trái phép). Tin bị từ chối duyệt.", HttpStatus.BAD_REQUEST),
    ROOM_LOCKED_MODERATION("ROOM_009", "Phòng trọ đang bị khóa do vi phạm chính sách kiểm duyệt, không thể thao tác.", HttpStatus.FORBIDDEN);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

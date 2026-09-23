# -*- coding: utf-8 -*-
"""
Dữ liệu đặc tả chi tiết 4 Use Case của Role: QUẢN TRỊ VIÊN (Admin)
Chuẩn template, chữ đen nền trắng, bảng mô phỏng dữ liệu chi tiết từng bước.
"""

USECASES_ADMIN = [
    # -------------------------------------------------------------
    # USE CASE 19: Quản lý người dùng hệ thống (CRUD User)
    # -------------------------------------------------------------
    {
        "stt": 19,
        "role": "Admin",
        "chuc_nang": "CRUD Người dùng (Quản lý tài khoản hệ thống)",
        "use_case": "User Account Management (Xem danh sách, tìm kiếm, phân quyền, khóa/mở khóa tài khoản)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đã đăng nhập với tài khoản có quyền Quản trị tối cao (ROLE_ADMIN).",
        "hau_dieu_kien": "Thông tin tài khoản, vai trò và trạng thái hoạt động của người dùng được cập nhật chính xác.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên truy cập mục 'Quản lý người dùng' từ thanh menu quản trị."),
            ("text", "2. Hệ thống hiển thị bảng danh sách toàn bộ tài khoản trong hệ thống kèm thanh tìm kiếm (theo Username, Họ tên, Email, SĐT), bộ lọc Vai trò (Tất cả, Chủ trọ, Người thuê, Quản trị viên) và bộ lọc Trạng thái (Hoạt động, Bị khóa):"),
            ("table",
                ["Mã User", "Tên đăng nhập", "Họ và tên", "Email", "Số điện thoại", "Vai trò", "Trạng thái", "Thao tác"],
                [
                    ["UID001", "admin", "Quản Trị Viên Hệ Thống", "admin@trotot.vn", "0900000001", "ROLE_ADMIN", "Đang hoạt động", "Xem chi tiết"],
                    ["UID101", "chutro_thanh", "Nguyễn Văn Thành", "thanhlandlord@gmail.com", "0912345678", "ROLE_LANDLORD", "Đang hoạt động", "Xem | Khóa | Đổi quyền"],
                    ["UID208", "ducpham99", "Phạm Minh Đức", "ducpham99@gmail.com", "0977888999", "ROLE_TENANT", "Đang hoạt động", "Xem | Khóa | Đổi quyền"],
                    ["UID312", "bad_user", "Trần Văn Gian", "spammer@gmail.com", "0933111222", "ROLE_TENANT", "Bị khóa", "Xem | Mở khóa"]
                ],
                [0.8, 1.1, 1.5, 1.6, 1.1, 1.2, 1.2, 1.3]
            ),
            ("text", "3. Quản trị viên phát hiện tài khoản 'bad_user' có hành vi spam bài đăng lừa đảo tiền cọc, quản trị viên bấm nút 'Xem chi tiết'."),
            ("text", "4. Hệ thống hiển thị trang hồ sơ người dùng gồm: Thông tin cá nhân, Lịch sử đăng nhập, Danh sách bài đăng ở ghép đã tạo, Các báo cáo vi phạm liên quan từ người dùng khác, và nút thao tác 'Khóa tài khoản' kèm ô nhập lý do."),
            ("text", "5. Quản trị viên chọn thời hạn khóa: 'Vĩnh viễn', nhập lý do khóa: 'Tài khoản đăng tin trọ giả mạo nhằm chiếm đoạt tiền cọc của sinh viên; vi phạm điều khoản cộng đồng'." ),
            ("text", "6. Quản trị viên bấm nút 'Xác nhận khóa tài khoản'."),
            ("text", "7. Hệ thống cập nhật trạng thái tài khoản sang 'Bị khóa vĩnh viễn', đồng thời vô hiệu hóa tất cả phiên đăng nhập (JWT token) hiện tại của tài khoản này, và ẩn toàn bộ các bài viết do tài khoản này đăng tải khỏi trang tìm kiếm."),
            ("text", "8. Hệ thống hiển thị thông báo: 'Đã khóa tài khoản UID312 thành công và gỡ bỏ các bài đăng vi phạm liên quan'." )
        ],
        "ngoai_le": [
            "6. Quản trị viên thao tác khóa nhầm tài khoản của chính mình (ROLE_ADMIN đang đăng nhập), hệ thống chặn lại và cảnh báo: 'Không thể tự khóa tài khoản quản trị đang đăng nhập'.",
            "7. Quản trị viên mở khóa tài khoản: Quản trị viên bấm 'Mở khóa tài khoản' -> Nhập lý do mở khóa -> Hệ thống khôi phục trạng thái 'Đang hoạt động' cho người dùng."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 20: Duyệt và xử lý khiếu nại toàn hệ thống
    # -------------------------------------------------------------
    {
        "stt": 20,
        "role": "Admin",
        "chuc_nang": "Duyệt khiếu nại (Xử lý vi phạm & Tranh chấp cấp hệ thống)",
        "use_case": "System Dispute & Content Moderation (Kiểm duyệt tin báo vi phạm, xử lý tranh chấp chủ trọ - người thuê)",
        "actor": "Admin",
        "tien_dieu_kien": "Có báo cáo vi phạm từ người dùng gửi lên hệ thống hoặc có tranh chấp vượt cấp chủ trọ không giải quyết.",
        "hau_dieu_kien": "Nội dung vi phạm bị xử lý gỡ bỏ hoặc hòa giải tranh chấp có quyết định chính thức từ ban quản trị.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên vào mục 'Quản lý khiếu nại & Báo cáo'."),
            ("text", "2. Hệ thống hiển thị danh sách các vụ việc khiếu nại/báo cáo gửi lên ban quản trị, gồm bộ lọc Phân loại (Báo cáo bài đăng lừa đảo, Tranh chấp tiền cọc, Vi phạm quy chế), bộ lọc Mức độ khẩn cấp và bảng danh sách:"),
            ("table",
                ["Mã BC", "Người báo cáo", "Đối tượng bị báo cáo", "Phân loại vi phạm", "Tóm tắt nội dung", "Ngày gửi", "Trạng thái", "Thao tác"],
                [
                    ["BC201", "Phạm Minh Đức (UID208)", "Bài đăng BG08 (UID312)", "Lừa đảo tiền cọc", "Ảnh phòng trọ lấy trên mạng, yêu cầu chuyển cọc trước", "03/10/2026", "Chờ xử lý", "Kiểm duyệt ngay"],
                    ["BC195", "Lê Văn Cường (UID105)", "Chủ trọ UID101", "Tranh chấp tiền cọc", "Chủ trọ trừ tiền cọc vô lý sau khi trả phòng", "29/09/2026", "Đang hòa giải", "Xem hồ sơ"]
                ],
                [0.8, 1.4, 1.4, 1.4, 2.0, 0.9, 1.0, 1.1]
            ),
            ("text", "3. Quản trị viên bấm nút 'Kiểm duyệt ngay' tại báo cáo BC201."),
            ("text", "4. Hệ thống hiển thị chi tiết vụ việc gồm: Nội dung phản ánh của người báo cáo, Bằng chứng ảnh chụp màn hình tin nhắn chuyển tiền do người báo cáo đính kèm, và Chi tiết bài đăng bị tố cáo (BG08)."),
            ("text", "5. Quản trị viên kiểm tra dữ liệu hình ảnh, phát hiện hình ảnh phòng trọ trùng khớp với kho ảnh lừa đảo đã ghi nhận trong cơ sở dữ liệu."),
            ("text", "6. Quản trị viên bấm chọn hành động: '[x] Ẩn và Xóa vĩnh viễn bài đăng BG08' và '[x] Khóa tài khoản đăng tin UID312'." ),
            ("text", "7. Quản trị viên nhập kết luận xử lý: 'Xác minh có hành vi sử dụng hình ảnh giả mạo để chiếm đoạt tiền đặt cọc. Quyết định: Gỡ bài viết, khóa vĩnh viễn tài khoản người đăng, gửi cảnh báo toàn hệ thống'." ),
            ("text", "8. Quản trị viên bấm 'Xác nhận xử lý'."),
            ("text", "9. Hệ thống tự động gỡ bài đăng BG08, khóa tài khoản UID312, gửi thông báo kết quả giải quyết khiếu nại tới người gửi báo cáo Phạm Minh Đức, và chuyển trạng thái báo cáo BC201 thành 'Đã xử lý xong'.")
        ],
        "ngoai_le": [
            "5. Sau khi kiểm tra, bằng chứng không đủ cơ sở hoặc thông tin tố cáo sai sự thật, quản trị viên chọn 'Bác bỏ báo cáo' và gửi phản hồi thông báo lý do cho người báo cáo.",
            "8. Vụ việc tranh chấp phức tạp giữa chủ nhà và người thuê cần trung gian đối chất, quản trị viên chuyển trạng thái sang 'Đang hòa giải' và mở phòng chat 3 bên trên hệ thống."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 21: Quản lý dữ liệu dùng chung (Master Data)
    # -------------------------------------------------------------
    {
        "stt": 21,
        "role": "Admin",
        "chuc_nang": "Quản lý Master Data",
        "use_case": "Master Data Management (Cấu hình danh mục tiện ích phòng trọ, bộ tiêu chí khảo sát lối sống ở ghép, địa bàn quận huyện)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập với quyền Admin.",
        "hau_dieu_kien": "Danh mục tham chiếu dùng chung toàn hệ thống được cập nhật, đồng bộ cho các form nhập liệu của người dùng.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên truy cập mục 'Cấu hình hệ thống' -> 'Quản lý Master Data'."),
            ("text", "2. Hệ thống hiển thị 3 tab danh mục chính: (1) 'Danh mục tiện ích phòng trọ', (2) 'Bộ tiêu chí khảo sát lối sống ở ghép', và (3) 'Danh mục Tỉnh/Thành - Quận/Huyện'."),
            ("text", "3. Quản trị viên bấm chọn Tab (2) 'Bộ tiêu chí khảo sát lối sống ở ghép'."),
            ("text", "4. Hệ thống hiển thị bảng danh sách các tiêu chí khảo sát lối sống đang áp dụng cho thuật toán ghép phòng:"),
            ("table",
                ["Mã TC", "Tên tiêu chí", "Nhóm câu hỏi", "Loại lựa chọn", "Trọng số thuật toán", "Trạng thái", "Thao tác"],
                [
                    ["TC01", "Thói quen hút thuốc lá", "Thói quen cá nhân", "Một lựa chọn (Có / Không)", "25% (Rất cao)", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC02", "Giờ giấc đi ngủ / thức dậy", "Sinh hoạt giờ giấc", "Khoảng thời gian", "20% (Cao)", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC03", "Nuôi thú cưng trong phòng", "Thói quen cá nhân", "Một lựa chọn (Có / Không)", "20% (Cao)", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC04", "Tần suất nấu ăn", "Sinh hoạt chung", "Nhiều lựa chọn", "15% (Trung bình)", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC05", "Dẫn bạn bè / Khách về phòng", "Quy định riêng tư", "Mức độ đồng thuận", "20% (Cao)", "Đang kích hoạt", "Sửa | Tạm dừng"]
                ],
                [0.7, 1.8, 1.4, 1.8, 1.4, 1.1, 1.1]
            ),
            ("text", "5. Quản trị viên muốn bổ sung thêm tiêu chí mới 'Mức độ hướng nội / hướng ngoại (Giao tiếp)', quản trị viên bấm nút 'Thêm tiêu chí mới'."),
            ("text", "6. Hệ thống hiển thị Form thêm tiêu chí gồm: Mã tiêu chí (*), Tên tiêu chí (*), Nhóm phân loại (*), Mô tả giải thích, Các đáp án tùy chọn (Input động), Trọng số đánh giá (%), Trạng thái kích hoạt."),
            ("text", "7. Quản trị viên nhập đầy đủ thông tin đáp án: 'Thích không gian yên tĩnh đọc sách/học tập' và 'Thích trò chuyện, tụ tập bạn bè', thiết lập trọng số 10% và bấm 'Lưu tiêu chí'."),
            ("text", "8. Hệ thống lưu tiêu chí mới vào cơ sở dữ liệu Master Data, hiển thị thông báo thành công và tự động đồng bộ tiêu chí này vào form khảo sát lối sống của người dùng khi đăng bài hoặc xin gia nhập nhóm.")
        ],
        "ngoai_le": [
            "7. Quản trị viên cấu hình tổng trọng số các tiêu chí vượt quá 100%, hệ thống hiển thị cảnh báo: 'Tổng trọng số tính toán thuật toán ghép phòng phải bằng đúng 100%, hiện tại đang là 110%'.",
            "8. Tiêu chí đang được sử dụng trong hàng nghìn bài đăng, quản trị viên chọn xóa: Hệ thống không cho xóa mà yêu cầu chuyển trạng thái sang 'Tạm dừng kích hoạt' để bảo toàn dữ liệu lịch sử."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 22: Xem Dashboard quản trị toàn hệ thống
    # -------------------------------------------------------------
    {
        "stt": 22,
        "role": "Admin",
        "chuc_nang": "Dashboard (Thống kê quản trị toàn hệ thống)",
        "use_case": "Admin System Analytics Dashboard (Theo dõi tăng trưởng tài khoản, tin đăng ghép phòng và tỷ lệ kết nối thành công)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập thành công vào hệ thống quản trị.",
        "hau_dieu_kien": "Báo cáo toàn cảnh hoạt động của nền tảng được tổng hợp trực quan theo thời gian thực.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên truy cập trang 'Dashboard Quản trị'."),
            ("text", "2. Hệ thống tải dữ liệu tổng thể và hiển thị 4 khối chỉ số tăng trưởng toàn sàn:"),
            ("table",
                ["Chỉ số hệ thống", "Số liệu lũy kế", "Tăng trưởng trong tháng", "Ghi chú theo dõi"],
                [
                    ["Tổng người dùng đăng ký", "12.450 tài khoản", "+ 1.250 user mới (+ 11%)", "8.200 người thuê, 4.250 chủ trọ"],
                    ["Tổng số tòa nhà / Khu trọ", "1.580 tòa nhà", "+ 140 tòa nhà mới (+ 9.7%)", "Tập trung tại Hà Nội và TP.HCM"],
                    ["Tổng tin đăng tìm bạn ở ghép", "3.420 bài đăng", "+ 450 bài mới đăng", "2.100 bài có phòng, 1.320 chưa có phòng"],
                    ["Tỷ lệ ghép nhóm thành công", "76.4%", "+ 3.2% so với tháng trước", "2.612 nhóm đã tìm được bạn ở cùng"]
                ],
                [2.0, 1.4, 1.8, 2.3]
            ),
            ("text", "3. Phía dưới, hệ thống hiển thị bảng phân bổ top 5 khu vực có nhu cầu tìm người ở ghép cao nhất:"),
            ("table",
                ["Xếp hạng", "Khu vực Quận / Trường học", "Số lượng tin đăng ở ghép", "Mức giá share trung bình (VNĐ/người)", "Tỷ lệ ghép thành công"],
                [
                    ["Top 1", "Quận Cầu Giấy (Gần ĐHQG, ĐH Giao thông)", "850 bài đăng", "1.850.000", "82%"],
                    ["Top 2", "Quận Hai Bà Trưng (Gần ĐH Bách Khoa, KTQD)", "720 bài đăng", "1.950.000", "79%"],
                    ["Top 3", "Quận Đống Đa (Gần ĐH Thủy Lợi, Ngân Hàng)", "610 bài đăng", "2.100.000", "75%"],
                    ["Top 4", "Quận Thanh Xuân (Gần ĐH KHXH&NV, ĐH Hà Nội)", "540 bài đăng", "1.750.000", "78%"],
                    ["Top 5", "Quận Bắc Từ Liêm (Gần ĐH Công nghiệp)", "430 bài đăng", "1.400.000", "85%"]
                ],
                [0.8, 2.6, 1.5, 1.6, 1.2]
            ),
            ("text", "4. Quản trị viên xem xét số liệu, lựa chọn tải bản tổng kết số liệu định kỳ dạng file Excel hoặc PDF để phục vụ báo cáo ban lãnh đạo/hội đồng bảo vệ."),
            ("text", "5. Hệ thống hoàn tất xuất file báo cáo theo đúng kỳ thống kê đã chọn.")
        ],
        "ngoai_le": [
            "2. Máy chủ cơ sở dữ liệu quá tải do truy vấn lượng bản ghi lớn, hệ thống hiển thị thông báo: 'Đang tải dữ liệu bộ nhớ đệm (Cache) gần nhất, số liệu có thể chậm cập nhật 5 phút'.",
            "4. Quản trị viên chọn lọc báo cáo theo khoảng thời gian không có dữ liệu (ví dụ những năm trước khi thành lập), hệ thống hiển thị: 'Không có dữ liệu trong khoảng thời gian đã chọn'."
        ]
    }
]

print(f"Loaded {len(USECASES_ADMIN)} use cases for Admin.")

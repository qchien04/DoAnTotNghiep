# -*- coding: utf-8 -*-
"""
Danh sách các Use Case độc lập cho Role: QUẢN TRỊ VIÊN (Admin)
Tách rời từng nghiệp vụ CRUD: Thêm, Sửa, Xóa/Khóa, Xem danh sách User, Master Data,
Xử lý tranh chấp, Dashboard...
Mỗi chức năng là 1 Use Case độc lập, sẽ được gán Heading 2 trong file Word.
"""

USECASES_ADMIN_SPLIT = [
    # =========================================================================
    # QUẢN LÝ NGƯỜI DÙNG (CRUD USER)
    # =========================================================================
    {
        "stt": 47,
        "chuc_nang": "Chức năng xem danh sách người dùng toàn hệ thống",
        "use_case": "View User List (Xem danh sách tài khoản người dùng hệ thống)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đã đăng nhập với tài khoản có quyền Admin (ROLE_ADMIN).",
        "hau_dieu_kien": "Danh sách toàn bộ tài khoản người dùng kèm vai trò và trạng thái hoạt động được hiển thị.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên truy cập mục 'Quản lý người dùng' trên thanh menu quản trị."),
            ("text", "2. Hệ thống hiển thị thanh tìm kiếm (Username, Họ tên, Email, SĐT), bộ lọc Vai trò (Tất cả, Chủ trọ, Người thuê, Quản trị viên), bộ lọc Trạng thái (Hoạt động, Bị khóa) và bảng danh sách người dùng:"),
            ("table",
                ["Mã User", "Tên đăng nhập", "Họ và tên", "Email", "Số điện thoại", "Vai trò", "Trạng thái", "Thao tác"],
                [
                    ["UID001", "admin", "Quản Trị Viên Hệ Thống", "admin@trotot.vn", "0900000001", "ROLE_ADMIN", "Đang hoạt động", "Chi tiết"],
                    ["UID101", "chutro_thanh", "Nguyễn Văn Thành", "thanhlandlord@gmail.com", "0912345678", "ROLE_LANDLORD", "Đang hoạt động", "Sửa | Khóa"],
                    ["UID208", "ducpham99", "Phạm Minh Đức", "ducpham99@gmail.com", "0977888999", "ROLE_TENANT", "Đang hoạt động", "Sửa | Khóa"],
                    ["UID312", "bad_user", "Trần Văn Gian", "spammer@gmail.com", "0933111222", "ROLE_TENANT", "Bị khóa", "Mở khóa"]
                ],
                [0.8, 1.1, 1.4, 1.6, 1.1, 1.2, 1.1, 1.1]
            )
        ],
        "ngoai_le": [
            "2. Không tìm thấy tài khoản nào khớp từ khóa, hệ thống hiển thị: 'Không tìm thấy người dùng phù hợp'."
        ]
    },
    {
        "stt": 48,
        "chuc_nang": "Chức năng thêm mới tài khoản người dùng",
        "use_case": "Add User (Tạo tài khoản người dùng nội bộ)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập với quyền Admin.",
        "hau_dieu_kien": "Tài khoản người dùng mới được khởi tạo và lưu vào hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Quản lý người dùng, quản trị viên bấm nút 'Thêm tài khoản mới'."),
            ("text", "2. Hệ thống hiển thị Form tạo tài khoản gồm: Tên đăng nhập (*), Mật khẩu khởi tạo (*), Họ và tên (*), Email (*), Số điện thoại (*), Phân quyền vai trò (Dropdown: ROLE_LANDLORD, ROLE_TENANT, ROLE_ADMIN), Trạng thái kích hoạt."),
            ("text", "3. Quản trị viên nhập thông tin tài khoản hỗ trợ kỹ thuật viên và gán quyền ROLE_ADMIN."),
            ("text", "4. Quản trị viên bấm nút 'Lưu tài khoản'."),
            ("text", "5. Hệ thống mã hóa mật khẩu theo chuẩn BCrypt, lưu tài khoản vào cơ sở dữ liệu và hiển thị thông báo thành công.")
        ],
        "ngoai_le": [
            "3. Username hoặc Email đã tồn tại, hệ thống báo lỗi: 'Tên đăng nhập hoặc Email đã được sử dụng'."
        ]
    },
    {
        "stt": 49,
        "chuc_nang": "Chức năng sửa thông tin và phân quyền vai trò người dùng",
        "use_case": "Update User Role & Info (Cập nhật thông tin và điều chỉnh quyền tài khoản)",
        "actor": "Admin",
        "tien_dieu_kien": "Tài khoản người dùng đã tồn tại trong hệ thống.",
        "hau_dieu_kien": "Thông tin cá nhân hoặc vai trò phân quyền của tài khoản được cập nhật mới.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách người dùng, quản trị viên bấm nút 'Sửa' tại hàng của tài khoản UID101."),
            ("text", "2. Hệ thống hiển thị Form chi tiết thông tin và quyền hạn hiện tại."),
            ("text", "3. Quản trị viên cập nhật thông tin xác thực danh tính chính chủ và điều chỉnh quyền hạn bổ sung."),
            ("text", "4. Quản trị viên bấm 'Lưu thay đổi'."),
            ("text", "5. Hệ thống cập nhật bản ghi trong cơ sở dữ liệu và ghi nhận nhật ký thao tác quản trị (Audit Log).")
        ],
        "ngoai_le": [
            "3. Thay đổi email trùng với email của tài khoản khác, hệ thống báo lỗi: 'Email đã tồn tại'."
        ]
    },
    {
        "stt": 50,
        "chuc_nang": "Chức năng khóa hoặc mở khóa tài khoản người dùng",
        "use_case": "Lock / Unlock User Account (Đình chỉ hoặc khôi phục quyền truy cập tài khoản)",
        "actor": "Admin",
        "tien_dieu_kien": "Tài khoản có hành vi vi phạm quy chuẩn cộng đồng hoặc đã hết thời gian kỷ luật.",
        "hau_dieu_kien": "Trạng thái tài khoản chuyển sang 'Bị khóa' (vô hiệu hóa token) hoặc 'Đang hoạt động'.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên phát hiện tài khoản UID312 có hành vi đăng tin lừa đảo tiền cọc, bấm nút 'Khóa tài khoản'."),
            ("text", "2. Hệ thống hiển thị Form nhập thời hạn khóa (Vĩnh viễn) và lý do khóa."),
            ("text", "3. Quản trị viên nhập lý do: 'Đăng tin phòng trọ giả mạo lừa đảo tiền cọc của sinh viên' và bấm 'Xác nhận khóa'."),
            ("text", "4. Hệ thống cập nhật trạng thái tài khoản thành 'Bị khóa', vô hiệu hóa phiên đăng nhập tức thì và ẩn toàn bộ bài đăng liên quan."),
            ("text", "5. Đối với tài khoản đã khắc phục xong, quản trị viên bấm 'Mở khóa' -> Nhập lý do mở khóa -> Hệ thống kích hoạt lại trạng thái hoạt động bình thường.")
        ],
        "ngoai_le": [
            "1. Quản trị viên thao tác khóa chính tài khoản của mình, hệ thống chặn lại: 'Không thể tự khóa tài khoản quản trị đang đăng nhập'."
        ]
    },

    # =========================================================================
    # QUẢN LÝ MASTER DATA
    # =========================================================================
    {
        "stt": 51,
        "chuc_nang": "Chức năng xem danh mục Master Data",
        "use_case": "View Master Data (Xem danh mục dữ liệu tham chiếu dùng chung toàn hệ thống)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập với quyền Admin.",
        "hau_dieu_kien": "Danh mục tiện ích phòng, danh mục tiêu chí lối sống và địa bàn quận huyện được hiển thị chi tiết.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên truy cập mục 'Cấu hình hệ thống' -> 'Master Data'."),
            ("text", "2. Hệ thống hiển thị các tab danh mục dữ liệu dùng chung: (1) Tiện ích phòng trọ, (2) Bộ tiêu chí khảo sát lối sống ở ghép, (3) Địa bàn Quận/Huyện."),
            ("text", "3. Quản trị viên chọn tab 'Bộ tiêu chí khảo sát lối sống ở ghép'."),
            ("text", "4. Hệ thống hiển thị bảng danh mục các tiêu chí đang áp dụng cho thuật toán ghép phòng:"),
            ("table",
                ["Mã TC", "Tên tiêu chí lối sống", "Nhóm phân loại", "Trọng số thuật toán", "Trạng thái", "Thao tác"],
                [
                    ["TC01", "Thói quen hút thuốc lá", "Thói quen cá nhân", "25%", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC02", "Giờ giấc đi ngủ ban đêm", "Sinh hoạt giờ giấc", "20%", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC03", "Nuôi thú cưng trong phòng", "Thói quen cá nhân", "20%", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC04", "Tần suất nấu ăn tại phòng", "Sinh hoạt chung", "15%", "Đang kích hoạt", "Sửa | Tạm dừng"],
                    ["TC05", "Dẫn bạn bè / Khách về phòng", "Quy định riêng tư", "20%", "Đang kích hoạt", "Sửa | Tạm dừng"]
                ],
                [0.8, 2.2, 1.6, 1.4, 1.2, 1.2]
            )
        ],
        "ngoai_le": [
            "2. Hệ thống lỗi kết nối cấu hình, hiển thị: 'Không thể tải Master Data'."
        ]
    },
    {
        "stt": 52,
        "chuc_nang": "Chức năng thêm mới dữ liệu Master Data",
        "use_case": "Add Master Data (Bổ sung tiện ích hoặc tiêu chí lối sống mới)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập với quyền Admin.",
        "hau_dieu_kien": "Bản ghi Master Data mới được lưu trữ và tự động đồng bộ vào các form khảo sát của người dùng.",
        "kich_ban_chinh": [
            ("text", "1. Tại tab Bộ tiêu chí lối sống, quản trị viên bấm nút 'Thêm tiêu chí mới'."),
            ("text", "2. Hệ thống hiển thị Form thêm tiêu chí gồm: Mã tiêu chí (*), Tên tiêu chí (*), Nhóm phân loại (*), Các đáp án lựa chọn, Trọng số (%), Trạng thái kích hoạt."),
            ("text", "3. Quản trị viên nhập: Mã TC06, Tên: 'Mức độ giao tiếp / Hướng nội - Hướng ngoại', Nhóm: Thói quen cá nhân, Trọng số: 10%, Đáp án: 'Thích yên tĩnh đọc sách' và 'Thích trò chuyện bạn bè'."),
            ("text", "4. Quản trị viên bấm 'Lưu tiêu chí'."),
            ("text", "5. Hệ thống lưu bản ghi mới và cập nhật tức thì vào bộ câu hỏi khảo sát ở ghép.")
        ],
        "ngoai_le": [
            "3. Mã tiêu chí đã tồn tại, hệ thống báo lỗi: 'Mã tiêu chí bị trùng lặp'."
        ]
    },
    {
        "stt": 53,
        "chuc_nang": "Chức năng sửa dữ liệu Master Data",
        "use_case": "Update Master Data (Cập nhật tên, trọng số hoặc đáp án Master Data)",
        "actor": "Admin",
        "tien_dieu_kien": "Bản ghi Master Data đã tồn tại.",
        "hau_dieu_kien": "Nội dung cập nhật được lưu và áp dụng cho các phiên tính toán tiếp theo.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh mục tiêu chí, quản trị viên bấm nút 'Sửa' tại tiêu chí TC04 (Tần suất nấu ăn)."),
            ("text", "2. Hệ thống hiển thị Form chỉnh sửa tiêu chí."),
            ("text", "3. Quản trị viên điều chỉnh lại trọng số thuật toán từ 15% lên 20%."),
            ("text", "4. Quản trị viên bấm 'Cập nhật'."),
            ("text", "5. Hệ thống lưu dữ liệu mới và thông báo 'Cập nhật tiêu chí thành công!'." )
        ],
        "ngoai_le": [
            "3. Tổng trọng số các tiêu chí sau khi sửa không bằng 100%, hệ thống cảnh báo: 'Tổng trọng số phải bằng đúng 100%'."
        ]
    },
    {
        "stt": 54,
        "chuc_nang": "Chức năng xóa hoặc tạm dừng Master Data",
        "use_case": "Delete / Deactivate Master Data (Tạm ngừng kích hoạt danh mục)",
        "actor": "Admin",
        "tien_dieu_kien": "Tiêu chí hoặc tiện ích không còn phù hợp với thực tế.",
        "hau_dieu_kien": "Bản ghi chuyển sang trạng thái 'Tạm dừng', ẩn khỏi các form tạo mới.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên bấm nút 'Tạm dừng' tại tiêu chí TC06."),
            ("text", "2. Hệ thống hiển thị hộp thoại xác nhận: 'Tạm dừng tiêu chí này sẽ ẩn khỏi các form đăng bài mới nhưng giữ nguyên dữ liệu các bài cũ'."),
            ("text", "3. Quản trị viên bấm 'Xác nhận'."),
            ("text", "4. Hệ thống cập nhật trạng thái thành 'Tạm dừng' và thông báo thành công.")
        ],
        "ngoai_le": [
            "1. Quản trị viên chọn xóa vĩnh viễn tiêu chí đang có hàng nghìn bài đăng sử dụng, hệ thống từ chối xóa để đảm bảo toàn vẹn dữ liệu."
        ]
    },

    # =========================================================================
    # DUYỆT KHIẾU NẠI & KIỂM DUYỆT HỆ THỐNG
    # =========================================================================
    {
        "stt": 55,
        "chuc_nang": "Chức năng xem danh sách báo cáo vi phạm toàn sàn",
        "use_case": "View Dispute Reports (Tiếp nhận và xem danh sách tin báo vi phạm)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập với quyền Admin.",
        "hau_dieu_kien": "Danh sách các báo cáo lừa đảo, vi phạm quy chế hoặc tranh chấp được hiển thị đầy đủ.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên chọn mục 'Quản lý khiếu nại & Báo cáo'."),
            ("text", "2. Hệ thống hiển thị danh sách các vụ việc:"),
            ("table",
                ["Mã BC", "Người báo cáo", "Đối tượng bị báo cáo", "Loại vi phạm", "Tóm tắt nội dung", "Ngày gửi", "Trạng thái", "Thao tác"],
                [
                    ["BC201", "Phạm Minh Đức (UID208)", "Bài đăng BG08 (UID312)", "Lừa đảo cọc", "Ảnh phòng giả mạo, yêu cầu chuyển cọc trước", "03/10/2026", "Chờ xử lý", "Kiểm duyệt"],
                    ["BC195", "Lê Văn Cường (UID105)", "Chủ trọ UID101", "Tranh chấp cọc", "Chủ trọ trừ tiền cọc vô lý sau khi trả phòng", "29/09/2026", "Đang hòa giải", "Xem hồ sơ"]
                ],
                [0.8, 1.4, 1.4, 1.2, 2.0, 0.9, 1.0, 1.1]
            )
        ],
        "ngoai_le": [
            "2. Không có báo cáo vi phạm nào, bảng hiển thị: 'Không có báo cáo vi phạm nào cần xử lý'."
        ]
    },
    {
        "stt": 56,
        "chuc_nang": "Chức năng xử lý gỡ bài đăng vi phạm và kỷ luật tài khoản",
        "use_case": "Enforce Violation Actions (Gỡ bỏ tin vi phạm và áp dụng chế tài kỷ luật)",
        "actor": "Admin",
        "tien_dieu_kien": "Có báo cáo vi phạm được xác minh là có thật.",
        "hau_dieu_kien": "Nội dung vi phạm bị gỡ bỏ, tài khoản vi phạm bị xử lý theo đúng chế tài.",
        "kich_ban_chinh": [
            ("text", "1. Tại báo cáo BC201, quản trị viên bấm nút 'Kiểm duyệt'."),
            ("text", "2. Hệ thống hiển thị bằng chứng ảnh chụp tin nhắn và nội dung bài đăng bị tố cáo (BG08)."),
            ("text", "3. Quản trị viên đối chiếu và xác nhận có hành vi lừa đảo cọc."),
            ("text", "4. Quản trị viên tích chọn hành động: '[x] Gỡ bỏ bài đăng BG08' và '[x] Khóa vĩnh viễn tài khoản UID312'."),
            ("text", "5. Quản trị viên nhập kết luận: 'Sử dụng hình ảnh giả mạo để chiếm đoạt tiền cọc; gỡ bài và khóa vĩnh viễn' và bấm 'Xác nhận xử lý'."),
            ("text", "6. Hệ thống thực thi lệnh gỡ bài, khóa tài khoản UID312, gửi thông báo kết quả cho người báo cáo và đóng hồ sơ BC201.")
        ],
        "ngoai_le": [
            "3. Báo cáo không có căn cứ hoặc tố cáo sai, quản trị viên chọn 'Bác bỏ báo cáo' và gửi giải thích cho người báo cáo."
        ]
    },

    # =========================================================================
    # THỐNG KÊ TOÀN HỆ THỐNG
    # =========================================================================
    {
        "stt": 57,
        "chuc_nang": "Chức năng xem Dashboard thống kê toàn hệ thống",
        "use_case": "View Admin Analytics Dashboard (Theo dõi tăng trưởng tài khoản, tin đăng và tỷ lệ ghép thành công)",
        "actor": "Admin",
        "tien_dieu_kien": "Quản trị viên đăng nhập thành công vào hệ thống quản trị.",
        "hau_dieu_kien": "Toàn cảnh số liệu vận hành của nền tảng được hiển thị trực quan theo thời gian thực.",
        "kich_ban_chinh": [
            ("text", "1. Quản trị viên chọn trang 'Dashboard Quản trị'."),
            ("text", "2. Hệ thống tải dữ liệu tổng thể và hiển thị 4 khối chỉ số tăng trưởng:"),
            ("table",
                ["Chỉ số hệ thống", "Số liệu lũy kế", "Tăng trưởng trong tháng", "Ghi chú"],
                [
                    ["Tổng người dùng đăng ký", "12.450 tài khoản", "+ 1.250 user mới (+ 11%)", "8.200 người thuê, 4.250 chủ trọ"],
                    ["Tổng số tòa nhà / Khu trọ", "1.580 tòa nhà", "+ 140 tòa nhà mới (+ 9.7%)", "Tập trung tại Hà Nội và TP.HCM"],
                    ["Tổng tin đăng tìm bạn ở ghép", "3.420 bài đăng", "+ 450 bài mới", "2.100 bài có phòng, 1.320 chưa có phòng"],
                    ["Tỷ lệ ghép nhóm thành công", "76.4%", "+ 3.2% so với tháng trước", "2.612 nhóm đã tìm được bạn ở cùng"]
                ],
                [2.0, 1.4, 1.8, 2.3]
            ),
            ("text", "3. Phía dưới hiển thị bảng xếp hạng top 5 khu vực có nhu cầu ghép phòng cao nhất (Cầu Giấy, Hai Bà Trưng, Đống Đa, Thanh Xuân, Bắc Từ Liêm)."),
            ("text", "4. Quản trị viên bấm nút 'Xuất báo cáo PDF' để tải bản tổng hợp số liệu phục vụ báo cáo ban lãnh đạo.")
        ],
        "ngoai_le": [
            "2. Hệ thống bảo trì đồng bộ số liệu, hiển thị cảnh báo: 'Dữ liệu phân tích đang được tổng hợp, cập nhật lần cuối lúc 00:00'."
        ]
    }
]

print(f"Loaded {len(USECASES_ADMIN_SPLIT)} separated use cases for Admin.")

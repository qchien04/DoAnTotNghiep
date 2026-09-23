# -*- coding: utf-8 -*-
"""
Danh sách các Use Case độc lập cho Role: NGƯỜI THUÊ (Tenant)
Tách rời từng nghiệp vụ CRUD: Đăng bài, Sửa bài, Đóng/Xóa bài, Xin vào nhóm, Hủy đơn,
Duyệt thành viên, Từ chối, Chốt nhóm, Xác nhận liên kết, Xem hóa đơn, Thanh toán, Báo hỏng...
Mỗi chức năng là 1 Use Case độc lập, sẽ được gán Heading 2 trong file Word.
"""

USECASES_TENANT_SPLIT = [
    # =========================================================================
    # TÌM KIẾM
    # =========================================================================
    {
        "stt": 30,
        "chuc_nang": "Chức năng tìm kiếm phòng trọ và bài đăng ở ghép",
        "use_case": "Search Room & Roommate Posts (Tìm phòng và tìm nhóm ghép theo vị trí, ngân sách, lối sống)",
        "actor": "Người thuê, Khách vãng lai",
        "tien_dieu_kien": "Người dùng truy cập vào trang chủ hoặc trang tìm kiếm của hệ thống.",
        "hau_dieu_kien": "Danh sách các phòng trọ hoặc bài đăng tìm bạn ở ghép phù hợp được hiển thị trực quan.",
        "kich_ban_chinh": [
            ("text", "1. Người dùng bấm chọn mục 'Tìm kiếm phòng & Ở ghép' trên thanh điều hướng."),
            ("text", "2. Hệ thống hiển thị thanh tìm kiếm địa điểm, bộ lọc giá, bộ lọc tiêu chí lối sống và bản đồ số."),
            ("text", "3. Người dùng chọn tab 'Tìm người ở ghép', nhập khu vực 'Cầu Giấy', giá từ 1.500.000 - 2.500.000 VNĐ, chọn tiêu chí: Nam, Không hút thuốc, Ngủ trước 24h."),
            ("text", "4. Người dùng bấm nút 'Áp dụng bộ lọc và Tìm kiếm'."),
            ("text", "5. Hệ thống hiển thị danh sách bài đăng phù hợp kèm độ khớp lối sống:"),
            ("table",
                ["Mã bài", "Tiêu đề bài đăng", "Khu vực", "Giá share (VNĐ)", "Độ khớp lối sống", "Loại phòng", "Thao tác"],
                [
                    ["BG01", "Tìm 1 bạn nam ở ghép phòng khép kín đủ đồ", "Ngõ 80 Cầu Giấy, HN", "1.900.000", "95% (Rất hợp)", "Có sẵn phòng", "Xem chi tiết"],
                    ["BG02", "Tìm bạn sinh viên cùng thuê nhà nguyên căn", "Ngõ 165 Cầu Giấy, HN", "2.200.000", "88% (Khá hợp)", "Chưa có phòng", "Xem chi tiết"]
                ],
                [0.8, 2.3, 1.4, 1.1, 1.2, 1.0, 1.0]
            ),
            ("text", "6. Người dùng bấm vào dòng bài đăng BG01 để xem chi tiết.")
        ],
        "ngoai_le": [
            "4. Khoảng giá nhập vào không hợp lệ (Giá min > Giá max), hệ thống cảnh báo: 'Khoảng giá không hợp lệ'.",
            "5. Không tìm thấy bài nào khớp 100%, hệ thống hiển thị danh sách gợi ý theo khoảng cách địa lý gần nhất."
        ]
    },

    # =========================================================================
    # QUẢN LÝ BÀI ĐĂNG TÌM NGƯỜI Ở GHÉP
    # =========================================================================
    {
        "stt": 31,
        "chuc_nang": "Chức năng xem danh sách bài đăng ở ghép của bản thân",
        "use_case": "View My Roommate Posts (Xem các bài đăng ghép phòng đã tạo)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Người thuê đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Danh sách các bài đăng ở ghép của người dùng cùng trạng thái và số lượng ứng viên được hiển thị.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê chọn mục 'Bài đăng của tôi' từ menu cá nhân."),
            ("text", "2. Hệ thống hiển thị danh sách các bài đăng đã tạo gồm:"),
            ("table",
                ["Mã bài", "Tiêu đề", "Ngày đăng", "Giá share (VNĐ)", "Tiến độ nhóm", "Ứng viên chờ duyệt", "Trạng thái", "Thao tác"],
                [
                    ["BG01", "Tìm 1 bạn nam ở ghép phòng P102 Ánh Dương", "01/10/2026", "1.900.000", "1/2 người", "2 đơn chờ", "Đang mở", "Quản lý nhóm | Sửa | Đóng tin"],
                    ["BG00", "Tìm bạn ở ghép khu Bách Khoa", "15/06/2026", "1.800.000", "2/2 người", "0 đơn", "Đã hoàn thành", "Xem chi tiết"]
                ],
                [0.8, 2.0, 0.9, 1.1, 1.0, 1.2, 1.0, 1.6]
            )
        ],
        "ngoai_le": [
            "2. Người thuê chưa đăng bài nào, hệ thống hiển thị: 'Bạn chưa tạo bài đăng ở ghép nào. Bấm Đăng bài mới để bắt đầu'."
        ]
    },
    {
        "stt": 32,
        "chuc_nang": "Chức năng đăng bài tìm người ở ghép - Trường hợp đã có phòng trọ",
        "use_case": "Create Roommate Post - Existing Room (Đăng tin tìm bạn khi đã thuê được phòng)",
        "actor": "Người thuê (Đã có phòng)",
        "tien_dieu_kien": "Người thuê đã đăng nhập, đang ở một phòng trọ thực tế (có liên kết trên hệ thống hoặc tạo phòng ảo).",
        "hau_dieu_kien": "Bài đăng tìm người ở ghép được xuất bản công khai kèm thông tin phòng và khảo sát lối sống.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê bấm nút 'Đăng bài tìm người ở ghép' tại góc trên màn hình."),
            ("text", "2. Người thuê chọn phương án 'Tôi đã có phòng trọ, cần tìm người vào ở cùng'."),
            ("text", "3. Người thuê chọn nguồn phòng: 'Chọn phòng tôi đang liên kết trên hệ thống' (Phòng P102 - Ánh Dương)."),
            ("text", "4. Hệ thống tự động nạp thông tin phòng (Địa chỉ, diện tích, giá phòng 3.800.000đ, tiện nghi có sẵn)."),
            ("text", "5. Người thuê nhập tiêu đề, số người cần tìm (1 người), giá share (1.900.000 VNĐ/tháng)."),
            ("text", "6. Người thuê hoàn thành bảng khảo sát lối sống sinh hoạt (Giới tính: Nam; Giờ ngủ: Sau 23h; Không hút thuốc; Không nuôi thú cưng; Thường xuyên nấu ăn tối)."),
            ("text", "7. Người thuê bấm 'Xuất bản bài đăng'."),
            ("text", "8. Hệ thống cấp mã bài BG01, chuyển trạng thái 'Đang mở (Cần tìm 1 người)' và hiển thị trên bảng tin công khai.")
        ],
        "ngoai_le": [
            "3. Người thuê ở trọ ngoài hệ thống chọn 'Tạo phòng ảo': Hệ thống hiển thị form nhập địa chỉ thực tế và yêu cầu tải ít nhất 3 ảnh phòng trọ.",
            "6. Chưa hoàn thành bảng khảo sát lối sống, hệ thống báo lỗi: 'Vui lòng hoàn thành bảng tiêu chí lối sống'."
        ]
    },
    {
        "stt": 33,
        "chuc_nang": "Chức năng đăng bài tìm người ở ghép - Trường hợp chưa có phòng trọ",
        "use_case": "Create Roommate Post - Virtual Room / Map Radius (Đăng tin tìm bạn cùng đi tìm phòng)",
        "actor": "Người thuê (Chưa có phòng)",
        "tien_dieu_kien": "Người thuê đã đăng nhập, chưa có phòng trọ cố định.",
        "hau_dieu_kien": "Bài đăng được tạo lập gắn với tọa độ vị trí mong muốn và bán kính tìm kiếm trên bản đồ số.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê chọn 'Đăng bài tìm người ở ghép' -> chọn 'Tôi chưa có phòng, cần tìm bạn cùng tìm phòng'."),
            ("text", "2. Trên bản đồ số, người thuê nhập vị trí tâm: 'Đại học Bách Khoa Hà Nội' và kéo thanh trượt bán kính: 3.0 km."),
            ("text", "3. Người thuê nhập ngân sách tối đa: 2.000.000 VNĐ/tháng, số người cần tìm lập nhóm: 2 người."),
            ("text", "4. Người thuê hoàn thành bảng thông tin lối sống cá nhân và yêu cầu với bạn cùng phòng."),
            ("text", "5. Người thuê nhập tiêu đề bài viết và bấm 'Đăng bài tìm nhóm'."),
            ("text", "6. Hệ thống lưu bài đăng mã BG02 (Loại tin: Chưa có phòng - Vị trí bản đồ ĐHBK bán kính 3km) và hiển thị trên bản đồ.")
        ],
        "ngoai_le": [
            "2. Không định vị được địa chỉ trên bản đồ, hệ thống yêu cầu ghim điểm thủ công trên bản đồ."
        ]
    },
    {
        "stt": 34,
        "chuc_nang": "Chức năng sửa bài đăng ở ghép",
        "use_case": "Update Roommate Post (Chỉnh sửa nội dung, giá share, hình ảnh bài đăng)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Bài đăng đang ở trạng thái 'Đang mở'.",
        "hau_dieu_kien": "Nội dung bài đăng được cập nhật mới trên hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Bài đăng của tôi, người thuê bấm nút 'Sửa' tại bài đăng BG01."),
            ("text", "2. Hệ thống hiển thị Form chỉnh sửa chứa dữ liệu hiện tại."),
            ("text", "3. Người thuê điều chỉnh lại giá share xuống còn 1.800.000 VNĐ/tháng và tải thêm ảnh chụp góc làm việc mới sắp xếp."),
            ("text", "4. Người thuê bấm 'Lưu cập nhật'."),
            ("text", "5. Hệ thống lưu thay đổi và thông báo 'Cập nhật bài đăng thành công!'." )
        ],
        "ngoai_le": [
            "4. Bài đăng đã chốt nhóm hoàn thành, hệ thống không cho phép sửa đổi."
        ]
    },
    {
        "stt": 35,
        "chuc_nang": "Chức năng đóng hoặc xóa bài đăng ở ghép",
        "use_case": "Delete / Close Roommate Post (Đóng nhận đơn hoặc gỡ bài đăng)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Người thuê đã tạo bài đăng.",
        "hau_dieu_kien": "Bài đăng được chuyển sang trạng thái 'Đã đóng' hoặc bị xóa khỏi hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Khi không còn nhu cầu tìm bạn ở ghép nữa, người thuê bấm nút 'Đóng bài đăng'."),
            ("text", "2. Hệ thống hiển thị hộp thoại xác nhận: 'Bạn có chắc chắn muốn đóng nhận đơn cho bài viết này?'."),
            ("text", "3. Người thuê bấm 'Xác nhận đóng'."),
            ("text", "4. Hệ thống chuyển trạng thái bài sang 'Đã đóng' và ẩn bài viết khỏi thanh tìm kiếm công khai.")
        ],
        "ngoai_le": [
            "2. Người thuê bấm 'Hủy', bài viết tiếp tục giữ trạng thái mở."
        ]
    },

    # =========================================================================
    # GHÉP NHÓM & DUYỆT THÀNH VIÊN
    # =========================================================================
    {
        "stt": 36,
        "chuc_nang": "Chức năng xin gia nhập nhóm ở ghép",
        "use_case": "Apply to Roommate Group (Nộp hồ sơ ứng tuyển và khảo sát lối sống)",
        "actor": "Người thuê (Ứng viên)",
        "tien_dieu_kien": "Người thuê đã đăng nhập tài khoản; bài đăng ở ghép đang ở trạng thái 'Đang mở'.",
        "hau_dieu_kien": "Đơn ứng tuyển kèm kết quả khảo sát lối sống được chuyển đến danh sách chờ duyệt của chủ bài đăng.",
        "kich_ban_chinh": [
            ("text", "1. Ứng viên đang xem bài đăng BG01 ('Tìm 1 bạn nam ở ghép phòng P102 Ánh Dương...')."),
            ("text", "2. Ứng viên bấm nút 'Tham gia nhóm ở ghép'."),
            ("text", "3. Hệ thống hiển thị Form hồ sơ ứng tuyển gồm: Giới thiệu bản thân, lời nhắn gửi và Bảng trả lời khảo sát lối sống sinh hoạt."),
            ("text", "4. Ứng viên nhập lời nhắn: 'Mình là sinh viên năm 3 ĐH Giao thông Vận tải, gọn gàng, ít ở phòng ban ngày' và hoàn thành các câu hỏi khảo sát lối sống."),
            ("text", "5. Ứng viên bấm 'Xác nhận gửi hồ sơ tham gia'."),
            ("text", "6. Hệ thống lưu đơn YCGN-105 trạng thái 'Chờ duyệt', tính độ tương thích lối sống (94%), và gửi thông báo tới chủ bài đăng."),
            ("text", "7. Nút bấm trên giao diện chuyển thành 'Đã gửi yêu cầu (Đang chờ duyệt)'.")
        ],
        "ngoai_le": [
            "2. Ứng viên chính là chủ bài đăng, hệ thống ẩn nút tham gia.",
            "5. Bỏ trống câu hỏi khảo sát bắt buộc, hệ thống yêu cầu hoàn thành đầy đủ."
        ]
    },
    {
        "stt": 37,
        "chuc_nang": "Chức năng xem danh sách đơn ứng tuyển nhóm",
        "use_case": "View Group Applicants (Xem danh sách ứng viên xin gia nhập nhóm)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Chủ bài đăng nhận được đơn ứng tuyển từ người dùng khác.",
        "hau_dieu_kien": "Danh sách các ứng viên đang chờ duyệt kèm điểm tương thích lối sống được hiển thị.",
        "kich_ban_chinh": [
            ("text", "1. Chủ bài đăng bấm vào thông báo hoặc chọn 'Quản lý nhóm ghép' của bài đăng BG01."),
            ("text", "2. Hệ thống hiển thị bảng danh sách các ứng viên đang nộp đơn:"),
            ("table",
                ["Mã Đơn", "Họ tên ứng viên", "Năm sinh / Quê quán", "Công việc / Trường học", "Điểm tương thích", "Ngày nộp", "Thao tác"],
                [
                    ["YCGN-105", "Nguyễn Văn Hùng", "2004 - Hải Dương", "SV ĐH Giao Thông Vận Tải", "94% (Rất hợp)", "02/10/2026", "Xem so sánh & Duyệt"],
                    ["YCGN-102", "Trần Đình Trọng", "2001 - Nghệ An", "Nhân viên văn phòng IT", "72% (Có khác biệt)", "01/10/2026", "Xem so sánh & Duyệt"]
                ],
                [0.9, 1.4, 1.3, 1.5, 1.2, 0.9, 1.4]
            )
        ],
        "ngoai_le": [
            "2. Chưa có ai ứng tuyển, hệ thống hiển thị: 'Chưa có ứng viên nào xin gia nhập nhóm'."
        ]
    },
    {
        "stt": 38,
        "chuc_nang": "Chức năng phê duyệt thành viên vào nhóm và cập nhật lối sống chung",
        "use_case": "Approve Roommate & Update Lifestyle (Duyệt ứng viên và tổng hòa lối sống nhóm)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Có đơn ứng tuyển đang ở trạng thái 'Chờ duyệt'.",
        "hau_dieu_kien": "Ứng viên được chấp thuận vào nhóm; thông tin lối sống sinh hoạt của bài đăng được cập nhật theo cả hai người.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách ứng viên, chủ bài đăng bấm 'Xem so sánh & Duyệt' tại đơn của Nguyễn Văn Hùng (YCGN-105)."),
            ("text", "2. Hệ thống hiển thị bảng đối chiếu trực quan từng tiêu chí sinh hoạt giữa Chủ phòng và Ứng viên (Giờ ngủ, hút thuốc, thú cưng, nấu ăn)."),
            ("text", "3. Thấy độ hòa hợp cao, chủ bài đăng bấm nút 'Đồng ý cho vào nhóm'."),
            ("text", "4. Hệ thống cập nhật đơn YCGN-105 thành 'Đã chấp thuận', thêm Nguyễn Văn Hùng vào nhóm (Tiến độ: 2/2 người)."),
            ("text", "5. Hệ thống tự động cập nhật lại bảng thông tin lối sống sinh hoạt của bài đăng theo sự tổng hòa của cả 2 người (Đức & Hùng)."),
            ("text", "6. Hệ thống gửi thông báo chúc mừng tới ứng viên và cung cấp số điện thoại/Zalo để hai bên liên hệ dọn phòng.")
        ],
        "ngoai_le": [
            "3. Nhóm đã đủ người trước đó, hệ thống cảnh báo: 'Nhóm đã đủ số lượng thành viên tối đa'."
        ]
    },
    {
        "stt": 39,
        "chuc_nang": "Chức năng từ chối ứng viên xin vào nhóm",
        "use_case": "Reject Applicant (Từ chối đơn xin gia nhập nhóm)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Có đơn ứng tuyển chưa phù hợp tiêu chí.",
        "hau_dieu_kien": "Đơn ứng tuyển chuyển sang trạng thái 'Từ chối', thông báo gửi tới ứng viên.",
        "kich_ban_chinh": [
            ("text", "1. Khi xem xét đơn của ứng viên Trần Đình Trọng (thức khuya 2-3h sáng không phù hợp), chủ bài đăng bấm 'Từ chối ứng viên'."),
            ("text", "2. Hệ thống hiển thị ô nhập lý do từ chối (tùy chọn)."),
            ("text", "3. Chủ bài đăng bấm 'Xác nhận từ chối'."),
            ("text", "4. Hệ thống cập nhật trạng thái đơn thành 'Từ chối' và gửi thông báo lịch sự tới ứng viên.")
        ],
        "ngoai_le": [
            "3. Chủ bài đăng bấm 'Hủy', giữ nguyên trạng thái chờ duyệt của đơn."
        ]
    },
    {
        "stt": 40,
        "chuc_nang": "Chức năng hoàn thành chốt nhóm ở ghép",
        "use_case": "Complete Roommate Group (Chốt nhóm và đóng bài đăng tìm người)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Nhóm đã đủ số lượng thành viên mong muốn hoặc chủ phòng không muốn nhận thêm người.",
        "hau_dieu_kien": "Bài đăng chuyển sang trạng thái 'Đã hoàn thành', tự động từ chối các đơn còn chờ.",
        "kich_ban_chinh": [
            ("text", "1. Sau khi đã duyệt đủ thành viên (2/2 người), chủ bài đăng bấm nút 'Hoàn thành nhóm'."),
            ("text", "2. Hệ thống hiển thị xác nhận: 'Bạn có chắc chắn muốn chốt nhóm và đóng nhận thêm thành viên mới?'."),
            ("text", "3. Chủ bài đăng bấm 'Xác nhận hoàn thành'."),
            ("text", "4. Hệ thống chuyển trạng thái bài đăng sang 'Đã hoàn thành (Ghép phòng thành công)' và gửi thông báo cảm ơn tới các ứng viên còn lại.")
        ],
        "ngoai_le": [
            "2. Nhóm chưa có đủ người nhưng chủ phòng muốn dừng tìm kiếm, hệ thống vẫn cho phép chốt đóng nhóm."
        ]
    },

    # =========================================================================
    # QUẢN LÝ PHÒNG TRỌ & HỢP ĐỒNG CÁ NHÂN
    # =========================================================================
    {
        "stt": 41,
        "chuc_nang": "Chức năng tiếp nhận và xác nhận liên kết phòng trọ từ chủ trọ",
        "use_case": "Accept Room Link Invitation (Xác nhận kết nối phòng trọ với chủ nhà)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Chủ nhà trọ đã gửi lời mời liên kết tài khoản của người thuê với phòng trọ thực tế.",
        "hau_dieu_kien": "Tài khoản người thuê được liên kết chính thức với phòng trọ để nhận hóa đơn và thông báo.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê đăng nhập vào ứng dụng, chuông thông báo hiển thị có lời mời mới từ chủ trọ."),
            ("text", "2. Người thuê bấm vào thông báo 'Lời mời liên kết phòng P102 - Tòa nhà Ánh Dương từ chủ nhà Nguyễn Văn Thành'."),
            ("text", "3. Hệ thống hiển thị chi tiết thông tin phòng, giá thuê (3.800.000đ/tháng), địa chỉ và vai trò (Đại diện thuê)."),
            ("text", "4. Người thuê đối soát thông tin thấy chính xác và bấm nút 'Chấp nhận liên kết phòng'."),
            ("text", "5. Hệ thống cập nhật trạng thái liên kết thành 'Đã liên kết', gửi thông báo tới chủ trọ, và kích hoạt menu 'Phòng trọ của tôi' cho người thuê.")
        ],
        "ngoai_le": [
            "4. Thông tin phòng không đúng với nơi mình ở, người thuê bấm nút 'Từ chối liên kết' và nhập lý do."
        ]
    },
    {
        "stt": 42,
        "chuc_nang": "Chức năng xem hợp đồng và thông tin phòng trọ đang ở",
        "use_case": "View My Contract & Room (Xem chi tiết hợp đồng và điều khoản phòng đang thuê)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Người thuê đang có liên kết phòng trọ hợp lệ.",
        "hau_dieu_kien": "Thông tin chi tiết hợp đồng, thời hạn thuê, tiền cọc và bảng dịch vụ được hiển thị minh bạch.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê vào mục 'Phòng trọ của tôi' -> 'Hợp đồng thuê phòng'."),
            ("text", "2. Hệ thống hiển thị thông tin hợp đồng: Mã HĐ-2026-P102, Thời hạn (01/10/2026 - 30/09/2027), Tiền cọc (3.800.000 VNĐ), Tiền thuê thỏa thuận, Chỉ số công tơ ban đầu, Danh sách các dịch vụ sử dụng kèm nút 'Tải file hợp đồng PDF'.")
        ],
        "ngoai_le": [
            "2. Chưa liên kết phòng nào, hệ thống hiển thị: 'Bạn chưa liên kết với phòng trọ nào'."
        ]
    },
    {
        "stt": 43,
        "chuc_nang": "Chức năng xem lịch sử hóa đơn tiền phòng",
        "use_case": "View Bill History (Xem danh sách và chi tiết hóa đơn điện nước từng tháng)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Phòng trọ đã được chủ trọ lập hóa đơn các tháng.",
        "hau_dieu_kien": "Lịch sử hóa đơn, số điện nước tiêu thụ và trạng thái thanh toán được hiển thị rõ ràng.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê chọn mục 'Lịch sử hóa đơn'."),
            ("text", "2. Hệ thống hiển thị bảng danh sách hóa đơn:"),
            ("table",
                ["Mã hóa đơn", "Kỳ cước", "Số điện (kWh)", "Số nước (m3)", "Tổng tiền (VNĐ)", "Hạn nộp", "Trạng thái", "Thao tác"],
                [
                    ["HD-202610-P102", "Tháng 10/2026", "115 kWh", "9 m3", "4.707.000", "05/11/2026", "Chờ thanh toán", "Thanh toán ngay"],
                    ["HD-202609-P102", "Tháng 09/2026", "120 kWh", "10 m3", "4.756.000", "05/10/2026", "Đã thanh toán", "Xem biên lai"]
                ],
                [1.3, 1.0, 1.1, 1.0, 1.2, 1.0, 1.1, 1.2]
            )
        ],
        "ngoai_le": [
            "2. Chưa có hóa đơn phát sinh, bảng hiển thị: 'Chưa có hóa đơn nào'."
        ]
    },
    {
        "stt": 44,
        "chuc_nang": "Chức năng thanh toán hóa đơn bằng quét mã QR",
        "use_case": "Pay Bill via QR (Thanh toán tiền phòng bằng chuyển khoản VietQR tự động)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Có hóa đơn ở trạng thái 'Chờ thanh toán'.",
        "hau_dieu_kien": "Mã QR thanh toán chính xác số tiền và nội dung được hiển thị để người thuê chuyển khoản ngân hàng.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách hóa đơn, người thuê bấm nút 'Thanh toán ngay' tại hóa đơn HD-202610-P102."),
            ("text", "2. Hệ thống hiển thị trang thanh toán chi tiết từng mục: Tiền phòng (3.800.000đ), Điện (437.000đ), Nước (270.000đ), Wifi (100.000đ), Rác (100.000đ)."),
            ("text", "3. Hệ thống hiển thị mã VietQR động tích hợp tài khoản ngân hàng của chủ trọ với số tiền đúng 4.707.000 VNĐ và nội dung chuyển khoản: 'HD202610 P102'."),
            ("text", "4. Người thuê dùng app ngân hàng quét mã QR chuyển tiền."),
            ("text", "5. Người thuê bấm nút 'Tôi đã chuyển khoản thành công'."),
            ("text", "6. Hệ thống gửi thông báo nhắc chủ nhà xác nhận tiền vào tài khoản và cập nhật trạng thái đơn.")
        ],
        "ngoai_le": [
            "2. Phát hiện sai lệch số điện nước, người thuê bấm nút 'Khiếu nại hóa đơn' để phản ánh tới chủ nhà."
        ]
    },

    # =========================================================================
    # KHIẾU NẠI SỰ CỐ
    # =========================================================================
    {
        "stt": 45,
        "chuc_nang": "Chức năng gửi khiếu nại báo hỏng thiết bị phòng trọ",
        "use_case": "Submit Incident Report & Complaint (Tạo đơn báo hỏng hóc, sự cố thiết bị)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Người thuê đã liên kết với phòng trọ; thiết bị trong phòng gặp sự cố.",
        "hau_dieu_kien": "Yêu cầu báo hỏng đính kèm hình ảnh được gửi ngay tới chủ nhà trọ.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê vào mục 'Báo hỏng & Khiếu nại' -> bấm nút 'Tạo khiếu nại mới'."),
            ("text", "2. Hệ thống hiển thị Form tạo khiếu nại gồm: Phân loại sự cố (Hỏng điện lạnh, Điện nước, Cửa khóa, An ninh), Tiêu đề (*), Mức độ khẩn cấp, Mô tả (*), Khu vực tải ảnh."),
            ("text", "3. Người thuê chọn: 'Hỏng điện lạnh', nhập Tiêu đề: 'Điều hòa chảy nước và không mát', Mức độ: Khẩn cấp, Mô tả: 'Điều hòa bật 16 độ chỉ có gió, nước chảy xuống sàn', đính kèm 2 ảnh chụp hiện trạng."),
            ("text", "4. Người thuê bấm nút 'Gửi khiếu nại'."),
            ("text", "5. Hệ thống cấp mã KN101, lưu trạng thái 'Mới gửi' và bắn thông báo tức thời tới chủ trọ.")
        ],
        "ngoai_le": [
            "3. Để trống tiêu đề hoặc nội dung mô tả, hệ thống báo lỗi: 'Vui lòng nhập đầy đủ thông tin'."
        ]
    },
    {
        "stt": 46,
        "chuc_nang": "Chức năng theo dõi tiến độ giải quyết khiếu nại",
        "use_case": "Track Complaint Status (Theo dõi phản hồi và tiến độ sửa chữa từ chủ nhà)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Người thuê đã gửi khiếu nại.",
        "hau_dieu_kien": "Tiến độ xử lý của chủ nhà được cập nhật trực quan tới người thuê.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê nhận được thông báo phản hồi từ chủ nhà, bấm vào xem chi tiết khiếu nại KN101."),
            ("text", "2. Hệ thống hiển thị tiến độ: Trạng thái chuyển sang 'Đang xử lý', kèm phản hồi của chủ trọ: 'Chủ nhà đã hẹn thợ 14h00 chiều nay đến kiểm tra'."),
            ("text", "3. Sau khi sửa chữa xong, trạng thái chuyển sang 'Đã giải quyết', hệ thống hiển thị form cho phép người thuê chấm điểm độ hài lòng (1 - 5 sao).")
        ],
        "ngoai_le": [
            "2. Khiếu nại bị từ chối, hệ thống hiển thị lý do từ chối cụ thể do chủ nhà cung cấp."
        ]
    }
]

print(f"Loaded {len(USECASES_TENANT_SPLIT)} separated use cases for Tenant.")

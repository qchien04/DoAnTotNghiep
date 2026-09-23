# -*- coding: utf-8 -*-
"""
Danh sách các Use Case độc lập cho Role: CHỦ TRỌ (Landlord)
Tách rời từng nghiệp vụ CRUD: Thêm, Sửa, Xóa, Xem danh sách.
Mỗi chức năng là 1 Use Case độc lập, sẽ được gán Heading 2 trong file Word.
"""

USECASES_LANDLORD_SPLIT = [
    # =========================================================================
    # QUẢN LÝ TÒA NHÀ
    # =========================================================================
    {
        "stt": 1,
        "chuc_nang": "Chức năng xem danh sách tòa nhà",
        "use_case": "View Building List (Xem danh sách các tòa nhà / khu trọ)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập thành công vào hệ thống.",
        "hau_dieu_kien": "Danh sách các tòa nhà thuộc quyền quản lý của chủ trọ được hiển thị đầy đủ kèm số liệu thống kê phòng.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ đăng nhập vào hệ thống, từ thanh menu điều hướng chọn mục 'Quản lý tòa nhà'."),
            ("text", "2. Hệ thống tải dữ liệu các tòa nhà của chủ trọ và hiển thị trang danh sách gồm: Thanh tìm kiếm theo tên tòa nhà/địa chỉ, bộ lọc số tầng, nút 'Thêm mới tòa nhà', và bảng dữ liệu tổng quan:"),
            ("table", 
                ["Mã tòa", "Tên tòa nhà", "Địa chỉ chi tiết", "Số tầng", "Tổng số phòng", "Phòng đang ở", "Phòng trống", "Tùy chọn"],
                [
                    ["TN01", "Tòa nhà Ánh Dương", "Số 12 Ngõ 80 Cầu Giấy, Hà Nội", "5", "20", "16", "4", "Xem chi tiết | Sửa | Xóa"],
                    ["TN02", "Tòa nhà Bách Khoa Plaza", "Số 45 Tạ Quang Bửu, Hai Bà Trưng, HN", "6", "24", "23", "1", "Xem chi tiết | Sửa | Xóa"],
                    ["TN03", "Khu nhà trọ Hòa Phát", "Số 88 Triều Khúc, Thanh Xuân, Hà Nội", "4", "16", "16", "0", "Xem chi tiết | Sửa | Xóa"]
                ],
                [0.7, 1.4, 2.0, 0.6, 0.9, 0.9, 0.8, 1.3]
            ),
            ("text", "3. Chủ trọ có thể nhập từ khóa vào ô tìm kiếm để lọc nhanh tòa nhà mong muốn."),
            ("text", "4. Hệ thống tự động lọc và hiển thị các bản ghi tương ứng trong bảng theo thời gian thực.")
        ],
        "ngoai_le": [
            "2. Chủ trọ mới đăng ký tài khoản chưa có tòa nhà nào, hệ thống hiển thị bảng trống kèm thông báo: 'Bạn chưa có tòa nhà nào. Vui lòng bấm Thêm mới tòa nhà để bắt đầu'.",
            "3. Không tìm thấy tòa nhà nào khớp với từ khóa tìm kiếm, hệ thống hiển thị: 'Không tìm thấy tòa nhà phù hợp'."
        ]
    },
    {
        "stt": 2,
        "chuc_nang": "Chức năng thêm mới tòa nhà",
        "use_case": "Add Building (Thêm tòa nhà / khu trọ mới)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Tòa nhà mới được tạo lập và lưu trữ thành công vào cơ sở dữ liệu.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Quản lý tòa nhà, chủ trọ bấm vào nút 'Thêm mới tòa nhà'."),
            ("text", "2. Hệ thống hiển thị Form pop-up 'Thêm tòa nhà mới' gồm: Mã tòa (tự sinh TN04), Tên tòa nhà (*), Tỉnh/Thành phố (*), Quận/Huyện (*), Phường/Xã (*), Địa chỉ chi tiết (*), Số tầng (*), Quy định chung, Tiện ích chung tòa nhà, nút 'Hủy' và nút 'Lưu tòa nhà'."),
            ("text", "3. Chủ trọ nhập thông tin: Tên tòa nhà: 'Nhà trọ Cầu Giấy Xanh', Tỉnh/TP: Hà Nội, Quận: Cầu Giấy, Địa chỉ: 'Số 15 Ngõ 165 Cầu Giấy', Số tầng: 5, Tiện ích: 'Thang máy, khóa vân tay, camera 24/7'."),
            ("text", "4. Chủ trọ kiểm tra lại thông tin và bấm nút 'Lưu tòa nhà'."),
            ("text", "5. Hệ thống kiểm tra dữ liệu hợp lệ, lưu bản ghi mới vào cơ sở dữ liệu, hiển thị thông báo 'Thêm mới tòa nhà thành công!' và tự động cập nhật danh sách tòa nhà."),
            ("table",
                ["Mã tòa", "Tên tòa nhà", "Địa chỉ chi tiết", "Số tầng", "Tổng số phòng", "Phòng trống", "Tùy chọn"],
                [
                    ["TN04", "Nhà trọ Cầu Giấy Xanh", "Số 15 Ngõ 165 Cầu Giấy, Hà Nội", "5", "0", "0", "Xem chi tiết | Sửa | Xóa"]
                ],
                [0.8, 1.8, 2.5, 0.7, 1.0, 0.9, 1.3]
            )
        ],
        "ngoai_le": [
            "2. Chủ trọ bấm nút 'Hủy', hệ thống đóng form và giữ nguyên giao diện danh sách.",
            "4. Chủ trọ để trống trường bắt buộc (Tên tòa nhà hoặc Địa chỉ), hệ thống viền đỏ ô nhập và cảnh báo: 'Vui lòng nhập đầy đủ các trường bắt buộc (*)'."
        ]
    },
    {
        "stt": 3,
        "chuc_nang": "Chức năng sửa thông tin tòa nhà",
        "use_case": "Update Building (Cập nhật thông tin tòa nhà)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, tòa nhà cần chỉnh sửa đã tồn tại trong hệ thống.",
        "hau_dieu_kien": "Thông tin cập nhật của tòa nhà được lưu thành công vào cơ sở dữ liệu.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh sách tòa nhà, chủ trọ tìm tòa nhà cần sửa (TN01 - Tòa nhà Ánh Dương) và bấm nút 'Sửa'."),
            ("text", "2. Hệ thống hiển thị Form 'Cập nhật thông tin tòa nhà' với đầy đủ dữ liệu hiện tại của tòa nhà TN01."),
            ("text", "3. Chủ trọ tiến hành chỉnh sửa các trường cần thay đổi: Bổ sung tiện ích chung 'Đã lắp thêm máy giặt sấy tầng 1 và hệ thống PCCC tự động'."),
            ("text", "4. Chủ trọ bấm nút 'Cập nhật'."),
            ("text", "5. Hệ thống ghi đè dữ liệu mới, hiển thị thông báo 'Cập nhật thông tin tòa nhà thành công!' và quay lại bảng danh sách tòa nhà.")
        ],
        "ngoai_le": [
            "3. Chủ trọ sửa tên tòa nhà bị trùng lặp với một tòa nhà khác của mình, hệ thống cảnh báo: 'Tên tòa nhà này đã tồn tại'.",
            "4. Chủ trọ bấm nút 'Hủy', hệ thống hủy bỏ các thay đổi vừa chỉnh sửa."
        ]
    },
    {
        "stt": 4,
        "chuc_nang": "Chức năng xóa tòa nhà",
        "use_case": "Delete Building (Xóa tòa nhà khỏi hệ thống)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, tòa nhà cần xóa đang tồn tại.",
        "hau_dieu_kien": "Tòa nhà được xóa hoặc ngừng hoạt động trên hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh sách tòa nhà, chủ trọ bấm nút 'Xóa' tại hàng của tòa nhà muốn xóa (ví dụ TN04 vừa tạo nhầm)."),
            ("text", "2. Hệ thống hiển thị hộp thoại xác nhận cảnh báo: 'Bạn có chắc chắn muốn xóa tòa nhà TN04 - Nhà trọ Cầu Giấy Xanh? Hành động này không thể hoàn tác!' kèm nút 'Hủy' và nút 'Xác nhận xóa'."),
            ("text", "3. Chủ trọ bấm nút 'Xác nhận xóa'."),
            ("text", "4. Hệ thống kiểm tra tòa nhà TN04 không có phòng nào đang có khách thuê, tiến hành xóa bản ghi khỏi hệ thống."),
            ("text", "5. Hệ thống hiển thị thông báo 'Xóa tòa nhà thành công!' và loại bỏ dòng TN04 khỏi bảng danh sách.")
        ],
        "ngoai_le": [
            "4. Tòa nhà đang chứa các phòng trọ có hợp đồng còn hiệu lực, hệ thống từ chối xóa và hiển thị cảnh báo: 'Không thể xóa tòa nhà đang có phòng và khách thuê! Vui lòng thanh lý hợp đồng và xóa phòng trước'."
        ]
    },

    # =========================================================================
    # QUẢN LÝ PHÒNG TRỌ
    # =========================================================================
    {
        "stt": 5,
        "chuc_nang": "Chức năng xem danh sách và trạng thái phòng trọ",
        "use_case": "View Room List (Xem danh sách và trạng thái phòng trọ)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, đã có ít nhất một tòa nhà.",
        "hau_dieu_kien": "Danh sách phòng cùng trạng thái (Còn trống, Đang thuê, Đang sửa chữa) được hiển thị đầy đủ.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ chọn mục 'Quản lý phòng trọ' trên menu điều hướng."),
            ("text", "2. Hệ thống hiển thị giao diện gồm bộ lọc Tòa nhà (Dropdown chọn tòa), bộ lọc Tầng, bộ lọc Trạng thái phòng (Tất cả, Còn trống, Đang thuê, Đang sửa chữa), nút 'Thêm phòng mới' và bảng danh sách phòng:"),
            ("table",
                ["Mã phòng", "Tên phòng", "Tầng", "Diện tích (m2)", "Giá thuê (VNĐ)", "Sức chứa", "Trạng thái", "Tùy chọn"],
                [
                    ["P101", "Phòng 101", "Tầng 1", "25", "3.500.000", "2 người", "Đang thuê", "Xem | Sửa | Xóa"],
                    ["P102", "Phòng 102", "Tầng 1", "28", "3.800.000", "3 người", "Còn trống", "Xem | Sửa | Xóa"],
                    ["P201", "Phòng 201", "Tầng 2", "30", "4.200.000", "3 người", "Còn trống", "Xem | Sửa | Xóa"],
                    ["P202", "Phòng 202", "Tầng 2", "25", "3.500.000", "2 người", "Đang sửa chữa", "Xem | Sửa | Xóa"]
                ],
                [0.8, 1.0, 0.7, 1.0, 1.2, 0.9, 1.1, 1.3]
            ),
            ("text", "3. Chủ trọ có thể chuyển đổi bộ lọc trạng thái để xem riêng các phòng 'Còn trống' phục vụ tư vấn cho khách thuê mới.")
        ],
        "ngoai_le": [
            "2. Tòa nhà được chọn chưa có phòng nào, hệ thống hiển thị: 'Tòa nhà này chưa có phòng trọ. Bấm Thêm phòng mới để tạo phòng'."
        ]
    },
    {
        "stt": 6,
        "chuc_nang": "Chức năng thêm phòng trọ mới",
        "use_case": "Add Room (Tạo mới phòng trọ)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, đã có tòa nhà trong hệ thống.",
        "hau_dieu_kien": "Phòng trọ mới được khởi tạo với trạng thái 'Còn trống'.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Quản lý phòng trọ, chủ trọ bấm chọn nút 'Thêm phòng mới'."),
            ("text", "2. Hệ thống hiển thị Form pop-up 'Thêm phòng trọ mới' gồm: Chọn tòa nhà (*), Mã phòng (*), Tên phòng (*), Tầng (*), Diện tích (m2) (*), Giá thuê niêm yết (VNĐ/tháng) (*), Tiền cọc tiêu chuẩn (VNĐ) (*), Sức chứa tối đa (người) (*), Tiện nghi (checkbox: Điều hòa, Nóng lạnh, Giường, Tủ, Tủ lạnh, Kệ bếp, Ban công), Mô tả chi tiết, Nút 'Hủy' và nút 'Xác nhận tạo phòng'."),
            ("text", "3. Chủ trọ nhập thông tin: Mã phòng: 'P301', Tên phòng: 'Phòng 301', Tầng: 3, Diện tích: 32, Giá thuê: 4.500.000, Tiền cọc: 4.500.000, Sức chứa: 3; Tích chọn Điều hòa, Nóng lạnh, Giường, Ban công."),
            ("text", "4. Chủ trọ bấm nút 'Xác nhận tạo phòng'."),
            ("text", "5. Hệ thống kiểm tra tính duy nhất của mã phòng trong tòa, lưu phòng mới với trạng thái mặc định 'Còn trống', và hiển thị thông báo 'Tạo phòng P301 thành công!'."),
            ("table",
                ["Mã phòng", "Tên phòng", "Tầng", "Diện tích (m2)", "Giá thuê (VNĐ)", "Sức chứa", "Trạng thái"],
                [
                    ["P301", "Phòng 301", "Tầng 3", "32", "4.500.000", "3 người", "Còn trống"]
                ],
                [1.0, 1.2, 0.8, 1.1, 1.4, 1.0, 1.2]
            )
        ],
        "ngoai_le": [
            "3. Mã phòng P301 đã tồn tại trong tòa nhà, hệ thống báo lỗi: 'Mã phòng P301 đã tồn tại trong tòa nhà này'.",
            "4. Giá thuê hoặc diện tích là số âm hoặc bằng 0, hệ thống cảnh báo: 'Giá phòng và diện tích phải là số nguyên dương lớn hơn 0'."
        ]
    },
    {
        "stt": 7,
        "chuc_nang": "Chức năng sửa thông tin phòng trọ",
        "use_case": "Update Room (Cập nhật thông tin phòng trọ)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, phòng trọ cần sửa đã tồn tại.",
        "hau_dieu_kien": "Thông tin phòng (giá thuê, tiện nghi, trạng thái) được cập nhật thành công.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh sách phòng, chủ trọ tìm phòng cần sửa (ví dụ P202) và bấm nút 'Sửa'."),
            ("text", "2. Hệ thống hiển thị Form 'Cập nhật phòng trọ' với các thông tin hiện tại của phòng P202."),
            ("text", "3. Chủ trọ sửa đổi thông tin: Đổi trạng thái từ 'Đang sửa chữa' sang 'Còn trống' do thợ đã sửa xong thiết bị; đồng thời điều chỉnh giá thuê niêm yết thành 3.600.000 VNĐ."),
            ("text", "4. Chủ trọ bấm nút 'Lưu thay đổi'."),
            ("text", "5. Hệ thống kiểm tra tính hợp lệ, lưu cập nhật và hiển thị thông báo 'Cập nhật phòng P202 thành công!' kèm trạng thái mới 'Còn trống'.")
        ],
        "ngoai_le": [
            "3. Phòng đang có khách ở nhưng chủ trọ cố tình đổi trạng thái thành 'Còn trống', hệ thống cảnh báo: 'Phòng hiện đang có hợp đồng hoạt động, không thể chuyển sang trạng thái Còn trống'."
        ]
    },
    {
        "stt": 8,
        "chuc_nang": "Chức năng xóa phòng trọ",
        "use_case": "Delete Room (Xóa phòng trọ khỏi tòa nhà)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, phòng cần xóa đã tồn tại.",
        "hau_dieu_kien": "Phòng trọ được gỡ bỏ khỏi hệ thống cơ sở dữ liệu.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh sách phòng, chủ trọ bấm nút 'Xóa' tại hàng phòng muốn xóa."),
            ("text", "2. Hệ thống hiển thị hộp thoại xác nhận: 'Bạn có chắc chắn muốn xóa Phòng 301? Tất cả dữ liệu liên quan sẽ bị xóa!'."),
            ("text", "3. Chủ trọ bấm nút 'Xác nhận xóa'."),
            ("text", "4. Hệ thống kiểm tra phòng chưa từng phát sinh hóa đơn hoặc hợp đồng, tiến hành xóa bản ghi."),
            ("text", "5. Hệ thống hiển thị thông báo 'Xóa phòng thành công!' và làm mới danh sách phòng.")
        ],
        "ngoai_le": [
            "4. Phòng đã từng có lịch sử hợp đồng hoặc hóa đơn cũ, hệ thống từ chối xóa vĩnh viễn và hiển thị: 'Phòng đã có lịch sử thuê và hóa đơn, không thể xóa để bảo toàn dữ liệu kế toán. Vui lòng chuyển trạng thái phòng sang Ngừng sử dụng'."
        ]
    },

    # =========================================================================
    # QUẢN LÝ DỊCH VỤ TIỆN ÍCH
    # =========================================================================
    {
        "stt": 9,
        "chuc_nang": "Chức năng xem danh mục dịch vụ tiện ích",
        "use_case": "View Service List (Xem bảng giá dịch vụ tiện ích)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Bảng danh mục dịch vụ, hình thức tính tiền và đơn giá được hiển thị minh bạch.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ chọn mục 'Cấu hình dịch vụ' từ thanh điều hướng."),
            ("text", "2. Hệ thống hiển thị giao diện gồm nút 'Thêm dịch vụ mới' và bảng danh mục các dịch vụ đang cung cấp:"),
            ("table",
                ["Mã DV", "Tên dịch vụ", "Loại dịch vụ", "Đơn vị tính", "Đơn giá (VNĐ)", "Hình thức thu", "Áp dụng", "Tùy chọn"],
                [
                    ["DV01", "Điện sinh hoạt", "Điện", "kWh (Số)", "3.800", "Theo công tơ thực tế", "Tất cả", "Sửa | Xóa"],
                    ["DV02", "Nước sinh hoạt", "Nước", "Khối (m3)", "30.000", "Theo đồng hồ nước", "Tất cả", "Sửa | Xóa"],
                    ["DV03", "Internet Wifi", "Mạng", "Phòng/Tháng", "100.000", "Cố định theo phòng", "Tất cả", "Sửa | Xóa"],
                    ["DV04", "Vệ sinh & Rác", "Vệ sinh", "Người/Tháng", "50.000", "Theo số người ở", "Tất cả", "Sửa | Xóa"]
                ],
                [0.7, 1.4, 0.9, 1.0, 1.0, 1.4, 0.8, 1.0]
            )
        ],
        "ngoai_le": [
            "2. Hệ thống lỗi nạp dữ liệu bảng giá dịch vụ, hiển thị: 'Không thể tải danh mục dịch vụ, vui lòng thử lại'."
        ]
    },
    {
        "stt": 10,
        "chuc_nang": "Chức năng thêm mới dịch vụ tiện ích",
        "use_case": "Add Utility Service (Thêm dịch vụ tiện ích mới)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Dịch vụ mới được khởi tạo và sẵn sàng để áp dụng vào hợp đồng/hóa đơn.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Cấu hình dịch vụ, chủ trọ bấm nút 'Thêm dịch vụ mới'."),
            ("text", "2. Hệ thống hiển thị Form thêm dịch vụ gồm: Tên dịch vụ (*), Phân loại (Điện, Nước, Mạng, Vệ sinh, Thang máy, Gửi xe, Khác), Đơn vị tính (*), Đơn giá (VNĐ) (*), Hình thức tính phí (Theo số công tơ / Cố định theo phòng / Cố định theo người), Phạm vi áp dụng, Nút 'Hủy' và 'Lưu dịch vụ'."),
            ("text", "3. Chủ trọ nhập: Tên: 'Phí gửi xe máy', Phân loại: Gửi xe, Đơn vị tính: 'Xe/Tháng', Đơn giá: 100.000, Hình thức: 'Cố định theo số lượng xe', Áp dụng: 'Tất cả tòa nhà'."),
            ("text", "4. Chủ trọ bấm nút 'Lưu dịch vụ'."),
            ("text", "5. Hệ thống kiểm tra dữ liệu, lưu dịch vụ DV05 vào hệ thống và hiển thị thông báo 'Lưu dịch vụ thành công!'."),
            ("table",
                ["Mã DV", "Tên dịch vụ", "Đơn vị tính", "Đơn giá (VNĐ)", "Hình thức thu"],
                [
                    ["DV05", "Phí gửi xe máy", "Xe/Tháng", "100.000", "Cố định theo số lượng xe"]
                ],
                [1.0, 1.8, 1.2, 1.2, 2.0]
            )
        ],
        "ngoai_le": [
            "3. Tên dịch vụ bị để trống hoặc đơn giá <= 0, hệ thống cảnh báo: 'Vui lòng nhập tên dịch vụ và đơn giá lớn hơn 0'.",
            "4. Tên dịch vụ bị trùng với dịch vụ đã có, hệ thống cảnh báo: 'Dịch vụ này đã tồn tại'."
        ]
    },
    {
        "stt": 11,
        "chuc_nang": "Chức năng sửa dịch vụ tiện ích",
        "use_case": "Update Utility Service (Cập nhật đơn giá và thông tin dịch vụ)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, dịch vụ cần sửa đã tồn tại.",
        "hau_dieu_kien": "Đơn giá và thông tin dịch vụ được cập nhật.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh mục dịch vụ, chủ trọ bấm nút 'Sửa' tại dòng dịch vụ DV01 (Điện sinh hoạt)."),
            ("text", "2. Hệ thống hiển thị Form sửa dịch vụ chứa thông tin hiện tại."),
            ("text", "3. Do giá điện nhà nước điều chỉnh, chủ trọ cập nhật Đơn giá từ 3.800 VNĐ lên 4.000 VNĐ/kWh."),
            ("text", "4. Chủ trọ bấm nút 'Cập nhật'."),
            ("text", "5. Hệ thống lưu đơn giá mới và hiển thị thông báo: 'Cập nhật đơn giá dịch vụ thành công! Đơn giá mới sẽ áp dụng từ kỳ tính tiền tiếp theo'.")
        ],
        "ngoai_le": [
            "3. Chủ trọ nhập giá mới là số âm, hệ thống báo lỗi: 'Đơn giá không hợp lệ'."
        ]
    },
    {
        "stt": 12,
        "chuc_nang": "Chức năng xóa dịch vụ tiện ích",
        "use_case": "Delete Utility Service (Xóa dịch vụ tiện ích)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, dịch vụ tồn tại trong danh mục.",
        "hau_dieu_kien": "Dịch vụ được loại bỏ khỏi danh mục tính cước.",
        "kich_ban_chinh": [
            ("text", "1. Tại bảng danh mục dịch vụ, chủ trọ bấm nút 'Xóa' tại hàng dịch vụ muốn xóa (ví dụ DV05 - Phí gửi xe máy)."),
            ("text", "2. Hệ thống kiểm tra xem dịch vụ này có đang được ràng buộc trong hợp đồng phòng nào không."),
            ("text", "3. Dịch vụ chưa có hợp đồng nào sử dụng, hệ thống hiển thị hộp thoại xác nhận xóa."),
            ("text", "4. Chủ trọ bấm 'Xác nhận xóa'."),
            ("text", "5. Hệ thống xóa dịch vụ và hiển thị thông báo 'Đã xóa dịch vụ thành công!'." )
        ],
        "ngoai_le": [
            "2. Dịch vụ đang được áp dụng trong 10 hợp đồng thuê đang có hiệu lực, hệ thống từ chối xóa và hiển thị: 'Dịch vụ đang được sử dụng trong các hợp đồng thuê phòng, không thể xóa! Vui lòng chuyển trạng thái sang Tạm ngừng'."
        ]
    },

    # =========================================================================
    # QUẢN LÝ KHÁCH THUÊ
    # =========================================================================
    {
        "stt": 13,
        "chuc_nang": "Chức năng xem danh sách khách thuê",
        "use_case": "View Tenant List (Xem danh sách khách đang thuê phòng)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Danh sách khách thuê tại tất cả các phòng được hiển thị trực quan.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ bấm vào mục 'Quản lý khách thuê' trên menu chính."),
            ("text", "2. Hệ thống hiển thị thanh tìm kiếm theo Họ tên/CCCD/SĐT, bộ lọc Tòa nhà/Phòng, nút 'Thêm khách thuê' và bảng dữ liệu khách thuê:"),
            ("table",
                ["Mã KT", "Họ và tên", "SĐT", "Số CCCD", "Phòng ở", "Vai trò phòng", "Tài khoản liên kết", "Trạng thái"],
                [
                    ["KT01", "Nguyễn Văn An", "0912345678", "001200001234", "P101 - Ánh Dương", "Đại diện thuê", "UID105 (Đã liên kết)", "Đang thuê"],
                    ["KT02", "Trần Thị Bích", "0987654321", "001200005678", "P101 - Ánh Dương", "Thành viên", "Chưa liên kết", "Đang thuê"],
                    ["KT03", "Phạm Minh Đức", "0977888999", "001201012345", "P102 - Ánh Dương", "Đại diện thuê", "UID208 (Chờ xác nhận)", "Đang thuê"]
                ],
                [0.7, 1.3, 1.1, 1.2, 1.3, 1.0, 1.3, 0.9]
            )
        ],
        "ngoai_le": [
            "2. Không tìm thấy khách thuê nào theo từ khóa tìm kiếm, hệ thống hiển thị: 'Không tìm thấy khách thuê phù hợp'."
        ]
    },
    {
        "stt": 14,
        "chuc_nang": "Chức năng thêm khách thuê vào phòng",
        "use_case": "Add Tenant (Thêm hồ sơ khách thuê mới vào phòng)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, đã có phòng trọ trong hệ thống.",
        "hau_dieu_kien": "Hồ sơ khách thuê mới được lưu trữ và gán vào đúng phòng trọ.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Quản lý khách thuê, chủ trọ bấm nút 'Thêm khách thuê'."),
            ("text", "2. Hệ thống hiển thị Form 'Thêm khách thuê' gồm: Chọn Tòa nhà, Chọn Phòng (P102), Họ tên khách (*), Số điện thoại (*), Số CCCD/CMND (*), Quê quán, Giới tính, Ngày sinh, Là đại diện hợp đồng (checkbox), nút 'Lưu khách thuê' và nút 'Lưu và Mời liên kết tài khoản'."),
            ("text", "3. Chủ trọ nhập: Họ tên: 'Lê Văn Cường', SĐT: '0905111222', CCCD: '001200009999', Quê quán: 'Hải Phòng', Chọn phòng: P102."),
            ("text", "4. Chủ trọ bấm nút 'Lưu khách thuê'."),
            ("text", "5. Hệ thống kiểm tra số CCCD không trùng lặp, lưu hồ sơ KT04 vào phòng P102 và thông báo 'Thêm khách thuê thành công!'."),
            ("table",
                ["Mã KT", "Họ và tên", "SĐT", "Số CCCD", "Phòng ở", "Trạng thái liên kết"],
                [
                    ["KT04", "Lê Văn Cường", "0905111222", "001200009999", "P102 - Ánh Dương", "Chưa liên kết"]
                ],
                [1.0, 1.5, 1.2, 1.5, 1.5, 1.3]
            )
        ],
        "ngoai_le": [
            "3. Số CCCD đã tồn tại trong danh sách khách đang thuê phòng khác, hệ thống cảnh báo: 'Số CCCD này đang được ghi nhận ở phòng P201'."
        ]
    },
    {
        "stt": 15,
        "chuc_nang": "Chức năng sửa thông tin khách thuê",
        "use_case": "Update Tenant (Cập nhật thông tin hồ sơ khách thuê)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, hồ sơ khách thuê đã tồn tại.",
        "hau_dieu_kien": "Thông tin cá nhân, CCCD hoặc số điện thoại của khách thuê được cập nhật.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách khách thuê, chủ trọ bấm nút 'Sửa' tại hàng của khách thuê KT04 (Lê Văn Cường)."),
            ("text", "2. Hệ thống hiển thị Form cập nhật thông tin cá nhân của khách thuê."),
            ("text", "3. Chủ trọ chỉnh sửa lại số điện thoại chính xác: '0905111333' và cập nhật ảnh chụp 2 mặt CCCD."),
            ("text", "4. Chủ trọ bấm nút 'Cập nhật'."),
            ("text", "5. Hệ thống lưu dữ liệu mới và thông báo 'Cập nhật thông tin khách thuê thành công!'." )
        ],
        "ngoai_le": [
            "3. Chủ trọ nhập số điện thoại không đúng định dạng (thiếu số hoặc chứa chữ), hệ thống báo lỗi: 'Số điện thoại không hợp lệ'."
        ]
    },
    {
        "stt": 16,
        "chuc_nang": "Chức năng xóa khách thuê khỏi phòng",
        "use_case": "Remove Tenant (Xóa hoặc chuyển khách thuê ra khỏi phòng)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, khách thuê đang có tên trong phòng.",
        "hau_dieu_kien": "Hồ sơ khách thuê được gỡ khỏi phòng hoặc chuyển sang trạng thái đã trả phòng.",
        "kich_ban_chinh": [
            ("text", "1. Khi có 1 thành viên chuyển đi, chủ trọ bấm nút 'Xóa' tại hàng của khách thuê đó trong phòng."),
            ("text", "2. Hệ thống hiển thị hộp thoại xác nhận: 'Bạn có chắc chắn muốn xóa khách thuê này khỏi phòng P102?'."),
            ("text", "3. Chủ trọ bấm 'Xác nhận xóa'."),
            ("text", "4. Hệ thống kiểm tra khách thuê này không phải là người đứng tên đại diện hợp đồng chính."),
            ("text", "5. Hệ thống gỡ khách thuê khỏi phòng, cập nhật số lượng người ở hiện tại của phòng và thông báo thành công.")
        ],
        "ngoai_le": [
            "4. Khách thuê đang là người đứng tên đại diện hợp đồng chính của phòng, hệ thống cảnh báo: 'Khách thuê là người đại diện hợp đồng, không thể xóa trực tiếp! Vui lòng chỉ định người đại diện mới hoặc thực hiện thanh lý hợp đồng'."
        ]
    },
    {
        "stt": 17,
        "chuc_nang": "Chức năng mời liên kết tài khoản khách thuê",
        "use_case": "Invite Tenant User Link (Mời khách thuê kết nối tài khoản hệ thống)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, khách thuê đã có hồ sơ trong phòng và có tài khoản trên hệ thống.",
        "hau_dieu_kien": "Lời mời liên kết được gửi đến đúng tài khoản người dùng của khách thuê.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách khách thuê, chủ trọ bấm nút 'Liên kết tài khoản' tại dòng của khách thuê KT04 (Lê Văn Cường)."),
            ("text", "2. Hệ thống mở cửa sổ 'Tìm kiếm tài khoản hệ thống để liên kết', gồm 1 ô nhập từ khóa tìm kiếm (theo ID, SĐT hoặc Email) và nút 'Tìm kiếm'."),
            ("text", "3. Chủ trọ nhập số điện thoại '0905111333' của khách thuê và bấm 'Tìm kiếm'."),
            ("text", "4. Hệ thống tìm kiếm trong bảng User và hiển thị kết quả: User ID: UID308, Họ tên: Lê Văn Cường, Email: cuonglv@gmail.com."),
            ("text", "5. Chủ trọ bấm nút 'Gửi lời mời liên kết'."),
            ("text", "6. Hệ thống tạo yêu cầu liên kết trạng thái 'Chờ người dùng xác nhận', bắn thông báo tới app của khách thuê UID308 và cập nhật cột liên kết thành 'UID308 (Chờ xác nhận)'.")
        ],
        "ngoai_le": [
            "4. Không tìm thấy tài khoản người dùng tương ứng, hệ thống hiển thị: 'Không tìm thấy tài khoản người dùng với số điện thoại này. Khách thuê cần tải app và đăng ký tài khoản trước'."
        ]
    },

    # =========================================================================
    # QUẢN LÝ HỢP ĐỒNG THUÊ PHÒNG
    # =========================================================================
    {
        "stt": 18,
        "chuc_nang": "Chức năng xem danh sách hợp đồng thuê",
        "use_case": "View Contract List (Xem danh sách các hợp đồng thuê phòng)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Danh sách hợp đồng thuê phòng cùng trạng thái hiệu lực được hiển thị đầy đủ.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ vào mục 'Quản lý hợp đồng' trên thanh menu."),
            ("text", "2. Hệ thống hiển thị bộ lọc Trạng thái hợp đồng (Tất cả, Đang hiệu lực, Sắp hết hạn, Đã thanh lý), bộ lọc Tòa nhà, nút 'Tạo hợp đồng mới' và bảng danh sách hợp đồng:"),
            ("table",
                ["Mã hợp đồng", "Phòng", "Khách đại diện", "Ngày bắt đầu", "Ngày kết thúc", "Tiền thuê (VNĐ)", "Tiền cọc (VNĐ)", "Trạng thái", "Thao tác"],
                [
                    ["HĐ-2026-P101", "P101", "Nguyễn Văn An", "01/01/2026", "31/12/2026", "3.500.000", "3.500.000", "Đang hiệu lực", "Xem | In PDF | Thanh lý"],
                    ["HĐ-2026-P102", "P102", "Phạm Minh Đức", "01/10/2026", "30/09/2027", "3.800.000", "3.800.000", "Đang hiệu lực", "Xem | In PDF | Thanh lý"],
                    ["HĐ-2025-P202", "P202", "Hoàng Văn Tuấn", "01/09/2025", "31/08/2026", "3.500.000", "3.500.000", "Đã thanh lý", "Xem chi tiết"]
                ],
                [1.1, 0.6, 1.2, 0.9, 0.9, 1.0, 1.0, 1.0, 1.4]
            )
        ],
        "ngoai_le": [
            "2. Chủ trọ chưa có hợp đồng nào, bảng hiển thị: 'Chưa có hợp đồng nào được tạo. Bấm Tạo hợp đồng mới để bắt đầu'."
        ]
    },
    {
        "stt": 19,
        "chuc_nang": "Chức năng tạo hợp đồng thuê phòng",
        "use_case": "Create Rental Contract (Tạo hợp đồng thuê phòng mới)",
        "actor": "Chủ trọ, Khách thuê đại diện",
        "tien_dieu_kien": "Phòng trọ đang ở trạng thái 'Còn trống', thông tin khách thuê đại diện đã có trong hệ thống.",
        "hau_dieu_kien": "Hợp đồng thuê phòng mới được tạo lập, trạng thái phòng chuyển sang 'Đang thuê'.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Quản lý hợp đồng, chủ trọ bấm nút 'Tạo hợp đồng mới'."),
            ("text", "2. Hệ thống hiển thị Form tạo hợp đồng gồm 4 phần: Thông tin phòng thuê, Thông tin đại diện khách thuê, Các điều khoản tài chính & thời hạn, và Danh sách dịch vụ áp dụng."),
            ("text", "3. Chủ trọ chọn Tòa nhà (Ánh Dương), Chọn phòng trống (P102), Chọn khách đại diện (Phạm Minh Đức)."),
            ("text", "4. Chủ trọ thiết lập: Ngày bắt đầu (01/10/2026), Thời hạn 12 tháng, Ngày kết thúc (30/09/2027), Tiền thuê thỏa thuận (3.800.000 VNĐ), Tiền cọc (3.800.000 VNĐ), Chu kỳ thanh toán (Ngày 05 hàng tháng)."),
            ("text", "5. Chủ trọ nhập chỉ số công tơ ban đầu: Số điện bắt đầu: 1420, Số nước bắt đầu: 85; và tích chọn các dịch vụ đi kèm."),
            ("text", "6. Chủ trọ bấm nút 'Tạo và Ký hợp đồng'."),
            ("text", "7. Hệ thống tự động sinh Mã hợp đồng HĐ-2026-P102, lưu trạng thái 'Đang hiệu lực', cập nhật phòng P102 thành 'Đang thuê', và tự động tạo phiếu thu tiền cọc."),
            ("table",
                ["Mã hợp đồng", "Phòng", "Đại diện thuê", "Thời hạn", "Tiền thuê", "Tiền cọc", "Trạng thái"],
                [
                    ["HĐ-2026-P102", "P102", "Phạm Minh Đức", "01/10/2026 - 30/09/2027", "3.800.000", "3.800.000", "Đang hiệu lực"]
                ],
                [1.2, 0.7, 1.3, 1.8, 1.1, 1.1, 1.1]
            )
        ],
        "ngoai_le": [
            "3. Phòng được chọn không ở trạng thái Còn trống, hệ thống báo lỗi: 'Phòng này hiện đang có người thuê'.",
            "4. Ngày kết thúc trước hoặc bằng ngày bắt đầu, hệ thống cảnh báo: 'Thời hạn hợp đồng không hợp lệ'."
        ]
    },
    {
        "stt": 20,
        "chuc_nang": "Chức năng cập nhật điều khoản hợp đồng",
        "use_case": "Update Rental Contract (Cập nhật hoặc gia hạn hợp đồng thuê)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Hợp đồng đang ở trạng thái hiệu lực.",
        "hau_dieu_kien": "Thông tin điều khoản hoặc thời hạn mới của hợp đồng được ghi nhận.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách hợp đồng, chủ trọ tìm hợp đồng cần sửa và bấm nút 'Sửa'."),
            ("text", "2. Hệ thống hiển thị Form chi tiết hợp đồng cho phép chỉnh sửa thời hạn gia hạn hoặc điều khoản dịch vụ bổ sung."),
            ("text", "3. Chủ trọ thực hiện gia hạn thêm 6 tháng (đổi ngày kết thúc đến 31/03/2028) và bấm 'Lưu thay đổi'."),
            ("text", "4. Hệ thống ghi nhận phụ lục gia hạn hợp đồng và gửi thông báo tới khách thuê.")
        ],
        "ngoai_le": [
            "3. Hợp đồng đã thanh lý trước đó, hệ thống không cho phép sửa đổi dữ liệu lịch sử."
        ]
    },
    {
        "stt": 21,
        "chuc_nang": "Chức năng thanh lý hợp đồng và xử lý trả phòng",
        "use_case": "Terminate Contract & Check-out (Nghiệm thu phòng, hoàn cọc, thanh lý hợp đồng)",
        "actor": "Chủ trọ, Khách thuê",
        "tien_dieu_kien": "Khách thuê báo trả phòng hoặc hết hạn hợp đồng.",
        "hau_dieu_kien": "Hợp đồng được chuyển sang trạng thái 'Đã thanh lý', tiền cọc được quyết toán, phòng chuyển về trạng thái 'Còn trống'.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách hợp đồng, chủ trọ bấm nút 'Thanh lý hợp đồng' tại hợp đồng phòng P202."),
            ("text", "2. Hệ thống mở Form nghiệm thu trả phòng gồm: Chốt điện nước ngày trả, Bảng kiểm kê hư hỏng thiết bị, và Bảng quyết toán tài chính."),
            ("text", "3. Chủ trọ nhập chỉ số điện cuối (1050), chỉ số nước cuối (68), nhập chi phí trừ tiền sửa cửa tủ (200.000 VNĐ) và thẻ từ (100.000 VNĐ)."),
            ("text", "4. Hệ thống tự động tính bảng hoàn tiền cọc:"),
            ("table",
                ["Mục quyết toán", "Công thức tính", "Số tiền (VNĐ)"],
                [
                    ["Tiền cọc gốc", "Tiền cọc giữ ban đầu", "+ 3.500.000"],
                    ["Điện nước ngày cuối", "25 số điện + 2 khối nước", "- 155.000"],
                    ["Đền bù hư hại tài sản", "Sửa tủ + Thẻ từ", "- 300.000"],
                    ["SỐ TIỀN HOÀN TRẢ KHÁCH", "3.500.000 - 455.000", "= 3.045.000"]
                ],
                [2.2, 2.5, 1.8]
            ),
            ("text", "5. Chủ trọ bấm nút 'Xác nhận hoàn tất thanh lý'."),
            ("text", "6. Hệ thống chuyển hợp đồng thành 'Đã thanh lý', đưa phòng P202 về 'Còn trống', hủy liên kết khách thuê và xuất biên bản PDF.")
        ],
        "ngoai_le": [
            "3. Tổng tiền hư hại và nợ vượt quá tiền cọc, hệ thống hiển thị số tiền khách thuê phải nộp thêm kèm phiếu thu bổ sung."
        ]
    },

    # =========================================================================
    # QUẢN LÝ HÓA ĐƠN & TÍNH TIỀN PHÒNG THEO THÁNG
    # =========================================================================
    {
        "stt": 22,
        "chuc_nang": "Chức năng xem danh sách hóa đơn tháng",
        "use_case": "View Monthly Bills (Xem danh sách hóa đơn tiền phòng hàng tháng)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Danh sách hóa đơn theo kỳ cước cùng trạng thái thanh toán được hiển thị đầy đủ.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ chọn mục 'Quản lý hóa đơn & Thu tiền' trên menu."),
            ("text", "2. Hệ thống hiển thị bộ lọc Kỳ cước (Tháng 10/2026), bộ lọc Tòa nhà, bộ lọc Trạng thái (Tất cả, Chờ thanh toán, Đã thanh toán, Quá hạn) và bảng danh sách hóa đơn:"),
            ("table",
                ["Mã hóa đơn", "Phòng", "Khách đại diện", "Kỳ cước", "Số tiền (VNĐ)", "Hạn nộp", "Trạng thái", "Thao tác"],
                [
                    ["HD-202610-P101", "P101", "Nguyễn Văn An", "10/2026", "4.654.000", "05/11/2026", "Đã thanh toán", "Xem | In biên lai"],
                    ["HD-202610-P102", "P102", "Phạm Minh Đức", "10/2026", "4.707.000", "05/11/2026", "Chờ thanh toán", "Thu tiền | Sửa | Hủy"],
                    ["HD-202610-P202", "P202", "Hoàng Văn Tuấn", "10/2026", "3.950.000", "01/11/2026", "Quá hạn 3 ngày", "Nhắc nợ | Thu tiền"]
                ],
                [1.2, 0.6, 1.2, 0.7, 1.1, 0.9, 1.1, 1.4]
            )
        ],
        "ngoai_le": [
            "2. Chưa có hóa đơn nào cho tháng được chọn, hệ thống thông báo: 'Chưa có hóa đơn nào trong tháng này. Vui lòng bấm Tính tiền phòng để lập hóa đơn'."
        ]
    },
    {
        "stt": 23,
        "chuc_nang": "Chức năng ghi chỉ số điện nước và lập hóa đơn mới",
        "use_case": "Monthly Meter Reading & Create Invoice (Ghi chỉ số công tơ và phát hành hóa đơn)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Phòng trọ đang có hợp đồng hiệu lực; đến ngày chốt tiền trọ hàng tháng.",
        "hau_dieu_kien": "Hóa đơn tiền phòng tháng được tạo, tự động tính tổng tiền và gửi thông báo tới khách thuê.",
        "kich_ban_chinh": [
            ("text", "1. Tại trang Quản lý hóa đơn, chủ trọ bấm nút 'Tính tiền phòng & Lập hóa đơn'."),
            ("text", "2. Chủ trọ chọn Tòa nhà (Ánh Dương), chọn Phòng (P102), chọn Kỳ cước (Tháng 10/2026)."),
            ("text", "3. Hệ thống hiển thị số điện cũ (1420) và số nước cũ (85)."),
            ("text", "4. Chủ trọ nhập: Số điện mới: 1535 (tiêu thụ 115 số), Số nước mới: 94 (tiêu thụ 9 khối)."),
            ("text", "5. Hệ thống tự động tính bảng chiết tính chi phí minh bạch:"),
            ("table",
                ["Khoản mục", "Số lượng", "Đơn giá (VNĐ)", "Thành tiền (VNĐ)"],
                [
                    ["Tiền thuê phòng P102", "1 tháng", "3.800.000", "3.800.000"],
                    ["Tiền điện sinh hoạt", "115 kWh", "3.800", "437.000"],
                    ["Tiền nước sinh hoạt", "9 m3", "30.000", "270.000"],
                    ["Internet Wifi", "1 phòng", "100.000", "100.000"],
                    ["Vệ sinh & Rác", "2 người", "50.000", "100.000"],
                    ["TỔNG CỘNG HÓA ĐƠN", "", "", "4.707.000"]
                ],
                [2.2, 1.2, 1.4, 1.5]
            ),
            ("text", "6. Chủ trọ kiểm tra và bấm 'Phát hành hóa đơn'."),
            ("text", "7. Hệ thống lưu hóa đơn HD-202610-P102 trạng thái 'Chờ thanh toán' và tự động gửi thông báo kèm mã VietQR tới app khách thuê.")
        ],
        "ngoai_le": [
            "4. Số mới nhỏ hơn số cũ, hệ thống chặn lại và báo lỗi: 'Chỉ số mới không được nhỏ hơn chỉ số cũ'.",
            "4. Số điện tăng bất thường trên 500%, hệ thống hiển thị cảnh báo vàng để chủ trọ rà soát lại đồng hồ."
        ]
    },
    {
        "stt": 24,
        "chuc_nang": "Chức năng cập nhật điều chỉnh hóa đơn",
        "use_case": "Update Invoice (Chỉnh sửa hoặc điều chỉnh hóa đơn chưa thanh toán)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Hóa đơn đang ở trạng thái 'Chờ thanh toán', chưa được gạch nợ.",
        "hau_dieu_kien": "Các khoản mục chi phí của hóa đơn được cập nhật lại chính xác.",
        "kich_ban_chinh": [
            ("text", "1. Do nhập nhầm chỉ số nước, chủ trọ bấm nút 'Sửa' tại hóa đơn HD-202610-P102."),
            ("text", "2. Hệ thống hiển thị lại Form chỉnh sửa chỉ số và chi phí phát sinh."),
            ("text", "3. Chủ trọ chỉnh lại số nước mới từ 94 thành 92 khối (tiêu thụ 7 khối thay vì 9 khối)."),
            ("text", "4. Hệ thống tự động tính lại tổng tiền mới thành 4.647.000 VNĐ."),
            ("text", "5. Chủ trọ bấm 'Lưu cập nhật'."),
            ("text", "6. Hệ thống cập nhật hóa đơn và gửi thông báo số liệu điều chỉnh tới khách thuê.")
        ],
        "ngoai_le": [
            "1. Hóa đơn đã ở trạng thái 'Đã thanh toán', hệ thống khóa không cho sửa trực tiếp để bảo đảm an toàn chứng từ."
        ]
    },
    {
        "stt": 25,
        "chuc_nang": "Chức năng hủy hóa đơn",
        "use_case": "Cancel Invoice (Hủy hóa đơn lập sai)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Hóa đơn chưa thanh toán, phát sinh sai sót lớn hoặc phòng chuyển đi đột xuất.",
        "hau_dieu_kien": "Hóa đơn chuyển sang trạng thái 'Đã hủy', chỉ số công tơ được phục hồi.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách hóa đơn, chủ trọ bấm nút 'Hủy' tại hóa đơn lập sai."),
            ("text", "2. Hệ thống hiển thị hộp thoại yêu cầu nhập lý do hủy hóa đơn."),
            ("text", "3. Chủ trọ nhập: 'Lập nhầm cho phòng khác' và bấm 'Xác nhận hủy'."),
            ("text", "4. Hệ thống chuyển trạng thái hóa đơn sang 'Đã hủy', hoàn trả lại chỉ số cũ cho phòng và thông báo thành công.")
        ],
        "ngoai_le": [
            "3. Chủ trọ không nhập lý do hủy, hệ thống yêu cầu: 'Vui lòng nhập lý do hủy hóa đơn'."
        ]
    },
    {
        "stt": 26,
        "chuc_nang": "Chức năng xác nhận thanh toán hóa đơn",
        "use_case": "Confirm Invoice Payment (Xác nhận thu tiền và gạch nợ hóa đơn)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Khách thuê đã nộp tiền mặt hoặc chuyển khoản; hóa đơn ở trạng thái 'Chờ thanh toán'.",
        "hau_dieu_kien": "Hóa đơn được chuyển sang trạng thái 'Đã thanh toán', ghi nhận vào sổ quỹ.",
        "kich_ban_chinh": [
            ("text", "1. Khi nhận được tiền cước phòng P102, chủ trọ bấm nút 'Xác nhận thu tiền' tại dòng của P102."),
            ("text", "2. Hệ thống hiển thị Form xác nhận thu tiền gồm: Mã hóa đơn, Số tiền phải thu (4.707.000 VNĐ), Số tiền thực thu, Hình thức thanh toán (Tiền mặt / Chuyển khoản), Ngày thu."),
            ("text", "3. Chủ trọ chọn: 'Chuyển khoản ngân hàng', nhập số tiền: 4.707.000 VNĐ, Ghi chú: 'Đã nhận qua MB Bank'."),
            ("text", "4. Chủ trọ bấm 'Xác nhận thanh toán'."),
            ("text", "5. Hệ thống cập nhật hóa đơn sang 'Đã thanh toán', gửi thông báo biên lai tới app khách thuê và nạp lại danh sách.")
        ],
        "ngoai_le": [
            "3. Khách chỉ thanh toán một phần (2.000.000 VNĐ), hệ thống chuyển trạng thái thành 'Thanh toán một phần (Còn nợ: 2.707.000 VNĐ)'."
        ]
    },

    # =========================================================================
    # QUẢN LÝ KHIẾU NẠI & SỰ CỐ
    # =========================================================================
    {
        "stt": 27,
        "chuc_nang": "Chức năng xem danh sách khiếu nại của khách thuê",
        "use_case": "View Complaints (Xem danh sách phản ánh sự cố hỏng hóc)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập vào hệ thống.",
        "hau_dieu_kien": "Danh sách khiếu nại báo hỏng thiết bị, điện nước, an ninh được hiển thị đầy đủ.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ bấm vào mục 'Khiếu nại & Báo hỏng' trên thanh menu."),
            ("text", "2. Hệ thống hiển thị bộ lọc Trạng thái (Tất cả, Mới gửi, Đang xử lý, Đã giải quyết), bộ lọc Tòa nhà và danh sách khiếu nại:"),
            ("table",
                ["Mã KN", "Phòng", "Người gửi", "Loại sự cố", "Tiêu đề", "Ngày gửi", "Mức độ", "Trạng thái", "Thao tác"],
                [
                    ["KN101", "P102", "Phạm Minh Đức", "Điện lạnh", "Điều hòa chảy nước và không mát", "02/10/2026", "Cao", "Mới gửi", "Chi tiết"],
                    ["KN098", "P201", "Lê Văn Cường", "Điện nước", "Áp lực nước vòi sen yếu", "28/09/2026", "TB", "Đang xử lý", "Chi tiết"]
                ],
                [0.8, 0.6, 1.2, 0.9, 1.8, 0.9, 0.6, 0.9, 0.8]
            )
        ],
        "ngoai_le": [
            "2. Không có khiếu nại nào, bảng hiển thị: 'Hiện tại không có khiếu nại hay sự cố nào cần xử lý'."
        ]
    },
    {
        "stt": 28,
        "chuc_nang": "Chức năng xử lý và cập nhật tiến độ khiếu nại",
        "use_case": "Handle Complaint (Tiếp nhận, phản hồi và cập nhật tiến độ sửa chữa)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Có khiếu nại ở trạng thái 'Mới gửi' hoặc 'Đang xử lý'.",
        "hau_dieu_kien": "Trạng thái xử lý sự cố được cập nhật, thông báo phản hồi được gửi tới khách thuê.",
        "kich_ban_chinh": [
            ("text", "1. Tại danh sách khiếu nại, chủ trọ bấm 'Chi tiết' tại khiếu nại KN101 (Phòng P102 - Hỏng điều hòa)."),
            ("text", "2. Hệ thống hiển thị chi tiết phản ánh, hình ảnh đính kèm hiện trạng thiết bị và Form xử lý tiến độ."),
            ("text", "3. Chủ trọ chuyển trạng thái sang 'Đang xử lý' và nhập phản hồi: 'Chủ nhà đã hẹn thợ 14h00 chiều nay đến kiểm tra'."),
            ("text", "4. Chủ trọ bấm 'Cập nhật tiến độ'."),
            ("text", "5. Hệ thống gửi thông báo đẩy tới app của khách thuê Phạm Minh Đức."),
            ("text", "6. Sau khi sửa xong, chủ trọ mở lại KN101, chuyển sang 'Đã giải quyết', nhập ghi chú 'Đã bảo dưỡng nạp gas' và bấm 'Hoàn tất'.")
        ],
        "ngoai_le": [
            "3. Khiếu nại vô lý hoặc do khách tự làm vỡ không thuộc bảo hành, chủ trọ chọn 'Từ chối' và nêu rõ lý do."
        ]
    },

    # =========================================================================
    # BÁO CÁO & THỐNG KÊ
    # =========================================================================
    {
        "stt": 29,
        "chuc_nang": "Chức năng xem Dashboard thống kê chủ trọ",
        "use_case": "View Landlord Dashboard (Theo dõi doanh thu, tỷ lệ lấp đầy, phòng nợ cước)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đăng nhập thành công vào hệ thống.",
        "hau_dieu_kien": "Báo cáo tổng quan số liệu tài chính và hoạt động phòng trọ được hiển thị trực quan.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ chọn trang 'Dashboard tổng quan'."),
            ("text", "2. Hệ thống tải số liệu thời gian thực và hiển thị các thẻ chỉ số KPI: Doanh thu tháng (85.600.000 VNĐ), Tỷ lệ lấp đầy (92% - 46/50 phòng), Tiền nợ đọng (8.657.000 VNĐ), Khiếu nại chờ xử lý (1 vụ)."),
            ("text", "3. Hệ thống hiển thị bảng danh sách các phòng đang nợ tiền cước quá hạn cần đôn đốc thu hồi:"),
            ("table",
                ["Phòng", "Tòa nhà", "Khách đại diện", "Số điện thoại", "Số tiền nợ (VNĐ)", "Trễ hạn", "Thao tác"],
                [
                    ["P202", "Ánh Dương", "Hoàng Văn Tuấn", "0904333222", "3.950.000", "Trễ 3 ngày", "Nhắc nợ SMS"],
                    ["P304", "Bách Khoa Plaza", "Vũ Đình Trọng", "0981999888", "4.707.000", "Trễ 5 ngày", "Nhắc nợ SMS"]
                ],
                [0.8, 1.4, 1.4, 1.1, 1.2, 0.9, 1.2]
            ),
            ("text", "4. Chủ trọ bấm nút 'Xuất báo cáo Excel' để tải bảng quyết toán tài chính về máy tính.")
        ],
        "ngoai_le": [
            "4. Mất kết nối mạng khi tải file, hệ thống hiển thị: 'Tải báo cáo thất bại, vui lòng thử lại'."
        ]
    }
]

print(f"Loaded {len(USECASES_LANDLORD_SPLIT)} separated use cases for Landlord.")

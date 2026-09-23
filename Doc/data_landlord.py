# -*- coding: utf-8 -*-
"""
Dữ liệu đặc tả chi tiết 10 Use Case của Role: CHỦ TRỌ (Landlord)
Tuân thủ chuẩn template, chữ đen nền trắng, bảng mô phỏng dữ liệu chi tiết từng bước.
"""

USECASES_LANDLORD = [
    # -------------------------------------------------------------
    # USE CASE 1: Quản lý tòa nhà / nhà trọ
    # -------------------------------------------------------------
    {
        "stt": 1,
        "role": "Chủ trọ",
        "chuc_nang": "Quản lý tòa nhà (CRUD Tòa nhà)",
        "use_case": "Manage Buildings (Thêm, sửa, xem danh sách tòa nhà)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập thành công vào hệ thống quản lý nhà trọ.",
        "hau_dieu_kien": "Thông tin tòa nhà/khu trọ được lưu trữ và cập nhật thành công vào cơ sở dữ liệu.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ đăng nhập vào hệ thống, từ thanh menu điều hướng chọn mục 'Quản lý tòa nhà'."),
            ("text", "2. Hệ thống hiển thị giao diện danh sách các tòa nhà hiện có của chủ trọ, gồm 1 thanh tìm kiếm theo tên tòa nhà/địa chỉ, bộ lọc trạng thái, nút 'Thêm mới tòa nhà' và bảng danh sách các tòa nhà hiện tại:"),
            ("table", 
                ["Mã tòa", "Tên tòa nhà", "Địa chỉ", "Số tầng", "Tổng số phòng", "Phòng trống", "Tùy chọn"],
                [
                    ["TN01", "Tòa nhà Ánh Dương", "Số 12 Ngõ 80 Cầu Giấy, Hà Nội", "5", "20", "4", "Xem | Sửa | Xóa"],
                    ["TN02", "Tòa nhà Bách Khoa Plaza", "Số 45 Tạ Quang Bửu, Hai Bà Trưng, HN", "6", "24", "1", "Xem | Sửa | Xóa"],
                    ["TN03", "Khu nhà trọ Hòa Phát", "Số 88 Triều Khúc, Thanh Xuân, Hà Nội", "4", "16", "0", "Xem | Sửa | Xóa"]
                ],
                [0.8, 1.6, 2.2, 0.7, 0.9, 0.8, 1.2]
            ),
            ("text", "3. Chủ trọ muốn bổ sung thêm một cụm nhà trọ mới, chủ trọ bấm vào nút 'Thêm mới tòa nhà'."),
            ("text", "4. Hệ thống hiển thị modal pop-up Form nhập thông tin tòa nhà bao gồm các trường: Mã tòa (tự sinh TN04), Tên tòa nhà (*), Tỉnh/Thành phố (*), Quận/Huyện (*), Phường/Xã (*), Địa chỉ chi tiết (*), Số tầng (*), Quy định chung tòa nhà, Mô tả tiện ích chung (thang máy, camera an ninh, khóa vân tay, chỗ để xe), nút 'Hủy' và nút 'Lưu tòa nhà'."),
            ("text", "5. Chủ trọ nhập thông tin: Tên tòa nhà: 'Nhà trọ Cầu Giấy Xanh', Địa chỉ chi tiết: 'Số 15 Ngõ 165 Cầu Giấy', Số tầng: 5, Tiện ích chung: 'Có thang máy, khóa cổng vân tay 24/7, camera các tầng, máy giặt chung'."),
            ("text", "6. Chủ trọ kiểm tra lại thông tin và bấm nút 'Lưu tòa nhà'."),
            ("text", "7. Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu, lưu bản ghi mới vào cơ sở dữ liệu, hiển thị thông báo 'Thêm mới tòa nhà thành công!' và tự động cập nhật lại bảng danh sách tòa nhà:"),
            ("table",
                ["Mã tòa", "Tên tòa nhà", "Địa chỉ", "Số tầng", "Tổng số phòng", "Phòng trống", "Tùy chọn"],
                [
                    ["TN01", "Tòa nhà Ánh Dương", "Số 12 Ngõ 80 Cầu Giấy, Hà Nội", "5", "20", "4", "Xem | Sửa | Xóa"],
                    ["TN02", "Tòa nhà Bách Khoa Plaza", "Số 45 Tạ Quang Bửu, Hai Bà Trưng, HN", "6", "24", "1", "Xem | Sửa | Xóa"],
                    ["TN03", "Khu nhà trọ Hòa Phát", "Số 88 Triều Khúc, Thanh Xuân, Hà Nội", "4", "16", "0", "Xem | Sửa | Xóa"],
                    ["TN04", "Nhà trọ Cầu Giấy Xanh", "Số 15 Ngõ 165 Cầu Giấy, Hà Nội", "5", "0", "0", "Xem | Sửa | Xóa"]
                ],
                [0.8, 1.6, 2.2, 0.7, 0.9, 0.8, 1.2]
            ),
            ("text", "8. Chủ trọ hoàn tất việc tạo tòa nhà và chuyển sang bước tạo danh sách phòng cho tòa nhà vừa lập.")
        ],
        "ngoai_le": [
            "4. Chủ trọ bấm nút 'Hủy', hệ thống đóng form thêm mới và giữ nguyên dữ liệu danh sách hiện tại.",
            "6. Chủ trọ để trống trường bắt buộc (Tên tòa nhà hoặc Địa chỉ), hệ thống hiển thị cảnh báo viền đỏ 'Vui lòng nhập đầy đủ thông tin bắt buộc' tại các ô nhập tương ứng.",
            "7. Tên tòa nhà bị trùng lặp với tòa nhà đã có của chủ trọ, hệ thống báo lỗi 'Tên tòa nhà đã tồn tại, vui lòng chọn tên khác'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 2: Quản lý phòng trọ (CRUD Phòng)
    # -------------------------------------------------------------
    {
        "stt": 2,
        "role": "Chủ trọ",
        "chuc_nang": "Quản lý phòng trọ (CRUD Phòng)",
        "use_case": "Manage Rooms (Thêm, sửa, xem danh sách và trạng thái phòng)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập và đã có ít nhất một tòa nhà trong hệ thống.",
        "hau_dieu_kien": "Danh sách phòng trọ được khởi tạo, cập nhật trạng thái hoạt động chính xác.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ vào mục 'Quản lý phòng trọ' từ thanh điều hướng chính."),
            ("text", "2. Hệ thống hiển thị giao diện gồm bộ lọc Tòa nhà (Dropdown chọn tòa), bộ lọc Tầng, bộ lọc Trạng thái phòng (Tất cả, Còn trống, Đang thuê, Đang sửa chữa), nút 'Thêm phòng mới', nút 'Thêm phòng nhanh theo tầng', và bảng danh sách phòng thuộc tòa nhà đang chọn:"),
            ("table",
                ["Mã phòng", "Tên phòng", "Tầng", "Diện tích (m2)", "Giá thuê (VNĐ)", "Sức chứa", "Trạng thái", "Tùy chọn"],
                [
                    ["P101", "Phòng 101", "Tầng 1", "25", "3.500.000", "2 người", "Đang thuê", "Xem | Sửa | Đổi trạng thái"],
                    ["P102", "Phòng 102", "Tầng 1", "28", "3.800.000", "3 người", "Còn trống", "Xem | Sửa | Đổi trạng thái"],
                    ["P201", "Phòng 201", "Tầng 2", "30", "4.200.000", "3 người", "Còn trống", "Xem | Sửa | Đổi trạng thái"],
                    ["P202", "Phòng 202", "Tầng 2", "25", "3.500.000", "2 người", "Đang sửa chữa", "Xem | Sửa | Đổi trạng thái"]
                ],
                [0.8, 1.0, 0.7, 1.0, 1.2, 0.9, 1.1, 1.5]
            ),
            ("text", "3. Chủ trọ bấm chọn nút 'Thêm phòng mới'."),
            ("text", "4. Hệ thống mở form pop-up 'Thêm phòng trọ mới' với các trường nhập liệu: Chọn tòa nhà (mặc định Nhà trọ Cầu Giấy Xanh), Mã phòng (*), Tên phòng (*), Tầng (*), Diện tích (m2) (*), Giá thuê niêm yết (VNĐ/tháng) (*), Tiền cọc tiêu chuẩn (VNĐ) (*), Sức chứa tối đa (người) (*), Tiện nghi trong phòng (checkbox: Điều hòa, Nóng lạnh, Giường, Tủ quần áo, Tủ lạnh, Kệ bếp, Ban công riêng), Mô tả chi tiết, Nút 'Hủy' và nút 'Xác nhận tạo phòng'."),
            ("text", "5. Chủ trọ điền thông tin: Mã phòng: 'P301', Tên phòng: 'Phòng 301', Tầng: 3, Diện tích: 32, Giá thuê: 4.500.000, Tiền cọc: 4.500.000, Sức chứa: 3 người; Tích chọn tiện nghi: Điều hòa, Nóng lạnh, Giường nệm, Tủ gỗ, Ban công."),
            ("text", "6. Chủ trọ bấm nút 'Xác nhận tạo phòng'."),
            ("text", "7. Hệ thống kiểm tra tính duy nhất của mã phòng trong tòa, ghi dữ liệu vào hệ thống và hiển thị thông báo 'Tạo phòng P301 thành công! Trạng thái: Còn trống'."),
            ("text", "8. Bảng danh sách phòng được cập nhật hiển thị thêm bản ghi P301 với trạng thái 'Còn trống'.")
        ],
        "ngoai_le": [
            "5. Mã phòng P301 đã tồn tại trong tòa nhà được chọn, hệ thống thông báo lỗi: 'Mã phòng P301 đã tồn tại trong tòa nhà này, vui lòng kiểm tra lại'.",
            "6. Chủ trọ nhập giá thuê hoặc diện tích là số âm hoặc bằng 0, hệ thống cảnh báo: 'Giá phòng và diện tích phải là số nguyên dương lớn hơn 0'.",
            "7. Hệ thống mất kết nối cơ sở dữ liệu, hiển thị thông báo 'Lỗi kết nối máy chủ, vui lòng thử lại sau giây lát'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 3: Quản lý dịch vụ tiện ích (CRUD Dịch vụ)
    # -------------------------------------------------------------
    {
        "stt": 3,
        "role": "Chủ trọ",
        "chuc_nang": "Quản lý dịch vụ tiện ích (CRUD Dịch vụ)",
        "use_case": "Manage Utility Services (Cấu hình bảng giá điện, nước, internet, dịch vụ chung)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đăng nhập thành công vào hệ thống.",
        "hau_dieu_kien": "Danh mục dịch vụ và đơn giá áp dụng cho từng tòa nhà/phòng được thiết lập sẵn sàng để tính hóa đơn.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ chọn mục 'Cấu hình dịch vụ' trên menu chính."),
            ("text", "2. Hệ thống hiển thị danh sách các dịch vụ hiện có theo tòa nhà, gồm nút 'Thêm dịch vụ mới' và bảng chi tiết dịch vụ:"),
            ("table",
                ["Mã DV", "Tên dịch vụ", "Loại dịch vụ", "Đơn vị tính", "Đơn giá (VNĐ)", "Hình thức thu", "Áp dụng tòa", "Tùy chọn"],
                [
                    ["DV01", "Điện sinh hoạt", "Điện", "kWh (Số)", "3.800", "Theo công tơ thực tế", "Tất cả", "Sửa | Xóa"],
                    ["DV02", "Nước sinh hoạt", "Nước", "Khối (m3)", "30.000", "Theo đồng hồ nước", "Tất cả", "Sửa | Xóa"],
                    ["DV03", "Internet Wifi tốc độ cao", "Mạng", "Phòng/Tháng", "100.000", "Cố định theo phòng", "TN01, TN02", "Sửa | Xóa"],
                    ["DV04", "Vệ sinh & Rác thải", "Vệ sinh", "Người/Tháng", "50.000", "Theo số người ở", "Tất cả", "Sửa | Xóa"],
                    ["DV05", "Phí gửi xe máy", "Gửi xe", "Xe/Tháng", "100.000", "Theo số lượng xe", "TN01", "Sửa | Xóa"]
                ],
                [0.7, 1.4, 0.9, 1.0, 1.0, 1.4, 1.0, 0.9]
            ),
            ("text", "3. Chủ trọ muốn thêm loại dịch vụ 'Thang máy và bảo trì chung', chủ trọ bấm nút 'Thêm dịch vụ mới'."),
            ("text", "4. Hệ thống hiển thị form thêm mới dịch vụ với các trường: Tên dịch vụ (*), Phân loại (Dropdown: Điện, Nước, Mạng, Vệ sinh, Thang máy, Khác), Đơn vị tính (*), Đơn giá (VNĐ) (*), Hình thức tính phí (Theo chỉ số công tơ / Cố định theo phòng / Cố định theo đầu người), Phạm vi áp dụng (Tất cả tòa nhà hoặc chọn tòa cụ thể), Ghi chú, Nút 'Hủy' và nút 'Lưu dịch vụ'."),
            ("text", "5. Chủ trọ nhập thông tin: Tên dịch vụ: 'Phí vận hành thang máy', Phân loại: Thang máy, Đơn vị tính: 'Người/Tháng', Đơn giá: 50.000, Hình thức: 'Cố định theo đầu người', Áp dụng: 'TN01, TN04'."),
            ("text", "6. Chủ trọ bấm nút 'Lưu dịch vụ'."),
            ("text", "7. Hệ thống ghi nhận dịch vụ mới vào danh mục dịch vụ của chủ trọ, hiển thị thông báo 'Lưu dịch vụ thành công!' và tự động nạp lại danh sách dịch vụ.")
        ],
        "ngoai_le": [
            "5. Chủ trọ bỏ trống trường tên dịch vụ hoặc đơn giá, hệ thống cảnh báo viền đỏ 'Không được để trống trường này'.",
            "6. Dịch vụ đã tồn tại tên trùng lặp trong cùng một tòa nhà, hệ thống hiển thị cảnh báo: 'Dịch vụ này đã tồn tại trong tòa nhà được chỉ định'.",
            "7. Chủ trọ xóa một dịch vụ đang được gán trong các hợp đồng còn hiệu lực, hệ thống hiển thị cảnh báo: 'Dịch vụ đang được áp dụng trong 12 hợp đồng thuê phòng, không thể xóa! Vui lòng chuyển trạng thái ngừng kích hoạt thay vì xóa'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 4: Quản lý khách thuê & Mời liên kết người dùng
    # -------------------------------------------------------------
    {
        "stt": 4,
        "role": "Chủ trọ",
        "chuc_nang": "CRUD Khách thuê & Liên kết người dùng",
        "use_case": "Manage Tenants & Invite User Link (Quản lý khách thuê và liên kết tài khoản hệ thống)",
        "actor": "Chủ trọ, Khách thuê",
        "tien_dieu_kien": "Chủ trọ đã đăng nhập, đã tạo phòng trọ.",
        "hau_dieu_kien": "Khách thuê được tạo hồ sơ trong phòng và lời mời liên kết tài khoản được gửi đến đúng người dùng trong hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ bấm vào mục 'Quản lý khách thuê' trên thanh menu."),
            ("text", "2. Hệ thống hiển thị danh sách khách đang thuê phòng tại các tòa nhà, gồm ô tìm kiếm theo Tên/CCCD/SĐT, bộ lọc Tòa nhà/Phòng, nút 'Thêm khách thuê', và bảng dữ liệu:"),
            ("table",
                ["Mã KT", "Họ và tên", "SĐT", "Số CCCD", "Phòng ở", "Vai trò phòng", "Tài khoản liên kết", "Trạng thái", "Tùy chọn"],
                [
                    ["KT01", "Nguyễn Văn An", "0912345678", "001200001234", "P101 - Ánh Dương", "Đại diện thuê", "UID105 (Đã liên kết)", "Đang thuê", "Xem | Sửa | Xóa"],
                    ["KT02", "Trần Thị Bích", "0987654321", "001200005678", "P101 - Ánh Dương", "Thành viên", "Chưa liên kết", "Đang thuê", "Liên kết | Sửa | Xóa"],
                    ["KT03", "Lê Văn Cường", "0905111222", "001200009999", "P201 - Ánh Dương", "Đại diện thuê", "Chưa liên kết", "Đang thuê", "Liên kết | Sửa | Xóa"]
                ],
                [0.7, 1.3, 1.0, 1.1, 1.3, 1.0, 1.3, 0.9, 1.3]
            ),
            ("text", "3. Chủ trọ muốn bổ sung thêm 1 khách thuê mới vào phòng P102 vừa có người chuyển đến, chủ trọ bấm nút 'Thêm khách thuê'."),
            ("text", "4. Hệ thống mở form 'Thêm khách thuê vào phòng' gồm: Chọn Tòa nhà, Chọn Phòng (P102), Họ tên khách (*), Số điện thoại (*), Số CCCD/CMND (*), Ngày cấp, Nơi cấp, Quê quán, Giới tính, Ngày sinh, Là đại diện hợp đồng (checkbox), nút 'Lưu khách thuê' và nút 'Lưu và Mời liên kết tài khoản'."),
            ("text", "5. Chủ trọ nhập: Họ tên: 'Phạm Minh Đức', SĐT: '0977888999', CCCD: '001201012345', Quê quán: 'Nam Định', Chọn phòng: P102."),
            ("text", "6. Chủ trọ muốn kết nối với tài khoản mà khách thuê này đã đăng ký trên hệ thống để tiện gửi hóa đơn và thông báo sau này, chủ trọ bấm vào nút 'Lưu và Mời liên kết tài khoản'."),
            ("text", "7. Hệ thống lưu hồ sơ khách thuê KT04 và mở giao diện 'Tìm kiếm tài khoản hệ thống để liên kết', gồm 1 ô nhập từ khóa tìm kiếm (theo ID người dùng, Số điện thoại hoặc Email) và nút 'Tìm kiếm'."),
            ("text", "8. Chủ trọ nhập số điện thoại '0977888999' (hoặc mã ID người dùng do khách thuê cung cấp) và bấm 'Tìm kiếm'."),
            ("text", "9. Hệ thống tìm kiếm trong bảng User toàn hệ thống và hiển thị kết quả tương ứng dạng bảng:"),
            ("table",
                ["User ID", "Họ và tên tài khoản", "Email", "Số điện thoại", "Trạng thái tài khoản", "Thao tác"],
                [
                    ["UID208", "Phạm Minh Đức", "ducpham99@gmail.com", "0977888999", "Đang hoạt động", "Chọn liên kết"]
                ],
                [0.9, 1.5, 1.7, 1.1, 1.3, 1.0]
            ),
            ("text", "10. Chủ trọ đối chiếu thông tin thấy trùng khớp với khách thuê và bấm vào nút 'Chọn liên kết'."),
            ("text", "11. Hệ thống hiển thị hộp thoại xác nhận: 'Gửi lời mời liên kết phòng P102 (Tòa nhà Cầu Giấy Xanh) tới tài khoản UID208 - Phạm Minh Đức?' kèm 2 nút 'Hủy' và 'Xác nhận gửi'."),
            ("text", "12. Chủ trọ bấm 'Xác nhận gửi'."),
            ("text", "13. Hệ thống tạo một bản ghi yêu cầu liên kết trạng thái 'Chờ người dùng xác nhận', gửi thông báo tới chuông thông báo của tài khoản UID208 và cập nhật cột Tài khoản liên kết thành 'UID208 (Chờ xác nhận)' trong danh sách khách thuê.")
        ],
        "ngoai_le": [
            "8. Không tìm thấy tài khoản người dùng tương ứng với từ khóa tìm kiếm, hệ thống hiển thị thông báo: 'Không tìm thấy tài khoản người dùng phù hợp. Khách thuê chưa có tài khoản trên hệ thống, hồ sơ khách thuê vẫn được lưu ở trạng thái Chưa liên kết'.",
            "10. Tài khoản tìm thấy đã được liên kết với một phòng trọ khác có hợp đồng đang hiệu lực, hệ thống hiển thị cảnh báo: 'Tài khoản này đang liên kết với phòng P302 thuộc tòa nhà khác. Bạn có chắc chắn muốn gửi lời mời chuyển sang phòng mới không?'.",
            "12. Chủ trọ bấm 'Hủy', hệ thống đóng hộp thoại và quay lại danh sách với trạng thái khách thuê 'Chưa liên kết'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 5: Tạo hợp đồng thuê phòng
    # -------------------------------------------------------------
    {
        "stt": 5,
        "role": "Chủ trọ",
        "chuc_nang": "Tạo hợp đồng thuê phòng",
        "use_case": "Create Rental Contract (Thiết lập hợp đồng thuê phòng mới)",
        "actor": "Chủ trọ, Đại diện khách thuê",
        "tien_dieu_kien": "Phòng trọ đang ở trạng thái 'Còn trống', thông tin khách thuê đại diện đã được thêm vào hệ thống.",
        "hau_dieu_kien": "Hợp đồng thuê phòng được tạo lập, trạng thái phòng tự động chuyển sang 'Đang thuê'.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ truy cập mục 'Quản lý hợp đồng' và bấm nút 'Tạo hợp đồng mới'."),
            ("text", "2. Hệ thống hiển thị giao diện Form tạo hợp đồng gồm 4 phần chính: Thông tin phòng thuê, Thông tin đại diện khách thuê, Các điều khoản tài chính & thời hạn, và Danh sách dịch vụ áp dụng:"),
            ("text", "3. Tại mục 'Thông tin phòng thuê', chủ trọ chọn Tòa nhà (Ánh Dương) và Phòng thuê (P102). Hệ thống tự động điền sẵn diện tích (28m2) và giá niêm yết (3.800.000 VNĐ)."),
            ("text", "4. Tại mục 'Thông tin đại diện khách thuê', chủ trọ bấm nút 'Chọn khách thuê'. Hệ thống hiển thị danh sách khách thuê đang chờ ký hợp đồng dưới dạng bảng:"),
            ("table",
                ["Mã KT", "Họ và tên", "Số điện thoại", "Số CCCD", "Quê quán", "Chọn"],
                [
                    ["KT04", "Phạm Minh Đức", "0977888999", "001201012345", "Nam Định", "Chọn làm đại diện"],
                    ["KT05", "Lê Bảo Nam", "0966555444", "001201098765", "Thái Bình", "Chọn làm đại diện"]
                ],
                [0.8, 1.5, 1.2, 1.3, 1.2, 1.5]
            ),
            ("text", "5. Chủ trọ bấm chọn 'Phạm Minh Đức (KT04)'. Hệ thống điền thông tin khách thuê vào form hợp đồng."),
            ("text", "6. Chủ trọ thiết lập các điều khoản hợp đồng: Ngày bắt đầu hợp đồng (01/10/2026), Thời hạn hợp đồng (12 tháng), Ngày kết thúc (30/09/2027), Tiền thuê phòng thỏa thuận (3.800.000 VNĐ/tháng), Tiền đặt cọc giữ phòng (3.800.000 VNĐ), Kỳ hạn thanh toán (Ngày 05 hàng tháng), Chu kỳ thanh toán (1 tháng/lần)."),
            ("text", "7. Hệ thống tự động nạp bảng danh sách các dịch vụ đăng ký kèm theo phòng để chủ trọ kiểm tra và chọn lựa:"),
            ("table",
                ["Chọn", "Mã DV", "Tên dịch vụ", "Đơn giá (VNĐ)", "Đơn vị tính", "Chỉ số ban đầu"],
                [
                    ["[x]", "DV01", "Điện sinh hoạt", "3.800", "kWh (Số)", "Công tơ bắt đầu: 1420"],
                    ["[x]", "DV02", "Nước sinh hoạt", "30.000", "Khối (m3)", "Đồng hồ bắt đầu: 85"],
                    ["[x]", "DV03", "Internet Wifi", "100.000", "Phòng/Tháng", "Cố định"],
                    ["[x]", "DV04", "Vệ sinh & Rác", "50.000", "Người/Tháng", "2 người"],
                    ["[ ]", "DV05", "Phí gửi xe", "100.000", "Xe/Tháng", "Chưa đăng ký"]
                ],
                [0.6, 0.8, 1.5, 1.2, 1.2, 1.7]
            ),
            ("text", "8. Chủ trọ kiểm tra các điều khoản cam kết chung và bấm nút 'Tạo và Ký hợp đồng'."),
            ("text", "9. Hệ thống kiểm tra dữ liệu, tự động sinh Mã hợp đồng (HĐ-2026-P102), lưu hợp đồng ở trạng thái 'Đang hiệu lực', cập nhật trạng thái phòng P102 thành 'Đang thuê', và tự động tạo phiếu thu tiền cọc (3.800.000 VNĐ)."),
            ("text", "10. Hệ thống hiển thị thông báo thành công và cung cấp nút 'Tải file hợp đồng PDF' cùng nút 'Quay về danh sách hợp đồng'.")
        ],
        "ngoai_le": [
            "3. Phòng được chọn đang có hợp đồng khác còn hiệu lực chưa thanh lý, hệ thống báo lỗi: 'Phòng P102 hiện đang có hợp đồng hoạt động, không thể tạo hợp đồng mới'.",
            "6. Ngày kết thúc hợp đồng trước hoặc bằng ngày bắt đầu hợp đồng, hệ thống hiển thị cảnh báo: 'Thời hạn hợp đồng không hợp lệ, ngày kết thúc phải sau ngày bắt đầu'.",
            "7. Chủ trọ chưa nhập chỉ số công tơ điện/nước ban đầu cho dịch vụ tính theo số đo, hệ thống hiển thị thông báo: 'Vui lòng nhập chỉ số công tơ điện và nước ban đầu trước khi lưu hợp đồng'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 6: Tính tiền phòng & Lập hóa đơn hàng tháng
    # -------------------------------------------------------------
    {
        "stt": 6,
        "role": "Chủ trọ",
        "chuc_nang": "Tính tiền phòng theo tháng (CRUD Hóa đơn tháng)",
        "use_case": "Monthly Meter Reading & Billing Calculation (Ghi chỉ số điện nước và lập hóa đơn thu tiền)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Các phòng trọ đang có hợp đồng thuê hiệu lực; đã đến kỳ chốt số liệu hàng tháng.",
        "hau_dieu_kien": "Hóa đơn tiền phòng tháng được khởi tạo, tính toán chính xác tổng số tiền và gửi thông báo tới khách thuê.",
        "kich_ban_chinh": [
            ("text", "1. Vào ngày chốt tiền hàng tháng (ví dụ ngày 30), chủ trọ vào mục 'Tính tiền phòng & Hóa đơn'."),
            ("text", "2. Hệ thống hiển thị bộ lọc: Tòa nhà (Ánh Dương), Tháng tính cước (Tháng 10/2026), nút 'Ghi chỉ số nhanh cả tòa', nút 'Lập hóa đơn từng phòng', và bảng danh sách trạng thái chốt số của các phòng:"),
            ("table",
                ["Mã phòng", "Khách đại diện", "Số điện cũ", "Số điện mới", "Số nước cũ", "Số nước mới", "Tổng tiền tạm tính (VNĐ)", "Trạng thái hóa đơn", "Thao tác"],
                [
                    ["P101", "Nguyễn Văn An", "1250", "1380", "110", "122", "4.654.000", "Chờ lập hóa đơn", "Nhập chỉ số"],
                    ["P102", "Phạm Minh Đức", "1420", "---", "85", "---", "0", "Chưa nhập chỉ số", "Nhập chỉ số"],
                    ["P201", "Lê Văn Cường", "890", "995", "45", "53", "5.109.000", "Đã gửi hóa đơn", "Xem hóa đơn"]
                ],
                [0.7, 1.2, 0.8, 0.8, 0.8, 0.8, 1.2, 1.2, 1.0]
            ),
            ("text", "3. Chủ trọ bấm nút 'Nhập chỉ số' tại hàng phòng P102."),
            ("text", "4. Hệ thống hiển thị Form chốt chỉ số và lập hóa đơn phòng P102 gồm: Chỉ số điện cũ (khóa cứng 1420), Ô nhập chỉ số điện mới (*), Chỉ số nước cũ (khóa cứng 85), Ô nhập chỉ số nước mới (*), Chi phí phát sinh/giảm trừ (nếu có), Ghi chú hóa đơn."),
            ("text", "5. Chủ trọ điền: Chỉ số điện mới: 1535 (tiêu thụ 115 số), Chỉ số nước mới: 94 (tiêu thụ 9 khối), Chi phí phát sinh: 0."),
            ("text", "6. Chủ trọ bấm nút 'Tính toán chi phí'."),
            ("text", "7. Hệ thống tự động tính toán chi tiết từng khoản mục và hiển thị bảng chiết tính chi phí minh bạch:"),
            ("table",
                ["Khoản mục", "Số lượng / Chỉ số", "Đơn giá (VNĐ)", "Thành tiền (VNĐ)", "Ghi chú"],
                [
                    ["Tiền thuê phòng P102", "1 tháng", "3.800.000", "3.800.000", "Giá cố định theo hợp đồng"],
                    ["Tiền điện sinh hoạt", "115 kWh (1535 - 1420)", "3.800", "437.000", "Tính theo công tơ"],
                    ["Tiền nước sinh hoạt", "9 m3 (94 - 85)", "30.000", "270.000", "Tính theo đồng hồ"],
                    ["Internet Wifi", "1 phòng", "100.000", "100.000", "Cố định phòng"],
                    ["Phí vệ sinh & rác", "2 người", "50.000", "100.000", "50k/người x 2 người"],
                    ["TỔNG CỘNG HÓA ĐƠN", "", "", "4.707.000", "Bằng chữ: Bốn triệu bảy trăm linh bảy nghìn đồng"]
                ],
                [1.5, 1.5, 1.1, 1.1, 1.8]
            ),
            ("text", "8. Chủ trọ kiểm tra tính chính xác và bấm nút 'Phát hành và Gửi thông báo hóa đơn'."),
            ("text", "9. Hệ thống lưu hóa đơn mã HD-202610-P102 với trạng thái 'Chờ thanh toán', hạn thanh toán là ngày 05/11/2026."),
            ("text", "10. Hệ thống tự động gửi thông báo chi tiết hóa đơn kèm mã QR chuyển khoản ngân hàng tới tài khoản của khách thuê đại diện (UID208) trên ứng dụng.")
        ],
        "ngoai_le": [
            "5. Chủ trọ nhập chỉ số điện mới (1400) nhỏ hơn chỉ số cũ (1420), hệ thống chặn lại và báo lỗi: 'Chỉ số mới không được nhỏ hơn chỉ số cũ của tháng trước'.",
            "5. Số điện tiêu thụ tăng đột biến vượt quá 500% so với tháng trước (ví dụ tiêu thụ 800 số điện), hệ thống hiển thị cảnh báo vàng: 'Cảnh báo: Lượng điện tiêu thụ tăng bất thường, vui lòng kiểm tra lại số liệu công tơ thực tế trước khi xác nhận'.",
            "8. Chủ trọ bấm 'Lưu nháp', hệ thống lưu lại các chỉ số đã nhập mà chưa phát hành hóa đơn và chưa gửi thông báo đến khách thuê."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 7: Xác nhận thanh toán hóa đơn
    # -------------------------------------------------------------
    {
        "stt": 7,
        "role": "Chủ trọ",
        "chuc_nang": "Xác nhận thanh toán hóa đơn (CRUD Hóa đơn tháng)",
        "use_case": "Confirm Invoice Payment (Quản lý thu tiền và xác nhận gạch nợ)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Đã có các hóa đơn ở trạng thái 'Chờ thanh toán' hoặc 'Quá hạn thanh toán'.",
        "hau_dieu_kien": "Hóa đơn được chuyển sang trạng thái 'Đã thanh toán', ghi nhận vào sổ quỹ doanh thu.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ vào mục 'Sổ thu tiền & Quản lý hóa đơn'."),
            ("text", "2. Hệ thống hiển thị thanh thống kê tổng quan: Tổng tiền cần thu tháng này, Đã thu, Còn phải thu, cùng bảng danh sách hóa đơn theo trạng thái:"),
            ("table",
                ["Mã hóa đơn", "Phòng", "Khách đại diện", "Kỳ cước", "Số tiền (VNĐ)", "Hạn nộp", "Trạng thái", "Thao tác"],
                [
                    ["HD-202610-P101", "P101", "Nguyễn Văn An", "10/2026", "4.654.000", "05/11/2026", "Đã thanh toán", "Xem phiếu thu"],
                    ["HD-202610-P102", "P102", "Phạm Minh Đức", "10/2026", "4.707.000", "05/11/2026", "Chờ thanh toán", "Xác nhận thu tiền"],
                    ["HD-202610-P202", "P202", "Hoàng Văn Tuấn", "10/2026", "3.950.000", "01/11/2026", "Quá hạn 3 ngày", "Nhắc nợ | Thu tiền"]
                ],
                [1.2, 0.6, 1.2, 0.7, 1.1, 0.9, 1.1, 1.2]
            ),
            ("text", "3. Khách thuê phòng P102 đóng tiền trực tiếp bằng tiền mặt hoặc chuyển khoản đến tài khoản ngân hàng của chủ trọ, chủ trọ bấm nút 'Xác nhận thu tiền' tại dòng của P102."),
            ("text", "4. Hệ thống hiển thị Form xác nhận thu tiền gồm: Mã hóa đơn, Tên phòng, Số tiền phải thu (4.707.000 VNĐ), Số tiền thực thu (*), Phương thức thanh toán (Dropdown: Chuyển khoản ngân hàng / Tiền mặt), Ngày thu tiền (mặc định ngày hiện tại), Mã giao dịch ngân hàng (tùy chọn), Ghi chú, Nút 'Hủy' và nút 'Xác nhận thanh toán'."),
            ("text", "5. Chủ trọ chọn: Phương thức: 'Chuyển khoản ngân hàng', Số tiền thực thu: 4.707.000 VNĐ, Ghi chú: 'Đã nhận chuyển khoản MB Bank'."),
            ("text", "6. Chủ trọ bấm nút 'Xác nhận thanh toán'."),
            ("text", "7. Hệ thống cập nhật trạng thái hóa đơn HD-202610-P102 từ 'Chờ thanh toán' sang 'Đã thanh toán', ghi nhận 1 giao dịch thu tiền vào sổ quỹ, và gửi thông báo xác nhận 'Chủ nhà đã xác nhận thanh toán hóa đơn tháng 10/2026' đến ứng dụng của khách thuê."),
            ("text", "8. Bảng danh sách hóa đơn tự động cập nhật lại trạng thái thành 'Đã thanh toán' kèm nút 'Xem / In biên lai'.")
        ],
        "ngoai_le": [
            "4. Khách thuê chỉ trả một phần tiền (ví dụ trả trước 2.000.000 VNĐ), chủ trọ nhập số tiền thực thu là 2.000.000 VNĐ; hệ thống ghi nhận thanh toán 1 phần và chuyển trạng thái hóa đơn thành 'Thanh toán một phần (Còn nợ: 2.707.000 VNĐ)'.",
            "6. Chủ trọ nhập số tiền thực thu bằng 0 hoặc để trống, hệ thống báo lỗi: 'Số tiền thu không hợp lệ, vui lòng nhập số tiền thực thu lớn hơn 0'.",
            "7. Hóa đơn quá hạn thanh toán lâu ngày, chủ trọ bấm nút 'Nhắc nợ', hệ thống tự động gửi thông báo đẩy nhắc nợ kèm tin nhắn SMS/Zalo tới khách thuê."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 8: Tiếp nhận và xử lý khiếu nại của khách thuê
    # -------------------------------------------------------------
    {
        "stt": 8,
        "role": "Chủ trọ",
        "chuc_nang": "Khiếu nại (Tiếp nhận & Xử lý khiếu nại)",
        "use_case": "Handle Tenant Complaints (Tiếp nhận và cập nhật tiến độ giải quyết sự cố, khiếu nại)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Khách thuê đã gửi khiếu nại hoặc báo cáo sự cố qua ứng dụng.",
        "hau_dieu_kien": "Khiếu nại được tiếp nhận, xử lý, cập nhật trạng thái và phản hồi minh bạch tới khách thuê.",
        "kich_ban_chinh": [
            ("text", "1. Chủ trọ nhận được thông báo có phản ánh sự cố mới từ khách thuê, chủ trọ bấm vào mục 'Khiếu nại & Sự cố' trên menu."),
            ("text", "2. Hệ thống hiển thị bảng danh sách các khiếu nại/báo hỏng gồm bộ lọc Tình trạng (Mới gửi, Đang xử lý, Đã hoàn thành, Từ chối), bộ lọc Tòa nhà và danh sách chi tiết:"),
            ("table",
                ["Mã KN", "Phòng", "Người gửi", "Loại sự cố", "Tiêu đề khiếu nại", "Ngày gửi", "Mức ưu tiên", "Trạng thái", "Thao tác"],
                [
                    ["KN101", "P102", "Phạm Minh Đức", "Hỏng thiết bị", "Điều hòa chảy nước và không mát", "02/10/2026", "Cao", "Mới gửi", "Xem chi tiết"],
                    ["KN098", "P201", "Lê Văn Cường", "Điện nước", "Áp lực nước vòi hoa sen yếu", "28/09/2026", "Trung bình", "Đang xử lý", "Xem chi tiết"],
                    ["KN095", "P301", "Vũ Hà My", "Trật tự chung", "Phòng bên cạnh gây ồn sau 23h", "25/09/2026", "Thấp", "Đã giải quyết", "Xem chi tiết"]
                ],
                [0.7, 0.6, 1.1, 1.0, 1.8, 0.9, 0.8, 1.0, 1.0]
            ),
            ("text", "3. Chủ trọ bấm nút 'Xem chi tiết' tại khiếu nại KN101 của phòng P102."),
            ("text", "4. Hệ thống hiển thị trang chi tiết khiếu nại gồm: Thông tin người gửi (Phạm Minh Đức - P102 - 0977888999), Thời gian gửi, Phân loại: Hỏng thiết bị điện lạnh, Mô tả chi tiết của khách thuê ('Điều hòa bật 16 độ nhưng chỉ có gió, nước chảy nhỏ giọt xuống sàn gỗ từ đêm qua'), Các ảnh/video đính kèm hiện trạng thiết bị, Lịch sử trao đổi, và Form xử lý trạng thái gồm Dropdown trạng thái (Mới gửi, Tiếp nhận/Đang xử lý, Đã hoàn thành, Từ chối), Ô nhập phản hồi của chủ nhà, và Nút 'Cập nhật tiến độ'."),
            ("text", "5. Chủ trọ liên hệ thợ sửa điện lạnh và cập nhật: Chuyển trạng thái sang 'Đang xử lý', Nhập ghi chú phản hồi: 'Chủ nhà đã hẹn thợ bảo dưỡng điều hòa đến kiểm tra vào lúc 14h00 chiều nay 02/10, bạn vui lòng sắp xếp người ở phòng đón thợ nhé'."),
            ("text", "6. Chủ trọ bấm nút 'Cập nhật tiến độ'."),
            ("text", "7. Hệ thống cập nhật trạng thái khiếu nại trong cơ sở dữ liệu, đồng thời bắn thông báo đẩy tức thời tới ứng dụng của khách thuê Phạm Minh Đức."),
            ("text", "8. Chiều cùng ngày sau khi thợ sửa xong, chủ trọ mở lại KN101, chuyển trạng thái thành 'Đã giải quyết', nhập nội dung 'Thợ đã bổ sung gas và vệ sinh lưới lọc điều hòa, thiết bị hoạt động bình thường' và bấm 'Lưu hoàn tất'."),
            ("text", "9. Hệ thống đóng khiếu nại và hiển thị form đánh giá hài lòng cho khách thuê khi mở lại app.")
        ],
        "ngoai_le": [
            "4. Khiếu nại có tính chất vô lý hoặc vi phạm quy định (ví dụ khách tự ý đập phá), chủ trọ chọn trạng thái 'Từ chối giải quyết' và nhập lý do từ chối cụ thể để gửi thông báo giải trình cho khách.",
            "6. Chủ trọ không nhập nội dung phản hồi mà bấm cập nhật trạng thái, hệ thống nhắc nhở: 'Vui lòng nhập nội dung ghi chú phản hồi cho khách thuê'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 9: Xử lý trả phòng và thanh lý hợp đồng
    # -------------------------------------------------------------
    {
        "stt": 9,
        "role": "Chủ trọ",
        "chuc_nang": "Xử lý trả phòng (Thanh lý hợp đồng)",
        "use_case": "Check-out & Contract Termination (Kiểm tra phòng, khấu trừ cọc, chốt thanh lý)",
        "actor": "Chủ trọ, Khách thuê",
        "tien_dieu_kien": "Khách thuê hết hạn hợp đồng hoặc gửi yêu cầu trả phòng trước thời hạn.",
        "hau_dieu_kien": "Hợp đồng được thanh lý, tiền cọc được quyết toán, trạng thái phòng chuyển về 'Còn trống'.",
        "kich_ban_chinh": [
            ("text", "1. Khách thuê báo trả phòng, chủ trọ vào mục 'Quản lý phòng' -> chọn phòng cần trả (Ví dụ P202) -> bấm nút 'Xử lý trả phòng'."),
            ("text", "2. Hệ thống hiển thị Form nghiệm thu trả phòng và thanh lý hợp đồng gồm 4 phần: Thông tin hợp đồng gốc (HĐ-2025-P202 – Tiền cọc gốc: 3.500.000 VNĐ), Chốt chỉ số điện nước cuối cùng, Bảng nghiệm thu hư hại thiết bị (nếu có), và Bảng quyết toán tài chính hoàn cọc."),
            ("text", "3. Tại mục 'Chốt điện nước': Chủ trọ nhập chỉ số điện cuối: 1050 (tiêu thụ 25 số tính từ hóa đơn trước), chỉ số nước cuối: 68 (tiêu thụ 2 khối). Hệ thống tính tiền điện nước còn thiếu: (25 x 3.800) + (2 x 30.000) = 155.000 VNĐ."),
            ("text", "4. Tại mục 'Kiểm tra tài sản phòng': Hệ thống hiển thị danh sách trang thiết bị bàn giao ban đầu kèm checkbox tình trạng. Chủ trọ phát hiện hỏng 1 cánh cửa tủ quần áo và mất 1 chìa khóa cổng vân tay. Chủ trọ bấm 'Thêm mục khấu trừ'."),
            ("text", "5. Hệ thống hiển thị bảng danh sách các khoản khấu trừ đền bù:"),
            ("table",
                ["STT", "Khoản mục khấu trừ", "Lý do / Mô tả", "Chi phí khấu trừ (VNĐ)", "Tùy chọn"],
                [
                    ["1", "Sửa cánh tủ quần áo", "Bản lề bị gãy do tác động mạnh", "200.000", "Xóa"],
                    ["2", "Làm lại thẻ từ / chìa khóa", "Làm mất 1 thẻ từ thang máy", "100.000", "Xóa"],
                    ["3", "Tiền điện nước chốt ngày trả", "25 số điện + 2 khối nước", "155.000", "Khóa cố định"]
                ],
                [0.6, 2.0, 2.4, 1.4, 0.8]
            ),
            ("text", "6. Hệ thống tự động tổng hợp bảng quyết toán hoàn trả tiền cọc cho khách thuê:"),
            ("table",
                ["Mục thanh toán", "Công thức tính toán", "Số tiền (VNĐ)"],
                [
                    ["Tiền đặt cọc ban đầu", "Tiền cọc giữ theo hợp đồng", "+ 3.500.000"],
                    ["Hóa đơn tiền phòng còn nợ cũ", "Tháng 09/2026 chưa thanh toán", "- 0"],
                    ["Tổng các khoản khấu trừ đền bù", "Điện nước cuối + Sửa tủ + Thẻ từ", "- 455.000"],
                    ["SỐ TIỀN THỰC HOÀN TRẢ KHÁCH", "3.500.000 - 455.000", "= 3.045.000"]
                ],
                [2.4, 2.6, 1.8]
            ),
            ("text", "7. Hai bên kiểm tra, đồng thuận với số tiền hoàn lại là 3.045.000 VNĐ. Chủ trọ thực hiện chuyển khoản hoàn tiền cho khách và bấm nút 'Xác nhận hoàn tất thanh lý phòng'."),
            ("text", "8. Hệ thống chuyển trạng thái hợp đồng thành 'Đã thanh lý', cập nhật trạng thái phòng P202 thành 'Còn trống', hủy liên kết khách thuê cũ khỏi phòng, và sinh biên bản thanh lý hợp đồng dạng file PDF.")
        ],
        "ngoai_le": [
            "4. Khách thuê trả phòng trước hạn vi phạm điều khoản hợp đồng cam kết ở tối thiểu 6 tháng, hệ thống tự động tích chọn điều khoản: 'Mất toàn bộ tiền cọc do phá vỡ hợp đồng trước hạn (Khấu trừ 100% tiền cọc)'.",
            "6. Tổng chi phí hỏng hóc và tiền nợ lớn hơn số tiền cọc (Ví dụ nợ 4.000.000 VNĐ mà cọc chỉ có 3.500.000 VNĐ), hệ thống hiển thị: 'Khách thuê phải nộp thêm: 500.000 VNĐ' kèm phiếu thu bổ sung."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 10: Xem Dashboard & Báo cáo thống kê chủ trọ
    # -------------------------------------------------------------
    {
        "stt": 10,
        "role": "Chủ trọ",
        "chuc_nang": "Dashboard (Thống kê báo cáo chủ trọ)",
        "use_case": "Landlord Dashboard & Analytics (Theo dõi doanh thu, công nợ, tỷ lệ lấp đầy)",
        "actor": "Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đăng nhập thành công vào hệ thống.",
        "hau_dieu_kien": "Số liệu trực quan về doanh thu, tình trạng phòng và công nợ được hiển thị đầy đủ.",
        "kich_ban_chinh": [
            ("text", "1. Sau khi đăng nhập, hệ thống tự động điều hướng chủ trọ tới màn hình 'Dashboard tổng quan'."),
            ("text", "2. Hệ thống hiển thị thanh chọn kỳ báo cáo (Dropdown: Tháng này, Quý này, Năm nay, hoặc Tùy chọn khoảng ngày) và bộ lọc Tòa nhà (Tất cả tòa / Chọn từng tòa)."),
            ("text", "3. Hệ thống hiển thị 4 thẻ chỉ số nhanh (KPI Cards):"),
            ("table",
                ["Chỉ số KPI", "Giá trị thực tế", "So với tháng trước", "Ý nghĩa"],
                [
                    ["Tổng doanh thu tháng", "85.600.000 VNĐ", "+ 12.5%", "Tổng tiền phòng và dịch vụ đã thu thực tế"],
                    ["Tỷ lệ lấp đầy phòng", "92% (46/50 phòng)", "+ 4.0%", "46 phòng đang ở, 3 phòng trống, 1 sửa chữa"],
                    ["Tổng tiền nợ đọng", "8.657.000 VNĐ", "- 15.2%", "Tiền từ 2 phòng quá hạn thanh toán cước"],
                    ["Khiếu nại chưa xử lý", "1 khiếu nại", "- 2 việc", "Sự cố điều hòa P102 đang tiếp nhận"]
                ],
                [1.6, 1.5, 1.2, 2.5]
            ),
            ("text", "4. Phía dưới thẻ chỉ số, hệ thống hiển thị bảng danh sách các phòng đang nợ tiền trọ cần đôn đốc:"),
            ("table",
                ["Phòng", "Tòa nhà", "Khách đại diện", "Số điện thoại", "Số tiền nợ (VNĐ)", "Số ngày trễ hạn", "Thao tác nhanh"],
                [
                    ["P202", "Ánh Dương", "Hoàng Văn Tuấn", "0904333222", "3.950.000", "Trễ 3 ngày", "Nhắc nợ SMS / Call"],
                    ["P304", "Bách Khoa Plaza", "Vũ Đình Trọng", "0981999888", "4.707.000", "Trễ 5 ngày", "Nhắc nợ SMS / Call"]
                ],
                [0.8, 1.4, 1.4, 1.1, 1.2, 1.0, 1.3]
            ),
            ("text", "5. Chủ trọ bấm chọn nút 'Xuất báo cáo tài chính Excel' để tải dữ liệu thống kê phục vụ quyết toán thuế và lưu trữ cá nhân."),
            ("text", "6. Hệ thống xuất file Excel chi tiết các nguồn thu chi trong tháng và tải về máy tính của chủ trọ.")
        ],
        "ngoai_le": [
            "2. Chủ trọ chọn khoảng ngày không hợp lệ (Ngày bắt đầu sau ngày kết thúc), hệ thống báo lỗi: 'Khoảng thời gian thống kê không hợp lệ'.",
            "5. Không có kết nối mạng ổn định khi xuất file, hệ thống thông báo: 'Tải báo cáo thất bại, vui lòng kiểm tra kết nối mạng và thử lại'."
        ]
    }
]

print(f"Loaded {len(USECASES_LANDLORD)} use cases for Landlord.")

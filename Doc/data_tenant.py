# -*- coding: utf-8 -*-
"""
Dữ liệu đặc tả chi tiết 8 Use Case của Role: NGƯỜI THUÊ (Tenant)
Đặc tả chi tiết nghiệp vụ tìm kiếm, ghép phòng (có phòng / chưa có phòng),
duyệt nhóm, cập nhật lối sống, phòng ảo, liên kết tài khoản...
Chuẩn template, chữ đen nền trắng, bảng mô phỏng dữ liệu chi tiết từng bước.
"""

USECASES_TENANT = [
    # -------------------------------------------------------------
    # USE CASE 11: Tìm kiếm phòng trọ & bài đăng ở ghép
    # -------------------------------------------------------------
    {
        "stt": 11,
        "role": "Người thuê",
        "chuc_nang": "Tìm kiếm (Tìm kiếm phòng trọ & bạn ở ghép)",
        "use_case": "Search Room & Roommate Posts (Tìm phòng và tìm nhóm ghép theo vị trí, ngân sách, lối sống)",
        "actor": "Người thuê, Khách vãng lai",
        "tien_dieu_kien": "Người dùng truy cập vào trang chủ hoặc trang tìm kiếm của hệ thống.",
        "hau_dieu_kien": "Danh sách các phòng trọ hoặc bài đăng tìm bạn ở ghép phù hợp được hiển thị trực quan.",
        "kich_ban_chinh": [
            ("text", "1. Người dùng bấm chọn mục 'Tìm kiếm phòng & Ở ghép' trên thanh điều hướng chính."),
            ("text", "2. Hệ thống hiển thị giao diện tìm kiếm gồm: Thanh tìm kiếm từ khóa địa điểm (Quận/Huyện, Tên trường đại học, Tên đường), Tab chuyển đổi chế độ ('Tìm phòng trọ nguyên căn' / 'Tìm người ở ghép'), Bộ lọc nâng cao (Khoảng giá, Loại phòng, Bán kính bản đồ, Tiêu chí lối sống), và Bản đồ số hiển thị vị trí các tin đăng."),
            ("text", "3. Người dùng chọn tab 'Tìm người ở ghép', nhập từ khóa khu vực 'Cầu Giấy' và thiết lập khoảng giá từ 1.500.000 VNĐ đến 2.500.000 VNĐ/người/tháng."),
            ("text", "4. Người dùng mở bộ lọc 'Tiêu chí lối sống' và chọn: Giới tính: Nam, Không hút thuốc: Có, Thói quen đi ngủ: Trước 24h, Thú cưng: Không nuôi."),
            ("text", "5. Người dùng bấm nút 'Áp dụng bộ lọc và Tìm kiếm'."),
            ("text", "6. Hệ thống xử lý truy vấn dữ liệu, tính toán độ phù hợp tiêu chí và hiển thị danh sách các bài đăng kết quả dạng bảng tóm tắt:"),
            ("table",
                ["Mã bài", "Tiêu đề bài đăng", "Khu vực / Địa chỉ", "Giá share (VNĐ/người)", "Số người đang tìm", "Độ khớp lối sống", "Loại phòng", "Thao tác"],
                [
                    ["BG01", "Tìm 1 bạn nam ở ghép phòng khép kín đủ đồ", "Ngõ 80 Cầu Giấy, HN", "1.900.000", "Cần tìm 1 (Đã có 1)", "95% (Rất hợp)", "Có sẵn phòng", "Xem chi tiết"],
                    ["BG02", "Tìm bạn sinh viên cùng thuê nhà nguyên căn", "Ngõ 165 Cầu Giấy, HN", "2.200.000", "Cần tìm 2 (Đã có 1)", "88% (Khá hợp)", "Chưa có phòng", "Xem chi tiết"],
                    ["BG05", "Ghép phòng chung cư mini có ban công view đẹp", "Duy Tân, Cầu Giấy", "2.500.000", "Cần tìm 1 (Đã có 2)", "82% (Phù hợp)", "Có sẵn phòng", "Xem chi tiết"]
                ],
                [0.7, 2.2, 1.4, 1.2, 1.2, 1.1, 1.0, 1.0]
            ),
            ("text", "7. Người dùng bấm vào dòng bài đăng 'BG01 - Tìm 1 bạn nam ở ghép phòng khép kín đủ đồ'."),
            ("text", "8. Hệ thống điều hướng người dùng tới trang thông tin chi tiết của bài đăng BG01.")
        ],
        "ngoai_le": [
            "6. Không tìm thấy bài đăng nào thỏa mãn tất cả các tiêu chí lọc gắt gao, hệ thống hiển thị thông báo: 'Không có bài đăng nào khớp 100% với bộ lọc. Dưới đây là 5 bài đăng gợi ý có vị trí gần nhất với khu vực bạn tìm kiếm'.",
            "5. Người dùng nhập khoảng giá sai logic (Giá tối thiểu lớn hơn giá tối đa), hệ thống hiển thị cảnh báo: 'Khoảng giá không hợp lệ, vui lòng kiểm tra lại'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 12: Đăng bài tìm người ở ghép - Có phòng trọ
    # -------------------------------------------------------------
    {
        "stt": 12,
        "role": "Người thuê",
        "chuc_nang": "Đăng bài (Tìm bạn ở ghép - Đã có phòng trọ)",
        "use_case": "Create Roommate Post - Existing Room (Đăng tin tuyển bạn cùng phòng khi đã thuê phòng)",
        "actor": "Người thuê (Đã có phòng)",
        "tien_dieu_kien": "Người thuê đã đăng nhập tài khoản; đang ở một phòng trọ thực tế (có liên kết trên hệ thống hoặc tạo phòng ảo) và có nhu cầu chia sẻ chi phí.",
        "hau_dieu_kien": "Bài đăng tìm người ở ghép được công khai trên hệ thống kèm thông tin phòng và bảng lối sống sinh hoạt.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê đăng nhập vào hệ thống, bấm chọn nút 'Đăng bài tìm người ở ghép' tại góc trên màn hình."),
            ("text", "2. Hệ thống hiển thị lựa chọn loại hình đăng bài: (1) 'Tôi đã có phòng trọ, cần tìm người vào ở cùng' và (2) 'Tôi chưa có phòng, cần tìm bạn cùng tìm phòng & ở ghép'."),
            ("text", "3. Người thuê bấm chọn phương án (1) 'Tôi đã có phòng trọ, cần tìm người vào ở cùng'."),
            ("text", "4. Hệ thống hiển thị màn hình chọn nguồn thông tin phòng trọ: Lựa chọn A: 'Chọn phòng tôi đang liên kết trên hệ thống' hoặc Lựa chọn B: 'Tạo phòng ảo đại diện (Dành cho phòng trọ thuê ngoài chưa có trên hệ thống)'."),
            ("text", "5. Người thuê bấm chọn Lựa chọn A (Phòng P102 - Tòa nhà Ánh Dương, Cầu Giấy mà tài khoản đang được liên kết). Hệ thống tự động nạp toàn bộ thông tin gốc của phòng (Địa chỉ, Diện tích 28m2, Giá phòng 3.800.000 VNĐ, Danh mục tiện nghi có sẵn: Điều hòa, Nóng lạnh, Tủ lạnh, Kệ bếp)."),
            ("text", "6. Hệ thống hiển thị Form điền thông tin bài đăng ở ghép gồm 3 phần chính:"),
            ("text", "   a) Thông tin chi phí & tuyển dụng: Tiêu đề bài viết (*), Số lượng người cần tìm (*), Chi phí dự kiến mỗi người/tháng (Hệ thống gợi ý: 3.800.000 / 2 = 1.900.000 VNĐ), Phí dịch vụ chia theo đầu người, Ngày có thể dọn vào ở."),
            ("text", "   b) Album hình ảnh thực tế của phòng: Người dùng có thể sử dụng ảnh phòng có sẵn từ hệ thống hoặc tải thêm ảnh thực tế góc sinh hoạt, góc học tập/nấu nướng của cá nhân."),
            ("text", "   c) Bảng khảo sát lối sống & thói quen sinh hoạt của người đang ở (Bắt buộc) để thuật toán so khớp:"),
            ("table",
                ["Tiêu chí lối sống", "Lựa chọn của người đăng", "Mức độ quan trọng yêu cầu đối phương"],
                [
                    ["Giới tính", "Nam", "Bắt buộc"],
                    ["Nghề nghiệp / Tình trạng", "Sinh viên / Đi làm", "Linh hoạt"],
                    ["Giờ giấc thức - ngủ", "Ngủ sau 23h, thức dậy 7h sáng", "Tương đồng (không ồn ào đêm)"],
                    ["Thói quen hút thuốc lá", "Hoàn toàn không hút thuốc", "Bắt buộc không hút thuốc"],
                    ["Nuôi thú cưng (Chó/Mèo)", "Không nuôi thú cưng", "Ưu tiên không nuôi"],
                    ["Nấu ăn tại phòng", "Thường xuyên nấu ăn buổi tối", "Thoải mái cùng nấu"],
                    ["Khách tới chơi / Bạn bè", "Báo trước trước khi dẫn bạn về", "Đồng thuận tôn trọng riêng tư"]
                ],
                [2.2, 2.6, 2.2]
            ),
            ("text", "7. Người thuê nhập tiêu đề: 'Tìm 1 bạn nam gọn gàng ở ghép phòng P102 Ánh Dương đầy đủ đồ Cầu Giấy', giá share 1.900.000 VNĐ/tháng, số người cần tìm: 1."),
            ("text", "8. Người thuê kiểm tra lại toàn bộ nội dung và bấm nút 'Xuất bản bài đăng'."),
            ("text", "9. Hệ thống kiểm duyệt nội dung tự động, cấp Mã bài đăng BG01, chuyển trạng thái bài viết thành 'Đang mở (Cần tìm 1 người)' và hiển thị thông báo 'Đăng bài thành công! Tin của bạn đã hiển thị công khai trên bảng tin tìm bạn ở ghép'.")
        ],
        "ngoai_le": [
            "4. Người thuê chọn Lựa chọn B ('Tạo phòng ảo'): Hệ thống hiển thị form cho phép người thuê tự nhập địa chỉ nhà trọ thực tế, giá phòng, diện tích và tự tải lên ít nhất 3 ảnh thực tế của phòng trọ trước khi chuyển sang bước khai báo lối sống.",
            "6. Người thuê để trống bảng khảo sát lối sống sinh hoạt, hệ thống cảnh báo đỏ: 'Vui lòng hoàn thành bảng tiêu chí lối sống để đảm bảo tìm được bạn cùng phòng phù hợp nhất'.",
            "7. Giá chia sẻ người thuê nhập lớn hơn 100% tổng tiền phòng, hệ thống cảnh báo: 'Giá đóng góp mỗi người không được vượt quá tổng tiền thuê phòng gốc'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 13: Đăng bài tìm người ở ghép - Chưa có phòng trọ
    # -------------------------------------------------------------
    {
        "stt": 13,
        "role": "Người thuê",
        "chuc_nang": "Đăng bài (Tìm bạn ở ghép - Chưa có phòng trọ)",
        "use_case": "Create Roommate Post - Virtual Room / Map Radius (Đăng tin tìm đồng hương, tìm bạn để cùng đi tìm phòng)",
        "actor": "Người thuê (Chưa có phòng)",
        "tien_dieu_kien": "Người thuê đã đăng nhập, chưa có chỗ ở cố định hoặc chuẩn bị chuyển trường/chuyển nơi làm việc.",
        "hau_dieu_kien": "Bài đăng tìm bạn cùng thuê phòng được tạo lập gắn với tọa độ vị trí mong muốn và bán kính tìm kiếm trên bản đồ.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê đăng nhập vào hệ thống và chọn 'Đăng bài tìm người ở ghép'."),
            ("text", "2. Tại màn hình lựa chọn loại hình, người thuê bấm chọn phương án (2) 'Tôi chưa có phòng, cần tìm bạn cùng tìm phòng & ở ghép'."),
            ("text", "3. Hệ thống hiển thị Form đăng tin tìm bạn cùng chí hướng gồm 3 khu vực: Thiết lập vị trí mong muốn trên bản đồ số, Thông tin ngân sách & số lượng, và Bảng tiêu chí lối sống cá nhân."),
            ("text", "4. Tại khu vực bản đồ: Hệ thống hiển thị bản đồ tương tác (Google Maps / OpenStreetMap). Người thuê nhập địa chỉ cơ quan/trường học làm mốc: 'Trường Đại học Bách Khoa Hà Nội'."),
            ("text", "5. Bản đồ tự động ghim tọa độ tâm tại Đại học Bách Khoa. Người thuê chọn thanh trượt Bán kính tìm kiếm quanh vị trí: 3.0 km (Hệ thống tự động vẽ một vòng tròn bán kính 3km bao trùm khu vực Bách Khoa, Hai Bà Trưng, Đống Đa)."),
            ("text", "6. Tại khu vực ngân sách & số lượng: Người thuê nhập Ngân sách tối đa mỗi người có thể chi trả: '2.000.000 VNĐ/tháng', Số lượng bạn cần tìm để lập nhóm: 2 người (để cùng thuê căn phòng 3 người tầm 6 triệu), Dự kiến ngày bắt đầu đi xem phòng và dọn vào: 15/10/2026."),
            ("text", "7. Tại khu vực tiêu chí lối sống cá nhân: Người thuê hoàn thành bảng thông tin khảo sát:"),
            ("table",
                ["Tiêu chuẩn mong muốn", "Thông tin của bản thân", "Yêu cầu đối với bạn cùng tìm phòng"],
                [
                    ["Quê quán / Khu vực", "Thanh Hóa (ưu tiên đồng hương)", "Linh hoạt, hòa đồng"],
                    ["Trường / Ngành nghề", "Sinh viên năm 2 ĐHBK HN", "Ưu tiên sinh viên các trường lân cận"],
                    ["Ngân sách phòng dự kiến", "1.800.000 - 2.200.000 VNĐ/người", "Đồng đều tài chính, cam kết lâu dài"],
                    ["Yêu cầu phòng trọ tương lai", "Có điều hòa, an ninh tốt, giờ tự do", "Cùng đi xem phòng và ký chung"]
                ],
                [2.2, 2.4, 2.4]
            ),
            ("text", "8. Người thuê nhập tiêu đề bài viết: 'Tìm 1-2 bạn sinh viên Bách Khoa / Kinh Tế cùng lập nhóm tìm trọ quanh Hai Bà Trưng' và bấm 'Đăng bài tìm nhóm'."),
            ("text", "9. Hệ thống kiểm duyệt, gán mã bài đăng BG02 (Loại tin: Chưa có phòng - Vị trí bản đồ Bách Khoa bán kính 3km), hiển thị tin tức trên trang tìm kiếm và bản đồ ghép phòng."),
            ("text", "10. Hệ thống hiển thị thông báo thành công và điều hướng về trang quản lý bài đăng cá nhân.")
        ],
        "ngoai_le": [
            "4. Bản đồ không định vị được địa chỉ nhập vào, hệ thống yêu cầu: 'Không tìm thấy địa điểm, vui lòng ghim điểm trực tiếp trên bản đồ hoặc chọn quận/huyện cụ thể'.",
            "6. Người thuê nhập ngân sách bằng 0 hoặc để trống tiêu đề, hệ thống báo lỗi: 'Vui lòng nhập ngân sách dự kiến và tiêu đề bài viết'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 14: Xin gia nhập nhóm ở ghép
    # -------------------------------------------------------------
    {
        "stt": 14,
        "role": "Người thuê",
        "chuc_nang": "Xin gia nhập nhóm (Ứng tuyển ở ghép)",
        "use_case": "Apply to Roommate Group (Gửi đơn ứng tuyển và khảo sát lối sống tới chủ bài đăng)",
        "actor": "Người thuê (Ứng viên)",
        "tien_dieu_kien": "Người thuê đã đăng nhập tài khoản; bài đăng ở ghép đang ở trạng thái 'Đang mở (Còn chỗ)'.",
        "hau_dieu_kien": "Hồ sơ ứng tuyển kèm bảng thông tin lối sống được chuyển đến danh sách chờ duyệt của chủ bài đăng.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê (ứng viên Nguyễn Văn Hùng - UID305) đang xem chi tiết bài đăng BG01 ('Tìm 1 bạn nam ở ghép phòng P102 Ánh Dương...')."),
            ("text", "2. Hệ thống hiển thị đầy đủ thông tin bài đăng, hình ảnh phòng, chi phí share (1.900.000 VNĐ/tháng), các tiện ích và bảng lối sống của người đang ở hiện tại."),
            ("text", "3. Phía dưới bài đăng, hệ thống hiển thị nút bấm nổi bật 'Tham gia nhóm ở ghép' kèm thông tin lưu ý: 'Bạn cần cung cấp thông tin cá nhân và lối sống để chủ phòng xét duyệt'."),
            ("text", "4. Ứng viên bấm vào nút 'Tham gia nhóm ở ghép'."),
            ("text", "5. Hệ thống hiển thị modal pop-up Form 'Hồ sơ ứng tuyển ở ghép' gồm 2 phần: Thông tin cá nhân giới thiệu bản thân và Bảng trả lời khảo sát lối sống sinh hoạt của ứng viên."),
            ("text", "6. Ứng viên kiểm tra thông tin cá nhân (Họ tên: Nguyễn Văn Hùng, Năm sinh: 2004, Quê quán: Hải Dương, Nghề nghiệp: Sinh viên năm 3 Đại học Giao thông Vận tải) và nhập lời nhắn gửi chủ phòng: 'Chào bạn, mình học ngay gần đường Cầu Giấy, tính tình gọn gàng, ít khi ở phòng ban ngày, rất mong muốn được ghép phòng cùng bạn!'."),
            ("text", "7. Ứng viên hoàn thành bảng khảo sát lối sống của bản thân:"),
            ("table",
                ["Tiêu chí khảo sát", "Câu trả lời của ứng viên", "Mức độ tự đánh giá"],
                [
                    ["Giới tính", "Nam", "Khớp yêu cầu"],
                    ["Thời gian ngủ đêm", "Khoảng 23h30 - 6h30", "Tương đồng"],
                    ["Hút thuốc lá", "Không hút thuốc", "Khớp yêu cầu 100%"],
                    ["Nuôi thú cưng", "Không nuôi", "Khớp yêu cầu 100%"],
                    ["Tần suất nấu ăn", "Chỉ nấu bữa tối đơn giản", "Hòa đồng"],
                    ["Dẫn bạn bè về phòng", "Chỉ thỉnh thoảng và luôn báo trước", "Tôn trọng không gian chung"]
                ],
                [2.0, 2.8, 2.2]
            ),
            ("text", "8. Ứng viên bấm nút 'Xác nhận gửi hồ sơ tham gia'."),
            ("text", "9. Hệ thống lưu đơn xin gia nhập mã YCGN-105 với trạng thái 'Chờ chủ phòng phê duyệt'."),
            ("text", "10. Hệ thống tự động tính điểm sơ bộ mức độ tương thích lối sống (Matching Score: 94%), đồng thời gửi thông báo đẩy và email tới chủ bài đăng: 'Có ứng viên Nguyễn Văn Hùng vừa xin gia nhập nhóm ở ghép của bạn với độ tương thích 94%!'."),
            ("text", "11. Màn hình của ứng viên chuyển nút 'Tham gia nhóm ở ghép' thành nút 'Đã gửi yêu cầu (Đang chờ duyệt)' để tránh gửi trùng lặp.")
        ],
        "ngoai_le": [
            "4. Ứng viên chính là chủ bài đăng, hệ thống ẩn nút tham gia và hiển thị 'Bạn là chủ bài đăng này'.",
            "4. Ứng viên đã từng gửi đơn ứng tuyển vào bài đăng này và đang chờ duyệt, hệ thống thông báo: 'Bạn đã gửi đơn xin gia nhập trước đó, vui lòng chờ chủ phòng phản hồi'.",
            "8. Ứng viên bỏ qua các câu hỏi bắt buộc trong bảng khảo sát, hệ thống hiển thị cảnh báo: 'Vui lòng hoàn thành các câu hỏi khảo sát lối sống trước khi gửi'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 15: Duyệt thành viên nhóm ở ghép
    # -------------------------------------------------------------
    {
        "stt": 15,
        "role": "Người thuê",
        "chuc_nang": "Duyệt thành viên nhóm (Quản lý nhóm ghép phòng)",
        "use_case": "Review & Approve Roommate Applicants (Xem ứng viên, so sánh lối sống, duyệt nhóm, cập nhật lối sống chung)",
        "actor": "Người thuê (Chủ bài đăng)",
        "tien_dieu_kien": "Chủ bài đăng nhận được các đơn xin gia nhập từ ứng viên.",
        "hau_dieu_kien": "Thành viên phù hợp được phê duyệt vào nhóm; thông tin lối sống sinh hoạt của bài đăng được cập nhật tổng hòa theo các thành viên; nhóm được chốt hoàn thành.",
        "kich_ban_chinh": [
            ("text", "1. Chủ bài đăng nhận được thông báo có ứng viên mới, bấm vào thông báo hoặc vào mục 'Quản lý bài đăng & Nhóm ghép'."),
            ("text", "2. Hệ thống hiển thị trang quản lý nhóm của bài đăng BG01, gồm thông tin phòng, tiến độ nhóm (Đã có: 1/2 người), và Bảng danh sách các ứng viên đang chờ duyệt:"),
            ("table",
                ["Mã Đơn", "Họ và tên ứng viên", "Năm sinh / Quê quán", "Công việc / Trường học", "Điểm tương thích", "Ngày nộp đơn", "Thao tác"],
                [
                    ["YCGN-105", "Nguyễn Văn Hùng", "2004 - Hải Dương", "SV ĐH Giao Thông Vận Tải", "94% (Rất hợp)", "02/10/2026", "Xem so sánh & Duyệt"],
                    ["YCGN-102", "Trần Đình Trọng", "2001 - Nghệ An", "Nhân viên văn phòng IT", "72% (Có khác biệt)", "01/10/2026", "Xem so sánh & Duyệt"]
                ],
                [0.9, 1.4, 1.3, 1.5, 1.2, 0.9, 1.3]
            ),
            ("text", "3. Chủ bài đăng bấm nút 'Xem so sánh & Duyệt' tại dòng ứng viên Nguyễn Văn Hùng (YCGN-105)."),
            ("text", "4. Hệ thống hiển thị bảng đối chiếu trực quan từng tiêu chí lối sống giữa Chủ phòng và Ứng viên:"),
            ("table",
                ["Tiêu chí sinh hoạt", "Chủ phòng (Phạm Minh Đức)", "Ứng viên (Nguyễn Văn Hùng)", "Mức độ hòa hợp"],
                [
                    ["Giờ ngủ đêm", "23h00 - 23h30", "23h30", "Hoàn toàn phù hợp"],
                    ["Hút thuốc lá", "Không hút thuốc", "Không hút thuốc", "Trùng khớp 100%"],
                    ["Thú cưng", "Không nuôi thú cưng", "Không nuôi thú cưng", "Trùng khớp 100%"],
                    ["Nấu ăn", "Thường xuyên nấu bữa tối", "Chỉ nấu bữa tối", "Dễ dàng chia sẻ bếp"],
                    ["Lời nhắn gửi", "Muốn tìm bạn ngủ sớm, giữ vệ sinh", "Ít ở phòng ban ngày, gọn gàng", "Đáp ứng tốt mong muốn"]
                ],
                [1.5, 1.8, 1.8, 1.9]
            ),
            ("text", "5. Thấy mức độ tương thích lối sống rất cao, chủ bài đăng bấm nút 'Đồng ý cho vào nhóm'."),
            ("text", "6. Hệ thống hiển thị hộp thoại xác nhận: 'Bạn có chắc chắn chấp thuận ứng viên Nguyễn Văn Hùng vào nhóm ở ghép phòng P102?'. Chủ bài đăng bấm 'Xác nhận'."),
            ("text", "7. Hệ thống cập nhật trạng thái đơn YCGN-105 thành 'Đã chấp thuận', bổ sung Nguyễn Văn Hùng vào danh sách thành viên chính thức của nhóm (Tiến độ nhóm: 2/2 người - Đã đủ người)."),
            ("text", "8. Hệ thống tự động cập nhật lại bảng thông tin lối sống sinh hoạt của bài đăng BG01 theo sự tổng hòa của cả 2 người (Đức & Hùng), đồng thời mở hộp thoại thông báo: 'Nhóm đã đủ thành viên. Bạn có muốn chuyển trạng thái bài đăng sang HOÀN THÀNH để đóng nhận đơn mới không?'."),
            ("text", "9. Chủ bài đăng bấm nút 'Hoàn thành nhóm'."),
            ("text", "10. Hệ thống chuyển trạng thái bài đăng BG01 sang 'Đã hoàn thành (Đã ghép phòng thành công)', tự động gửi thông báo từ chối lịch sự tới các ứng viên còn lại trong danh sách chờ, và cung cấp thông tin liên lạc (SĐT, Zalo) để các thành viên trong nhóm trực tiếp kết nối, dọn vào ở cùng nhau.")
        ],
        "ngoai_le": [
            "5. Chủ bài đăng thấy tiêu chí không hợp (ví dụ ứng viên thức khuya 2-3h sáng hoặc hút thuốc), chủ bài đăng bấm nút 'Từ chối ứng viên' và nhập lý do (tùy chọn). Hệ thống cập nhật trạng thái đơn thành 'Từ chối' và gửi thông báo cho ứng viên.",
            "9. Nếu nhóm vẫn còn muốn để mở bài đăng đề phòng có người rút lui, chủ bài đăng bấm 'Để sau', bài đăng tiếp tục duy trì nhưng hiển thị cảnh báo 'Đã tạm đủ người'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 16: Tiếp nhận & Xác nhận liên kết phòng trọ từ chủ trọ
    # -------------------------------------------------------------
    {
        "stt": 16,
        "role": "Người thuê",
        "chuc_nang": "Liên kết phòng trọ (Nhận lời mời từ chủ nhà)",
        "use_case": "Accept Room Link Invitation (Xác nhận kết nối phòng trọ để nhận hóa đơn và thông báo)",
        "actor": "Người thuê, Chủ trọ",
        "tien_dieu_kien": "Chủ trọ đã gửi lời mời liên kết tài khoản của người thuê với một phòng trọ cụ thể.",
        "hau_dieu_kien": "Tài khoản người thuê được liên kết chính thức với phòng trọ và hợp đồng thuê trên hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê (Phạm Minh Đức) đăng nhập vào ứng dụng, biểu tượng quả chuông thông báo hiển thị chấm đỏ có thông báo mới."),
            ("text", "2. Người thuê bấm vào chuông thông báo, hệ thống hiển thị dòng thông báo: 'Chủ nhà trọ Ánh Dương vừa gửi cho bạn lời mời liên kết với Phòng P102 - Tòa nhà Ánh Dương. Bấm để xem chi tiết'."),
            ("text", "3. Người thuê bấm vào thông báo."),
            ("text", "4. Hệ thống mở màn hình 'Chi tiết lời mời liên kết phòng trọ' gồm các thông tin đối soát minh bạch:"),
            ("table",
                ["Mục thông tin", "Chi tiết từ chủ nhà cung cấp", "Trạng thái xác thực"],
                [
                    ["Tên tòa nhà / Khu trọ", "Tòa nhà Ánh Dương", "Đã xác thực địa chỉ"],
                    ["Địa chỉ phòng", "Phòng 102, Tầng 1, Số 12 Ngõ 80 Cầu Giấy, Hà Nội", "Chính xác"],
                    ["Chủ nhà trọ", "Ông Nguyễn Văn Thành - SĐT: 0912345678", "Đã xác minh danh tính"],
                    ["Giá phòng thỏa thuận", "3.800.000 VNĐ/tháng", "Theo hợp đồng thuê"],
                    ["Vai trò của bạn", "Khách thuê đại diện hợp đồng", "Có quyền nhận hóa đơn"]
                ],
                [2.0, 3.2, 1.8]
            ),
            ("text", "5. Hệ thống hiển thị 2 nút lựa chọn: 'Từ chối liên kết' và 'Chấp nhận liên kết phòng'."),
            ("text", "6. Người thuê đối soát thông tin thấy hoàn toàn chính xác với nơi mình đang ở thực tế, người thuê bấm nút 'Chấp nhận liên kết phòng'."),
            ("text", "7. Hệ thống cập nhật liên kết trong cơ sở dữ liệu: Gắn User ID của người thuê vào hồ sơ khách thuê phòng P102, chuyển trạng thái liên kết thành 'Đã liên kết'."),
            ("text", "8. Hệ thống gửi thông báo xác nhận thành công tới chủ nhà trọ ('Khách thuê Phạm Minh Đức đã chấp nhận lời mời liên kết phòng P102')."),
            ("text", "9. Giao diện người thuê tự động kích hoạt menu 'Phòng trọ của tôi', cho phép người thuê xem hợp đồng, theo dõi số điện nước, nhận thông báo đóng tiền phòng và gửi khiếu nại trực tiếp.")
        ],
        "ngoai_le": [
            "5. Thông tin phòng hoặc chủ nhà không đúng với người thuê, người thuê bấm nút 'Từ chối liên kết' và chọn lý do 'Tôi không thuê phòng này'. Hệ thống hủy lời mời và thông báo lại cho chủ trọ kiểm tra lại số điện thoại/ID người được mời.",
            "6. Tài khoản người thuê đang liên kết với một phòng trọ khác chưa thanh lý, hệ thống hiển thị cảnh báo: 'Bạn đang liên kết với phòng P301 - Tòa Bách Khoa. Việc chấp nhận liên kết mới sẽ cập nhật phòng hiện tại của bạn thành P102. Bạn có đồng ý tiếp tục không?'."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 17: Xem lịch sử thuê phòng và hóa đơn
    # -------------------------------------------------------------
    {
        "stt": 17,
        "role": "Người thuê",
        "chuc_nang": "Xem lịch sử thuê phòng của bản thân",
        "use_case": "View Rental History & Bills (Xem thông tin phòng, hợp đồng, chi tiết hóa đơn điện nước từng tháng)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Người thuê đã đăng nhập và đang liên kết với phòng trọ hoặc có lịch sử thuê phòng trước đây.",
        "hau_dieu_kien": "Toàn bộ thông tin hợp đồng và lịch sử các khoản thu chi tiền trọ được hiển thị rõ ràng.",
        "kich_ban_chinh": [
            ("text", "1. Người thuê chọn mục 'Phòng trọ của tôi' -> 'Lịch sử hóa đơn & Hợp đồng'."),
            ("text", "2. Hệ thống hiển thị tab 'Hợp đồng hiện tại' với thông tin tóm tắt: Hợp đồng HĐ-2026-P102, Thời hạn 01/10/2026 đến 30/09/2027, Tiền cọc đã đóng: 3.800.000 VNĐ kèm nút 'Tải file hợp đồng PDF'."),
            ("text", "3. Phía dưới, hệ thống hiển thị bảng danh sách các hóa đơn tiền phòng hàng tháng của phòng P102:"),
            ("table",
                ["Mã hóa đơn", "Kỳ cước tháng", "Số điện tiêu thụ", "Số nước tiêu thụ", "Tổng tiền (VNĐ)", "Hạn thanh toán", "Trạng thái", "Thao tác"],
                [
                    ["HD-202610-P102", "Tháng 10/2026", "115 kWh", "9 m3", "4.707.000", "05/11/2026", "Chờ thanh toán", "Thanh toán ngay"],
                    ["HD-202609-P102", "Tháng 09/2026", "120 kWh", "10 m3", "4.756.000", "05/10/2026", "Đã thanh toán", "Xem biên lai"],
                    ["HD-202608-P102", "Tháng 08/2026", "135 kWh", "11 m3", "4.868.000", "05/09/2026", "Đã thanh toán", "Xem biên lai"]
                ],
                [1.2, 1.0, 1.0, 1.0, 1.1, 1.0, 1.1, 1.1]
            ),
            ("text", "4. Người thuê bấm chọn nút 'Thanh toán ngay' tại hóa đơn tháng 10/2026 đang chờ thanh toán."),
            ("text", "5. Hệ thống hiển thị trang chi tiết hóa đơn chiết tính từng mục: Tiền phòng: 3.800.000đ, Tiền điện: 437.000đ, Tiền nước: 270.000đ, Wifi: 100.000đ, Rác: 100.000đ; kèm mã VietQR ngân hàng có sẵn số tiền và nội dung chuyển khoản tự động (Cú pháp: 'HD202610 P102 Thanh toan')."),
            ("text", "6. Người thuê quét mã QR bằng ứng dụng ngân hàng và bấm nút 'Tôi đã chuyển khoản' để hệ thống gửi thông báo nhắc chủ nhà xác nhận gạch nợ.")
        ],
        "ngoai_le": [
            "3. Người thuê mới vào chưa có hóa đơn phát sinh nào, bảng hiển thị thông báo: 'Hiện chưa có hóa đơn tiền phòng nào được lập cho kỳ cước này'.",
            "5. Người thuê phát hiện chỉ số điện nước trong hóa đơn không khớp với công tơ thực tế ở cửa phòng, người thuê bấm nút 'Khiếu nại hóa đơn' để chuyển sang luồng gửi khiếu nại chỉ số sai."
        ]
    },

    # -------------------------------------------------------------
    # USE CASE 18: Gửi khiếu nại / Báo cáo sự cố phòng trọ
    # -------------------------------------------------------------
    {
        "stt": 18,
        "role": "Người thuê",
        "chuc_nang": "Khiếu nại (Gửi phản ánh sự cố phòng trọ)",
        "use_case": "Submit Incident Report & Complaint (Tạo đơn báo hỏng hóc, sự cố điện nước tới chủ nhà)",
        "actor": "Người thuê",
        "tien_dieu_kien": "Người thuê đã đăng nhập và đang liên kết với phòng trọ.",
        "hau_dieu_kien": "Yêu cầu khiếu nại/sửa chữa được gửi đến chủ nhà trọ và được lưu vết trên hệ thống.",
        "kich_ban_chinh": [
            ("text", "1. Thiết bị trong phòng gặp sự cố (ví dụ: điều hòa bị chảy nước), người thuê vào mục 'Khiếu nại & Báo hỏng'."),
            ("text", "2. Hệ thống hiển thị danh sách các khiếu nại đã gửi trước đó cùng nút 'Tạo khiếu nại mới':"),
            ("table",
                ["Mã KN", "Loại sự cố", "Tiêu đề", "Ngày gửi", "Trạng thái xử lý", "Phản hồi từ chủ nhà", "Thao tác"],
                [
                    ["KN092", "Điện nước", "Bóng đèn nhà vệ sinh bị cháy", "15/09/2026", "Đã giải quyết", "Đã thay bóng mới", "Chi tiết"],
                    ["KN085", "An ninh", "Khóa vân tay cửa cổng chập chờn", "05/08/2026", "Đã giải quyết", "Đã cài lại dữ liệu vân tay", "Chi tiết"]
                ],
                [0.7, 1.0, 1.8, 0.9, 1.0, 1.6, 0.8]
            ),
            ("text", "3. Người thuê bấm chọn nút 'Tạo khiếu nại mới'."),
            ("text", "4. Hệ thống mở Form tạo khiếu nại gồm: Phân loại sự cố (Dropdown: Hỏng thiết bị điện lạnh, Điện nước sinh hoạt, Cơ sở vật chất/cửa sổ, An ninh trật tự, Sai lệch hóa đơn), Tiêu đề khiếu nại (*), Mức độ khẩn cấp (Bình thường / Khẩn cấp), Mô tả chi tiết tình trạng (*), Khu vực tải lên hình ảnh/video bằng chứng (Tối đa 5 ảnh), Nút 'Hủy' và nút 'Gửi khiếu nại'."),
            ("text", "5. Người thuê nhập thông tin: Phân loại: 'Hỏng thiết bị điện lạnh', Tiêu đề: 'Điều hòa chảy nước và không mát', Mức độ: Khẩn cấp, Mô tả: 'Điều hòa bật 16 độ nhưng chỉ có gió thoang thoảng, nước chảy rỉ xuống sàn gỗ từ đêm qua', đồng thời tải lên 2 bức ảnh chụp hiện trạng máy điều hòa bị chảy nước."),
            ("text", "6. Người thuê bấm nút 'Gửi khiếu nại'."),
            ("text", "7. Hệ thống cấp mã khiếu nại KN101, lưu trạng thái 'Mới gửi', tự động gửi thông báo khẩn cấp tới chủ nhà trọ."),
            ("text", "8. Hệ thống hiển thị thông báo thành công và đưa người thuê quay lại danh sách theo dõi tiến độ xử lý của chủ nhà.")
        ],
        "ngoai_le": [
            "5. Người thuê không tải ảnh mô tả đối với sự cố hỏng hóc vật chất, hệ thống hiển thị nhắc nhở: 'Khuyến khích đính kèm ảnh để chủ nhà nắm bắt chính xác hiện trạng và mang đúng dụng cụ sửa chữa'.",
            "5. Người thuê để trống trường tiêu đề hoặc mô tả, hệ thống báo lỗi: 'Vui lòng nhập tiêu đề và nội dung mô tả chi tiết sự cố'."
        ]
    }
]

print(f"Loaded {len(USECASES_TENANT)} use cases for Tenant.")

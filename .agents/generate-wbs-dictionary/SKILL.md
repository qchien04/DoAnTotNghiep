---
name: generate-wbs-dictionary
description: "Tự động phân tích cây WBS (PlantUML, Mermaid hoặc Markdown) kết hợp với bảng Milestone tiến độ để lập Từ điển WBS (WBS Dictionary) chi tiết chuẩn hóa theo mẫu: Code, Cấp, Duration, Outcome, Mô tả công việc, Activities, Ràng buộc, Milestones. Hỗ trợ tạo cho toàn bộ hệ thống hoặc từng phân hệ/Work Package cụ thể."
---

# 1. Vai trò & Mục tiêu (Role & Context)

Bạn là **Senior Project Manager (PMP) & Lead Software Architect**. Nhiệm vụ của bạn là đọc cấu trúc phân rã công việc WBS (`docs/wbs.md` hoặc `docs/WBS_MERMAID_CHI_TIET.md`) và bảng kế hoạch cột mốc (`docs/milestone.md`), sau đó chuyển hóa thành **Từ điển WBS (WBS Dictionary)** chuyên nghiệp, chi tiết và có tính hành động cao.

Từ điển WBS giúp định nghĩa chuẩn xác từng gói công việc (Work Package), loại bỏ hiểu nhầm về phạm vi (Scope Creep), làm căn cứ để ước lượng thời gian, phân bổ nhân sự, thiết kế kỹ thuật và nghiệm thu đầu ra.

---

# 2. Nguồn dữ liệu & Đầu vào (Inputs & Data Sources)

Kỹ năng này sử dụng các nguồn dữ liệu sau trong thư mục `docs/`:

1. **Cây WBS gốc:**
   - `docs/wbs.md` (Định dạng PlantUML `@startwbs ... @endwbs`)
   - `docs/WBS_MERMAID_CHI_TIET.md` (Định dạng Mermaid `flowchart TD`)
   - Hoặc file WBS bất kỳ do người dùng cung cấp.
2. **Kế hoạch Cột mốc (Milestones):**
   - `docs/milestone.md` (Chứa timeline 12 tuần, các phân hệ tương ứng và sản phẩm đầu ra / Demo 1, Demo 2, Demo 3).
3. **Phạm vi thực hiện (Scope):**
   - **Tùy chọn A (Mặc định khi người dùng chỉ định phân hệ):** Lập cho 1 phân hệ cụ thể (vd: Phân hệ 1.0 Chủ trọ, 2.0 Admin, 3.0 Người thuê, hoặc 4.0 Chat).
   - **Tùy chọn B (Tạo toàn bộ dự án):** Phân chia thành các file tài liệu theo từng phân hệ trong thư mục `docs/wbs_dictionary/` để đảm bảo độ sâu, không bị lược bớt hoặc vượt quá giới hạn token.
   - **Tùy chọn C (Một cụm Work Package):** Người dùng chỉ định nhóm mã cụ thể (ví dụ: `1.3` Hợp đồng hoặc `3.1` Đăng bài).

---

# 3. Mẫu Form chuẩn WBS Dictionary (Mandatory Template)

MỖI mục trong WBS Dictionary BẮT BUỘC phải tuân thủ chính xác mẫu cấu trúc sau:

```markdown
### [Code] [Tên công việc / Work Package]
- **Code**: [Mã WBS, ví dụ: 1.1.2]
- **Cấp**: [Cấp 1: Phân hệ / Cấp 2: Module (Control Account) / Cấp 3 hoặc 4: Work Package]
- **Duration**: [Thời lượng ước tính, ví dụ: 2 ngày (16 giờ) - Thuộc Tuần X]
- **Outcome**: [Sản phẩm đầu ra cụ thể, ví dụ: Use Case Diagram, User Stories hoàn chỉnh, REST API, UI Component, Unit Test]
- **Mô tả công việc**: [Mục tiêu nghiệp vụ, bối cảnh, lý do cần làm và phạm vi xử lý cụ thể của công việc này]
- **Activities**:
  1. [Hoạt động 1: Khảo sát, phân tích nghiệp vụ & đặc tả tài liệu/Use Case]
  2. [Hoạt động 2: Thiết kế CSDL, Mapper, Service, Controller phía Backend]
  3. [Hoạt động 3: Xây dựng Giao diện UI, Component, kết nối API phía Frontend]
  4. [Hoạt động 4: Viết Test Case, chạy kiểm thử tự động, tích hợp & nghiệm thu]
- **Ràng buộc**:
  - *Tiền đề (Predecessors)*: [Danh sách mã WBS bắt buộc phải hoàn thành trước]
  - *Công nghệ & Quy chuẩn*: [Ngăn xếp công nghệ sử dụng: Spring Boot, React, Tailwind, WebSocket, v.v.]
  - *Phân quyền (RBAC)*: [ROLE_LANDLORD / ROLE_ADMIN / ROLE_TENANT / GUEST]
- **Milestones**: [Tên cột mốc & tuần tương ứng theo docs/milestone.md]
```

---

# 4. Quy tắc suy luận & Ánh xạ thông minh (Mapping Rules)

### 4.1. Phân định Cấp (Level)
- **Cấp 1 (Phân hệ / Sub-system / Phase):** Các mã dạng `1.0`, `2.0`, `3.0`, `4.0`.
  - Cấp này đóng vai trò gom nhóm cấp cao (Summary Level).
- **Cấp 2 (Module chức năng / Control Account):** Các mã dạng `1.1`, `1.2`, ..., `2.1`, ..., `3.1`, ..., `4.1`...
  - Cấp này đóng vai trò quản lý tiến độ tổng thể của một tính năng lớn.
- **Cấp 3 hoặc Cấp 4 (Work Package):** Các mã lá chi tiết dạng `1.1.1`, `1.1.2`, `1.2.1`, `2.1.3`...
  - Đây là đơn vị công việc thực thi trực tiếp của Developer, BA, Tester.

### 4.2. Bảng ánh xạ Cột mốc từ `docs/milestone.md`

Khi điền trường **Milestones**, tra cứu và liên kết chính xác theo bảng sau:

| Tuần | Phân hệ Công việc theo Milestone | Ánh xạ Mã WBS liên quan | Sản phẩm đầu ra / Cột mốc |
| :--- | :--- | :--- | :--- |
| **Tuần 1** | Phân tích yêu cầu, lập WBS, WBS Dictionary, Use Case Spec | Áp dụng chung cho toàn bộ WBS | Bộ tài liệu Đặc tả Yêu cầu |
| **Tuần 2** | Thiết kế hệ thống: UML (Sequence, Activity, State, Class) | Khung kiến trúc toàn hệ thống | Bản thiết kế UML |
| **Tuần 3** | Thiết kế CSDL (ERD), Khởi tạo Frontend & Backend Core | Kiến trúc nền tảng CSDL & RBAC | CSDL MySQL/Oracle & Core Project |
| **Tuần 4** | CRUD Tòa nhà, Phòng trọ | `1.4` (CRUD Tòa nhà), `1.5` (CRUD Phòng) | **Demo 1: Báo cáo UML, ERD và luồng quản lý phòng** |
| **Tuần 5** | Hợp đồng & Quản lý Khách thuê | `1.3` (Tạo hợp đồng), `1.9` (CRUD Khách thuê) | Code chức năng Hợp đồng & Khách thuê |
| **Tuần 6** | Chốt điện nước, Hóa đơn; Đăng bài tìm ở ghép | `1.2` (Tính tiền phòng), `1.8` (CRUD Hóa đơn), `3.1` (Đăng bài) | Code chức năng Hóa đơn & Đăng bài |
| **Tuần 7** | Thuật toán Ghép cặp, Xin vào nhóm, Duyệt nhóm, Khiếu nại | `3.5` (Xin gia nhập), `3.6` (Duyệt thành viên), `1.7` (Khiếu nại Chủ trọ), `3.2` (Khiếu nại Người thuê), `2.3` (Duyệt khiếu nại Admin), `2.4` (Master Data) | Chức năng mạng xã hội ở ghép |
| **Tuần 8** | Real-time Chat (1-1, Group) qua WebSocket | `4.1` (Chat 1-1), `4.2` (Group Chat), `2.1` (CRUD Người dùng), `2.2` (Dashboard Admin), `1.1` (Dashboard Chủ trọ), `3.3` (Tìm kiếm phòng), `3.4` (Lịch sử thuê) | **Demo 2: Luồng Tài chính & Test Chat Real-time** |
| **Tuần 9** | Lập kế hoạch Kiểm thử, Unit Test & Integration Test | Áp dụng cho toàn bộ các Work Package đã code | Báo cáo lỗi (Bug Report) & Bộ Test Suites |
| **Tuần 10** | Tối ưu UI/UX (Tailwind, Shadcn UI), Tối ưu SQL Index | Áp dụng tinh chỉnh giao diện & hiệu năng | Code bản Release Candidate (RC) |
| **Tuần 11** | Đóng gói Docker, Nginx, Triển khai Live Server | Hạ tầng DevOps / Deployment | Link hệ thống chạy Live |
| **Tuần 12** | Báo cáo tổng kết, Slide & Kịch bản bảo vệ | Nghiệm thu toàn diện | **Demo 3: Trình bày hệ thống Live & Slide bảo vệ** |

### 4.3. Quy tắc ước lượng Duration (Thời lượng)
- **Hạng mục Đơn giản** (Xem thống kê, lọc dữ liệu cơ bản, cập nhật trạng thái đơn): `1 - 2 ngày` (8 - 16 giờ).
- **Hạng mục Trung bình** (CRUD hoàn chỉnh có form validate, tải file, xuất PDF): `2 - 3 ngày` (16 - 24 giờ).
- **Hạng mục Phức tạp / Trọng yếu** (Tính toán tiền phòng đa dịch vụ, quyết toán cọc trả phòng, thuật toán matching tương thích, xử lý WebSocket real-time chat đa phòng): `3 - 5 ngày` (24 - 40 giờ).

### 4.4. Quy tắc xác định Ràng buộc tiền đề (Predecessors)
- Công việc con phải phụ thuộc công việc cha hoặc module nền:
  - Muốn tạo Phòng (`1.5`) thì phải có Tòa nhà (`1.4`) và Loại Dịch vụ (`1.6`).
  - Muốn tạo Hợp đồng (`1.3`) thì phải có Phòng trống (`1.5`) và Hồ sơ Khách thuê (`1.9`).
  - Muốn Tính tiền phòng (`1.2`) và Lập hóa đơn (`1.8`) thì phải có Hợp đồng hiệu lực (`1.3`).
  - Muốn Xử lý trả phòng (`1.10`) thì phải có Hóa đơn kỳ cuối (`1.8`) và Hợp đồng (`1.3`).
  - Muốn Duyệt thành viên (`3.6`) thì phải có Bài đăng tìm bạn (`3.1`) và Yêu cầu xin gia nhập (`3.5`).
  - Muốn Chat nhóm (`4.2`) thì phải có thành viên được duyệt vào nhóm (`3.6`) hoặc Phòng có Hợp đồng (`1.3`).

---

# 5. Cấu trúc Tài liệu & Thư mục Lưu trữ

Khi thực hiện tạo WBS Dictionary, tạo tài liệu trong thư mục:
`docs/wbs_dictionary/`

### 5.1. Trường hợp tạo theo từng Phân hệ (Khuyến nghị cho dự án lớn)
- `docs/wbs_dictionary/00_tong_quan.md`: Bảng ma trận tổng hợp toàn bộ các Work Package, mã code, cấp, thời lượng và milestone.
- `docs/wbs_dictionary/01_wbs_dict_chu_tro.md`: Chi tiết toàn bộ Work Package thuộc `1.0 PHÂN HỆ CHỦ TRỌ`.
- `docs/wbs_dictionary/02_wbs_dict_admin.md`: Chi tiết toàn bộ Work Package thuộc `2.0 PHÂN HỆ ADMIN`.
- `docs/wbs_dictionary/03_wbs_dict_nguoi_thue.md`: Chi tiết toàn bộ Work Package thuộc `3.0 PHÂN HỆ NGƯỜI THUÊ`.
- `docs/wbs_dictionary/04_wbs_dict_chat.md`: Chi tiết toàn bộ Work Package thuộc `4.0 PHASE 2: HỆ THỐNG CHAT`.

### 5.2. Trường hợp tạo 1 file duy nhất (Người dùng yêu cầu cụ thể)
- Lưu tại `docs/WBS_DICTIONARY.md`.
- Mỗi phân hệ đặt trong một Heading cấp 1 (`# 1.0 PHÂN HỆ CHỦ TRỌ`), mỗi module đặt trong Heading cấp 2 (`## 1.1 Dashboard`), và từng Work Package đặt trong Heading cấp 3 (`### 1.1.1 Xem thống kê tổng số tòa & phòng`).

---

# 6. Quy trình Thực hiện Từng bước (Step-by-Step Workflow)

Khi nhận yêu cầu từ người dùng:

1. **Bước 1: Quét và Đọc dữ liệu đầu vào:**
   - Đọc `docs/wbs.md` hoặc `docs/WBS_MERMAID_CHI_TIET.md` để lấy toàn bộ danh sách phân cấp công việc.
   - Đọc `docs/milestone.md` để nắm rõ phân bổ 12 tuần và các mốc Demo.
2. **Bước 2: Xác nhận Phạm vi (Scope Confirmation):**
   - Nếu người dùng yêu cầu cụ thể (ví dụ: "Làm WBS Dictionary cho Phân hệ Chủ trọ" hoặc "Làm cho module 1.3 và 1.8"): Chỉ tập trung sinh chính xác các mục được yêu cầu.
   - Nếu người dùng yêu cầu làm toàn bộ: Tạo cấu trúc thư mục `docs/wbs_dictionary/` và lần lượt xuất bản từng phân hệ, kèm theo bảng tổng hợp ma trận.
3. **Bước 3: Điền đầy đủ thông tin theo Form chuẩn:**
   - Đảm bảo KHÔNG bỏ trống bất kỳ trường nào trong mẫu:
     - `Code`: Đúng mã WBS.
     - `Cấp`: Đúng phân loại.
     - `Duration`: Có số ngày và giờ cụ thể.
     - `Outcome`: Đầu ra rõ ràng, có thể kiểm chứng.
     - `Mô tả công việc`: Súc tích, thực tế, phản ánh nghiệp vụ quản lý phòng trọ / tìm ở ghép.
     - `Activities`: Chia 4 bước phân tích, BE, FE, kiểm thử.
     - `Ràng buộc`: Đủ tiền đề, công nghệ và quyền RBAC.
     - `Milestones`: Ghi rõ số tuần và sự kiện demo liên kết.
4. **Bước 4: Sinh Bảng Ma trận Theo dõi Tiến độ (Summary Matrix):**
   - Ở đầu mỗi tài liệu phân hệ hoặc file tổng quan, tạo bảng tra cứu nhanh:
     `| Code | Tên Work Package | Cấp | Duration | Outcome | Milestones |`
5. **Bước 5: Ghi file và Báo cáo:**
   - Sử dụng `write_to_file` để lưu tài liệu.
   - Trả lời người dùng ngắn gọn, cung cấp đường link markdown `[Tên file](file:///...)` và tóm tắt số lượng Work Package đã được từ điển hóa.

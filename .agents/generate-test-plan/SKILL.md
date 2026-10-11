---
name: generate-test-plan
description: "Đọc Detail Design Document (.md: Check Specification, API Processing với các bước ①-⑧ và mã lỗi, Execution API, Table, Screen Wireframe) cùng openapi.yaml, sinh ra một Test Plan (.md) đầy đủ — test case cho từng Validation Rule, từng nhánh rẽ/mã trạng thái trong API Processing, từng ràng buộc SQL (soft-delete, version hiệu lực, sort/pagination), đối chiếu contract API, và test UI/E2E theo Wireframe. KHÔNG thực thi test. Dùng skill này khi người dùng nói 'lập test plan', 'viết test case', 'kế hoạch kiểm thử', hoặc trước khi chạy skill execute-test-plan."
---

# 1. Vai trò & Mục tiêu
Bạn là **QA Lead / Test Architect**. Nhiệm vụ: đọc Detail Design Document (`.md`) của một module/màn hình và `openapi.yaml`, sau đó suy ra **toàn bộ test case cần thiết** để phủ hết mọi rule, nhánh nghiệp vụ, và ràng buộc dữ liệu đã đặc tả — sinh ra 1 file **Test Plan** duy nhất, đủ chi tiết để thực thi (bằng người hoặc bằng skill `execute-test-plan`) mà **không cần đọc lại** Detail Design gốc.

**Đây không phải bước chạy test.** Không gọi API thật, không viết test code, không dùng bash/curl ở skill này — chỉ sinh 1 file `.md` kế hoạch. Việc thực thi thuộc về skill `execute-test-plan`, chạy sau và chỉ dựa vào file kế hoạch này.

**Vì sao tách riêng bước này:** giống lý do tách plan/code ở Backend và Frontend — chốt sẵn toàn bộ test case (đã suy luận, đã giải quyết mơ hồ) để người review duyệt trước khi tốn công chạy/viết test tự động, và để `execute-test-plan` không phải tự diễn giải lại bảng Check Specification/API Processing phức tạp.

---

# 2. Đầu vào
- **Detail Design Document (`.md`)** của module/màn hình cần lập test plan — bắt buộc.
- **`openapi.yaml`** — dùng đối chiếu contract Request/Response.
- **(Tùy chọn) Test Plan của module khác đã có** — để tái sử dụng quy ước đặt Test Case ID, tránh trùng lặp test case cho các phần dùng chung (ví dụ UserAuthenticationCheck chỉ cần test 1 lần, không lặp lại chi tiết ở mọi module).

---

# 3. Cấu trúc Test Plan (Output)

```markdown
# Test Plan: <Tên module/màn hình>

## 0. Source Spec Reference
- Detail Design URI: `<đường dẫn/URI thật>`
- OpenAPI: `<đường dẫn openapi.yaml>`
- Quy ước đặt ID: `TC-<MÃ_MÀN>-<NHÓM>-<số thứ tự 3 chữ số>` (nhóm: `VAL` = Validation, `API` = Business Flow, `SQL` = Data Integrity, `CTR` = Contract, `UI` = UI/E2E)

## 1. Phạm vi kiểm thử (Scope)
- Danh sách API sẽ test (lấy từ Execution API).
- Danh sách màn hình/UI flow sẽ test (lấy từ Screen Wireframe + Description of the Process).

## 2. Test Case — Input Validation (theo Check Specifications)
| Test Case ID | Field | Loại (Valid / Invalid / Boundary) | Input mẫu | Kết quả mong đợi (Message ID + HTTP Status) | Priority |
| :--- | :--- | :---: | :--- | :--- | :---: |
<!-- Với mỗi dòng trong Check Specifications: tối thiểu 1 case Valid + 1 case Invalid cho mỗi loại check (Required/Format/Business rule). Business rule dạng khoảng (ví dụ ngày phải Thứ 2, Chủ Nhật lớn hơn Thứ 2) phải có case biên (đúng ngày biên, sai lệch 1 ngày). -->

## 3. Test Case — API Business Flow (theo API Processing)
Với mỗi API, dựa theo loại luồng (Mẫu A — Retrieve hoặc Mẫu B — Write/Upsert) đã xác định khi lập Detail Design:

### API: <Tên API> (`<Method> <Path>`)
| Test Case ID | Kịch bản | Tiền điều kiện (trạng thái DB) | Input (request) | Kết quả mong đợi (status code + response/side-effect) | Priority |
| :--- | :--- | :--- | :--- | :--- | :---: |
<!-- Bắt buộc có đủ case cho MỌI mã trạng thái xuất hiện trong API Processing của API này (401 hết hạn token, 401 sai thông tin, 400 tham số không hợp lệ ứng với từng rule ở Check Spec, 404/409 nếu có, 500 lỗi hệ thống, 200 thành công). -->

**Riêng với API Mẫu B (Write/Upsert)** — bổ sung tối thiểu các case:
- Tạo mới hoàn toàn (chưa có bản ghi cha) → chỉ có nhánh Insert (④→⑧), không có diff.
- Cập nhật hỗn hợp: request chứa đồng thời dòng cần insert mới, dòng cần update, và thiếu 1 dòng đang có trong DB (→ phải bị soft-delete).
- Gọi lại với dữ liệu y hệt lần trước (idempotency) → không phát sinh insert/update thừa.
- Dòng đã soft-delete trước đó không được tính vào diff ở lần gọi tiếp theo.

## 4. Test Case — SQL / Data Integrity
| Test Case ID | Kiểm tra | Điều kiện thiết lập | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
<!-- Với mỗi bảng có soft-delete trong SQL Explanation: verify bản ghi đã xóa mềm không xuất hiện trong kết quả GET. Với mỗi điều kiện lọc version hiệu lực: verify version hết hạn/chưa hiệu lực không được trả về. Với sort động: verify đúng thứ tự khi truyền các giá trị sortColumn/sortDay khác nhau. Với pagination: verify đúng số bản ghi theo LIMIT/OFFSET và tổng số trang. -->

## 5. Test Case — API Contract (đối chiếu `openapi.yaml`)
| Test Case ID | Endpoint | Field cần verify | Kết quả mong đợi |
| :--- | :--- | :--- | :--- |
<!-- Verify response thực tế có đủ field, đúng kiểu dữ liệu, đúng field required, đúng mã lỗi khai báo trong openapi.yaml. -->

## 6. Test Case — UI / E2E (theo Screen Wireframe + Description of the Process)
| Test Case ID | Màn hình | Hành động người dùng | Kết quả mong đợi | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
<!-- Dùng đúng LABEL hiển thị thật (không dùng "No: X"/"Item X" trong Kết quả mong đợi) — tham khảo bảng ánh xạ Label nếu đã có Implementation Plan Frontend. Bao gồm: validate inline khi nhập sai, nút disable/enable đúng điều kiện, điều hướng đúng link, trạng thái xóa mềm hiển thị đúng (bôi xám, đổi label nút), phân trang/đổi số bản ghi/sort theo cột hoạt động đúng. -->

## 7. Ma trận Truy vết (Traceability Matrix)
| Nguồn (Check Spec / API Processing step / SQL condition / Wireframe Item) | Test Case ID tương ứng |
| :--- | :--- |
<!-- Dùng để tự kiểm tra coverage — mỗi dòng trong Check Specifications, mỗi mã trạng thái trong API Processing, mỗi điều kiện WHERE quan trọng, mỗi Item có I/O ≠ "-" đều phải xuất hiện ở đây với ít nhất 1 Test Case ID. -->

## 8. Yêu cầu Môi trường & Dữ liệu Test (Test Data Setup)
- Danh sách seed data cần có sẵn trước khi test (ví dụ: 1 tài khoản test, 1 bản ghi Draft có sẵn để test nhánh Update, 1 version sản phẩm sắp hết hạn để test filter hiệu lực).
- Ghi rõ case nào phụ thuộc thời gian thực (`NOW()`) và cách giả lập/né tránh flaky test (ví dụ dùng ngày tương đối so với ngày chạy test thay vì ngày cố định).
```

---

# 4. Quy tắc Diễn giải (áp dụng khi lập test plan)
1. **Mọi test case phải bắt nguồn từ đúng 1 rule/bước/điều kiện có thật trong Detail Design hoặc `openapi.yaml`** — không tự bịa thêm edge case ngoài phạm vi tài liệu. Nếu muốn đề xuất thêm case hợp lý nhưng chưa có trong tài liệu (ví dụ test injection/security), tách riêng thành mục "Đề xuất bổ sung (cần xác nhận)" ở cuối Test Plan, không trộn vào bảng chính.
2. **Coverage bắt buộc 100%:** mọi dòng trong Check Specifications, mọi mã trạng thái (`400/401/403/404/409/500/200`) xuất hiện trong API Processing, mọi điều kiện WHERE quan trọng (soft-delete, version hiệu lực), và mọi Wireframe Item có `I`/`IO`/`O` đều phải có ít nhất 1 Test Case ID trong Ma trận Truy vết.
3. **Test case cho API Mẫu B (Write/Upsert)** phải phủ đủ cả 2 nhánh chính (tạo mới vs cập nhật) và trường hợp hỗn hợp insert/update/soft-delete cùng lúc — không chỉ test "happy path" tạo mới.
4. **Không dùng mã định danh kỹ thuật (`No`, `Màn X`) trong cột "Kết quả mong đợi" ở mục 6** — dùng đúng label hiển thị thật.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Một outcome trong API Processing phụ thuộc thời điểm thực thi (`NOW()`) mà không rõ cách giả lập để test ổn định (không flaky).
2. Thiếu thông tin để xác định seed data cần thiết cho 1 nhánh test cụ thể (ví dụ cần 1 bản ghi ở đúng trạng thái nào đó).
3. Phát hiện Check Specification hoặc API Processing có case chưa rõ kết quả mong đợi (ví dụ nhập trùng dữ liệu — trả lỗi hay ghi đè — mà Detail Design không nói rõ).
4. Cân nhắc thêm test case ngoài phạm vi Detail Design (bảo mật, hiệu năng...) — phải hỏi trước khi đưa vào Test Plan chính thức.

---

# 6. Checklist Tự kiểm tra
- [ ] Mọi dòng Check Specifications có ít nhất 1 test case Valid + 1 Invalid trong Ma trận Truy vết.
- [ ] Mọi mã trạng thái HTTP xuất hiện trong API Processing của mỗi API đều có test case tương ứng.
- [ ] Mọi API Mẫu B có đủ case: tạo mới, cập nhật hỗn hợp, idempotency, không đưa dòng đã soft-delete vào diff lần sau.
- [ ] Mọi điều kiện soft-delete/version hiệu lực trong SQL Explanation có test case Data Integrity riêng.
- [ ] Không có Test Case ID nào trùng lặp; quy ước đặt tên nhất quán xuyên suốt toàn bộ Test Plan.
- [ ] Không có mã định danh kỹ thuật (`No`/`Màn X`) lộ ra trong cột mô tả kết quả mong đợi ở test UI.
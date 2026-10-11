---
name: generate-frontend-implementation-plan
description: "Đọc Detail Design Document (.md: Screen Wireframe, Check Specification, Execution API) cùng openapi.yaml, diễn giải thành một Implementation Plan (.md) tường minh cho Frontend — liệt kê chính xác Types, Service function theo API contract, State/logic của Custom Hook, breakdown Component/Page, và mapping No/Màn kỹ thuật sang label UI thật sự sẽ hiển thị. KHÔNG sinh code. Dùng skill này khi người dùng nói 'lập kế hoạch implement frontend', 'implementation plan cho màn hình', hoặc trước khi chạy skill implement-frontend-module. Đầu ra của skill này là đầu vào bắt buộc của skill implement-frontend-module."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Frontend Architect** đóng vai trò cầu nối giữa Detail Design Document và việc viết code React. Nhiệm vụ: đọc Detail Design (`.md`) của một màn hình và `openapi.yaml`, sau đó **diễn giải, giải quyết mọi mơ hồ, và tuyến tính hóa** thành một **Implementation Plan** — đủ rõ ràng để skill khác viết code trực tiếp mà **không cần đọc lại** Detail Design gốc.

**Đây không phải bước sinh code.** Không viết bất kỳ dòng `.tsx`/`.ts` nào ở skill này — chỉ sinh 1 file `.md` kế hoạch. Việc sinh code thuộc về skill `implement-frontend-module`, chạy sau và chỉ dựa vào file kế hoạch này.

**Vì sao tách riêng bước này:** Detail Design dùng bảng Wireframe với mã định danh kỹ thuật (`No: 1, 8, 22`, "Màn 1") lẫn với business rule và tham chiếu API — dễ nhầm khi vừa đọc vừa code. Tách thành 1 bước lập kế hoạch giúp: (1) chốt sẵn danh sách Type/Service/Hook/Component trước khi viết code, (2) chuẩn hóa việc **map No → label UI thật** một lần duy nhất (tránh mỗi lần code lại phải tra bảng), (3) người review có thể duyệt cấu trúc trước khi cho phép sinh code.

---

# 2. Đầu vào
- **Detail Design Document (`.md`)** của màn hình cần lập kế hoạch — bắt buộc.
- **`openapi.yaml`** — nguồn xác định chính xác field/kiểu dữ liệu Request/Response; nếu không tìm thấy, hỏi người dùng thay vì suy đoán từ Execution API.
- **(Tùy chọn) Implementation Plan Frontend của màn khác đã có** — để tái sử dụng đúng tên type dùng chung, tên component `common/`, tên hook tiện ích đã tồn tại, tránh định nghĩa trùng.
- **Đường dẫn/URI thật của file Detail Design nguồn** — bắt buộc hỏi nếu không tự suy ra được, vì URI này sẽ dùng nguyên văn làm comment "Source Spec" trong code sau này.

---

# 3. Cấu trúc Implementation Plan (Output)

```markdown
# Implementation Plan (Frontend): <Tên màn hình>

## 0. Source Spec Reference
- Source Spec URI: `<đường dẫn/URI thật của Detail Design .md>`
- OpenAPI: `<đường dẫn openapi.yaml>`

## 1. Types — `src/types/<feature>.types.ts`
| Type/Interface | Field (camelCase) | Kiểu | Nguồn (Wireframe Item / OpenAPI schema) |
| :--- | :--- | :---: | :--- |
<!-- Field response phải khớp 100% schema trong openapi.yaml, không suy đoán từ Wireframe khi có openapi.yaml. -->

## 2. Service — `src/services/<feature>.service.ts`
| Function | HTTP Method + Path (từ openapi.yaml/Execution API) | Request Type | Response Type | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
<!-- Dùng axios instance dùng chung `src/lib/axios.ts` nếu đã tồn tại; nếu chưa có, ghi rõ cần tạo mới ở đây. -->

## 3. Custom Hook — `src/hooks/use<Feature>State.ts`
### 3.1 State
| State variable | Kiểu | Giá trị khởi tạo | Mô tả |
### 3.2 Giá trị dẫn xuất (useMemo)
| Tên | Công thức (bằng lời, khớp Đặc tả) | Phụ thuộc vào state nào |
### 3.3 Validation (client-side, theo Check Specification)
| Field | Rule | Thông báo lỗi hiển thị |
### 3.4 Event handlers
| Tên hàm | Kích hoạt khi nào | Hành vi (gọi Service nào / cập nhật state nào) |

## 4. Components — `src/components/<feature>/`
| Component | Props | Mô tả hành vi | Item No tương ứng (chỉ để đối chiếu nội bộ khi lập kế hoạch — KHÔNG đưa vào code/UI) |
| :--- | :--- | :--- | :---: |

## 5. Page — `src/pages/<Feature>Page.tsx`
- **Route Path:** `<đường dẫn URL theo Screen Wireframe, ví dụ: /weekly-production-plan>` (sử dụng với `react-router-dom`).
- Mô tả bố cục: component nào nằm trong component nào, theo đúng thứ tự nhóm khối ở Screen Wireframe (Header, Navigate Menu, Page Content...).

## 6. Bảng ánh xạ Label hiển thị (bắt buộc — chống lộ mã kỹ thuật ra UI)
| No (Wireframe, chỉ tham chiếu nội bộ) | Label thật sẽ hiển thị trên UI |
| :---: | :--- |
<!-- Mọi text hiển thị trong Component ở mục 4 phải lấy từ cột "Label thật" này, tuyệt đối không in "No: X" hay "Màn X" ra UI. -->

## 7. Danh sách file cần tạo/sửa
- [ ] `types/<feature>.types.ts`
- [ ] `services/<feature>.service.ts`
- [ ] `hooks/use<Feature>State.ts`
- [ ] `components/<feature>/<ComponentName>.tsx` (liệt kê từng component)
- [ ] `pages/<Feature>Page.tsx`
- [ ] `App.tsx` (đăng ký Route mới bằng react-router-dom)
```

---

# 4. Quy tắc Diễn giải (áp dụng khi lập kế hoạch)
1. **Field Type/Service phải khớp `openapi.yaml`** khi có; Execution API trong Detail Design chỉ dùng bổ sung ngữ cảnh, không dùng thay thế khi 2 nguồn mâu thuẫn — nêu rõ mâu thuẫn và hỏi người dùng nếu gặp.
2. **Cấu trúc thư mục phải theo TÍNH CHẤT kỹ thuật** (`types/`, `services/`, `hooks/`, `components/`, `pages/`), tối đa 3 cấp từ `src/` — không đề xuất cấu trúc feature-based lồng sâu trong Implementation Plan.
3. **Không đưa mã định danh kỹ thuật (`No`, `Màn X`) vào bất kỳ cột nào ngoài mục 4 và 6** — các mục đó chỉ để đối chiếu nội bộ lúc lập kế hoạch; mục 6 là nơi DUY NHẤT chốt lại label thật.
4. **Tái sử dụng, không tạo trùng:** nếu Implementation Plan của màn khác đã có type/component/hook cùng mục đích (ví dụ `ProtectedRoute`, `WeekSelector`), tham chiếu lại chứ không định nghĩa lần 2.
5. **Không tự thêm phạm vi ngoài Detail Design** — phát hiện thiếu sót hoặc điểm chưa hợp lý phải hỏi người dùng, không tự quyết định thêm field/nút/modal.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Không tìm được đường dẫn/URI thật của Detail Design nguồn.
2. Không tìm thấy `openapi.yaml`, hoặc endpoint trong Execution API không có trong `openapi.yaml`.
3. Execution API và `openapi.yaml` mâu thuẫn về field/kiểu dữ liệu.
4. Một Item trong Wireframe có mô tả hành vi mơ hồ, không đủ để viết rõ 1 dòng trong bảng Event handlers (mục 3.4) hoặc Component (mục 4).
5. Phát hiện type/component/hook cần dùng đã tồn tại ở Implementation Plan khác nhưng tên/props không khớp 100%.

---

# 6. Checklist Tự kiểm tra
- [ ] Mục 0 có URI thật của Detail Design nguồn.
- [ ] Mọi Type/Service ở mục 1-2 khớp `openapi.yaml`.
- [ ] Mục 6 (bảng ánh xạ Label) bao phủ đủ mọi Item có nội dung hiển thị trên UI — không thiếu item nào.
- [ ] Không có cột nào ngoài mục 4/6 chứa `No`/`Màn X`.
- [ ] Cấu trúc file ở mục 7 tuân thủ layer-based, tối đa 3 cấp từ `src/`.
- [ ] Đã đối chiếu với Implementation Plan Frontend của màn khác (nếu có) để tránh định nghĩa trùng.
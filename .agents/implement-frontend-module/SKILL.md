---
name: implement-frontend-module
description: "Sinh code React + TypeScript + Tailwind CSS + axios + react-router-dom CHỈ dựa vào 1 file Implementation Plan (Frontend, .md) đã được lập sẵn bởi skill generate-frontend-implementation-plan — không tự đọc/diễn giải lại Detail Design gốc. Tuân thủ nghiêm ngặt: comment link Source Spec ở đầu mỗi file (append, không xóa link cũ), sử dụng react-router-dom cho toàn bộ điều hướng/định tuyến (Link, useNavigate, useParams), tổ chức thư mục theo TÍNH CHẤT kỹ thuật (types/services/hooks/components/pages) tối đa 3 cấp từ src, TUYỆT ĐỐI KHÔNG render mã định danh No/Màn lên UI, Frontend chỉ sửa Frontend. Dùng skill này SAU KHI đã có Implementation Plan Frontend — không dùng để tự phân tích Detail Design từ đầu."
---

# 1. Vai trò & Mục tiêu
Bạn là **Senior Frontend Engineer** thực thi đúng 1 **Implementation Plan (Frontend)** (`.md`, output của skill `generate-frontend-implementation-plan`) thành code React/TypeScript thật. Skill này **không tự diễn giải nghiệp vụ** — mọi quyết định (type, field API, state, routing với `react-router-dom`, label hiển thị) đã được chốt sẵn trong Implementation Plan; nhiệm vụ ở đây là chuyển đổi trung thực thành code, không thêm không bớt.

**Nếu không có Implementation Plan** (người dùng đưa thẳng Detail Design `.md` và yêu cầu code luôn): dừng lại, đề xuất chạy `generate-frontend-implementation-plan` trước, không tự ý đọc Detail Design để suy luận.

**Nếu Implementation Plan thiếu thông tin để viết code** (ví dụ 1 component chưa rõ props, hoặc bảng ánh xạ Label ở mục 6 thiếu 1 Item): dừng lại và hỏi, không tự bịa label hay hành vi để lấp chỗ trống.

---

# 2. Đầu vào
- **Implementation Plan (Frontend) (`.md`)** — nguồn duy nhất và đầy đủ để sinh code, gồm đủ 7 mục (Source Spec Reference, Types, Service, Hook, Components, Page, Bảng ánh xạ Label, danh sách file).
- Mã nguồn dự án Frontend hiện có (để kiểm tra `src/lib/axios.ts`, `src/App.tsx`, cấu hình `react-router-dom`, type/component/hook dùng chung đã tồn tại hay chưa, tránh tạo trùng).

---

# 3. RÀNG BUỘC CỐT LÕI (không được vi phạm dù Implementation Plan không nhắc lại)

### Quy tắc 1: Comment link Source Spec ở đầu mọi file tạo mới/chỉnh sửa
Lấy nguyên văn URI ở mục "0. Source Spec Reference" của Implementation Plan:
```typescript
/**
 * Source Spec: <URI lấy nguyên văn từ Implementation Plan mục 0>
 */
```
**Nếu file đã tồn tại và đã có dòng `Source Spec:`** — tuyệt đối không xóa dòng cũ, chỉ **thêm nối tiếp** dòng URI mới bên dưới.

### Quy tắc 2: Sử dụng `react-router-dom` cho toàn bộ Điều hướng và Định tuyến (Routing)
- Bắt buộc dùng `react-router-dom` (`Link`, `NavLink`, `useNavigate`, `useParams`, `useSearchParams`, `Routes`, `Route`, `Navigate`) cho mọi chuyển trang, thanh menu điều hướng, lấy query params, và breadcrumb.
- **TUYỆT ĐỐI KHÔNG** dùng thẻ `<a href="...">` gây reload trang hoặc `window.location.href` (trừ trường hợp redirect ra URL bên ngoài hệ thống).
- Khi tạo/sửa trang (Page), tự động đăng ký hoặc cập nhật route tương ứng trong `src/App.tsx` (hoặc file router của dự án) với path chuẩn đã đặc tả.

### Quy tắc 3: Cấu trúc thư mục theo TÍNH CHẤT kỹ thuật, tối đa 3 cấp từ `src/`
```text
src/
├── types/       (Cấp 1) — mọi file .types.ts
├── services/    (Cấp 1) — mọi file gọi API bằng axios
├── hooks/       (Cấp 1) — mọi custom hook
├── components/  (Cấp 1 & 2) — components dùng chung (common/) và theo nhóm màn hình
├── pages/       (Cấp 1) — trang chính, đặt trực tiếp trong pages/
├── context/     (Cấp 1)
├── lib/         (Cấp 1) — axios instance dùng chung, utils
```
Tuyệt đối cấm tạo thư mục lồng sâu kiểu `src/pages/feature/subfeature/components/deep/Table.tsx`. Đặt file đúng theo danh sách ở mục 7 của Implementation Plan — không tự đặt vị trí khác.

### Quy tắc 4: TUYỆT ĐỐI KHÔNG hiển thị mã định danh kỹ thuật (`No`, `Màn X`) lên UI
Mọi text hiển thị trong component phải lấy đúng từ cột "Label thật" ở mục 6 Implementation Plan. Nếu Implementation Plan có sót label nào chưa map, dừng lại hỏi — không tự điền `No: X`/`Item X` làm placeholder.

### Quy tắc 5: Frontend chỉ sửa Frontend
Chỉ chỉnh sửa file trong `FE/...`. Nếu phát hiện API backend thiếu trường hoặc sai dữ liệu so với Implementation Plan, giải thích rõ và hỏi hướng xử lý — không tự sửa chéo sang `BE/...`.

### Quy tắc 6: Không tự ý làm thêm ngoài Implementation Plan
Chỉ tạo đúng danh sách file ở mục 7. Không tự thêm field, nút, modal, hay logic ngoài phạm vi đã chốt trong Implementation Plan — muốn thêm phải hỏi trước.

---

# 4. Quy trình Sinh Mã nguồn (Layer-by-Layer)

### Bước 1: Types (`src/types/<feature>.types.ts`)
Comment Source Spec đầu file → định nghĩa đúng type/interface ở mục 1 Implementation Plan. Tuyệt đối không dùng `any`.

### Bước 2: Service (`src/services/<feature>.service.ts`)
Comment Source Spec đầu file → dùng axios instance dùng chung (`src/lib/axios.ts`, tạo mới nếu Implementation Plan ghi rõ chưa có) → viết đúng hàm + Method/Path ở mục 2.

### Bước 3: Custom Hook (`src/hooks/use<Feature>State.ts`)
Comment Source Spec đầu file → khai báo state, `useMemo` cho giá trị dẫn xuất, hàm validate, event handler đúng y hệt mục 3. Sử dụng `useNavigate` / `useSearchParams` từ `react-router-dom` nếu hook quản lý điều hướng hoặc URL params.

### Bước 4: Components (`src/components/<feature>/`)
Comment Source Spec đầu file cho từng component → dựng đúng props/hành vi ở mục 4, dùng `Link`/`NavLink` của `react-router-dom` cho các liên kết điều hướng, **dùng đúng label ở mục 6** cho mọi text hiển thị.

### Bước 5: Page & Routing (`src/pages/<Feature>Page.tsx` & `src/App.tsx`)
Comment Source Spec đầu file → ghép các component theo đúng bố cục mô tả ở mục 5. Cập nhật route trong `src/App.tsx` bằng `<Route path="..." element={<...Page />} />` của `react-router-dom`.

---

# 5. Quy tắc Dừng lại Hỏi Người Dùng
1. Được đưa thẳng Detail Design thay vì Implementation Plan.
2. Implementation Plan thiếu props/hành vi cho 1 component, hoặc bảng ánh xạ Label (mục 6) thiếu 1 Item đang cần hiển thị.
3. File đích đã tồn tại và có nội dung xung đột (ví dụ type trùng tên nhưng khác field, hoặc `axios.ts` đã có cấu hình khác).
4. Phát hiện API backend (khi gọi thử) không khớp Response Type đã chốt trong Implementation Plan.

---

# 6. Checklist Tự kiểm tra
- [ ] Mọi file `.tsx`/`.ts` tạo/sửa đều có comment `Source Spec` đúng URI từ Implementation Plan (giữ link cũ, thêm nối tiếp nếu có).
- [ ] Toàn bộ điều hướng, route params, menu links đều sử dụng `react-router-dom` (`Link`, `useNavigate`, `useParams`, `useSearchParams`, `Route`), không dùng `window.location` hay thẻ `<a>` reload trang.
- [ ] Cấu trúc thư mục theo tính chất kỹ thuật, không vượt quá 3 cấp từ `src/`.
- [ ] Không có bất kỳ `No: ...`, `#10`, `Màn X` nào bị render ra UI — mọi text lấy từ mục 6 Implementation Plan.
- [ ] Không dùng kiểu `any` ở bất kỳ đâu.
- [ ] Chỉ tạo/sửa đúng danh sách file ở mục 7 Implementation Plan, không tự ý thêm.
- [ ] Không có file nào trong `BE/...` bị chỉnh sửa.
- [ ] `npm run build` chạy thành công, không lỗi TypeScript/ESLint.
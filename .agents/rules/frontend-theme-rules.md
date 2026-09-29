# 🎨 QUY CHUẨN THIẾT KẾ FRONTEND & HỆ THỐNG THEME (STRICT RULE)

> **MỤC ĐÍCH**: Ngăn chặn hoàn toàn việc sử dụng class màu Tailwind tùy tiện, lộn xộn, fix cứng mã màu tĩnh làm hỏng tính năng Dynamic Theme (Đổi 6 bảng màu) và Dark Mode (Chế độ Tối).  
> **HIỆU LỰC**: Áp dụng bắt buộc cho toàn bộ component, trang và phần tử giao diện trong thư mục `frontend/src/`.

---

## 🚫 1. BẢNG CẤM KỴ TUYỆT ĐỐI (DO NOT USE)

| Hành Vi Bị Cấm | Ví Dụ Vi Phạm | Lý Do Vi Phạm |
| :--- | :--- | :--- |
| **Fix cứng nền trắng/sáng** | `bg-white`, `bg-slate-50`, `bg-gray-50`, `bg-gray-100` | Gây lóa mắt, thẻ Card bị trắng toát khi người dùng bật **Midnight Dark**. |
| **Fix cứng màu chữ đen/tối** | `text-slate-800`, `text-slate-900`, `text-gray-900`, `text-black` | Chữ bị chìm, tàng hình hoặc không đọc được trên nền tối. |
| **Fix cứng màu chữ xám mờ** | `text-slate-500`, `text-slate-600`, `text-gray-500`, `text-gray-400` | Không tự động thích ứng độ tương phản sáng/tối. |
| **Fix cứng đường viền sáng** | `border-slate-200`, `border-slate-100`, `border-gray-200` | Đường viền phát sáng chói lóa trên nền Dark mode. |
| **Fix cứng màu Brand (Xanh/Tím/Cam)** | `bg-blue-600`, `bg-indigo-600`, `text-blue-600`, `text-indigo-600` | Phá vỡ tính năng 1-Click đổi theme (khi chọn Sunset Warm, Ocean Breeze hay Royal Purple). |
| **Fix cứng nền nhạt của Brand** | `bg-blue-50`, `bg-indigo-50`, `bg-sky-50`, `bg-purple-50` | Không đổi theo theme và bị lóa trên nền tối. |
| **Fix cứng màu thành công/xác thực** | `bg-green-500`, `text-green-600`, `bg-emerald-500` | Không đồng bộ với token trạng thái `secondary` và `match` của theme. |

---

## ✅ 2. BẢNG QUY ĐỔI BẮT BUỘC (MAPPING TO SEMANTIC TOKENS)

Khi viết class Tailwind, **BẮT BUỘC** phải thay thế theo bảng quy chuẩn dưới đây:

### A. Nền & Bề mặt (Surfaces & Backgrounds)
- **Nền toàn trang web (Application Canvas)**:
  - ❌ `bg-slate-50`, `bg-gray-50`, `bg-slate-100`
  - ✅ **`bg-stay-bg`** (hoặc `bg-stay-bg-app`)
- **Nền Thẻ Card, Modal, Dropdown, Header, Sidebar**:
  - ❌ `bg-white`
  - ✅ **`bg-stay-card-bg`**
- **Nền phụ / Nền thẻ con bên trong Card**:
  - ❌ `bg-slate-100`, `bg-slate-50`
  - ✅ **`bg-stay-bg-app`** (kết hợp `dark:bg-slate-800/60` nếu cần chiều sâu)

### B. Màu Chữ & Typography (Text Colors)
- **Tiêu đề chính, Họ tên, Giá trị quan trọng**:
  - ❌ `text-slate-800`, `text-slate-900`, `text-gray-900`, `text-black`
  - ✅ **`text-stay-text`**
- **Mô tả phụ, Subtitle, Đoạn văn bản, Nhãn thông thường**:
  - ❌ `text-slate-600`, `text-slate-500`, `text-gray-600`, `text-gray-500`
  - ✅ **`text-stay-text-secondary`**
- **Mã định danh (ID, Code), Chú thích nhỏ, Placeholder, Icon mờ**:
  - ❌ `text-slate-400`, `text-gray-400`, `placeholder-gray-400`
  - ✅ **`text-stay-text-muted`** (kết hợp `placeholder:text-stay-text-muted`)

### C. Đường Viền & Phân Cách (Borders & Dividers)
- **Viền Card, Viền Ô nhập liệu (Input), Viền Table**:
  - ❌ `border-slate-200`, `border-gray-200`, `border-gray-300`
  - ✅ **`border-stay-border`** (kết hợp `dark:border-slate-700`)
- **Đường kẻ phân cách phụ, Viền thẻ con**:
  - ❌ `border-slate-100`, `border-gray-100`
  - ✅ **`border-stay-border-subtle`** (kết hợp `dark:border-slate-800`)

### D. Điểm Nhấn Chủ Đạo (Brand Primary Actions)
- **Nút bấm chính (CTA Button), Điểm nhấn Active, Huy hiệu chính**:
  - ❌ `bg-blue-600`, `bg-indigo-600`, `bg-sky-600`
  - ✅ **`bg-stay-primary hover:bg-stay-primary-hover text-white`**
- **Nền dịu của Brand (Tag, Pill khi được chọn, Badge)**:
  - ❌ `bg-blue-50`, `bg-indigo-50`, `bg-sky-50`
  - ✅ **`bg-stay-primary-subtle text-stay-primary border border-stay-primary/20`**
- **Chữ điểm nhấn, Icon nổi bật, Link active**:
  - ❌ `text-blue-600`, `text-indigo-600`, `text-sky-600`
  - ✅ **`text-stay-primary`**

### E. Trạng Thái Xác Thực & Điểm Ghép Đôi (Secondary & Lifestyle Match)
- **Huy hiệu Đã xác thực (Verified Badge), Trạng thái thành công**:
  - ❌ `bg-green-100 text-green-700`, `bg-emerald-50 text-emerald-600`
  - ✅ **`bg-stay-secondary-subtle text-stay-secondary`** hoặc **`bg-stay-match-subtle text-stay-match-dark dark:text-stay-match`**
- **Thanh đo % Tương thích (Compatibility Score Match Badge)**:
  - ❌ `bg-emerald-500`, `text-emerald-500`
  - ✅ **`bg-stay-match text-white`** hoặc **`text-stay-match`**

---

## 🛠️ 3. QUY TẮC VIẾT FORM & INPUT ADAPTIVE

Mọi form nhập liệu (Input, Select, Textarea) phải tuân thủ cấu trúc thích ứng theme sau:

```tsx
{/* Label */}
<label className="block text-xs font-semibold text-stay-text uppercase tracking-wider mb-2">
  Họ và tên <span className="text-rose-500">*</span>
</label>

{/* Input Thông thường */}
<input
  type="text"
  className="w-full px-4 py-2.5 rounded-xl border border-stay-border bg-stay-card-bg text-stay-text placeholder:text-stay-text-muted focus:outline-none focus:ring-2 focus:ring-stay-primary/20 focus:border-stay-primary text-sm transition dark:bg-slate-850 dark:border-slate-700 dark:text-slate-100"
/>

{/* Input Readonly / Disabled */}
<input
  type="text"
  disabled
  className="w-full px-4 py-2.5 rounded-xl border border-stay-border-subtle bg-slate-100 text-stay-text-muted text-sm cursor-not-allowed dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400"
/>
```

---

## 📱 4. QUY TẮC HIỂN THỊ CÂU HỎI & LỰA CHỌN (SINGLE / MULTI)

- **Thẻ lựa chọn bình thường**:
  `bg-stay-bg-app/80 border border-stay-border text-stay-text hover:bg-stay-bg-app hover:border-stay-primary/50 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750`
- **Thẻ lựa chọn khi ĐƯỢC CHỌN**:
  `bg-stay-primary-subtle border border-stay-primary text-stay-primary font-semibold shadow-xs ring-2 ring-stay-primary/20 dark:bg-stay-primary-subtle/30 dark:border-stay-primary dark:text-white`
- **Biểu tượng lựa chọn**:
  - `SINGLE`: Dùng Radio tròn (`rounded-full`).
  - `MULTI`: Dùng Checkbox vuông bo góc (`rounded-md`), có dấu tích `✓`.

---

## 🔍 5. CHECKLIST TRƯỚC KHI BÀN GIAO CODE FRONTEND

Mỗi khi tạo mới hoặc sửa bất kỳ component nào, Agent **BẮT BUỘC** phải tự kiểm tra:
1. [ ] Có xuất hiện bất kỳ class `bg-white` đơn lẻ nào không? ➡️ Phải đổi thành `bg-stay-card-bg`.
2. [ ] Có xuất hiện bất kỳ class `bg-slate-50` / `bg-gray-50` nào không? ➡️ Phải đổi thành `bg-stay-bg`.
3. [ ] Có xuất hiện bất kỳ class `text-slate-800` / `text-gray-900` nào không? ➡️ Phải đổi thành `text-stay-text`.
4. [ ] Có xuất hiện bất kỳ class `border-slate-200` nào không? ➡️ Phải đổi thành `border-stay-border`.
5. [ ] Có fix cứng mã màu xanh/tím/cam như `bg-blue-600`, `bg-indigo-600` không? ➡️ Phải đổi thành `bg-stay-primary`.
6. [ ] Mở ThemeSwitcher đổi sang **`Midnight Dark (Chế Độ Tối)`**: Giao diện có bị lóa, chữ có bị chìm hay vỡ màu không?
7. [ ] Chạy `npm run build` để kiểm tra toàn vẹn không có lỗi cú pháp hoặc TypeScript.

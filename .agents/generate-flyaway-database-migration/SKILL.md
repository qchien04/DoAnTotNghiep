---
name: generate-database-migration
description: "Tự động phân tích tài liệu thiết kế (.md), trích xuất cấu trúc bảng từ mục Tables và phân tích câu lệnh truy vấn trong mục SQL API Processing để sinh file Flyway SQL migration chuẩn kèm Index tối ưu. Dùng skill này bất cứ khi nào người dùng nhắc đến 'migration', 'Flyway', 'tạo bảng', 'schema database', 'file .sql', hoặc cung cấp một tài liệu thiết kế .md chứa mục Tables/Database Design/API Processing, kể cả khi họ không nói rõ từ 'migration'."
---

# 1. Vai trò & Mục tiêu (Role & Context)
Bạn là **Senior Database Engineer & Performance Specialist**. Nhiệm vụ của bạn là đọc tài liệu đặc tả chức năng dạng Markdown (`.md`), trích xuất cấu trúc bảng (Table Definitions) và phân tích các truy vấn trong phần **API Processing (SQL Explanation)** để tạo file Flyway migration (`.sql`) hoàn chỉnh, chuẩn hóa kiểu dữ liệu, ràng buộc và tối ưu hóa hiệu năng truy vấn thông qua Index phù hợp, tránh dư thừa (Redundant Index).

---

# 2. Đầu vào & Nguồn dữ liệu (Inputs & Data Sources)
- **Tài liệu nguồn:** File đặc tả thiết kế chi tiết (file `.md` do người dùng cung cấp hoặc chỉ định).
- **Phần trích xuất 1 - Cấu trúc bảng (`## Tables` hoặc `## Sheet: Table`):**
  - Tên bảng vật lý (`Physical Name`).
  - Danh sách cột, kiểu dữ liệu, kích thước (`Type`).
  - Các ràng buộc: Primary Key (PK), Foreign Key (FK), Not Null (NN), Default Value (DF), Auto Increment (AI).
  - Quy tắc Soft Delete (`deleted_at`, `is_deleted`, hoặc `deleted_from`/`deleted_to`). **Lưu ý: Chỉ đánh index trên các cột thực sự tồn tại trong định nghĩa bảng.**
- **Phần trích xuất 2 - Luồng truy vấn (`## API Processing` / `### SQL Explanation`):**
  - Mệnh đề `WHERE`: Các trường dùng làm điều kiện lọc thường xuyên.
  - Mệnh đề `JOIN ON`: Các trường khóa ngoại liên kết bảng.
  - Mệnh đề `ORDER BY`: Các trường dùng để sắp xếp dữ liệu.
  - Mệnh đề `GROUP BY` hoặc `DISTINCT`.

---

# 3. Quy trình thực hiện (Step-by-Step Workflow)

### Bước 1: Trích xuất và Chuẩn hóa Bảng (Table Extraction)
1. Đọc danh sách bảng và các trường thuộc tính từ phần Tables của tài liệu.
2. Chuẩn hóa quy tắc đặt tên:
   - Tên bảng: `snake_case`, số nhiều (ví dụ: `products`, `product_versions`, `draft_weekly_production_plans`).
   - Tên cột: `snake_case` (ví dụ: `selling_price`, `production_plan_id`, `created_at`).
   - Kiểu dữ liệu vật lý:
     - Khóa chính định danh: `BIGINT AUTO_INCREMENT` (hoặc `VARCHAR(36)` / `UUID`).
     - Tiền tệ/Số thập phân: `DECIMAL(15, 2)` hoặc `DECIMAL(10, 2)`.
     - Cờ trạng thái: `TINYINT(1)` hoặc `BOOLEAN`.
     - Thời gian: `TIMESTAMP`, `DATETIME`, `DATE`.
     - Chuỗi văn bản: `VARCHAR(255)`, `VARCHAR(100)`, `TEXT`.

### Bước 2: Phân tích SQL API để suy luận Index tối ưu (Advanced Index Optimization Rules)
Duyệt qua tất cả các khối SQL Explanation / Query logic trong phần API Processing để tạo các loại Index sau theo nguyên lý B-Tree (Equality columns trước, Range columns sau):

1. **FK + Soft Delete + Date Range Composite Index (Thay thế Single FK Index):**
   - Khi bảng con thường xuyên được `JOIN` qua `fk_id`, kết hợp lọc `deleted_at IS NULL` và khoảng ngày hiệu lực `start_date <= ? AND end_date >= ?`:
     - *Tạo:* `CREATE INDEX idx_<table>_<fk>_deleted_dates ON <table> (fk_id, deleted_at, start_date, end_date);`
     - *Quy tắc loại trừ dư thừa:* Vì `fk_id` là tiền tố bên trái nhất (Leftmost Prefix), Index này đã bao hàm toàn bộ chức năng của Foreign Key index đơn. **KHÔNG tạo thêm `idx_<table>_<fk_id>` đơn lẻ.**

2. **FK + Soft Delete + Plan Date Composite Index:**
   - Đối với các bảng phân bổ ngày (Daily Plan Products) có `JOIN parent_fk_id` kết hợp lọc `deleted_at IS NULL` và lọc ngày `plan_date BETWEEN ? AND ?`:
     - *Tạo:* `CREATE INDEX idx_<table>_<fk>_deleted_date ON <table> (fk_id, deleted_at, plan_date);`
     - *Lợi ích:* Xử lý `JOIN`, lọc xóa mềm và quét dải ngày trong đúng 1 lần Index Seek.

3. **Filter & Soft Delete Composite Index:**
   - Nếu truy vấn `WHERE` thường xuyên kết hợp cột nghiệp vụ với cờ Soft Delete:
     - *Công thức:* `CREATE INDEX idx_<table>_<columns>_deleted ON <table> (filter_col_1, filter_col_2, deleted_at);`

4. **Filter + Sort Composite Index (Tránh FileSort):**
   - Nếu truy vấn có `WHERE status = ? ORDER BY created_at DESC`:
     - `CREATE INDEX idx_<table>_status_created ON <table> (status, created_at DESC);`

5. **Unique Index (Ràng buộc duy nhất nghiệp vụ):**
   - Phân tích điều kiện trùng lặp dữ liệu (ví dụ: `code` của entity, cặp `(start_date, end_date)` của kế hoạch tuần) → `CREATE UNIQUE INDEX uq_...`.

### Bước 3: Đặt tên Index theo quy chuẩn dự án
- Chỉ mục thường/Composite: `idx_<tên_bảng>_<tên_cột_1>[_<tên_cột_2>...]`
- Chỉ mục duy nhất: `uq_<tên_bảng>_<tên_cột_1>[_<tên_cột_2>...]`
- Khóa ngoại: `fk_<bảng_con>_<bảng_cha>_<tên_cột>`

### Bước 4: Tạo File Flyway SQL Migration
1. Xác định số phiên bản tiếp theo trong thư mục `src/main/resources/db/migration/` (hoặc `V1__init_database_schema.sql`).
2. Viết mã SQL hoàn chỉnh bao gồm: `CREATE TABLE`, `CONSTRAINTS`, `INDEXES` và comment mô tả.
3. Đặt file nằm ở phần `src/main/resources/db/migration/` của Back-end.

---

# 4. Quy chuẩn Định dạng Đầu ra (Output SQL Specification)

Mã SQL xuất ra phải có cấu trúc rõ ràng như sau:

```sql
-- =============================================================================
-- Migration: Create table <table_name> and related indexes
-- Source Specs: <tên_file_md_nguồn>
-- =============================================================================

CREATE TABLE IF NOT EXISTS `<table_name>` (
    `id` BIGINT AUTO_INCREMENT COMMENT 'Khóa chính',
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã định danh nghiệp vụ',
    `name` VARCHAR(255) NOT NULL COMMENT 'Tên hiển thị',
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái bản ghi',
    -- Các trường nghiệp vụ
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tạo',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời điểm cập nhật',
    `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm xóa mềm (NULL: còn hiệu lực)',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='<Bảng mô tả>';

-- =============================================================================
-- INDEXES & CONSTRAINTS (Suy luận từ API Processing & SQL Explanation)
-- =============================================================================

-- 1. Ràng buộc duy nhất (Unique Constraints)
CREATE UNIQUE INDEX `uq_<table_name>_code`
    ON `<table_name>` (`code`);

-- 2. Chỉ mục tối ưu hóa truy vấn Composite (Equality đứng trước, Range/Sort đứng sau)
CREATE INDEX `idx_<table_name>_fk_deleted_date`
    ON `<table_name>` (`fk_id`, `deleted_at`, `effective_date`);
```

---

# 5. Ràng buộc An toàn & Best Practices (Guardrails)

* **Tránh Over-Indexing & Redundant Indexing:** Khi đã có Composite Index `(A, B, C)`, không tạo thêm Single Index `(A)` vì MySQL tự động tận dụng Leftmost Prefix của Composite Index.
* **Kiểm tra tính tồn tại của cột:** Tuyệt đối không thêm các cột giả định (ví dụ `is_deleted`) vào Index nếu bảng không định nghĩa cột đó trong tài liệu.
* **Thứ tự cột trong Composite Index:** Luôn đặt cột có điều kiện so sánh bằng (`=`, `IS NULL`) lên trước, các cột điều kiện khoảng (`BETWEEN`, `>`, `<`) hoặc `ORDER BY` ở sau cùng.
* **An toàn khi chạy lại (Idempotency):** Luôn sử dụng `IF NOT EXISTS` cho lệnh `CREATE TABLE`.
* **Giải thích quyết định tạo Index:** Trong phần phản hồi, luôn liệt kê bảng so sánh/lý do tại sao tạo từng Index (dựa vào API Endpoint nào và câu query nào trong tài liệu).
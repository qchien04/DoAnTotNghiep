---
name: generate-api-spec
description: "Tự động phân tích tài liệu thiết kế (.md), trích xuất danh sách Endpoint từ mục API Processing và Execution API để sinh cấu trúc OpenAPI/Swagger (v3) hoàn chỉnh, bao gồm Request DTO, Response DTO, mã lỗi chuẩn và Component Schema tái sử dụng. Tự động tách các attribute/trường dữ liệu trùng lặp thành các Base Component dùng chung kế thừa qua allOf. Dùng skill này bất cứ khi nào người dùng nhắc đến 'OpenAPI', 'Swagger', 'API spec', 'API contract', 'DTO', 'request/response schema', hoặc cung cấp một tài liệu thiết kế .md chứa mục API Processing/Execution API, kể cả khi họ không nói rõ từ 'OpenAPI' hay 'Swagger'."
---

# 1. Vai trò & Mục tiêu (Role & Context)
Bạn là **Senior API Architect & Backend Contract Designer**. Nhiệm vụ của bạn là đọc tài liệu đặc tả chức năng dạng Markdown (`.md`), trích xuất danh sách Endpoint từ phần **API Processing** và **Execution API**, sau đó sinh ra một file đặc tả **OpenAPI 3.0 (Swagger)** hoàn chỉnh — bao gồm định nghĩa `paths`, `Request DTO`, `Response DTO`, mã lỗi chuẩn, và các `Component Schema` được chuẩn hóa, **áp dụng triệt để nguyên lý DRY (Don't Repeat Yourself) bằng cách tách các thuộc tính chung thành các Base Component DTO và kế thừa thông qua `allOf`**.

---

# 2. Đầu vào & Nguồn dữ liệu (Inputs & Data Sources)
- **Tài liệu nguồn:** File đặc tả thiết kế chi tiết (file `.md` do người dùng cung cấp hoặc chỉ định).
- **Phần trích xuất 1 - Danh sách Endpoint (`## API Processing` hoặc `## Execution API`):**
  - HTTP Method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
  - Đường dẫn Endpoint (`Path`), bao gồm Path Parameters (ví dụ `/products/{productId}`).
  - Query Parameters (tên, kiểu dữ liệu, bắt buộc/tùy chọn, mô tả).
  - Request Body (các trường dữ liệu, kiểu dữ liệu, ràng buộc bắt buộc, default value).
  - Response Body (các trường trả về, kiểu dữ liệu, cấu trúc lồng nhau — object/array).
  - Mã trạng thái HTTP dự kiến (`200`, `201`, `400`, `401`, `404`, `409`, `500`...) và điều kiện phát sinh lỗi.
  - Mô tả nghiệp vụ (Business Description) đi kèm mỗi endpoint.
- **Phần trích xuất 2 - Ngữ cảnh dữ liệu (`## Tables` / `## Sheet: Table`):**
  - Dùng để suy luận kiểu dữ liệu chính xác cho DTO (`DECIMAL` → `type: number, format: double`, `DATE` → `type: string, format: date`).
  - Loại bỏ các trường hạ tầng/nội bộ (`deleted_at`, `password_hash`) khỏi Response DTO.

---

# 3. Quy trình thực hiện (Step-by-Step Workflow)

### Bước 1: Trích xuất danh sách Endpoint
1. Duyệt toàn bộ mục API Processing / Execution API, liệt kê từng endpoint kèm Method + Path.
2. Với mỗi endpoint, ghi nhận input (path/query/body), output (response), các case lỗi và gán `tag` tương ứng (ví dụ `Product`, `ProductionPlan`, `Material`).

### Bước 2: Xây dựng Request DTO & Gom nhóm Base Component (DRY Principle)
1. **Tách Base Component cho các Request có trường tương đồng:**
   - Khi có 2 hay nhiều Request DTO chia sẻ chung một tập thuộc tính (cùng tên field, kiểu dữ liệu, ràng buộc validation, mô tả):
     - **BẮT BUỘC** tách phần thuộc tính dùng chung thành một Component Schema riêng biệt (ví dụ: `BaseProductVersionRequest`, `BaseMaterialVersionRequest`, `SoftDeleteDateRequest`).
     - Sử dụng `allOf` trong các Request DTO con để kế thừa Base Component và bổ sung các thuộc tính đặc thù:
       ```yaml
       # Ví dụ kế thừa Base Request Component:
       CreateProductRequest:
         allOf:
           - $ref: '#/components/schemas/BaseProductVersionRequest'
           - type: object
             properties:
               # Các trường đặc thù chỉ có ở tạo mới Product (nếu có)
       
       CreateProductVersionRequest:
         allOf:
           - $ref: '#/components/schemas/BaseProductVersionRequest'
           - type: object
             properties:
               productId:
                 type: integer
                 format: int64
               productCode:
                 type: string
       ```
2. **Parameters vs DTO Body:**
   - Path Parameters & Query Parameters được khai báo trực tiếp trong mục `parameters` của operation.
   - Request Body (`POST`/`PUT`/`PATCH`) khai báo trong `requestBody` và tham chiếu tới schema trong `components.schemas`.
3. Đánh dấu `required` chặt chẽ theo đặc tả thiết kế.
4. Field name trong JSON luôn dùng `camelCase`.

### Bước 3: Xây dựng Response DTO & Reusable Entities
1. Với mỗi response thành công, tạo schema `<Resource><Qualifier>Response` (ví dụ `ProductDetailResponse`, `ProductListResponse`).
2. Tách các model thực thể dùng chung (ví dụ `ProductItem`, `MaterialItem`, `PlanProductItem`, `DailyPlanProductItem`, `RecipeItemResponse`) thành Component riêng và tái sử dụng bằng `$ref`.
3. Cấu trúc Response phân trang (Pagination):
   ```yaml
   type: object
   properties:
     totalItems: { type: integer }
     items:
       type: array
       items:
         $ref: '#/components/schemas/<Resource>Item'
   ```

### Bước 4: Chuẩn hóa Error Schema
1. Định nghĩa `ErrorResponse` dùng chung (`code`, `message`, `timestamp`).
2. Mọi mã lỗi `400`, `401`, `404`, `409`, `500` đều tham chiếu `$ref: '#/components/schemas/ErrorResponse'`.

### Bước 5: Đặt tên & Tổ chức Component theo quy chuẩn
- Base Request Component: `Base<Resource>Request` (ví dụ `BaseProductVersionRequest`, `BaseMaterialVersionRequest`, `SoftDeleteDateRequest`).
- Request DTO: `<Verb><Resource>Request` (ví dụ `CreateProductRequest`, `CreateMaterialRequest`).
- Response DTO: `<Resource><Qualifier>Response` (ví dụ `ProductListResponse`, `ApprovedWeeklyPlanResponse`).
- Entity/Sub-Item Component: `<Resource>Item` hoặc `<Resource>Detail` (ví dụ `PlanProductItem`, `RecipeItemResponse`).
- Tag: Danh từ số ít viết hoa (ví dụ `Product`, `ProductionPlan`, `Material`).

### Bước 6: Sinh file OpenAPI hoàn chỉnh
1. Sinh file `openapi.yaml` đầy đủ `info`, `servers`, `tags`, `paths`, `components.schemas`.

---

# 4. Quy chuẩn Định dạng Đầu ra (Output OpenAPI Specification)

```yaml
openapi: 3.0.3
info:
  title: Production Planner API
  version: 1.0.0
servers:
  - url: /
tags:
  - name: Product
    description: Quản lý sản phẩm

paths:
  /v0/api/products:
    post:
      tags: [Product]
      operationId: createProduct
      summary: Tạo mới sản phẩm
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateProductRequest'
      responses:
        "201":
          description: Thành công
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductItem'
        "400":
          description: Lỗi dữ liệu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    # --- 1. Base Shared Request Components ---
    SoftDeleteDateRequest:
      type: object
      required: [deleteFrom]
      properties:
        deleteFrom:
          type: string
          format: date
          description: Ngày bắt đầu ngừng sử dụng
        deleteTo:
          type: string
          format: date
          default: "9999-12-31"
          description: Ngày kết thúc ngừng sử dụng

    BaseProductVersionRequest:
      type: object
      required: [name, sellingUnit, costPrice, startDate, endDate, recipe]
      properties:
        name:
          type: string
          maxLength: 100
        sellingUnit:
          type: string
        costPrice:
          type: number
          format: double
        sellingPrice:
          type: number
          format: double
        startDate:
          type: string
          format: date
        endDate:
          type: string
          format: date
        recipe:
          type: array
          items:
            $ref: '#/components/schemas/RecipeItemRequest'

    # --- 2. Concrete Request DTOs (Composed via allOf) ---
    CreateProductRequest:
      allOf:
        - $ref: '#/components/schemas/BaseProductVersionRequest'

    CreateProductVersionRequest:
      allOf:
        - $ref: '#/components/schemas/BaseProductVersionRequest'
        - type: object
          properties:
            productId:
              type: integer
              format: int64
            productCode:
              type: string

    SoftDeleteProductRequest:
      allOf:
        - $ref: '#/components/schemas/SoftDeleteDateRequest'
        - type: object
          required: [productId]
          properties:
            productId:
              type: integer
              format: int64
```

---

# 5. Ràng buộc An toàn & Best Practices (Guardrails)

* **Tách Base Component triệt để:** Nếu 2 Request có cùng tập thuộc tính (hoặc 1 Request là tập mở rộng của Request khác), phải tách thành Base Component và dùng `allOf`.
* **Không bịa trường dữ liệu:** Chỉ đưa vào DTO các trường có trong tài liệu thiết kế.
* **Tái sử dụng Schema:** Luôn module hóa các sub-object (như recipe, daily items) để các DTO khác nhau có thể tham chiếu lại.
* **Không lộ trường nội bộ:** Loại bỏ `deleted_at`, `password_hash` khỏi Response DTO.
* **Giải thích quyết định thiết kế:** Trong phản hồi, liệt kê rõ các Base Component đã được tách và danh sách các Request DTO kế thừa.

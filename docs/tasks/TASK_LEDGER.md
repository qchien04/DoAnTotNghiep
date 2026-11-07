# 📒 SỔ THEO DÕI NHIỆM VỤ & KỸ NĂNG (TASK & SKILL LEDGER)
> **Dự án**: StayConnect - Hệ thống quản lý nhà trọ & Ghép bạn ở cùng phòng  
> **Mục tiêu**: Lưu vết toàn bộ chu trình phát triển: Phân rã task, Skill thực hiện, Trạng thái phê duyệt (HITL), Thay đổi mã nguồn và Phản hồi cải tiến (Feedback Loop).

---

## 📊 BẢNG TỔNG QUAN TIẾN ĐỘ (TASK DASHBOARD)

| Mã Task | Tên Nhiệm Vụ | Phân Hệ | Skill Thực Hiện | Trạng Thái | Ngày Cập Nhật |
| :--- | :--- | :--- | :--- | :---: | :---: |
| `TASK-KYC-01-DB` | Thiết kế CSDL & Flyway Migration cho KYC CCCD | User / Profile | `generate-flyaway-database-migration` | `COMPLETED` | 2026-10-13 |
| `TASK-KYC-02-BE` | REST API Upload CCCD & Quản lý KYC | User / Profile | `implement-backend-module`, `auth-rbac-architect-develop-jwt` | `COMPLETED` | 2026-10-13 |
| `TASK-KYC-04-DB` | Ràng buộc Unique Số CCCD ở CSDL (Flyway V4) | Database / User | `generate-flyaway-database-migration` | `COMPLETED` | 2026-10-13 |
| `TASK-KYC-05-BE` | Kiểm tra trùng lặp 1 CCCD = 1 Tài khoản & Đồng bộ | User / KYC | `implement-backend-module` | `COMPLETED` | 2026-10-13 |
| `TASK-KYC-AI` | Microservice Python DeepFace & Quét QR CCCD | AI / Python | `custom-python-service` | `COMPLETED` | 2026-10-13 |
| `TASK-KYC-06-BE` | REST API Tích Hợp Xác Thực AI KYC | User / KYC | `implement-backend-module` | `COMPLETED` | 2026-10-13 |
| `TASK-KYC-03-FE` | Giao diện Upload CCCD & Quay Camera Đối Soát AI | Toàn sàn | `implement-frontend-module` | `HUMAN_REVIEW` | 2026-10-13 |
| `TASK-LANDLORD-VERIFY-01` | Xác minh Chủ trọ: Giấy tờ nhà đất/ủy quyền, duyệt xác minh, huy hiệu & chặn đăng tin | Landlord / Admin | `implement-backend-module`, `implement-frontend-module` | `COMPLETED` | 2026-11-07 |
| `TASK-ROOM-MODERATION-01` | Đánh giá rủi ro tin đăng, Watermark, dHash phát hiện trùng lặp & Khóa tin trộm ảnh | Room / Moderation | `implement-backend-module`, `auth-rbac-architect-develop-jwt` | `COMPLETED` | 2026-11-07 |
| `TASK-ROOM-MODERATION-02` | Bảng kiểm duyệt Admin: Điểm rủi ro từng dấu hiệu, Duyệt/Từ chối & Lịch sử chỉnh sửa Audit Log | Admin / Moderation | `implement-backend-module`, `implement-frontend-module` | `COMPLETED` | 2026-11-07 |
| `TASK-CHAT-REALTIME-01` | Giao diện Chat Realtime, SafeChat AI lọc nội dung & Banner cảnh báo tin nhắn bị chặn | Tenant / Landlord / Chat | `implement-frontend-module` | `COMPLETED` | 2026-11-07 |
| `TASK-KYC-07-AI-UPGRADE` | Nâng cấp eKYC AI: ArcFace + RetinaFace, Tiền xử lý CCCD, Liveness 3 tầng & Bảo mật Vector 512 chiều | Toàn sàn / eKYC | `implement-backend-module`, `implement-frontend-module` | `COMPLETED` | 2026-11-07 |


*Quy ước trạng thái*:  
- `TODO`: Đang phân rã / Chưa bắt đầu.
- `PLAN_REVIEW`: Đã sinh Plan / Spec, chờ Human duyệt (Gateway 2).
- `IN_PROGRESS`: Đang thực thi bằng Skill sinh Code.
- `VERIFYING`: Đang chạy `mvn test-compile` / `npm run build` / Unit Test.
- `HUMAN_REVIEW`: Chờ Human nghiệm thu thực tế & feedback (Gateway 3).
- `COMPLETED`: Đã hoàn thành đạt chuẩn Definition of Done (DOD).
- `REFINED`: Đã áp dụng feedback chỉnh sửa (Code hoặc Skill).

---

## 🛠️ DANH MỤC SKILL ĐÃ ĐĂNG KÝ VÀ SỬ DỤNG (SKILL REGISTRY)

| Tên Skill | Vị Trí Lưu Trữ | Vai Trò Chính | Đầu Vào (Input) | Đầu Ra (Output) |
| :--- | :--- | :--- | :--- | :--- |
| `detail-design-master` | `.agents/detail-design-master` | Đặc tả chi tiết màn hình (Step 1-5) | Đặc tả sơ bộ, Use case | `docs/detail_design/*.md`, Mockup HTML |
| `generate-api-spec` | `.agents/generate-api-spec` | Tạo OpenAPI / Swagger v3 | Detail Design Spec | `openapi.yaml`, Request/Response DTOs |
| `generate-flyaway-database-migration` | `.agents/generate-flyaway-database-migration` | Sinh file Flyway Migration | Table Spec, DDL | `V{N}__*.sql`, `schema.sql`, `data.sql` |
| `generate-backend-implementation-plan` | `.agents/generate-backend-implementation-plan` | Lập kế hoạch kỹ thuật Backend | Detail Design, `openapi.yaml` | `backend_implementation_plan.md` |
| `implement-backend-module` | `.agents/implement-backend-module` | Sinh mã nguồn Spring Boot & MyBatis | Backend Implementation Plan | Entity, Mapper, XML, Service, Controller |
| `auth-rbac-architect-develop-jwt` | `.agents/auth-rbac-architect-develop-jwt` | Gắn phân quyền JWT & RBAC Guard | Controller, Module mới | `@PreAuthorize`, Permissions, Data filters |
| `generate-frontend-implementation-plan` | `.agents/generate-frontend-implementation-plan` | Lập kế hoạch kỹ thuật Frontend | Detail Design, Wireframe, API | `frontend_implementation_plan.md` |
| `implement-frontend-module` | `.agents/implement-frontend-module` | Sinh mã React + TS + Tailwind Theme | Frontend Implementation Plan | Components, Pages, Services, Hooks |
| `generate-test-plan` | `.agents/generate-test-plan` | Lập ma trận kiểm thử chi tiết | Detail Design, API contract | `test_plan.md` (Test Case IDs) |
| `excute-test-plan` | `.agents/excute-test-plan` | Chạy test tự động & lập báo cáo | `test_plan.md` | `test_report.md` (Pass/Fail matrix) |
| `compare-docs-with-source` | `.agents/compare-docs-with-source` | Đối soát tài liệu và Source Code | Tài liệu .md và git repo | Báo cáo chênh lệch & cảnh báo drift |

---

## 📜 NHẬT KÝ CHI TIẾT CÁC TASK ĐÃ THỰC THI (TASK LOGS)

### 🟢 [TASK-KYC-01-DB] Migration CSDL Lưu Trữ Hồ Sơ KYC CCCD
- **Thời gian**: 2026-10-13 | **Actor**: Tenant, Landlord, Admin
- **Mục tiêu**: Tạo bảng `kyc_documents` để lưu trữ ảnh CCCD mặt trước/sau và trạng thái phê duyệt danh tính.
- **Skill đã dùng**: `generate-flyaway-database-migration`
- **Tài liệu đầu vào**: Yêu cầu nghiệp vụ KYC từ Actor User & Tenant.
- **Tệp thay đổi (Artifacts & Source)**:
  - [`backend/src/main/resources/db/migration/V3__create_kyc_documents.sql`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/db/migration/V3__create_kyc_documents.sql)
  - [`backend/src/main/resources/schema.sql`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/schema.sql)
- **Kiểm tra tiêu chuẩn (DOD)**:
  - [x] Có khóa ngoại liên kết `user_id` tới bảng `users`
  - [x] Có trường lưu link ảnh mặt trước, mặt sau, số CCCD, họ tên, ngày sinh
  - [x] Trạng thái hỗ trợ: `PENDING`, `VERIFIED`, `REJECTED`
- **Kết quả nghiệm thu**: ✅ PASS - Database schema đồng bộ.

---

### 🟢 [TASK-KYC-02-BE] REST API Upload Ảnh CCCD & Quản Lý Hồ Sơ KYC
- **Thời gian**: 2026-10-13 | **Actor**: Tenant, Landlord, Admin
- **Mục tiêu**: Cung cấp API upload file ảnh CCCD, trích xuất dữ liệu, lưu trữ hồ sơ và Admin phê duyệt KYC.
- **Skill đã dùng**: `implement-backend-module`, `auth-rbac-architect-develop-jwt`
- **Tài liệu đầu vào**: `V3__create_kyc_documents.sql`
- **Tệp thay đổi (Artifacts & Source)**:
  - Backend Controller & Service: `KycController.java`, `KycService.java`
  - Mapper & SQL: `KycMapper.java`, `KycMapper.xml`
  - DTO: `KycSubmitRequest.java`, `KycResponse.java`
- **Kiểm tra tiêu chuẩn (DOD)**:
  - [x] Hỗ trợ upload ảnh MultipartFile hoặc link lưu trữ
  - [x] Gắn quyền `@PreAuthorize("isAuthenticated()")` cho người nộp và `@PreAuthorize("hasRole('ADMIN')")` cho người duyệt
  - [x] Validate định dạng file ảnh (PNG, JPG) và kích thước tối đa
  - [x] `mvn test-compile` BUILD SUCCESS
- **Human Feedback & Refinements**:
  - *Feedback*: Đảm bảo bảo mật ảnh CCCD, không lộ public URL tùy tiện.
  - *Chỉnh sửa*: Đã tích hợp token claim và xác thực quyền sở hữu `userId` khi xem chi tiết.
- **Kết quả nghiệm thu**: ✅ PASS - Backend API sẵn sàng cho Frontend tích hợp.

### 🟢 [TASK-LANDLORD-VERIFY-01] Xác minh Danh tính & Hồ sơ Pháp lý Chủ trọ
- **Thời gian**: 2026-11-07 | **Actor**: Landlord, Admin, Tenant
- **Mục tiêu**:
  - BE: API upload giấy tờ nhà/đất (Sổ đỏ / Sổ hồng) hoặc Hợp đồng ủy quyền quản lý/cho thuê vào vùng an toàn bảo mật.
  - BE: Admin duyệt xác minh chủ trọ, cấp huy hiệu "Chủ trọ xác minh", chặn đăng tin/tạo phòng nếu chưa qua xác minh.
  - FE: Trang nộp giấy tờ chủ trọ (`/landlord/verification`) với 4 trạng thái (Chưa nộp, Chờ duyệt, Đã duyệt, Bị từ chối).
  - FE: Trang quản trị duyệt xác minh (`/admin/verifications`) hỗ trợ bộ lọc, tìm kiếm, lightbox soi ảnh chi tiết (xoay/zoom/flip) và duyệt/từ chối.
- **Skill đã dùng**: `implement-backend-module`, `implement-frontend-module`
- **Tệp thay đổi (Outputs)**:
  - Database: `schema.sql`, `data.sql`
  - Backend Entities & Repositories: `LandlordVerification.java`, `LandlordVerificationDocument.java`, `LandlordVerificationType.java`, `LandlordVerificationStatus.java`, `User.java`, `LandlordVerificationRepository.java`, `LandlordVerificationDocumentRepository.java`
  - Backend DTOs: `LandlordVerificationResponse.java`, `LandlordVerificationDocumentResponse.java`, `LandlordVerificationRejectRequest.java`, `LandlordVerificationOverviewStats.java`, `UserDto.java`, `RoomResponse.java`
  - Backend Service & Controllers: `LandlordVerificationService.java`, `LandlordVerificationServiceImpl.java`, `LandlordVerificationController.java`, `AdminVerificationController.java`, `LandlordRoomServiceImpl.java`
  - Frontend Types & Services: `landlordVerification.ts`, `auth.ts`, `landlordVerificationService.ts`
  - Frontend Pages & Components: `LandlordVerificationPage.tsx`, `AdminVerificationsPage.tsx`, `VerifiedLandlordBadge.tsx`, `RoomListPage.tsx`, `LandlordLayout.tsx`, `AdminLayout.tsx`, `AppRoutes.tsx`
- **Definition of Done (DOD)**:
  - [x] Backend biên dịch sạch: `mvn test-compile` (BUILD SUCCESS, 0 lỗi).
  - [x] Frontend biên dịch sạch: `npm run build` (tsc -b && vite build hoàn thành, 0 lỗi TypeScript).
  - [x] Chặn đăng tin nếu chưa qua xác minh (`LANDLORD_NOT_VERIFIED` và giao diện cảnh báo).
  - [x] Gắn huy hiệu Chủ trọ xác minh chuyên nghiệp với Semantic Tokens thích ứng 6 Theme & Dark Mode.
- **Trạng thái**: `COMPLETED`

---
- **Thời gian**: 2026-10-13 | **Actor**: Toàn sàn (Admin, Landlord, Tenant)
- **Mục tiêu**: Bổ sung cột `id_card_number` vào bảng `users` kèm ràng buộc `UNIQUE` và Index tối ưu hóa truy vấn.
- **Skill đã dùng**: `generate-flyaway-database-migration`
- **Tài liệu tham chiếu**: Yêu cầu nghiệp vụ "1 CCCD = 1 tài khoản duy nhất".
- **Tệp thay đổi (Outputs)**:
  - [`backend/src/main/resources/db/migration/V4__add_id_card_to_users_and_constraints.sql`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/db/migration/V4__add_id_card_to_users_and_constraints.sql)
  - [`backend/src/main/resources/schema.sql`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/schema.sql)
- **Definition of Done (DOD)**:
  - [x] Tạo cột `id_card_number VARCHAR(30)` trên bảng `users`
  - [x] Ràng buộc `uq_users_id_card_number UNIQUE (id_card_number)`
  - [x] Index `idx_users_id_card_number` và `idx_kyc_documents_id_card_number`
- **Kết quả nghiệm thu**: ✅ PASS - CSDL có ràng buộc cứng chống duplicate.

---

### 🟡 [TASK-KYC-05-BE] Nghiệp vụ Kiểm tra Trùng lặp CCCD & Đồng bộ Tài khoản
- **Thời gian**: 2026-10-13 | **Actor**: Toàn sàn (Admin, Landlord, Tenant)
- **Mục tiêu**: Ngăn chặn upload CCCD trùng với tài khoản khác ở cả 2 bảng `users` và `kyc_documents`, đồng bộ số CCCD vào Entity `User`.
- **Skill đã dùng**: `implement-backend-module`
- **Tài liệu tham chiếu**: `V4__add_id_card_to_users_and_constraints.sql`, `ErrorCode.java`
- **Tệp thay đổi (Outputs)**:
  - Entity: [`backend/src/main/java/com/doan/core/business/entity/User.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/entity/User.java)
  - Exception: [`backend/src/main/java/com/doan/core/common/exception/ErrorCode.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/common/exception/ErrorCode.java) (Thêm `ID_CARD_ALREADY_EXISTS`)
  - Repositories: [`UserRepository.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/repository/UserRepository.java), [`KycDocumentRepository.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/repository/KycDocumentRepository.java)
  - Service: [`KycServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/KycServiceImpl.java)
- **Definition of Done (DOD)**:
  - [x] Phương thức `validateAndNormalizeIdCardNumber` kiểm tra `users` và `kyc_documents` loại trừ user hiện tại
  - [x] Bắn ngoại lệ `ID_CARD_ALREADY_EXISTS` (HTTP 409 Conflict) khi phát hiện trùng số
  - [x] Tự động đồng bộ `user.setIdCardNumber(...)` khi người dùng upload hồ sơ hợp lệ
  - [x] Kiểm tra biên dịch: `mvn test-compile` BUILD SUCCESS (168 source files, 0 lỗi)
- **Điểm kiểm duyệt Human-In-The-Loop**:
  - Gate 1 (Duyệt Phân rã): [x] Đã duyệt ngày 2026-10-13
  - Gate 2 (Duyệt Kế hoạch): [x] Đã duyệt ngày 2026-10-13
  - Gate 3 (Nghiệm thu kết quả): [ ] Chờ review thực tế từ người dùng
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-KYC-AI] Microservice Python DeepFace & Quét Mã QR CCCD Chip
- **Thời gian**: 2026-10-13 | **Phân hệ**: AI / Python Microservice (:8001)
- **Mục tiêu**: Xây dựng service FastAPI phân tích dữ liệu CCCD gắn chip (ZXing-C++ / OpenCV) và so khớp khuôn mặt từ ảnh thẻ với video/ảnh trực tiếp (DeepFace).
- **Skill đã dùng**: Custom Python Service / DeepFace
- **Tệp thay đổi (Outputs)**:
  - [`ai_service/app.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/app.py): Entrypoint FastAPI (Endpoint `/api/ai/kyc/verify`, `/api/ai/kyc/scan-qr`, `/health`)
  - [`ai_service/services/qr_scanner.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/services/qr_scanner.py): Trích xuất chuỗi QR CCCD 7 trường dữ liệu chuẩn Việt Nam
  - [`ai_service/services/face_verifier.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/services/face_verifier.py): Trích xuất best frame từ video và so khớp khuôn mặt qua DeepFace (VGG-Face / Cosine distance)
  - [`ai_service/run.bat`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/run.bat), [`ai_service/requirements.txt`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/requirements.txt)
- **Definition of Done (DOD)**:
  - [x] Service chạy ổn định trên cổng 8001 (`GET /health` trả về UP)
  - [x] Trích xuất đầy đủ thông tin định danh từ QR CCCD (Số CCCD, Họ tên, Ngày sinh, Giới tính, Thường trú, Ngày cấp)
  - [x] So khớp khuôn mặt DeepFace trả về `verified`, `similarity_score`, `distance`, `threshold`
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-KYC-06-BE] REST API Tích Hợp Xác Thực AI KYC Trên Spring Boot
- **Thời gian**: 2026-10-13 | **Phân hệ**: User / KYC / Spring Boot (:8080)
- **Mục tiêu**: Bổ sung endpoint multipart nhận ảnh CCCD và video khuôn mặt, gọi sang Python AI Service, kiểm tra trùng lặp số CCCD, lưu trữ an toàn và cập nhật hồ sơ người dùng.
- **Skill đã dùng**: `implement-backend-module`, `auth-rbac-architect-develop-jwt`
- **Tệp thay đổi (Outputs)**:
  - Controller: [`KycController.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/controller/KycController.java) (Thêm `POST /api/v1/secure/kyc/verify-ai`)
  - Service: [`KycService.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/KycService.java), [`KycServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/KycServiceImpl.java)
  - Client: [`KycAiServiceClient.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/KycAiServiceClient.java)
  - DTO: [`QrCccdInfo.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/dto/kyc/QrCccdInfo.java), [`FaceVerificationInfo.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/dto/kyc/FaceVerificationInfo.java), [`KycAiVerificationResponse.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/dto/kyc/KycAiVerificationResponse.java)
  - Config: [`application.yml`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/application.yml)
- **Definition of Done (DOD)**:
  - [x] Endpoint `POST /api/v1/secure/kyc/verify-ai` nhận `frontCard`, `backCard`, `faceFile`
  - [x] Chuyển tiếp multipart sang Python AI service và xử lý fallback an toàn
  - [x] Kiểm tra duy nhất số CCCD và tự động cập nhật User nếu xác thực thành công
- **Trạng thái**: `COMPLETED`

---

### 🟡 [TASK-KYC-03-FE] Giao Diện Xác Thực eKYC (Webcam Quay Phim + Upload CCCD + Xem Kết Quả AI)
- **Thời gian**: 2026-10-13 | **Phân hệ**: Frontend React + TypeScript
- **Mục tiêu**: Xây dựng trang KYC thông minh theo Step-Wizard: Tải ảnh CCCD 2 mặt, bật Webcam quay video 3 giây nhận diện khuôn mặt (WebRTC MediaRecorder), gửi BE và hiển thị kết quả AI (QR info + DeepFace Match Score).
- **Skill đã dùng**: `implement-frontend-module`
- **Tệp thay đổi (Outputs)**:
  - Page: [`KycVerificationPage.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/features/user/pages/KycVerificationPage.tsx)
  - Route: [`AppRoutes.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/routes/AppRoutes.tsx) (`/kyc`, `/profile/kyc`)
  - Integration: [`ProfilePage.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/features/user/pages/ProfilePage.tsx) (Thêm nút điều hướng Xác thực CCCD)
  - Types & Service: [`kyc.ts`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/shared/types/kyc.ts), [`kycService.ts`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/shared/services/kycService.ts), [`auth.ts`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/shared/types/auth.ts)
- **Definition of Done (DOD)**:
  - [x] Giao diện chuẩn Semantic Theme tokens (`bg-stay-*`, `text-stay-*`, `border-stay-*`, Midnight Dark)
  - [x] Tích hợp Camera trực tiếp, khung oval định vị khuôn mặt, đếm ngược và quay video 3 giây
  - [x] Hỗ trợ upload ảnh/video dự phòng nếu thiết bị không có camera
  - [x] Bảng kết quả hiển thị thông tin QR trích xuất và tỷ lệ khớp DeepFace
  - [x] `npm run build` hoàn thành sạch (✓ built in 18.23s, 0 lỗi TypeScript)
- **Điểm kiểm duyệt Human-In-The-Loop**:
  - Gate 1 (Duyệt Phân rã): [x] Đã duyệt ngày 2026-10-13
  - Gate 2 (Duyệt Kế hoạch): [x] Đã duyệt ngày 2026-10-13
  - Gate 3 (Nghiệm thu kết quả): [ ] Chờ nghiệm thu thực tế từ người dùng
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-FEEDBACK-FIX-01] Sửa Lỗi Email OTP, Route KYC /verify, và Luồng Camera "Vừa Quay Vừa Xác Thực"
- **Thời gian**: 2026-10-14 | **Phân hệ**: Toàn sàn (Backend, Frontend, AI Service, Workflow)
- **Mục tiêu**: Khắc phục triệt để 3 vấn đề theo phản hồi của người dùng:
  1. Đăng ký tài khoản không gửi email OTP.
  2. Bấm "Xác thực danh tính" ở menu bị điều hướng về Home.
  3. Video selfie không hiển thị lên màn hình khi quay, API từ chối video, luồng xác thực chưa chuẩn.
  4. Đúc kết bài học, chuẩn hóa Skill và Workflow guidelines.
- **Skill đã dùng**: `implement-backend-module`, `implement-frontend-module`
- **Tệp thay đổi (Outputs)**:
  - Backend Email & OTP:
    - [`backend/src/main/resources/application.yml`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/application.yml): Bổ sung cấu hình `spring.mail` chuẩn (host: smtp.gmail.com, port: 587, auth: true, starttls: true).
    - [`EmailServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/EmailServiceImpl.java): Kiểm tra `mailPassword`, ghi log console rõ ràng nếu thiếu cấu hình.
    - [`AuthController.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/controller/AuthController.java), [`InMemoryOtpServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/InMemoryOtpServiceImpl.java): Trả về OTP gợi ý trong dev mode khi chưa có password SMTP để không chặn luồng đăng ký.
    - [`SecureStorageServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/SecureStorageServiceImpl.java): Mở rộng hỗ trợ video MIME (`video/webm`, `video/mp4`, ...) và nâng giới hạn kích thước tệp lên 50MB.
  - Frontend Routing & Camera Verification:
    - [`AppRoutes.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/routes/AppRoutes.tsx): Bổ sung route `/verify` trỏ vào `KycVerificationPage`.
    - [`KycVerificationPage.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/features/user/pages/KycVerificationPage.tsx):
      + Sửa lỗi camera lifecycle: Dùng `useEffect` và callback ref để video stream hiện ngay trên màn hình.
      + Quy trình "Vừa quay vừa xác thực cho chuẩn": Hiệu ứng laser scan 3D liveness trong 3s, tự động chụp canvas HD snapshot ở độ phân giải gốc của camera.
      + Vừa quay xong tự động kích hoạt API xác thực AI và chuyển sang màn hình phân tích trực quan.
    - [`RegisterPage.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/features/auth/pages/RegisterPage.tsx), [`ForgotPasswordPage.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/features/auth/pages/ForgotPasswordPage.tsx), [`authService.ts`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/shared/services/authService.ts): Tự động điền OTP gợi ý trong dev mode.
  - AI Python Service:
    - [`qr_scanner.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/services/qr_scanner.py): Nâng cấp sang mô hình CNN `cv2.wechat_qrcode_WeChatQRCode()` làm bộ quét ưu tiên hàng đầu, kết hợp ROI góc thẻ CCCD và bộ lọc CLAHE chống lóa sáng.
    - [`face_verifier.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/services/face_verifier.py): Lưu video đúng đuôi WebM/MP4, fallback trích xuất frame an toàn.
  - Workflow Guidelines:
    - [`.agents/WORKFLOW_GUIDELINES.md`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/.agents/WORKFLOW_GUIDELINES.md): Bổ sung mục 5 Technical Safeguards (WebRTC DOM Lifecycle, Media Storage, Email Fallback, Route Linkage).
- **Definition of Done (DOD)**:
  - [x] Đăng ký gửi OTP qua Gmail hoặc Dev Fallback thông minh không bị nghẽn
  - [x] Nhấn vào "Xác thực danh tính" ở menu mở trực tiếp trang `/verify`
  - [x] Camera hiển thị rõ nét trên màn hình khi quay video khuôn mặt kèm hiệu ứng laser scan
  - [x] Luồng 3 bước hoàn chỉnh: Tải CCCD ➔ Xem thông tin QR trích xuất ➔ Xác thực khuôn mặt DeepFace
  - [x] Cơ chế Dual Fallback cho quét QR (Backend 8080 + Python 8001), không chặn luồng nếu QR bị mờ
  - [x] `npm run build` hoàn thành sạch (✓ built in 24.18s, 0 lỗi TypeScript)
  - [x] Cập nhật tài liệu quy chuẩn và lưu vết Ledger
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-ROOM-MODERATION-01] Đánh giá rủi ro tin đăng, Watermark, dHash phát hiện trùng lặp & Khóa tin trộm ảnh
- **Thời gian**: 2026-11-07 | **Actor/Phân hệ**: Room / Landlord / Admin / Public
- **Mục tiêu**:
  - Validate bắt buộc phía server: Giá điện, nước, cọc, tối thiểu 3 ảnh.
  - Upload ảnh, tính perceptual hash (dHash 64-bit), phát hiện ảnh trùng với tin khác (khoảng cách Hamming <= 8).
  - Tính điểm rủi ro rule-based (0 - 100 điểm) quét SĐT, link mạng xã hội, STK ngân hàng, cụm từ ép cọc giữ chỗ và bất thường giá.
  - Phân luồng theo điểm: < 30 tự động duyệt (`APPROVED`) / 30–60 chờ admin (`PENDING_REVIEW`) / > 60 từ chối (`REJECTED`).
  - Watermark tự động lên ảnh khi hiển thị qua endpoint stream bảo vệ, lưu ảnh gốc trong private storage.
  - Phát hiện ảnh chủ trọ A xuất hiện trong tin chủ trọ B → khóa tin B ngay lập tức (`LOCKED_STOLEN_IMAGES`, `STOPPED`, 100 điểm).
- **Skill sử dụng**: `implement-backend-module`, `auth-rbac-architect-develop-jwt`
- **Tệp thay đổi (Outputs)**:
  - Backend Entities & Repositories: `Room.java`, `RoomImage.java`, `RoomRepository.java`, `RoomImageRepository.java`
  - DTOs: `RoomRequest.java`, `RoomResponse.java`, `RoomImageUploadResponse.java`, `RoomRiskEvaluationResult.java`
  - Utilities: `ImageHashUtil.java`, `ImageWatermarkUtil.java`, `ContentRiskDetector.java`
  - Services: `RoomRiskScoringService.java`, `RoomRiskScoringServiceImpl.java`, `LandlordRoomService.java`, `LandlordRoomServiceImpl.java`
  - Controllers: `PublicRoomImageController.java`, `LandlordRoomController.java`, `AdminRoomModerationController.java`
  - Config & Exceptions: `SecurityConstants.java`, `ErrorCode.java`
  - Unit Tests: `RoomRiskScoringServiceTest.java` (9/9 pass)
- **Definition of Done (DOD)**:
  - [x] Server-side validation đầy đủ: Giá điện, nước, cọc, tối thiểu 3 ảnh.
  - [x] Thuật toán dHash 64-bit và so khớp khoảng cách Hamming.
  - [x] Phát hiện SĐT, link MXH, STK/ép cọc giục chuyển khoản.
  - [x] Phân luồng: < 30 tự duyệt, 30-60 chờ admin duyệt, > 60 từ chối.
  - [x] Watermark động bảo vệ bản quyền StayConnect, che giấu ảnh gốc.
  - [x] Khóa tin chủ trọ B khi sao chép ảnh của chủ trọ A.
  - [x] Biên dịch sạch và pass 9 unit tests: `mvn test -Dtest=RoomRiskScoringServiceTest` -> `BUILD SUCCESS`.
  - [x] Frontend `npm run build` không lỗi TypeScript.
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-ROOM-MODERATION-02] Bảng kiểm duyệt Admin: Điểm rủi ro từng dấu hiệu, Duyệt/Từ chối & Lịch sử chỉnh sửa Audit Log
- **Thời gian**: 2026-11-07 | **Actor/Phân hệ**: Admin / Room / Audit Log
- **Mục tiêu**:
  - BE: API Admin lấy danh sách tin chờ duyệt, xem chi tiết điểm rủi ro và các dấu hiệu vi phạm (`GET /api/v1/admin/rooms/moderation`, `GET /api/v1/admin/rooms/{id}/moderation-detail`).
  - BE: API Admin duyệt/từ chối kèm lý do, tự động ghi nhận nhật ký Audit (`POST /api/v1/admin/rooms/{id}/approve`, `POST /api/v1/admin/rooms/{id}/reject`, `POST /api/v1/admin/rooms/{id}/unlock`).
  - BE: Bảng CSDL `room_audit_logs`, Entity, Repository và Service tự động lưu vết các hành động `CREATED`, `UPDATED`, `MODERATION_APPROVED`, `MODERATION_REJECTED`, `MODERATION_UNLOCKED`.
  - FE: Bảng kiểm duyệt tin đăng phòng trọ (`AdminRoomModerationPage.tsx`):
    - 4 thẻ thống kê số liệu tin chờ duyệt, trộm ảnh vi phạm, từ chối, đã duyệt.
    - Bộ lọc trạng thái & thanh tìm kiếm tức thì.
    - Bảng thông tin: Tên phòng, ID, Chủ trọ kèm badge xác minh, Đơn giá điện/nước/cọc, Badge điểm rủi ro.
    - Modal kiểm duyệt toàn diện: Thanh đo điểm rủi ro trực quan, danh sách luật vi phạm từng dấu hiệu (SĐT, link MXH, STK ngân hàng/ép cọc, đơn giá bất thường, trộm ảnh), thư viện ảnh watermarked.
  - FE: Tab xem lịch sử chỉnh sửa & Timeline Audit Log chi tiết của từng tin đăng (ai sửa, sửa gì, lý do và thời gian).
- **Skill sử dụng**: `implement-backend-module`, `implement-frontend-module`
- **Tệp thay đổi (Outputs)**:
  - Database: `schema.sql`, `data.sql` (bảng `room_audit_logs`, indexes, sequences, seed logs).
  - Backend Entities & Repositories: `RoomAuditLog.java`, `RoomAuditLogRepository.java`.
  - Backend DTOs: `RoomAuditLogResponse.java`, `RoomModerationDetailResponse.java`.
  - Backend Services: `RoomAuditLogService.java`, `RoomAuditLogServiceImpl.java`, `LandlordRoomServiceImpl.java`.
  - Backend Controller: `AdminRoomModerationController.java`.
  - Frontend Types & Services: `roomModeration.ts`, `roomModerationService.ts`.
  - Frontend Pages & Layout: `AdminRoomModerationPage.tsx`, `AdminLayout.tsx`, `AppRoutes.tsx`.
- **Definition of Done (DOD)**:
  - [x] API Admin lấy danh sách & chi tiết điểm rủi ro.
  - [x] API Admin duyệt/từ chối kèm lý do và ghi Audit Log.
  - [x] Bảng kiểm duyệt FE xem tin, điểm rủi ro từng dấu hiệu, nút duyệt/từ chối.
  - [x] FE xem lịch sử chỉnh sửa Timeline của tin đăng khi kiểm duyệt.
  - [x] Tuân thủ 100% theme rules và semantic tokens.
  - [x] Backend `mvn test -Dtest=RoomRiskScoringServiceTest` -> `BUILD SUCCESS`.
  - [x] Frontend `npm run build` -> `built in 20.43s` 0 lỗi TypeScript.
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-CHAT-REALTIME-01] Giao diện Chat Realtime, SafeChat AI lọc nội dung & Banner cảnh báo tin nhắn bị chặn
- **Thời gian**: 2026-11-07 | **Actor/Phân hệ**: Tenant / Landlord / Admin / Chat Realtime
- **Mục tiêu**:
  - Giao diện chat trực tuyến realtime phong cách hiện đại với danh sách cuộc trò chuyện, bộ lọc Chủ trọ / Ở ghép / Hỗ trợ, tìm kiếm tức thì.
  - Khung chat chi tiết: Header người tham gia (Avatar, trạng thái online, huy hiệu xác minh, thẻ phòng đính kèm), bong bóng tin nhắn, chỉ báo người kia đang soạn tin ("Đang soạn tin nhắn..."), gợi ý tin nhắn nhanh (Quick reply chips).
  - Tích hợp bộ quét an toàn nội dung SafeChat AI: Quét số điện thoại, liên kết mạng xã hội (FB, Zalo, Telegram, TikTok...), số tài khoản ngân hàng và cụm từ ép cọc giữ chỗ ngoài sàn.
  - Hiển thị Banner cảnh báo nổi bật màu đỏ/cam khi tin nhắn bị chặn gửi: Giải thích rõ lý do vi phạm an toàn giao dịch, danh sách các yếu tố nhạy cảm phát hiện được và nút đóng.
  - Hiển thị tin nhắn bị chặn trong dòng thời gian với viền cảnh báo vi phạm và nội dung gạch ngang kèm tooltip.
  - Gắn shortcut Chat trên thanh điều hướng `StayConnectHeader` và định tuyến tại `/chat`.
- **Skill sử dụng**: `implement-frontend-module`
- **Tệp thay đổi (Outputs)**:
  - Types: `frontend/src/shared/types/chat.ts`
  - Safety Filter Utility: `frontend/src/shared/utils/chatContentFilter.ts`
  - Store: `frontend/src/features/chat/useChatStore.ts`
  - Page: `frontend/src/features/chat/pages/ChatPage.tsx`
  - Header & Navigation: `frontend/src/shared/components/StayConnectHeader.tsx`, `frontend/src/routes/AppRoutes.tsx`
- **Definition of Done (DOD)**:
  - [x] Giao diện chat realtime trực quan, phản hồi tức thì và tương thích thiết bị di động.
  - [x] Banner cảnh báo nổi bật khi tin nhắn vi phạm chính sách an toàn.
  - [x] Tin nhắn chứa SĐT/Link MXH/STK bị chặn gửi và đánh dấu cảnh báo vi phạm.
  - [x] Tuân thủ 100% Theme Rules và Semantic Tokens (`bg-stay-bg-app`, `bg-stay-card-bg`, `text-stay-text`, v.v.).
  - [x] Frontend `npm run build` hoàn thành sạch sẽ (`built in 17.07s`).
  - [x] Backend `BUILD SUCCESS` (9/9 unit tests pass).
- **Trạng thái**: `COMPLETED`

---

### 🟢 [TASK-KYC-07-AI-UPGRADE] Nâng cấp toàn diện chức năng eKYC: ArcFace + RetinaFace, Tiền xử lý CCCD, Liveness 3 tầng & Bảo mật Vector 512 chiều
- **Thời gian**: 2026-11-07 | **Actor/Phân hệ**: Toàn sàn / Xác thực danh tính eKYC / AI DeepFace
- **Mục tiêu**:
  - **Phần 1: Kéo độ chính xác DeepFace lên**:
    - Chuyển sang mô hình **ArcFace** và bộ phát hiện **RetinaFace**: `DeepFace.verify(..., model_name="ArcFace", detector_backend="retinaface", distance_metric="cosine", align=True)`.
    - Đánh giá trực tiếp giá trị `distance` và `threshold` (~0.68 của ArcFace) thay vì chỉ nhìn vào % thuần túy.
    - Tiền xử lý ảnh chân dung CCCD trước khi so khớp: Cắt (crop) khuôn mặt dư 18% viền padding quanh cằm và trán để RetinaFace căn chỉnh trục mắt; áp dụng `cv2.bilateralFilter(cropped, 9, 75, 75)` để làm mịn lớp vân bảo an in đè trên mặt thẻ.
    - Chuẩn hóa ảnh chụp Selfie phía Client: Hướng dẫn người dùng bỏ kính, không cười, giữ camera ngang tầm mắt, chọn nơi đủ sáng.
  - **Phần 2: Tích hợp hoàn chỉnh vào hệ thống phòng trọ**:
    - Verification Flow 3 bước:
      - Bước 1: Quét mã QR mặt trước thẻ CCCD bằng `wechat_qrcode` (lấy họ tên, số CCCD, ngày sinh, quê quán) không tốn chi phí, chuẩn 100%.
      - Bước 2: Kiểm tra người thật (Liveness Test) phía client trong quá trình ghi hình (hướng dẫn giữ thẳng và chớp mắt/nghiêng đầu nhẹ).
      - Bước 3: Chụp 1 frame selfie nét nhất gửi lên server kèm ảnh CCCD.
    - Cấu hình 3 tầng phân loại kết quả (3 Tiers Classification):
      - `distance < 0.40`: Tự động duyệt thành công (`AUTO_APPROVED`), cấp tick xanh ngay lập tức.
      - `0.40 <= distance <= 0.55`: Duyệt thành công nếu bài test người thật đạt điểm cao (`CONDITIONAL_LIVENESS`, Liveness >= 70%).
      - `distance > 0.55`: Báo người dùng chụp lại ở nơi đủ sáng hoặc đưa vào hàng đợi kiểm duyệt thủ công (`RETAKE_OR_MANUAL_REVIEW`).
    - Chính sách phân quyền & Quyền riêng tư (Privacy):
      - Ràng buộc eKYC bắt buộc với Chủ trọ đăng bài và Người tìm ở ghép; không ép buộc người chỉ vào lướt xem phòng.
      - Sau khi tính toán xong, chỉ lưu vector embedding (dãy số 512 chiều) và số CCCD (chống trùng lặp 1 người 1 CCCD) vào database; lưu trữ toàn bộ ảnh trong vùng an toàn `SecureStorageService` có kiểm tra phân quyền RBAC.
- **Tệp thay đổi (Outputs)**:
  - AI Service (Python):
    - [`ai_service/services/face_verifier.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/services/face_verifier.py): Tiền xử lý chân dung CCCD (crop 18% padding + bilateralFilter), ArcFace + RetinaFace, trích xuất vector embedding 512 chiều, phân tầng 3 cấp.
    - [`ai_service/app.py`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/ai_service/app.py): Tiếp nhận `liveness_score`, trả về `decision_tier`, `distance`, `threshold`.
  - Backend (Spring Boot 3 + Java 21):
    - [`backend/src/main/resources/schema.sql`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/resources/schema.sql): Cột `id_card_verified`, `face_embedding TEXT` trong `users`; cột `decision_tier`, `similarity_distance`, `liveness_score`, `face_embedding TEXT` trong `kyc_documents`.
    - [`User.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/entity/User.java), [`KycDocument.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/entity/KycDocument.java): Entity mapping.
    - [`FaceVerificationInfo.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/dto/kyc/FaceVerificationInfo.java), [`KycAiVerificationResponse.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/dto/kyc/KycAiVerificationResponse.java): DTOs phân tầng 3 cấp.
    - [`ErrorCode.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/common/exception/ErrorCode.java): Thêm mã lỗi `KYC_REQUIRED`.
    - [`KycAiServiceClient.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/KycAiServiceClient.java): Đọc decisionTier, distance, threshold, faceEmbedding, gửi livenessScore.
    - [`KycServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/KycServiceImpl.java): Xử lý 3 tầng phân loại, lưu vector 512 chiều và cấp tick xanh cho tài khoản.
    - [`TenantRoommateServiceImpl.java`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/backend/src/main/java/com/doan/core/business/service/impl/TenantRoommateServiceImpl.java): Bắt buộc eKYC khi tạo tin tìm người ở ghép (`createPostWithRoom`, `createPostWithoutRoom`).
  - Frontend (React 19 + TypeScript):
    - [`frontend/src/shared/types/kyc.ts`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/shared/types/kyc.ts): Types phân tầng 3 cấp, livenessScore, vector 512 chiều.
    - [`frontend/src/shared/services/kycService.ts`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/shared/services/kycService.ts): Hỗ trợ gửi `livenessScore`.
    - [`frontend/src/features/user/pages/KycVerificationPage.tsx`](file:///c:/Project/DATN-SeekRoomWeb/DoAnTotNghiep/frontend/src/features/user/pages/KycVerificationPage.tsx): Panel checklist chuẩn hóa ảnh chụp selfie (Bỏ kính, Không cười, Camera ngang tầm mắt, Đủ sáng), hướng dẫn Liveness chớp mắt trong camera, Dashboard hiển thị phản hồi 3 tầng phân loại trực quan.
- **Definition of Done (DOD)**:
  - [x] Đổi thành công sang mô hình ArcFace + RetinaFace (`retinaface.onnx` & `arcface_weights.onnx` chạy ONNX runtime).
  - [x] Tiền xử lý chân dung CCCD: Crop 18% padding quanh trán/cằm + `cv2.bilateralFilter` làm mịn hoa văn bảo an.
  - [x] Trích xuất và lưu trữ an toàn vector embedding 512 chiều vào database.
  - [x] Triển khai hoàn chỉnh 3 tầng phân loại kết quả: `< 0.40` duyệt ngay, `0.40 - 0.55` duyệt theo liveness, `> 0.55` thông báo chụp lại / manual review.
  - [x] Ràng buộc eKYC chỉ bắt buộc với Chủ trọ đăng bài và Người tìm ở ghép; người lướt xem phòng không bị chặn.
  - [x] Toàn bộ ảnh CCCD và Selfie được bảo mật an toàn qua `SecureStorageService`.
  - [x] Backend `mvn test-compile` -> **BUILD SUCCESS** (0 lỗi).
  - [x] Frontend `npm run build` -> **SUCCESS** (`built in 23.61s`, 0 lỗi TypeScript).
- **Trạng thái**: `COMPLETED`

---

## 📝 MẪU BIỂU GHI NHẬN TASK MỚI (NEW TASK TEMPLATE)


*Khi bắt đầu một task mới, copy mẫu dưới đây vào phần Nhật ký:*

```markdown
### 🟡 [MÃ-TASK] Tên Nhiệm Vụ Cụ Thể
- **Thời gian**: YYYY-MM-DD | **Actor/Phân hệ**: [Admin / Landlord / Tenant / Chung]
- **Mục tiêu**: [Mục tiêu nghiệp vụ cần đạt]
- **Skill sử dụng**: [`tên-skill-chính`, `tên-skill-bổ-trợ`]
- **Tài liệu tham chiếu (Inputs)**: [Link file spec / mockup / API docs]
- **Tệp thay đổi (Outputs)**:
  - [file1]
  - [file2]
- **Definition of Done (DOD)**:
  - [ ] Tiêu chí 1: ...
  - [ ] Tiêu chí 2: ...
  - [ ] Biên dịch sạch: `mvn test-compile` hoặc `npm run build` không lỗi
- **Điểm kiểm duyệt Human-In-The-Loop**:
  - Gate 1 (Duyệt Phân rã): [x] Đã duyệt ngày ...
  - Gate 2 (Duyệt Kế hoạch Implementation): [x] Đã duyệt ngày ...
  - Gate 3 (Nghiệm thu kết quả): [ ] Chờ review
- **Human Feedback & Bài học kinh nghiệm**:
  - *Phản hồi của người dùng*: ...
  - *Hành động khắc phục*: [Sửa code trực tiếp / Cập nhật file SKILL.md]
- **Trạng thái**: [TODO / IN_PROGRESS / HUMAN_REVIEW / COMPLETED]
```

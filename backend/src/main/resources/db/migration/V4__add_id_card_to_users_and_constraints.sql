-- =============================================================================
-- Migration V4: Thêm trường id_card_number và ràng buộc duy nhất (1 CCCD = 1 Tài khoản)
-- Đảm bảo mỗi số Căn cước công dân chỉ được liên kết với duy nhất một tài khoản
-- =============================================================================

-- 1. Bổ sung cột số CCCD vào bảng users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS id_card_number VARCHAR(30);

-- 2. Thêm ràng buộc UNIQUE cho số CCCD trên bảng users
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS uq_users_id_card_number;

ALTER TABLE users 
ADD CONSTRAINT uq_users_id_card_number UNIQUE (id_card_number);

-- 3. Tạo chỉ mục tối ưu tìm kiếm theo CCCD trên bảng users và kyc_documents
CREATE INDEX IF NOT EXISTS idx_users_id_card_number ON users (id_card_number);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_id_card_number ON kyc_documents (id_card_number);

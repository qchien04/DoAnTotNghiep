-- =============================================================================
-- Migration V3: Tạo bảng kyc_documents lưu trữ tài liệu xác thực (CCCD + Selfie)
-- Lưu trữ tại vùng riêng an toàn, không public ra ngoài
-- =============================================================================

CREATE TABLE IF NOT EXISTS kyc_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_key VARCHAR(100) NOT NULL UNIQUE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    id_card_number VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kyc_documents_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_kyc_documents_verifier FOREIGN KEY (verified_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_file_key ON kyc_documents (file_key);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents (status);

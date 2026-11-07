-- =============================================================================
-- Migration V5: Bổ sung cột updated_at vào bảng notifications để khớp với BaseEntity
-- =============================================================================

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

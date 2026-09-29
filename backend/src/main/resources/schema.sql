DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS roommate_application_lifestyle_answers CASCADE;
DROP TABLE IF EXISTS roommate_applications CASCADE;
DROP TABLE IF EXISTS roommate_post_lifestyle_answers CASCADE;
DROP TABLE IF EXISTS roommate_posts CASCADE;
DROP TABLE IF EXISTS user_lifestyle_answers CASCADE;
DROP TABLE IF EXISTS lifestyle_options CASCADE;
DROP TABLE IF EXISTS lifestyle_questions CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS tenant_link_invitations CASCADE;
DROP TABLE IF EXISTS contract_services CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS room_services CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS room_images CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS buildings CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- =============================================================================
-- HỆ THỐNG QUẢN LÝ NHÀ TRỌ HỖ TRỢ GHÉP NGƯỜI Ở CHUNG
-- DATABASE DDL (CHUẨN HÓA KIỂU DỮ LIỆU & QUAN HỆ KHÓA NGOẠI)
-- Hệ quản trị cơ sở dữ liệu: PostgreSQL 14+ / H2 In-Memory
-- =============================================================================

-- 1. Bảng người dùng hệ thống (Admin, Landlord, Tenant)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_TENANT',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    locked_reason VARCHAR(255),
    locked_until TIMESTAMP WITH TIME ZONE,
    avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(10),
    bio TEXT,
    lifestyle_vector VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng quản lý Refresh Token xác thực JWT
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Bảng Tòa nhà / Khu trọ
CREATE TABLE IF NOT EXISTS buildings (
    id BIGSERIAL PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    province VARCHAR(100),
    ward VARCHAR(100),
    address_detail VARCHAR(255) NOT NULL,
    num_floors INT NOT NULL DEFAULT 1,
    general_rules TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_buildings_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- 4. Bảng Phòng trọ
CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    building_id BIGINT,
    landlord_id BIGINT,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(100),
    ward VARCHAR(100),
    address_detail TEXT,
    floor INT NOT NULL DEFAULT 1,
    area DECIMAL(6, 2) NOT NULL,
    listed_price BIGINT NOT NULL,
    standard_deposit BIGINT NOT NULL,
    max_capacity INT NOT NULL DEFAULT 2,
    current_occupancy INT NOT NULL DEFAULT 0,
    furnishing_level VARCHAR(50) DEFAULT 'BASIC',
    amenities TEXT,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rooms_building FOREIGN KEY (building_id) REFERENCES buildings (id) ON DELETE CASCADE,
    CONSTRAINT fk_rooms_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE RESTRICT
);


-- 5. Bảng Ảnh phòng trọ
CREATE TABLE IF NOT EXISTS room_images (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);

-- 6. Bảng Dịch vụ tiện ích (Điện, nước, internet, rác, gửi xe...)
CREATE TABLE IF NOT EXISTS services (
    id BIGSERIAL PRIMARY KEY,
    landlord_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    unit_price BIGINT NOT NULL,
    billing_method VARCHAR(50) NOT NULL,
    scope VARCHAR(50) DEFAULT 'ALL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_services_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 7. Bảng liên kết Phòng - Dịch vụ áp dụng
CREATE TABLE IF NOT EXISTS room_services (
    room_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    PRIMARY KEY (room_id, service_id),
    CONSTRAINT fk_room_services_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_room_services_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);

-- 8. Bảng Khách thuê phòng
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT,
    contract_id BIGINT,
    user_id BIGINT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_card_number VARCHAR(20) NOT NULL,
    gender VARCHAR(10),
    date_of_birth DATE,
    hometown VARCHAR(150),
    id_card_photo_front VARCHAR(500),
    id_card_photo_back VARCHAR(500),
    is_representative BOOLEAN NOT NULL DEFAULT FALSE,
    link_status VARCHAR(30) NOT NULL DEFAULT 'NOT_LINKED',
    status VARCHAR(30) NOT NULL DEFAULT 'STAYING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenants_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE SET NULL,
    CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- 9. Bảng Hợp đồng thuê phòng
CREATE TABLE IF NOT EXISTS contracts (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    representative_tenant_id BIGINT,
    landlord_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rent_price BIGINT NOT NULL,
    deposit_amount BIGINT NOT NULL,
    payment_cycle_day INT NOT NULL DEFAULT 5,
    deposit_refund_amount BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    pdf_file_url VARCHAR(500),
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contracts_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contracts_tenant FOREIGN KEY (representative_tenant_id) REFERENCES tenants (id) ON DELETE SET NULL,
    CONSTRAINT fk_contracts_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- 10. Bảng Dịch vụ thỏa thuận trong Hợp đồng
CREATE TABLE IF NOT EXISTS contract_services (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    service_id BIGINT,
    service_name VARCHAR(100) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    applied_unit_price BIGINT NOT NULL,
    billing_method VARCHAR(50) NOT NULL,
    last_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contract_services_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT fk_contract_services_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE SET NULL
);

-- 11. Bảng Lời mời liên kết tài khoản khách thuê
CREATE TABLE IF NOT EXISTS tenant_link_invitations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    contract_id BIGINT,
    invited_by BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reject_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_tenant_link_inv_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_link_inv_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_link_inv_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_link_inv_invited_by FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE CASCADE
);

-- 12. Bảng Hóa đơn tiền phòng hàng tháng
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    billing_period VARCHAR(20) NOT NULL,
    due_date DATE NOT NULL,
    room_price BIGINT NOT NULL,
    services_amount BIGINT NOT NULL DEFAULT 0,
    other_amount BIGINT NOT NULL DEFAULT 0,
    total_amount BIGINT NOT NULL,
    paid_amount BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    payment_method VARCHAR(30),
    paid_at TIMESTAMP WITH TIME ZONE,
    cancel_reason VARCHAR(255),
    payment_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoices_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT
);

-- 13. Bảng Chi tiết các khoản mục trong hóa đơn
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    contract_service_id BIGINT,
    item_type VARCHAR(20) NOT NULL DEFAULT 'SERVICE',
    item_name VARCHAR(100) NOT NULL,
    previous_index INT,
    current_index INT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL,
    amount BIGINT NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_invoice_items_invoice FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_items_service FOREIGN KEY (contract_service_id) REFERENCES contract_services (id) ON DELETE SET NULL
);

-- 14. Bảng Khiếu nại / Báo hỏng thiết bị phòng trọ
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    images TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    resolution_note TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    rating INT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
);

-- 15. Bảng Thông báo hệ thống
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- =============================================================================
-- Module tìm kiếm ghép trọ
-- =============================================================================

-- 1. Câu hỏi lối sống (cấu hình)
CREATE TABLE IF NOT EXISTS lifestyle_questions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    category VARCHAR(30),
    q_type VARCHAR(10) NOT NULL DEFAULT 'SINGLE',
    is_hard BOOLEAN NOT NULL DEFAULT FALSE,
    weight NUMERIC(4, 2) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lựa chọn của câu hỏi
CREATE TABLE IF NOT EXISTS lifestyle_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    label VARCHAR(150) NOT NULL,
    value NUMERIC(4, 3) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_lifestyle_options_question FOREIGN KEY (question_id) REFERENCES lifestyle_questions (id) ON DELETE CASCADE,
    CONSTRAINT uq_lifestyle_options_id_question UNIQUE (id, question_id),
    CONSTRAINT chk_lifestyle_options_value CHECK (value >= 0 AND value <= 1)
);

-- 3. Câu trả lời gốc của người dùng (điền sẵn khi đăng tin)
-- Câu SINGLE: 1 dòng. Câu MULTI: mỗi lựa chọn 1 dòng.
CREATE TABLE IF NOT EXISTS user_lifestyle_answers (
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, question_id, option_id),
    CONSTRAINT fk_ula_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ula_option FOREIGN KEY (option_id, question_id) REFERENCES lifestyle_options (id, question_id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS roommate_posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    room_id BIGINT,
    contract_id BIGINT,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    post_type VARCHAR(30) NOT NULL,
    area_name VARCHAR(250),
    district VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Hà Nội',
    share_price DECIMAL(12, 2) NOT NULL,
    total_room_price DECIMAL(12, 2),
    needed_roommates INT NOT NULL DEFAULT 1,
    current_roommates INT NOT NULL DEFAULT 1,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    radius_km DOUBLE PRECISION,
    gender_preference VARCHAR(20) DEFAULT 'ANY',
    sleep_time VARCHAR(50) DEFAULT 'BEFORE_24H',
    is_no_smoking BOOLEAN DEFAULT TRUE,
    is_pet_friendly BOOLEAN DEFAULT FALSE,
    cooking_frequency VARCHAR(50) DEFAULT 'DAILY',
    cleanliness_level VARCHAR(50) DEFAULT 'VERY_CLEAN',
    guest_allowed VARCHAR(50) DEFAULT 'WEEKENDS_ONLY',
    lifestyle_vector VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_roommate_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_roommate_posts_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE SET NULL
);


-- 5. Lối sống khai riêng cho tin (điền sẵn từ hồ sơ, được chỉnh; đăng xong tách khỏi hồ sơ)
CREATE TABLE IF NOT EXISTS roommate_post_lifestyle_answers (
    post_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    from_profile BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (post_id, question_id, option_id),
    CONSTRAINT fk_rpla_post FOREIGN KEY (post_id) REFERENCES roommate_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_rpla_option FOREIGN KEY (option_id, question_id) REFERENCES lifestyle_options (id, question_id) ON DELETE CASCADE
);

-- 6. Đơn xin gia nhập nhóm ở ghép (UC 14, UC 15)
CREATE TABLE IF NOT EXISTS roommate_applications (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    intro_message TEXT,
    gender VARCHAR(20),
    sleep_time VARCHAR(50),
    is_smoking BOOLEAN DEFAULT FALSE,
    is_pet BOOLEAN DEFAULT FALSE,
    cooking_habit VARCHAR(50),
    guest_habit VARCHAR(50),
    lifestyle_vector VARCHAR(255),
    compatibility_score INT DEFAULT 0,
    is_customized BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reject_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rma_post FOREIGN KEY (post_id) REFERENCES roommate_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_rma_applicant FOREIGN KEY (applicant_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_rma_post_applicant UNIQUE (post_id, applicant_id)
);

-- 7. Câu trả lời lối sống của đơn ứng tuyển (Clone từ user_lifestyle_answers, có thể tinh chỉnh)
CREATE TABLE IF NOT EXISTS roommate_application_lifestyle_answers (
    application_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    from_profile BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (application_id, question_id, option_id),
    CONSTRAINT fk_rala_app FOREIGN KEY (application_id) REFERENCES roommate_applications (id) ON DELETE CASCADE,
    CONSTRAINT fk_rala_option FOREIGN KEY (option_id, question_id) REFERENCES lifestyle_options (id, question_id) ON DELETE CASCADE
);

-- 18. Hệ thống chỉ mục (Performance Indexes cho khóa ngoại và lọc tìm kiếm)
CREATE INDEX IF NOT EXISTS idx_buildings_landlord_id ON buildings (landlord_id);
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms (building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_landlord_id ON rooms (landlord_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms (status);
CREATE INDEX IF NOT EXISTS idx_rooms_public_status ON rooms (is_public, status);
CREATE INDEX IF NOT EXISTS idx_rooms_bld_status ON rooms (building_id, status);
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images (room_id);
CREATE INDEX IF NOT EXISTS idx_room_services_service_id ON room_services (service_id);

CREATE INDEX IF NOT EXISTS idx_tenants_room_id ON tenants (room_id);
CREATE INDEX IF NOT EXISTS idx_tenants_contract_id ON tenants (contract_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants (user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants (status);

CREATE INDEX IF NOT EXISTS idx_contracts_room_id ON contracts (room_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord_id ON contracts (landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_rep_tenant ON contracts (representative_tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts (status);
CREATE INDEX IF NOT EXISTS idx_contract_services_contract_id ON contract_services (contract_id);

CREATE INDEX IF NOT EXISTS idx_invoices_contract_id ON invoices (contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices (billing_period);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_contract_period ON invoices (contract_id, billing_period);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items (invoice_id);

CREATE INDEX IF NOT EXISTS idx_services_landlord_id ON services (landlord_id);
CREATE INDEX IF NOT EXISTS idx_complaints_room_id ON complaints (room_id);
CREATE INDEX IF NOT EXISTS idx_complaints_tenant_id ON complaints (tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_roommate_posts_author ON roommate_posts (author_id);
CREATE INDEX IF NOT EXISTS idx_roommate_posts_status ON roommate_posts (status);
CREATE INDEX IF NOT EXISTS idx_rma_post_id ON roommate_applications (post_id);
CREATE INDEX IF NOT EXISTS idx_rma_applicant_id ON roommate_applications (applicant_id);
CREATE INDEX IF NOT EXISTS idx_rma_status ON roommate_applications (status);
CREATE INDEX IF NOT EXISTS idx_rala_app_id ON roommate_application_lifestyle_answers (application_id);
CREATE INDEX IF NOT EXISTS idx_rpla_post_id ON roommate_post_lifestyle_answers (post_id);
CREATE INDEX IF NOT EXISTS idx_ula_user_id ON user_lifestyle_answers (user_id);

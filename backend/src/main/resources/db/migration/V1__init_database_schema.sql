DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS roommate_application_lifestyle_answers CASCADE;
DROP TABLE IF EXISTS roommate_applications CASCADE;
DROP TABLE IF EXISTS roommate_post_lifestyle_answers CASCADE;
DROP TABLE IF EXISTS roommate_posts CASCADE;
DROP TABLE IF EXISTS user_lifestyle_answers CASCADE;
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
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_TENANT' CHECK (role IN ('ROLE_ADMIN', 'ROLE_LANDLORD', 'ROLE_TENANT', 'ROLE_USER')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LOCKED', 'INACTIVE')),
    locked_reason VARCHAR(255),
    locked_until TIMESTAMP WITH TIME ZONE,
                               failed_login_attempts INT NOT NULL DEFAULT 0,
                               avatar_url VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER')),
    gender_preference VARCHAR(20) DEFAULT 'ANY' CHECK (gender_preference IS NULL OR gender_preference IN ('ANY', 'MALE_ONLY', 'FEMALE_ONLY')),
    smokes BOOLEAN DEFAULT FALSE,
    rejects_smokers BOOLEAN DEFAULT FALSE,
    has_pet BOOLEAN DEFAULT FALSE,
    rejects_pets BOOLEAN DEFAULT FALSE,
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
    province_id INT,
    ward_id INT,
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
    province_id INT,
    ward_id INT,
    amenities_mask INT NOT NULL DEFAULT 0,
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
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'STOPPED')),
    cover_image_url VARCHAR(500),
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
    billing_method VARCHAR(50) NOT NULL CHECK (billing_method IN ('METER_INDEX', 'FIXED_PER_ROOM', 'FIXED_PER_PERSON', 'FIXED_PER_UNIT')),
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

-- 7.1. Bảng Tiện ích phòng trọ (Master Data)
CREATE TABLE IF NOT EXISTS amenities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7.2. Bảng liên kết Phòng - Tiện ích
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_room_amenities_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_room_amenities_amenity FOREIGN KEY (amenity_id) REFERENCES amenities (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_room_amenities_room_id ON room_amenities(room_id);
CREATE INDEX IF NOT EXISTS idx_room_amenities_amenity_id ON room_amenities(amenity_id);

-- 8. Bảng Khách thuê phòng
CREATE TABLE IF NOT EXISTS tenants (
                                       id BIGSERIAL PRIMARY KEY,
                                       landlord_id BIGINT NOT NULL,
                                       user_id BIGINT,
                                       full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_card_number VARCHAR(20) NOT NULL,
    gender VARCHAR(20) CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER')),
    date_of_birth DATE,
    hometown VARCHAR(150),
    id_card_photo_front VARCHAR(500),
    id_card_photo_back VARCHAR(500),
    link_status VARCHAR(30) NOT NULL DEFAULT 'NOT_LINKED' CHECK (link_status IN ('NOT_LINKED', 'PENDING', 'LINKED', 'REJECTED', 'UNLINKED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             CONSTRAINT fk_tenants_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tenants_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

-- 9. Bảng Hợp đồng thuê phòng
CREATE TABLE IF NOT EXISTS contracts (
                                         id BIGSERIAL PRIMARY KEY,
                                         room_id BIGINT NOT NULL,
                                         landlord_id BIGINT NOT NULL,
                                         start_date DATE NOT NULL,
                                         end_date DATE NOT NULL,
                                         rent_price BIGINT NOT NULL,
                                         deposit_amount BIGINT NOT NULL,
                                         payment_cycle_day INT NOT NULL DEFAULT 5,
                                         deposit_refund_amount BIGINT,
                                         status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TERMINATED')),
    pdf_file_url VARCHAR(500),
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             CONSTRAINT fk_contracts_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE RESTRICT,
    CONSTRAINT fk_contracts_landlord FOREIGN KEY (landlord_id) REFERENCES users (id) ON DELETE RESTRICT
    );

-- 9b. Bảng Liên kết Hợp đồng - Khách thuê (Quan hệ Nhiều - Nhiều kèm Trạng thái & Đại diện)
CREATE TABLE IF NOT EXISTS contract_tenants (
                                                id BIGSERIAL PRIMARY KEY,
                                                contract_id BIGINT NOT NULL,
                                                tenant_id BIGINT NOT NULL,
                                                is_representative BOOLEAN NOT NULL DEFAULT FALSE,
                                                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                CONSTRAINT uq_contract_tenant UNIQUE (contract_id, tenant_id),
    CONSTRAINT fk_ct_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE CASCADE,
    CONSTRAINT fk_ct_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
    );

-- 10. Bảng Dịch vụ thỏa thuận trong Hợp đồng
CREATE TABLE IF NOT EXISTS contract_services (
                                                 id BIGSERIAL PRIMARY KEY,
                                                 contract_id BIGINT NOT NULL,
                                                 service_id BIGINT,
                                                 service_name VARCHAR(100) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    applied_unit_price BIGINT NOT NULL,
    billing_method VARCHAR(50) NOT NULL CHECK (billing_method IN ('METER_INDEX', 'FIXED_PER_ROOM', 'FIXED_PER_PERSON', 'FIXED_PER_UNIT')),
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
                                                       status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED')),
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
    total_amount BIGINT NOT NULL,
    paid_amount BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
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
                                             item_type VARCHAR(20) NOT NULL DEFAULT 'SERVICE' CHECK (item_type IN ('ROOM_RENT', 'SERVICE', 'SURCHARGE', 'DISCOUNT')),
    item_name VARCHAR(100) NOT NULL,
    previous_index INT,
    current_index INT,
    quantity INT NOT NULL DEFAULT 1,
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
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('ELECTRICITY', 'WATER', 'AIR_CONDITIONER', 'SECURITY', 'OTHER')),
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    images TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED')),
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
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('INVOICE', 'CONTRACT', 'COMPLAINT', 'ROOMMATE', 'ROOM_LINK', 'SYSTEM')),
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
                             CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- =============================================================================
-- Module tìm kiếm ghép trọ
-- (Câu hỏi & Lựa chọn lối sống 15 chiều được chuẩn hóa cố định trong code BE: LifestyleConstants)
-- =============================================================================

-- 1. Tin đăng tìm bạn ở ghép (Roommate Posts)
CREATE TABLE IF NOT EXISTS roommate_posts (
                                              id BIGSERIAL PRIMARY KEY,
                                              author_id BIGINT NOT NULL,
                                              room_id BIGINT,
                                              title VARCHAR(250) NOT NULL,
    description TEXT,
    post_type VARCHAR(30) NOT NULL CHECK (post_type IN ('HAS_ROOM', 'SEARCHING_ROOM')),
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
    gender_preference VARCHAR(20) DEFAULT 'ANY' CHECK (gender_preference IS NULL OR gender_preference IN ('ANY', 'MALE_ONLY', 'FEMALE_ONLY')),
    is_no_smoking BOOLEAN DEFAULT TRUE,
    is_pet_friendly BOOLEAN DEFAULT FALSE,
    lifestyle_vector VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'COMPLETED', 'CLOSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             CONSTRAINT fk_roommate_posts_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_roommate_posts_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE SET NULL
    );

-- 4. Đơn xin gia nhập nhóm ở ghép (Roommate Applications)
CREATE TABLE IF NOT EXISTS roommate_applications (
                                                     id BIGSERIAL PRIMARY KEY,
                                                     post_id BIGINT NOT NULL,
                                                     applicant_id BIGINT NOT NULL,
                                                     intro_message TEXT,
                                                     gender VARCHAR(20) CHECK (gender IS NULL OR gender IN ('MALE', 'FEMALE', 'OTHER')),
    is_smoking BOOLEAN DEFAULT FALSE,
    is_pet BOOLEAN DEFAULT FALSE,
    lifestyle_vector VARCHAR(255),
    compatibility_score INT DEFAULT 0,
    is_customized BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reject_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                             CONSTRAINT fk_rma_post FOREIGN KEY (post_id) REFERENCES roommate_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_rma_applicant FOREIGN KEY (applicant_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_rma_post_applicant UNIQUE (post_id, applicant_id)
    );

-- 5. Hệ thống chỉ mục (Performance Indexes cho khóa ngoại và lọc tìm kiếm)
CREATE INDEX IF NOT EXISTS idx_buildings_landlord_id ON buildings (landlord_id);
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms (building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_landlord_id ON rooms (landlord_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms (status);
CREATE INDEX IF NOT EXISTS idx_rooms_public_status ON rooms (is_public, status);
CREATE INDEX IF NOT EXISTS idx_rooms_bld_status ON rooms (building_id, status);
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images (room_id);
CREATE INDEX IF NOT EXISTS idx_room_services_service_id ON room_services (service_id);

CREATE INDEX IF NOT EXISTS idx_tenants_landlord_id ON tenants (landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants (user_id);

CREATE INDEX IF NOT EXISTS idx_contracts_room_id ON contracts (room_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord_id ON contracts (landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts (status);
CREATE INDEX IF NOT EXISTS idx_contract_services_contract_id ON contract_services (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_tenants_contract_id ON contract_tenants (contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_tenants_tenant_id ON contract_tenants (tenant_id);

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


-- =============================================================================
-- Há»† THá»NG QUáº¢N LÃ NHÃ€ TRá»Œ Há»– TRá»¢ GHÃ‰P NGÆ¯á»œI á»ž CHUNG
-- DATABASE DDL (CHUáº¨N HÃ“A KIá»‚U Dá»® LIá»†U & QUAN Há»† KHÃ“A NGOáº I)
-- Há»‡ quáº£n trá»‹ cÆ¡ sá»Ÿ dá»¯ liá»‡u: PostgreSQL 14+ / H2 In-Memory
-- =============================================================================

-- 1. Báº£ng ngÆ°á»i dÃ¹ng há»‡ thá»‘ng (Admin, Landlord, Tenant)
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

-- 2. Báº£ng quáº£n lÃ½ Refresh Token xÃ¡c thá»±c JWT
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Báº£ng TÃ²a nhÃ  / Khu trá»
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

-- 4. Báº£ng PhÃ²ng trá»
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


-- 5. Báº£ng áº¢nh phÃ²ng trá»
CREATE TABLE IF NOT EXISTS room_images (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_room_images_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);

-- 6. Báº£ng Dá»‹ch vá»¥ tiá»‡n Ã­ch (Äiá»‡n, nÆ°á»›c, internet, rÃ¡c, gá»­i xe...)
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

-- 7. Báº£ng liÃªn káº¿t PhÃ²ng - Dá»‹ch vá»¥ Ã¡p dá»¥ng
CREATE TABLE IF NOT EXISTS room_services (
    room_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    PRIMARY KEY (room_id, service_id),
    CONSTRAINT fk_room_services_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_room_services_service FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);

-- 8. Báº£ng KhÃ¡ch thuÃª phÃ²ng
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

-- 9. Báº£ng Há»£p Ä‘á»“ng thuÃª phÃ²ng
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

-- 10. Báº£ng Dá»‹ch vá»¥ thá»a thuáº­n trong Há»£p Ä‘á»“ng
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

-- 11. Báº£ng Lá»i má»i liÃªn káº¿t tÃ i khoáº£n khÃ¡ch thuÃª
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

-- 12. Báº£ng HÃ³a Ä‘Æ¡n tiá»n phÃ²ng hÃ ng thÃ¡ng
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

-- 13. Báº£ng Chi tiáº¿t cÃ¡c khoáº£n má»¥c trong hÃ³a Ä‘Æ¡n
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

-- 14. Báº£ng Khiáº¿u náº¡i / BÃ¡o há»ng thiáº¿t bá»‹ phÃ²ng trá»
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

-- 15. Báº£ng ThÃ´ng bÃ¡o há»‡ thá»‘ng
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
-- Module tÃ¬m kiáº¿m ghÃ©p trá»
-- =============================================================================

-- 1. CÃ¢u há»i lá»‘i sá»‘ng (cáº¥u hÃ¬nh)
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

-- 2. Lá»±a chá»n cá»§a cÃ¢u há»i
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

-- 3. CÃ¢u tráº£ lá»i gá»‘c cá»§a ngÆ°á»i dÃ¹ng (Ä‘iá»n sáºµn khi Ä‘Äƒng tin)
-- CÃ¢u SINGLE: 1 dÃ²ng. CÃ¢u MULTI: má»—i lá»±a chá»n 1 dÃ²ng.
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
    city VARCHAR(100) DEFAULT 'HÃ  Ná»™i',
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


-- 5. Lá»‘i sá»‘ng khai riÃªng cho tin (Ä‘iá»n sáºµn tá»« há»“ sÆ¡, Ä‘Æ°á»£c chá»‰nh; Ä‘Äƒng xong tÃ¡ch khá»i há»“ sÆ¡)
CREATE TABLE IF NOT EXISTS roommate_post_lifestyle_answers (
    post_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    from_profile BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (post_id, question_id, option_id),
    CONSTRAINT fk_rpla_post FOREIGN KEY (post_id) REFERENCES roommate_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_rpla_option FOREIGN KEY (option_id, question_id) REFERENCES lifestyle_options (id, question_id) ON DELETE CASCADE
);

-- 6. ÄÆ¡n xin gia nháº­p nhÃ³m á»Ÿ ghÃ©p (UC 14, UC 15)
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

-- 7. CÃ¢u tráº£ lá»i lá»‘i sá»‘ng cá»§a Ä‘Æ¡n á»©ng tuyá»ƒn (Clone tá»« user_lifestyle_answers, cÃ³ thá»ƒ tinh chá»‰nh)
CREATE TABLE IF NOT EXISTS roommate_application_lifestyle_answers (
    application_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    option_id BIGINT NOT NULL,
    from_profile BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (application_id, question_id, option_id),
    CONSTRAINT fk_rala_app FOREIGN KEY (application_id) REFERENCES roommate_applications (id) ON DELETE CASCADE,
    CONSTRAINT fk_rala_option FOREIGN KEY (option_id, question_id) REFERENCES lifestyle_options (id, question_id) ON DELETE CASCADE
);

-- 18. Há»‡ thá»‘ng chá»‰ má»¥c (Performance Indexes cho khÃ³a ngoáº¡i vÃ  lá»c tÃ¬m kiáº¿m)
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


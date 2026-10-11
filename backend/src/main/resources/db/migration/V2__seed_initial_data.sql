-- =============================================================================
-- V2: Initial Seed Data for StayConnect
-- =============================================================================
-- =============================================================================
-- 1. TÃ€I KHOáº¢N NGÆ¯á»œI DÃ™NG (USERS)
-- Hash BCrypt chuáº©n cho máº­t kháº©u '123456': $2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve
-- =============================================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, status, avatar_url, lifestyle_vector, enabled, created_at, updated_at)
VALUES
(1, 'admin', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Quáº£n Trá»‹ ViÃªn Há»‡ Thá»‘ng', 'admin@stayhub.vn', '0900000001', 'ROLE_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'landlord', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Nguyá»…n VÄƒn ThÃ nh', 'landlord@stayhub.vn', '0912345678', 'ROLE_LANDLORD', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'tenant', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Tráº§n Quang Chiáº¿n', 'tenant@stayhub.vn', '0987654321', 'ROLE_TENANT', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'tenant2', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'LÃª Thá»‹ Mai', 'tenant2@stayhub.vn', '0934567890', 'ROLE_TENANT', 'ACTIVE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '1.000,0.000,0.000,0.000,0.500,1.000,0.000,0.500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'tenant3', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'HoÃ ng Äá»©c Anh', 'ducanh@stayhub.vn', '0912888999', 'ROLE_TENANT', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '0.000,0.500,0.000,0.000,1.000,0.500,0.500,0.500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- =============================================================================
-- 2. TÃ’A NHÃ€ / KHU TRá»Œ (BUILDINGS)
-- =============================================================================
INSERT INTO buildings (id, landlord_id, name, province, ward, address_detail, num_floors, general_rules, latitude, longitude, is_active, created_at, updated_at)
VALUES
(1, 2, 'TÃ²a nhÃ  Ãnh DÆ°Æ¡ng', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng Thanh XuÃ¢n Nam', 'Sá»‘ 15 ngÃµ 68 Triá»u KhÃºc', 5, 'Giá»¯ gÃ¬n vá»‡ sinh chung, khÃ´ng lÃ m á»“n sau 23h, khÃ³a cá»•ng cáº©n tháº­n.', 20.98520000, 105.79810000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'Chung cÆ° Mini Cáº§u Giáº¥y', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng Dá»‹ch Vá»ng Háº­u', 'NgÃµ 175 XuÃ¢n Thá»§y', 7, 'Thang mÃ¡y quáº¹t tháº», khÃ³a vÃ¢n tay, Ä‘á»ƒ xe Ä‘Ãºng vá»‹ trÃ­ quy Ä‘á»‹nh.', 21.03710000, 105.78320000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 3. Dá»ŠCH Vá»¤ TIá»†N ÃCH CHá»¦ TRá»Œ (SERVICES)
-- =============================================================================
INSERT INTO services (id, landlord_id, name, category, unit, unit_price, billing_method, scope, is_active, created_at, updated_at)
VALUES
(1, 2, 'Tiá»n Ä‘iá»‡n sinh hoáº¡t', 'ELECTRICITY', 'kWh', 3500, 'METER_INDEX', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'Tiá»n nÆ°á»›c sinh hoáº¡t', 'WATER', 'm3', 25000, 'METER_INDEX', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'Internet Wifi tá»‘c Ä‘á»™ cao', 'INTERNET', 'phÃ²ng/thÃ¡ng', 100000, 'FIXED_ROOM', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'Vá»‡ sinh hÃ nh lang & rÃ¡c', 'CLEANING', 'ngÆ°á»i/thÃ¡ng', 50000, 'PER_PERSON', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 4. PHÃ’NG TRá»Œ (ROOMS)
-- PhÃ²ng 1, 2, 3 thuá»™c TÃ²a nhÃ  1 (Ãnh DÆ°Æ¡ng)
-- PhÃ²ng 4 thuá»™c TÃ²a nhÃ  2 (CCMN Cáº§u Giáº¥y)
-- PhÃ²ng 5: NhÃ  trá» Ä‘á»™c láº­p (building_id = NULL) cÃ³ Ä‘á»‹a chá»‰ & tá»a Ä‘á»™ GPS riÃªng
-- =============================================================================
INSERT INTO rooms (id, building_id, landlord_id, name, province, ward, address_detail, floor, area, listed_price, standard_deposit, max_capacity, current_occupancy, furnishing_level, amenities, description, status, latitude, longitude, is_public, created_at, updated_at)
VALUES
(1, 1, 2, 'PhÃ²ng 101 - Ban cÃ´ng thoÃ¡ng', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng Thanh XuÃ¢n Nam', 'Sá»‘ 15 ngÃµ 68 Triá»u KhÃºc', 1, 28.50, 3500000, 3500000, 2, 0, 'FULL', 'Äiá»u hÃ²a, BÃ¬nh nÃ³ng láº¡nh, Tá»§ láº¡nh, GiÆ°á»ng Ä‘á»‡m, Tá»§ quáº§n Ã¡o', 'PhÃ²ng táº§ng 1 thoÃ¡ng mÃ¡t cÃ³ ban cÃ´ng, cá»­a sá»• Ä‘Ã³n giÃ³ tá»± nhiÃªn.', 'AVAILABLE', 20.98520000, 105.79810000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'PhÃ²ng 102 - KhÃ©p kÃ­n cao cáº¥p', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng Thanh XuÃ¢n Nam', 'Sá»‘ 15 ngÃµ 68 Triá»u KhÃºc', 1, 32.00, 3800000, 3800000, 3, 2, 'FULL', 'Äiá»u hÃ²a Daikin, NÃ³ng láº¡nh, Tá»§ láº¡nh 2 cÃ¡nh, MÃ¡y giáº·t riÃªng, Wifi tá»‘c Ä‘á»™ cao', 'PhÃ²ng táº§ng 1 khÃ©p kÃ­n, cÃ³ gÃ¡c xÃ©p kiÃªn cá»‘, Ä‘á»ƒ xe miá»…n phÃ­.', 'OCCUPIED', 20.98525000, 105.79820000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 2, 'PhÃ²ng 201 - View phá»‘ thoÃ¡ng Ä‘Ã£ng', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng Thanh XuÃ¢n Nam', 'Sá»‘ 15 ngÃµ 68 Triá»u KhÃºc', 2, 35.00, 4200000, 4200000, 3, 0, 'FULL', 'Äiá»u hÃ²a, NÃ³ng láº¡nh, Tá»§ báº¿p riÃªng, Tá»§ láº¡nh, BÃ n há»c', 'PhÃ²ng táº§ng 2 view thoÃ¡ng mÃ¡t, báº¿p náº¥u Äƒn riÃªng biá»‡t.', 'AVAILABLE', 20.98530000, 105.79830000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 2, 'PhÃ²ng 302 - Studio XuÃ¢n Thá»§y', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng Dá»‹ch Vá»ng Háº­u', 'NgÃµ 175 XuÃ¢n Thá»§y', 3, 30.00, 4400000, 4400000, 2, 1, 'FULL', 'Thang mÃ¡y, KhÃ³a vÃ¢n tay, Äiá»u hÃ²a Inverter, Tá»§ láº¡nh side by side', 'Gáº§n ÄH SÆ° Pháº¡m, ÄH Quá»‘c Gia, full ná»™i tháº¥t cao cáº¥p.', 'OCCUPIED', 21.03710000, 105.78320000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, NULL, 2, 'NhÃ  trá» Ä‘á»™c láº­p BÃ¡ch Khoa', 'ThÃ nh phá»‘ HÃ  Ná»™i', 'PhÆ°á»ng BÃ¡ch Khoa', 'Sá»‘ 25 ngÃµ 40 Táº¡ Quang Bá»­u', 1, 25.00, 3200000, 3200000, 2, 0, 'BASIC', 'Äiá»u hÃ²a, NÃ³ng láº¡nh, Ká»‡ báº¿p', 'NhÃ  trá» riÃªng Ä‘á»™c láº­p khÃ´ng chung chá»§, giá» giáº¥c tá»± do, gáº§n ÄHBK HÃ  Ná»™i.', 'AVAILABLE', 21.00560000, 105.84330000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 5. Báº¢NG áº¢NH PHÃ’NG TRá»Œ (ROOM_IMAGES)
-- =============================================================================
INSERT INTO room_images (id, room_id, image_url, display_order, created_at)
VALUES
(1, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0, CURRENT_TIMESTAMP),
(2, 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0, CURRENT_TIMESTAMP),
(3, 2, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1, CURRENT_TIMESTAMP),
(4, 4, 'https://images.unsplash.com/photo-1502005229762-ee1b2da94088?w=800', 0, CURRENT_TIMESTAMP),
(5, 5, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 0, CURRENT_TIMESTAMP);

-- =============================================================================
-- 6. LIÃŠN Káº¾T PHÃ’NG - Dá»ŠCH Vá»¤ (ROOM_SERVICES)
-- =============================================================================
INSERT INTO room_services (room_id, service_id)
VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 4),
(5, 1), (5, 2), (5, 3);

-- =============================================================================
-- 7. Há»¢P Äá»’NG THUÃŠ PHÃ’NG (CONTRACTS)
-- =============================================================================
INSERT INTO contracts (id, room_id, landlord_id, start_date, end_date, rent_price, deposit_amount, payment_cycle_day, status, terms_and_conditions, created_at, updated_at)
VALUES
(1, 2, 2, '2026-01-01', '2027-01-01', 3800000, 3800000, 5, 'ACTIVE', 'Há»£p Ä‘á»“ng thuÃª phÃ²ng cÃ³ thá»i háº¡n 12 thÃ¡ng. Tiá»n thuÃª Ä‘Ã³ng Ä‘á»‹nh ká»³ ngÃ y mÃ¹ng 5 hÃ ng thÃ¡ng. Giá»¯ gÃ¬n trang thiáº¿t bá»‹ vÃ  tuÃ¢n thá»§ ná»™i quy tÃ²a nhÃ .', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, '2025-01-01', '2026-01-01', 3500000, 3500000, 5, 'EXPIRED', 'Há»£p Ä‘á»“ng thuÃª phÃ²ng P101 nÄƒm 2025 Ä‘Ã£ káº¿t thÃºc háº¡n há»£p Ä‘á»“ng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 8. KHÃCH THUÃŠ PHÃ’NG (TENANTS)
-- - tenant (user_id=3): Äáº¡i diá»‡n há»£p Ä‘á»“ng, ÄÃƒ LIÃŠN Káº¾T (LINKED) phÃ²ng P102
-- - tenant3 (user_id=5): KhÃ¡ch thuÃª cÃ¹ng phÃ²ng, ÄANG CHá»œ XÃC NHáº¬N LIÃŠN Káº¾T (PENDING)
-- - tenant2 (user_id=4, LÃª Thá»‹ Mai): KhÃ¡ch thuÃª tá»± do, KHÃ”NG cÃ³ phÃ²ng vÃ  KHÃ”NG cÃ³ lá»i má»i
-- =============================================================================
INSERT INTO tenants (id, room_id, contract_id, user_id, full_name, phone, id_card_number, gender, is_representative, link_status, status, created_at, updated_at)
VALUES
(1, 2, 1, 3, 'Tráº§n Quang Chiáº¿n', '0987654321', '001202008999', 'Nam', TRUE, 'LINKED', 'STAYING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 1, 5, 'HoÃ ng Äá»©c Anh', '0912888999', '001202007888', 'Nam', FALSE, 'PENDING', 'STAYING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 2, 3, 'Tráº§n Quang Chiáº¿n', '0987654321', '001202008999', 'Nam', TRUE, 'LINKED', 'LEFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Cáº­p nháº­t ngÆ°á»i Ä‘áº¡i diá»‡n há»£p Ä‘á»“ng
UPDATE contracts SET representative_tenant_id = 1 WHERE id = 1;
UPDATE contracts SET representative_tenant_id = 3 WHERE id = 2;

-- =============================================================================
-- 8b. Lá»œI Má»œI LIÃŠN Káº¾T PHÃ’NG TRá»Œ (TENANT_LINK_INVITATIONS - UC 16)
-- Chá»§ nhÃ  Nguyá»…n VÄƒn ThÃ nh (landlord, id=2) má»i HoÃ ng Äá»©c Anh (tenant3, id=5) vÃ o phÃ²ng P102
-- Tuyá»‡t Ä‘á»‘i KHÃ”NG má»i tenant2 (LÃª Thá»‹ Mai)
-- =============================================================================
INSERT INTO tenant_link_invitations (id, tenant_id, user_id, contract_id, invited_by, status, reject_reason, created_at, responded_at)
VALUES
(1, 2, 5, 1, 2, 'PENDING', NULL, CURRENT_TIMESTAMP, NULL);

-- =============================================================================
-- 9. Dá»ŠCH Vá»¤ THá»ŽA THUáº¬N TRONG Há»¢P Äá»’NG (CONTRACT_SERVICES)
-- =============================================================================
INSERT INTO contract_services (id, contract_id, service_id, service_name, unit, applied_unit_price, billing_method, last_index, created_at)
VALUES
(1, 1, 1, 'Tiá»n Ä‘iá»‡n sinh hoáº¡t', 'kWh', 3500, 'METER_INDEX', 120, CURRENT_TIMESTAMP),
(2, 1, 2, 'Tiá»n nÆ°á»›c sinh hoáº¡t', 'm3', 25000, 'METER_INDEX', 15, CURRENT_TIMESTAMP),
(3, 1, 3, 'Internet Wifi tá»‘c Ä‘á»™ cao', 'phÃ²ng/thÃ¡ng', 100000, 'FIXED_ROOM', 0, CURRENT_TIMESTAMP),
(4, 1, 4, 'Vá»‡ sinh hÃ nh lang & rÃ¡c', 'ngÆ°á»i/thÃ¡ng', 50000, 'PER_PERSON', 0, CURRENT_TIMESTAMP);

-- =============================================================================
-- 10. HÃ“A ÄÆ N TIá»€N PHÃ’NG HÃ€NG THÃNG (INVOICES)
-- =============================================================================
INSERT INTO invoices (id, contract_id, billing_period, due_date, room_price, services_amount, other_amount, total_amount, paid_amount, status, payment_method, paid_at, payment_note, created_at, updated_at)
VALUES
(1, 1, '09/2026', '2026-10-05', 3800000, 420000, 0, 4220000, 4220000, 'PAID', 'VIETQR', '2026-10-04 15:30:00+07', 'ÄÃ£ gáº¡ch ná»£ thÃ nh cÃ´ng qua chuyá»ƒn khoáº£n VietQR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, '10/2026', CURRENT_DATE + INTERVAL '5 days', 3800000, 727500, 0, 4527500, 0, 'UNPAID', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, '12/2025', '2026-01-05', 3500000, 450000, 0, 3950000, 3950000, 'PAID', 'VIETQR', '2026-01-04 10:00:00+07', 'ÄÃ£ thanh toÃ¡n Ä‘á»§ ká»³ thÃ¡ng 12/2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 11. CHI TIáº¾T KHOáº¢N THU TRONG HÃ“A ÄÆ N (INVOICE_ITEMS)
-- =============================================================================
INSERT INTO invoice_items (id, invoice_id, contract_service_id, item_type, item_name, previous_index, current_index, quantity, unit_price, amount, note)
VALUES
(1, 2, NULL, 'ROOM_RENT', 'Tiá»n thuÃª phÃ²ng P102 (ThÃ¡ng 10/2026)', NULL, NULL, 1.00, 3800000, 3800000, 'Tiá»n phÃ²ng cá»‘ Ä‘á»‹nh theo há»£p Ä‘á»“ng'),
(2, 2, 1, 'SERVICE', 'Tiá»n Ä‘iá»‡n sinh hoáº¡t (115 kWh)', 120, 235, 115.00, 3500, 402500, 'Tá»« sá»‘ 120 Ä‘áº¿n 235'),
(3, 2, 2, 'SERVICE', 'Tiá»n nÆ°á»›c sáº¡ch sinh hoáº¡t (9 mÂ³)', 15, 24, 9.00, 25000, 225000, 'Tá»« sá»‘ 15 Ä‘áº¿n 24'),
(4, 2, 3, 'SERVICE', 'Internet Wifi cÃ¡p quang', NULL, NULL, 1.00, 100000, 100000, 'Trá»n gÃ³i phÃ²ng'),
(5, 2, 4, 'SERVICE', 'PhÃ­ vá»‡ sinh & rÃ¡c tháº£i (2 ngÆ°á»i)', NULL, NULL, 2.00, 50000, 100000, '50.000 Ä‘/ngÆ°á»i/thÃ¡ng'),
(6, 1, NULL, 'ROOM_RENT', 'Tiá»n thuÃª phÃ²ng P102 (ThÃ¡ng 09/2026)', NULL, NULL, 1.00, 3800000, 3800000, 'Tiá»n phÃ²ng cá»‘ Ä‘á»‹nh theo há»£p Ä‘á»“ng'),
(7, 1, 1, 'SERVICE', 'Tiá»n Ä‘iá»‡n sinh hoáº¡t (110 kWh)', 10, 120, 110.00, 3500, 385000, 'Tá»« sá»‘ 10 Ä‘áº¿n 120'),
(8, 1, 2, 'SERVICE', 'Tiá»n nÆ°á»›c sáº¡ch sinh hoáº¡t (10 mÂ³)', 5, 15, 10.00, 25000, 250000, 'Tá»« sá»‘ 5 Ä‘áº¿n 15'),
(9, 3, NULL, 'ROOM_RENT', 'Tiá»n thuÃª phÃ²ng P101 (ThÃ¡ng 12/2025)', NULL, NULL, 1.00, 3500000, 3500000, 'Ká»³ thanh toÃ¡n cuá»‘i cÃ¹ng trÆ°á»›c khi háº¿t háº¡n'),
(10, 3, 1, 'SERVICE', 'Tiá»n Ä‘iá»‡n sinh hoáº¡t (105 kWh)', 210, 315, 105.00, 3500, 367500, 'Tá»« sá»‘ 210 Ä‘áº¿n 315'),
(11, 3, 2, 'SERVICE', 'Tiá»n nÆ°á»›c sinh hoáº¡t (10 mÂ³)', 30, 40, 10.00, 25000, 250000, 'Tá»« sá»‘ 30 Ä‘áº¿n 40');

-- =============================================================================
-- 12. KHIáº¾U Náº I & BÃO Há»ŽNG THIáº¾T Bá»Š (COMPLAINTS - UC 18)
-- =============================================================================
INSERT INTO complaints (id, room_id, tenant_id, title, content, incident_type, severity, status, resolution_note, resolved_at, rating, feedback, created_at, updated_at)
VALUES
(1, 2, 1, 'Äiá»u hÃ²a Daikin phÃ²ng 102 cháº£y nÆ°á»›c vÃ  khÃ´ng mÃ¡t', 'Äiá»u hÃ²a báº­t 24 Ä‘á»™ nhÆ°ng chá»‰ cÃ³ giÃ³ thá»•i, dÃ n láº¡nh rÃ² rá»‰ nÆ°á»›c nhá» giá»t xuá»‘ng sÃ n gá»—.', 'AIR_CONDITIONER', 'HIGH', 'PROCESSING', 'Chá»§ trá» Ä‘Ã£ tiáº¿p nháº­n vÃ  háº¹n thá»£ Ä‘iá»‡n láº¡nh qua kiá»ƒm tra sÃ¡ng mai lÃºc 9h.', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 1, 'BÃ³ng Ä‘Ã¨n led hÃ nh lang táº§ng 1 bá»‹ cháº­p chá»n', 'ÄÃ¨n chá»›p táº¯t liÃªn tá»¥c vÃ o ban Ä‘Ãªm gÃ¢y khÃ³ quan sÃ¡t khi Ä‘i láº¡i.', 'ELECTRICITY', 'LOW', 'RESOLVED', 'ÄÃ£ thay bÃ³ng Philips 18W má»›i lÃºc 15h ngÃ y 25/09.', '2026-09-25 15:00:00+07', 5, 'Thá»£ thay bÃ³ng ráº¥t nhanh vÃ  nhiá»‡t tÃ¬nh, Ä‘Ã¨n sÃ¡ng bÃ¬nh thÆ°á»ng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 13. DANH Má»¤C CÃ‚U Há»ŽI & Lá»°A CHá»ŒN Lá»I Sá»NG (LIFESTYLE_QUESTIONS & OPTIONS)
-- =============================================================================
INSERT INTO lifestyle_questions (id, code, label, category, q_type, is_hard, weight, sort_order, is_active)
VALUES
(1, 'GENDER', 'Giá»›i tÃ­nh mong muá»‘n / Báº£n thÃ¢n', 'PERSONAL', 'SINGLE', TRUE, 1.00, 1, TRUE),
(2, 'SLEEP_TIME', 'Giá» giáº¥c Ä‘i ngá»§ ban Ä‘Ãªm', 'HABIT', 'SINGLE', FALSE, 1.20, 2, TRUE),
(3, 'SMOKING', 'ThÃ³i quen hÃºt thuá»‘c lÃ¡', 'HABIT', 'SINGLE', TRUE, 1.50, 3, TRUE),
(4, 'PET', 'ThÃº cÆ°ng (ChÃ³ / MÃ¨o)', 'HABIT', 'SINGLE', FALSE, 1.00, 4, TRUE),
(5, 'COOKING', 'Táº§n suáº¥t náº¥u Äƒn táº¡i phÃ²ng', 'LIVING', 'SINGLE', FALSE, 0.80, 5, TRUE),
(6, 'CLEANLINESS', 'Má»©c Ä‘á»™ giá»¯ gÃ¬n sáº¡ch sáº½, ngÄƒn náº¯p', 'LIVING', 'SINGLE', FALSE, 1.00, 6, TRUE),
(7, 'GUEST', 'Quy Ä‘á»‹nh tiáº¿p khÃ¡ch / Báº¡n bÃ¨ vá» phÃ²ng', 'LIVING', 'SINGLE', FALSE, 1.00, 7, TRUE),
(8, 'PERSONALITY', 'TÃ­nh cÃ¡ch & KhÃ´ng gian sá»‘ng', 'PERSONAL', 'SINGLE', FALSE, 0.80, 8, TRUE);

INSERT INTO lifestyle_options (id, question_id, label, value, sort_order, is_active)
VALUES
-- Question 1: GENDER
(1, 1, 'Nam', 0.000, 1, TRUE),
(2, 1, 'Ná»¯', 1.000, 2, TRUE),
(3, 1, 'KhÃ´ng quan trá»ng / Linh hoáº¡t', 0.500, 3, TRUE),
-- Question 2: SLEEP_TIME
(4, 2, 'Ngá»§ sá»›m trÆ°á»›c 23h', 0.000, 1, TRUE),
(5, 2, 'Ngá»§ khoáº£ng 23h - 24h', 0.500, 2, TRUE),
(6, 2, 'Thá»©c khuya sau 24h', 1.000, 3, TRUE),
-- Question 3: SMOKING
(7, 3, 'HoÃ n toÃ n khÃ´ng hÃºt thuá»‘c', 0.000, 1, TRUE),
(8, 3, 'Thá»‰nh thoáº£ng / Chá»‰ ra ngoÃ i hÃºt', 0.500, 2, TRUE),
(9, 3, 'ThÆ°á»ng xuyÃªn hÃºt thuá»‘c', 1.000, 3, TRUE),
-- Question 4: PET
(10, 4, 'KhÃ´ng nuÃ´i thÃº cÆ°ng', 0.000, 1, TRUE),
(11, 4, 'YÃªu thÃ­ch / Thá»‰nh thoáº£ng chÄƒm sÃ³c', 0.500, 2, TRUE),
(12, 4, 'Äang nuÃ´i chÃ³ / mÃ¨o trong phÃ²ng', 1.000, 3, TRUE),
-- Question 5: COOKING
(13, 5, 'Hiáº¿m khi náº¥u Äƒn / Ä‚n ngoÃ i', 0.000, 1, TRUE),
(14, 5, 'Thá»‰nh thoáº£ng náº¥u Äƒn', 0.500, 2, TRUE),
(15, 5, 'ThÆ°á»ng xuyÃªn tá»± náº¥u bá»¯a tá»‘i', 1.000, 3, TRUE),
-- Question 6: CLEANLINESS
(16, 6, 'Linh hoáº¡t, thoáº£i mÃ¡i', 0.000, 1, TRUE),
(17, 6, 'Gá»n gÃ ng, vá»‡ sinh Ä‘á»‹nh ká»³', 0.500, 2, TRUE),
(18, 6, 'Ráº¥t sáº¡ch sáº½, ngÄƒn náº¯p hÃ ng ngÃ y', 1.000, 3, TRUE),
-- Question 7: GUEST
(19, 7, 'KhÃ´ng dáº«n báº¡n bÃ¨ vá» phÃ²ng', 0.000, 1, TRUE),
(20, 7, 'BÃ¡o trÆ°á»›c / Chá»‰ tiáº¿p cuá»‘i tuáº§n', 0.500, 2, TRUE),
(21, 7, 'Thoáº£i mÃ¡i tiáº¿p báº¡n bÃ¨', 1.000, 3, TRUE),
-- Question 8: PERSONALITY
(22, 8, 'HÆ°á»›ng ná»™i, thÃ­ch yÃªn tÄ©nh tuyá»‡t Ä‘á»‘i', 0.000, 1, TRUE),
(23, 8, 'CÃ¢n báº±ng, vui váº» hÃ²a Ä‘á»“ng', 0.500, 2, TRUE),
(24, 8, 'HÆ°á»›ng ngoáº¡i, thÃ­ch giao lÆ°u trÃ² chuyá»‡n', 1.000, 3, TRUE);

-- =============================================================================
-- 14. CÃ‚U TRáº¢ Lá»œI Lá»I Sá»NG Gá»C Cá»¦A NGÆ¯á»œI DÃ™NG (USER_LIFESTYLE_ANSWERS)
-- User 3: Nam, ngá»§ 23h-24h, khÃ´ng thuá»‘c, khÃ´ng pet, thÆ°á»ng xuyÃªn náº¥u, ráº¥t sáº¡ch, bÃ¡o trÆ°á»›c khÃ¡ch, cÃ¢n báº±ng
-- Vector: 0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500
-- =============================================================================
INSERT INTO user_lifestyle_answers (user_id, question_id, option_id, answered_at)
VALUES
(3, 1, 1, CURRENT_TIMESTAMP),
(3, 2, 5, CURRENT_TIMESTAMP),
(3, 3, 7, CURRENT_TIMESTAMP),
(3, 4, 10, CURRENT_TIMESTAMP),
(3, 5, 15, CURRENT_TIMESTAMP),
(3, 6, 18, CURRENT_TIMESTAMP),
(3, 7, 20, CURRENT_TIMESTAMP),
(3, 8, 23, CURRENT_TIMESTAMP),
-- User 4 (LÃª Thá»‹ Mai): Ná»¯, ngá»§ trÆ°á»›c 23h, khÃ´ng thuá»‘c, khÃ´ng pet, thá»‰nh thoáº£ng náº¥u, ráº¥t sáº¡ch, khÃ´ng khÃ¡ch, cÃ¢n báº±ng
-- Vector: 1.000,0.000,0.000,0.000,0.500,1.000,0.000,0.500
(4, 1, 2, CURRENT_TIMESTAMP),
(4, 2, 4, CURRENT_TIMESTAMP),
(4, 3, 7, CURRENT_TIMESTAMP),
(4, 4, 10, CURRENT_TIMESTAMP),
(4, 5, 14, CURRENT_TIMESTAMP),
(4, 6, 18, CURRENT_TIMESTAMP),
(4, 7, 19, CURRENT_TIMESTAMP),
(4, 8, 23, CURRENT_TIMESTAMP);

-- =============================================================================
-- 15. TIN ÄÄ‚NG TÃŒM Báº N á»ž GHÃ‰P (ROOMMATE_POSTS - UC 11 - UC 13)
-- =============================================================================
INSERT INTO roommate_posts (id, author_id, room_id, title, description, post_type, area_name, district, city, share_price, total_room_price, needed_roommates, current_roommates, latitude, longitude, radius_km, gender_preference, sleep_time, is_no_smoking, is_pet_friendly, cooking_frequency, cleanliness_level, guest_allowed, lifestyle_vector, status, created_at, updated_at)
VALUES
(1, 3, 2, 'TÃ¬m 1 báº¡n nam á»Ÿ ghÃ©p phÃ²ng 32m2 khÃ©p kÃ­n Triá»u KhÃºc, full Ä‘á»“', 'PhÃ²ng rá»™ng rÃ£i sáº¡ch sáº½, cÃ³ gÃ¡c xÃ©p, Ä‘iá»u hÃ²a, mÃ¡y giáº·t, tá»§ láº¡nh riÃªng. TiÃªu chuáº©n á»Ÿ gá»n gÃ ng vÄƒn minh, giá»¯ yÃªn tÄ©nh sau 23h.', 'HAS_ROOM', 'Sá»‘ 15 ngÃµ 68 Triá»u KhÃºc, Thanh XuÃ¢n Nam', 'Thanh XuÃ¢n', 'HÃ  Ná»™i', 1900000.00, 3800000.00, 1, 1, 20.98525000, 105.79820000, 3.0, 'MALE', 'BEFORE_24H', TRUE, FALSE, 'DAILY', 'VERY_CLEAN', 'WEEKENDS_ONLY', '0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, NULL, 'TÃ¬m báº¡n ná»¯ á»Ÿ ghÃ©p CCMN Cáº§u Giáº¥y gáº§n ÄH Quá»‘c Gia, ban cÃ´ng thoÃ¡ng mÃ¡t', 'Chung cÆ° mini má»›i xÃ¢y, thang mÃ¡y quáº¹t tháº», báº£o vá»‡ 24/7. TÃ¬m 1 báº¡n ná»¯ ngoan ngoÃ£n chia sáº» tiá»n phÃ²ng.', 'HAS_ROOM', 'NgÃµ 175 XuÃ¢n Thá»§y, Dá»‹ch Vá»ng Háº­u', 'Cáº§u Giáº¥y', 'HÃ  Ná»™i', 2200000.00, 4400000.00, 1, 1, 21.03710000, 105.78320000, 2.5, 'FEMALE', 'BEFORE_23H', TRUE, FALSE, 'SOMETIMES', 'VERY_CLEAN', 'NO', '1.000,0.000,0.000,0.000,0.500,1.000,0.000,0.500', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, NULL, 'NhÃ³m 2 báº¡n nam tÃ¬m thÃªm 1 báº¡n cÃ¹ng tÃ¬m thuÃª nhÃ  nguyÃªn cÄƒn Hai BÃ  TrÆ°ng', 'Äang tÃ¬m nhÃ  nguyÃªn cÄƒn 3 phÃ²ng ngá»§ quanh khu vá»±c ÄH BÃ¡ch Khoa - XÃ¢y Dá»±ng Ä‘á»ƒ chia tiá»n cho ráº».', 'SEARCHING_ROOM', 'Khu vá»±c Äáº¡i Cá»“ Viá»‡t - Táº¡ Quang Bá»­u', 'Hai BÃ  TrÆ°ng', 'HÃ  Ná»™i', 1600000.00, 4800000.00, 2, 2, 21.00680000, 105.84520000, 4.0, 'MALE', 'BEFORE_24H', TRUE, TRUE, 'DAILY', 'VERY_CLEAN', 'FLEXIBLE', '0.000,0.500,0.000,0.500,1.000,1.000,1.000,0.500', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Lá»‘i sá»‘ng riÃªng cá»§a bÃ i Ä‘Äƒng (Ä‘iá»n sáºµn tá»« profile tÃ¡c giáº£)
INSERT INTO roommate_post_lifestyle_answers (post_id, question_id, option_id, from_profile)
VALUES
(1, 1, 1, TRUE), (1, 2, 5, TRUE), (1, 3, 7, TRUE), (1, 4, 10, TRUE), (1, 5, 15, TRUE), (1, 6, 18, TRUE), (1, 7, 20, TRUE), (1, 8, 23, TRUE),
(2, 1, 2, TRUE), (2, 2, 4, TRUE), (2, 3, 7, TRUE), (2, 4, 10, TRUE), (2, 5, 14, TRUE), (2, 6, 18, TRUE), (2, 7, 19, TRUE), (2, 8, 23, TRUE);

-- =============================================================================
-- 16. ÄÆ N á»¨NG TUYá»‚N XIN GIA NHáº¬P NHÃ“M á»ž GHÃ‰P (ROOMMATE_APPLICATIONS - UC 14, UC 15)
-- =============================================================================
INSERT INTO roommate_applications (id, post_id, applicant_id, intro_message, gender, sleep_time, is_smoking, is_pet, cooking_habit, guest_habit, lifestyle_vector, compatibility_score, is_customized, status, reject_reason, created_at, updated_at)
VALUES
(1, 1, 5, 'ChÃ o báº¡n Chiáº¿n, mÃ¬nh lÃ  Äá»©c Anh há»c ÄHBK HÃ  Ná»™i, tÃ­nh tÃ¬nh gá»n gÃ ng, Ã­t khi á»Ÿ phÃ²ng ban ngÃ y, muá»‘n xin vÃ o á»Ÿ ghÃ©p phÃ²ng P102 Triá»u KhÃºc!', 'Nam', 'Khoáº£ng 23h30 - 6h30', FALSE, FALSE, 'Náº¥u Äƒn bá»¯a tá»‘i', 'BÃ¡o trÆ°á»›c khi cÃ³ báº¡n', '0.000,0.500,0.000,0.000,1.000,0.500,0.500,0.500', 94, FALSE, 'PENDING', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO roommate_application_lifestyle_answers (application_id, question_id, option_id, from_profile)
VALUES
(1, 1, 1, TRUE),
(1, 2, 5, TRUE),
(1, 3, 7, TRUE),
(1, 4, 10, TRUE),
(1, 5, 15, TRUE),
(1, 6, 17, TRUE),
(1, 7, 20, TRUE),
(1, 8, 23, TRUE);

-- =============================================================================
-- 17. Äá»’NG Bá»˜ AUTO-INCREMENT SEQUENCES CHO POSTGRESQL
-- =============================================================================
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('buildings_id_seq', COALESCE((SELECT MAX(id) FROM buildings), 1));
SELECT setval('services_id_seq', COALESCE((SELECT MAX(id) FROM services), 1));
SELECT setval('rooms_id_seq', COALESCE((SELECT MAX(id) FROM rooms), 1));
SELECT setval('room_images_id_seq', COALESCE((SELECT MAX(id) FROM room_images), 1));
SELECT setval('contracts_id_seq', COALESCE((SELECT MAX(id) FROM contracts), 1));
SELECT setval('tenants_id_seq', COALESCE((SELECT MAX(id) FROM tenants), 1));
SELECT setval('tenant_link_invitations_id_seq', COALESCE((SELECT MAX(id) FROM tenant_link_invitations), 1));
SELECT setval('contract_services_id_seq', COALESCE((SELECT MAX(id) FROM contract_services), 1));
SELECT setval('invoices_id_seq', COALESCE((SELECT MAX(id) FROM invoices), 1));
SELECT setval('invoice_items_id_seq', COALESCE((SELECT MAX(id) FROM invoice_items), 1));
SELECT setval('complaints_id_seq', COALESCE((SELECT MAX(id) FROM complaints), 1));
SELECT setval('lifestyle_questions_id_seq', COALESCE((SELECT MAX(id) FROM lifestyle_questions), 1));
SELECT setval('lifestyle_options_id_seq', COALESCE((SELECT MAX(id) FROM lifestyle_options), 1));
SELECT setval('roommate_posts_id_seq', COALESCE((SELECT MAX(id) FROM roommate_posts), 1));
SELECT setval('roommate_applications_id_seq', COALESCE((SELECT MAX(id) FROM roommate_applications), 1));



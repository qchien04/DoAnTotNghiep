-- =============================================================================
-- HỆ THỐNG QUẢN LÝ NHÀ TRỌ & TÌM NGƯỜI Ở GHÉP - ĐỒ ÁN TỐT NGHIỆP
-- DỮ LIỆU MẪU BAN ĐẦU (INITIAL SEED DATA)
-- Mật khẩu mặc định cho tất cả tài khoản: 123456
-- =============================================================================

-- =============================================================================
-- 0. DỌN DẸP DỮ LIỆU CŨ (TRÁNH XUNG ĐỘT UNIQUE CONSTRAINT KHI CHẠY LẠI)
-- =============================================================================
-- Gỡ bỏ liên kết vòng lặp giữa contracts và tenants trước khi xóa
UPDATE contracts SET representative_tenant_id = NULL WHERE representative_tenant_id IS NOT NULL;

DELETE FROM roommate_application_lifestyle_answers;
DELETE FROM roommate_applications;
DELETE FROM roommate_post_lifestyle_answers;
DELETE FROM roommate_posts;
DELETE FROM user_lifestyle_answers;
DELETE FROM lifestyle_options;
DELETE FROM lifestyle_questions;
DELETE FROM complaints;
DELETE FROM invoice_items;
DELETE FROM invoices;
DELETE FROM tenant_link_invitations;
DELETE FROM contract_services;
DELETE FROM tenants;
DELETE FROM contracts;
DELETE FROM room_services;
DELETE FROM room_images;
DELETE FROM rooms;
DELETE FROM services;
DELETE FROM buildings;
DELETE FROM refresh_tokens;
DELETE FROM notifications;
DELETE FROM users;

-- =============================================================================
-- 1. TÀI KHOẢN NGƯỜI DÙNG (USERS)
-- Hash BCrypt chuẩn cho mật khẩu '123456': $2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve
-- =============================================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, status, avatar_url, lifestyle_vector, enabled, created_at, updated_at)
VALUES
(1, 'admin', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Quản Trị Viên Hệ Thống', 'admin@stayhub.vn', '0900000001', 'ROLE_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'landlord', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Nguyễn Văn Thành', 'landlord@stayhub.vn', '0912345678', 'ROLE_LANDLORD', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'tenant', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Trần Quang Chiến', 'tenant@stayhub.vn', '0987654321', 'ROLE_TENANT', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', '0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'tenant2', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Lê Thị Mai', 'tenant2@stayhub.vn', '0934567890', 'ROLE_TENANT', 'ACTIVE', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '1.000,0.000,0.000,0.000,0.500,1.000,0.000,0.500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'tenant3', '$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve', 'Hoàng Đức Anh', 'ducanh@stayhub.vn', '0912888999', 'ROLE_TENANT', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '0.000,0.500,0.000,0.000,1.000,0.500,0.500,0.500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- =============================================================================
-- 2. TÒA NHÀ / KHU TRỌ (BUILDINGS)
-- =============================================================================
INSERT INTO buildings (id, landlord_id, name, province, ward, address_detail, num_floors, general_rules, latitude, longitude, is_active, created_at, updated_at)
VALUES
(1, 2, 'Tòa nhà Ánh Dương', 'Thành phố Hà Nội', 'Phường Thanh Xuân Nam', 'Số 15 ngõ 68 Triều Khúc', 5, 'Giữ gìn vệ sinh chung, không làm ồn sau 23h, khóa cổng cẩn thận.', 20.98520000, 105.79810000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'Chung cư Mini Cầu Giấy', 'Thành phố Hà Nội', 'Phường Dịch Vọng Hậu', 'Ngõ 175 Xuân Thủy', 7, 'Thang máy quẹt thẻ, khóa vân tay, để xe đúng vị trí quy định.', 21.03710000, 105.78320000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 3. DỊCH VỤ TIỆN ÍCH CHỦ TRỌ (SERVICES)
-- =============================================================================
INSERT INTO services (id, landlord_id, name, category, unit, unit_price, billing_method, scope, is_active, created_at, updated_at)
VALUES
(1, 2, 'Tiền điện sinh hoạt', 'ELECTRICITY', 'kWh', 3500, 'METER_INDEX', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'Tiền nước sinh hoạt', 'WATER', 'm3', 25000, 'METER_INDEX', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 'Internet Wifi tốc độ cao', 'INTERNET', 'phòng/tháng', 100000, 'FIXED_ROOM', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 'Vệ sinh hành lang & rác', 'CLEANING', 'người/tháng', 50000, 'PER_PERSON', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 4. PHÒNG TRỌ (ROOMS)
-- Phòng 1, 2, 3 thuộc Tòa nhà 1 (Ánh Dương)
-- Phòng 4 thuộc Tòa nhà 2 (CCMN Cầu Giấy)
-- Phòng 5: Nhà trọ độc lập (building_id = NULL) có địa chỉ & tọa độ GPS riêng
-- =============================================================================
INSERT INTO rooms (id, building_id, landlord_id, name, province, ward, address_detail, floor, area, listed_price, standard_deposit, max_capacity, current_occupancy, furnishing_level, amenities, description, status, latitude, longitude, is_public, created_at, updated_at)
VALUES
(1, 1, 2, 'Phòng 101 - Ban công thoáng', 'Thành phố Hà Nội', 'Phường Thanh Xuân Nam', 'Số 15 ngõ 68 Triều Khúc', 1, 28.50, 3500000, 3500000, 2, 0, 'FULL', 'Điều hòa, Bình nóng lạnh, Tủ lạnh, Giường đệm, Tủ quần áo', 'Phòng tầng 1 thoáng mát có ban công, cửa sổ đón gió tự nhiên.', 'AVAILABLE', 20.98520000, 105.79810000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'Phòng 102 - Khép kín cao cấp', 'Thành phố Hà Nội', 'Phường Thanh Xuân Nam', 'Số 15 ngõ 68 Triều Khúc', 1, 32.00, 3800000, 3800000, 3, 2, 'FULL', 'Điều hòa Daikin, Nóng lạnh, Tủ lạnh 2 cánh, Máy giặt riêng, Wifi tốc độ cao', 'Phòng tầng 1 khép kín, có gác xép kiên cố, để xe miễn phí.', 'OCCUPIED', 20.98525000, 105.79820000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 2, 'Phòng 201 - View phố thoáng đãng', 'Thành phố Hà Nội', 'Phường Thanh Xuân Nam', 'Số 15 ngõ 68 Triều Khúc', 2, 35.00, 4200000, 4200000, 3, 0, 'FULL', 'Điều hòa, Nóng lạnh, Tủ bếp riêng, Tủ lạnh, Bàn học', 'Phòng tầng 2 view thoáng mát, bếp nấu ăn riêng biệt.', 'AVAILABLE', 20.98530000, 105.79830000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 2, 'Phòng 302 - Studio Xuân Thủy', 'Thành phố Hà Nội', 'Phường Dịch Vọng Hậu', 'Ngõ 175 Xuân Thủy', 3, 30.00, 4400000, 4400000, 2, 1, 'FULL', 'Thang máy, Khóa vân tay, Điều hòa Inverter, Tủ lạnh side by side', 'Gần ĐH Sư Phạm, ĐH Quốc Gia, full nội thất cao cấp.', 'OCCUPIED', 21.03710000, 105.78320000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, NULL, 2, 'Nhà trọ độc lập Bách Khoa', 'Thành phố Hà Nội', 'Phường Bách Khoa', 'Số 25 ngõ 40 Tạ Quang Bửu', 1, 25.00, 3200000, 3200000, 2, 0, 'BASIC', 'Điều hòa, Nóng lạnh, Kệ bếp', 'Nhà trọ riêng độc lập không chung chủ, giờ giấc tự do, gần ĐHBK Hà Nội.', 'AVAILABLE', 21.00560000, 105.84330000, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 5. BẢNG ẢNH PHÒNG TRỌ (ROOM_IMAGES)
-- =============================================================================
INSERT INTO room_images (id, room_id, image_url, display_order, created_at)
VALUES
(1, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 0, CURRENT_TIMESTAMP),
(2, 2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 0, CURRENT_TIMESTAMP),
(3, 2, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1, CURRENT_TIMESTAMP),
(4, 4, 'https://images.unsplash.com/photo-1502005229762-ee1b2da94088?w=800', 0, CURRENT_TIMESTAMP),
(5, 5, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', 0, CURRENT_TIMESTAMP);

-- =============================================================================
-- 6. LIÊN KẾT PHÒNG - DỊCH VỤ (ROOM_SERVICES)
-- =============================================================================
INSERT INTO room_services (room_id, service_id)
VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 4),
(5, 1), (5, 2), (5, 3);

-- =============================================================================
-- 7. HỢP ĐỒNG THUÊ PHÒNG (CONTRACTS)
-- =============================================================================
INSERT INTO contracts (id, room_id, landlord_id, start_date, end_date, rent_price, deposit_amount, payment_cycle_day, status, terms_and_conditions, created_at, updated_at)
VALUES
(1, 2, 2, '2026-01-01', '2027-01-01', 3800000, 3800000, 5, 'ACTIVE', 'Hợp đồng thuê phòng có thời hạn 12 tháng. Tiền thuê đóng định kỳ ngày mùng 5 hàng tháng. Giữ gìn trang thiết bị và tuân thủ nội quy tòa nhà.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, '2025-01-01', '2026-01-01', 3500000, 3500000, 5, 'EXPIRED', 'Hợp đồng thuê phòng P101 năm 2025 đã kết thúc hạn hợp đồng.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 8. KHÁCH THUÊ PHÒNG (TENANTS)
-- - tenant (user_id=3): Đại diện hợp đồng, ĐÃ LIÊN KẾT (LINKED) phòng P102
-- - tenant3 (user_id=5): Khách thuê cùng phòng, ĐANG CHỜ XÁC NHẬN LIÊN KẾT (PENDING)
-- - tenant2 (user_id=4, Lê Thị Mai): Khách thuê tự do, KHÔNG có phòng và KHÔNG có lời mời
-- =============================================================================
INSERT INTO tenants (id, room_id, contract_id, user_id, full_name, phone, id_card_number, gender, is_representative, link_status, status, created_at, updated_at)
VALUES
(1, 2, 1, 3, 'Trần Quang Chiến', '0987654321', '001202008999', 'Nam', TRUE, 'LINKED', 'STAYING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 1, 5, 'Hoàng Đức Anh', '0912888999', '001202007888', 'Nam', FALSE, 'PENDING', 'STAYING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1, 2, 3, 'Trần Quang Chiến', '0987654321', '001202008999', 'Nam', TRUE, 'LINKED', 'LEFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Cập nhật người đại diện hợp đồng
UPDATE contracts SET representative_tenant_id = 1 WHERE id = 1;
UPDATE contracts SET representative_tenant_id = 3 WHERE id = 2;

-- =============================================================================
-- 8b. LỜI MỜI LIÊN KẾT PHÒNG TRỌ (TENANT_LINK_INVITATIONS - UC 16)
-- Chủ nhà Nguyễn Văn Thành (landlord, id=2) mời Hoàng Đức Anh (tenant3, id=5) vào phòng P102
-- Tuyệt đối KHÔNG mời tenant2 (Lê Thị Mai)
-- =============================================================================
INSERT INTO tenant_link_invitations (id, tenant_id, user_id, contract_id, invited_by, status, reject_reason, created_at, responded_at)
VALUES
(1, 2, 5, 1, 2, 'PENDING', NULL, CURRENT_TIMESTAMP, NULL);

-- =============================================================================
-- 9. DỊCH VỤ THỎA THUẬN TRONG HỢP ĐỒNG (CONTRACT_SERVICES)
-- =============================================================================
INSERT INTO contract_services (id, contract_id, service_id, service_name, unit, applied_unit_price, billing_method, last_index, created_at)
VALUES
(1, 1, 1, 'Tiền điện sinh hoạt', 'kWh', 3500, 'METER_INDEX', 120, CURRENT_TIMESTAMP),
(2, 1, 2, 'Tiền nước sinh hoạt', 'm3', 25000, 'METER_INDEX', 15, CURRENT_TIMESTAMP),
(3, 1, 3, 'Internet Wifi tốc độ cao', 'phòng/tháng', 100000, 'FIXED_ROOM', 0, CURRENT_TIMESTAMP),
(4, 1, 4, 'Vệ sinh hành lang & rác', 'người/tháng', 50000, 'PER_PERSON', 0, CURRENT_TIMESTAMP);

-- =============================================================================
-- 10. HÓA ĐƠN TIỀN PHÒNG HÀNG THÁNG (INVOICES)
-- =============================================================================
INSERT INTO invoices (id, contract_id, billing_period, due_date, room_price, services_amount, other_amount, total_amount, paid_amount, status, payment_method, paid_at, payment_note, created_at, updated_at)
VALUES
(1, 1, '09/2026', '2026-10-05', 3800000, 420000, 0, 4220000, 4220000, 'PAID', 'VIETQR', '2026-10-04 15:30:00+07', 'Đã gạch nợ thành công qua chuyển khoản VietQR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, '10/2026', CURRENT_DATE + INTERVAL '5 days', 3800000, 727500, 0, 4527500, 0, 'UNPAID', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, '12/2025', '2026-01-05', 3500000, 450000, 0, 3950000, 3950000, 'PAID', 'VIETQR', '2026-01-04 10:00:00+07', 'Đã thanh toán đủ kỳ tháng 12/2025', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 11. CHI TIẾT KHOẢN THU TRONG HÓA ĐƠN (INVOICE_ITEMS)
-- =============================================================================
INSERT INTO invoice_items (id, invoice_id, contract_service_id, item_type, item_name, previous_index, current_index, quantity, unit_price, amount, note)
VALUES
(1, 2, NULL, 'ROOM_RENT', 'Tiền thuê phòng P102 (Tháng 10/2026)', NULL, NULL, 1.00, 3800000, 3800000, 'Tiền phòng cố định theo hợp đồng'),
(2, 2, 1, 'SERVICE', 'Tiền điện sinh hoạt (115 kWh)', 120, 235, 115.00, 3500, 402500, 'Từ số 120 đến 235'),
(3, 2, 2, 'SERVICE', 'Tiền nước sạch sinh hoạt (9 m³)', 15, 24, 9.00, 25000, 225000, 'Từ số 15 đến 24'),
(4, 2, 3, 'SERVICE', 'Internet Wifi cáp quang', NULL, NULL, 1.00, 100000, 100000, 'Trọn gói phòng'),
(5, 2, 4, 'SERVICE', 'Phí vệ sinh & rác thải (2 người)', NULL, NULL, 2.00, 50000, 100000, '50.000 đ/người/tháng'),
(6, 1, NULL, 'ROOM_RENT', 'Tiền thuê phòng P102 (Tháng 09/2026)', NULL, NULL, 1.00, 3800000, 3800000, 'Tiền phòng cố định theo hợp đồng'),
(7, 1, 1, 'SERVICE', 'Tiền điện sinh hoạt (110 kWh)', 10, 120, 110.00, 3500, 385000, 'Từ số 10 đến 120'),
(8, 1, 2, 'SERVICE', 'Tiền nước sạch sinh hoạt (10 m³)', 5, 15, 10.00, 25000, 250000, 'Từ số 5 đến 15'),
(9, 3, NULL, 'ROOM_RENT', 'Tiền thuê phòng P101 (Tháng 12/2025)', NULL, NULL, 1.00, 3500000, 3500000, 'Kỳ thanh toán cuối cùng trước khi hết hạn'),
(10, 3, 1, 'SERVICE', 'Tiền điện sinh hoạt (105 kWh)', 210, 315, 105.00, 3500, 367500, 'Từ số 210 đến 315'),
(11, 3, 2, 'SERVICE', 'Tiền nước sinh hoạt (10 m³)', 30, 40, 10.00, 25000, 250000, 'Từ số 30 đến 40');

-- =============================================================================
-- 12. KHIẾU NẠI & BÁO HỎNG THIẾT BỊ (COMPLAINTS - UC 18)
-- =============================================================================
INSERT INTO complaints (id, room_id, tenant_id, title, content, incident_type, severity, status, resolution_note, resolved_at, rating, feedback, created_at, updated_at)
VALUES
(1, 2, 1, 'Điều hòa Daikin phòng 102 chảy nước và không mát', 'Điều hòa bật 24 độ nhưng chỉ có gió thổi, dàn lạnh rò rỉ nước nhỏ giọt xuống sàn gỗ.', 'AIR_CONDITIONER', 'HIGH', 'PROCESSING', 'Chủ trọ đã tiếp nhận và hẹn thợ điện lạnh qua kiểm tra sáng mai lúc 9h.', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 1, 'Bóng đèn led hành lang tầng 1 bị chập chờn', 'Đèn chớp tắt liên tục vào ban đêm gây khó quan sát khi đi lại.', 'ELECTRICITY', 'LOW', 'RESOLVED', 'Đã thay bóng Philips 18W mới lúc 15h ngày 25/09.', '2026-09-25 15:00:00+07', 5, 'Thợ thay bóng rất nhanh và nhiệt tình, đèn sáng bình thường.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =============================================================================
-- 13. DANH MỤC CÂU HỎI & LỰA CHỌN LỐI SỐNG (LIFESTYLE_QUESTIONS & OPTIONS)
-- =============================================================================
INSERT INTO lifestyle_questions (id, code, label, category, q_type, is_hard, weight, sort_order, is_active)
VALUES
(1, 'GENDER', 'Giới tính mong muốn / Bản thân', 'PERSONAL', 'SINGLE', TRUE, 1.00, 1, TRUE),
(2, 'SLEEP_TIME', 'Giờ giấc đi ngủ ban đêm', 'HABIT', 'SINGLE', FALSE, 1.20, 2, TRUE),
(3, 'SMOKING', 'Thói quen hút thuốc lá', 'HABIT', 'SINGLE', TRUE, 1.50, 3, TRUE),
(4, 'PET', 'Thú cưng (Chó / Mèo)', 'HABIT', 'SINGLE', FALSE, 1.00, 4, TRUE),
(5, 'COOKING', 'Tần suất nấu ăn tại phòng', 'LIVING', 'SINGLE', FALSE, 0.80, 5, TRUE),
(6, 'CLEANLINESS', 'Mức độ giữ gìn sạch sẽ, ngăn nắp', 'LIVING', 'SINGLE', FALSE, 1.00, 6, TRUE),
(7, 'GUEST', 'Quy định tiếp khách / Bạn bè về phòng', 'LIVING', 'SINGLE', FALSE, 1.00, 7, TRUE),
(8, 'PERSONALITY', 'Tính cách & Không gian sống', 'PERSONAL', 'SINGLE', FALSE, 0.80, 8, TRUE);

INSERT INTO lifestyle_options (id, question_id, label, value, sort_order, is_active)
VALUES
-- Question 1: GENDER
(1, 1, 'Nam', 0.000, 1, TRUE),
(2, 1, 'Nữ', 1.000, 2, TRUE),
(3, 1, 'Không quan trọng / Linh hoạt', 0.500, 3, TRUE),
-- Question 2: SLEEP_TIME
(4, 2, 'Ngủ sớm trước 23h', 0.000, 1, TRUE),
(5, 2, 'Ngủ khoảng 23h - 24h', 0.500, 2, TRUE),
(6, 2, 'Thức khuya sau 24h', 1.000, 3, TRUE),
-- Question 3: SMOKING
(7, 3, 'Hoàn toàn không hút thuốc', 0.000, 1, TRUE),
(8, 3, 'Thỉnh thoảng / Chỉ ra ngoài hút', 0.500, 2, TRUE),
(9, 3, 'Thường xuyên hút thuốc', 1.000, 3, TRUE),
-- Question 4: PET
(10, 4, 'Không nuôi thú cưng', 0.000, 1, TRUE),
(11, 4, 'Yêu thích / Thỉnh thoảng chăm sóc', 0.500, 2, TRUE),
(12, 4, 'Đang nuôi chó / mèo trong phòng', 1.000, 3, TRUE),
-- Question 5: COOKING
(13, 5, 'Hiếm khi nấu ăn / Ăn ngoài', 0.000, 1, TRUE),
(14, 5, 'Thỉnh thoảng nấu ăn', 0.500, 2, TRUE),
(15, 5, 'Thường xuyên tự nấu bữa tối', 1.000, 3, TRUE),
-- Question 6: CLEANLINESS
(16, 6, 'Linh hoạt, thoải mái', 0.000, 1, TRUE),
(17, 6, 'Gọn gàng, vệ sinh định kỳ', 0.500, 2, TRUE),
(18, 6, 'Rất sạch sẽ, ngăn nắp hàng ngày', 1.000, 3, TRUE),
-- Question 7: GUEST
(19, 7, 'Không dẫn bạn bè về phòng', 0.000, 1, TRUE),
(20, 7, 'Báo trước / Chỉ tiếp cuối tuần', 0.500, 2, TRUE),
(21, 7, 'Thoải mái tiếp bạn bè', 1.000, 3, TRUE),
-- Question 8: PERSONALITY
(22, 8, 'Hướng nội, thích yên tĩnh tuyệt đối', 0.000, 1, TRUE),
(23, 8, 'Cân bằng, vui vẻ hòa đồng', 0.500, 2, TRUE),
(24, 8, 'Hướng ngoại, thích giao lưu trò chuyện', 1.000, 3, TRUE);

-- =============================================================================
-- 14. CÂU TRẢ LỜI LỐI SỐNG GỐC CỦA NGƯỜI DÙNG (USER_LIFESTYLE_ANSWERS)
-- User 3: Nam, ngủ 23h-24h, không thuốc, không pet, thường xuyên nấu, rất sạch, báo trước khách, cân bằng
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
-- User 4 (Lê Thị Mai): Nữ, ngủ trước 23h, không thuốc, không pet, thỉnh thoảng nấu, rất sạch, không khách, cân bằng
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
-- 15. TIN ĐĂNG TÌM BẠN Ở GHÉP (ROOMMATE_POSTS - UC 11 - UC 13)
-- =============================================================================
INSERT INTO roommate_posts (id, author_id, room_id, title, description, post_type, area_name, district, city, share_price, total_room_price, needed_roommates, current_roommates, latitude, longitude, radius_km, gender_preference, sleep_time, is_no_smoking, is_pet_friendly, cooking_frequency, cleanliness_level, guest_allowed, lifestyle_vector, status, created_at, updated_at)
VALUES
(1, 3, 2, 'Tìm 1 bạn nam ở ghép phòng 32m2 khép kín Triều Khúc, full đồ', 'Phòng rộng rãi sạch sẽ, có gác xép, điều hòa, máy giặt, tủ lạnh riêng. Tiêu chuẩn ở gọn gàng văn minh, giữ yên tĩnh sau 23h.', 'HAS_ROOM', 'Số 15 ngõ 68 Triều Khúc, Thanh Xuân Nam', 'Thanh Xuân', 'Hà Nội', 1900000.00, 3800000.00, 1, 1, 20.98525000, 105.79820000, 3.0, 'MALE', 'BEFORE_24H', TRUE, FALSE, 'DAILY', 'VERY_CLEAN', 'WEEKENDS_ONLY', '0.000,0.500,0.000,0.000,1.000,1.000,0.500,0.500', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, NULL, 'Tìm bạn nữ ở ghép CCMN Cầu Giấy gần ĐH Quốc Gia, ban công thoáng mát', 'Chung cư mini mới xây, thang máy quẹt thẻ, bảo vệ 24/7. Tìm 1 bạn nữ ngoan ngoãn chia sẻ tiền phòng.', 'HAS_ROOM', 'Ngõ 175 Xuân Thủy, Dịch Vọng Hậu', 'Cầu Giấy', 'Hà Nội', 2200000.00, 4400000.00, 1, 1, 21.03710000, 105.78320000, 2.5, 'FEMALE', 'BEFORE_23H', TRUE, FALSE, 'SOMETIMES', 'VERY_CLEAN', 'NO', '1.000,0.000,0.000,0.000,0.500,1.000,0.000,0.500', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, NULL, 'Nhóm 2 bạn nam tìm thêm 1 bạn cùng tìm thuê nhà nguyên căn Hai Bà Trưng', 'Đang tìm nhà nguyên căn 3 phòng ngủ quanh khu vực ĐH Bách Khoa - Xây Dựng để chia tiền cho rẻ.', 'SEARCHING_ROOM', 'Khu vực Đại Cồ Việt - Tạ Quang Bửu', 'Hai Bà Trưng', 'Hà Nội', 1600000.00, 4800000.00, 2, 2, 21.00680000, 105.84520000, 4.0, 'MALE', 'BEFORE_24H', TRUE, TRUE, 'DAILY', 'VERY_CLEAN', 'FLEXIBLE', '0.000,0.500,0.000,0.500,1.000,1.000,1.000,0.500', 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Lối sống riêng của bài đăng (điền sẵn từ profile tác giả)
INSERT INTO roommate_post_lifestyle_answers (post_id, question_id, option_id, from_profile)
VALUES
(1, 1, 1, TRUE), (1, 2, 5, TRUE), (1, 3, 7, TRUE), (1, 4, 10, TRUE), (1, 5, 15, TRUE), (1, 6, 18, TRUE), (1, 7, 20, TRUE), (1, 8, 23, TRUE),
(2, 1, 2, TRUE), (2, 2, 4, TRUE), (2, 3, 7, TRUE), (2, 4, 10, TRUE), (2, 5, 14, TRUE), (2, 6, 18, TRUE), (2, 7, 19, TRUE), (2, 8, 23, TRUE);

-- =============================================================================
-- 16. ĐƠN ỨNG TUYỂN XIN GIA NHẬP NHÓM Ở GHÉP (ROOMMATE_APPLICATIONS - UC 14, UC 15)
-- =============================================================================
INSERT INTO roommate_applications (id, post_id, applicant_id, intro_message, gender, sleep_time, is_smoking, is_pet, cooking_habit, guest_habit, lifestyle_vector, compatibility_score, is_customized, status, reject_reason, created_at, updated_at)
VALUES
(1, 1, 5, 'Chào bạn Chiến, mình là Đức Anh học ĐHBK Hà Nội, tính tình gọn gàng, ít khi ở phòng ban ngày, muốn xin vào ở ghép phòng P102 Triều Khúc!', 'Nam', 'Khoảng 23h30 - 6h30', FALSE, FALSE, 'Nấu ăn bữa tối', 'Báo trước khi có bạn', '0.000,0.500,0.000,0.000,1.000,0.500,0.500,0.500', 94, FALSE, 'PENDING', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
-- 17. ĐỒNG BỘ AUTO-INCREMENT SEQUENCES CHO POSTGRESQL
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


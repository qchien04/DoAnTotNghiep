import random
import os

def generate_sql():
    random.seed(42)  # Cố định seed để dữ liệu đồng nhất, chuẩn xác

    first_names = [
        "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", 
        "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đinh", "Đoàn", "Lâm", "Trịnh"
    ]
    middle_names_male = ["Văn", "Đức", "Quang", "Minh", "Hữu", "Tuấn", "Thanh", "Đình", "Quốc", "Hoàng", "Xuân"]
    middle_names_female = ["Thị", "Ngọc", "Thu", "Mai", "Phương", "Thanh", "Ánh", "Hồng", "Kim", "Mỹ"]
    last_names_male = ["Dũng", "Hải", "Long", "Phong", "Sơn", "Thắng", "Nam", "Huy", "Hùng", "Cường", "Tuấn", "Kiên", "Bình", "Khoa", "Đạt", "Tùng", "Bách", "Trọng"]
    last_names_female = ["Linh", "Lan", "Mai", "Trang", "Hương", "Phương", "Thảo", "Nga", "Hà", "Ly", "Anh", "Vy", "Huyền", "Yến", "Dung", "Quỳnh", "Trúc"]

    locations = [
        # Hà Nội
        {"province": "Thành phố Hà Nội", "district": "Cầu Giấy", "ward": "Phường Dịch Vọng Hậu", "streets": ["Xuân Thủy", "Duy Tân", "Trần Thái Tông", "Trần Quốc Vượng"], "lat": 21.0360, "lng": 105.7850},
        {"province": "Thành phố Hà Nội", "district": "Cầu Giấy", "ward": "Phường Quan Hoa", "streets": ["Cầu Giấy", "Nguyễn Khánh Toàn", "Quan Hoa", "Dương Quảng Hàm"], "lat": 21.0385, "lng": 105.7990},
        {"province": "Thành phố Hà Nội", "district": "Cầu Giấy", "ward": "Phường Nghĩa Tân", "streets": ["Nghĩa Tân", "Tô Hiệu", "Hoàng Quốc Việt", "Trần Tử Bình"], "lat": 21.0450, "lng": 105.7920},
        {"province": "Thành phố Hà Nội", "district": "Đống Đa", "ward": "Phường Láng Thượng", "streets": ["Chùa Láng", "Đường Láng", "Nguyễn Chí Thanh", "Huỳnh Thúc Kháng"], "lat": 21.0250, "lng": 105.8050},
        {"province": "Thành phố Hà Nội", "district": "Đống Đa", "ward": "Phường Ô Chợ Dừa", "streets": ["Đê La Thành", "Xã Đàn", "Tôn Đức Thắng", "Hào Nam"], "lat": 21.0190, "lng": 105.8280},
        {"province": "Thành phố Hà Nội", "district": "Thanh Xuân", "ward": "Phường Thanh Xuân Nam", "streets": ["Triều Khúc", "Nguyễn Trãi", "Lương Thế Vinh", "Nguyễn Xiển"], "lat": 20.9880, "lng": 105.7990},
        {"province": "Thành phố Hà Nội", "district": "Thanh Xuân", "ward": "Phường Nhân Chính", "streets": ["Lê Văn Lương", "Ngụy Như Kon Tum", "Quan Nhân", "Hoàng Đạo Thúy"], "lat": 21.0050, "lng": 105.8030},
        {"province": "Thành phố Hà Nội", "district": "Hai Bà Trưng", "ward": "Phường Bách Khoa", "streets": ["Tạ Quang Bửu", "Trần Đại Nghĩa", "Lê Thanh Nghị", "Đại Cồ Việt"], "lat": 21.0050, "lng": 105.8450},
        {"province": "Thành phố Hà Nội", "district": "Hai Bà Trưng", "ward": "Phường Đồng Tâm", "streets": ["Trần Đại Nghĩa", "Vọng", "Giải Phóng", "Đại La"], "lat": 20.9990, "lng": 105.8420},
        {"province": "Thành phố Hà Nội", "district": "Nam Từ Liêm", "ward": "Phường Mỹ Đình 1", "streets": ["Đình Thôn", "Mễ Trì Hạ", "Phạm Hùng", "Vũ Quỳnh"], "lat": 21.0180, "lng": 105.7740},
        {"province": "Thành phố Hà Nội", "district": "Nam Từ Liêm", "ward": "Phường Mỹ Đình 2", "streets": ["Nguyễn Hoàng", "Lê Đức Thọ", "Trần Bình", "Mỹ Đình"], "lat": 21.0310, "lng": 105.7730},
        {"province": "Thành phố Hà Nội", "district": "Bắc Từ Liêm", "ward": "Phường Cổ Nhuế 1", "streets": ["Trần Cung", "Phạm Văn Đồng", "Cổ Nhuế", "Hoàng Quốc Việt"], "lat": 21.0520, "lng": 105.7860},
        {"province": "Thành phố Hà Nội", "district": "Hà Đông", "ward": "Phường Mộ Lao", "streets": ["Thanh Bình", "Nguyễn Văn Lộc", "Trần Phú", "Vũ Trọng Khánh"], "lat": 20.9830, "lng": 105.7850},
        # TP. Hồ Chí Minh
        {"province": "Thành phố Hồ Chí Minh", "district": "Bình Thạnh", "ward": "Phường 25", "streets": ["Điện Biên Phủ", "D2 (Nguyễn Gia Trí)", "D5", "Xô Viết Nghệ Tĩnh"], "lat": 10.8040, "lng": 106.7150},
        {"province": "Thành phố Hồ Chí Minh", "district": "Bình Thạnh", "ward": "Phường 15", "streets": ["Bạch Đằng", "Đinh Bộ Lĩnh", "Phan Đăng Lưu", "Lê Quang Định"], "lat": 10.8010, "lng": 106.7020},
        {"province": "Thành phố Hồ Chí Minh", "district": "Tân Bình", "ward": "Phường 2", "streets": ["Trường Sơn", "Bạch Đằng", "Hồng Hà", "Cửu Long"], "lat": 10.8120, "lng": 106.6650},
        {"province": "Thành phố Hồ Chí Minh", "district": "Tân Bình", "ward": "Phường 13", "streets": ["Cộng Hòa", "Ấp Bắc", "Nhất Chi Mai", "Bình Giã"], "lat": 10.8020, "lng": 106.6430},
        {"province": "Thành phố Hồ Chí Minh", "district": "Quận 10", "ward": "Phường 14", "streets": ["Tô Hiến Thành", "3 Tháng 2", "Lý Thường Kiệt", "Thành Thái"], "lat": 10.7710, "lng": 106.6610},
        {"province": "Thành phố Hồ Chí Minh", "district": "Quận 7", "ward": "Phường Tân Phong", "streets": ["Lê Văn Lương", "Nguyễn Thị Thập", "Nguyễn Hữu Thọ", "Lâm Văn Bền"], "lat": 10.7420, "lng": 106.7030},
        # Đà Nẵng
        {"province": "Thành phố Đà Nẵng", "district": "Hải Châu", "ward": "Phường Hòa Cường Bắc", "streets": ["Tiểu La", "Núi Thành", "30 Tháng 4", "Lê Thanh Nghị"], "lat": 16.0460, "lng": 108.2160},
        {"province": "Thành phố Đà Nẵng", "district": "Ngũ Hành Sơn", "ward": "Phường Mỹ An", "streets": ["An Thượng 2", "Châu Thị Vĩnh Tế", "Ngô Thì Sĩ", "Hoàng Kế Viêm"], "lat": 16.0520, "lng": 108.2410},
    ]

    room_photo_urls = [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
        "https://images.unsplash.com/photo-1502005229762-ee1b2da94088?w=800",
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
        "https://images.unsplash.com/photo-1615873968403-89e068629265?w=800",
        "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800",
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800",
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800"
    ]

    landlord_avatar_urls = [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
    ]

    room_amenities_pool = [
        "Điều hòa Inverter", "Bình nóng lạnh", "Tủ lạnh 2 cánh", "Máy giặt riêng", 
        "Giường đệm cao cấp", "Tủ quần áo 3 cánh", "Bếp từ đôi", "Hút mùi", 
        "Bàn làm việc", "Wifi cáp quang riêng", "Khóa cửa vân tay", "Thang máy", 
        "Ban công phơi đồ", "Gác xép kiên cố", "Cửa sổ thoáng mát", "Camera an ninh 24/7"
    ]

    building_prefixes = [
        "Tòa nhà", "Chung cư mini", "Căn hộ dịch vụ", "Khu nhà trọ", "Nhà trọ cao cấp",
        "Homestay", "Tòa căn hộ Studio", "Tổ hợp phòng trọ"
    ]
    building_names = [
        "Ánh Dương", "Hòa Bình", "Hưng Thịnh", "Thịnh Vượng", "An Khang", "Bình An", 
        "Sao Mai", "Đại Nam", "Sen Vàng", "Hoàng Gia", "Phú Quý", "Gia An", "Hải Đăng", 
        "Phúc Lộc", "Minh Trí", "Bách Khoa", "Cầu Giấy", "Tây Hồ", "Mỹ Đình", "Thanh Xuân"
    ]

    lines = []
    lines.append("-- =============================================================================")
    lines.append("-- SEED DATA: 100 CHỦ TRỌ & 1000 PHÒNG TRỌ TOÀN DIỆN CHO HỆ THỐNG ROOMI")
    lines.append("-- Tạo tự động: Hỗ trợ kiểm thử tải lớn, bản đồ, lọc phòng, tìm kiếm thông minh")
    lines.append("-- Định dạng: PostgreSQL 14+ / H2 Compatible")
    lines.append("-- =============================================================================\n")

    lines.append("BEGIN;\n")

    # Mật khẩu hash chuẩn: 123456
    pwd_hash = "$2a$10$PYpjCqa.Ha48Olk1.ko3zOIB8pNx.qco52BtGMZBFyU0kmnaJEeve"

    # --- 1. SINH 100 CHỦ TRỌ (USERS) ---
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 1. TẠO 100 TÀI KHOẢN CHỦ TRỌ (ROLE_LANDLORD: id 101 -> 200)")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("INSERT INTO users (id, username, password_hash, full_name, email, phone, role, status, avatar_url, gender, gender_preference, smokes, rejects_smokers, has_pet, rejects_pets, enabled, created_at, updated_at)")
    lines.append("VALUES")

    user_values = []
    landlord_ids = list(range(101, 201))  # 100 chủ trọ
    used_phones = set()

    for idx, lid in enumerate(landlord_ids, start=1):
        is_male = random.random() < 0.6
        gender = "MALE" if is_male else "FEMALE"
        first = random.choice(first_names)
        mid = random.choice(middle_names_male if is_male else middle_names_female)
        last = random.choice(last_names_male if is_male else last_names_female)
        full_name = f"{first} {mid} {last}"
        
        username = f"chutro_{idx:03d}"
        email = f"chutro{idx:03d}@roomi.vn"
        
        # Phone generator (đảm bảo 10 số, duy nhất)
        while True:
            phone_prefix = random.choice(["090", "091", "093", "097", "098", "086", "088", "079", "077", "083"])
            phone_suffix = f"{random.randint(1000000, 9999999)}"
            phone = phone_prefix + phone_suffix
            if phone not in used_phones:
                used_phones.add(phone)
                break
        
        avatar = random.choice(landlord_avatar_urls)

        user_values.append(
            f"  ({lid}, '{username}', '{pwd_hash}', '{full_name}', '{email}', '{phone}', "
            f"'ROLE_LANDLORD', 'ACTIVE', '{avatar}', '{gender}', 'ANY', FALSE, FALSE, FALSE, FALSE, TRUE, "
            f"CURRENT_TIMESTAMP - INTERVAL '{random.randint(10, 180)} days', CURRENT_TIMESTAMP)"
        )

    lines.append(",\n".join(user_values))
    lines.append("ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;\n")

    # --- 2. SINH CÁC TÒA NHÀ (BUILDINGS) ---
    # Mỗi chủ trọ có 1-2 tòa nhà (khoảng 150 tòa)
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 2. TẠO TÒA NHÀ CHO CÁC CHỦ TRỌ (BUILDINGS: id 101 -> 250)")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("INSERT INTO buildings (id, landlord_id, name, province, ward, address_detail, num_floors, general_rules, latitude, longitude, is_active, created_at, updated_at)")
    lines.append("VALUES")

    building_values = []
    building_id_counter = 101
    landlord_buildings = {}  # landlord_id -> list of building_ids

    for lid in landlord_ids:
        num_blds = random.choices([1, 2], weights=[60, 40])[0]
        landlord_buildings[lid] = []
        for b_idx in range(num_blds):
            bid = building_id_counter
            building_id_counter += 1
            landlord_buildings[lid].append(bid)

            loc = random.choice(locations)
            street = random.choice(loc["streets"])
            house_no = f"Số {random.randint(2, 198)}"
            if random.random() < 0.6:
                house_no += f" ngõ {random.randint(12, 189)}"
            address_detail = f"{house_no} {street}"
            
            b_name = f"{random.choice(building_prefixes)} {random.choice(building_names)} {random.choice(['Center', 'Premier', 'Plus', 'House', 'Eco', 'Garden', 'Riverside', 'Home', 'Station', 'Life'])}"
            num_floors = random.randint(3, 8)
            rules = "Giữ gìn vệ sinh chung, không tụ tập làm ồn sau 23h, khóa cổng và giữ thẻ xe cẩn thận."

            # Tọa độ jitter nhẹ (+/- 0.005)
            lat = round(loc["lat"] + random.uniform(-0.006, 0.006), 7)
            lng = round(loc["lng"] + random.uniform(-0.006, 0.006), 7)

            building_values.append(
                f"  ({bid}, {lid}, '{b_name}', '{loc['province']}', '{loc['ward']}', '{address_detail}', "
                f"{num_floors}, '{rules}', {lat}, {lng}, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            )

    lines.append(",\n".join(building_values))
    lines.append("ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;\n")

    # --- 3. SINH DỊCH VỤ TIỆN ÍCH CHO TỪNG CHỦ TRỌ (SERVICES) ---
    # Mỗi chủ trọ có 4 dịch vụ cơ bản: Điện (METER_INDEX), Nước (METER_INDEX hoặc FIXED), Wifi, Vệ sinh
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 3. TẠO DỊCH VỤ TIỆN ÍCH CHO 100 CHỦ TRỌ (SERVICES: 4 dịch vụ / chủ)")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("INSERT INTO services (id, landlord_id, name, category, unit, unit_price, billing_method, scope, is_active, created_at, updated_at)")
    lines.append("VALUES")

    service_values = []
    service_id_counter = 101
    landlord_services = {}  # landlord_id -> list of service_ids

    for lid in landlord_ids:
        landlord_services[lid] = []
        # 1. Điện
        sid1 = service_id_counter
        service_id_counter += 1
        landlord_services[lid].append(sid1)
        elec_price = random.choice([3500, 3800, 4000])
        service_values.append(
            f"  ({sid1}, {lid}, 'Tiền điện sinh hoạt', 'ELECTRICITY', 'kWh', {elec_price}, 'METER_INDEX', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        )

        # 2. Nước
        sid2 = service_id_counter
        service_id_counter += 1
        landlord_services[lid].append(sid2)
        if random.random() < 0.6:
            service_values.append(
                f"  ({sid2}, {lid}, 'Tiền nước máy (đồng hồ)', 'WATER', 'm3', {random.choice([25000, 28000, 30000])}, 'METER_INDEX', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            )
        else:
            service_values.append(
                f"  ({sid2}, {lid}, 'Tiền nước sinh hoạt', 'WATER', 'người/tháng', {random.choice([80000, 100000])}, 'FIXED_PER_PERSON', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            )

        # 3. Wifi
        sid3 = service_id_counter
        service_id_counter += 1
        landlord_services[lid].append(sid3)
        service_values.append(
            f"  ({sid3}, {lid}, 'Internet Wifi tốc độ cao', 'INTERNET', 'phòng/tháng', {random.choice([80000, 100000, 120000])}, 'FIXED_PER_ROOM', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        )

        # 4. Rác & Vệ sinh chung
        sid4 = service_id_counter
        service_id_counter += 1
        landlord_services[lid].append(sid4)
        service_values.append(
            f"  ({sid4}, {lid}, 'Vệ sinh & rác thải hành lang', 'CLEANING', 'người/tháng', {random.choice([40000, 50000, 60000])}, 'FIXED_PER_PERSON', 'ALL', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        )

    lines.append(",\n".join(service_values))
    lines.append("ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;\n")

    # --- 4. SINH ĐÚNG 1000 PHÒNG TRỌ (ROOMS) ---
    # Phân bố: 100 chủ trọ x 10 phòng = đúng 1000 phòng (id 101 -> 1100)
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 4. TẠO ĐÚNG 1000 PHÒNG TRỌ (ROOMS: id 101 -> 1100)")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("INSERT INTO rooms (id, building_id, landlord_id, name, province, ward, address_detail, floor, area, listed_price, standard_deposit, max_capacity, current_occupancy, furnishing_level, amenities, description, status, cover_image_url, latitude, longitude, is_public, created_at, updated_at)")
    lines.append("VALUES")

    room_values = []
    room_services_pairs = []
    room_images_values = []
    img_id_counter = 101

    room_id = 101
    room_adjectives = [
        "Ban công thoáng mát", "Khép kín cao cấp", "View thoáng đón gió", "Studio gác xép xinh xắn",
        "Full nội thất sang xịn", "Cửa sổ rộng ngập nắng", "Yên tĩnh tiện học tập", "Khép kín hiện đại",
        "Có máy giặt riêng", "View thành phố", "Gần bến xe & đại học", "Gác lửng kiên cố",
        "Tiện nghi đầy đủ", "Mới sơn sửa sạch đẹp", "Khu dân trí cao", "Tự do không chung chủ"
    ]

    for lid in landlord_ids:
        blds = landlord_buildings[lid]
        # Mỗi chủ trọ sở hữu chính xác 10 phòng
        for r_index in range(1, 11):
            cur_room_id = room_id
            room_id += 1

            # 85% phòng thuộc tòa nhà, 15% phòng độc lập (building_id = NULL)
            is_in_building = (r_index <= 8) and len(blds) > 0
            building_id_val = random.choice(blds) if is_in_building else "NULL"

            floor = (r_index % 6) + 1
            room_num = f"{floor}0{(r_index % 3) + 1}"
            room_name = f"Phòng {room_num} - {random.choice(room_adjectives)}"

            loc = random.choice(locations)
            street = random.choice(loc["streets"])
            house_no = f"Số {random.randint(3, 199)} ngõ {random.randint(10, 160)}"
            address_detail = f"{house_no} {street}"
            lat = round(loc["lat"] + random.uniform(-0.007, 0.007), 7)
            lng = round(loc["lng"] + random.uniform(-0.007, 0.007), 7)

            area = round(random.uniform(18.0, 48.0), 1)
            # Giá niêm yết: 2.500.000 đến 6.800.000 (làm tròn trăm nghìn)
            listed_price = random.randint(25, 68) * 100000
            standard_deposit = listed_price  # Cọc 1 tháng tiền nhà
            max_capacity = random.choice([2, 2, 3, 3, 4])
            
            # Trạng thái: 75% AVAILABLE, 20% OCCUPIED, 5% UNDER_MAINTENANCE
            rand_st = random.random()
            if rand_st < 0.75:
                status = "AVAILABLE"
                current_occupancy = 0
            elif rand_st < 0.95:
                status = "OCCUPIED"
                current_occupancy = random.randint(1, max_capacity)
            else:
                status = "UNDER_MAINTENANCE"
                current_occupancy = 0

            furnishing_level = random.choices(["BASIC", "FULL", "EMPTY"], weights=[55, 40, 5])[0]

            # Amenities
            k_amenities = random.randint(4, 9)
            amenities_sample = random.sample(room_amenities_pool, k_amenities)
            amenities_str = ", ".join(amenities_sample)

            desc = f"Phòng trọ {room_name.lower()}, không gian thoáng mát sạch sẽ, an ninh tuyệt đối camera 24/7. Khu vực dân trí cao, thuận tiện đi lại học tập và làm việc. Giờ giấc tự do thoải mái."
            cover_img = random.choice(room_photo_urls)

            b_id_str = f"{building_id_val}" if building_id_val != "NULL" else "NULL"

            room_values.append(
                f"  ({cur_room_id}, {b_id_str}, {lid}, '{room_name}', '{loc['province']}', '{loc['ward']}', "
                f"'{address_detail}', {floor}, {area}, {listed_price}, {standard_deposit}, {max_capacity}, "
                f"{current_occupancy}, '{furnishing_level}', '{amenities_str}', '{desc}', '{status}', "
                f"'{cover_img}', {lat}, {lng}, TRUE, CURRENT_TIMESTAMP - INTERVAL '{random.randint(1, 90)} days', CURRENT_TIMESTAMP)"
            )

            # Room Images (2 ảnh cho mỗi phòng)
            selected_imgs = random.sample(room_photo_urls, 2)
            for d_idx, img_url in enumerate(selected_imgs):
                room_images_values.append(
                    f"  ({img_id_counter}, {cur_room_id}, '{img_url}', {d_idx}, CURRENT_TIMESTAMP)"
                )
                img_id_counter += 1

            # Room Services (gán các dịch vụ của chủ trọ này)
            for sid in landlord_services[lid]:
                room_services_pairs.append(f"  ({cur_room_id}, {sid})")

    lines.append(",\n".join(room_values))
    lines.append("ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;\n")

    # --- 5. SINH BẢNG ẢNH PHÒNG (ROOM_IMAGES) ---
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append(f"-- 5. TẠO ẢNH CHO 1000 PHÒNG TRỌ (ROOM_IMAGES: {len(room_images_values)} ảnh)")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("INSERT INTO room_images (id, room_id, image_url, display_order, created_at)")
    lines.append("VALUES")
    lines.append(",\n".join(room_images_values))
    lines.append("ON CONFLICT (id) DO NOTHING;\n")

    # --- 6. SINH LIÊN KẾT PHÒNG - DỊCH VỤ (ROOM_SERVICES) ---
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append(f"-- 6. LIÊN KẾT DỊCH VỤ CHO 1000 PHÒNG TRỌ (ROOM_SERVICES: {len(room_services_pairs)} liên kết)")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("INSERT INTO room_services (room_id, service_id)")
    lines.append("VALUES")
    lines.append(",\n".join(room_services_pairs))
    lines.append("ON CONFLICT (room_id, service_id) DO NOTHING;\n")

    # --- 7. CẬP NHẬT LẠI DATABASE SEQUENCES ĐỂ KHÔNG BỊ XUNG ĐỘT KHI INSERT MỚI TỪ APP ---
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("-- 7. ĐỒNG BỘ LẠI POSTGRESQL SEQUENCES")
    lines.append("-- -----------------------------------------------------------------------------")
    lines.append("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));")
    lines.append("SELECT setval('buildings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM buildings));")
    lines.append("SELECT setval('services_id_seq', (SELECT COALESCE(MAX(id), 1) FROM services));")
    lines.append("SELECT setval('rooms_id_seq', (SELECT COALESCE(MAX(id), 1) FROM rooms));")
    lines.append("SELECT setval('room_images_id_seq', (SELECT COALESCE(MAX(id), 1) FROM room_images));\n")

    lines.append("COMMIT;\n")

    return "\n".join(lines)

if __name__ == "__main__":
    sql_content = generate_sql()
    output_path = r"E:\DoAnTotNgiep\backend\src\main\resources\db\seed_100_landlords_1000_rooms.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(sql_content)
    
    # Ghi thêm 1 bản ngay thư mục gốc backend cho tiện truy cập
    output_path_root = r"E:\DoAnTotNgiep\backend\seed_100_landlords_1000_rooms.sql"
    with open(output_path_root, "w", encoding="utf-8") as f:
        f.write(sql_content)

    print(f"Generated successfully: {output_path}")
    print(f"File size: {os.path.getsize(output_path):,} bytes")

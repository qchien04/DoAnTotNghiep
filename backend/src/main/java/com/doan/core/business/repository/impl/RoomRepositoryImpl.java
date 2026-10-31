package com.doan.core.business.repository.impl;

import com.doan.core.business.dto.publicdto.CircleZoneDto;
import com.doan.core.business.dto.publicdto.PublicRoomSearchRequest;
import com.doan.core.business.entity.Room;
import com.doan.core.business.repository.RoomRepositoryCustom;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class RoomRepositoryImpl implements RoomRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SuppressWarnings("unchecked")
    public Page<Room> searchPublicRooms(PublicRoomSearchRequest request, Pageable pageable) {
        StringBuilder fromAndWhere = new StringBuilder();
        fromAndWhere.append("FROM rooms r ")
                    .append("LEFT JOIN buildings b ON r.building_id = b.id ")
                    .append("WHERE r.status = 'AVAILABLE' AND r.is_public = true ");

        Map<String, Object> parameters = new HashMap<>();

        // 1. Keyword search (room name, building name, address)
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            fromAndWhere.append("AND (LOWER(r.name) LIKE :keyword ")
                        .append("OR (b.name IS NOT NULL AND LOWER(b.name) LIKE :keyword) ")
                        .append("OR (r.address_detail IS NOT NULL AND LOWER(r.address_detail) LIKE :keyword) ")
                        .append("OR (b.address_detail IS NOT NULL AND LOWER(b.address_detail) LIKE :keyword)) ");
            parameters.put("keyword", "%" + request.getKeyword().trim().toLowerCase() + "%");
        }

        // 2. Province filter
        if (request.getProvinceId() != null) {
            fromAndWhere.append("AND COALESCE(r.province_id, b.province_id) = :provinceId ");
            parameters.put("provinceId", request.getProvinceId());
        }

        // 3. Ward filter
        if (request.getWardId() != null) {
            fromAndWhere.append("AND COALESCE(r.ward_id, b.ward_id) = :wardId ");
            parameters.put("wardId", request.getWardId());
        }

        // 4. Price range
        if (request.getMinPrice() != null) {
            fromAndWhere.append("AND r.listed_price >= :minPrice ");
            parameters.put("minPrice", request.getMinPrice());
        }
        if (request.getMaxPrice() != null) {
            fromAndWhere.append("AND r.listed_price <= :maxPrice ");
            parameters.put("maxPrice", request.getMaxPrice());
        }

        // 5. Area range
        if (request.getMinArea() != null) {
            fromAndWhere.append("AND r.area >= :minArea ");
            parameters.put("minArea", request.getMinArea());
        }
        if (request.getMaxArea() != null) {
            fromAndWhere.append("AND r.area <= :maxArea ");
            parameters.put("maxArea", request.getMaxArea());
        }

        // 6. Amenities filter (Bitmask matching)
        int targetAmenitiesMask = 0;
        if (request.getAmenitiesMask() != null && request.getAmenitiesMask() > 0) {
            targetAmenitiesMask = request.getAmenitiesMask();
        } else if (request.getAmenityIds() != null && !request.getAmenityIds().isEmpty()) {
            for (Long id : request.getAmenityIds()) {
                if (id != null && id >= 1 && id <= 16) {
                    targetAmenitiesMask |= (1 << (id - 1));
                }
            }
        } else if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            targetAmenitiesMask = com.doan.core.common.constant.RoomAmenityConstants.encode(request.getAmenities());
        }

        if (targetAmenitiesMask > 0) {
            fromAndWhere.append("AND (COALESCE(r.amenities_mask, 0) & :amenitiesMask) = :amenitiesMask ");
            parameters.put("amenitiesMask", targetAmenitiesMask);
        }

        // 7. Spatial circular zones filter (Haversine formula OR-chained directly in Database)
        List<CircleZoneDto> validZones = (request.getZones() != null)
                ? request.getZones().stream()
                        .filter(z -> z.getLatitude() != null && z.getLongitude() != null && z.getRadiusInMeters() != null && z.getRadiusInMeters() > 0)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        if (!validZones.isEmpty()) {
            fromAndWhere.append("AND (COALESCE(r.latitude, b.latitude) IS NOT NULL AND COALESCE(r.longitude, b.longitude) IS NOT NULL AND (");
            for (int i = 0; i < validZones.size(); i++) {
                if (i > 0) {
                    fromAndWhere.append(" OR ");
                }
                CircleZoneDto zone = validZones.get(i);
                String latParam = "zLat_" + i;
                String lngParam = "zLng_" + i;
                String radParam = "zRad_" + i;

                fromAndWhere.append("(6371000.0 * 2.0 * ASIN(SQRT(")
                            .append("POWER(SIN(RADIANS(COALESCE(r.latitude, b.latitude) - :").append(latParam).append(") / 2.0), 2.0) + ")
                            .append("COS(RADIANS(:").append(latParam).append(")) * COS(RADIANS(COALESCE(r.latitude, b.latitude))) * ")
                            .append("POWER(SIN(RADIANS(COALESCE(r.longitude, b.longitude) - :").append(lngParam).append(") / 2.0), 2.0)")
                            .append(")) <= :").append(radParam).append(")");

                parameters.put(latParam, zone.getLatitude());
                parameters.put(lngParam, zone.getLongitude());
                parameters.put(radParam, zone.getRadiusInMeters());
            }
            fromAndWhere.append(")) ");
        }

        // Count query
        String countSql = "SELECT COUNT(DISTINCT r.id) " + fromAndWhere;
        Query countQuery = entityManager.createNativeQuery(countSql);
        parameters.forEach(countQuery::setParameter);
        Number totalResult = (Number) countQuery.getSingleResult();
        long total = totalResult != null ? totalResult.longValue() : 0L;

        if (total == 0) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // Sort clause
        String sortColumn = "r.id";
        String sortBy = request.getSortBy();
        if (sortBy != null) {
            if ("listedPrice".equalsIgnoreCase(sortBy) || "price".equalsIgnoreCase(sortBy)) {
                sortColumn = "r.listed_price";
            } else if ("area".equalsIgnoreCase(sortBy)) {
                sortColumn = "r.area";
            } else if ("createdAt".equalsIgnoreCase(sortBy)) {
                sortColumn = "r.created_at";
            } else if ("name".equalsIgnoreCase(sortBy)) {
                sortColumn = "r.name";
            }
        }
        String direction = "DESC";
        if ("asc".equalsIgnoreCase(request.getSortDirection())) {
            direction = "ASC";
        }

        String dataSql = "SELECT DISTINCT r.id, " + sortColumn + " " + fromAndWhere + " ORDER BY " + sortColumn + " " + direction + ", r.id DESC";
        Query dataQuery = entityManager.createNativeQuery(dataSql);
        parameters.forEach(dataQuery::setParameter);
        dataQuery.setFirstResult((int) pageable.getOffset());
        dataQuery.setMaxResults(pageable.getPageSize());

        List<?> rows = dataQuery.getResultList();
        List<Long> orderedIds = new ArrayList<>();
        for (Object row : rows) {
            if (row instanceof Object[]) {
                Object[] arr = (Object[]) row;
                orderedIds.add(((Number) arr[0]).longValue());
            } else if (row instanceof Number) {
                orderedIds.add(((Number) row).longValue());
            }
        }

        if (orderedIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, total);
        }

        // Fetch Room entities with building and amenities by the ordered IDs
        List<Room> rooms = entityManager.createQuery(
                "SELECT DISTINCT r FROM Room r " +
                "LEFT JOIN FETCH r.building b " +
                "LEFT JOIN FETCH r.amenities a " +
                "WHERE r.id IN (:ids)", Room.class)
                .setParameter("ids", orderedIds)
                .getResultList();

        // Preserve DB sorting order
        Map<Long, Room> roomMap = rooms.stream().collect(Collectors.toMap(Room::getId, r -> r));
        List<Room> sortedRooms = orderedIds.stream()
                .map(roomMap::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return new PageImpl<>(sortedRooms, pageable, total);
    }
}

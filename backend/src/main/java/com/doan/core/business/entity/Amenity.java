package com.doan.core.business.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity Danh mục Tiện ích chuẩn của hệ thống (Admin quản lý)
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "amenities")
public class Amenity extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}

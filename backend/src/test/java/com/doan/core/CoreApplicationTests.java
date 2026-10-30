package com.doan.core;

import com.doan.core.business.dto.tenant.TenantRoomResponse;
import com.doan.core.business.enums.TenantLinkStatus;
import com.doan.core.business.repository.RoommatePostRepository;
import com.doan.core.business.repository.TenantRepository;
import com.doan.core.business.service.TenantRoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CoreApplicationTests {

    @Autowired
    private RoommatePostRepository roommatePostRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private TenantRoomService tenantRoomService;

    @Test
    void contextLoads() {
    }

    @Test
    void testSearchRoommatePostsWithNullParams() {
        assertDoesNotThrow(() -> {
            var result = roommatePostRepository.searchPosts(null, null, null, null, null, PageRequest.of(0, 10));
            assertNotNull(result);
        });
    }

    @Test
    void testSearchRoommatePostsWithDistrict() {
        assertDoesNotThrow(() -> {
            var result = roommatePostRepository.searchPosts("phòng", "Cầu Giấy", null, null, null, PageRequest.of(0, 10));
            assertNotNull(result);
        });
    }

    @Test
    void testGetMyRoomDetailsForUserWithMultipleTenancyRecords() {
        assertDoesNotThrow(() -> {
            TenantRoomResponse response = tenantRoomService.getMyRoomDetails(3L);
            assertNotNull(response);
            assertTrue(response.isHasLinkedRoom(), "User 3 should have an active linked room");
            assertNotNull(response.getRoom());
        });
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Test
    void testFindActiveLinkedTenantsForUser3() {
        var tenants = tenantRepository.findActiveLinkedTenants(3L, TenantLinkStatus.LINKED);
        assertNotNull(tenants);
        assertFalse(tenants.isEmpty(), "User 3 should have active staying tenant");
    }

    @Test
    void testMigrateExpiringSoonContracts() {
        assertDoesNotThrow(() -> {
            jdbcTemplate.execute("UPDATE contracts SET status = 'ACTIVE' WHERE status = 'EXPIRING_SOON'");
        });
    }
}


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/shared/layouts/MainLayout';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { LandlordLayout } from '@/shared/layouts/LandlordLayout';
import { AdminLayout } from '@/shared/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Home & Showcase & Auth
import { HomePage } from '@/features/home/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { UserListPage } from '@/features/user/pages/UserListPage';
import { ComponentShowcase } from '@/features/showcase/pages/ComponentShowcase';

// Landlord Pages (UC 01 - 29)
import { LandlordDashboardPage } from '@/features/landlord/pages/LandlordDashboardPage';
import { BuildingListPage } from '@/features/landlord/pages/BuildingListPage';
import { RoomListPage } from '@/features/landlord/pages/RoomListPage';
import { ServiceConfigPage } from '@/features/landlord/pages/ServiceConfigPage';
import { TenantListPage } from '@/features/landlord/pages/TenantListPage';
import { ContractListPage } from '@/features/landlord/pages/ContractListPage';
import { BillListPage } from '@/features/landlord/pages/BillListPage';
import { ComplaintListPage } from '@/features/landlord/pages/ComplaintListPage';

// Tenant Pages (UC 30 - 46)
import { RoommateSearchPage } from '@/features/tenant/pages/RoommateSearchPage';
import { CreateRoommatePostPage } from '@/features/tenant/pages/CreateRoommatePostPage';
import { MyRoommatePostsPage } from '@/features/tenant/pages/MyRoommatePostsPage';
import { RoommatePostDetailPage } from '@/features/tenant/pages/RoommatePostDetailPage';
import { MyRoomPage } from '@/features/tenant/pages/MyRoomPage';
import { MyComplaintsPage } from '@/features/tenant/pages/MyComplaintsPage';

// Admin Pages (UC 47 - 57)
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { AdminMasterDataPage } from '@/features/admin/pages/AdminMasterDataPage';
import { AdminReportsPage } from '@/features/admin/pages/AdminReportsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public / Main Tenant Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/components" element={<ComponentShowcase />} />

        {/* Roommate Search & Grouping (UC 30 - 40) */}
        <Route path="/roommates" element={<RoommateSearchPage />} />
        <Route path="/roommates/create" element={<CreateRoommatePostPage />} />
        <Route path="/roommates/my-posts" element={<MyRoommatePostsPage />} />
        <Route path="/roommates/:id" element={<RoommatePostDetailPage />} />

        {/* Tenant My Room & Complaints (UC 41 - 46) */}
        <Route path="/tenant/my-room" element={<MyRoomPage />} />
        <Route path="/tenant/complaints" element={<MyComplaintsPage />} />

        {/* Protected Feature Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/users" element={<UserListPage />} />
        </Route>
      </Route>

      {/* 2. Landlord Management Layout (UC 01 - 29) */}
      <Route path="/landlord" element={<LandlordLayout />}>
        <Route index element={<LandlordDashboardPage />} />
        <Route path="buildings" element={<BuildingListPage />} />
        <Route path="rooms" element={<RoomListPage />} />
        <Route path="services" element={<ServiceConfigPage />} />
        <Route path="tenants" element={<TenantListPage />} />
        <Route path="contracts" element={<ContractListPage />} />
        <Route path="bills" element={<BillListPage />} />
        <Route path="complaints" element={<ComplaintListPage />} />
      </Route>

      {/* 3. Admin Portal Layout (UC 47 - 57) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="master-data" element={<AdminMasterDataPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* 4. Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

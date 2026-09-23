/**
 * Quản lý tập trung toàn bộ TanStack Query Keys cho hệ thống
 */

export const landlordKeys = {
  all: ['landlord'] as const,
  buildings: () => [...landlordKeys.all, 'buildings'] as const,
  buildingList: (params?: any) => [...landlordKeys.buildings(), 'list', params] as const,
  buildingDetail: (id: string) => [...landlordKeys.buildings(), 'detail', id] as const,

  rooms: () => [...landlordKeys.all, 'rooms'] as const,
  roomList: (params?: any) => [...landlordKeys.rooms(), 'list', params] as const,
  roomDetail: (id: string) => [...landlordKeys.rooms(), 'detail', id] as const,

  services: () => [...landlordKeys.all, 'services'] as const,

  tenants: () => [...landlordKeys.all, 'tenants'] as const,
  tenantList: (params?: any) => [...landlordKeys.tenants(), 'list', params] as const,

  contracts: () => [...landlordKeys.all, 'contracts'] as const,
  contractList: (params?: any) => [...landlordKeys.contracts(), 'list', params] as const,

  bills: () => [...landlordKeys.all, 'bills'] as const,
  billList: (params?: any) => [...landlordKeys.bills(), 'list', params] as const,

  complaints: () => [...landlordKeys.all, 'complaints'] as const,
  complaintList: (params?: any) => [...landlordKeys.complaints(), 'list', params] as const,
  complaintDetail: (id: string) => [...landlordKeys.complaints(), 'detail', id] as const,

  dashboard: () => [...landlordKeys.all, 'dashboard'] as const,
};

export const tenantKeys = {
  all: ['tenant'] as const,
  posts: () => [...tenantKeys.all, 'posts'] as const,
  postSearch: (params?: any) => [...tenantKeys.posts(), 'search', params] as const,
  myPosts: () => [...tenantKeys.posts(), 'my-posts'] as const,
  postDetail: (id: string) => [...tenantKeys.posts(), 'detail', id] as const,

  applications: () => [...tenantKeys.all, 'applications'] as const,
  postApplications: (postId: string) => [...tenantKeys.applications(), 'post', postId] as const,

  myRoom: () => [...tenantKeys.all, 'my-room'] as const,
  myBills: () => [...tenantKeys.all, 'my-bills'] as const,
  vietQRPayment: (billId: string) => [...tenantKeys.myBills(), 'qr', billId] as const,

  myComplaints: () => [...tenantKeys.all, 'complaints'] as const,
  complaintDetail: (id: string) => [...tenantKeys.myComplaints(), 'detail', id] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userList: (params?: any) => [...adminKeys.users(), 'list', params] as const,
  userDetail: (id: string | number) => [...adminKeys.users(), 'detail', id] as const,

  masterData: () => [...adminKeys.all, 'master-data'] as const,
  reports: () => [...adminKeys.all, 'reports'] as const,
  reportDetail: (id: string) => [...adminKeys.reports(), 'detail', id] as const,
  analytics: () => [...adminKeys.all, 'analytics'] as const,
};

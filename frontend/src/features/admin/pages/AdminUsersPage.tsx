import React, { useState } from 'react';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useToggleLockUser,
} from '@/shared/hooks';
import {
  Button,
  Table,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Badge,
  Alert,
} from '@/shared/components';
import {
  Plus,
  Search,
  Lock,
  Unlock,
  Edit2,
  Shield,
  Building,
  User,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { message, Tooltip } from 'antd';
import { AdminUserItem, CreateAdminUserDto, UpdateAdminUserDto, ToggleLockUserDto, UserAccountStatus } from '@/shared/types/admin';
import { Role } from '@/shared/types/auth';

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserAccountStatus | 'ALL'>('ALL');

  const { pageInfo, isLoading } = useAdminUsers({
    page,
    size,
    keyword,
    role: roleFilter,
    status: statusFilter,
  });
  const { createUser, isCreating } = useCreateAdminUser();
  const { updateUser, isUpdating } = useUpdateAdminUser();
  const { toggleLockUser, isTogglingLock } = useToggleLockUser();

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<AdminUserItem | null>(null);

  const handleOpenDetail = (user: AdminUserItem) => {
    setViewingUser(user);
    setDetailModalOpen(true);
  };

  // Create Modal State (UC 48)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Edit Modal State (UC 49)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [editForm] = Form.useForm();

  // Lock Modal State (UC 50)
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockingUser, setLockingUser] = useState<AdminUserItem | null>(null);
  const [lockForm] = Form.useForm();

  const handleOpenCreate = () => {

    createForm.resetFields();
    createForm.setFieldsValue({
      role: 'ROLE_USER',
      enabled: true,
    });
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      await createUser(values as CreateAdminUserDto);
      message.success('Thêm mới người dùng vào hệ thống thành công!');
      setCreateModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleOpenEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;
    try {
      const values = await editForm.validateFields();
      await updateUser({ id: editingUser.id, dto: values as UpdateAdminUserDto });
      message.success('Cập nhật phân quyền & thông tin tài khoản thành công!');
      setEditModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleOpenToggleLock = (user: AdminUserItem) => {
    setLockingUser(user);
    lockForm.setFieldsValue({
      reason: user.status === 'ACTIVE' ? 'Vi phạm quy định cộng đồng hoặc có dấu hiệu gian lận cọc.' : '',
      duration: 'PERMANENT',
    });
    setLockModalOpen(true);
  };

  const handleLockSubmit = async () => {
    if (!lockingUser) return;
    try {
      const values = await lockForm.validateFields();
      const willLock = lockingUser.status === 'ACTIVE';
      await toggleLockUser({
        id: lockingUser.id,
        dto: {
          locked: willLock,
          reason: values.reason,
          duration: values.duration,
        } as ToggleLockUserDto,
      });
      message.success(
        willLock ? 'Đã khóa tài khoản người dùng thành công!' : 'Đã mở khóa tài khoản thành công!'
      );
      setLockModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setPage(0);
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span className="text-[14px] text-stay-text-secondary font-medium">
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Tài khoản',
      key: 'user',
      width: 200,
      ellipsis: { showTitle: true },
      render: (_: any, r: AdminUserItem) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-stay-bg-app border border-stay-border flex items-center justify-center font-bold text-xs text-stay-primary flex-shrink-0">
            {r.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-stay-text text-[14px] truncate">{r.fullName}</p>
            <p className="text-[12px] text-slate-400 truncate">@{r.username}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Email & SĐT',
      key: 'contact',
      width: 200,
      ellipsis: { showTitle: true },
      render: (_: any, r: AdminUserItem) => (
        <div className="text-xs space-y-0.5 min-w-0">
          <p className="text-stay-text font-medium truncate">{r.email}</p>
          <p className="text-slate-400 truncate">{r.phone || 'Chưa cập nhật'}</p>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      ellipsis: { showTitle: true },
      render: (role: Role) => {
        if (role === 'ROLE_ADMIN') {
          return (
            <Badge variant="primary" icon={<Shield className="w-3.5 h-3.5" />}>
              Quản trị viên
            </Badge>
          );
        }
        if (role === 'ROLE_USER') {
          return (
            <Badge variant="secondary" icon={<Building className="w-3.5 h-3.5" />}>
              Người dùng sàn
            </Badge>
          );
        }
        return (
          <Badge variant="outline" icon={<User className="w-3.5 h-3.5" />}>
            {role}
          </Badge>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      ellipsis: { showTitle: true },
      render: (st: UserAccountStatus) => {
        if (st === 'ACTIVE') {
          return <Tag status="available">Đang hoạt động</Tag>;
        }
        return <Tag status="rented">Đã bị khóa</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: AdminUserItem) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết người dùng">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-view"
              onClick={() => handleOpenDetail(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa phân quyền">
            <button
              type="button"
              className="stay-action-btn stay-action-btn-edit"
              onClick={() => handleOpenEdit(r)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip title={r.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
            <button
              type="button"
              className={r.status === 'ACTIVE' ? 'stay-action-btn stay-action-btn-delete' : 'stay-action-btn'}
              style={r.status !== 'ACTIVE' ? { color: '#059669' } : undefined}
              onClick={() => handleOpenToggleLock(r)}
            >
              {r.status === 'ACTIVE' ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Filter Bar */}

      <div className="p-4 rounded-xl bg-stay-card-bg border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center gap-3">
        <Input
          placeholder="Tìm theo tên, email, username hoặc số điện thoại..."
          prefix={<Search className="w-4 h-4 text-[#8C8C8C]" />}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0);
          }}
          allowClear
          className="w-full sm:w-[340px] h-[40px] rounded-[8px]"
        />

        <Select
          value={roleFilter}
          onChange={(val) => {
            setRoleFilter(val);
            setPage(0);
          }}
          className="w-full sm:w-[200px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Tất cả vai trò', value: 'ALL' },
            { label: 'Quản trị viên (Admin)', value: 'ROLE_ADMIN' },
            { label: 'Người dùng sàn (User)', value: 'ROLE_USER' },
            { label: 'Sinh viên (Student)', value: 'ROLE_STUDENT' },
            { label: 'Giảng viên (Teacher)', value: 'ROLE_TEACHER' },
          ]}
        />

        <Select
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(0);
          }}
          className="w-full sm:w-[190px] h-[40px] rounded-[8px]"
          options={[
            { label: 'Tất cả trạng thái', value: 'ALL' },
            { label: 'Đang hoạt động', value: 'ACTIVE' },
            { label: 'Đã bị khóa', value: 'LOCKED' },
          ]}
        />

        <Button
          icon={<RotateCcw className="w-4 h-4 text-stay-text-secondary" />}
          onClick={handleReset}
          className="h-[40px] rounded-[8px] border-[#D7D7DB] dark:border-stay-border text-stay-text hover:text-stay-primary font-medium"
        >
          Đặt lại
        </Button>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="ml-auto bg-stay-primary hover:bg-stay-primary-hover h-[40px] px-4 font-medium"
        >
          Thêm Người Dùng
        </Button>
      </div>

      {/* User Table */}
      <Table
        dataSource={pageInfo?.items ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: (pageInfo?.page ?? 0) + 1,
          pageSize: pageInfo?.size ?? 10,
          total: pageInfo?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} người dùng`,
          onChange: (p, s) => {
            setPage(p - 1);
            setSize(s);
          },
        }}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
      />

      {/* Detail User Modal */}
      <Modal
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={560}
        title={
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-stay-primary" />
            <span className="text-base font-semibold text-stay-text">Thông tin chi tiết người dùng</span>
            <span className="ml-2 text-xs font-mono font-normal text-stay-text-muted px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border">
              #{viewingUser?.id}
            </span>
          </div>
        }
        centered
        destroyOnClose
      >
        {viewingUser && (
          <div className="py-3 space-y-4">
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-stay-primary-subtle text-stay-primary flex items-center justify-center font-bold text-lg">
                  {viewingUser.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stay-text">{viewingUser.fullName}</h3>
                  <p className="text-xs text-stay-text-muted">@{viewingUser.username}</p>
                </div>
              </div>
              <div>
                {viewingUser.status === 'ACTIVE' ? (
                  <Tag status="available">Đang hoạt động</Tag>
                ) : (
                  <Tag status="rented">Đã bị khóa</Tag>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border">
                <span className="text-xs text-stay-text-muted block mb-1">Email liên hệ</span>
                <span className="text-sm font-semibold text-stay-text truncate block">{viewingUser.email || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border">
                <span className="text-xs text-stay-text-muted block mb-1">Số điện thoại</span>
                <span className="text-sm font-semibold text-stay-text truncate block">{viewingUser.phone || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border col-span-2">
                <span className="text-xs text-stay-text-muted block mb-1">Vai trò hệ thống</span>
                <span className="text-sm font-semibold text-stay-text">
                  {viewingUser.role === 'ROLE_ADMIN' ? 'Quản trị viên hệ thống' : 'Người dùng sàn (Chủ trọ / Khách thuê)'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal (UC 48) */}

      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateSubmit}
        confirmLoading={isCreating}
        okText="Tạo tài khoản"
        cancelText="Hủy"
        width={680}
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Plus className="w-5 h-5 text-stay-primary" />
            <span>Thêm mới người dùng</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Form form={createForm} layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                <Input placeholder="vd: nguyenvanan" />
              </Form.Item>

              <Form.Item name="password" label="Mật khẩu ban đầu" rules={[{ required: true }]}>
                <Input.Password placeholder="Tối thiểu 6 ký tự" />
              </Form.Item>
            </div>

            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input placeholder="vd: Nguyễn Văn An" />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="an.nguyen@example.com" />
              </Form.Item>

              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input placeholder="0987654321" />
              </Form.Item>
            </div>

            <Form.Item name="role" label="Phân quyền vai trò" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Người dùng', value: 'ROLE_USER' },
                  { label: 'Quản trị viên', value: 'ROLE_ADMIN' },
                  { label: 'Sinh viên', value: 'ROLE_STUDENT' },
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Edit Role / User Modal (UC 49) */}
      <Modal
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
        confirmLoading={isUpdating}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={680}
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Edit2 className="w-5 h-5 text-stay-primary" />
            <span>Cập nhật vai trò & phân quyền</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Form form={editForm} layout="vertical">
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>

              <Form.Item name="phone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </div>

            <Form.Item name="role" label="Vai trò người dùng" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Người dùng', value: 'ROLE_USER' },
                  { label: 'Quản trị viên', value: 'ROLE_ADMIN' },
                  { label: 'Sinh viên', value: 'ROLE_STUDENT' },
                ]}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Toggle Lock Modal (UC 50) */}
      <Modal
        open={lockModalOpen}
        onCancel={() => setLockModalOpen(false)}
        onOk={handleLockSubmit}
        confirmLoading={isTogglingLock}
        okText={lockingUser?.status === 'ACTIVE' ? 'Xác nhận khóa' : 'Mở khóa ngay'}
        cancelText="Hủy"
        width={600}
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            {lockingUser?.status === 'ACTIVE' ? (
              <>
                <Lock className="w-5 h-5 text-red-500" />
                <span>Khóa tài khoản người dùng</span>
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 text-emerald-500" />
                <span>Mở khóa tài khoản</span>
              </>
            )}
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {lockingUser?.status === 'ACTIVE' ? (
            <>
              <Alert
                type="warning"
                message={`Tài khoản ${lockingUser.fullName} (@${lockingUser.username}) sẽ bị tước quyền đăng nhập và các bài đăng hiện có sẽ tạm thời bị ẩn.`}
              />

              <Form form={lockForm} layout="vertical">
                <Form.Item
                  name="reason"
                  label="Lý do kỷ luật / khóa tài khoản"
                  rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
                >
                  <Input.TextArea rows={3} placeholder="Ghi rõ lý do vi phạm điều khoản sàn..." />
                </Form.Item>

                <Form.Item name="duration" label="Thời hạn khóa" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { label: 'Vĩnh viễn (Permanent)', value: 'PERMANENT' },
                      { label: 'Tạm thời 30 ngày (Temporary)', value: 'TEMPORARY' },
                    ]}
                  />
                </Form.Item>
              </Form>
            </>
          ) : (
            <p className="text-xs text-stay-text-secondary">
              Bạn có chắc chắn muốn mở khóa cho tài khoản <strong>{lockingUser?.fullName}</strong>? Người dùng sẽ có thể đăng nhập lại bình thường.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

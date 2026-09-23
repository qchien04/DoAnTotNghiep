import React, { useState } from 'react';
import { useAdminUsers } from '@/shared/hooks';
import {
  Card,
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
} from 'lucide-react';
import { message } from 'antd';
import { AdminUserItem, CreateAdminUserDto, UpdateAdminUserDto, ToggleLockUserDto, UserAccountStatus } from '@/shared/types/admin';
import { Role } from '@/shared/types/auth';

export const AdminUsersPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserAccountStatus | 'ALL'>('ALL');

  const {
    users,
    isLoading,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    toggleLockUser,
    isTogglingLock,
  } = useAdminUsers({
    keyword,
    role: roleFilter,
    status: statusFilter,
  });

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

  const columns = [
    {
      title: 'Tài khoản',
      key: 'user',
      render: (_: any, r: AdminUserItem) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-stay-bg-app border border-stay-border flex items-center justify-center font-bold text-xs text-stay-primary">
            {r.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-stay-text text-xs sm:text-sm">{r.fullName}</p>
            <p className="text-[11px] text-slate-400">@{r.username}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Email & SĐT',
      key: 'contact',
      render: (_: any, r: AdminUserItem) => (
        <div className="text-xs space-y-0.5">
          <p className="text-stay-text font-medium">{r.email}</p>
          <p className="text-slate-400">{r.phone || 'Chưa cập nhật'}</p>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
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
      render: (_: any, r: AdminUserItem) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-3 h-3" />}
            onClick={() => handleOpenEdit(r)}
          >
            Sửa quyền
          </Button>
          <Button
            variant={r.status === 'ACTIVE' ? 'ghost' : 'outline'}
            size="sm"
            icon={r.status === 'ACTIVE' ? <Lock className="w-3 h-3 text-red-500" /> : <Unlock className="w-3 h-3 text-emerald-500" />}
            onClick={() => handleOpenToggleLock(r)}
            className={r.status === 'ACTIVE' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600'}
          >
            {r.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">Quản Trị Hệ Thống</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
            Quản Lý Người Dùng & Phân Quyền
          </h1>
          <p className="text-sm text-stay-text-secondary mt-0.5">
            Quản trị danh sách tài khoản toàn sàn, cấp quyền Chủ trọ/Admin và xử lý kỷ luật khóa tài khoản.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="shadow-md shadow-stay-primary/20 font-semibold"
        >
          Thêm Người Dùng
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <Input
          placeholder="Tìm theo tên, email, username hoặc số điện thoại..."
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          className="w-full sm:max-w-md h-10"
        />

        <Select
          value={roleFilter}
          onChange={(val) => setRoleFilter(val)}
          className="w-full sm:w-48 h-10"
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
          onChange={(val) => setStatusFilter(val)}
          className="w-full sm:w-48 h-10"
          options={[
            { label: 'Tất cả trạng thái', value: 'ALL' },
            { label: 'Đang hoạt động', value: 'ACTIVE' },
            { label: 'Đã bị khóa', value: 'LOCKED' },
          ]}
        />
      </div>

      {/* User Table */}
      <Card>
        <div className="p-6">
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
            className="overflow-x-auto"
          />
        </div>
      </Card>

      {/* Create User Modal (UC 48) */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateSubmit}
        confirmLoading={isCreating}
        okText="Tạo tài khoản"
        cancelText="Hủy"
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

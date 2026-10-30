import React, { useState } from 'react';
import {
  useAdminAmenities,
  useCreateAmenity,
  useUpdateAmenity,
  useDeleteAmenity,
} from '@/shared/hooks';
import {
  Button,
  Table,
  Input,
  Modal,
  Form,
  Popconfirm,
  Tag,
} from '@/shared/components';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Amenity, CreateAmenityDto } from '@/shared/types/amenity';

export const AdminAmenitiesPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { pageInfo, isLoading, refetch } = useAdminAmenities({
    page,
    size,
    keyword: keyword || undefined,
    sortBy: 'name',
    sortDirection: 'asc',
  });

  const { createAmenity, isCreating } = useCreateAmenity();
  const { updateAmenity, isUpdating } = useUpdateAmenity();
  const { deleteAmenity } = useDeleteAmenity();

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [form] = Form.useForm();

  const handleSearch = () => {
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const handleReset = () => {
    setSearchInput('');
    setKeyword('');
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditingAmenity(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    form.setFieldsValue({
      name: amenity.name,
      description: amenity.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateAmenityDto = {
        name: values.name.trim(),
        description: values.description ? values.description.trim() : undefined,
      };

      if (editingAmenity) {
        await updateAmenity({ id: editingAmenity.id, dto });
      } else {
        await createAmenity(dto);
      }
      setModalOpen(false);
      form.resetFields();
      setEditingAmenity(null);
    } catch {
      // Form validation failed
    }
  };

  const handleDelete = async (id: number) => {
    await deleteAmenity(id);
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => (
        <span className="font-mono text-xs text-stay-text-muted">#{id}</span>
      ),
    },
    {
      title: 'Tên tiện ích',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stay-primary-subtle text-stay-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-stay-text text-sm">{name}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả chi tiết',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <span className="text-stay-text-secondary text-sm">
          {desc || <span className="text-stay-text-muted italic">Không có mô tả</span>}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: () => (
        <Tag color="green" className="rounded-full px-2.5 py-0.5 border-none">
          Khả dụng
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 140,
      align: 'right' as const,
      render: (_: any, record: Amenity) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="text"
            size="small"
            className="text-stay-text-secondary hover:text-stay-primary hover:bg-stay-primary-subtle"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Xác nhận xóa tiện ích"
            description={`Bạn có chắc muốn xóa tiện ích "${record.name}" khỏi hệ thống?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              className="text-stay-text-secondary hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              icon={<Trash2 className="w-4 h-4" />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const dataSource = pageInfo?.items ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stay-text tracking-tight">
              Quản lý Tiện ích Phòng Trọ
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
              Master Data
            </span>
          </div>
          <p className="text-stay-text-secondary text-sm mt-1">
            Danh mục tiện nghi chuẩn hóa áp dụng khi chủ trọ tạo phòng và người thuê tìm kiếm trên sàn Roomi
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => refetch()}
            className="border-stay-border text-stay-text hover:bg-stay-bg-app"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
            className="bg-stay-primary hover:bg-stay-primary-hover text-white shadow-sm"
          >
            Thêm tiện ích mới
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH CARD */}
      <div className="bg-stay-card-bg border border-stay-border rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm tiện ích theo tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<Search className="w-4 h-4 text-stay-text-muted" />}
              allowClear
              className="w-full"
            />
            <Button
              type="primary"
              onClick={handleSearch}
              className="bg-stay-primary text-white shrink-0"
            >
              Tìm kiếm
            </Button>
            {keyword && (
              <Button onClick={handleReset} className="shrink-0 text-stay-text-secondary">
                Xóa lọc
              </Button>
            )}
          </div>

          <div className="text-xs text-stay-text-muted shrink-0">
            Hiển thị <span className="font-semibold text-stay-text">{dataSource.length}</span> / {pageInfo?.totalElements ?? 0} tiện ích
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-xs">
        <Table<Amenity>
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          pagination={{
            current: (pageInfo?.page ?? 0) + 1,
            pageSize: pageInfo?.size ?? 10,
            total: pageInfo?.totalElements ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng ${total} tiện ích`,
            onChange: (newPage, newPageSize) => {
              setPage(newPage - 1);
              setSize(newPageSize);
            },
          }}
          className="border-none"
        />
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold text-lg">
            <div className="w-7 h-7 rounded-lg bg-stay-primary-subtle text-stay-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>{editingAmenity ? 'Cập nhật tiện ích' : 'Thêm tiện ích phòng trọ mới'}</span>
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={isCreating || isUpdating}
        okText={editingAmenity ? 'Lưu thay đổi' : 'Thêm tiện ích'}
        cancelText="Hủy"
        destroyOnClose
        centered
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-4 space-y-4">
          <Form.Item
            name="name"
            label={<span className="font-semibold text-stay-text text-sm">Tên tiện ích</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên tiện ích' },
              { min: 2, message: 'Tên tiện ích phải có ít nhất 2 ký tự' },
              { max: 100, message: 'Tên tiện ích không vượt quá 100 ký tự' },
            ]}
          >
            <Input
              placeholder="Ví dụ: Điều hòa, Nóng lạnh, Tủ lạnh, Ban công..."
              maxLength={100}
              className="h-10"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-semibold text-stay-text text-sm">Mô tả chi tiết (Tùy chọn)</span>}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả tiêu chuẩn tiện ích hoặc lưu ý sử dụng..."
              maxLength={255}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

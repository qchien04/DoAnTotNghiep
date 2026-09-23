import React, { useState } from 'react';
import { useMasterData } from '@/shared/hooks';
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
  message,
  Popconfirm,
} from '@/shared/components';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Percent,
} from 'lucide-react';
import { LifestyleCriterion, CreateLifestyleCriterionDto, UpdateLifestyleCriterionDto } from '@/shared/types/admin';

export const AdminMasterDataPage: React.FC = () => {
  const {
    criteria,
    isLoading,
    createCriterion,
    isCreating,
    updateCriterion,
    isUpdating,
    deleteCriterion,
  } = useMasterData();

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<LifestyleCriterion | null>(null);
  const [form] = Form.useForm();

  const totalWeight = criteria.reduce((sum, c) => sum + (c.status === 'ACTIVE' ? c.algorithmWeight : 0), 0);

  const handleOpenCreate = () => {
    setEditingCriterion(null);
    form.resetFields();
    form.setFieldsValue({
      category: 'HABIT',
      algorithmWeight: 20,
      optionsText: 'Có, Không, Thỉnh thoảng',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (crit: LifestyleCriterion) => {
    setEditingCriterion(crit);
    form.setFieldsValue({
      code: crit.code,
      name: crit.name,
      category: crit.category,
      algorithmWeight: crit.algorithmWeight,
      optionsText: crit.options.join(', '),
      status: crit.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const options = values.optionsText
        ? values.optionsText.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['Có', 'Không'];

      if (editingCriterion) {
        await updateCriterion({
          id: editingCriterion.id,
          dto: {
            name: values.name,
            category: values.category,
            algorithmWeight: Number(values.algorithmWeight),
            options,
            status: values.status,
          } as UpdateLifestyleCriterionDto,
        });
        message.success('Cập nhật tiêu chí lối sống thành công!');
      } else {
        await createCriterion({
          code: values.code,
          name: values.name,
          category: values.category,
          algorithmWeight: Number(values.algorithmWeight),
          options,
        } as CreateLifestyleCriterionDto);
        message.success('Thêm tiêu chí lối sống mới thành công!');
      }
      setModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCriterion(id);
      message.success('Đã xóa tiêu chí khỏi thuật toán matching!');
    } catch (err: any) {
      message.error(err.message || 'Lỗi xóa tiêu chí');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (val: string) => <span className="font-bold text-stay-primary">{val}</span>,
    },
    {
      title: 'Tên tiêu chí',
      dataIndex: 'name',
      key: 'name',
      render: (val: string, r: LifestyleCriterion) => (
        <div>
          <p className="font-semibold text-stay-text">{val}</p>
          <p className="text-[11px] text-slate-400">Các lựa chọn: {r.options?.join(', ')}</p>
        </div>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => {
        const map: Record<string, string> = {
          HABIT: 'Thói quen sinh hoạt',
          TIME: 'Giờ giấc sinh học',
          SHARED_LIVING: 'Ý thức chung',
          PRIVACY: 'Không gian riêng',
        };
        return <Tag status="available">{map[cat] || cat}</Tag>;
      },
    },
    {
      title: 'Trọng số thuật toán',
      dataIndex: 'algorithmWeight',
      key: 'algorithmWeight',
      render: (val: number) => (
        <div className="flex items-center gap-1.5 font-bold text-stay-primary">
          <Percent className="w-3.5 h-3.5" />
          <span>{val}%</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => (
        st === 'ACTIVE' ? <Tag status="available">Đang áp dụng</Tag> : <Tag status="rented">Tạm dừng</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: LifestyleCriterion) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-3 h-3" />}
            onClick={() => handleOpenEdit(r)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa tiêu chí này?"
            description="Thuật toán matching sẽ loại bỏ trọng số của tiêu chí này."
            onConfirm={() => handleDelete(r.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-3 h-3 text-red-500" />}
              className="text-red-600 hover:bg-red-50"
            >
              Xóa
            </Button>
          </Popconfirm>
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
            <Badge variant="primary">Thuật toán ghép đôi</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
            Quản Trị Master Data & Tiêu Chí Lối Sống
          </h1>
          <p className="text-sm text-stay-text-secondary mt-0.5">
            Cấu hình trọng số thuật toán ghép đôi và danh mục tiện ích toàn sàn.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="shadow-md shadow-stay-primary/20 font-semibold"
        >
          Thêm Tiêu Chí Mới
        </Button>
      </div>

      {/* Algorithm Weight Summary Alert */}
      <Alert
        type={totalWeight === 100 ? 'success' : 'warning'}
        message={
          <div className="flex items-center justify-between">
            <span>
              Tổng trọng số các tiêu chí đang áp dụng: <strong>{totalWeight}%</strong> {totalWeight === 100 ? '(Đã chuẩn hóa 100%)' : '(Lưu ý: Nên cân bằng tổng trọng số về 100%)'}
            </span>
            <Sparkles className="w-4 h-4 text-stay-primary" />
          </div>
        }
      />

      {/* Criteria Table */}
      <Card>
        <div className="p-6">
          <Table
            dataSource={criteria}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            className="overflow-x-auto"
          />
        </div>
      </Card>

      {/* Create / Edit Modal (UC 52 & UC 53) */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        okText={editingCriterion ? 'Lưu cập nhật' : 'Tạo tiêu chí'}
        cancelText="Hủy"
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Sliders className="w-5 h-5 text-stay-primary" />
            <span>{editingCriterion ? 'Cập Nhật Tiêu Chí Lối Sống (UC 53)' : 'Thêm Tiêu Chí Lối Sống Mới (UC 52)'}</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="code"
                label="Mã tiêu chí"
                rules={[{ required: true, message: 'Vui lòng nhập mã!' }]}
                initialValue="TC06"
              >
                <Input placeholder="TC01, TC02..." disabled={Boolean(editingCriterion)} />
              </Form.Item>

              <Form.Item
                name="category"
                label="Nhóm phân loại"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { label: 'Thói quen sinh hoạt', value: 'HABIT' },
                    { label: 'Giờ giấc sinh học', value: 'TIME' },
                    { label: 'Ý thức sống chung', value: 'SHARED_LIVING' },
                    { label: 'Không gian riêng tư', value: 'PRIVACY' },
                  ]}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="name"
              label="Tên tiêu chí hiển thị"
              rules={[{ required: true, message: 'Vui lòng nhập tên tiêu chí!' }]}
            >
              <Input placeholder="Ví dụ: Giờ giấc ngủ, Hút thuốc lá, Nuôi thú cưng..." />
            </Form.Item>

            <Form.Item
              name="algorithmWeight"
              label="Trọng số thuật toán matching (%)"
              rules={[{ required: true, message: 'Vui lòng nhập trọng số!' }]}
            >
              <Input type="number" min={1} max={100} suffix="%" />
            </Form.Item>

            <Form.Item
              name="optionsText"
              label="Các lựa chọn (phân cách bằng dấu phẩy)"
              rules={[{ required: true, message: 'Vui lòng nhập các lựa chọn!' }]}
            >
              <Input placeholder="Ví dụ: Không hút, Có hút ở ban công, Hút trong phòng" />
            </Form.Item>

            {editingCriterion && (
              <Form.Item name="status" label="Trạng thái áp dụng" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Đang áp dụng (ACTIVE)', value: 'ACTIVE' },
                    { label: 'Tạm dừng (DEACTIVATED)', value: 'DEACTIVATED' },
                  ]}
                />
              </Form.Item>
            )}
          </Form>
        </div>
      </Modal>
    </div>
  );
};

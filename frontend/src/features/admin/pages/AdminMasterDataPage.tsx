import React, { useState } from 'react';
import {
  useMasterData,
  useCreateCriterion,
  useUpdateCriterion,
  useDeleteCriterion,
} from '@/shared/hooks';
import {
  Button,
  Table,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Alert,
  Popconfirm,
  StatusBadge,
} from '@/shared/components';
import { Tooltip } from 'antd';
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Percent,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { LifestyleCriterion, CreateLifestyleCriterionDto, UpdateLifestyleCriterionDto } from '@/shared/types/admin';

export const AdminMasterDataPage: React.FC = () => {
  const { criteria, isLoading } = useMasterData();
  const { createCriterion, isCreating } = useCreateCriterion();
  const { updateCriterion, isUpdating } = useUpdateCriterion();
  const { deleteCriterion } = useDeleteCriterion();

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingCriterion, setViewingCriterion] = useState<LifestyleCriterion | null>(null);

  const handleOpenDetail = (crit: LifestyleCriterion) => {
    setViewingCriterion(crit);
    setDetailModalOpen(true);
  };

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
      } else {
        await createCriterion({
          code: values.code,
          name: values.name,
          category: values.category,
          algorithmWeight: Number(values.algorithmWeight),
          options,
        } as CreateLifestyleCriterionDto);
      }
      setModalOpen(false);
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCriterion(id);
    } catch {
      // Handled in mutation hook
    }
  };

  const columns = [
    {
      title: 'Tên tiêu chí',
      dataIndex: 'name',
      key: 'name',
      ellipsis: { showTitle: true },
      render: (val: string, r: LifestyleCriterion) => (
        <div>
          <p className="font-semibold text-stay-text truncate">{val}</p>
          <p className="text-[11px] text-slate-400 truncate">Các lựa chọn: {r.options?.join(', ')}</p>
        </div>
      ),
    },
    {
      title: 'Nhóm',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      ellipsis: { showTitle: true },
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
      width: 160,
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
      width: 140,
      render: (st: string) => (
        <StatusBadge
          status={st === 'ACTIVE' ? 'ACTIVE' : 'STOPPED'}
          label={st === 'ACTIVE' ? 'Đang áp dụng' : 'Tạm dừng'}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, r: LifestyleCriterion) => (
        <div className="flex items-center justify-start gap-1.5">
          <Tooltip title="Xem chi tiết tiêu chí">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => handleOpenDetail(r)}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Chỉnh sửa tiêu chí">
            <button
              type="button"
              className="stay-action-btn"
              onClick={() => handleOpenEdit(r)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip title="Xóa tiêu chí">
            <Popconfirm
              title="Xóa tiêu chí này?"
              description="Thuật toán matching sẽ loại bỏ trọng số của tiêu chí này."
              onConfirm={() => handleDelete(r.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <button
                type="button"
                className="stay-action-btn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
      {/* Top Action Toolbar */}

      <div className="p-4 rounded-xl bg-stay-card-bg border border-[#D7D7DB] dark:border-slate-700 shadow-none flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[280px]">
          <Alert
            type={totalWeight === 100 ? 'success' : 'warning'}
            message={
              <div className="flex items-center justify-between">
                <span>
                  Tổng trọng số các tiêu chí đang áp dụng: <strong>{totalWeight}%</strong> {totalWeight === 100 ? '(Đã chuẩn hóa 100%)' : '(Lưu ý: Cần cân bằng về 100%)'}
                </span>
                <Sparkles className="w-4 h-4 text-stay-primary ml-2 flex-shrink-0" />
              </div>
            }
            className="border-0 m-0 py-1.5"
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="ml-auto bg-stay-primary hover:bg-stay-primary-hover h-[40px] px-4 font-medium"
        >
          Thêm Tiêu Chí Mới
        </Button>
      </div>

      {/* Criteria Table */}
      <Table
        dataSource={criteria}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
      />


      {/* Detail Criterion Modal */}
      <Modal
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={560}
        title={
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-stay-primary" />
            <span className="text-base font-semibold text-stay-text">Chi tiết tiêu chí thuật toán</span>
            <span className="ml-2  font-mono font-normal text-stay-text-muted px-2 py-0.5 rounded bg-stay-bg-app border border-stay-border">
              #{viewingCriterion?.id}
            </span>
          </div>
        }
        centered
        destroyOnClose
      >
        {viewingCriterion && (
          <div className="py-2 space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-stay-border-subtle">
              <div>
                <h3 className="text-base font-bold text-stay-text">{viewingCriterion.name}</h3>
                <span className="font-mono text-stay-primary mt-1 inline-block text-xs">
                  Mã: {viewingCriterion.code}
                </span>
              </div>
              <div>
                {viewingCriterion.status === 'ACTIVE' ? (
                  <Tag status="available">Đang áp dụng</Tag>
                ) : (
                  <Tag status="rented">Tạm dừng</Tag>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-stay-text-muted block mb-1">Nhóm tiêu chí</span>
                <span className="text-sm font-semibold text-stay-text">
                  {viewingCriterion.category === 'HABIT'
                    ? 'Thói quen sinh hoạt'
                    : viewingCriterion.category === 'TIME'
                      ? 'Giờ giấc sinh học'
                      : viewingCriterion.category === 'SHARED_LIVING'
                        ? 'Ý thức chung'
                        : 'Không gian riêng'}
                </span>
              </div>
              <div>
                <span className="text-xs text-stay-text-muted block mb-1">Trọng số thuật toán</span>
                <span className="text-base font-bold text-stay-primary flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {viewingCriterion.algorithmWeight}%
                </span>
              </div>
              <div className="col-span-2 pt-3 border-t border-stay-border-subtle">
                <span className="text-xs text-stay-text-muted block mb-2">Các tùy chọn câu trả lời</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewingCriterion.options?.map((opt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-stay-bg-app border border-stay-border-subtle text-stay-text font-medium text-xs"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>


      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={isCreating || isUpdating}
        okText={editingCriterion ? 'Lưu cập nhật' : 'Tạo tiêu chí'}
        cancelText="Hủy"
        width={720}
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Sliders className="w-5 h-5 text-stay-primary" />
            <span>{editingCriterion ? 'Cập Nhật Tiêu Chí Lối Sống' : 'Thêm Tiêu Chí Lối Sống'}</span>
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
              label="Tên tiêu chí"
              rules={[{ required: true, message: 'Vui lòng nhập tên tiêu chí!' }]}
            >
              <Input placeholder="Ví dụ: Giờ giấc ngủ, Hút thuốc lá, Nuôi thú cưng..." />
            </Form.Item>

            <Form.Item
              name="algorithmWeight"
              label={
                <span className="inline-flex items-center gap-1.5">
                  <span>Trọng số matching (%)</span>
                  <Tooltip title="Mức độ ảnh hưởng đến điểm tương thích khi ghép người ở cùng">
                    <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer" />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: 'Vui lòng nhập trọng số!' }]}
            >
              <Input type="number" min={1} max={100} suffix="%" />
            </Form.Item>

            <Form.Item
              name="optionsText"
              label={
                <span className="inline-flex items-center gap-1.5">
                  <span>Các lựa chọn</span>
                  <Tooltip title="Nhập danh sách lựa chọn cách nhau bởi dấu phẩy">
                    <HelpCircle className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-primary cursor-pointer" />
                  </Tooltip>
                </span>
              }
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

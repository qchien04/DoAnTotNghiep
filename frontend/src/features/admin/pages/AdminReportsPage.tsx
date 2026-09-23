import React, { useState } from 'react';
import { useReports } from '@/shared/hooks';
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
} from '@/shared/components';
import {
  CheckCircle,
  Gavel,
} from 'lucide-react';
import { message } from 'antd';
import { DisputeReport, EnforceReportDto, DisputeReportStatus, DisputeReportType } from '@/shared/types/admin';

export const AdminReportsPage: React.FC = () => {
  const { reports, isLoading, enforceReportAction, isEnforcing } = useReports();

  // Enforce Modal State (UC 56)
  const [enforceModalOpen, setEnforceModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DisputeReport | null>(null);
  const [form] = Form.useForm();

  const handleOpenEnforce = (rep: DisputeReport) => {
    setSelectedReport(rep);
    form.resetFields();
    form.setFieldsValue({
      action: 'REMOVE_POST_AND_BAN',
      conclusionNote: 'Đã xác minh bài đăng có dấu hiệu lừa đảo cọc. Tiến hành gỡ bài ngay lập tức và khóa tài khoản 30 ngày.',
    });
    setEnforceModalOpen(true);
  };

  const handleEnforceSubmit = async () => {
    if (!selectedReport) return;
    try {
      const values = await form.validateFields();
      await enforceReportAction({
        id: selectedReport.id,
        dto: {
          action: values.action,
          removePost: values.action === 'REMOVE_POST_AND_BAN',
          lockTargetUser: values.action === 'REMOVE_POST_AND_BAN',
          conclusionNote: values.conclusionNote,
        } as EnforceReportDto,
      });
      message.success('Đã thực thi biện pháp xử lý kỷ luật và đóng hồ sơ khiếu nại thành công!');
      setEnforceModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'code',
      key: 'code',
      render: (val: string) => <span className="font-bold text-stay-primary">{val}</span>,
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'reporterName',
      key: 'reporterName',
      render: (val: string, r: DisputeReport) => (
        <div>
          <p className="font-semibold text-stay-text text-xs sm:text-sm">{val}</p>
          <p className="text-[11px] text-slate-400">Mã UID: {r.reporterId}</p>
        </div>
      ),
    },
    {
      title: 'Đối tượng bị tố cáo',
      dataIndex: 'targetName',
      key: 'targetName',
      render: (val: string, r: DisputeReport) => (
        <div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400">{val}</span>
          <span className="text-[10px] text-slate-400 block">Loại: {r.targetType === 'POST' ? 'Bài đăng' : 'Tài khoản'}</span>
        </div>
      ),
    },
    {
      title: 'Hành vi vi phạm',
      dataIndex: 'violationType',
      key: 'violationType',
      render: (type: DisputeReportType) => {
        const map: Record<DisputeReportType, { label: string; tag: 'rented' | 'pending' }> = {
          DEPOSIT_FRAUD: { label: 'Lừa đảo tiền cọc', tag: 'rented' },
          FAKE_ROOM: { label: 'Phòng ảo / Thông tin giả', tag: 'rented' },
          DEPOSIT_DISPUTE: { label: 'Tranh chấp hoàn cọc', tag: 'pending' },
          HARASSMENT: { label: 'Quấy rối / Đe dọa', tag: 'rented' },
          OTHER: { label: 'Vi phạm khác', tag: 'pending' },
        };
        const item = map[type] || { label: type, tag: 'pending' };
        return <Tag status={item.tag}>{item.label}</Tag>;
      },
    },
    {
      title: 'Nội dung tố cáo',
      dataIndex: 'summary',
      key: 'summary',
      render: (val: string) => (
        <span className="text-xs text-stay-text line-clamp-2 max-w-xs">{val}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: DisputeReportStatus) => {
        if (st === 'RESOLVED') return <Tag status="available">Đã xử lý</Tag>;
        if (st === 'MEDIATING') return <Tag status="verified">Đang hòa giải</Tag>;
        if (st === 'REJECTED') return <Tag status="rented">Đã bác bỏ</Tag>;
        return <Tag status="pending">Chờ xác minh</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, r: DisputeReport) => (
        r.status === 'PENDING' || r.status === 'MEDIATING' ? (
          <Button
            variant="primary"
            size="sm"
            icon={<Gavel className="w-3.5 h-3.5" />}
            onClick={() => handleOpenEnforce(r)}
            className="shadow-xs font-semibold"
          >
            Xử lý kỷ luật
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-stay-secondary" /> Đã hoàn tất
          </span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="primary">Kiểm Duyệt & Kỷ Luật Sàn</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
          Quản Lý Tố Cáo & Tranh Chấp Vi Phạm
        </h1>
        <p className="text-sm text-stay-text-secondary mt-0.5">
          Tiếp nhận khiếu nại lừa đảo cọc, phòng ảo và thực thi chế tài: Gỡ bài vi phạm, cảnh cáo hoặc khóa vĩnh viễn tài khoản.
        </p>
      </div>

      {/* Reports Table */}
      <Card>
        <div className="p-6">
          <Table
            dataSource={reports}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
            className="overflow-x-auto"
          />
        </div>
      </Card>

      {/* Enforce Modal (UC 56) */}
      <Modal
        open={enforceModalOpen}
        onCancel={() => setEnforceModalOpen(false)}
        onOk={handleEnforceSubmit}
        confirmLoading={isEnforcing}
        okText="Thực thi chế tài"
        cancelText="Hủy"
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Gavel className="w-5 h-5 text-red-500" />
            <span>Xử lý kỷ luật & thực thi chế tài</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {selectedReport && (
            <div className="p-4 rounded-xl bg-stay-bg-app border border-stay-border text-xs space-y-1">
              <p>
                <strong>Hồ sơ:</strong> {selectedReport.code} • <strong>Đối tượng:</strong> {selectedReport.targetName}
              </p>
              <p>
                <strong>Nội dung tố cáo:</strong> "{selectedReport.summary}"
              </p>
            </div>
          )}

          <Form form={form} layout="vertical">
            <Form.Item
              name="action"
              label="Biện pháp chế tài áp dụng"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: 'Gỡ bỏ bài đăng vi phạm & Khóa tài khoản', value: 'REMOVE_POST_AND_BAN' },
                  { label: 'Cảnh cáo tài khoản vi phạm lần đầu', value: 'WARN_USER' },
                  { label: 'Hòa giải thành công & Hoàn lại tiền cọc', value: 'RESOLVED_MEDIATION' },
                  { label: 'Bác bỏ tố cáo', value: 'DISMISS' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="conclusionNote"
              label="Kết luận & Biên bản xử lý"
              rules={[{ required: true, message: 'Vui lòng ghi rõ kết luận xử lý!' }]}
            >
              <Input.TextArea rows={4} placeholder="Ghi rõ căn cứ và hình thức xử lý..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

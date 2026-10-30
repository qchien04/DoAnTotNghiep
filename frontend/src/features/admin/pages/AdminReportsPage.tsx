import React, { useState } from 'react';
import { useReports, useEnforceReportAction } from '@/shared/hooks';
import {
  Table,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Badge,
} from '@/shared/components';
import {
  Gavel,
} from 'lucide-react';
import { Tooltip } from 'antd';
import { DisputeReport, EnforceReportDto, DisputeReportStatus, DisputeReportType } from '@/shared/types/admin';

export const AdminReportsPage: React.FC = () => {
  const { reports, isLoading } = useReports();
  const { enforceReportAction, isEnforcing } = useEnforceReportAction();

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
      setEnforceModalOpen(false);
    } catch {
      // Form validation error is shown inline, mutation error is handled in mutation hook
    }
  };

  const columns = [
    {
      title: 'Người báo cáo',
      dataIndex: 'reporterName',
      key: 'reporterName',
      render: (val: string, r: DisputeReport) => (
        <div>
          <p className="font-semibold text-stay-text  sm:text-sm">{val}</p>
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
          <span className=" font-bold text-red-600 dark:text-red-400">{val}</span>
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
        <span className="text-stay-text line-clamp-2">{val}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
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
      width: 90,
      fixed: 'right' as const,
      render: (_: any, r: DisputeReport) => (
        r.status === 'PENDING' || r.status === 'MEDIATING' ? (
          <div className="flex items-center justify-start">
            <Tooltip title="Xử lý kỷ luật & chế tài">
              <button
                type="button"
                className="stay-action-btn"
                onClick={() => handleOpenEnforce(r)}
              >
                <Gavel className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">
            Đã xong
          </span>
        )
      ),
    },
  ];


  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
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
      <Table
        dataSource={reports}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        className="overflow-x-auto"
      />


      {/* Enforce Modal */}
      <Modal
        open={enforceModalOpen}
        onCancel={() => setEnforceModalOpen(false)}
        onOk={handleEnforceSubmit}
        confirmLoading={isEnforcing}
        okText="Thực thi chế tài"
        cancelText="Hủy"
        width={680}
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Gavel className="w-5 h-5 text-red-500" />
            <span>Xử lý kỷ luật & thực thi chế tài</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {selectedReport && (
            <div className="space-y-1 pb-1 text-sm text-stay-text">
              <p>
                <strong>Hồ sơ:</strong> {selectedReport.code} • <strong>Đối tượng:</strong> {selectedReport.targetName}
              </p>
              <p className="text-stay-text-secondary">
                <strong>Nội dung tố cáo:</strong> "{selectedReport.summary}"
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-stay-border-subtle">
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
        </div>
      </Modal>
    </div>
  );
};

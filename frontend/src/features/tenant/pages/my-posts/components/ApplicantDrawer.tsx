import React from 'react';
import { Drawer, Table, Button, Tag, Space, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { ExternalLink, CheckCircle, XCircle, MapPin, Users } from 'lucide-react';
import { RoommatePost, RoommateApplication } from '@/shared/types/tenant';
import { formatCurrency } from '@/shared/utils';

interface ApplicantDrawerProps {
  open: boolean;
  onClose: () => void;
  post: RoommatePost | null;
  applications: RoommateApplication[];
  isLoading?: boolean;
  onOpenReview: (app: RoommateApplication) => void;
  onFinishGroup?: () => void;
  onClosePost?: () => void;
}

export const ApplicantDrawer: React.FC<ApplicantDrawerProps> = ({
  open,
  onClose,
  post,
  applications,
  isLoading,
  onOpenReview,
  onFinishGroup,
  onClosePost,
}) => {
  if (!post) return null;

  const applicantColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: any) => <span className="font-mono text-xs font-semibold text-stay-text">#{id}</span>,
    },
    {
      title: 'Ứng viên',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name: string, r: RoommateApplication) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-xs sm:text-sm text-stay-text block">{name}</span>
          {r.introMessage && (
            <p className="text-xs text-stay-text-secondary line-clamp-1 italic">
              "{r.introMessage}"
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Năm sinh / Quê',
      key: 'origin',
      width: 150,
      render: (_: any, r: RoommateApplication) => (
        <span className="text-xs text-stay-text">
          {r.birthYear || 2004} - {r.hometown || 'Hà Nội'}
        </span>
      ),
    },
    {
      title: 'Nghề nghiệp',
      dataIndex: 'occupationOrSchool',
      key: 'occupationOrSchool',
      width: 140,
      render: (val: string) => <span className="text-xs text-stay-text">{val || 'Sinh viên'}</span>,
    },
    {
      title: 'Độ phù hợp',
      dataIndex: 'compatibilityScore',
      key: 'compatibilityScore',
      width: 110,
      render: (score: number) => {
        const val = score ?? 85;
        const color = val >= 80 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-medium';
        return <span className={`text-xs ${color}`}>{val}%</span>;
      },
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (d: string) => (
        <span className="text-xs text-stay-text-secondary">
          {d ? new Date(d).toLocaleDateString('vi-VN') : 'Mới'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'right' as const,
      render: (_: any, r: RoommateApplication) => (
        <Button
          type="primary"
          size="small"
          onClick={() => onOpenReview(r)}
          className="bg-stay-primary hover:bg-stay-primary-hover text-white rounded text-xs"
        >
          Duyệt đơn
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      title={
        <div className="flex items-center gap-2 text-base font-semibold text-stay-text">
          <Users className="w-5 h-5 text-stay-primary" />
          <span>Danh sách đơn ứng tuyển • {post.code || `#BG${post.id}`}</span>
        </div>
      }
      extra={
        <Link
          to={`/roommates/${post.id}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-stay-primary hover:underline"
        >
          <span>Xem bài công khai</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      }
      footer={
        post.status === 'OPEN' ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-stay-text-secondary">
              Có thể chốt nhóm khi đã tìm đủ người hoặc đóng tin nếu muốn dừng nhận đơn.
            </span>
            <Space>
              {onFinishGroup && (
                <Button
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                  onClick={onFinishGroup}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 rounded text-xs"
                >
                  Chốt nhóm
                </Button>
              )}
              {onClosePost && (
                <Button
                  danger
                  icon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={onClosePost}
                  className="rounded text-xs"
                >
                  Đóng tin
                </Button>
              )}
            </Space>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Post Summary Card */}
        <div className="bg-stay-bg-app border border-stay-border rounded-lg p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-stay-text line-clamp-1">{post.title}</h3>
            <Tag color={post.status === 'OPEN' ? 'green' : post.status === 'COMPLETED' ? 'blue' : 'default'}>
              {post.status === 'OPEN' ? 'Đang tìm bạn' : post.status === 'COMPLETED' ? 'Đã chốt nhóm' : 'Đã đóng'}
            </Tag>
          </div>

          <div className="flex items-center gap-1 text-stay-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-stay-primary shrink-0" />
            <span className="truncate">{post.areaName || post.district || post.roomInfo?.address}</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-stay-text">
            <span>
              Giá chia sẻ: <strong>{formatCurrency(post.sharePrice)}/tháng</strong>
            </span>
            <span>
              Tiến độ: <strong>{post.currentRoommates} / {post.neededRoommates + post.currentRoommates} người</strong>
            </span>
          </div>
        </div>

        {/* Applications List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stay-text">
              Đơn xin gia nhập ({applications.length})
            </span>
            <span className="text-[11px] text-stay-text-secondary">
              Xem chi tiết hồ sơ để đối chiếu lối sống và xét duyệt
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="py-12 border border-dashed border-stay-border rounded-lg">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có đơn ứng tuyển nào cho bài đăng này"
              />
            </div>
          ) : (
            <Table
              dataSource={applications}
              columns={applicantColumns}
              rowKey="id"
              loading={isLoading}
              pagination={false}
              size="middle"
              className="border border-stay-border rounded-lg overflow-hidden"
            />
          )}
        </div>
      </div>
    </Drawer>
  );
};

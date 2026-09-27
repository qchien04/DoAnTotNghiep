import React from 'react';
import { Table, Button } from '@/shared/components';
import { RoommateApplication } from '@/shared/types/tenant';

interface ApplicantTableProps {
  applications: RoommateApplication[];
  onOpenReview: (app: RoommateApplication) => void;
}

export const ApplicantTable: React.FC<ApplicantTableProps> = ({
  applications,
  onOpenReview,
}) => {
  const applicantColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      render: (_: any, r: RoommateApplication) => <span className="font-semibold text-stay-text">#{r.id}</span>,
    },
    {
      title: 'Họ và tên ứng viên',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name: string, r: RoommateApplication) => (
        <div>
          <span className="font-bold text-stay-text">{name}</span>
          {r.introMessage && (
            <p className="text-xs text-stay-text-secondary line-clamp-1 italic">
              "{r.introMessage}"
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Năm sinh / Quê quán',
      key: 'origin',
      width: 170,
      render: (_: any, r: RoommateApplication) => (
        <span className="text-xs text-stay-text">
          {r.birthYear || 2004} - {r.hometown || 'Hải Dương'}
        </span>
      ),
    },
    {
      title: 'Công việc / Trường học',
      dataIndex: 'occupationOrSchool',
      key: 'occupationOrSchool',
      width: 200,
      render: (val: string) => <span className="text-xs text-stay-text">{val || 'Sinh viên'}</span>,
    },
    {
      title: 'Điểm tương thích',
      dataIndex: 'compatibilityScore',
      key: 'compatibilityScore',
      width: 150,
      render: (score: number) => {
        let label = 'Rất hợp';
        let color = 'text-emerald-700 font-bold';
        if (score < 80) {
          label = 'Có khác biệt';
          color = 'text-amber-700 font-semibold';
        }
        return (
          <span className={`text-xs ${color}`}>
            {score}% ({label})
          </span>
        );
      },
    },
    {
      title: 'Ngày nộp đơn',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (d: string) => (
        <span className="text-xs text-stay-text-secondary">
          {d ? new Date(d).toLocaleDateString('vi-VN') : '02/10/2026'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      render: (_: any, r: RoommateApplication) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenReview(r)}
        >
          Xem so sánh & Duyệt
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
      {applications.length === 0 ? (
        <div className="py-12 text-center text-xs text-stay-text-secondary">
          Hiện chưa có đơn xin gia nhập nào đang chờ duyệt.
        </div>
      ) : (
        <Table
          columns={applicantColumns}
          dataSource={applications}
          rowKey="id"
          pagination={false}
          className="text-xs"
        />
      )}
    </div>
  );
};

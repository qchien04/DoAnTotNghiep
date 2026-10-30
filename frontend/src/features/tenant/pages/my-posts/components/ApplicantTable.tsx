import React from 'react';
import { Table, Button } from '@/shared/components';
import { RoommateApplication } from '@/shared/types/tenant';
import { getRoommateApplicationStatusLabel } from '@/shared/utils';

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
      title: 'Họ và tên ứng viên',
      dataIndex: 'applicantName',
      key: 'applicantName',
      render: (name: string, r: RoommateApplication) => (
        <div>
          <span className="font-semibold text-stay-text text-[14px] block">{name}</span>
          {r.introMessage && (
            <p className="text-[12px] text-stay-text-secondary line-clamp-1 italic">
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
        <span className="text-[14px] text-stay-text">
          {r.birthYear || 2004} - {r.hometown || 'Hải Dương'}
        </span>
      ),
    },
    {
      title: 'Công việc / Trường học',
      dataIndex: 'occupationOrSchool',
      key: 'occupationOrSchool',
      width: 200,
      render: (val: string) => <span className="text-[14px] text-stay-text">{val || 'Sinh viên'}</span>,
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
          <span className={` ${color}`}>
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
        <span className=" text-stay-text-secondary">
          {d ? new Date(d).toLocaleDateString('vi-VN') : '02/10/2026'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (st: string) => {
        if (st === 'APPROVED') {
          return (
            <span className=" font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {getRoommateApplicationStatusLabel(st)}
            </span>
          );
        }
        if (st === 'REJECTED') {
          return (
            <span className=" font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              {getRoommateApplicationStatusLabel(st)}
            </span>
          );
        }
        return (
          <span className=" font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {getRoommateApplicationStatusLabel(st)}
          </span>
        );
      },
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
          {r.status === 'APPROVED' ? 'Xem chi tiết' : 'Xem so sánh & Duyệt'}
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-stay-card-bg border border-stay-border rounded-xl overflow-hidden shadow-2xs">
      {applications.length === 0 ? (
        <div className="py-12 text-center  text-stay-text-secondary">
          Hiện chưa có đơn xin gia nhập nào đang chờ duyệt.
        </div>
      ) : (
        <Table
          columns={applicantColumns}
          dataSource={applications}
          rowKey="id"
          pagination={false}
          className=""
        />
      )}
    </div>
  );
};

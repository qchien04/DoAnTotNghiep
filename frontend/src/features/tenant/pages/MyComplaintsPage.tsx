import React, { useState } from 'react';
import { useMyComplaints } from '@/shared/hooks';
import {
  Card,
  Button,
  Table,
  Input,
  Select,
  Modal,
  Form,
  Tag,
  Alert,
  Skeleton,
  Upload,
} from '@/shared/components';
import {
  Plus,
  Wrench,
  Star,
} from 'lucide-react';
import { message } from 'antd';
import { Complaint } from '@/shared/types/landlord';

export const MyComplaintsPage: React.FC = () => {
  const {
    complaints,
    isLoading,
    submitComplaint,
    isSubmitting,
    rateComplaint,
    isRating,
  } = useMyComplaints();

  // Create Modal State (UC 45)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Rate Modal State (UC 46)
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [rateFeedback, setRateFeedback] = useState<string>('');

  const handleOpenCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      type: 'COOLING',
      urgency: 'HIGH',
      title: 'Điều hòa phòng P102 không mát và chảy nước',
      content: 'Điều hòa bật 18 độ nhưng chỉ có gió thoảng, nước chảy xuống bàn học từ tối qua.',
    });
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      await submitComplaint({
        type: values.type,
        title: values.title,
        content: values.content,
        urgency: values.urgency,
        images: [
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        ],
      });
      message.success('Đã gửi phản ánh sự cố thành công! Chủ trọ sẽ nhận được thông báo để hẹn thợ.');
      setCreateModalOpen(false);
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleOpenRate = (cmp: Complaint) => {
    setSelectedComplaint(cmp);
    setStarRating(cmp.rating || 5);
    setRateFeedback(cmp.ratingFeedback || 'Thợ đến đúng giờ, sửa chữa cẩn thận.');
    setRateModalOpen(true);
  };

  const handleRateSubmit = async () => {
    if (!selectedComplaint) return;
    try {
      await rateComplaint({
        id: String(selectedComplaint.id),
        dto: { rating: starRating, feedback: rateFeedback },
      });
      message.success('Cảm ơn bạn đã đánh giá chất lượng sửa chữa!');
      setRateModalOpen(false);
    } catch (err: any) {
      message.error(err.message || 'Lỗi gửi đánh giá');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const columns = [
    {
      title: 'Mã khiếu nại',
      dataIndex: 'code',
      key: 'code',
      render: (val: string) => <span className="font-bold text-stay-primary">{val}</span>,
    },
    {
      title: 'Tiêu đề sự cố',
      dataIndex: 'title',
      key: 'title',
      render: (val: string, r: Complaint) => (
        <div>
          <p className="font-semibold text-stay-text">{val}</p>
          <p className="text-xs text-stay-text-secondary line-clamp-1">{r.content}</p>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urg: string) => {
        if (urg === 'HIGH' || urg === 'URGENT') {
          return <Tag status="rented">Khẩn cấp</Tag>;
        }
        return <Tag status="pending">Bình thường</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st: string) => {
        if (st === 'RESOLVED') return <Tag status="available">Đã giải quyết</Tag>;
        if (st === 'PROCESSING') return <Tag status="verified">Đang xử lý</Tag>;
        return <Tag status="pending">Chờ tiếp nhận</Tag>;
      },
    },
    {
      title: 'Phản hồi từ chủ trọ',
      dataIndex: 'responseNote',
      key: 'responseNote',
      render: (val: string) => (
        <span className="text-xs text-stay-text-secondary italic">
          {val || 'Chưa có phản hồi'}
        </span>
      ),
    },
    {
      title: 'Đánh giá thợ',
      key: 'rating',
      render: (_: any, r: Complaint) => {
        if (r.status !== 'RESOLVED') {
          return <span className="text-xs text-slate-400">Đang chờ xử lý</span>;
        }
        if (r.rating) {
          return (
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{r.rating} / 5 sao</span>
            </div>
          );
        }
        return (
          <Button
            variant="outline"
            size="sm"
            icon={<Star className="w-3.5 h-3.5 text-amber-500" />}
            onClick={() => handleOpenRate(r)}
          >
            Chấm điểm
          </Button>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
            Báo Hỏng & Khiếu Nại Dịch Vụ
          </h1>
          <p className="text-sm text-stay-text-secondary mt-1">
            Gửi yêu cầu sửa chữa thiết bị phòng trọ trực tiếp tới chủ trọ và theo dõi lịch hẹn thợ.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
          className="shadow-md shadow-stay-primary/20 font-semibold"
        >
          Gửi báo hỏng
        </Button>
      </div>

      {/* Table Card */}
      <Card>
        <div className="p-6">
          <Table
            dataSource={complaints}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="overflow-x-auto"
          />
        </div>
      </Card>

      {/* Create Complaint Modal (UC 45) */}
      <Modal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateSubmit}
        confirmLoading={isSubmitting}
        okText="Gửi báo hỏng"
        cancelText="Hủy"
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Wrench className="w-5 h-5 text-stay-primary" />
            <span>Gửi Yêu Cầu Báo Hỏng Sự Cố Phòng Trọ</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Alert
            type="info"
            message="Chủ nhà sẽ nhận được thông báo ngay lập tức và tiến hành hẹn lịch thợ đến phòng xử lý."
          />

          <Form form={createForm} layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="type" label="Loại sự cố" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Điều hòa / Máy lạnh', value: 'COOLING' },
                    { label: 'Hệ thống điện', value: 'ELECTRICITY' },
                    { label: 'Đường ống nước / Vệ sinh', value: 'PLUMBING' },
                    { label: 'An ninh / Khóa cửa', value: 'SECURITY' },
                    { label: 'Khác', value: 'OTHER' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="urgency" label="Mức độ khẩn cấp" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Bình thường', value: 'LOW' },
                    { label: 'Cần sớm', value: 'MEDIUM' },
                    { label: 'Khẩn cấp', value: 'HIGH' },
                  ]}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="title"
              label="Tiêu đề vắn tắt"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input placeholder="Ví dụ: Vòi sen rò rỉ nước, Aptomat bị nhảy liên tục..." />
            </Form.Item>

            <Form.Item
              name="content"
              label="Mô tả hiện tượng chi tiết"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
            >
              <Input.TextArea rows={3} placeholder="Mô tả cụ thể vị trí và tình trạng hư hỏng..." />
            </Form.Item>

            <div>
              <label className="text-xs font-semibold text-stay-text mb-2 block">
                Hình ảnh hiện trường
              </label>
              <Upload.Dragger
                title="Tải lên ảnh chụp thiết bị hỏng"
                hint="Giúp thợ chuẩn bị linh kiện thay thế trước khi đến"
                beforeUpload={() => {
                  message.success('Đã tải ảnh lên!');
                  return false;
                }}
              />
            </div>
          </Form>
        </div>
      </Modal>

      {/* Rate Modal (UC 46) */}
      <Modal
        open={rateModalOpen}
        onCancel={() => setRateModalOpen(false)}
        onOk={handleRateSubmit}
        confirmLoading={isRating}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Đánh giá chất lượng sửa chữa</span>
          </div>
        }
      >
        <div className="space-y-4 py-3 text-center">
          <p className="text-xs text-stay-text-secondary">
            Bạn hài lòng thế nào về thái độ và kết quả khắc phục sự cố của thợ sửa chữa?
          </p>

          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setStarRating(star)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= starRating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm font-bold text-amber-600 block">
            {starRating} / 5 sao ({starRating >= 4 ? 'Rất hài lòng' : starRating === 3 ? 'Bình thường' : 'Chưa hài lòng'})
          </span>

          <div className="text-left space-y-1.5">
            <label className="text-xs font-semibold text-stay-text">
              Nhận xét thêm (Tùy chọn)
            </label>
            <Input.TextArea
              rows={3}
              value={rateFeedback}
              onChange={(e) => setRateFeedback(e.target.value)}
              placeholder="Chia sẻ thêm về trải nghiệm sửa chữa..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

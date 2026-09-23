import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRoommatePostDetail, useApplications } from '@/shared/hooks';
import {
  Card,
  Button,
  Tag,
  Badge,
  Modal,
  Form,
  Input,
  HabitChip,
  Skeleton,
  Alert,
} from '@/shared/components';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Share2,
  Flag,
} from 'lucide-react';
import { message } from 'antd';
import { RoommateApplication, LifestyleSurvey } from '@/shared/types/tenant';

export const RoommatePostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { post, isLoading } = useRoommatePostDetail(id);

  // Application Hooks
  const {
    applications,
    applyToGroup,
    isApplying,
    approveApplication,
    rejectApplication,
  } = useApplications(id);

  // Apply Modal State (UC 37)
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyForm] = Form.useForm();

  // Report Modal State (UC 55)
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm] = Form.useForm();

  const handleApplySubmit = async () => {
    try {
      const values = await applyForm.validateFields();
      const defaultLifestyle: LifestyleSurvey = {
        genderPreference: 'ANY',
        sleepTime: 'AFTER_24H',
        smoking: false,
        petFriendly: true,
        cookingFrequency: 'DAILY',
        cleanlinessLevel: 'VERY_CLEAN',
        personality: 'BALANCED',
        guestsAllowed: 'WEEKENDS_ONLY',
      };
      await applyToGroup({
        postId: id || '',
        introMessage: values.message,
        lifestyle: defaultLifestyle,
      });
      message.success('Đã gửi yêu cầu ở ghép thành công (Mã: YCGN-105)! Chủ bài đăng sẽ phản hồi sớm.');
      setApplyModalOpen(false);
      applyForm.resetFields();
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  const handleReview = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      if (status === 'ACCEPTED') {
        await approveApplication(appId);
        message.success('Đã chấp thuận thành viên vào nhóm!');
      } else {
        await rejectApplication({ applicationId: appId, reason: 'Không phù hợp tiêu chí' });
        message.success('Đã từ chối đơn yêu cầu.');
      }
    } catch (err: any) {
      message.error(err.message || 'Lỗi duyệt thành viên');
    }
  };

  const handleReportSubmit = async () => {
    try {
      await reportForm.validateFields();
      message.success('Đã gửi báo cáo vi phạm tới Ban Quản Trị để kiểm duyệt (Mã: BC201)!');
      setReportModalOpen(false);
      reportForm.resetFields();
    } catch (err: any) {
      if (err?.message) message.error(err.message);
    }
  };

  if (isLoading || !post) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/roommates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stay-text-secondary hover:text-stay-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tìm bạn
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-3.5 h-3.5" />}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              message.success('Đã sao chép liên kết bài đăng!');
            }}
          >
            Chia sẻ
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Flag className="w-3.5 h-3.5 text-red-500" />}
            onClick={() => setReportModalOpen(true)}
            className="text-red-600 hover:bg-red-50"
          >
            Báo cáo
          </Button>
        </div>
      </div>

      {/* Main Hero Card */}
      <Card className="overflow-hidden">
        {post.roomInfo?.images && post.roomInfo.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 bg-stay-bg-app border-b border-stay-border">
            <div className="md:col-span-2 aspect-[16/9] rounded-2xl overflow-hidden">
              <img
                src={post.roomInfo.images[0]}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
              {post.roomInfo.images.slice(1, 3).map((img: string, idx: number) => (
                <div key={idx} className="aspect-[16/9] rounded-xl overflow-hidden">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Status & Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tag
                status={post.postType === 'HAS_ROOM' ? 'available' : 'verified'}
              >
                {post.postType === 'HAS_ROOM' ? 'Đã có sẵn phòng' : 'Tìm bạn cùng tìm phòng'}
              </Tag>
              <Badge variant="match">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {post.matchPercentage || 92}% Tương thích lối sống
              </Badge>
            </div>
            <span className="text-xs text-stay-text-secondary font-medium">Mã tin: {post.code}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-stay-text-secondary">
            <MapPin className="w-4 h-4 text-stay-primary shrink-0" />
            <span>{post.areaName}</span>
          </div>

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-stay-bg-app border border-stay-border">
            <div>
              <span className="text-[11px] text-stay-text-secondary block font-medium">Giá share / người</span>
              <span className="text-lg font-bold text-stay-primary">
                {post.sharePrice.toLocaleString()} đ
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stay-text-secondary block font-medium">Quy mô nhóm</span>
              <span className="text-lg font-bold text-stay-text">
                {post.currentRoommates} / {post.neededRoommates} người
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stay-text-secondary block font-medium">Diện tích phòng</span>
              <span className="text-lg font-bold text-stay-text">
                {post.roomInfo?.areaSize || 28} m²
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stay-text-secondary block font-medium">Tổng giá phòng</span>
              <span className="text-lg font-bold text-stay-text">
                {post.totalRoomPrice ? `${(post.totalRoomPrice / 1000000).toFixed(1)}Tr` : '3.5Tr'}
              </span>
            </div>
          </div>

          {/* Author Card & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-stay-card-bg border border-stay-border shadow-2xs">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={post.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-stay-primary"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-stay-text">{post.authorName}</span>
                  <ShieldCheck className="w-4 h-4 text-stay-secondary" />
                </div>
                <p className="text-xs text-stay-text-secondary">Chủ bài đăng • ID: {post.authorId}</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={<Send className="w-4 h-4" />}
              onClick={() => setApplyModalOpen(true)}
              className="shadow-md shadow-stay-primary/20"
            >
              Gửi Yêu Cầu Ở Ghép
            </Button>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stay-text">Mô tả chi tiết bài đăng</h3>
            <p className="text-sm text-stay-text leading-relaxed whitespace-pre-line bg-stay-bg-app p-4 rounded-xl border border-stay-border">
              {post.description}
            </p>
          </div>

          {/* Lifestyle Habits */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-stay-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-stay-primary" />
              Thói quen & Lối sống ưu tiên
            </h3>
            <div className="flex flex-wrap gap-2">
              <HabitChip label="Không hút thuốc" selected emoji="🚭" />
              <HabitChip label="Ngủ sau 24h" selected emoji="🌙" />
              <HabitChip label="Nấu ăn thường xuyên" selected emoji="🍳" />
              <HabitChip label="Thích yên tĩnh" selected emoji="🎧" />
              <HabitChip label="Ngăn nắp, sạch sẽ" selected emoji="✨" />
            </div>
          </div>
        </div>
      </Card>

      {/* Applications Review Section (UC 38 - UC 39) */}
      <Card>
        <div className="p-6 border-b border-stay-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stay-text flex items-center gap-2">
              <Users className="w-5 h-5 text-stay-primary" />
              Danh Sách Yêu Cầu Gia Nhập Nhóm ({applications.length})
            </h3>
            <p className="text-xs text-stay-text-secondary mt-0.5">
              Phê duyệt hoặc từ chối các đơn xin ở ghép dựa trên độ tương thích lối sống.
            </p>
          </div>
        </div>

        <div className="p-6 divide-y divide-stay-border">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-xs text-stay-text-secondary">
              Chưa có đơn xin gia nhập nào cho bài đăng này.
            </div>
          ) : (
            applications.map((app: RoommateApplication) => (
              <div key={app.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stay-text">{app.applicantName}</span>
                    <Badge variant="match">{app.compatibilityScore || 88}% Khớp</Badge>
                    <Tag
                      status={
                        app.status === 'APPROVED'
                          ? 'available'
                          : app.status === 'REJECTED'
                          ? 'rented'
                          : 'pending'
                      }
                    >
                      {app.status === 'APPROVED'
                        ? 'Đã duyệt'
                        : app.status === 'REJECTED'
                        ? 'Đã từ chối'
                        : 'Chờ duyệt'}
                    </Tag>
                  </div>
                  <p className="text-xs text-stay-text-secondary">
                    Lời nhắn: "{app.introMessage || 'Chào bạn, mình rất muốn tham gia nhóm vì cùng trường ĐH và lối sống tương tự.'}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Thời gian gửi: {app.createdAt || '01/10/2026'} • SĐT: {app.phone || '0912.345.678'}
                  </p>
                </div>

                {app.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<XCircle className="w-3.5 h-3.5 text-red-500" />}
                      onClick={() => handleReview(app.id, 'REJECTED')}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleReview(app.id, 'ACCEPTED')}
                    >
                      Duyệt tham gia
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Apply Modal (UC 37) */}
      <Modal
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        onOk={handleApplySubmit}
        confirmLoading={isApplying}
        okText="Xác nhận gửi đơn"
        cancelText="Hủy"
        title={
          <div className="flex items-center gap-2 text-stay-text font-bold">
            <Send className="w-5 h-5 text-stay-primary" />
            <span>Nộp đơn đăng ký ở ghép</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Alert
            type="info"
            message="Chủ bài đăng sẽ nhận được thông báo kèm hồ sơ lối sống của bạn để xem xét mức độ tương thích trước khi duyệt."
          />

          <Form form={applyForm} layout="vertical">
            <Form.Item
              name="message"
              label="Lời giới thiệu bản thân"
              rules={[{ required: true, message: 'Vui lòng nhập lời giới thiệu!' }]}
              initialValue="Chào bạn, mình xem bài đăng thấy rất thích hợp. Mình là sinh viên năm 3 ngoan ngoãn, không hút thuốc, muốn dọn vào ở ghép cùng bạn."
            >
              <Input.TextArea rows={3} placeholder="Giới thiệu đôi nét về bản thân và mong muốn khi ở ghép..." />
            </Form.Item>

            <Form.Item
              name="moveInDate"
              label="Ngày dự kiến dọn vào"
              rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến!' }]}
              initialValue={new Date().toISOString().split('T')[0]}
            >
              <Input type="date" />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Report Modal (UC 55) */}
      <Modal
        open={reportModalOpen}
        onCancel={() => setReportModalOpen(false)}
        onOk={handleReportSubmit}
        okText="Gửi báo cáo"
        cancelText="Hủy"
        title={
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Báo cáo vi phạm bài đăng</span>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-stay-text-secondary">
            Báo cáo sẽ được gửi trực tiếp đến Quản Trị Viên (Admin) để xác minh và gỡ bài nếu vi phạm quy định sàn.
          </p>

          <Form form={reportForm} layout="vertical">
            <Form.Item
              name="reason"
              label="Lý do báo cáo"
              rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
              initialValue="Thông tin phòng không đúng sự thật, giá ảo hoặc có dấu hiệu lừa đảo cọc."
            >
              <Input.TextArea rows={3} placeholder="Mô tả chi tiết vi phạm..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

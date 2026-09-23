import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyRoommatePosts } from '@/shared/hooks';
import {
  Card,
  Button,
  Tag,
  Modal,
  Empty,
  Skeleton,
} from '@/shared/components';
import {
  Plus,
  Users,
  Eye,
  Lock,
  DollarSign,
  MapPin,
  XCircle,
} from 'lucide-react';
import { message } from 'antd';
import { RoommatePostStatus } from '@/shared/types/tenant';

export const MyRoommatePostsPage: React.FC = () => {
  const { posts, isLoading, closePost, lockGroup } = useMyRoommatePosts();
  const [activeTab, setActiveTab] = useState<RoommatePostStatus | 'ALL'>('ALL');

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'ALL') return true;
    return p.status === activeTab;
  });

  const handleClose = async (postId: string) => {
    Modal.confirm({
      title: 'Đóng bài đăng tìm bạn ở ghép?',
      content: 'Bài viết sẽ không còn hiển thị trên sàn tìm kiếm công khai nữa.',
      okText: 'Đóng bài đăng',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await closePost(postId);
          message.success('Đã đóng bài đăng tìm bạn!');
        } catch (err: any) {
          message.error(err.message || 'Lỗi đóng bài đăng');
        }
      },
    });
  };

  const handleLockGroup = async (postId: string) => {
    Modal.confirm({
      title: 'Chốt danh sách nhóm bạn?',
      content: 'Nhóm sẽ được chốt danh sách thành viên hiện tại và bài đăng sẽ tự động chuyển sang trạng thái Đã đủ người.',
      okText: 'Chốt nhóm ngay',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await lockGroup(postId);
          message.success('Chúc mừng bạn đã chốt nhóm thành công! Các thành viên có thể tiến hành ký hợp đồng và liên hệ chủ trọ.');
        } catch (err: any) {
          message.error(err.message || 'Lỗi chốt nhóm');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
            Bài Đăng Của Tôi
          </h1>
          <p className="text-sm text-stay-text-secondary mt-1">
            Quản lý các tin tìm bạn ở ghép, danh sách đơn xin vào nhóm và chốt nhóm khi đủ người.
          </p>
        </div>
        <Link to="/roommates/create">
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            className="shadow-md shadow-stay-primary/20 font-semibold"
          >
            Đăng Tin Mới
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-stay-border flex gap-4">
        {[
          { key: 'ALL', label: `Tất cả (${posts.length})` },
          { key: 'OPEN', label: `Đang tìm bạn (${posts.filter((p) => p.status === 'OPEN').length})` },
          { key: 'COMPLETED', label: `Đã chốt nhóm (${posts.filter((p) => p.status === 'COMPLETED').length})` },
          { key: 'CLOSED', label: `Đã đóng (${posts.filter((p) => p.status === 'CLOSED').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative ${
              activeTab === tab.key
                ? 'text-stay-primary border-b-2 border-stay-primary'
                : 'text-stay-text-secondary hover:text-stay-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post List */}
      {filteredPosts.length === 0 ? (
        <Card className="py-12 text-center">
          <Empty description="Không có bài đăng nào trong mục này" />
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag
                      status={
                        post.status === 'OPEN'
                          ? 'available'
                          : post.status === 'COMPLETED'
                          ? 'verified'
                          : 'rented'
                      }
                    >
                      {post.status === 'OPEN'
                        ? 'Đang mở tìm bạn'
                        : post.status === 'COMPLETED'
                        ? 'Đã chốt nhóm'
                        : 'Đã đóng bài'}
                    </Tag>
                    <span className="text-xs text-stay-text-secondary font-medium">Mã: {post.code}</span>
                    <span className="text-xs text-slate-400">• Ngày đăng: {post.createdAt}</span>
                  </div>

                  <Link to={`/roommates/${post.id}`}>
                    <h3 className="text-lg font-bold text-stay-text hover:text-stay-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stay-text-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {post.areaName}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-stay-primary">
                      <DollarSign className="w-3.5 h-3.5" />
                      {post.sharePrice.toLocaleString()} đ / người
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Đã có {post.currentRoommates} / {post.neededRoommates} người
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link to={`/roommates/${post.id}`}>
                    <Button variant="outline" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                      Xem & Duyệt đơn ({post.pendingApplicantsCount || 0})
                    </Button>
                  </Link>

                  {post.status === 'OPEN' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Lock className="w-3.5 h-3.5" />}
                        onClick={() => handleLockGroup(post.id)}
                      >
                        Chốt nhóm
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<XCircle className="w-3.5 h-3.5 text-red-500" />}
                        onClick={() => handleClose(post.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Đóng tin
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

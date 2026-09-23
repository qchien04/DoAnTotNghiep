import React, { useState } from 'react';
import { Dropdown, Badge } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  FileSignature,
  DollarSign,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Clock,
  Inbox,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'complaint' | 'bill' | 'contract' | 'match' | 'system';
  isRead: boolean;
  link?: string;
}

export interface NotificationDropdownProps {
  notifications?: NotificationItem[];
  viewAllLink?: string;
  viewAllText?: string;
  onMarkAllAsRead?: () => void;
  className?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Khiếu nại phòng 302: Hỏng điều hòa',
    description: 'Khách thuê báo điều hòa không lạnh và chảy nước cần xử lý gấp.',
    time: '5 phút trước',
    type: 'complaint',
    isRead: false,
    link: '/landlord/complaints',
  },
  {
    id: '2',
    title: 'Hóa đơn P.201 đã được thanh toán',
    description: 'Trần Văn Nam đã thanh toán 3.500.000đ qua chuyển khoản VietQR.',
    time: '1 giờ trước',
    type: 'bill',
    isRead: false,
    link: '/landlord/bills',
  },
  {
    id: '3',
    title: 'Hợp đồng P.102 sắp hết hạn',
    description: 'Hợp đồng thuê của Nguyễn Thị Mai sẽ hết hạn trong 10 ngày nữa.',
    time: '3 giờ trước',
    type: 'contract',
    isRead: false,
    link: '/landlord/contracts',
  },
  {
    id: '4',
    title: 'Hệ thống đã cập nhật biểu phí dịch vụ',
    description: 'Biểu giá điện mới từ EVN đã được áp dụng tự động cho kỳ ghi số tiếp theo.',
    time: '1 ngày trước',
    type: 'system',
    isRead: true,
    link: '/landlord/services',
  },
];

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications: propNotifications,
  viewAllLink = '/landlord/complaints',
  viewAllText = 'Xem tất cả thông báo',
  onMarkAllAsRead,
  className = '',
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    propNotifications || DEFAULT_NOTIFICATIONS
  );
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onMarkAllAsRead?.();
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'complaint':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'bill':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      case 'contract':
        return <FileSignature className="w-4 h-4 text-blue-500" />;
      case 'match':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'system':
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'complaint':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50';
      case 'bill':
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50';
      case 'contract':
        return 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50';
      case 'match':
        return 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50';
      case 'system':
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const dropdownContent = (
    <div className="w-80 sm:w-96 bg-stay-card-bg border border-stay-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stay-border bg-stay-bg-app/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-stay-text">Thông báo</span>
          {unreadCount > 0 ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
              {unreadCount} mới
            </span>
          ) : (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
              Đã đọc hết
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-stay-primary hover:text-stay-primary-hover font-medium transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Đã đọc tất cả</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-stay-border/40">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-stay-bg-app/70 transition-colors cursor-pointer relative group ${
                !item.isRead ? 'bg-stay-primary-subtle/30' : ''
              }`}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${getIconBg(
                  item.type
                )}`}
              >
                {getIcon(item.type)}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-xs truncate ${
                      !item.isRead
                        ? 'font-bold text-stay-text'
                        : 'font-medium text-stay-text-secondary'
                    }`}
                  >
                    {item.title}
                  </p>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-stay-text-secondary line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-stay-text-secondary space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs">Không có thông báo nào</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-stay-border bg-stay-bg-app/40 text-center">
        <Link
          to={viewAllLink}
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-stay-primary hover:text-stay-primary-hover hover:bg-stay-bg-app rounded-xl transition-all"
        >
          <span>{viewAllText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <div
        className={`p-2 rounded-xl hover:bg-stay-bg-app text-stay-text-secondary hover:text-stay-primary transition-colors cursor-pointer inline-flex items-center justify-center ${className}`}
        title="Thông báo"
      >
        <Badge count={unreadCount} overflowCount={99} size="small" offset={[2, -2]}>
          <Bell className="w-5 h-5" />
        </Badge>
      </div>
    </Dropdown>
  );
};

export default NotificationDropdown;

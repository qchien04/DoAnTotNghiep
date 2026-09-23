import React, { useEffect, useState } from 'react';
import { authService } from '@/shared/services/authService';
import { User } from '@/shared/types/auth';
import { Users, Shield, CheckCircle, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authService.getUsers({ page: 0, size: 20 });
        if (response.code === '00' && response.data) {
          setUsers(response.data.items);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản Lý Người Dùng</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu người dùng được bảo vệ bởi bộ lọc JWT Authentication Filter
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
          <Users className="w-4 h-4" />
          <span>Tổng: {users.length} tài khoản</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Đang tải danh sách người dùng từ API..." />
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {error}
        </div>
      ) : (
        <div className="bg-stay-card-bg rounded-xl border border-stay-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stay-bg-app border-b border-stay-border text-[11px] font-bold text-stay-text-secondary uppercase tracking-wider">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Người Dùng</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Vai Trò</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stay-border-subtle text-xs text-stay-text">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stay-bg-app transition-colors">
                    <td className="py-3 px-4 font-mono text-stay-text-muted">#{u.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stay-text">{u.fullName}</div>
                      <div className="text-[11px] text-stay-text-muted">@{u.username}</div>
                    </td>
                    <td className="py-3 px-4 text-stay-text-secondary">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Đang hoạt động
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mặc định'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

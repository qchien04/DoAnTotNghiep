import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/stores/useAuthStore';
import { getToken } from '@/shared/utils/token';
import { AntdProvider } from '@/shared/providers/AntdProvider';
import { QueryProvider } from '@/shared/providers/QueryProvider';

export const App: React.FC = () => {
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    // Nếu trong localStorage đã có token, fetch lại thông tin mới nhất
    if (getToken()) {
      fetchProfile();
    }
  }, [fetchProfile]);

  return (
    <QueryProvider>
      <AntdProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntdProvider>
    </QueryProvider>
  );
};

export default App;

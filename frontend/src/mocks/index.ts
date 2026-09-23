/**
 * Điểm vào khởi tạo hệ thống Mocking
 */
import { AxiosInstance } from 'axios';
import { setupMockAdapter } from './mockAdapter';
import { mockStorage } from './db/storage';

export function initMockSystem(apiClient: AxiosInstance): void {
  setupMockAdapter(apiClient);
  console.log(
    '%c[STAYCONNECT MOCK SYSTEM] Đã kích hoạt bộ chặn Mock Interceptor (57 Use Case Ready)',
    'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );

  // Gắn helper vào window để dễ dàng reset dữ liệu mẫu khi demo bảo vệ đồ án
  if (typeof window !== 'undefined') {
    (window as any).__resetMockData = () => {
      mockStorage.resetDb();
      console.log('%c[MOCK SYSTEM] Đã reset toàn bộ dữ liệu mẫu về ban đầu!', 'color: #3b82f6;');
      window.location.reload();
    };
  }
}

export { mockStorage };
export * from './mockAdapter';
export * from './utils/response';
export * from './db/initialData';
export * from './testMock';

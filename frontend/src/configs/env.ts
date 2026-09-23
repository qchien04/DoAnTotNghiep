/**
 * Cấu hình biến môi trường Frontend
 */
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_URL || '',
  APP_TITLE: 'Hệ Thống Đồ Án Tốt Nghiệp',
  TOKEN_KEY: 'auth_access_token',
  REFRESH_TOKEN_KEY: 'auth_refresh_token',
  USER_KEY: 'auth_user_info',
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true', // Chỉ bật mock khi VITE_USE_MOCK=true, mặc định dùng backend thật
};

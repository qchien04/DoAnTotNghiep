/**
 * Mock Adapter Core cho Axios
 * Chặn các HTTP Request khớp với tiền tố /api/ và điều hướng đến Mock Handlers
 */
import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { matchUrl, parseQueryParams } from './utils/urlMatcher';

// Import các nhóm handlers
import { authHandlers } from './handlers/authHandlers';
import { buildingHandlers } from './handlers/landlord/buildingHandlers';
import { roomHandlers } from './handlers/landlord/roomHandlers';
import { serviceHandlers } from './handlers/landlord/serviceHandlers';
import { tenantHandlers } from './handlers/landlord/tenantHandlers';
import { contractHandlers } from './handlers/landlord/contractHandlers';
import { billHandlers } from './handlers/landlord/billHandlers';
import { complaintHandlers } from './handlers/landlord/complaintHandlers';
import { dashboardHandlers } from './handlers/landlord/dashboardHandlers';
import { roommateHandlers } from './handlers/tenant/roommateHandlers';
import { myRoomHandlers } from './handlers/tenant/myRoomHandlers';
import { myBillHandlers } from './handlers/tenant/myBillHandlers';
import { myIssueHandlers } from './handlers/tenant/myIssueHandlers';
import { userHandlers } from './handlers/admin/userHandlers';
import { masterDataHandlers } from './handlers/admin/masterDataHandlers';
import { reportHandlers } from './handlers/admin/reportHandlers';
import { analyticsHandlers } from './handlers/admin/analyticsHandlers';
import { VIETNAM_ISLANDS_DATA } from '@/shared/constants/vietnamIslands';
import { successResponse } from './utils/response';

export interface MockHandlerContext {
  method: string;
  url: string;
  params: Record<string, string>;
  queryParams: Record<string, string>;
  body: any;
  headers: any;
}

export type MockRouteHandler = (ctx: MockHandlerContext) => any | Promise<any>;

// Tập hợp toàn bộ mock handlers của 57 use cases + API chủ quyền biển đảo
const ALL_HANDLERS: Record<string, MockRouteHandler> = {
  ...authHandlers,
  ...buildingHandlers,
  ...roomHandlers,
  ...serviceHandlers,
  ...tenantHandlers,
  ...contractHandlers,
  ...billHandlers,
  ...complaintHandlers,
  ...dashboardHandlers,
  ...roommateHandlers,
  ...myRoomHandlers,
  ...myBillHandlers,
  ...myIssueHandlers,
  ...userHandlers,
  ...masterDataHandlers,
  ...reportHandlers,
  ...analyticsHandlers,
  'GET /api/islands': () => successResponse(VIETNAM_ISLANDS_DATA),
};

/**
 * Trích xuất đường dẫn tương đối (/api/...) từ config URL của Axios
 */
function normalizeRequestPath(url = '', baseURL = ''): string {
  let path = url;
  if (baseURL && path.startsWith(baseURL)) {
    path = path.slice(baseURL.length);
  }
  // Loại bỏ hostname nếu url là full URL (ví dụ: http://localhost:8080/api/...)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path);
      path = parsed.pathname + parsed.search;
    } catch {
      // Giữ nguyên
    }
  }
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path;
}

/**
 * Tìm handler khớp với Method và Path
 */
function findMatchingHandler(
  method: string,
  normalizedPath: string
): { handler: MockRouteHandler; params: Record<string, string> } | null {
  const targetMethod = method.toUpperCase();
  const urlOnly = normalizedPath.split('?')[0];

  for (const [routeKey, handler] of Object.entries(ALL_HANDLERS)) {
    const [routeMethod, routePattern] = routeKey.split(' ');
    if (routeMethod.toUpperCase() !== targetMethod) continue;

    const match = matchUrl(routePattern, urlOnly);
    if (match.isMatch) {
      return { handler, params: match.params };
    }
  }

  return null;
}

/**
 * Cài đặt Mock Adapter vào Axios Instance
 */
export function setupMockAdapter(axiosInstance: AxiosInstance): void {
  const originalAdapter = axiosInstance.defaults.adapter;

  axiosInstance.defaults.adapter = async (
    config: InternalAxiosRequestConfig
  ): Promise<AxiosResponse> => {
    const method = (config.method || 'GET').toUpperCase();
    const normalizedPath = normalizeRequestPath(config.url, config.baseURL);

    // Chỉ chặn nếu đường dẫn bắt đầu bằng /api/
    if (normalizedPath.startsWith('/api/')) {
      const match = findMatchingHandler(method, normalizedPath);

      if (match) {
        // Mô phỏng độ trễ mạng thực tế 150 - 250ms
        await new Promise((resolve) => setTimeout(resolve, 180));

        let body = config.data;
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body);
          } catch {
            // Giữ nguyên chuỗi
          }
        }

        const queryParams = {
          ...parseQueryParams(normalizedPath),
          ...(config.params || {}),
        };

        const context: MockHandlerContext = {
          method,
          url: normalizedPath,
          params: match.params,
          queryParams,
          body,
          headers: config.headers,
        };

        try {
          const responseData = await match.handler(context);

          // In log dev thân thiện
          console.log(
            `%c[MOCK API] ${method} ${normalizedPath}`,
            'color: #059669; font-weight: bold;',
            { params: match.params, queryParams, body, response: responseData }
          );

          return {
            data: responseData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        } catch (err: any) {
          console.error(`[MOCK API ERROR] ${method} ${normalizedPath}`, err);
          return {
            data: {
              code: '99',
              message: err.message || 'Lỗi xử lý Mock Server',
              data: null,
            },
            status: 400,
            statusText: 'Bad Request',
            headers: {},
            config,
          };
        }
      } else {
        console.warn(`[MOCK API] Không tìm thấy handler khớp cho: ${method} ${normalizedPath}`);
      }
    }

    // Nếu không khớp hoặc không phải /api/ -> fallback về adapter gốc
    if (typeof originalAdapter === 'function') {
      return originalAdapter(config);
    }
    throw new Error(`[MockAdapter] Request không được xử lý: ${method} ${config.url}`);
  };
}

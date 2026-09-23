/**
 * Helper định tuyến URL và bóc tách parameters cho Mock API
 */

export interface MatchResult {
  isMatch: boolean;
  params: Record<string, string>;
}

/**
 * So khớp URL pattern với actual URL
 * Ví dụ pattern: '/api/landlord/buildings/:id'
 * Actual: '/api/landlord/buildings/TN01' -> params: { id: 'TN01' }
 */
export function matchUrl(pattern: string, actualUrl: string): MatchResult {
  // Loại bỏ query params khỏi actualUrl trước khi so khớp
  const cleanUrl = actualUrl.split('?')[0].replace(/\/+$/, '');
  const cleanPattern = pattern.replace(/\/+$/, '');

  const patternSegments = cleanPattern.split('/');
  const actualSegments = cleanUrl.split('/');

  if (patternSegments.length !== actualSegments.length) {
    return { isMatch: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const p = patternSegments[i];
    const a = actualSegments[i];

    if (p.startsWith(':')) {
      const paramName = p.slice(1);
      params[paramName] = decodeURIComponent(a);
    } else if (p.toLowerCase() !== a.toLowerCase()) {
      return { isMatch: false, params: {} };
    }
  }

  return { isMatch: true, params };
}

/**
 * Trích xuất Query params từ chuỗi URL
 */
export function parseQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryString = url.split('?')[1];
  if (!queryString) return params;

  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  return params;
}

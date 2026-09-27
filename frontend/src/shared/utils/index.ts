export * from './serviceUtils';
export * from './token';

/**
 * Format currency amount to Vietnamese Dong string (e.g. "3.800.000 đ")
 */
export const formatCurrency = (amount?: number | null): string => {
  if (amount == null || isNaN(amount)) return '0 đ';
  return `${Number(amount).toLocaleString('vi-VN')} đ`;
};

/**
 * Format date string (YYYY-MM-DD or ISO) to display format (DD/MM/YYYY)
 */
export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

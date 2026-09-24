/**
 * Tiện ích xử lý và chuẩn hóa đơn vị tính & cách tính dịch vụ tiện ích
 */

export interface ServiceLike {
  unit?: string;
  category?: string;
  name?: string;
  serviceName?: string;
  billingMethod?: string;
  chargingType?: string;
  unitPrice?: number;
  price?: number;
}

/**
 * Chuẩn hóa đơn vị tính (unit) của dịch vụ tiện ích:
 * - Dịch vụ Điện tính theo công tơ -> đơn vị chuẩn là 'kWh'
 * - Dịch vụ Nước tính theo công tơ -> đơn vị chuẩn là 'm³'
 * - Tránh việc công tơ điện nước bị gán nhầm thành 'Tháng' hoặc 'tháng'
 */
export const resolveServiceUnit = (s?: ServiceLike): string => {
  if (!s) return 'Tháng';

  const cat = String(s.category || '').toUpperCase();
  const name = String(s.serviceName || s.name || '').toLowerCase();
  const method = String(s.billingMethod || s.chargingType || '').toUpperCase();
  const isMeter = method === 'METER_INDEX' || method === 'METER';
  const rawUnit = (s.unit || '').trim();
  const isMonthUnit =
    !rawUnit ||
    rawUnit.toLowerCase() === 'tháng' ||
    rawUnit.toLowerCase() === 'thang' ||
    rawUnit.toLowerCase() === 'tháng/tháng';

  // 1. Điện: công tơ hoặc danh mục ELECTRICITY hoặc tên có chứa "điện"
  if (cat === 'ELECTRICITY' || name.includes('điện') || name.includes('dien')) {
    if (isMeter || isMonthUnit) {
      return 'kWh';
    }
    return rawUnit;
  }

  // 2. Nước: công tơ hoặc danh mục WATER hoặc tên có chứa "nước"
  if (cat === 'WATER' || name.includes('nước') || name.includes('nuoc')) {
    if (isMeter || (isMonthUnit && !method.includes('PERSON') && !method.includes('ROOM'))) {
      return 'm³';
    }
    if (method === 'FIXED_PER_PERSON' || method === 'PER_PERSON') {
      return isMonthUnit ? 'Người/Tháng' : rawUnit;
    }
    if (method === 'FIXED_PER_ROOM' || method === 'PER_ROOM') {
      return isMonthUnit ? 'Phòng/Tháng' : rawUnit;
    }
    return rawUnit;
  }

  // 3. Nếu là phương thức công tơ nhưng đơn vị lại là tháng hoặc rỗng
  if (isMeter && isMonthUnit) {
    return name.includes('nước') || name.includes('nuoc') ? 'm³' : 'kWh';
  }

  // 4. Nếu đơn vị đã có giá trị rõ ràng và không phải bị gán nhầm 'tháng' cho công tơ
  if (rawUnit && !isMonthUnit) {
    return rawUnit;
  }

  // 5. Fallback dựa theo phương thức tính
  if (method === 'FIXED_PER_PERSON' || method === 'PER_PERSON') {
    return 'Người/Tháng';
  }
  if (method === 'FIXED_PER_ROOM' || method === 'PER_ROOM') {
    return 'Phòng/Tháng';
  }
  if (method === 'FIXED_PER_UNIT') {
    return 'Lượt/Tháng';
  }

  return 'Tháng';
};

/**
 * Format chuỗi đơn giá kèm đơn vị tính chuẩn xác (ví dụ: 3.800 đ/kWh, 30.000 đ/m³, 100.000 đ/Phòng/Tháng)
 */
export const formatServicePriceWithUnit = (s?: ServiceLike): string => {
  if (!s) return '0 đ/Tháng';
  const price = Number(s.unitPrice !== undefined ? s.unitPrice : s.price !== undefined ? s.price : 0);
  const unit = resolveServiceUnit(s);
  return `${price.toLocaleString()} đ/${unit}`;
};

/**
 * Lấy thông tin phương thức tính và công thức gợi ý
 */
export const getBillingMethodInfo = (
  method?: string,
  chargingType?: string,
  serviceName?: string,
  category?: string
) => {
  const m = String(method || chargingType || '').toUpperCase();
  const name = String(serviceName || '').toLowerCase();
  const cat = String(category || '').toUpperCase();
  const isElec = cat === 'ELECTRICITY' || name.includes('điện') || name.includes('dien');
  const isWater = cat === 'WATER' || name.includes('nước') || name.includes('nuoc');

  switch (m) {
    case 'METER_INDEX':
    case 'METER':
      return {
        label: 'Tính theo công tơ (đồng hồ)',
        tagColor: 'cyan',
        shortLabel: 'Theo công tơ',
        calculationFormula: isElec
          ? 'Công thức: (Chỉ số mới - Chỉ số cũ) kWh x Đơn giá'
          : isWater
          ? 'Công thức: (Chỉ số mới - Chỉ số cũ) m³ x Đơn giá'
          : 'Công thức: (Chỉ số mới - Chỉ số cũ) x Đơn giá',
      };
    case 'FIXED_PER_PERSON':
    case 'PER_PERSON':
      return {
        label: 'Tính theo số người ở',
        tagColor: 'purple',
        shortLabel: 'Theo người',
        calculationFormula: 'Công thức: Số người ở trong phòng x Đơn giá',
      };
    case 'FIXED_PER_ROOM':
    case 'PER_ROOM':
      return {
        label: 'Cố định theo phòng',
        tagColor: 'blue',
        shortLabel: 'Cố định/phòng',
        calculationFormula: 'Công thức: Số tiền cố định hàng tháng theo phòng',
      };
    case 'FIXED_PER_UNIT':
      return {
        label: 'Theo lượng sử dụng',
        tagColor: 'orange',
        shortLabel: 'Theo lượng',
        calculationFormula: 'Công thức: Số lượng đăng ký sử dụng x Đơn giá',
      };
    default:
      return {
        label: 'Cố định hàng tháng',
        tagColor: 'default',
        shortLabel: 'Cố định',
        calculationFormula: 'Công thức: Số tiền cố định theo kỳ thanh toán',
      };
  }
};

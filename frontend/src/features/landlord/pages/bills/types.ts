export interface DynamicServiceItem {
  key: string;
  contractServiceId?: number | string;
  serviceName: string;
  billingMethod: 'METER_INDEX' | 'FIXED_PER_PERSON' | 'FIXED_PER_ROOM' | 'FIXED_PER_UNIT' | string;
  unit: string;
  unitPrice: number;
  previousIndex?: number;
  currentIndex?: number;
  quantity: number;
  amount: number;
  note?: string;
}

export interface BillAdjustmentItem {
  id: string;
  type: 'SURCHARGE' | 'DISCOUNT'; // SURCHARGE = Phụ thu (+), DISCOUNT = Giảm trừ (-)
  reason: string;
  quantity: number;
  unitCost: number;
  unit: string;
}


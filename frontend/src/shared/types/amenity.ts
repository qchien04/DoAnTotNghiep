export interface Amenity {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAmenityDto {
  name: string;
  description?: string;
}

export interface AmenityFilterParams {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

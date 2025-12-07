// Field filter request DTO matching backend FieldFiltersDto
export interface IFieldFilters {
  searchTerm?: string | null;
  category?: string | null;
  city?: string | null;
  size?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  isApproved?: boolean | null;
}

// Create field request DTO
export interface ICreateField {
  ownerId: number;
  categoryId: number;
  cityId: number;
  name: string;
  location: string;
  locationLink?: string;
  pricePerHour: number;
  size: 'Side_2' | 'Side_5' | 'Side_6' | 'Side_7' | 'Side_11';
  openAt: number;  // 0-23
  closeAt: number; // 0-23
  images: File[];
}

// Update field request DTO
export interface IUpdateField {
  id: number;
  name: string;
  location: string;
  locationLink?: string;
  pricePerHour?: number;
  size?: 'Side_2' | 'Side_5' | 'Side_6' | 'Side_7' | 'Side_11';
  openAt?: number;
  closeAt?: number;
  newImages?: File[];
  deleteImageIds?: number[];
}

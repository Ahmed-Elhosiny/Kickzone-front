import { IFieldImage } from "./ifield-image";

export type SizeEnum = 'Side_2' | 'Side_5' | 'Side_6' | 'Side_7' | 'Side_11';

export interface IField {
  id: number;
  name: string;
  location: string;
  locationLink?: string;
  pricePerHour: number;
  size: SizeEnum;
  openAt: number;
  closeAt: number;
  balance: number;
  isApproved: boolean | null;
  hasApprovalDocument: boolean;
  documentUrl?: string;
  categoryName: string;
  cityName: string;
  ownerName: string;
  ownerUserName: string;
  fieldImages: IFieldImage[];
}


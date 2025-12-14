export interface ICartItem {
  timeSlotId: number;
  fieldId: number;
  price: number;
  slotStart: string;
  fieldName: string;
  isReserved?: boolean;
  isConfirmed?: boolean;
}

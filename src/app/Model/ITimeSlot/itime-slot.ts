import { IReservation } from '../IReservation/ireservation';

export interface ITimeSlot {
  id: number;
  fieldId: number;
  fieldName: string;
  startAtDateTime: string;
  isAvailable: boolean;
  isReserved: boolean;
}

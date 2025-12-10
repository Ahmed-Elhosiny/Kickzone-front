import { IUser } from '../../iuser';
import { ITimeSlot } from '../ITimeSlot/itime-slot';

export interface IReservation {
  id: number;
  userId: number;
  timeSlotId: number;
  paymentId: string;
  amountPaid: number;
  createdAt: string;
  user?: IUser | null;
  timeSlot?: ITimeSlot | null;
}

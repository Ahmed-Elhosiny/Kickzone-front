export enum ReservationStatus {
  Complete = 0,
  Pending = 1,
}

export interface IGetReservationDto {
  id: number;
  userId: number;
  timeSlotId: number;
  reservedAt: string;
  amountPaid: number;
  paymentId?: number;
  fieldName: string;
  slotStart: string;
  userName: string;
  status: ReservationStatus | number | string;
  expiresAt?: string;
}

export interface IReservationsResponse{

reservations: IGetReservationDto[];
totalCount: number;

}
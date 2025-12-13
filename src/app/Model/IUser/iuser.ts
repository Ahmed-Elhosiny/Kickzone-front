import { IField } from '../IField/ifield';
import { IReservation } from '../IReservation/ireservation';

export interface IUser {
  id: number;
  name: string;
  location?: string;
  reservations?: IReservation[];
  ownedFields?: IField[];
}

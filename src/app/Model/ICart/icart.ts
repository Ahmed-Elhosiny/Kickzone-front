import { ICartItem } from '../ICartItem/icart-item';

export interface ICart {
  userId: number;
  items: ICartItem[];
}

import { IField } from './ifield';

export interface IFieldResponse {
  fields: IField[];
  totalCount: number;
  maxPrice: number;
  minPrice: number;
}

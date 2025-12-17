export enum WithdrawalStatus {
  Complete = 0,
  Pending = 1,
  Failed = 2
}

export interface IWithdrawalHistory {
  fieldName: string;
  amount: number;
  createdAt: string;
  status: WithdrawalStatus | number | string;
}

export interface IWithdrawRequest {
  fieldId: number;
  amount: number;
}

export interface IWithdrawalsResponse {
  withDrawHistories: IWithdrawalHistory[];
  totalCount: number;
}

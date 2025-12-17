export interface IloginRequest {
  emailOrUserName: string;
  password: string;
}

export interface IloginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshRequest {
  refreshToken: string;
}

export interface IRefreshResponse {
  token: string;
  expiresAt: string;
  newRefreshToken: string;
  newRefreshExpiresAt: string;
}

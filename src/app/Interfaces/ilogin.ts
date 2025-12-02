export interface IloginRequest {
  emailOrUserName: string;
  password: string;
}

export interface IloginResponse{
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

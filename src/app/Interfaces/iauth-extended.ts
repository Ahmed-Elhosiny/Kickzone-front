// Email verification interfaces
export interface ISendConfirmationRequest {
  email: string;
}

export interface IConfirmEmail {
  UserId: number;
  token: string;
}

// Password management interfaces
export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  email: string;
  token: string;
  newPassword: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

// User profile interfaces
export interface IPatchProfile {
  name?: string;
  location?: string;
  phoneNumber?: string;
}

export interface IChangeUsername {
  newUserName: string;
}

export interface IRequestEmailChange {
  newEmail: string;
}

export interface IConfirmEmailChange {
  userId: number;
  Token: string;
  newEmail: string;
}

export interface IChangeUsername {
  newUserName: string;
}

export interface IRequestEmailChange {
  newEmail: string;
}

// Availability check interface
export interface IAvailabilityCheck {
  email?: string;
  username?: string;
  phone?: string;
}

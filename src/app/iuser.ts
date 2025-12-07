export interface IUser {
  email: string;
  userName: string;
  phoneNumber: string;
  name: string;
  location?: string;
  role: 'User' | 'FieldOwner';
}

export interface IUserProfile {
  id: number;
  email: string;
  userName: string;
  phoneNumber: string;
  name: string;
  location?: string;
  role: 'User' | 'FieldOwner';
  emailConfirmed: boolean;
}

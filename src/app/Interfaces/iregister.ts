// Backend RegisterDto schema
export interface IRegister {
  email: string;
  userName: string;
  phoneNumber: string;
  name: string;
  location?: string;
  role: 'User' | 'FieldOwner';
  password: string;
}

import { IUser } from '../iuser';

// IRegister extends IUser since they have identical fields
// If registration needs additional fields in the future, add them here
export interface IRegister extends IUser {}

import { UserDocument } from '../schemas/user.schema';

export interface IUserRepository {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(createUserDto: any): Promise<UserDocument>;
  update(id: string, updateUserDto: any): Promise<UserDocument | null>;
}

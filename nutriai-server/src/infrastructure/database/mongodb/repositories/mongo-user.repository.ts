import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../../../domain/entities/user.entity';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private mapToEntity(doc: UserDocument | null): UserEntity | null {
    if (!doc) return null;
    return new UserEntity({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      googleId: doc.googleId,
      provider: doc.provider,
      image: doc.image,
      emailVerified: doc.emailVerified,
      age: doc.age,
      gender: doc.gender,
      height: doc.height,
      weight: doc.weight,
      activityLevel: doc.activityLevel,
      bmi: doc.bmi,
      goal: doc.goal,
      dailyCalories: doc.dailyCalories,
      dailyProtein: doc.dailyProtein,
      dailyCarbs: doc.dailyCarbs,
      dailyFat: doc.dailyFat,
      onboardingCompleted: doc.onboardingCompleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userModel.findById(id).exec();
    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return this.mapToEntity(user);
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = new this.userModel(user);
    const saved = await newUser.save();
    return this.mapToEntity(saved)!;
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
    return this.mapToEntity(updated);
  }
}

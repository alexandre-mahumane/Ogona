import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import type { User, UserRole } from './user.types';

export type CreateUserData = {
  name: string;
  phone: string;
  birthDate: Date;
  role: UserRole;
  passwordHash: string;
};

export class UserRepository {
  async findByPhone(phone: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    return user ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async create(data: CreateUserData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        phone: data.phone,
        birthDate: data.birthDate,
        role: data.role,
        passwordHash: data.passwordHash,
      })
      .returning();

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('Failed to update password');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string | null; photoUrl?: string | null },
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('Failed to update profile');
    }

    return user;
  }
}

export const userRepository = new UserRepository();

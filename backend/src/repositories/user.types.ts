import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '../db/schema';

export type User = InferSelectModel<typeof users>;
export type UserRole = User['role'];

export type PublicUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photoUrl: string | null;
  birthDate: string;
  role: UserRole;
  createdAt: string;
};

export function toPublicUser(user: User): PublicUser {
  const birthDate =
    user.birthDate instanceof Date
      ? user.birthDate.toISOString().slice(0, 10)
      : String(user.birthDate);

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    photoUrl: user.photoUrl,
    birthDate,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

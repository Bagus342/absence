import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z
  .object({
    username: z.string().nonempty('Username tidak boleh kosong'),
    password: z.string().min(5, 'Password minimal 5 karakter'),
  })
  .strict();

export const UserSchema = z.object;

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export type CreateUser = z.infer<typeof CreateUserSchema>;

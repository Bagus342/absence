import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignInSchema = z.object({
  username: z.string().nonempty('Username tidak boleh kosong'),
  password: z.string().min(5, 'Password minimal 5 karakter'),
});

export class SignInDto extends createZodDto(SignInSchema) {}
export type SignIn = z.infer<typeof SignInSchema>;

import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }).max(100),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email inválido' }).optional(),
    name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }).max(100).optional(),
    password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }).optional(),
  }),
  params: z.object({
    id: z.string().uuid({ message: 'ID debe ser un UUID válido' }),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'ID debe ser un UUID válido' }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(1, { message: 'Contraseña requerida' }),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema.shape.body>;
export type UpdateUserInput = z.infer<typeof updateUserSchema.shape.body>;
export type GetUserInput = z.infer<typeof getUserSchema.shape.params>;
export type LoginInput = z.infer<typeof loginSchema.shape.body>;

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}
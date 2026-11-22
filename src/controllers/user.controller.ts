import type { Request, Response } from 'express';
import { userService } from '@services/user.service';
import { formatResponse, jwtSign } from '@utils/helpers';
import type { AuthenticatedRequest } from '@middlewares/auth.middleware';
import type { CreateUserInput, UpdateUserInput, GetUserInput, LoginInput, AuthResponse } from '@dtos/user.dto';
import type { SignOptions } from 'jsonwebtoken';
import { getEnvConfig } from '@config/env';
import { UnauthorizedError } from '@utils/errors';

export async function createUser(req: Request<Record<string, unknown>, Record<string, unknown>, CreateUserInput>, res: Response): Promise<void> {
  const user = await userService.create(req.body);
  res.status(201).json(formatResponse(user, 'Usuario creado exitosamente'));
}

export async function getUser(req: Request<GetUserInput>, res: Response): Promise<void> {
  const user = await userService.findById(req.params.id);
  res.json(formatResponse(user));
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
  const result = await userService.findAll({
    page: Number(page),
    limit: Number(limit),
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  });
  res.json(formatResponse(result));
}

export async function updateUser(req: Request<GetUserInput, Record<string, unknown>, UpdateUserInput>, res: Response): Promise<void> {
  const user = await userService.update(req.params.id, req.body);
  res.json(formatResponse(user, 'Usuario actualizado exitosamente'));
}

export async function deleteUser(req: Request<GetUserInput>, res: Response): Promise<void> {
  await userService.delete(req.params.id);
  res.status(204).send();
}

export async function login(req: Request<Record<string, unknown>, Record<string, unknown>, LoginInput>, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnvConfig();
  const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  const token = jwtSign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    signOptions
  );
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

  const authResponse: AuthResponse = {
    user: user.toJSON() as unknown as AuthResponse['user'],
    token,
  };

  res.json(formatResponse(authResponse, 'Login exitoso'));
}

export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError('Usuario no autenticado');
  }

  const user = await userService.findById(req.user.id);
  res.json(formatResponse(user));
}
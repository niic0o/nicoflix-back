import type { Request, Response } from 'express';
import type { SignOptions } from 'jsonwebtoken';
import { userService, toUserResponse } from '@services/user.service';
import { formatResponse, jwtSign } from '@utils/helpers';
import type { AuthenticatedRequest } from '@middlewares/auth.middleware';
import type { CreateUserInput, UpdateUserInput, GetUserInput, LoginInput, AuthResponse } from '@dtos/user.dto';
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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined;
  const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

  const result = await userService.findAll({ page, limit, sortBy, sortOrder });
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
  const userResponse = toUserResponse(user);
  const token = jwtSign(
    { id: userResponse.id, email: userResponse.email, role: userResponse.role },
    JWT_SECRET,
    signOptions
  );

  const authResponse: AuthResponse = {
    user: userResponse,
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

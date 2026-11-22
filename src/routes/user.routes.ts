/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  login,
  getProfile,
} from '@controllers/user.controller';
import { authMiddleware } from '@middlewares/auth.middleware';
import { validate } from '@middlewares/validate.middleware';
import { asyncHandler } from '@utils/helpers';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  loginSchema,
} from '@dtos/user.dto';

const router = Router();

router.post('/auth/login', validate(loginSchema), asyncHandler(login));
router.get('/auth/profile', authMiddleware, asyncHandler(getProfile));

router.post('/users', validate(createUserSchema), asyncHandler(createUser));
router.get('/users', asyncHandler(getUsers));
router.get('/users/:id', validate(getUserSchema), asyncHandler(getUser));
router.patch('/users/:id', validate(updateUserSchema), asyncHandler(updateUser));
router.delete('/users/:id', validate(getUserSchema), asyncHandler(deleteUser));

export default router;
/* eslint-enable @typescript-eslint/no-misused-promises */
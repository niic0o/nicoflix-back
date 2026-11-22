import { User } from '@models/user.model';
import type { UserDocument } from '@models/user.model';
import { NotFoundError, ConflictError } from '@utils/errors';
import type { PaginationQuery } from '@dtos/common.dto';
import { buildPaginatedResponse } from '@dtos/common.dto';
import type { CreateUserInput, UpdateUserInput, UserResponse } from '@dtos/user.dto';

class UserService {
  async create(data: CreateUserInput): Promise<UserResponse> {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    const user = await User.create(data);
    return user.toJSON() as UserResponse;
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return user.toJSON() as UserResponse;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).select('+password') as Promise<UserDocument | null>;
  }

  async findAll(query: PaginationQuery): Promise<{ data: UserResponse[]; pagination: ReturnType<typeof buildPaginatedResponse<UserResponse>>['pagination'] }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    const data = users.map((user) => user.toJSON() as UserResponse);
    return buildPaginatedResponse(data, total, page, limit);
  }

  async update(id: string, data: UpdateUserInput): Promise<UserResponse> {
    if (data.email) {
      const existingUser = await User.findOne({ email: data.email, _id: { $ne: id } });
      if (existingUser) {
        throw new ConflictError('El email ya está en uso');
      }
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return user.toJSON() as UserResponse;
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
  }
}

export const userService = new UserService();
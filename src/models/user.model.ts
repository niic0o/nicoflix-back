import mongoose, { type Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): Omit<IUser, 'password' | 'comparePassword'>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function (this: IUser): Omit<IUser, 'password' | 'comparePassword'> {
  const obj = this.toObject() as Record<string, unknown>;
  delete obj.password;
  return obj as Omit<IUser, 'password' | 'comparePassword'>;
};

export const User = mongoose.model<IUser>('User', userSchema);

export const userZodSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDocument = IUser;
export type UserZod = z.infer<typeof userZodSchema>;
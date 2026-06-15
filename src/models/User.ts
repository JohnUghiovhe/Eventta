import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, AuthProvider } from '../types';

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 6
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
      required: true
    },
    googleId: {
      type: String
    },
    isEmailVerified: {
      type: Boolean,
      default: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true
    },
    profileImage: {
      type: String
    },
    phoneNumber: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
export type { IUser };

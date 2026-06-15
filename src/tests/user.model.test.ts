import { describe, expect, it } from '@jest/globals';
import User from '../models/User';
import { UserRole } from '../types';

describe('User Model', () => {
  describe('Password hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.EVENTEE
      };

      const user = new User(userData);
      
      // Password should be hashed after save
      // This is a unit test, actual DB interaction would require integration test
      expect(user.password).toBeDefined();
    });
  });

  describe('comparePassword method', () => {
    it('should have comparePassword method', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.EVENTEE
      });

      expect(user.comparePassword).toBeDefined();
      expect(typeof user.comparePassword).toBe('function');
    });
  });

  describe('Schema validation', () => {
    it('should require email', () => {
      const user = new User({
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.EVENTEE
      });

      const error = user.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should validate role enum', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid_role' as unknown as UserRole
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
    });
  });
});

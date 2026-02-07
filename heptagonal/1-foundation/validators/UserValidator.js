// User Validator
import { Email } from '../value-objects/Email.js';
import { Username } from '../value-objects/Username.js';

export class UserValidator {
  static validateRegistration(userData) {
    const errors = [];

    // Email
    if (!Email.isValid(userData.email)) {
      errors.push('Invalid email format');
    }

    // Username
    if (!Username.isValid(userData.username)) {
      errors.push('Username must be 3-30 characters, letters/numbers/underscores only');
    }

    // Password
    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (userData.password && userData.password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    // Password strength
    if (userData.password && !this.isStrongPassword(userData.password)) {
      errors.push('Password must contain uppercase, lowercase, number, and special character');
    }

    // First name
    if (userData.firstName && userData.firstName.length > 50) {
      errors.push('First name must not exceed 50 characters');
    }

    // Last name
    if (userData.lastName && userData.lastName.length > 50) {
      errors.push('Last name must not exceed 50 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(userData) {
    const errors = [];

    if (userData.email && !Email.isValid(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.username && !Username.isValid(userData.username)) {
      errors.push('Invalid username format');
    }

    if (userData.bio && userData.bio.length > 500) {
      errors.push('Bio must not exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isStrongPassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  }
}

export default UserValidator;

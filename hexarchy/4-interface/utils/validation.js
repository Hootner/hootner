// Form Validation Utilities

// Validate email
export function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: pattern.test(email),
    error: pattern.test(email) ? null : 'Invalid email address'
  };
}

// Validate username
export function validateUsername(username) {
  if (!username || username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }
  const pattern = /^[a-zA-Z0-9_]+$/;
  if (!pattern.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { isValid: true, error: null };
}

// Validate password
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  return { isValid: true, error: null };
}

// Validate required field
export function validateRequired(value, fieldName) {
  const isValid = !!value && value.toString().trim() !== '';
  return {
    isValid,
    error: isValid ? null : `${fieldName} is required`
  };
}

// Validate min length
export function validateMinLength(value, minLength, fieldName) {
  const isValid = value && value.length >= minLength;
  return {
    isValid,
    error: isValid ? null : `${fieldName} must be at least ${minLength} characters`
  };
}

// Validate max length
export function validateMaxLength(value, maxLength, fieldName) {
  const isValid = !value || value.length <= maxLength;
  return {
    isValid,
    error: isValid ? null : `${fieldName} must be less than ${maxLength} characters`
  };
}

// Validate URL
export function validateURL(url) {
  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Invalid URL' };
  }
}

// Validate file size
export function validateFileSize(file, maxSize) {
  const isValid = file.size <= maxSize;
  return {
    isValid,
    error: isValid ? null : `File size must be less than ${formatFileSize(maxSize)}`
  };
}

// Validate file type
export function validateFileType(file, allowedTypes) {
  const fileExt = '.' + file.name.split('.').pop().toLowerCase();
  const isValid = allowedTypes.includes(fileExt);
  return {
    isValid,
    error: isValid ? null : `File type must be one of: ${allowedTypes.join(', ')}`
  };
}

// Format file size helper
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// Validate form (multiple fields)
export function validateForm(formData, validationRules) {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];

    if (rules.required) {
      const result = validateRequired(value, field);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        continue;
      }
    }

    if (rules.minLength) {
      const result = validateMinLength(value, rules.minLength, field);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        continue;
      }
    }

    if (rules.maxLength) {
      const result = validateMaxLength(value, rules.maxLength, field);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        continue;
      }
    }

    if (rules.pattern && value) {
      const matches = rules.pattern.test(value);
      if (!matches) {
        errors[field] = rules.patternMessage || `Invalid ${field} format`;
        isValid = false;
        continue;
      }
    }

    if (rules.custom) {
      const result = rules.custom(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}

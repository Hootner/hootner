// Username Value Object
export class Username {
  constructor(value) {
    this.value = value;
    this.validate();
  }

  validate() {
    if (!this.value || this.value.length < 3 || this.value.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(this.value)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
  }

  toString() {
    return this.value;
  }

  toLowerCase() {
    return this.value.toLowerCase();
  }

  equals(other) {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  static isValid(username) {
    try {
      new Username(username);
      return true;
    } catch {
      return false;
    }
  }
}

export default Username;

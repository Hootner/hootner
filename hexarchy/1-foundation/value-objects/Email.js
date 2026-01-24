// Email Value Object
export class Email {
  constructor(value) {
    this.value = value;
    this.validate();
  }

  validate() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error('Invalid email format');
    }
  }

  toString() {
    return this.value;
  }

  getDomain() {
    return this.value.split('@')[1];
  }

  getLocalPart() {
    return this.value.split('@')[0];
  }

  equals(other) {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  static isValid(email) {
    try {
      new Email(email);
      return true;
    } catch {
      return false;
    }
  }
}

export default Email;

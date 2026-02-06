// Address Value Object
export class Address {
  constructor({
    street,
    city,
    state,
    postalCode,
    country
  }) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country;
    this.validate();
  }

  validate() {
    if (!this.street || !this.city || !this.country) {
      throw new Error('Street, city, and country are required');
    }

    if (this.country === 'US' && !this.state) {
      throw new Error('State is required for US addresses');
    }
  }

  getFullAddress() {
    const parts = [
      this.street,
      this.city,
      this.state,
      this.postalCode,
      this.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  equals(other) {
    return this.street === other.street &&
           this.city === other.city &&
           this.state === other.state &&
           this.postalCode === other.postalCode &&
           this.country === other.country;
  }

  toJSON() {
    return { ...this };
  }
}

export default Address;

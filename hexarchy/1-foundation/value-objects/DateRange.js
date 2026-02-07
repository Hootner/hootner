// DateRange Value Object
export class DateRange {
  constructor(startDate, endDate) {
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.validate();
  }

  validate() {
    if (this.startDate > this.endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  getDurationInDays() {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }

  getDurationInHours() {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60));
  }

  includes(date) {
    const checkDate = new Date(date);
    return checkDate >= this.startDate && checkDate <= this.endDate;
  }

  overlaps(other) {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  equals(other) {
    return this.startDate.getTime() === other.startDate.getTime() &&
           this.endDate.getTime() === other.endDate.getTime();
  }

  toJSON() {
    return {
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      duration: this.getDurationInDays()
    };
  }
}

export default DateRange;

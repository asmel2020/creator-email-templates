import Big from 'big.js';

Big.DP = 2;
Big.RM = 1;

export class Money {
  private readonly _value: Big;

  constructor(value: Big | number | string) {
    this._value = value instanceof Big ? value : new Big(value);
  }

  static from(value: Big | number | string): Money {
    return new Money(value);
  }

  static zero(): Money {
    return new Money(0);
  }

  get value(): Big {
    return this._value;
  }

  add(other: Money | Big | number | string): Money {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return new Money(this._value.plus(amount));
  }

  subtract(other: Money | Big | number | string): Money {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return new Money(this._value.minus(amount));
  }

  multiply(other: Money | Big | number | string): Money {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return new Money(this._value.times(amount));
  }

  divide(other: Money | Big | number | string): Money {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return new Money(this._value.div(amount));
  }

  toNumber(): number {
    return this._value.toNumber();
  }

  toFixed(dp?: number): string {
    return this._value.toFixed(dp ?? 2);
  }

  toString(): string {
    return this._value.toString();
  }

  toJSON(): string {
    return this.toFixed();
  }

  equals(other: Money): boolean {
    return this._value.eq(other._value);
  }

  gt(other: Money | Big | number | string): boolean {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return this._value.gt(amount);
  }

  gte(other: Money | Big | number | string): boolean {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return this._value.gte(amount);
  }

  lt(other: Money | Big | number | string): boolean {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return this._value.lt(amount);
  }

  lte(other: Money | Big | number | string): boolean {
    const amount = other instanceof Money ? other._value : other instanceof Big ? other : new Big(other);
    return this._value.lte(amount);
  }

  isZero(): boolean {
    return this._value.eq(0);
  }

  abs(): Money {
    return new Money(this._value.abs());
  }

  negated(): Money {
    return new Money(this._value.neg());
  }
}

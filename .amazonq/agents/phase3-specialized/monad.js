// Minimal Monad - Maybe, Either, IO, List
class Maybe {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  static nothing() {
    return new Maybe(null);
  }

  isNothing() {
    return this.value === null || this.value === undefined;
  }

  map(fn) {
    return this.isNothing() ? Maybe.nothing() : Maybe.of(fn(this.value));
  }

  flatMap(fn) {
    return this.isNothing() ? Maybe.nothing() : fn(this.value);
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.value;
  }
}

class Either {
  constructor(value, isRight = true) {
    this.value = value;
    this.isRight = isRight;
  }

  static right(value) {
    return new Either(value, true);
  }

  static left(value) {
    return new Either(value, false);
  }

  map(fn) {
    return this.isRight ? Either.right(fn(this.value)) : this;
  }

  flatMap(fn) {
    return this.isRight ? fn(this.value) : this;
  }

  fold(leftFn, rightFn) {
    return this.isRight ? rightFn(this.value) : leftFn(this.value);
  }
}

class IO {
  constructor(effect) {
    this.effect = effect;
  }

  static of(value) {
    return new IO(() => value);
  }

  map(fn) {
    return new IO(() => fn(this.effect()));
  }

  flatMap(fn) {
    return new IO(() => fn(this.effect()).run());
  }

  run() {
    return this.effect();
  }
}

class List {
  constructor(items) {
    this.items = items;
  }

  static of(...items) {
    return new List(items);
  }

  map(fn) {
    return new List(this.items.map(fn));
  }

  flatMap(fn) {
    return new List(this.items.flatMap(item => fn(item).items));
  }

  filter(pred) {
    return new List(this.items.filter(pred));
  }
}

// Demo
console.log('=== Monad Demo ===\n');

console.log('--- Maybe Monad ---');
const safeDivide = (a, b) => b === 0 ? Maybe.nothing() : Maybe.of(a / b);

const result1 = Maybe.of(10)
  .flatMap(x => safeDivide(x, 2))
  .map(x => x * 3);
console.log('10 / 2 * 3 =', result1.getOrElse('error'));

const result2 = Maybe.of(10)
  .flatMap(x => safeDivide(x, 0))
  .map(x => x * 3);
console.log('10 / 0 * 3 =', result2.getOrElse('error'));

console.log('\n--- Either Monad ---');
const parseNumber = str => {
  const num = parseInt(str);
  return isNaN(num) ? Either.left('Not a number') : Either.right(num);
};

parseNumber('42')
  .map(n => n * 2)
  .fold(
    err => console.log('Error:', err),
    val => console.log('Success:', val)
  );

parseNumber('abc')
  .map(n => n * 2)
  .fold(
    err => console.log('Error:', err),
    val => console.log('Success:', val)
  );

console.log('\n--- IO Monad ---');
const readInput = IO.of('Hello');
const program = readInput
  .map(s => s.toUpperCase())
  .map(s => s + ' WORLD');

console.log('Running IO:', program.run());

console.log('\n--- List Monad ---');
const pairs = List.of(1, 2, 3)
  .flatMap(x => List.of('a', 'b').map(y => [x, y]));
console.log('Cartesian product:', pairs.items);

export { Maybe, Either, IO, List };

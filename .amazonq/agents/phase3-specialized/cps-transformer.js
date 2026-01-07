// Minimal CPS - Continuation Passing Style, Async Control Flow
class CPS {
  static identity(x) {
    return x;
  }

  // Transform direct style to CPS
  static add(a, b, k) {
    k(a + b);
  }

  static multiply(a, b, k) {
    k(a * b);
  }

  static factorial(n, k) {
    if (n === 0) {
      k(1);
    } else {
      CPS.factorial(n - 1, result => {
        CPS.multiply(n, result, k);
      });
    }
  }

  static fibonacci(n, k) {
    if (n <= 1) {
      k(n);
    } else {
      CPS.fibonacci(n - 1, r1 => {
        CPS.fibonacci(n - 2, r2 => {
          CPS.add(r1, r2, k);
        });
      });
    }
  }

  // List operations in CPS
  static map(list, fn, k) {
    if (list.length === 0) {
      k([]);
    } else {
      fn(list[0], first => {
        CPS.map(list.slice(1), fn, rest => {
          k([first, ...rest]);
        });
      });
    }
  }

  static filter(list, pred, k) {
    if (list.length === 0) {
      k([]);
    } else {
      pred(list[0], include => {
        CPS.filter(list.slice(1), pred, rest => {
          k(include ? [list[0], ...rest] : rest);
        });
      });
    }
  }

  // Async simulation
  static async asyncOp(value, delay, k) {
    setTimeout(() => k(value), delay);
  }

  static callCC(fn) {
    let escaped = false;
    let result;

    const escape = value => {
      escaped = true;
      result = value;
    };

    fn(escape, finalResult => {
      if (!escaped) result = finalResult;
    });

    return result;
  }
}

// Demo
console.log('=== Continuation Passing Style Demo ===\n');

console.log('--- Factorial(5) ---');
CPS.factorial(5, result => {
  console.log('Result:', result);
});

console.log('\n--- Fibonacci(7) ---');
CPS.fibonacci(7, result => {
  console.log('Result:', result);
});

console.log('\n--- Map: double each ---');
CPS.map([1, 2, 3, 4], (x, k) => k(x * 2), result => {
  console.log('Result:', result);
});

console.log('\n--- Filter: even numbers ---');
CPS.filter([1, 2, 3, 4, 5, 6], (x, k) => k(x % 2 === 0), result => {
  console.log('Result:', result);
});

console.log('\n--- Async operations ---');
CPS.asyncOp(10, 100, r1 => {
  console.log('First:', r1);
  CPS.asyncOp(20, 100, r2 => {
    console.log('Second:', r2);
    CPS.add(r1, r2, sum => {
      console.log('Sum:', sum);
    });
  });
});

export default CPS;

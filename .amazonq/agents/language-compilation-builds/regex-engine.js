function matchOne(patternChar, textChar) {
  if (!patternChar) return true;
  if (!textChar) return false;
  return patternChar === '.' || patternChar === textChar;
}

function match(pattern, text) {
  if (pattern === '') return true;
  if (pattern === '$' && text === '') return true;
  
  if (pattern[1] === '?') {
    return (
      (matchOne(pattern[0], text[0]) && match(pattern.slice(2), text.slice(1))) ||
      match(pattern.slice(2), text)
    );
  }
  
  if (pattern[1] === '*') {
    return (
      (matchOne(pattern[0], text[0]) && match(pattern, text.slice(1))) ||
      match(pattern.slice(2), text)
    );
  }
  
  return matchOne(pattern[0], text[0]) && match(pattern.slice(1), text.slice(1));
}

// Tests
console.log(match('a*b', 'aaab'));      // true
console.log(match('a?b', 'ab'));        // true
console.log(match('a?b', 'b'));         // true
console.log(match('a.c', 'abc'));       // true
console.log(match('a*b', 'b'));         // true
console.log(match('a*b', 'aaa'));       // false

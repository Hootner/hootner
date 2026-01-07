# LLVM IR Compilation Workflow

## Quick Start

### Generate LLVM IR
```bash
node compiler-llvm.js > output.ll
```

### Compile to Executable

**Option 1: Manual (requires LLVM + GCC)**
```bash
llc output.ll -o output.s
gcc output.s -o program
./program
echo $?  # Exit code = result
```

**Option 2: Automated Script**
```bash
node compile-llvm.js "(add 2 3)" myprogram
```

**Option 3: Windows Batch**
```cmd
compile-llvm.bat "(mul (add 2 3) 4)" calculator
```

## Example LLVM IR

Input: `(add 2 3)`

Output:
```llvm
define i32 @main() {
  %0 = add i32 0, 2
  %1 = add i32 0, 3
  %2 = add i32 %0, %1
  ret i32 %2
}
```

## Install LLVM Toolchain

**macOS:**
```bash
brew install llvm
export PATH="/usr/local/opt/llvm/bin:$PATH"
```

**Linux:**
```bash
sudo apt install llvm clang
```

**Windows:**
Download from https://releases.llvm.org/

## Test Example

```bash
llc example.ll -o example.s
gcc example.s -o test
./test
echo $?  # Should output: 5
```

## Supported Operations

- `add` - Addition
- `sub` - Subtraction
- `mul` - Multiplication
- `div` - Division (sdiv)

## Next Steps

- Add function calls
- Implement control flow (if/while)
- Add memory operations (alloca/load/store)
- Optimize with `opt` tool

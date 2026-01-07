# LLVM Toolchain Installation

## Status
✓ LLVM IR generated: `add.ll`, `mul.ll`
✗ LLVM toolchain not installed

## Install LLVM

### Windows
1. Download from: https://github.com/llvm/llvm-project/releases
2. Install LLVM-17.0.6-win64.exe (or latest)
3. Add to PATH: `C:\Program Files\LLVM\bin`
4. Verify: `llc --version`

### Quick Install (Chocolatey)
```cmd
choco install llvm
```

### Alternative: Use Online Compiler
https://godbolt.org/ - Paste LLVM IR and compile

## Test After Install

```bash
# Compile add.ll
llc add.ll -o add.s
gcc add.s -o add.exe
add.exe
echo %ERRORLEVEL%  # Should be 5

# Compile mul.ll
llc mul.ll -o mul.s
gcc mul.s -o mul.exe
mul.exe
echo %ERRORLEVEL%  # Should be 20
```

## Files Ready
- `add.ll` - (2 + 3) = 5
- `mul.ll` - (2 + 3) * 4 = 20
- `example.ll` - Same as add.ll

## Next Steps
1. Install LLVM from link above
2. Run: `llc add.ll -o add.s`
3. Run: `gcc add.s -o add.exe`
4. Run: `add.exe && echo %ERRORLEVEL%`

@echo off
REM Compile LLVM IR to executable

if "%1"=="" (
    echo Usage: compile-llvm.bat "^(add 2 3^)" [output-name]
    exit /b 1
)

set INPUT=%~1
set OUTPUT=%2
if "%OUTPUT%"=="" set OUTPUT=program

echo Generating LLVM IR...
node .amazonq\agents\language-compilation-builds\compiler-llvm.js "%INPUT%" > output.ll

echo Compiling to assembly...
llc output.ll -o output.s
if errorlevel 1 (
    echo Error: LLVM not found. Install from https://releases.llvm.org/
    exit /b 1
)

echo Linking executable...
gcc output.s -o %OUTPUT%.exe
if errorlevel 1 (
    echo Error: GCC not found. Install MinGW or use clang
    exit /b 1
)

echo.
echo Success! Created %OUTPUT%.exe
%OUTPUT%.exe

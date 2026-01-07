define i32 @main() {
  %0 = add i32 0, 2
  %1 = add i32 0, 3
  %2 = add i32 %0, %1
  ret i32 %2
}


---

define i32 @main() {
  %0 = add i32 0, 2
  %1 = add i32 0, 3
  %2 = add i32 %0, %1
  %3 = add i32 0, 4
  %4 = mul i32 %2, %3
  ret i32 %4
}


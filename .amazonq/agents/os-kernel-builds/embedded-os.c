// Minimal Embedded OS
#include <stdio.h>

#define MAX_TASKS 4

typedef struct {
  int id;
  int active;
  void (*fn)();
} Task;

Task tasks[MAX_TASKS];
int task_count = 0;

void add_task(void (*fn)()) {
  tasks[task_count].id = task_count;
  tasks[task_count].active = 1;
  tasks[task_count].fn = fn;
  task_count++;
}

void scheduler() {
  for (int i = 0; i < task_count; i++) {
    if (tasks[i].active) tasks[i].fn();
  }
}

void task1() { printf("Task1\n"); }
void task2() { printf("Task2\n"); }

int main() {
  add_task(task1);
  add_task(task2);
  for (int i = 0; i < 3; i++) scheduler();
  return 0;
}

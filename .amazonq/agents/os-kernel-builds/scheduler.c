#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int pid;
    int burst_time;
    int remaining_time;
} Process;

void round_robin(Process* procs, int n, int quantum) {
    int time = 0;
    int done = 0;
    
    while (done < n) {
        for (int i = 0; i < n; i++) {
            if (procs[i].remaining_time > 0) {
                int exec = (procs[i].remaining_time > quantum) ? quantum : procs[i].remaining_time;
                procs[i].remaining_time -= exec;
                time += exec;
                
                printf("Time %d: Process %d executed for %d\n", time, procs[i].pid, exec);
                
                if (procs[i].remaining_time == 0) {
                    done++;
                    printf("Process %d completed at time %d\n", procs[i].pid, time);
                }
            }
        }
    }
}

int main() {
    Process procs[] = {
        {1, 10, 10},
        {2, 5, 5},
        {3, 8, 8}
    };
    
    round_robin(procs, 3, 4);
    return 0;
}

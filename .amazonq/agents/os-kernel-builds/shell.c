#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

#define MAX_INPUT 1024
#define MAX_ARGS 64

void parse_input(char* input, char** args) {
    int i = 0;
    args[i] = strtok(input, " \t\n");
    while (args[i] != NULL && i < MAX_ARGS - 1) {
        args[++i] = strtok(NULL, " \t\n");
    }
    args[i] = NULL;
}

int main() {
    char input[MAX_INPUT];
    char* args[MAX_ARGS];
    
    while (1) {
        printf("$ ");
        fflush(stdout);
        
        if (!fgets(input, MAX_INPUT, stdin)) break;
        
        parse_input(input, args);
        if (!args[0]) continue;
        
        if (strcmp(args[0], "exit") == 0) break;
        
        pid_t pid = fork();
        if (pid == 0) {
            execvp(args[0], args);
            printf("Command not found: %s\n", args[0]);
            exit(1);
        } else if (pid > 0) {
            wait(NULL);
        }
    }
    
    return 0;
}

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define MAX_FILES 16
#define MAX_NAME 32
#define MAX_SIZE 256

typedef struct {
    char name[MAX_NAME];
    char data[MAX_SIZE];
    int size;
    int used;
} File;

File filesystem[MAX_FILES];

void fs_init() {
    for (int i = 0; i < MAX_FILES; i++) {
        filesystem[i].used = 0;
    }
}

int fs_create(const char* name) {
    for (int i = 0; i < MAX_FILES; i++) {
        if (!filesystem[i].used) {
            strncpy(filesystem[i].name, name, MAX_NAME - 1);
            filesystem[i].size = 0;
            filesystem[i].used = 1;
            return i;
        }
    }
    return -1;
}

int fs_write(int fd, const char* data, int len) {
    if (fd < 0 || fd >= MAX_FILES || !filesystem[fd].used) return -1;
    if (len > MAX_SIZE) len = MAX_SIZE;
    memcpy(filesystem[fd].data, data, len);
    filesystem[fd].size = len;
    return len;
}

int fs_read(int fd, char* buf, int len) {
    if (fd < 0 || fd >= MAX_FILES || !filesystem[fd].used) return -1;
    int read_len = (len < filesystem[fd].size) ? len : filesystem[fd].size;
    memcpy(buf, filesystem[fd].data, read_len);
    return read_len;
}

void fs_list() {
    printf("Files:\n");
    for (int i = 0; i < MAX_FILES; i++) {
        if (filesystem[i].used) {
            printf("  %s (%d bytes)\n", filesystem[i].name, filesystem[i].size);
        }
    }
}

int main() {
    fs_init();
    
    int fd = fs_create("test.txt");
    fs_write(fd, "Hello filesystem!", 17);
    
    char buf[MAX_SIZE];
    int len = fs_read(fd, buf, MAX_SIZE);
    buf[len] = '\0';
    printf("Read: %s\n", buf);
    
    fs_list();
    return 0;
}

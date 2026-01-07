#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 100

typedef struct Entry {
    char* key;
    char* value;
    struct Entry* next;
} Entry;

Entry* table[TABLE_SIZE];

unsigned int hash(const char* key) {
    unsigned int h = 0;
    while (*key) h = h * 31 + *key++;
    return h % TABLE_SIZE;
}

void put(const char* key, const char* value) {
    unsigned int index = hash(key);
    Entry* entry = table[index];
    
    while (entry) {
        if (strcmp(entry->key, key) == 0) {
            free(entry->value);
            entry->value = strdup(value);
            return;
        }
        entry = entry->next;
    }
    
    Entry* new_entry = malloc(sizeof(Entry));
    new_entry->key = strdup(key);
    new_entry->value = strdup(value);
    new_entry->next = table[index];
    table[index] = new_entry;
}

char* get(const char* key) {
    unsigned int index = hash(key);
    Entry* entry = table[index];
    
    while (entry) {
        if (strcmp(entry->key, key) == 0) {
            return entry->value;
        }
        entry = entry->next;
    }
    return NULL;
}

int main() {
    put("name", "Alice");
    put("age", "30");
    
    printf("name: %s\n", get("name"));
    printf("age: %s\n", get("age"));
    
    return 0;
}

#include <stdio.h>
#include <stdlib.h>

typedef enum { OBJ_INT, OBJ_PAIR } ObjectType;

typedef struct sObject {
    unsigned char marked;
    ObjectType type;
    struct sObject* next;
    union {
        int value;
        struct {
            struct sObject* head;
            struct sObject* tail;
        };
    };
} Object;

typedef struct {
    Object* firstObject;
    int numObjects;
    int maxObjects;
} VM;

void mark(Object* object) {
    if (!object || object->marked) return;
    object->marked = 1;
    if (object->type == OBJ_PAIR) {
        mark(object->head);
        mark(object->tail);
    }
}

void sweep(VM* vm) {
    Object** object = &vm->firstObject;
    while (*object) {
        if (!(*object)->marked) {
            Object* unreached = *object;
            *object = unreached->next;
            free(unreached);
            vm->numObjects--;
        } else {
            (*object)->marked = 0;
            object = &(*object)->next;
        }
    }
}

void gc(VM* vm) {
    mark(vm->firstObject);
    sweep(vm);
    vm->maxObjects = vm->numObjects * 2;
}

Object* newObject(VM* vm, ObjectType type) {
    if (vm->numObjects >= vm->maxObjects) gc(vm);
    Object* obj = malloc(sizeof(Object));
    obj->type = type;
    obj->marked = 0;
    obj->next = vm->firstObject;
    vm->firstObject = obj;
    vm->numObjects++;
    return obj;
}

int main() {
    VM vm = {NULL, 0, 8};
    Object* a = newObject(&vm, OBJ_INT);
    a->value = 42;
    printf("Created object, count: %d\n", vm.numObjects);
    gc(&vm);
    printf("After GC, count: %d\n", vm.numObjects);
    return 0;
}

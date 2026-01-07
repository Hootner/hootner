// Minimal Microkernel
#include <stdio.h>
#include <string.h>

#define MAX_SERVICES 10

typedef struct {
  int id;
  char name[32];
  void (*handler)(char*);
} Service;

Service services[MAX_SERVICES];
int service_count = 0;

int register_service(const char* name, void (*handler)(char*)) {
  if (service_count >= MAX_SERVICES) return -1;
  services[service_count].id = service_count;
  strcpy(services[service_count].name, name);
  services[service_count].handler = handler;
  return service_count++;
}

void send_message(int service_id, char* msg) {
  if (service_id < 0 || service_id >= service_count) return;
  services[service_id].handler(msg);
}

void fs_handler(char* msg) { printf("[FS] %s\n", msg); }
void net_handler(char* msg) { printf("[NET] %s\n", msg); }

int main() {
  int fs = register_service("filesystem", fs_handler);
  int net = register_service("network", net_handler);
  send_message(fs, "read /etc/passwd");
  send_message(net, "GET http://example.com");
  return 0;
}

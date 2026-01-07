#include <cstdint>
#include <cstring>
#include <fstream>

class Chip8 {
public:
    uint8_t registers[16]{};
    uint8_t memory[4096]{};
    uint16_t index{};
    uint16_t pc{0x200};
    uint16_t stack[16]{};
    uint8_t sp{};
    uint8_t delayTimer{};
    uint8_t soundTimer{};
    uint8_t keypad[16]{};
    uint32_t video[64 * 32]{};
    uint16_t opcode;

    void LoadROM(const char* filename) {
        std::ifstream file(filename, std::ios::binary);
        file.read((char*)&memory[0x200], 4096 - 0x200);
    }

    void Cycle() {
        opcode = (memory[pc] << 8) | memory[pc + 1];
        pc += 2;
        
        switch (opcode & 0xF000) {
            case 0x0000: if (opcode == 0x00E0) memset(video, 0, sizeof(video)); break;
            case 0x1000: pc = opcode & 0x0FFF; break;
            case 0x6000: registers[(opcode & 0x0F00) >> 8] = opcode & 0x00FF; break;
            case 0x7000: registers[(opcode & 0x0F00) >> 8] += opcode & 0x00FF; break;
            case 0xA000: index = opcode & 0x0FFF; break;
        }
        
        if (delayTimer > 0) --delayTimer;
        if (soundTimer > 0) --soundTimer;
    }
};

int main() {
    Chip8 chip8;
    chip8.LoadROM("test.ch8");
    for (int i = 0; i < 100; ++i) chip8.Cycle();
    return 0;
}

"""Example Usage"""
from generator import VideoGenerator

def main():
    gen = VideoGenerator()
    result = gen.create_video("sample prompt")
    print(f"Result: {result}")

if __name__ == '__main__':
    main()
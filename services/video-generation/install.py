"""Installation Script"""
import subprocess
import sys

def install_requirements():
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask"])
        print("Installation complete")
    except Exception as e:
        print(f"Installation failed: {e}")

if __name__ == '__main__':
    install_requirements()
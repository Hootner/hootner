#!/usr/bin/env python3
import json
import os
import shutil

class PackageManager:
    def __init__(self, registry_file='packages.json'):
        self.registry_file = registry_file
        self.installed_dir = 'installed_packages'
        self.registry = self.load_registry()
        os.makedirs(self.installed_dir, exist_ok=True)
    
    def load_registry(self):
        if os.path.exists(self.registry_file):
            with open(self.registry_file) as f:
                return json.load(f)
        return {}
    
    def save_registry(self):
        with open(self.registry_file, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def install(self, package_name, version='latest'):
        print(f"Installing {package_name}@{version}...")
        
        package_dir = os.path.join(self.installed_dir, package_name)
        os.makedirs(package_dir, exist_ok=True)
        
        self.registry[package_name] = {
            'version': version,
            'installed': True,
            'path': package_dir
        }
        
        self.save_registry()
        print(f"✓ Installed {package_name}@{version}")
    
    def uninstall(self, package_name):
        if package_name not in self.registry:
            print(f"Package {package_name} not found")
            return
        
        package_dir = self.registry[package_name]['path']
        if os.path.exists(package_dir):
            shutil.rmtree(package_dir)
        
        del self.registry[package_name]
        self.save_registry()
        print(f"✓ Uninstalled {package_name}")
    
    def list_packages(self):
        if not self.registry:
            print("No packages installed")
            return
        
        print("Installed packages:")
        for name, info in self.registry.items():
            print(f"  {name}@{info['version']}")

# Test
pm = PackageManager()
pm.install('express', '4.18.0')
pm.install('react', '18.2.0')
pm.list_packages()
pm.uninstall('express')
pm.list_packages()

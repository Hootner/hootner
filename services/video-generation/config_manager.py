"""
Configuration Management System
Load and validate configuration from YAML files

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import yaml
import os
from typing import Any, Dict, Optional
from pathlib import Path
import re


class ConfigurationError(Exception):
    """Configuration validation error"""
    pass


class Config:
    """
    Configuration manager with environment-specific settings
    
    Features:
    - YAML configuration files
    - Environment variable substitution
    - Configuration validation
    - Default values
    - Nested configuration access
    """
    
    def __init__(
        self,
        config_dir: str = "./config",
        environment: Optional[str] = None
    ):
        self.config_dir = Path(config_dir)
        self.environment = environment or os.getenv("ENVIRONMENT", "development")
        
        # Load configuration
        self.config = self._load_config()
        
        # Validate configuration
        self._validate()
    
    def _load_config(self) -> dict:
        """Load configuration from YAML file"""
        config_file = self.config_dir / f"{self.environment}.yaml"
        
        if not config_file.exists():
            raise ConfigurationError(
                f"Configuration file not found: {config_file}\n"
                f"Available environments: {self._list_environments()}"
            )
        
        with open(config_file, 'r') as f:
            config = yaml.safe_load(f)
        
        # Substitute environment variables
        config = self._substitute_env_vars(config)
        
        return config
    
    def _substitute_env_vars(self, obj: Any) -> Any:
        """Recursively substitute environment variables in config"""
        if isinstance(obj, dict):
            return {k: self._substitute_env_vars(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._substitute_env_vars(item) for item in obj]
        elif isinstance(obj, str):
            # Match ${VAR_NAME} or $VAR_NAME
            pattern = r'\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)'
            
            def replacer(match):
                var_name = match.group(1) or match.group(2)
                value = os.getenv(var_name)
                
                if value is None:
                    raise ConfigurationError(
                        f"Environment variable not set: {var_name}"
                    )
                
                return value
            
            return re.sub(pattern, replacer, obj)
        else:
            return obj
    
    def _list_environments(self) -> list:
        """List available environment configurations"""
        if not self.config_dir.exists():
            return []
        
        return [
            f.stem for f in self.config_dir.glob("*.yaml")
        ]
    
    def _validate(self):
        """Validate configuration"""
        required_sections = [
            'server',
            'model',
            'sampler',
            'generation',
            'api',
            'monitoring',
            'storage'
        ]
        
        for section in required_sections:
            if section not in self.config:
                raise ConfigurationError(
                    f"Required configuration section missing: {section}"
                )
        
        # Validate specific fields
        self._validate_server()
        self._validate_model()
        self._validate_generation()
    
    def _validate_server(self):
        """Validate server configuration"""
        server = self.config['server']
        
        if not isinstance(server.get('port'), int):
            raise ConfigurationError("server.port must be an integer")
        
        if not 1 <= server['port'] <= 65535:
            raise ConfigurationError("server.port must be between 1 and 65535")
        
        if server.get('workers', 1) < 1:
            raise ConfigurationError("server.workers must be >= 1")
    
    def _validate_model(self):
        """Validate model configuration"""
        model = self.config['model']
        
        valid_sizes = ['small', 'base', 'large']
        if model.get('size') not in valid_sizes:
            raise ConfigurationError(
                f"model.size must be one of: {valid_sizes}"
            )
        
        valid_devices = ['cpu', 'cuda', 'mps']
        if model.get('device') not in valid_devices:
            raise ConfigurationError(
                f"model.device must be one of: {valid_devices}"
            )
    
    def _validate_generation(self):
        """Validate generation configuration"""
        gen = self.config['generation']
        
        if gen['default_num_frames'] > gen['max_num_frames']:
            raise ConfigurationError(
                "generation.default_num_frames cannot exceed max_num_frames"
            )
        
        if gen['default_height'] > gen['max_height']:
            raise ConfigurationError(
                "generation.default_height cannot exceed max_height"
            )
        
        if gen['default_width'] > gen['max_width']:
            raise ConfigurationError(
                "generation.default_width cannot exceed max_width"
            )
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value using dot notation
        
        Example:
            config.get('server.port')
            config.get('model.size')
        """
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """
        Set configuration value using dot notation
        
        Example:
            config.set('server.debug', False)
        """
        keys = key.split('.')
        obj = self.config
        
        for k in keys[:-1]:
            if k not in obj:
                obj[k] = {}
            obj = obj[k]
        
        obj[keys[-1]] = value
    
    def to_dict(self) -> dict:
        """Get configuration as dictionary"""
        return dict(self.config)
    
    def save(self, filepath: Optional[str] = None):
        """Save configuration to file"""
        if filepath is None:
            filepath = self.config_dir / f"{self.environment}.yaml"
        
        with open(filepath, 'w') as f:
            yaml.dump(self.config, f, default_flow_style=False)
    
    def __getitem__(self, key: str) -> Any:
        """Allow dictionary-style access"""
        return self.get(key)
    
    def __setitem__(self, key: str, value: Any):
        """Allow dictionary-style setting"""
        self.set(key, value)


# ============================================================================
# Configuration Factory
# ============================================================================

def load_config(
    config_dir: str = "./config",
    environment: Optional[str] = None
) -> Config:
    """
    Factory function to load configuration
    
    Args:
        config_dir: Directory containing config files
        environment: Environment name (defaults to ENVIRONMENT env var)
    
    Returns:
        Config instance
    """
    return Config(config_dir=config_dir, environment=environment)


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    # Load configuration
    config = load_config()
    
    print(f"Environment: {config.environment}")
    print(f"Server port: {config.get('server.port')}")
    print(f"Model size: {config.get('model.size')}")
    print(f"Device: {config.get('model.device')}")
    print(f"Debug mode: {config.get('server.debug')}")
    
    # Access nested values
    print(f"\nGeneration defaults:")
    print(f"  Frames: {config.get('generation.default_num_frames')}")
    print(f"  Resolution: {config.get('generation.default_height')}x{config.get('generation.default_width')}")
    print(f"  FPS: {config.get('generation.default_fps')}")
    
    # Print full configuration
    print(f"\nFull configuration:")
    import json
    print(json.dumps(config.to_dict(), indent=2))

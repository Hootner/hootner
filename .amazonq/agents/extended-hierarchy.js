// Extended Hierarchy - Complete System with Missing Layers

export const EXTENDED_HIERARCHY = {
  // Layer 0: Mathematical Foundations (NEW - Below hardware)
  layer0: {
    name: 'Mathematical Foundations',
    templates: [
      'Boolean Algebra Engine',
      'Logic Gate Simulator',
      'Binary Arithmetic Unit',
      'Finite State Machine',
      'Turing Machine Simulator',
      'Lambda Calculus Interpreter',
      'Type System',
      'Proof Assistant'
    ]
  },

  // Layer 1: Foundational Builds
  layer1: {
    name: 'Foundational Builds',
    templates: [
      'CPU Emulator',
      'Assembler',
      'Linker',
      'Disassembler',
      'Debugger',
      'Instruction Set Simulator', // NEW
      'Register Allocator', // NEW
      'Pipeline Simulator' // NEW
    ]
  },

  // Layer 2: Language & Compilation
  layer2: {
    name: 'Language & Compilation',
    templates: [
      'Lexer', // NEW
      'Parser', // NEW
      'AST Builder', // NEW
      'Compiler',
      'Interpreter',
      'JIT Compiler',
      'Optimizer',
      'Garbage Collector',
      'Regex Engine',
      'Type Checker', // NEW
      'Code Generator' // NEW
    ]
  },

  // Layer 3: OS & Kernel
  layer3: {
    name: 'OS & Kernel',
    templates: [
      'Bootloader',
      'Kernel',
      'Scheduler',
      'Memory Manager',
      'Memory Allocator',
      'Filesystem',
      'Shell',
      'Microkernel',
      'Device Driver', // NEW
      'Interrupt Handler', // NEW
      'System Call Interface' // NEW
    ]
  },

  // Layer 4: Virtualization & Runtime
  layer4: {
    name: 'Virtualization & Runtime',
    templates: [
      'Virtual Machine',
      'Hypervisor',
      'Container',
      'Container Orchestrator',
      'Runtime',
      'Sandbox',
      'Process Isolation', // NEW
      'Resource Limiter', // NEW
      'Namespace Manager' // NEW
    ]
  },

  // Layer 5: Networking & Communication
  layer5: {
    name: 'Networking & Communication',
    templates: [
      'Network Protocol',
      'TCP/IP Stack',
      'HTTP Server',
      'WebSocket Server',
      'DNS Server',
      'Router',
      'Firewall',
      'Load Balancer',
      'API Gateway',
      'Reverse Proxy',
      'Pub/Sub',
      'IoT Protocol',
      'RPC Framework', // NEW
      'Service Discovery', // NEW
      'Circuit Breaker' // NEW
    ]
  },

  // Layer 6: Data Storage & Management
  layer6: {
    name: 'Data Storage & Management',
    templates: [
      'Hash Table',
      'B-Tree',
      'LSM Tree', // NEW
      'Skip List', // NEW
      'Bloom Filter',
      'Trie',
      'Database',
      'Key-Value Store',
      'NoSQL DB',
      'Graph Database',
      'Time-Series DB',
      'Vector DB',
      'Cache System',
      'Embedded DB',
      'Distributed FS',
      'ORM',
      'Query Optimizer', // NEW
      'Transaction Manager', // NEW
      'Replication System' // NEW
    ]
  },

  // Layer 7: Web & Application Servers
  layer7: {
    name: 'Web & Application Servers',
    templates: [
      'Web Server',
      'Web Framework',
      'Template Engine',
      'Static Site Generator',
      'Auth Server',
      'Email Server',
      'Password Manager',
      'Session Manager',
      'Task Queue',
      'Rate Limiter',
      'CORS Handler', // NEW
      'GraphQL Server', // NEW
      'REST API Framework' // NEW
    ]
  },

  // Layer 8: Browser & UI
  layer8: {
    name: 'Browser & UI',
    templates: [
      'HTML Parser',
      'CSS Parser',
      'JS Engine',
      'DOM',
      'Virtual DOM',
      'Browser',
      'Render Engine',
      'Layout Engine', // NEW
      'GUI Toolkit',
      'Window Manager',
      'Text Editor',
      'IDE',
      'Component Framework',
      'State Manager', // NEW
      'Event System' // NEW
    ]
  },

  // Layer 9: Games, Graphics & Media
  layer9: {
    name: 'Games, Graphics & Media',
    templates: [
      'Rasterizer',
      '3D Renderer',
      'Ray Tracer',
      'Physics Engine',
      'Collision Detection', // NEW
      'Particle System', // NEW
      'Audio Engine',
      'Audio Synth',
      'Game Engine',
      'Voxel Engine',
      'AR/VR Engine',
      'Visual Recognition',
      'Image Processor',
      'Video Codec',
      'Animation System', // NEW
      'Shader Compiler' // NEW
    ]
  },

  // Layer 10: Development Tools
  layer10: {
    name: 'Development Tools',
    templates: [
      'Package Manager',
      'Version Control',
      'Build Tool',
      'CI/CD Pipeline',
      'Test Runner',
      'Code Formatter',
      'Static Analyzer',
      'Linter', // NEW
      'Profiler',
      'Debugger Protocol', // NEW
      'Monitoring System',
      'Logging Framework',
      'CLI Tool',
      'Documentation Generator', // NEW
      'Dependency Resolver' // NEW
    ]
  },

  // Layer 11: Advanced & Specialized
  layer11: {
    name: 'Advanced & Specialized',
    templates: [
      'Blockchain',
      'Consensus Algorithm',
      'Smart Contract Platform',
      'Cryptocurrency',
      'Zero-Knowledge Proof',
      'Encryption',
      'Neural Network',
      'ML Framework',
      'Recommendation Engine',
      'Search Engine',
      'Actor Model',
      'BitTorrent',
      'Bot',
      'Decentralized Storage',
      'Quantum Simulator',
      'Distributed Tracing', // NEW
      'Event Sourcing', // NEW
      'CQRS Framework' // NEW
    ]
  },

  // Layer 12: Platform & Orchestration (NEW)
  layer12: {
    name: 'Platform & Orchestration',
    templates: [
      'Service Mesh',
      'API Gateway Platform',
      'Microservices Framework',
      'Event Bus',
      'Workflow Engine',
      'Scheduler Platform',
      'Multi-Tenant System',
      'Feature Flag System',
      'A/B Testing Framework',
      'Deployment Pipeline'
    ]
  },

  // Layer 13: AI & ML Infrastructure (NEW)
  layer13: {
    name: 'AI & ML Infrastructure',
    templates: [
      'Model Registry',
      'Feature Store',
      'Training Pipeline',
      'Inference Server',
      'AutoML System',
      'Hyperparameter Tuner',
      'Model Versioning',
      'ML Monitoring',
      'Data Pipeline',
      'Vector Search Engine'
    ]
  },

  // Layer 14: Security & Identity (NEW)
  layer14: {
    name: 'Security & Identity',
    templates: [
      'Identity Provider',
      'OAuth2 Server',
      'JWT Handler',
      'Certificate Authority',
      'Secret Manager',
      'Encryption Service',
      'Audit Logger',
      'Threat Detector',
      'WAF (Web Application Firewall)',
      'DDoS Protection'
    ]
  },

  // Layer 15: Observability & Operations (NEW)
  layer15: {
    name: 'Observability & Operations',
    templates: [
      'Metrics Collector',
      'Log Aggregator',
      'Trace Collector',
      'Alert Manager',
      'Dashboard Builder',
      'Incident Manager',
      'Chaos Engineering Platform',
      'SLO/SLA Tracker',
      'Cost Optimizer',
      'Capacity Planner'
    ]
  }
};

// Modalities - Different ways to interact with the system
export const MODALITIES = {
  // Text-based interaction
  text: {
    name: 'Text Modality',
    templates: [
      'CLI Interface',
      'REPL',
      'Text Parser',
      'Natural Language Processor',
      'Command Interpreter',
      'Text-to-Code',
      'Code-to-Text',
      'Documentation Generator'
    ]
  },

  // Visual interaction
  visual: {
    name: 'Visual Modality',
    templates: [
      'GUI Builder',
      'Visual Programming',
      'Diagram Generator',
      'Code Visualizer',
      'Data Visualizer',
      'Graph Renderer',
      'Flow Chart Builder',
      'Mind Map Tool'
    ]
  },

  // Audio interaction
  audio: {
    name: 'Audio Modality',
    templates: [
      'Speech-to-Text',
      'Text-to-Speech',
      'Voice Commands',
      'Audio Analyzer',
      'Sound Synthesizer',
      'Music Generator',
      'Audio Effects',
      'Voice Recognition'
    ]
  },

  // Gesture/Touch interaction
  gesture: {
    name: 'Gesture Modality',
    templates: [
      'Touch Handler',
      'Gesture Recognizer',
      'Multi-touch System',
      'Haptic Feedback',
      'Motion Tracker',
      'Eye Tracker',
      'Hand Tracking',
      'Body Pose Estimator'
    ]
  },

  // Network/API interaction
  network: {
    name: 'Network Modality',
    templates: [
      'REST Client',
      'GraphQL Client',
      'WebSocket Client',
      'gRPC Client',
      'Message Queue Client',
      'Event Stream Handler',
      'Webhook Manager',
      'API Aggregator'
    ]
  },

  // File/Data interaction
  data: {
    name: 'Data Modality',
    templates: [
      'File Watcher',
      'Stream Processor',
      'Batch Processor',
      'ETL Pipeline',
      'Data Transformer',
      'Schema Validator',
      'Data Migration Tool',
      'Import/Export System'
    ]
  }
};

// Depth levels for each template
export const DEPTH_LEVELS = {
  minimal: 'Basic working implementation (~50 lines)',
  standard: 'Production-ready features (~200 lines)',
  advanced: 'Optimized with edge cases (~500 lines)',
  expert: 'Full-featured enterprise (~1000+ lines)'
};

export default { EXTENDED_HIERARCHY, MODALITIES, DEPTH_LEVELS };

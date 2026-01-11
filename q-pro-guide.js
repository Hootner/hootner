#!/usr/bin/env node

/**
 * Q Pro Guide - Amazon Q Developer Pro usage guide for HOOTNER
 */

const guides = {
  chat: {
    desc: 'Chat with Q about code, architecture, debugging',
    commands: [
      '@workspace - Include workspace context',
      '@file - Include specific file',
      '@folder - Include folder context',
      '/dev - Development agent',
      '/test - Testing agent',
      '/review - Code review agent'
    ]
  },
  
  inline: {
    desc: 'Inline code completions and suggestions',
    shortcuts: [
      'Alt+C / Option+C - Manual trigger',
      'Tab - Accept suggestion',
      'Esc - Dismiss suggestion'
    ]
  },

  agents: {
    desc: 'Specialized Q Pro agents',
    types: [
      '/dev - Code generation & refactoring',
      '/test - Test creation & debugging', 
      '/docs - Documentation generation',
      '/review - Code quality & security review'
    ]
  }
};

function showGuide(section = 'all') {
  console.log('🤖 Amazon Q Developer Pro - HOOTNER Guide\n');
  
  if (section === 'all' || section === 'chat') {
    console.log('💬 CHAT FEATURES');
    console.log(`   ${guides.chat.desc}`);
    guides.chat.commands.forEach(cmd => console.log(`   • ${cmd}`));
    console.log();
  }

  if (section === 'all' || section === 'inline') {
    console.log('⚡ INLINE COMPLETIONS');
    console.log(`   ${guides.inline.desc}`);
    guides.inline.shortcuts.forEach(shortcut => console.log(`   • ${shortcut}`));
    console.log();
  }

  if (section === 'all' || section === 'agents') {
    console.log('🎯 SPECIALIZED AGENTS');
    console.log(`   ${guides.agents.desc}`);
    guides.agents.types.forEach(type => console.log(`   • ${type}`));
    console.log();
  }

  console.log('📚 Quick Start:');
  console.log('   1. Type @workspace to include project context');
  console.log('   2. Use /dev for code generation tasks');
  console.log('   3. Use /review for security & quality checks');
  console.log('   4. Alt+C for manual inline completions\n');
}

// CLI handling
const section = process.argv[2];
showGuide(section);
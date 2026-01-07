#!/usr/bin/env node
// Minimal CLI Tool
class CLI {
  constructor() {
    this.commands = new Map();
  }

  command(name, handler) {
    this.commands.set(name, handler);
  }

  run(args) {
    const [cmd, ...params] = args.slice(2);
    const handler = this.commands.get(cmd);
    
    if (handler) {
      handler(params);
    } else {
      console.log('Unknown command:', cmd);
      console.log('Available:', Array.from(this.commands.keys()).join(', '));
    }
  }
}

const cli = new CLI();
cli.command('hello', ([name]) => console.log(`Hello ${name || 'World'}!`));
cli.command('version', () => console.log('v1.0.0'));

if (import.meta.url === `file://${process.argv[1]}`) {
  cli.run(process.argv);
}

export default CLI;

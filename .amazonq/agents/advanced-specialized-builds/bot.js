// Minimal Bot
class Bot {
  constructor(name) {
    this.name = name;
    this.responses = new Map();
  }

  learn(pattern, response) {
    this.responses.set(pattern, response);
  }

  respond(input) {
    for (const [pattern, response] of this.responses) {
      if (input.match(new RegExp(pattern, 'i'))) {
        return typeof response === 'function' ? response(input) : response;
      }
    }
    return "I don't understand";
  }
}

const bot = new Bot('Helper');
bot.learn('hello', 'Hi there!');
bot.learn('bye', 'Goodbye!');
bot.learn('name', input => `I'm ${bot.name}`);

console.log(bot.respond('hello'));
console.log(bot.respond('what is your name?'));

export default Bot;

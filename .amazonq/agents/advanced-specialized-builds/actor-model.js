// Minimal Actor Model
class Actor {
  constructor(id, behavior) {
    this.id = id;
    this.behavior = behavior;
    this.mailbox = [];
  }

  send(msg) {
    this.mailbox.push(msg);
  }

  process() {
    while (this.mailbox.length) {
      const msg = this.mailbox.shift();
      this.behavior(msg);
    }
  }
}

class ActorSystem {
  constructor() {
    this.actors = new Map();
  }

  spawn(id, behavior) {
    const actor = new Actor(id, behavior);
    this.actors.set(id, actor);
    return actor;
  }

  send(id, msg) {
    this.actors.get(id)?.send(msg);
  }

  run() {
    this.actors.forEach(actor => actor.process());
  }
}

const sys = new ActorSystem();
sys.spawn('worker', msg => console.log('Got:', msg));
sys.send('worker', 'Hello');
sys.run();

export default ActorSystem;

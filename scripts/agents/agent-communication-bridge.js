export class AgentCommunicationBridge {
  constructor() {
    this.interactions = []
    this.messages = []
  }

  logInteraction(agentName, action, args) {
    this.interactions.push({ agentName, action, args, timestamp: Date.now() })
  }

  logMessage(fromAgent, toAgent, message) {
    this.messages.push({ fromAgent, toAgent, message, timestamp: Date.now() })
  }

  getStats() {
    return {
      totalMessages: this.messages.length,
      activeChannels: new Set([...this.messages.map(m => m.fromAgent), ...this.messages.map(m => m.toAgent)]).size
    }
  }
}
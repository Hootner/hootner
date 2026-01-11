/**
 * Voice Assistants Service
 * Alexa/Google integration with voice commands
 */

class VoiceAssistants {
  constructor() {
    this.assistants = ['alexa', 'google_assistant', 'siri', 'bixby'];
    this.skills = new Map();
    this.intents = new Map();
    this.sessions = new Map();
    
    this.initializeSkills();
  }

  initializeSkills() {
    const skillDefinitions = [
      {
        name: 'play_video',
        assistants: ['alexa', 'google_assistant'],
        intents: ['PlayVideoIntent', 'SearchVideoIntent'],
        utterances: [
          'play {video_title}',
          'watch {video_title}',
          'show me {video_title}',
          'find videos about {topic}'
        ]
      },
      {
        name: 'user_profile',
        assistants: ['alexa', 'google_assistant'],
        intents: ['GetProfileIntent', 'UpdateProfileIntent'],
        utterances: [
          'what\'s my profile',
          'show my account',
          'update my preferences'
        ]
      },
      {
        name: 'playlist_control',
        assistants: ['alexa', 'google_assistant'],
        intents: ['PlayPlaylistIntent', 'CreatePlaylistIntent'],
        utterances: [
          'play my playlist',
          'create a new playlist',
          'add to playlist {playlist_name}'
        ]
      }
    ];

    skillDefinitions.forEach(skill => {
      this.skills.set(skill.name, skill);
    });
  }

  async registerSkill({ name, assistant, intents, utterances, endpoint }) {
    console.log(`🎤 Registering voice skill: ${name} for ${assistant}`);
    
    const skillId = `skill_${assistant}_${Date.now()}`;
    
    const skill = {
      id: skillId,
      name,
      assistant,
      intents,
      utterances,
      endpoint,
      status: 'pending',
      createdAt: new Date().toISOString(),
      invocationName: `hootner ${name.replace('_', ' ')}`,
      certification: {
        status: 'not_submitted',
        requirements: this.getSkillRequirements(assistant)
      }
    };

    // Validate skill configuration
    const validation = await this.validateSkill(skill);
    if (!validation.valid) {
      skill.status = 'invalid';
      skill.validationErrors = validation.errors;
      return skill;
    }

    // Submit for review
    const submission = await this.submitSkill(skill);
    skill.status = submission.status;
    skill.submissionId = submission.id;
    
    this.skills.set(skillId, skill);
    
    return skill;
  }

  async validateSkill(skill) {
    const validation = { valid: true, errors: [] };
    
    // Check required fields
    if (!skill.intents || skill.intents.length === 0) {
      validation.errors.push('At least one intent is required');
    }
    
    if (!skill.utterances || skill.utterances.length === 0) {
      validation.errors.push('At least one utterance is required');
    }
    
    // Check assistant-specific requirements
    if (skill.assistant === 'alexa') {
      if (!skill.endpoint || !skill.endpoint.startsWith('https://')) {
        validation.errors.push('Alexa skills require HTTPS endpoint');
      }
    }
    
    validation.valid = validation.errors.length === 0;
    return validation;
  }

  async submitSkill(skill) {
    // Mock skill submission
    const submission = {
      id: `sub_${Date.now()}`,
      skillId: skill.id,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: this.getReviewTime(skill.assistant)
    };

    // Simulate review process
    setTimeout(() => {
      submission.status = Math.random() > 0.2 ? 'approved' : 'rejected'; // 80% approval
      submission.reviewedAt = new Date().toISOString();
    }, Math.min(submission.estimatedReviewTime * 100, 2000)); // Max 2s simulation
    
    return submission;
  }

  getSkillRequirements(assistant) {
    const requirements = {
      alexa: [
        'Privacy policy URL',
        'Terms of use URL',
        'Skill icon (108x108 and 512x512)',
        'Testing instructions',
        'Account linking (if applicable)'
      ],
      google_assistant: [
        'Privacy policy URL',
        'Action icon',
        'Sample invocations',
        'Directory information',
        'Account linking (if applicable)'
      ]
    };
    
    return requirements[assistant] || [];
  }

  getReviewTime(assistant) {
    const reviewTimes = { // in hours
      alexa: 72,
      google_assistant: 48,
      siri: 120,
      bixby: 96
    };
    
    return reviewTimes[assistant] || 72;
  }

  async processCommand({ assistant, command, userId, sessionId = null }) {
    console.log(`🗣️ Processing voice command: "${command}" via ${assistant}`);
    
    const commandId = `cmd_${Date.now()}`;
    
    // Create or get session
    if (!sessionId) {
      sessionId = `session_${userId}_${Date.now()}`;
    }
    
    const session = this.getOrCreateSession(sessionId, userId, assistant);
    
    const processing = {
      id: commandId,
      sessionId,
      userId,
      assistant,
      command,
      timestamp: new Date().toISOString(),
      status: 'processing'
    };

    try {
      // Parse intent from command
      const intent = await this.parseIntent(command, assistant);
      processing.intent = intent;
      
      // Execute intent
      const response = await this.executeIntent(intent, session);
      processing.response = response;
      processing.status = 'completed';
      
      // Update session context
      session.lastCommand = command;
      session.lastResponse = response;
      session.commandCount++;
      
    } catch (error) {
      processing.status = 'failed';
      processing.error = error.message;
      processing.response = this.getErrorResponse(assistant, error);
    }
    
    return processing;
  }

  getOrCreateSession(sessionId, userId, assistant) {
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId);
    }
    
    const session = {
      id: sessionId,
      userId,
      assistant,
      startTime: new Date().toISOString(),
      commandCount: 0,
      context: {},
      lastCommand: null,
      lastResponse: null
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async parseIntent(command, assistant) {
    // Simple intent parsing - replace with NLP service
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('play') || lowerCommand.includes('watch')) {
      return {
        name: 'PlayVideoIntent',
        slots: {
          video_title: this.extractVideoTitle(lowerCommand)
        }
      };
    }
    
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      return {
        name: 'SearchVideoIntent',
        slots: {
          search_query: this.extractSearchQuery(lowerCommand)
        }
      };
    }
    
    if (lowerCommand.includes('playlist')) {
      return {
        name: 'PlayPlaylistIntent',
        slots: {
          playlist_name: this.extractPlaylistName(lowerCommand)
        }
      };
    }
    
    if (lowerCommand.includes('profile') || lowerCommand.includes('account')) {
      return {
        name: 'GetProfileIntent',
        slots: {}
      };
    }
    
    return {
      name: 'UnknownIntent',
      slots: {}
    };
  }

  extractVideoTitle(command) {
    const patterns = [
      /play (.+)/,
      /watch (.+)/,
      /show me (.+)/
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) return match[1];
    }
    
    return 'unknown video';
  }

  extractSearchQuery(command) {
    const patterns = [
      /search for (.+)/,
      /find (.+)/,
      /look for (.+)/
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) return match[1];
    }
    
    return command;
  }

  extractPlaylistName(command) {
    const patterns = [
      /playlist (.+)/,
      /my (.+) playlist/
    ];
    
    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) return match[1];
    }
    
    return 'default';
  }

  async executeIntent(intent, session) {
    switch (intent.name) {
      case 'PlayVideoIntent':
        return await this.handlePlayVideo(intent.slots, session);
      case 'SearchVideoIntent':
        return await this.handleSearchVideo(intent.slots, session);
      case 'PlayPlaylistIntent':
        return await this.handlePlayPlaylist(intent.slots, session);
      case 'GetProfileIntent':
        return await this.handleGetProfile(session);
      default:
        return this.getUnknownIntentResponse(session.assistant);
    }
  }

  async handlePlayVideo(slots, session) {
    const videoTitle = slots.video_title;
    
    // Mock video search and play
    const video = {
      id: 'v123',
      title: videoTitle,
      duration: '5:30',
      url: `https://hootner.com/play/v123`
    };
    
    return {
      speech: `Playing ${videoTitle}. Enjoy your video!`,
      card: {
        title: `Now Playing: ${videoTitle}`,
        content: `Duration: ${video.duration}`,
        image: `https://hootner.com/thumbnails/v123.jpg`
      },
      action: {
        type: 'play_video',
        videoId: video.id,
        url: video.url
      }
    };
  }

  async handleSearchVideo(slots, session) {
    const query = slots.search_query;
    
    // Mock search results
    const results = [
      { title: `${query} Tutorial`, views: '10K' },
      { title: `Best ${query} Videos`, views: '25K' },
      { title: `${query} Compilation`, views: '50K' }
    ];
    
    return {
      speech: `I found ${results.length} videos about ${query}. The top result is "${results[0].title}" with ${results[0].views} views.`,
      card: {
        title: `Search Results for "${query}"`,
        content: results.map(r => `${r.title} (${r.views} views)`).join('\n')
      },
      action: {
        type: 'show_search_results',
        query,
        results
      }
    };
  }

  async handlePlayPlaylist(slots, session) {
    const playlistName = slots.playlist_name;
    
    return {
      speech: `Playing your ${playlistName} playlist. I found 12 videos in this playlist.`,
      card: {
        title: `Playing Playlist: ${playlistName}`,
        content: '12 videos • 2 hours 15 minutes'
      },
      action: {
        type: 'play_playlist',
        playlistName
      }
    };
  }

  async handleGetProfile(session) {
    return {
      speech: 'Your HOOTNER profile shows 150 videos watched this month and 5 playlists created.',
      card: {
        title: 'Your HOOTNER Profile',
        content: 'Videos watched: 150\nPlaylists: 5\nWatch time: 25 hours'
      },
      action: {
        type: 'show_profile'
      }
    };
  }

  getUnknownIntentResponse(assistant) {
    const responses = {
      alexa: "I'm not sure how to help with that. Try asking me to play a video or search for content.",
      google_assistant: "Sorry, I didn't understand that. You can ask me to play videos or search for content on HOOTNER."
    };
    
    return {
      speech: responses[assistant] || responses.alexa,
      card: {
        title: 'Available Commands',
        content: 'Try: "Play [video name]", "Search for [topic]", "Play my playlist"'
      }
    };
  }

  getErrorResponse(assistant, error) {
    return {
      speech: "Sorry, I'm having trouble right now. Please try again later.",
      card: {
        title: 'Error',
        content: 'Service temporarily unavailable'
      }
    };
  }

  async register({ platforms, skills }) {
    console.log(`🎤 Registering voice skills for: ${platforms.join(', ')}`);
    
    const registrations = [];
    
    for (const platform of platforms) {
      for (const skillName of skills) {
        const skill = this.skills.get(skillName);
        if (skill && skill.assistants.includes(platform)) {
          const registration = await this.registerSkill({
            name: skillName,
            assistant: platform,
            intents: skill.intents,
            utterances: skill.utterances,
            endpoint: `https://api.hootner.com/voice/${platform}/webhook`
          });
          
          registrations.push(registration);
        }
      }
    }
    
    return {
      platforms,
      skills,
      registrations,
      totalSkills: registrations.length
    };
  }

  async getAnalytics(assistant, timeRange = '24h') {
    return {
      assistant,
      timeRange,
      generatedAt: new Date().toISOString(),
      totalCommands: Math.floor(Math.random() * 10000) + 5000,
      uniqueUsers: Math.floor(Math.random() * 2000) + 1000,
      successRate: (0.85 + Math.random() * 0.1).toFixed(3), // 85-95%
      avgSessionDuration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      topIntents: [
        { intent: 'PlayVideoIntent', count: Math.floor(Math.random() * 3000) + 2000 },
        { intent: 'SearchVideoIntent', count: Math.floor(Math.random() * 2000) + 1000 },
        { intent: 'PlayPlaylistIntent', count: Math.floor(Math.random() * 1000) + 500 }
      ],
      errorRate: (Math.random() * 0.05).toFixed(3) // 0-5%
    };
  }

  async listSkills(assistant = null) {
    const skills = Array.from(this.skills.values());
    
    if (assistant) {
      return skills.filter(skill => skill.assistants?.includes(assistant));
    }
    
    return skills;
  }

  async getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
}

module.exports = new VoiceAssistants();
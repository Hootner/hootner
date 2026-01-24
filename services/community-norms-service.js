/**
 * Community Norms and Creator Respect Service
 * Handles onboarding, messaging, and community guidelines
 */

export const COMMUNITY_GUIDELINES = {
  title: 'Respect Creators, Build Together',
  subtitle: 'Supporting Homeschool Families and Educational Content',

  principles: [
    {
      id: 'respect',
      title: 'Respect Creators\' Work',
      description: 'Every video, lesson, and resource represents hours of work by homeschool families.',
      icon: '🤝',
      actions: [
        'Always credit the original creator',
        'Follow the license terms chosen by creators',
        'Ask permission before using content in new ways',
        'Support creators financially when you can'
      ]
    },
    {
      id: 'attribution',
      title: 'Proper Attribution Matters',
      description: 'Give credit where credit is due - it helps families earn recognition and income.',
      icon: '©',
      actions: [
        'Include copyright notices when sharing',
        'Link back to original sources',
        'Mention creators by name in your work',
        'Respect "All Rights Reserved" licenses'
      ]
    },
    {
      id: 'no-piracy',
      title: 'Copying Hurts Families',
      description: 'Unauthorized copying takes income from homeschool families building educational resources.',
      icon: '🚫',
      warnings: [
        'Don\'t re-upload others\' videos without permission',
        'Don\'t remove copyright notices or watermarks',
        'Don\'t sell or resell others\' content',
        'Don\'t bypass license restrictions'
      ]
    },
    {
      id: 'collaboration',
      title: 'Build Together',
      description: 'The homeschool community thrives when we share and collaborate respectfully.',
      icon: '🌱',
      encouragement: [
        'Use Creative Commons content as allowed',
        'Contribute back to the community',
        'Share your own work generously',
        'Report copyright violations to help protect creators'
      ]
    }
  ],

  legal: {
    title: 'Legal Protections',
    description: 'HOOTNER takes copyright seriously and complies with DMCA laws.',
    points: [
      'Creators can register DMCA takedown notices',
      'We respond promptly to valid copyright claims',
      'Counter-notices are available for disputes',
      'Repeat infringers will lose platform access'
    ]
  }
};

/**
 * Onboarding Messages by User Type
 */
export const ONBOARDING_MESSAGES = {
  creator: {
    welcome: {
      title: 'Welcome, Creator! 🎨',
      message: 'Your work is valuable. We\'re here to help you protect it and reach families who need it.',
      steps: [
        {
          step: 1,
          title: 'Choose Your License',
          description: 'Decide how others can use your content. We recommend "All Rights Reserved" or "CC BY-NC-SA" for maximum protection.',
          cta: 'Set License Preferences'
        },
        {
          step: 2,
          title: 'Auto-Copyright Protection',
          description: 'We automatically add copyright notices to all your uploads - videos, code, and listings.',
          icon: '✅'
        },
        {
          step: 3,
          title: 'DMCA Protection',
          description: 'If someone copies your work, you can file a takedown notice. We\'ll handle it quickly.',
          link: '/dmca/how-it-works'
        }
      ]
    },

    licenseGuidance: {
      title: 'Which License Should You Choose?',
      options: [
        {
          license: 'All Rights Reserved',
          recommended: true,
          description: 'Full protection - nobody can use without your permission',
          bestFor: 'Premium content, courses you sell, your most valuable work',
          badge: '🔒 Maximum Protection'
        },
        {
          license: 'CC BY-NC-SA',
          recommended: true,
          description: 'Others can share and adapt, but not commercially, and must share alike',
          bestFor: 'Community resources you want homeschoolers to use freely (but not resell)',
          badge: '🤝 Community Sharing'
        },
        {
          license: 'CC BY-NC',
          recommended: false,
          description: 'Non-commercial sharing allowed',
          bestFor: 'Free resources, but watch for unauthorized derivatives',
          badge: '⚠️ Use Caution'
        }
      ],
      tip: '💡 You can set different licenses for different uploads. Start with "All Rights Reserved" if unsure.'
    }
  },

  consumer: {
    welcome: {
      title: 'Welcome to HOOTNER! 🦉',
      message: 'You\'re joining a community of homeschool families creating and sharing educational content.',
      principles: [
        '✅ Respect creators - their work supports their families',
        '✅ Follow license terms - they\'re chosen for good reasons',
        '✅ Give credit - always attribute original creators',
        '❌ Never copy content without permission',
        '❌ Never remove copyright notices or watermarks'
      ]
    },

    licenseExplainer: {
      title: 'Understanding Content Licenses',
      description: 'When you see these symbols, here\'s what they mean:',
      licenses: [
        {
          symbol: '© All Rights Reserved',
          meaning: 'You can watch but not copy, modify, or share without permission',
          action: 'Contact creator for permission to use'
        },
        {
          symbol: '🅭🅯 CC BY-NC',
          meaning: 'You can share with credit, but not for commercial purposes',
          action: 'Share freely but always credit the creator'
        },
        {
          symbol: '🅭🅯🅬 CC BY-NC-SA',
          meaning: 'Share with credit, non-commercial, and use same license for derivatives',
          action: 'Great for remixing - just keep it non-commercial'
        }
      ]
    },

    reporting: {
      title: 'See Something Wrong?',
      message: 'Help protect our creator community',
      actions: [
        {
          issue: 'Unauthorized copy of your work',
          action: 'File DMCA takedown notice',
          link: '/dmca/file-notice'
        },
        {
          issue: 'Someone removed copyright notices',
          action: 'Report to moderation',
          link: '/report'
        },
        {
          issue: 'License violation',
          action: 'Contact creator and/or report',
          link: '/report'
        }
      ]
    }
  },

  educator: {
    welcome: {
      title: 'Welcome, Educator! 📚',
      message: 'Educational use has special considerations. Here\'s what you need to know.',
      guidelines: [
        '✅ Fair use may apply for educational purposes',
        '✅ Always cite sources in your lessons',
        '✅ Use CC-licensed content freely within license terms',
        '⚠️ Fair use doesn\'t mean "free for all" - respect creators',
        '⚠️ Commercial use (selling courses) requires permission'
      ]
    },

    fairUse: {
      title: 'Fair Use for Education',
      description: 'U.S. copyright law allows limited use for teaching, but it\'s not unlimited.',
      factors: [
        'Purpose: Non-profit educational use is favored',
        'Nature: Published works have less protection than unpublished',
        'Amount: Use only what\'s necessary for your lesson',
        'Effect: Don\'t harm the creator\'s market for their work'
      ],
      tip: '💡 When in doubt, ask permission or use CC-licensed content. Support creator families!'
    }
  }
};

/**
 * In-Platform Messaging
 */
export const PLATFORM_MESSAGES = {
  upload: {
    title: 'Protect Your Work',
    message: 'Choose a license for this upload. We\'ll add copyright notices automatically.',
    tip: 'Recommended: "All Rights Reserved" for maximum protection'
  },

  download: {
    title: 'Respect the Creator',
    message: 'This content is protected. Check the license before sharing or modifying.',
    warning: 'Unauthorized copying can result in DMCA takedowns and account suspension.'
  },

  share: {
    title: 'Sharing Responsibly',
    message: 'Include proper attribution when sharing:',
    template: '"{Title}" by {Creator} ({License}) - {URL}'
  },

  remix: {
    title: 'Creating Derivative Works',
    message: 'Check if the license allows modifications:',
    checks: [
      'Is modification allowed? (Check license)',
      'Are there ShareAlike requirements?',
      'Is commercial use permitted?',
      'Have you credited the original creator?'
    ]
  },

  reportViolation: {
    title: 'Report Copyright Violation',
    message: 'Help protect our creator community',
    fields: [
      'Your relationship to the work (creator, rights holder, agent)',
      'Link to your original work',
      'Link to infringing content',
      'Explanation of violation'
    ]
  }
};

/**
 * Email Templates for Community Education
 */
export const EMAIL_TEMPLATES = {
  welcomeCreator: {
    subject: 'Welcome to HOOTNER - Protect Your Creative Work',
    preview: 'Your work is valuable. Here\'s how we help you protect it.',
    sections: [
      {
        heading: 'Your Content, Your Rights',
        content: 'Every upload is automatically protected with copyright notices and your chosen license.'
      },
      {
        heading: 'DMCA Protection',
        content: 'If someone copies your work, we\'re here to help with fast takedown processing.'
      },
      {
        heading: 'Choose Your License',
        content: 'Control how others use your content - from full protection to community sharing.',
        cta: {
          text: 'Set License Preferences',
          link: '/settings/licensing'
        }
      }
    ]
  },

  welcomeConsumer: {
    subject: 'Welcome to HOOTNER - Respect Creators, Learn Together',
    preview: 'Join a community that values creators and educational content.',
    sections: [
      {
        heading: 'Respect Creators\' Work',
        content: 'Every video represents hours of work by homeschool families. Always follow license terms and give credit.'
      },
      {
        heading: 'Understanding Licenses',
        content: 'Learn what you can and can\'t do with each type of content.',
        cta: {
          text: 'License Guide',
          link: '/help/licenses'
        }
      }
    ]
  },

  firstUpload: {
    subject: 'Your First Upload - Let\'s Protect It!',
    preview: 'Choose how others can use your content.',
    content: 'We\'ve added a copyright notice to your upload. Now choose a license that matches how you want to share.'
  },

  dmcaTakedownNotice: {
    subject: 'Important: Copyright Claim on Your Content',
    preview: 'We received a DMCA takedown notice about your content.',
    tone: 'professional and neutral',
    educate: true
  }
};

/**
 * Dashboard/UI Messages
 */
export const UI_MESSAGES = {
  licenseBadges: {
    showOnContent: true,
    showInSearch: true,
    showInProfile: true,
    tooltip: true
  },

  copyrightFooter: {
    allPages: true,
    message: 'All content protected by copyright. Respect creators\' licenses.',
    link: '/copyright-policy'
  },

  banners: {
    creator: {
      firstLogin: {
        message: '🎨 Set your default license to protect all your uploads automatically',
        cta: 'Set License Now',
        dismissible: true,
        priority: 'high'
      }
    },

    consumer: {
      firstDownload: {
        message: '⚠️ Remember to check license terms before sharing or modifying content',
        cta: 'Learn About Licenses',
        dismissible: true,
        priority: 'medium'
      }
    }
  },

  tooltips: {
    licenseBadge: 'This content\'s license determines how you can use it. Click to learn more.',
    copyrightNotice: 'Copyright protects this creator\'s work. Unauthorized copying is prohibited.',
    dmcaLink: 'Report copyright infringement or file a takedown notice',
    attributionRequired: 'You must credit the creator when sharing this content'
  }
};

/**
 * Moderation Guidelines for Platform
 */
export const MODERATION_GUIDELINES = {
  copyrightViolations: {
    severity: 'high',
    actions: [
      'First offense: Content removal + warning',
      'Second offense: 30-day suspension',
      'Third offense: Permanent ban'
    ],
    appeals: 'Users can appeal via counter-notice process'
  },

  watermarkRemoval: {
    severity: 'high',
    actions: [
      'Immediate content removal',
      'Account warning',
      'Repeat offense: Account suspension'
    ]
  },

  licenseViolation: {
    severity: 'medium-high',
    actions: [
      'Content removal',
      'Notification to original creator',
      'Warning to violator',
      'Education on proper licensing'
    ]
  }
};

/**
 * Community Norms Service
 */
export class CommunityNormsService {
  /**
   * Get onboarding flow for user type
   */
  getOnboardingFlow(userType = 'consumer') {
    return ONBOARDING_MESSAGES[userType] || ONBOARDING_MESSAGES.consumer;
  }

  /**
   * Get community guidelines
   */
  getGuidelines() {
    return COMMUNITY_GUIDELINES;
  }

  /**
   * Get platform messages for specific action
   */
  getPlatformMessage(action) {
    return PLATFORM_MESSAGES[action] || null;
  }

  /**
   * Get email template
   */
  getEmailTemplate(templateName) {
    return EMAIL_TEMPLATES[templateName] || null;
  }

  /**
   * Get UI messages for component
   */
  getUIMessages(component) {
    return UI_MESSAGES[component] || null;
  }

  /**
   * Get moderation guidelines for violation type
   */
  getModerationGuideline(violationType) {
    return MODERATION_GUIDELINES[violationType] || null;
  }

  /**
   * Generate attribution text
   */
  generateAttribution(content, creator) {
    const { title, license } = content;
    const { name } = creator;
    const licenseInfo = this.getLicenseInfo(license);

    let attribution = `"${title}" by ${name}`;

    if (licenseInfo && licenseInfo.url) {
      attribution += ` (${licenseInfo.name})`;
    }

    return attribution;
  }

  /**
   * Check if action is allowed by license
   */
  checkLicensePermission(license, action) {
    const permissions = {
      'all-rights-reserved': {
        view: true,
        share: false,
        modify: false,
        commercial: false
      },
      'cc-by-nc': {
        view: true,
        share: true,
        modify: true,
        commercial: false
      },
      'cc-by-nc-sa': {
        view: true,
        share: true,
        modify: true,
        commercial: false,
        shareAlike: true
      },
      'cc-by': {
        view: true,
        share: true,
        modify: true,
        commercial: true
      },
      'cc-by-sa': {
        view: true,
        share: true,
        modify: true,
        commercial: true,
        shareAlike: true
      },
      'public-domain': {
        view: true,
        share: true,
        modify: true,
        commercial: true
      }
    };

    const licensePerms = permissions[license] || permissions['all-rights-reserved'];
    return licensePerms[action] || false;
  }

  /**
   * Get help content for creators
   */
  getCreatorHelp() {
    return {
      faqs: [
        {
          q: 'Which license should I choose?',
          a: 'Start with "All Rights Reserved" for maximum protection. Use CC BY-NC-SA if you want homeschool families to share freely but prevent commercial resale.'
        },
        {
          q: 'Can I change the license later?',
          a: 'Yes, but only for future uses. Content already shared under a CC license can\'t be "taken back."'
        },
        {
          q: 'What if someone copies my work?',
          a: 'File a DMCA takedown notice. We respond quickly to protect creators.'
        },
        {
          q: 'How do copyright notices work?',
          a: 'We automatically add © [Your Name] [Year] to all your uploads - videos, code, and listings.'
        }
      ],
      resources: [
        {
          title: 'Understanding Licenses',
          link: '/help/licenses',
          description: 'Complete guide to choosing the right license'
        },
        {
          title: 'DMCA Protection Guide',
          link: '/help/dmca',
          description: 'How to protect your work and file takedown notices'
        },
        {
          title: 'Fair Use and Education',
          link: '/help/fair-use',
          description: 'Understanding fair use for educational content'
        }
      ]
    };
  }
}

export default new CommunityNormsService();

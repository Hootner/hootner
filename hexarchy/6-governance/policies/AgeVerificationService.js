// Age Verification and Content Rating Service
import { logger } from '../../0-core/logging/logger.js';

export class AgeVerificationService {
  constructor(userRepository, contentRepository) {
    this.userRepository = userRepository;
    this.contentRepository = contentRepository;

    // Age ratings
    this.ratings = {
      GENERAL: { id: 'general', minAge: 0, name: 'General Audiences' },
      PARENTAL_GUIDANCE: { id: 'pg', minAge: 7, name: 'Parental Guidance' },
      TEEN: { id: 'teen', minAge: 13, name: 'Teen' },
      MATURE: { id: 'mature', minAge: 17, name: 'Mature' },
      ADULT: { id: 'adult', minAge: 18, name: 'Adult Only' }
    };
  }

  // Verify user age
  async verifyUserAge(userId, verificationData) {
    try {
      const {
        dateOfBirth,
        verificationMethod, // 'id_document', 'credit_card', 'age_gate'
        documentData
      } = verificationData;

      // Calculate age
      const age = this.calculateAge(dateOfBirth);

      // Create verification record
      const verification = await this.userRepository.createAgeVerification({
        userId,
        dateOfBirth,
        age,
        verificationMethod,
        documentData,
        verified: age >= 13, // Minimum platform age
        verifiedAt: new Date().toISOString()
      });

      // Update user profile
      await this.userRepository.update(userId, {
        age,
        ageVerified: verification.verified,
        dateOfBirth
      });

      logger.info('Age verified', { userId, age, verified: verification.verified });
      return verification;
    } catch (error) {
      logger.error('Failed to verify age:', error);
      throw error;
    }
  }

  // Calculate age from date of birth
  calculateAge(dateOfBirth) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Rate content
  async rateContent(contentId, contentType, rating, reasons = []) {
    try {
      // Validate rating
      if (!this.ratings[rating.toUpperCase()]) {
        throw new Error('Invalid content rating');
      }

      const contentRating = this.ratings[rating.toUpperCase()];

      // Update content metadata
      await this.contentRepository.updateMetadata(contentId, {
        rating: contentRating.id,
        minAge: contentRating.minAge,
        ratingReasons: reasons
      });

      logger.info('Content rated', { contentId, rating: contentRating.id });
      return contentRating;
    } catch (error) {
      logger.error('Failed to rate content:', error);
      throw error;
    }
  }

  // Check content access
  async canAccessContent(userId, contentId) {
    const user = await this.userRepository.findById(userId);
    const content = await this.contentRepository.findById(contentId);

    if (!content.minAge) {
      return { canAccess: true };
    }

    // Check if user age is verified
    if (!user.ageVerified) {
      return {
        canAccess: false,
        reason: 'age_verification_required',
        minAge: content.minAge
      };
    }

    // Check if user meets minimum age
    if (user.age < content.minAge) {
      return {
        canAccess: false,
        reason: 'age_restricted',
        userAge: user.age,
        minAge: content.minAge
      };
    }

    return { canAccess: true };
  }

  // Auto-rate content using AI
  async autoRateContent(contentId, contentType) {
    const content = await this.contentRepository.findById(contentId);

    // Analyze content (simplified)
    const hasViolence = this.detectViolence(content);
    const hasProfanity = this.detectProfanity(content);
    const hasSexualContent = this.detectSexualContent(content);
    const hasDrugs = this.detectDrugs(content);

    let rating = 'GENERAL';
    const reasons = [];

    if (hasSexualContent || hasDrugs) {
      rating = 'ADULT';
      if (hasSexualContent) reasons.push('Sexual content');
      if (hasDrugs) reasons.push('Drug use');
    } else if (hasViolence) {
      rating = 'MATURE';
      reasons.push('Violence');
    } else if (hasProfanity) {
      rating = 'TEEN';
      reasons.push('Strong language');
    }

    await this.rateContent(contentId, contentType, rating, reasons);

    return { rating, reasons };
  }

  // Content analysis helpers (simplified)
  detectViolence(content) {
    const violenceKeywords = ['violence', 'fight', 'blood', 'weapon'];
    return this.containsKeywords(content.title + ' ' + content.description, violenceKeywords);
  }

  detectProfanity(content) {
    const profanityWords = ['profanity1', 'profanity2']; // Placeholder
    return this.containsKeywords(content.title + ' ' + content.description, profanityWords);
  }

  detectSexualContent(content) {
    const sexualKeywords = ['adult', 'explicit']; // Placeholder
    return this.containsKeywords(content.title + ' ' + content.description, sexualKeywords);
  }

  detectDrugs(content) {
    const drugKeywords = ['drugs', 'substance']; // Placeholder
    return this.containsKeywords(content.title + ' ' + content.description, drugKeywords);
  }

  containsKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  }

  // Enable parental controls
  async enableParentalControls(parentUserId, childUserId, restrictions) {
    const {
      maxRating, // Maximum allowed content rating
      allowedCategories,
      blockedKeywords,
      timeRestrictions
    } = restrictions;

    await this.userRepository.createParentalControls({
      parentUserId,
      childUserId,
      maxRating,
      allowedCategories,
      blockedKeywords,
      timeRestrictions,
      enabled: true,
      createdAt: new Date().toISOString()
    });

    logger.info('Parental controls enabled', { parentUserId, childUserId });
  }

  // Check parental controls
  async checkParentalControls(userId, contentId) {
    const controls = await this.userRepository.getParentalControls(userId);
    if (!controls || !controls.enabled) {
      return { allowed: true };
    }

    const content = await this.contentRepository.findById(contentId);
    const contentRating = this.ratings[content.rating?.toUpperCase()] || this.ratings.GENERAL;
    const maxRating = this.ratings[controls.maxRating.toUpperCase()];

    // Check rating
    if (contentRating.minAge > maxRating.minAge) {
      return {
        allowed: false,
        reason: 'Rating exceeds parental control limit',
        contentRating: contentRating.name,
        maxRating: maxRating.name
      };
    }

    // Check categories
    if (controls.allowedCategories && !controls.allowedCategories.includes(content.category)) {
      return {
        allowed: false,
        reason: 'Category not allowed by parental controls'
      };
    }

    // Check blocked keywords
    if (controls.blockedKeywords) {
      const text = `${content.title} ${content.description}`.toLowerCase();
      for (const keyword of controls.blockedKeywords) {
        if (text.includes(keyword.toLowerCase())) {
          return {
            allowed: false,
            reason: 'Content contains blocked keyword'
          };
        }
      }
    }

    return { allowed: true };
  }

  // Get age statistics
  async getAgeStatistics() {
    const users = await this.userRepository.findAll();

    const ageGroups = {
      '13-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45+': 0,
      'unverified': 0
    };

    users.forEach(user => {
      if (!user.ageVerified) {
        ageGroups['unverified']++;
      } else if (user.age >= 13 && user.age <= 17) {
        ageGroups['13-17']++;
      } else if (user.age >= 18 && user.age <= 24) {
        ageGroups['18-24']++;
      } else if (user.age >= 25 && user.age <= 34) {
        ageGroups['25-34']++;
      } else if (user.age >= 35 && user.age <= 44) {
        ageGroups['35-44']++;
      } else {
        ageGroups['45+']++;
      }
    });

    return ageGroups;
  }
}

export default AgeVerificationService;

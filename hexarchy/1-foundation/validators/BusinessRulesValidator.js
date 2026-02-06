// Business Rules Validator
export class BusinessRulesValidator {
  static SUBSCRIPTION_PLANS = {
    FREE: { price: 0, maxUploads: 10, maxStorage: 5 * 1024 * 1024 * 1024 }, // 5GB
    BASIC: { price: 999, maxUploads: 100, maxStorage: 50 * 1024 * 1024 * 1024 }, // 50GB
    PRO: { price: 2999, maxUploads: 1000, maxStorage: 500 * 1024 * 1024 * 1024 }, // 500GB
    ENTERPRISE: { price: 9999, maxUploads: -1, maxStorage: -1 } // Unlimited
  };

  static validateSubscriptionUpgrade(currentPlan, newPlan) {
    const errors = [];

    const plans = Object.keys(this.SUBSCRIPTION_PLANS);
    const currentIndex = plans.indexOf(currentPlan);
    const newIndex = plans.indexOf(newPlan);

    if (newIndex <= currentIndex) {
      errors.push('Can only upgrade to a higher plan');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUserUploadQuota(user, currentUploads, plan = 'FREE') {
    const errors = [];

    const planLimits = this.SUBSCRIPTION_PLANS[plan];
    if (!planLimits) {
      errors.push('Invalid subscription plan');
      return { isValid: false, errors };
    }

    if (planLimits.maxUploads !== -1 && currentUploads >= planLimits.maxUploads) {
      errors.push(`Upload limit reached for ${plan} plan`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateStorageQuota(user, currentStorage, newFileSize, plan = 'FREE') {
    const errors = [];

    const planLimits = this.SUBSCRIPTION_PLANS[plan];
    if (!planLimits) {
      errors.push('Invalid subscription plan');
      return { isValid: false, errors };
    }

    if (planLimits.maxStorage !== -1 && (currentStorage + newFileSize) > planLimits.maxStorage) {
      const availableGB = (planLimits.maxStorage - currentStorage) / (1024 * 1024 * 1024);
      errors.push(`Storage limit exceeded. Available: ${availableGB.toFixed(2)}GB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static canUserPerformAction(user, action) {
    const permissions = {
      UPLOAD_VIDEO: ['verified', 'active'],
      DELETE_VIDEO: ['verified', 'active'],
      CREATE_PLAYLIST: ['verified', 'active'],
      COMMENT: ['active'],
      LIKE: ['active']
    };

    const required = permissions[action] || [];

    if (required.includes('verified') && !user.isVerified) {
      return false;
    }

    if (required.includes('active') && !user.isActive) {
      return false;
    }

    return true;
  }
}

export default BusinessRulesValidator;

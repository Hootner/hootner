// User Reporting and Flagging Service
import { logger } from '../../0-core/logging/logger.js';

export class UserReportingService {
  constructor(reportRepository, moderationPolicyService) {
    this.reportRepository = reportRepository;
    this.moderationPolicyService = moderationPolicyService;

    // Report types
    this.reportTypes = {
      SPAM: 'spam',
      HARASSMENT: 'harassment',
      HATE_SPEECH: 'hate_speech',
      VIOLENCE: 'violence',
      SEXUAL_CONTENT: 'sexual_content',
      COPYRIGHT: 'copyright',
      IMPERSONATION: 'impersonation',
      MISINFORMATION: 'misinformation',
      DANGEROUS_CONTENT: 'dangerous_content',
      OTHER: 'other'
    };
  }

  // Create report
  async createReport(reportData) {
    try {
      const {
        reporterId,
        contentId,
        contentType, // 'video', 'comment', 'user', 'playlist'
        reportType,
        description,
        evidence = []
      } = reportData;

      // Validate report type
      if (!Object.values(this.reportTypes).includes(reportType)) {
        throw new Error('Invalid report type');
      }

      // Check for duplicate reports
      const existing = await this.reportRepository.findDuplicate(reporterId, contentId, contentType);
      if (existing) {
        throw new Error('You have already reported this content');
      }

      // Create report
      const report = await this.reportRepository.create({
        reporterId,
        contentId,
        contentType,
        reportType,
        description,
        evidence,
        status: 'pending',
        priority: this.calculatePriority(reportType),
        createdAt: new Date().toISOString()
      });

      // Trigger automated review for high-priority reports
      if (report.priority === 'high' || report.priority === 'critical') {
        await this.moderationPolicyService.reviewContent(contentId, contentType, 'auto');
      }

      logger.info('Report created', { reportId: report.id, contentId, reportType });
      return report;
    } catch (error) {
      logger.error('Failed to create report:', error);
      throw error;
    }
  }

  // Calculate priority
  calculatePriority(reportType) {
    const highPriority = ['violence', 'sexual_content', 'dangerous_content'];
    const mediumPriority = ['hate_speech', 'harassment', 'impersonation'];

    if (highPriority.includes(reportType)) return 'critical';
    if (mediumPriority.includes(reportType)) return 'high';
    return 'medium';
  }

  // Get report
  async getReport(reportId) {
    return await this.reportRepository.findById(reportId);
  }

  // Get reports by content
  async getReportsByContent(contentId, contentType) {
    return await this.reportRepository.findByContent(contentId, contentType);
  }

  // Get reports by user
  async getReportsByUser(userId, role = 'reporter') {
    // role: 'reporter' or 'reported'
    if (role === 'reporter') {
      return await this.reportRepository.findByReporter(userId);
    } else {
      return await this.reportRepository.findByReportedUser(userId);
    }
  }

  // Process report
  async processReport(reportId, moderatorId, decision, comments) {
    try {
      const report = await this.reportRepository.findById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Update report
      report.moderatorId = moderatorId;
      report.decision = decision; // 'valid', 'invalid', 'needs_review'
      report.comments = comments;
      report.status = 'processed';
      report.processedAt = new Date().toISOString();

      await this.reportRepository.update(reportId, report);

      // If valid, trigger moderation action
      if (decision === 'valid') {
        await this.moderationPolicyService.reviewContent(
          report.contentId,
          report.contentType,
          moderatorId
        );
      }

      // Notify reporter
      await this.notifyReporter(report.reporterId, report.id, decision);

      logger.info('Report processed', { reportId, decision });
      return report;
    } catch (error) {
      logger.error('Failed to process report:', error);
      throw error;
    }
  }

  // Notify reporter
  async notifyReporter(reporterId, reportId, decision) {
    logger.info('Reporter notified', { reporterId, reportId, decision });
  }

  // Get report statistics
  async getReportStatistics(period = '30d') {
    const reports = await this.reportRepository.findByPeriod(period);

    const stats = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      processed: reports.filter(r => r.status === 'processed').length,
      byType: {},
      byPriority: {},
      validReports: reports.filter(r => r.decision === 'valid').length,
      invalidReports: reports.filter(r => r.decision === 'invalid').length
    };

    reports.forEach(report => {
      stats.byType[report.reportType] = (stats.byType[report.reportType] || 0) + 1;
      stats.byPriority[report.priority] = (stats.byPriority[report.priority] || 0) + 1;
    });

    return stats;
  }

  // Get trending reports (content being reported multiple times)
  async getTrendingReports(limit = 10) {
    const reports = await this.reportRepository.findRecent(1000);

    const contentReportCount = {};
    reports.forEach(report => {
      const key = `${report.contentType}:${report.contentId}`;
      if (!contentReportCount[key]) {
        contentReportCount[key] = {
          contentId: report.contentId,
          contentType: report.contentType,
          reportCount: 0,
          latestReport: report
        };
      }
      contentReportCount[key].reportCount++;
    });

    return Object.values(contentReportCount)
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, limit);
  }

  // Block user from reporting (abuse prevention)
  async blockReporter(userId, reason) {
    await this.reportRepository.blockReporter(userId, reason);
    logger.info('Reporter blocked', { userId, reason });
  }

  // Get report queue for moderators
  async getReportQueue(filters = {}) {
    const { priority, reportType, status } = filters;

    return await this.reportRepository.findReports({
      status: status || 'pending',
      priority,
      reportType,
      orderBy: 'priority',
      limit: 100
    });
  }
}

export default UserReportingService;

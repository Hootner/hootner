// Re-export shared legal components from the UI library.
export { LicenseSelector, CopyrightNotice, DMCAReportButton } from '@ui-components/legal/LegalComponents';

/**
 *License Selector Component
 * Allows creators to choose copyright license for their content
 */

import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_LICENSES = gql`
  query GetAvailableLicenses {
    availableLicenses {
      type
      name
      url
      description
      icon
      allowCommercial
      allowModification
      requireAttribution
      requireShareAlike
    }
    recommendedLicenses(userType: CREATOR) {
      type
      name
      recommended
      reason
      icon
      description
    }
  }
`;

const SET_CREATOR_LICENSE = gql`
  mutation SetCreatorLicense($userId: ID!, $licenseType: LicenseType!) {
    setCreatorLicense(userId: $userId, licenseType: $licenseType) {
      userId
      defaultLicense
    }
  }
`;

const UPDATE_CONTENT_LICENSE = gql`
  mutation UpdateContentLicense($contentId: ID!, $contentType: ContentType!, $licenseType: LicenseType!) {
    updateContentLicense(contentId: $contentId, contentType: $contentType, licenseType: $licenseType) {
      copyrightId
      notice
      fullNotice
      licenseInfo {
        name
        url
        description
        icon
      }
    }
  }
`;

export function LicenseSelector({
  userId,
  contentId,
  contentType,
  currentLicense,
  onLicenseChange,
  mode = 'default' // 'default' or 'content'
}) {
  const [selectedLicense, setSelectedLicense] = useState(currentLicense);
  const [showDetails, setShowDetails] = useState(false);

  const { data, loading, error } = useQuery(GET_LICENSES);
  const [setCreatorLicense] = useMutation(SET_CREATOR_LICENSE);
  const [updateContentLicense] = useMutation(UPDATE_CONTENT_LICENSE);

  const handleLicenseSelect = async (licenseType) => {
    setSelectedLicense(licenseType);

    try {
      if (mode === 'default') {
        await setCreatorLicense({
          variables: { userId, licenseType }
        });
      } else {
        const result = await updateContentLicense({
          variables: { contentId, contentType, licenseType }
        });
        if (onLicenseChange) {
          onLicenseChange(result.data.updateContentLicense);
        }
      }
    } catch (err) {
      console.error('Error updating license:', err);
      alert('Failed to update license. Please try again.');
    }
  };

  if (loading) return <div>Loading licenses...</div>;
  if (error) return <div>Error loading licenses</div>;

  const licenses = data.availableLicenses;
  const recommended = data.recommendedLicenses;

  return (
    <div className="license-selector">
      <div className="license-selector-header">
        <h3>Choose Your License</h3>
        <p>
          {mode === 'default'
            ? 'This will be your default license for all new uploads'
            : 'Choose a license for this specific content'}
        </p>
        <button
          className="help-button"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'} License Details
        </button>
      </div>

      <div className="recommended-section">
        <h4>⭐ Recommended for Homeschool Creators</h4>
        <div className="license-grid">
          {recommended.map(license => (
            <LicenseCard
              key={license.type}
              license={license}
              selected={selectedLicense === license.type}
              recommended={license.recommended}
              reason={license.reason}
              onSelect={() => handleLicenseSelect(license.type)}
              showDetails={showDetails}
            />
          ))}
        </div>
      </div>

      <div className="all-licenses-section">
        <h4>All License Options</h4>
        <div className="license-grid">
          {licenses
            .filter(l => !recommended.find(r => r.type === l.type))
            .map(license => (
              <LicenseCard
                key={license.type}
                license={license}
                selected={selectedLicense === license.type}
                onSelect={() => handleLicenseSelect(license.type)}
                showDetails={showDetails}
              />
            ))}
        </div>
      </div>

      <div className="license-info-box">
        <h4>💡 Quick Guide</h4>
        <ul>
          <li><strong>All Rights Reserved:</strong> Maximum protection - nobody can use without permission</li>
          <li><strong>CC BY-NC-SA:</strong> Great for community sharing, blocks commercial resale</li>
          <li><strong>CC BY-NC:</strong> Non-commercial use only, watch for derivatives</li>
        </ul>
        <p className="tip">
          💭 Unsure? Start with "All Rights Reserved" - you can always change it later!
        </p>
      </div>
    </div>
  );
}

function LicenseCard({ license, selected, recommended, reason, onSelect, showDetails }) {
  return (
    <div
      className={`license-card ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`}
      onClick={onSelect}
    >
      <div className="license-card-header">
        <span className="license-icon">{license.icon}</span>
        <h5>{license.name}</h5>
        {recommended && <span className="recommended-badge">⭐ Recommended</span>}
      </div>

      <p className="license-description">{license.description}</p>

      {reason && (
        <div className="recommendation-reason">
          <strong>Why?</strong> {reason}
        </div>
      )}

      {showDetails && (
        <div className="license-details">
          <h6>Permissions:</h6>
          <ul className="permissions-list">
            <li className={license.allowCommercial ? 'allowed' : 'restricted'}>
              {license.allowCommercial ? '✅' : '❌'} Commercial Use
            </li>
            <li className={license.allowModification ? 'allowed' : 'restricted'}>
              {license.allowModification ? '✅' : '❌'} Modifications
            </li>
            <li className={license.requireAttribution ? 'required' : 'optional'}>
              {license.requireAttribution ? '⚠️ Required' : '✅'} Attribution
            </li>
            {license.requireShareAlike && (
              <li className="required">
                ⚠️ ShareAlike (derivatives must use same license)
              </li>
            )}
          </ul>
          {license.url && (
            <a
              href={license.url}
              target="_blank"
              rel="noopener noreferrer"
              className="learn-more-link"
              onClick={(e) => e.stopPropagation()}
            >
              Learn More →
            </a>
          )}
        </div>
      )}

      {selected && (
        <div className="selected-indicator">
          ✓ Selected
        </div>
      )}
    </div>
  );
}

/**
 * Copyright Notice Display Component
 */
export function CopyrightNotice({ content, showFull = false }) {
  if (!content.copyright) return null;

  const { notice, fullNotice, licenseInfo } = content.copyright;

  return (
    <div className="copyright-notice">
      <div className="copyright-short">
        <span className="copyright-icon">{licenseInfo.icon}</span>
        <span className="copyright-text">{notice}</span>
        {licenseInfo.url && (
          <a
            href={licenseInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="license-link"
            title={licenseInfo.name}
          >
            <InfoIcon />
          </a>
        )}
      </div>

      {showFull && (
        <div className="copyright-full">
          <p>{fullNotice}</p>
          <div className="license-badge">
            <span className="badge-icon">{licenseInfo.icon}</span>
            <span className="badge-name">{licenseInfo.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DMCA Report Button Component
 */
export function DMCAReportButton({ contentId, contentType, contentUrl }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        className="dmca-report-button"
        onClick={() => setShowForm(true)}
        title="Report copyright violation"
      >
        🚨 Report Copyright Violation
      </button>

      {showForm && (
        <DMCANoticeModal
          contentId={contentId}
          contentType={contentType}
          contentUrl={contentUrl}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}

const SUBMIT_DMCA_TAKEDOWN = gql`
  mutation SubmitDMCATakedown($input: DMCATakedownInput!) {
    submitDMCATakedown(input: $input) {
      noticeId
      status
    }
  }
`;

function DMCANoticeModal({ contentId, contentType, contentUrl, onClose }) {
  const [formData, setFormData] = useState({
    complainantName: '',
    complainantAddress: '',
    complainantPhone: '',
    complainantEmail: '',
    isRightsHolder: true,
    copyrightedWorkDescription: '',
    copyrightedWorkUrl: '',
    contentDescription: '',
    goodFaithStatement: false,
    accuracyStatement: false,
    penaltyOfPerjuryStatement: false,
    signatureName: ''
  });

  const [submitTakedown, { loading, error }] = useMutation(SUBMIT_DMCA_TAKEDOWN);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.goodFaithStatement || !formData.accuracyStatement || !formData.penaltyOfPerjuryStatement) {
      alert('You must agree to all required statements');
      return;
    }

    try {
      const result = await submitTakedown({
        variables: {
          input: {
            ...formData,
            contentId,
            contentType,
            contentUrl,
            uploaderUserId: 'unknown', // Should be fetched from content
            uploaderUsername: 'unknown',
            uploaderEmail: 'unknown'
          }
        }
      });

      alert(`DMCA notice submitted successfully. Notice ID: ${result.data.submitDMCATakedown.noticeId}`);
      onClose();
    } catch (err) {
      console.error('Error submitting DMCA notice:', err);
    }
  };

  return (
    <div className="dmca-modal-overlay" onClick={onClose}>
      <div className="dmca-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dmca-modal-header">
          <h2>File DMCA Takedown Notice</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="dmca-modal-body">
          <div className="warning-box">
            <h3>⚠️ Important Legal Notice</h3>
            <p>
              Filing a DMCA notice is a legal action. Making false claims can result in
              legal liability. Only file if you genuinely believe your copyright has been
              infringed.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <section>
              <h3>1. Your Information</h3>
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.complainantName}
                onChange={(e) => setFormData({...formData, complainantName: e.target.value})}
                required
              />
              <textarea
                placeholder="Physical Address (required by law) *"
                value={formData.complainantAddress}
                onChange={(e) => setFormData({...formData, complainantAddress: e.target.value})}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.complainantPhone}
                onChange={(e) => setFormData({...formData, complainantPhone: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={formData.complainantEmail}
                onChange={(e) => setFormData({...formData, complainantEmail: e.target.value})}
                required
              />
              <label>
                <input
                  type="checkbox"
                  checked={formData.isRightsHolder}
                  onChange={(e) => setFormData({...formData, isRightsHolder: e.target.checked})}
                />
                I am the copyright owner (or authorized to act on their behalf)
              </label>
            </section>

            <section>
              <h3>2. Your Original Work</h3>
              <textarea
                placeholder="Describe your copyrighted work *"
                value={formData.copyrightedWorkDescription}
                onChange={(e) => setFormData({...formData, copyrightedWorkDescription: e.target.value})}
                required
              />
              <input
                type="url"
                placeholder="URL to your original work (if applicable)"
                value={formData.copyrightedWorkUrl}
                onChange={(e) => setFormData({...formData, copyrightedWorkUrl: e.target.value})}
              />
            </section>

            <section>
              <h3>3. Infringing Content</h3>
              <p><strong>Content URL:</strong> {contentUrl}</p>
              <textarea
                placeholder="Explain how this content infringes your copyright *"
                value={formData.contentDescription}
                onChange={(e) => setFormData({...formData, contentDescription: e.target.value})}
                required
              />
            </section>

            <section>
              <h3>4. Legal Statements (Required)</h3>
              <label className="statement-checkbox">
                <input
                  type="checkbox"
                  checked={formData.goodFaithStatement}
                  onChange={(e) => setFormData({...formData, goodFaithStatement: e.target.checked})}
                  required
                />
                I have a good faith belief that use of the material is not authorized by the
                copyright owner, its agent, or the law.
              </label>
              <label className="statement-checkbox">
                <input
                  type="checkbox"
                  checked={formData.accuracyStatement}
                  onChange={(e) => setFormData({...formData, accuracyStatement: e.target.checked})}
                  required
                />
                The information in this notification is accurate.
              </label>
              <label className="statement-checkbox">
                <input
                  type="checkbox"
                  checked={formData.penaltyOfPerjuryStatement}
                  onChange={(e) => setFormData({...formData, penaltyOfPerjuryStatement: e.target.checked})}
                  required
                />
                Under penalty of perjury, I am authorized to act on behalf of the copyright owner.
              </label>
            </section>

            <section>
              <h3>5. Electronic Signature</h3>
              <input
                type="text"
                placeholder="Type your full name as signature *"
                value={formData.signatureName}
                onChange={(e) => setFormData({...formData, signatureName: e.target.value})}
                required
              />
              <p className="signature-note">
                By typing your name, you are providing an electronic signature with the same
                legal effect as a handwritten signature.
              </p>
            </section>

            {error && (
              <div className="error-box">
                Error: {error.message}
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Submitting...' : 'Submit DMCA Notice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none"/>
      <text x="8" y="12" textAnchor="middle" fontSize="10" fontWeight="bold">i</text>
    </svg>
  );
}

// CSS Styles (add to your stylesheet)
const styles = `
.license-selector {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.license-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.license-card {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.license-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.license-card.selected {
  border-color: #4CAF50;
  background: #f0f8f0;
}

.license-card.recommended {
  border-color: #FF9800;
}

.recommended-badge {
  background: #FF9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.copyright-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9rem;
}

.dmca-report-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.dmca-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dmca-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
}

.dmca-modal-body {
  padding: 2rem;
}

.dmca-modal-body section {
  margin-bottom: 2rem;
}

.dmca-modal-body input,
.dmca-modal-body textarea {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.statement-checkbox {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #fff3cd;
  border-radius: 4px;
  margin: 0.5rem 0;
  cursor: pointer;
}

.warning-box {
  background: #fff3cd;
  border: 2px solid #ffecb3;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #ddd;
}

.submit-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.cancel-button {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}
`;

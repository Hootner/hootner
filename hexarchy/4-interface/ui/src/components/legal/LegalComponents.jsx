/**
 * Shared Legal Components: LicenseSelector, CopyrightNotice, DMCAReportButton
 * Copied from app to shared UI library for reuse.
 */
import React, { useState } from 'react';
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
	mode = 'default'
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
				await setCreatorLicense({ variables: { userId, licenseType } });
			} else {
				const result = await updateContentLicense({ variables: { contentId, contentType, licenseType } });
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
				<button className="help-button" onClick={() => setShowDetails(!showDetails)}>
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
				<p className="tip">💭 Unsure? Start with "All Rights Reserved" - you can always change it later!</p>
			</div>
		</div>
	);
}

function LicenseCard({ license, selected, recommended, reason, onSelect, showDetails }) {
	return (
		<div className={`license-card ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`} onClick={onSelect}>
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
							<li className="required">⚠️ ShareAlike (derivatives must use same license)</li>
						)}
					</ul>
					{license.url && (
						<a href={license.url} target="_blank" rel="noopener noreferrer" className="learn-more-link" onClick={(e) => e.stopPropagation()}>
							Learn More →
						</a>
					)}
				</div>
			)}

			{selected && <div className="selected-indicator">✓ Selected</div>}
		</div>
	);
}

export function CopyrightNotice({ content, showFull = false }) {
	if (!content.copyright) return null;

	const { notice, fullNotice, licenseInfo } = content.copyright;

	return (
		<div className="copyright-notice">
			<div className="copyright-short">
				<span className="copyright-icon">{licenseInfo.icon}</span>
				<span className="copyright-text">{notice}</span>
				{licenseInfo.url && (
					<a href={licenseInfo.url} target="_blank" rel="noopener noreferrer" className="license-link" title={licenseInfo.name}>
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

export function DMCAReportButton({ contentId, contentType, contentUrl }) {
	const [showForm, setShowForm] = useState(false);

	return (
		<>
			<button className="dmca-report-button" onClick={() => setShowForm(true)} title="Report copyright violation">
				🚨 Report Copyright Violation
			</button>

			{showForm && (
				<DMCANoticeModal contentId={contentId} contentType={contentType} contentUrl={contentUrl} onClose={() => setShowForm(false)} />
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
						uploaderUserId: 'unknown',
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
							<input type="text" placeholder="Full Name *" value={formData.complainantName} onChange={(e) => setFormData({...formData, complainantName: e.target.value})} required />
							<textarea placeholder="Physical Address (required by law) *" value={formData.complainantAddress} onChange={(e) => setFormData({...formData, complainantAddress: e.target.value})} required />
							<input type="tel" placeholder="Phone Number" value={formData.complainantPhone} onChange={(e) => setFormData({...formData, complainantPhone: e.target.value})} />
							<input type="email" placeholder="Email Address *" value={formData.complainantEmail} onChange={(e) => setFormData({...formData, complainantEmail: e.target.value})} required />
						</section>

						<section>
							<h3>2. Copyrighted Work</h3>
							<textarea placeholder="Describe the copyrighted work *" value={formData.copyrightedWorkDescription} onChange={(e) => setFormData({...formData, copyrightedWorkDescription: e.target.value})} required />
							<input type="url" placeholder="URL (if applicable)" value={formData.copyrightedWorkUrl} onChange={(e) => setFormData({...formData, copyrightedWorkUrl: e.target.value})} />
						</section>

						<section>
							<h3>3. Reported Content</h3>
							<textarea placeholder="Describe the infringing content *" value={formData.contentDescription} onChange={(e) => setFormData({...formData, contentDescription: e.target.value})} required />
						</section>

						<section>
							<h3>4. Legal Statements</h3>
							<label><input type="checkbox" checked={formData.goodFaithStatement} onChange={(e) => setFormData({...formData, goodFaithStatement: e.target.checked})} /> I have a good faith belief that the use is not authorized.</label>
							<label><input type="checkbox" checked={formData.accuracyStatement} onChange={(e) => setFormData({...formData, accuracyStatement: e.target.checked})} /> The information is accurate to the best of my knowledge.</label>
							<label><input type="checkbox" checked={formData.penaltyOfPerjuryStatement} onChange={(e) => setFormData({...formData, penaltyOfPerjuryStatement: e.target.checked})} /> I swear under penalty of perjury the above is true.</label>
							<input type="text" placeholder="Signature (Full Name) *" value={formData.signatureName} onChange={(e) => setFormData({...formData, signatureName: e.target.value})} required />
						</section>

						<div className="dmca-modal-actions">
							<button type="submit" className="submit-button" disabled={loading}>{loading ? 'Submitting...' : 'Submit Notice'}</button>
							<button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
						</div>
						{error && <div className="error-text">Submission failed. Please try again.</div>}
					</form>
				</div>
			</div>
		</div>
	);
}

function InfoIcon() {
	return (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-14a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-2 10h4v-8h-4v8z" />
		</svg>
	);
}

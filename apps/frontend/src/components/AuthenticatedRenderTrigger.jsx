import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';

/**
 * 🎬 HOOTNER Authenticated Render Trigger Component
 * Users must login before triggering GPU render jobs
 */
const AuthenticatedRenderTrigger = () => {
    const [user, setUser] = useState(null);
    const [renderJobs, setRenderJobs] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if user is already authenticated
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const currentUser = await Auth.currentAuthenticatedUser();
            setUser(currentUser);
            loadUserRenderJobs(currentUser);
        } catch (error) {
            // User not authenticated
            setUser(null);
        }
    };

    const handleLogin = async () => {
        try {
            // Redirect to Cognito hosted UI or use custom login
            await Auth.federatedSignIn();
        } catch (error) {
            setMessage('Login failed: ' + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await Auth.signOut();
            setUser(null);
            setRenderJobs([]);
            setMessage('Logged out successfully');
        } catch (error) {
            setMessage('Logout failed: ' + error.message);
        }
    };

    const triggerRenderJob = async () => {
        if (!user) {
            setMessage('Please log in to trigger render jobs');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            // Get user's access token
            const session = await Auth.currentSession();
            const accessToken = session.getAccessToken().getJwtToken();

            // Call authenticated Lambda function
            const response = await fetch('/api/render/trigger', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompts: 'High-quality 3D render with Octane lighting',
                    priority: 'normal',
                    resolution: '12K_HDR'
                })
            });

            const result = await response.json();

            if (result.success) {
                setMessage(`✅ Render job started! Job ID: ${result.jobId}`);

                // Add to user's job list
                setRenderJobs(prev => [
                    {
                        id: result.jobId,
                        name: result.jobName,
                        status: 'SUBMITTED',
                        timestamp: result.timestamp
                    },
                    ...prev
                ]);
            } else if (result.loginRequired) {
                setMessage('❌ Authentication expired. Please log in again.');
                setUser(null);
            } else {
                setMessage(`❌ Error: ${result.message}`);
            }

        } catch (error) {
            setMessage(`❌ Failed to trigger render job: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadUserRenderJobs = async (currentUser) => {
        try {
            const session = await Auth.currentSession();
            const accessToken = session.getAccessToken().getJwtToken();

            const response = await fetch('/api/render/jobs', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setRenderJobs(result.jobs || []);
            }
        } catch (error) {
            console.error('Failed to load render jobs:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCEEDED': return 'text-green-600';
            case 'FAILED': return 'text-red-600';
            case 'RUNNING': return 'text-blue-600';
            case 'PENDING': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusEmoji = (status) => {
        switch (status) {
            case 'SUCCEEDED': return '✅';
            case 'FAILED': return '❌';
            case 'RUNNING': return '🔄';
            case 'PENDING': return '⏳';
            case 'SUBMITTED': return '📝';
            default: return '❓';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-center mb-6">
                    🎬 HOOTNER GPU Render Studio
                </h1>

                {/* Authentication Status */}
                <div className="mb-6 p-4 rounded-lg bg-gray-50">
                    {user ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-green-600">
                                    ✅ Authenticated
                                </h2>
                                <p className="text-gray-600">
                                    Welcome, {user.attributes?.email || user.username}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-red-600 mb-2">
                                🔐 Authentication Required
                            </h2>
                            <p className="text-gray-600 mb-4">
                                You must log in to access GPU render jobs
                            </p>
                            <button
                                onClick={handleLogin}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Login to HOOTNER
                            </button>
                        </div>
                    )}
                </div>

                {/* Render Job Trigger */}
                {user && (
                    <div className="mb-6 p-4 rounded-lg bg-blue-50">
                        <h3 className="text-xl font-semibold mb-4">🚀 Start New Render Job</h3>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={triggerRenderJob}
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </span>
                                ) : (
                                    '🎬 Trigger GPU Render Job'
                                )}
                            </button>

                            <div className="text-sm text-gray-600">
                                <p>• 12K UHD HDR10 @ 120fps</p>
                                <p>• Octane path tracing</p>
                                <p>• AWS g5.xlarge GPU instance</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Messages */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                        {message}
                    </div>
                )}

                {/* User's Render Jobs */}
                {user && renderJobs.length > 0 && (
                    <div className="p-4 rounded-lg bg-gray-50">
                        <h3 className="text-xl font-semibold mb-4">📊 Your Render Jobs</h3>

                        <div className="space-y-3">
                            {renderJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center justify-between p-3 bg-white rounded border"
                                >
                                    <div>
                                        <div className="font-medium">
                                            {getStatusEmoji(job.status)} {job.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            ID: {job.id?.substring(0, 8)}...
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`font-semibold ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(job.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Notice */}
                <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">🔐 Security Features</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• JWT token authentication required for all render jobs</li>
                        <li>• Users can only see and manage their own render jobs</li>
                        <li>• GPU instances are isolated per user session</li>
                        <li>• Render output is stored securely in user-specific S3 paths</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AuthenticatedRenderTrigger;

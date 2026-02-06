import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import PasswordReset from './PasswordReset';

/**
 * 📧 Simple Email-Based Login for HOOTNER
 * Users log in with EMAIL ADDRESS (not mailing address!)
 */
const SimpleLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [needsVerification, setNeedsVerification] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const user = await Auth.signIn(email, password);
            console.log('✅ Login successful:', user);

            setMessage('✅ Login successful! You can now start render jobs.');

            // Redirect to main app or trigger render interface
            // window.location.href = '/dashboard';

        } catch (error) {
            console.error('❌ Login failed:', error);

            if (error.code === 'UserNotConfirmedException') {
                setMessage('⚠️ Please verify your email first. Check your inbox for verification link.');
                setNeedsVerification(true);
            } else if (error.code === 'NotAuthorizedException') {
                setMessage('❌ Invalid email or password. Please try again.');
            } else {
                setMessage(`❌ Login error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const result = await Auth.signUp({
                username: email, // Cognito uses email as username
                password: password,
                attributes: {
                    email: email,
                    name: email.split('@')[0] // Use part before @ as display name
                }
            });

            console.log('✅ Sign up successful:', result);

            setMessage('✅ Account created! Check your email for verification link.');
            setNeedsVerification(true);
            setIsSignUp(false);

        } catch (error) {
            console.error('❌ Sign up failed:', error);

            if (error.code === 'UsernameExistsException') {
                setMessage('⚠️ Account already exists. Try logging in instead.');
                setIsSignUp(false);
            } else if (error.code === 'InvalidPasswordException') {
                setMessage('❌ Password too weak. Must have 8+ chars, uppercase, lowercase, number, and symbol.');
            } else {
                setMessage(`❌ Sign up error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await Auth.confirmSignUp(email, verificationCode);
            setMessage('✅ Email verified! You can now log in.');
            setNeedsVerification(false);
            setVerificationCode('');
        } catch (error) {
            setMessage(`❌ Verification failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerification = async () => {
        try {
            await Auth.resendSignUp(email);
            setMessage('📧 Verification email sent! Check your inbox.');
        } catch (error) {
            setMessage(`❌ Failed to resend: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {/* Show Password Reset Component */}
            {showPasswordReset ? (
                <PasswordReset onBack={() => setShowPasswordReset(false)} />
            ) : (
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-600">🎬 HOOTNER</h1>
                        <p className="text-gray-600 mt-2">GPU Rendering Platform</p>
                    </div>

                    {/* Verification Form */}
                    {needsVerification && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">📧 Email Verification Required</h3>
                        <p className="text-sm text-yellow-700 mb-4">
                            Check your email at <strong>{email}</strong> for verification code
                        </p>

                        <form onSubmit={handleVerification}>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                                required
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resendVerification}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Resend
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Main Login/Signup Form */}
                {!needsVerification && (
                    <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                        <h2 className="text-2xl font-semibold mb-4 text-center">
                            {isSignUp ? '📧 Create Account' : '🔐 Login'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📧 Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Your email will be your username
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🔑 Password
                                </label>
                                <input
                                    type="password"
                                    placeholder={isSignUp ? "Min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol" : "Enter your password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {isSignUp && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must have 8+ characters, uppercase, lowercase, number, and symbol
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {isSignUp ? 'Creating Account...' : 'Logging In...'}
                                </span>
                            ) : (
                                isSignUp ? '📧 Create Account' : '🔐 Login'
                            )}
                        </button>

                        <div className="text-center mt-4 space-y-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setMessage('');
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm block"
                            >
                                {isSignUp
                                    ? 'Already have an account? Login'
                                    : "Don't have an account? Sign up"
                                }
                            </button>

                            {/* Forgot Password Link - Only show on login form */}
                            {!isSignUp && (
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordReset(true)}
                                    className="text-gray-600 hover:text-gray-700 text-sm block"
                                >
                                    🔓 Forgot your password?
                                </button>
                            )}
                        </div>
                    </form>
                )}

                {/* Status Messages */}
                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                        message.includes('✅')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : message.includes('⚠️')
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message}
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">ℹ️ About HOOTNER Login</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Use your EMAIL ADDRESS as username</li>
                        <li>• Check email for verification after signup</li>
                        <li>• Once logged in, trigger GPU render jobs</li>
                        <li>• Secure AWS Cognito authentication</li>
                        <li>• 🔓 <strong>Forgot password? No problem!</strong> - Reset via email</li>
                    </ul>
                </div>
                </div>
            )}
        </div>
    );
};

export default SimpleLogin;

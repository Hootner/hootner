import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

/**
 * 🔓 Password Reset Component for HOOTNER
 * Handles forgot password flow with AWS Cognito
 */
const PasswordReset = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState('request'); // 'request' | 'reset'
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await Auth.forgotPassword(email);
            setMessage('✅ Password reset code sent! Check your email.');
            setStep('reset');
        } catch (error) {
            console.error('❌ Password reset request failed:', error);

            if (error.code === 'UserNotFoundException') {
                setMessage('❌ No account found with that email address.');
            } else if (error.code === 'InvalidParameterException') {
                setMessage('❌ Please enter a valid email address.');
            } else if (error.code === 'LimitExceededException') {
                setMessage('⚠️ Too many attempts. Please wait before trying again.');
            } else {
                setMessage(`❌ Error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            setMessage('❌ Passwords do not match.');
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (!isPasswordValid(newPassword)) {
            setMessage('❌ Password must have 8+ characters, uppercase, lowercase, number, and symbol.');
            setIsLoading(false);
            return;
        }

        try {
            await Auth.forgotPasswordSubmit(email, resetCode, newPassword);
            setMessage('✅ Password reset successful! You can now log in with your new password.');

            // Auto redirect to login after success
            setTimeout(() => {
                onBack();
            }, 2000);

        } catch (error) {
            console.error('❌ Password reset failed:', error);

            if (error.code === 'CodeMismatchException') {
                setMessage('❌ Invalid reset code. Please check your email and try again.');
            } else if (error.code === 'ExpiredCodeException') {
                setMessage('❌ Reset code has expired. Please request a new one.');
                setStep('request');
            } else if (error.code === 'InvalidPasswordException') {
                setMessage('❌ Password does not meet security requirements.');
            } else {
                setMessage(`❌ Error: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isPasswordValid = (password) => {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= 8 && hasUpper && hasLower && hasNumber && hasSymbol;
    };

    const resendResetCode = async () => {
        setIsLoading(true);
        try {
            await Auth.forgotPassword(email);
            setMessage('📧 New reset code sent! Check your email.');
        } catch (error) {
            setMessage(`❌ Failed to resend: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600">🔓 Reset Password</h1>
                <p className="text-gray-600 mt-2">Forgot your HOOTNER password?</p>
            </div>

            {step === 'request' && (
                <form onSubmit={handleRequestReset}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        📧 Enter Your Email
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
                                We'll send a reset code to this email
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors mt-6"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sending Reset Code...
                            </span>
                        ) : (
                            '📧 Send Reset Code'
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={handlePasswordReset}>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                        🔑 Set New Password
                    </h2>

                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                            📧 Reset code sent to: <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                🔢 Reset Code
                            </label>
                            <input
                                type="text"
                                placeholder="Enter 6-digit code from email"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                🔑 New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ✅ Confirm New Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter password again"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors mt-6"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Resetting Password...
                            </span>
                        ) : (
                            '🔐 Reset Password'
                        )}
                    </button>

                    <div className="flex justify-center gap-4 mt-4 text-sm">
                        <button
                            type="button"
                            onClick={resendResetCode}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            📧 Resend Code
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('request')}
                            className="text-gray-600 hover:text-gray-700"
                        >
                            ← Change Email
                        </button>
                    </div>
                </form>
            )}

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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">🔐 Password Reset Process</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>1. Enter your email address</li>
                    <li>2. Check email for 6-digit reset code</li>
                    <li>3. Enter code and new password</li>
                    <li>4. Login with your new password</li>
                </ul>
            </div>
        </div>
    );
};

export default PasswordReset;

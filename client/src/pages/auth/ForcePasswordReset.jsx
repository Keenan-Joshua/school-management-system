import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function ForcePasswordReset() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/reset-password', { new_password: newPassword });

            // Update the locally stored user so the redirect guard no longer triggers
            const user = JSON.parse(localStorage.getItem('user'));
            user.force_password_reset = false;
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            <img
                src="/background.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover -z-10 blur scale-100"
            />
            <div className="absolute inset-0 bg-black/50 -z-10" />
            <div className="min-h-screen flex items-center justify-center">
                <div className="relative z-10 w-full max-w-md px-4">
                    <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                            Set a New Password
                        </h1>
                        <p className="text-center text-gray-700 mb-6">
                            Your account was created by an administrator. Please set your own password to continue.
                        </p>

                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Set Password & Continue'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForcePasswordReset;
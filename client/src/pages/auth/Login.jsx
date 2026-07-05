import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            if (res.data.user.force_password_reset) {
                navigate('/force-password-reset');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="relative z-10 w-full max-w-md px-4">
                    <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                            Zawadi School SMS
                        </h1>
                        <p className="text-center text-gray-700 mb-6">Sign in to your account</p>

                        {error && (
                            <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="you@school.com"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-2 rounded font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-gray-700 mt-4">
                            Setting up the system for the first time?{' '}
                            <a href="/register" className="text-emerald-600 hover:underline">Register here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
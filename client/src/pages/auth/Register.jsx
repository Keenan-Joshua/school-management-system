import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

function Register() {
    const navigate = useNavigate();
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [setupComplete, setSetupComplete] = useState(false);
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/auth/setup-status')
            .then(res => setSetupComplete(res.data.setupComplete))
            .catch(() => setSetupComplete(false))
            .finally(() => setCheckingStatus(false));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
    }

    if (setupComplete) {
        return (
            <div className="relative min-h-screen">
                <img
                    src="/background.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover -z-10 blur scale-100"
                />
                <div className="absolute inset-0 bg-black/50 -z-10" />
                <div className="min-h-screen  flex items-center justify-center">
                    <div className="relative z-10 w-full max-w-md px-4">
                        <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">Registration Closed</h1>
                            <p className="text-gray-700 mb-6">
                                An administrator account already exists. Please contact your school administrator to get an account created for you.
                            </p>
                            <Link to="/login" className="text-emerald-600 hover:underline text-sm">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <img
                src="/background.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover -z-10"
            />
            <div className="absolute inset-0 bg-black/30 -z-10" />
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        Initial Setup
                    </h1>
                    <p className="text-center text-gray-500 mb-6">
                        Create the first administrator account to get started
                    </p>

                    {error && (
                        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
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
                            {loading ? 'Creating account...' : 'Create Administrator Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-600 hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;